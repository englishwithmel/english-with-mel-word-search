import { test } from "node:test";
import assert from "node:assert/strict";
import { ActiveClock, formatTime } from "../src/lib/attempt.ts";
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
