import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  buildPath,
  FLAT_LETTERS,
  GRID_SIZE,
  WORD_TONE,
  type Tone,
} from "../data/puzzle";

type PuzzleBoardProps = {
  foundPaths: Record<string, number[]>;
  hintCell: number | null;
  invalidPath: number[];
  resetToken: number;
  completed: boolean;
  onWordAttempt: (path: number[]) => void;
  onTapStart: () => void;
};

type CellProps = {
  index: number;
  letter: string;
  tone?: Tone;
  selected: boolean;
  endpoint: boolean;
  hinted: boolean;
  invalid: boolean;
};

const Cell = memo(function Cell({
  index,
  letter,
  tone,
  selected,
  endpoint,
  hinted,
  invalid,
}: CellProps) {
  const style: CSSProperties = {};

  if (tone) {
    style.backgroundColor = tone.soft;
    style.borderColor = tone.line;
    style.color = tone.ink;
  }

  const classes = ["ws-cell"];

  if (tone) classes.push("cell-found");
  if (selected) {
    classes.push("cell-selected");
    if (endpoint) classes.push("cell-endpoint");
  }
  if (hinted) classes.push("cell-hinted");
  if (invalid) classes.push("cell-invalid");

  return (
    <div
      data-cell={index}
      role="gridcell"
      aria-rowindex={Math.floor(index / GRID_SIZE) + 1}
      aria-colindex={(index % GRID_SIZE) + 1}
      aria-label={`Row ${Math.floor(index / GRID_SIZE) + 1}, column ${(index % GRID_SIZE) + 1}: ${letter}`}
      className={classes.join(" ")}
      style={style}
    >
      {letter}
    </div>
  );
});

export default function PuzzleBoard({
  foundPaths,
  hintCell,
  invalidPath,
  resetToken,
  completed,
  onWordAttempt,
  onTapStart,
}: PuzzleBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<number[]>([]);
  const selectionRef = useRef<number[]>([]);
  const pointerDownRef = useRef(false);
  const startRef = useRef<number | null>(null);
  const lastValidRef = useRef<number | null>(null);
  const tapAnchorRef = useRef<number | null>(null);
  const previousPathRef = useRef("");

  const updateSelection = useCallback((path: number[]) => {
    selectionRef.current = path;
    previousPathRef.current = path.join(",");
    setSelection(path);
  }, []);

  const clearInteraction = useCallback(() => {
    pointerDownRef.current = false;
    startRef.current = null;
    lastValidRef.current = null;
    tapAnchorRef.current = null;
    updateSelection([]);
  }, [updateSelection]);

  useEffect(() => {
    clearInteraction();
  }, [resetToken, clearInteraction]);

  const foundCellTones = useMemo(() => {
    const tones = new Map<number, Tone>();

    Object.entries(foundPaths).forEach(([word, path]) => {
      const tone = WORD_TONE[word];
      if (!tone) return;
      path.forEach((cell) => tones.set(cell, tone));
    });

    return tones;
  }, [foundPaths]);

  const selectedSet = useMemo(() => new Set(selection), [selection]);
  const invalidSet = useMemo(() => new Set(invalidPath), [invalidPath]);
  const endpoint = selection.length > 0 ? selection[selection.length - 1] : null;

  const getCellFromPoint = useCallback((clientX: number, clientY: number) => {
    if (typeof document === "undefined") return null;
    const element = document.elementFromPoint(clientX, clientY);
    const cell = element instanceof Element ? element.closest<HTMLElement>("[data-cell]") : null;

    if (!cell || !boardRef.current?.contains(cell)) return null;
    const index = Number(cell.dataset.cell);
    return Number.isInteger(index) && index >= 0 && index < FLAT_LETTERS.length ? index : null;
  }, []);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const index = getCellFromPoint(event.clientX, event.clientY);
    if (index === null) return;

    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is an enhancement; selection still works without it.
    }

    pointerDownRef.current = true;
    startRef.current = index;
    lastValidRef.current = index;
    updateSelection([index]);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current || startRef.current === null) return;
    const index = getCellFromPoint(event.clientX, event.clientY);
    if (index === null) return;

    lastValidRef.current = index;
    const path = buildPath(startRef.current, index);
    if (path.join(",") !== previousPathRef.current) {
      if (path.length > 1) tapAnchorRef.current = null;
      updateSelection(path);
    }
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;

    const releasedCell = getCellFromPoint(event.clientX, event.clientY);
    const end = releasedCell ?? lastValidRef.current ?? startRef.current;
    const start = startRef.current;

    if (end === null || start === null) {
      clearInteraction();
      return;
    }

    const path = buildPath(start, end);

    if (path.length <= 1) {
      const anchor = tapAnchorRef.current;

      if (anchor !== null && anchor !== end) {
        const fullPath = buildPath(anchor, end);
        tapAnchorRef.current = null;
        updateSelection([]);
        onWordAttempt(fullPath);
      } else {
        tapAnchorRef.current = end;
        updateSelection([end]);
        onTapStart();
      }

      startRef.current = null;
      lastValidRef.current = null;
      return;
    }

    tapAnchorRef.current = null;
    updateSelection([]);
    startRef.current = null;
    lastValidRef.current = null;
    onWordAttempt(path);
  };

  const handlePointerCancel = () => {
    if (!pointerDownRef.current) return;
    clearInteraction();
  };

  return (
    <div className="board-shell">
      <p id="board-instructions" className="sr-only">
        Drag across letters to select a word, or tap the first letter and then the last letter.
        Selections can run across, down or diagonally, forwards or backwards.
      </p>
      <div
        ref={boardRef}
        className={`ws-board ${completed ? "is-complete" : ""}`}
        role="grid"
        aria-label="Word search letter grid, 21 rows by 21 columns"
        aria-rowcount={GRID_SIZE}
        aria-colcount={GRID_SIZE}
        aria-describedby="board-instructions"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onLostPointerCapture={handlePointerCancel}
      >
        {FLAT_LETTERS.map((letter, index) => (
          <Cell
            key={index}
            index={index}
            letter={letter}
            tone={foundCellTones.get(index)}
            selected={selectedSet.has(index)}
            endpoint={endpoint === index}
            hinted={hintCell === index}
            invalid={invalidSet.has(index)}
          />
        ))}
      </div>
    </div>
  );
}
