import { test } from "node:test";
import assert from "node:assert/strict";
import { ActiveClock, formatTime, parseSnapshot } from "../src/lib/attempt.ts";
import { ALL_WORDS, GRID, GRID_SIZE, WORD_PATHS, FLAT_LETTERS, buildPath } from "../src/data/puzzle.ts";
test("active time excludes pauses and repeated stop events", () => {
  let now = 0;
  const clock = new ActiveClock(() => now);
  now = 60000; assert.equal(clock.seconds(), 0);
  clock.setRunning(true); now += 42500; assert.equal(clock.seconds(), 42);
  clock.setRunning(false); now += 500000; clock.setRunning(false); assert.equal(clock.seconds(), 42);
  clock.setRunning(true); now += 17500; assert.equal(clock.seconds(), 60);
  assert.equal(formatTime(clock.seconds()), "1:00");
});
test("every word has a selectable path in both directions", () => {
  assert.equal(new Set(ALL_WORDS).size, 30);
  assert.equal(GRID.length, GRID_SIZE);
  GRID.forEach(row => assert.equal(row.length, GRID_SIZE));
  for (const word of ALL_WORDS) {
    assert.ok(WORD_PATHS[word].length > 0, word);
    for (const path of WORD_PATHS[word]) {
      assert.equal(path.map(i => FLAT_LETTERS[i]).join(""), word);
      assert.deepEqual(buildPath(path[0], path.at(-1)!), path);
      assert.deepEqual(buildPath(path.at(-1)!, path[0]), [...path].reverse());
    }
  }
});

test("saved in-progress snapshots restore only when compatible and valid", () => {
  const snapshot = {
    attemptId: "11111111-1111-4111-8111-111111111111",
    words: ["BEACH"],
    activeSeconds: 92,
    hints: 1,
    status: "in_progress",
    puzzleVersion: "word-search-v1",
    foundPaths: { BEACH: WORD_PATHS.BEACH[0] },
    selection: [0],
  };
  assert.deepEqual(parseSnapshot(snapshot), snapshot);
  assert.equal(parseSnapshot({ ...snapshot, puzzleVersion: "old-puzzle" }), null);
  assert.equal(parseSnapshot({ ...snapshot, selection: [999] }), null);
  assert.equal(parseSnapshot({ ...snapshot, status: "completed" }), null);
  const resumedClock = new ActiveClock(() => 0, snapshot.activeSeconds);
  assert.equal(resumedClock.seconds(), 92);
});

import { createHash } from "node:crypto";
import {
  MAX_HINTS, createAttemptId, findPaths, isGeneratedAttemptId, layoutForAttempt, pathSpells, validateLayout,
} from "../src/data/layout.ts";

test("new attempts get UUIDv8 ids that carry the board generator version", () => {
  const id = createAttemptId();
  assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-8001-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.ok(isGeneratedAttemptId(id));
  assert.ok(!isGeneratedAttemptId("11111111-1111-4111-8111-111111111111"));
  assert.ok(!isGeneratedAttemptId("11111111-1111-8002-8111-111111111111"));
  assert.ok(!isGeneratedAttemptId(null));
  assert.notEqual(createAttemptId(), createAttemptId());
  // The portal and the database accept the id like any other attempt id.
  const snapshot = { attemptId: id, words: [], activeSeconds: 0, hints: 0, status: "in_progress", puzzleVersion: "word-search-v1", foundPaths: {}, selection: [] };
  assert.deepEqual(parseSnapshot(snapshot), snapshot);
});

test("every generated board is valid: all 30 words, exactly once, stored paths match the letters", () => {
  const boards = new Set<string>();
  const directions = new Set<string>();
  for (let index = 0; index < 400; index += 1) {
    const layout = layoutForAttempt(createAttemptId());
    assert.equal(layout.legacy, false);
    assert.equal(layout.letters.length, GRID_SIZE * GRID_SIZE);
    assert.ok(validateLayout(layout.letters, layout.paths));
    for (const word of ALL_WORDS) {
      const path = layout.paths[word];
      assert.equal(path.map(cell => layout.letters[cell]).join(""), word);
      assert.equal(findPaths(layout.letters, word).length, 1, word);
      // Drag and tap-first/tap-last both build selections with buildPath.
      assert.deepEqual(buildPath(path[0], path.at(-1)!), path);
      assert.deepEqual(buildPath(path.at(-1)!, path[0]), [...path].reverse());
      directions.add(`${Math.sign(Math.floor(path[1] / GRID_SIZE) - Math.floor(path[0] / GRID_SIZE))},${Math.sign((path[1] % GRID_SIZE) - (path[0] % GRID_SIZE))}`);
    }
    boards.add(layout.letters.join(""));
  }
  assert.equal(boards.size, 400, "different attempts get different boards");
  assert.equal(directions.size, 8, "across, down and diagonal, forwards and backwards");
});

test("the same attempt id always rebuilds exactly the same board (golden)", () => {
  const id = "0f3c2a91-5b7d-8001-a4e2-9c6d1b0e7f52";
  const layout = layoutForAttempt(id);
  // Changing this output would move the words on learners' unfinished saved games.
  assert.equal(createHash("sha256").update(layout.letters.join("")).digest("hex"), "1ba769adae7e86276fee06a6b6b5b7fe0e9efe5e26ffa515c9ed87757fd6ee46");
  assert.deepEqual(layout.paths.BEACH, [91, 69, 47, 25, 3]);
  assert.deepEqual(layoutForAttempt(id.toUpperCase()).letters, layout.letters);
  assert.ok(pathSpells(layout.letters, layout.paths.BEACH, "BEACH"));
  assert.ok(!pathSpells(layout.letters, layout.paths.BEACH, "TRAIN"));
});

test("attempts saved before randomisation keep the original board", () => {
  const layout = layoutForAttempt("11111111-1111-4111-8111-111111111111");
  assert.equal(layout.legacy, true);
  assert.deepEqual(layout.letters, FLAT_LETTERS);
  for (const word of ALL_WORDS) assert.ok(pathSpells(layout.letters, layout.paths[word], word));
  assert.ok(pathSpells(layout.letters, WORD_PATHS.BEACH[0], "BEACH"));
});

test("each attempt allows five hints", () => {
  assert.equal(MAX_HINTS, 5);
});
