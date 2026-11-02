import { ALL_WORDS, FLAT_LETTERS, GRID_SIZE, WORD_PATHS } from "./puzzle.ts";

/**
 * Randomised boards.
 *
 * Every board is a pure function of its attempt id, so the attempt id that is
 * already saved with each attempt (Supabase row, portal localStorage copy and
 * the postMessage snapshot) is the persisted board: refresh, remount and
 * restore always rebuild exactly the same letters.
 *
 * Generated attempt ids are RFC 9562 UUIDv8 values whose third group is
 * `8` + a three-digit generator version, e.g. `xxxxxxxx-xxxx-8001-yxxx-…`.
 * Any other id (the UUIDv4 attempts saved before randomisation) keeps the
 * original fixed board, so unfinished older attempts still restore correctly.
 *
 * Never change the output of generator version 1: the golden test in
 * tests/game.test.ts pins it. A new algorithm needs a new version number.
 */
export const MAX_HINTS = 5;
export const LAYOUT_VERSION = 1;
const CELL_COUNT = GRID_SIZE * GRID_SIZE;
const GENERATED_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-8([0-9a-f]{3})-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type Layout = {
  attemptId: string;
  letters: string[];
  /** The single location of each of the 30 words on this board. */
  paths: Record<string, number[]>;
  legacy: boolean;
};

/** Directions the board supports: across, down and both diagonals, forwards and backwards. */
const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1],
];
// Mostly forwards (like the original board), with some backwards words. Sums to 100.
const PLACEMENT_WEIGHTS = [
  { step: [0, 1], weight: 40 },
  { step: [1, 0], weight: 25 },
  { step: [1, 1], weight: 15 },
  { step: [-1, 1], weight: 5 },
  { step: [0, -1], weight: 5 },
  { step: [-1, 0], weight: 4 },
  { step: [-1, -1], weight: 3 },
  { step: [1, -1], weight: 3 },
] as const;
const FILLER = ALL_WORDS.join("");

export function isGeneratedAttemptId(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = GENERATED_ID.exec(value);
  return Boolean(match && parseInt(match[1], 16) === LAYOUT_VERSION);
}

export function createAttemptId(fill: (bytes: Uint8Array) => Uint8Array = (bytes) => crypto.getRandomValues(bytes)): string {
  const bytes = fill(new Uint8Array(16));
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const variant = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  const version = LAYOUT_VERSION.toString(16).padStart(3, "0");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${version}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

/** Every occurrence of a word on a board, in any of the eight directions. */
export function findPaths(letters: readonly string[], word: string): number[][] {
  const paths: number[][] = [];
  for (let start = 0; start < CELL_COUNT; start += 1) {
    if (letters[start] !== word[0]) continue;
    const row = Math.floor(start / GRID_SIZE);
    const col = start % GRID_SIZE;
    for (const [rowStep, colStep] of DIRECTIONS) {
      const endRow = row + rowStep * (word.length - 1);
      const endCol = col + colStep * (word.length - 1);
      if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue;
      const path: number[] = [];
      for (let index = 0; index < word.length; index += 1) {
        const cell = (row + rowStep * index) * GRID_SIZE + col + colStep * index;
        if (letters[cell] !== word[index]) break;
        path.push(cell);
      }
      if (path.length === word.length) paths.push(path);
    }
  }
  return paths;
}

/** True when the path is a straight line on the board that spells the word. */
export function pathSpells(letters: readonly string[], path: readonly number[], word: string): boolean {
  if (!Array.isArray(path) || path.length !== word.length || path.some((cell) => !Number.isInteger(cell) || cell < 0 || cell >= CELL_COUNT)) return false;
  if (path.map((cell) => letters[cell]).join("") !== word) return false;
  if (path.length === 1) return true;
  const rowStep = Math.floor(path[1] / GRID_SIZE) - Math.floor(path[0] / GRID_SIZE);
  const colStep = (path[1] % GRID_SIZE) - (path[0] % GRID_SIZE);
  if (Math.abs(rowStep) > 1 || Math.abs(colStep) > 1) return false;
  return path.every((cell, index) =>
    Math.floor(cell / GRID_SIZE) === Math.floor(path[0] / GRID_SIZE) + rowStep * index
    && cell % GRID_SIZE === (path[0] % GRID_SIZE) + colStep * index);
}

/** A generated board is shown only if all 30 words appear exactly once at their stored paths. */
export function validateLayout(letters: readonly string[], paths: Record<string, number[]>): boolean {
  if (letters.length !== CELL_COUNT || letters.some((letter) => !/^[A-Z]$/.test(letter))) return false;
  return ALL_WORDS.every((word) => {
    const found = findPaths(letters, word);
    return found.length === 1 && pathSpells(letters, paths[word], word) && found[0].join(",") === paths[word].join(",");
  });
}

// Deterministic PRNG (cyrb128 seed + sfc32): integer maths only, identical in every browser.
function seedFrom(text: string) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    h1 = h2 ^ Math.imul(h1 ^ code, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ code, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ code, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ code, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}

function randomSource(text: string) {
  let [a, b, c, d] = seedFrom(text);
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  return { next, int: (limit: number) => Math.floor(next() * limit) };
}

function pickDirection(random: ReturnType<typeof randomSource>) {
  let roll = random.int(100);
  for (const option of PLACEMENT_WEIGHTS) {
    if (roll < option.weight) return option.step;
    roll -= option.weight;
  }
  return PLACEMENT_WEIGHTS[0].step;
}

function tryGenerate(seed: string): { letters: string[]; paths: Record<string, number[]> } | null {
  const random = randomSource(seed);
  const cells: string[] = new Array(CELL_COUNT).fill("");
  const paths: Record<string, number[]> = {};
  // Longest words first; equal lengths in a seeded order.
  const order = ALL_WORDS.map((word) => ({ word, tie: random.next() }))
    .sort((left, right) => right.word.length - left.word.length || left.tie - right.tie)
    .map((entry) => entry.word);

  for (const word of order) {
    let placed = false;
    for (let tries = 0; tries < 400 && !placed; tries += 1) {
      const [rowStep, colStep] = pickDirection(random);
      const row = random.int(GRID_SIZE);
      const col = random.int(GRID_SIZE);
      const endRow = row + rowStep * (word.length - 1);
      const endCol = col + colStep * (word.length - 1);
      if (endRow < 0 || endRow >= GRID_SIZE || endCol < 0 || endCol >= GRID_SIZE) continue;
      const path: number[] = [];
      let shared = 0;
      for (let index = 0; index < word.length; index += 1) {
        const cell = (row + rowStep * index) * GRID_SIZE + col + colStep * index;
        if (cells[cell] && cells[cell] !== word[index]) break;
        if (cells[cell]) shared += 1;
        path.push(cell);
      }
      // Crossing words may share a letter or two, but never hide inside each other.
      if (path.length !== word.length || shared > 2) continue;
      path.forEach((cell, index) => { cells[cell] = word[index]; });
      paths[word] = path;
      placed = true;
    }
    if (!placed) return null;
  }

  for (let fillTry = 0; fillTry < 12; fillTry += 1) {
    const letters = cells.map((letter) => letter || FILLER[random.int(FILLER.length)]);
    if (validateLayout(letters, paths)) return { letters, paths };
  }
  return null;
}

function legacyLayout(attemptId: string): Layout {
  return {
    attemptId,
    letters: [...FLAT_LETTERS],
    paths: Object.fromEntries(ALL_WORDS.map((word) => [word, WORD_PATHS[word][0]])),
    legacy: true,
  };
}

const cache = new Map<string, Layout>();

/** The board for an attempt. The same attempt id always gives the same board. */
export function layoutForAttempt(attemptId: string): Layout {
  const id = attemptId.toLowerCase();
  const cached = cache.get(id);
  if (cached) return cached;
  let layout: Layout | null = null;
  if (isGeneratedAttemptId(id)) {
    for (let salt = 0; salt < 200 && !layout; salt += 1) {
      const result = tryGenerate(`${id}#${salt}`);
      if (result) layout = { attemptId: id, ...result, legacy: false };
    }
  }
  layout ??= legacyLayout(id);
  if (cache.size > 20) cache.clear();
  cache.set(id, layout);
  return layout;
}
