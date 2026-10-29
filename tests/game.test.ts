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
