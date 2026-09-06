import { useRef, useState, type ReactNode } from "react";
import { X, GripVertical, Eye, Edit3 } from "lucide-react";

export type BoxRect = { x: number; y: number; w: number; h: number };

type BoxFrameProps = {
  rect: BoxRect;
  title?: string;
  accent?: "app" | "note";
  free: boolean;
  bounds: { width: number; height: number };
  minW?: number;
  minH?: number;
  onMove: (pos: { x: number; y: number }) => void;
  onResize: (size: { w: number; h: number }) => void;
  onRemove: () => void;
  onHide?: () => void;
  onRename?: (newTitle: string) => void;
  children: ReactNode;
};

const MIN_W = 140;
const MIN_H = 120;

export function BoxFrame({
  rect,
  title,
  accent = "app",
  free,
  bounds,
  minW = MIN_W,
  minH = MIN_H,
  onMove,
  onResize,
  onRemove,
  children,
}: BoxFrameProps) {
  const [draft, setDraft] = useState<BoxRect | null>(null);
  const [active, setActive] = useState(false);
  const start = useRef<{ px: number; py: number; rect: BoxRect } | null>(null);

  const shown = draft ?? rect;

  const begin = (e: React.PointerEvent, mode: "move" | "resize") => {
    if (!free) return;
    e.preventDefault();
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    start.current = { px: e.clientX, py: e.clientY, rect };
    setActive(true);

    const onPointerMove = (ev: PointerEvent) => {
      const s = start.current;
      if (!s) return;
      const dx = ev.clientX - s.px;
      const dy = ev.clientY - s.py;
      if (mode === "move") {
        setDraft({
          ...s.rect,
          x: clamp(s.rect.x + dx, 0, Math.max(0, bounds.width - s.rect.w)),
          y: clamp(s.rect.y + dy, 0, Math.max(0, bounds.height - s.rect.h)),
        });
      } else {
        setDraft({
          ...s.rect,
          w: clamp(s.rect.w + dx, minW, Math.max(minW, bounds.width - s.rect.x)),
          h: clamp(s.rect.h + dy, minH, Math.max(minH, bounds.height - s.rect.y)),
        });
      }
    };

    const onPointerUp = () => {
      el.releasePointerCapture?.(e.pointerId);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      setActive(false);
      setDraft((d) => {
        if (d) {
          if (mode === "move") onMove({ x: d.x, y: d.y });
          else onResize({ w: d.w, h: d.h });
        }
        return null;
      });
      start.current = null;
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div
      className={`group glass-panel flex flex-col overflow-hidden ${
        free ? "absolute" : "relative"
      } ${active ? "glass-panel-active" : ""} ${accent === "note" ? "glass-panel-note" : ""}`}
      style={
        free
          ? { left: shown.x, top: shown.y, width: shown.w, height: shown.h }
          : { width: "100%", minHeight: Math.max(minH, 140) }
      }
    >
      <div
        onPointerDown={(e) => begin(e, "move")}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium tracking-wide text-muted-foreground ${
          free ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      >
        <GripVertical className="h-3.5 w-3.5 opacity-40" />
        <TitleEditor title={title} onRename={onRename} />
        <div className="ml-auto flex items-center gap-1">
          {onHide && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={onHide}
              aria-label="Hide box"
              className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-muted/10 group-hover:opacity-100"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            aria-label="Remove box"
            className="rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 px-2.5 pb-2.5">{children}</div>

      {free && (
        <div
          onPointerDown={(e) => begin(e, "resize")}
          className="resize-grip"
          aria-label="Resize box"
        />
      )}
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max);
}

function TitleEditor({
  title,
  onRename,
}: {
  title?: string;
  onRename?: (newTitle: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title ?? "");
  return editing ? (
    <input
      autoFocus
      className="bg-transparent border-b border-muted text-[11px] uppercase"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        setEditing(false);
        if (onRename) onRename(value.trim() || title || "");
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          (e.target as HTMLInputElement).blur();
        }
      }}
    />
  ) : (
    <span onDoubleClick={() => setEditing(true)} className="truncate uppercase">
      {title}
    </span>
  );
}
