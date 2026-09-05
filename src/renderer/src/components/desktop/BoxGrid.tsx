import { useEffect, useRef, useState } from "react";
import { AppBox, type AppItem } from "./AppBox";
import { NoteBox } from "./NoteBox";
import { BoxFrame, type BoxRect } from "./BoxFrame";

export type DesktopBox =
  | { id: string; kind: "app"; title: string; rect: BoxRect; apps: AppItem[] }
  | { id: string; kind: "note"; title: string; rect: BoxRect; text: string };

type BoxGridProps = {
  boxes: DesktopBox[];
  onMove: (id: string, pos: { x: number; y: number }) => void;
  onResize: (id: string, size: { w: number; h: number }) => void;
  onRemove: (id: string) => void;
  onLaunch: (boxId: string, app: AppItem) => void;
  onNoteChange: (boxId: string, text: string) => void;
};

const COMPACT_BREAKPOINT = 820;

export function BoxGrid({
  boxes,
  onMove,
  onResize,
  onRemove,
  onLaunch,
  onNoteChange,
}: BoxGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1280, height: 720 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ width: el.clientWidth, height: el.clientHeight });
    });
    setSize({ width: el.clientWidth, height: el.clientHeight });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const compact = size.width < COMPACT_BREAKPOINT;

  return (
    <div
      ref={ref}
      className={
        compact
          ? "grid h-full grid-cols-[repeat(auto-fill,minmax(240px,1fr))] content-start gap-3 overflow-y-auto p-3"
          : "relative h-full w-full overflow-hidden p-3"
      }
    >
      {boxes.map((box) => (
        <BoxFrame
          key={box.id}
          rect={box.rect}
          title={box.title}
          accent={box.kind === "note" ? "note" : "app"}
          free={!compact}
          bounds={size}
          onMove={(pos) => onMove(box.id, pos)}
          onResize={(s) => onResize(box.id, s)}
          onRemove={() => onRemove(box.id)}
        >
          {box.kind === "app" ? (
            <AppBox
              title={box.title}
              apps={box.apps}
              onLaunch={(app) => onLaunch(box.id, app)}
            />
          ) : (
            <NoteBox value={box.text} onChange={(text) => onNoteChange(box.id, text)} />
          )}
        </BoxFrame>
      ))}

      {boxes.length === 0 && (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
          No boxes yet — add one from the strip above.
        </div>
      )}
    </div>
  );
}
