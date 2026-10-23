export const GRID_SIZE = 21;

/**
 * The letter grid is transcribed from the English with Mel reference puzzle.
 * The reference's final row is 21 tiles wide (WEEKEND + BEACH + DIFFICULT),
 * so the board uses 21 columns throughout. One filler letter is appended to
 * the shorter rows so that every one of the 30 reference words remains intact.
 */
export const ROW_SOURCES = [
  "XDRAWINGFAVOURITEHBPS",
  "WEATHERJKITCHENTRAINE",
  "AFOOTBALLYSURPRISELRD",
  "DBECAUSEZTEACHERDIADS",
  "VESTRONGDELICIOUSYYRT",
  "EADVENTUREWEEKENDEEEA",
  "NCOUSINDIFFICULTRSDAR",
  "THOLIDAYINTERESTINGMC",
  "UDINNERPLAYEDBOUGHTWL",
  "RLIGHTSOMETIMESWENTIE",
  "ETERRIBLEYESTERDAYFNO",
  "BSDREAMSAWBEACHKCHEDE",
  "KXCITFOVWINDOWSEPZOOR",
  "ITFCOUSINEXCITINGLWWK",
  "TRAINGSURPRISEDREAMVE",
  "CUTEACHERFOOTBALLDINR",
  "HSOMETIMESLIGHTSAWNES",
  "EPLAYEDWEATHERDINNERA",
  "NYESTERDAYBOUGHTSTROM",
  "STDELICIOUSADVENTURER",
  "WEEKENDBEACHDIFFICULT",
] as const;

export type Tone = {
  id: string;
  soft: string;
  line: string;
  ink: string;
  solid: string;
  deep: string;
};

/**
 * Colour order follows the six word-list blocks in the English with Mel
 * reference: pink, yellow, green, blue, lavender, peach.
 */
export const TONES: Tone[] = [
  { id: "pink", soft: "#FBE2EA", line: "#EDB3C5", ink: "#74384D", solid: "#EFB7C8", deep: "#C97D96" },
  { id: "yellow", soft: "#FCF1C9", line: "#E8CF8C", ink: "#6E561C", solid: "#F2D993", deep: "#BE9B3F" },
  { id: "green", soft: "#E5F1DD", line: "#B2D0A3", ink: "#385834", solid: "#B5D3A6", deep: "#7C9F6E" },
  { id: "blue", soft: "#E2F0F8", line: "#AACDE1", ink: "#2D536B", solid: "#A9CBE0", deep: "#6D96B0" },
  { id: "lavender", soft: "#ECE6F8", line: "#C2B3DF", ink: "#4F3C6E", solid: "#C5B6E1", deep: "#917BB7" },
  { id: "peach", soft: "#FCE6D8", line: "#EBC0A9", ink: "#76432C", solid: "#F1BBA1", deep: "#CE8B6A" },
];

export type WordGroup = {
  id: string;
  words: string[];
  tone: Tone;
};

export const WORD_GROUPS: WordGroup[] = [
  {
    id: "group-1",
    tone: TONES[0],
    words: ["BEACH", "TRAIN", "DREAM", "LIGHT", "STRONG"],
  },
  {
    id: "group-2",
    tone: TONES[1],
    words: ["WINDOW", "KITCHEN", "COUSIN", "WEATHER", "HOLIDAY"],
  },
  {
    id: "group-3",
    tone: TONES[2],
    words: ["FOOTBALL", "DRAWING", "DINNER", "TEACHER", "WEEKEND"],
  },
  {
    id: "group-4",
    tone: TONES[3],
    words: ["YESTERDAY", "BOUGHT", "WENT", "SAW", "PLAYED"],
  },
  {
    id: "group-5",
    tone: TONES[4],
    words: ["BECAUSE", "FAVOURITE", "EXCITING", "DIFFICULT", "SOMETIMES"],
  },
  {
    id: "group-6",
    tone: TONES[5],
    words: ["SURPRISE", "ADVENTURE", "TERRIBLE", "DELICIOUS", "INTERESTING"],
  },
];

export const ALL_WORDS: string[] = WORD_GROUPS.flatMap((group) => group.words);
export const TOTAL_WORDS = ALL_WORDS.length;

export const GRID = ROW_SOURCES.map((row) => row.split(""));
export const FLAT_LETTERS = GRID.flat();

export const WORD_TONE: Record<string, Tone> = Object.fromEntries(
  WORD_GROUPS.flatMap((group) => group.words.map((word) => [word, group.tone])),
);

export function getWordGroup(word: string): WordGroup | undefined {
  return WORD_GROUPS.find((group) => group.words.includes(word));
}

export function buildPath(start: number, end: number): number[] {
  if (start < 0 || end < 0) return [];

  const startRow = Math.floor(start / GRID_SIZE);
  const startCol = start % GRID_SIZE;
  const endRow = Math.floor(end / GRID_SIZE);
  const endCol = end % GRID_SIZE;
  const rowDelta = endRow - startRow;
  const colDelta = endCol - startCol;

  if (rowDelta === 0 && colDelta === 0) return [start];

  const rowDistance = Math.abs(rowDelta);
  const colDistance = Math.abs(colDelta);
  let stepRow = 0;
  let stepCol = 0;
  let steps = 0;

  if (rowDistance === 0) {
    stepCol = Math.sign(colDelta);
    steps = colDistance;
  } else if (colDistance === 0) {
    stepRow = Math.sign(rowDelta);
    steps = rowDistance;
  } else {
    const ratio = Math.max(rowDistance, colDistance) / Math.min(rowDistance, colDistance);

    if (ratio <= 1.8) {
      // Nearly diagonal: snap forgivingly to the diagonal.
      stepRow = Math.sign(rowDelta);
      stepCol = Math.sign(colDelta);
      steps = Math.round((rowDistance + colDistance) / 2);
    } else if (rowDistance > colDistance) {
      stepRow = Math.sign(rowDelta);
      steps = rowDistance;
    } else {
      stepCol = Math.sign(colDelta);
      steps = colDistance;
    }
  }

  const path = [start];
  let row = startRow;
  let col = startCol;

  for (let step = 0; step < steps; step += 1) {
    row += stepRow;
    col += stepCol;
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) break;
    path.push(row * GRID_SIZE + col);
  }

  return path;
}

const DIRECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

export function findWordPaths(word: string): number[][] {
  const paths: number[][] = [];

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (GRID[row][col] !== word[0]) continue;

      for (const [rowStep, colStep] of DIRECTIONS) {
        const path: number[] = [];
        let matches = true;

        for (let index = 0; index < word.length; index += 1) {
          const nextRow = row + rowStep * index;
          const nextCol = col + colStep * index;

          if (
            nextRow < 0 ||
            nextRow >= GRID_SIZE ||
            nextCol < 0 ||
            nextCol >= GRID_SIZE ||
            GRID[nextRow][nextCol] !== word[index]
          ) {
            matches = false;
            break;
          }

          path.push(nextRow * GRID_SIZE + nextCol);
        }

        if (matches) paths.push(path);
      }
    }
  }

  return paths;
}

export const WORD_PATHS: Record<string, number[][]> = Object.fromEntries(
  ALL_WORDS.map((word) => [word, findWordPaths(word)]),
);
