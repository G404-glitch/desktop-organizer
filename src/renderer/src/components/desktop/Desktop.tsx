import { useEffect, useState } from "react";
import { Minus, Square, X } from "lucide-react";
import { BoxGrid, type DesktopBox } from "./BoxGrid";
import { AddBoxButton } from "./AddBoxButton";
import type { AppItem } from "./AppBox";

type DesktopProps = {
  initialBoxes?: DesktopBox[];
  onLaunchApp?: (app: AppItem) => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

export function Desktop({
  initialBoxes = [],
  onLaunchApp,
  onMinimize,
  onMaximize,
  onClose,
}: DesktopProps) {
  const [boxes, setBoxes] = useState<DesktopBox[]>(initialBoxes);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const result = await window.api.loadLayout();
        if (!active) return;

        if (Array.isArray(result.data)) {
          setBoxes(result.data as DesktopBox[]);
        } else {
          setBoxes(initialBoxes);
        }
      } catch {
        if (active) {
          setBoxes(initialBoxes);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void window.api.saveLayout(boxes);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [boxes]);

  const update = (id: string, patch: Partial<DesktopBox>) =>
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, ...patch } as DesktopBox) : b)),
    );

  const hideBox = (id: string) => update(id, { hidden: true });
  const restoreBox = (id: string) => update(id, { hidden: false });
  const renameBox = (id: string, title: string) => update(id, { title });

  const nextRect = () => ({
    x: 40 + (boxes.length % 4) * 40,
    y: 40 + (boxes.length % 4) * 32,
    w: 300,
    h: 220,
  });

  const addAppBox = async (files: File[]) => {
    const apps = await Promise.all(
      files.map(async (f) => {
        const path = window.api.getPathForFile(f);
        const { dataUrl } = await window.api.getFileIcon(path);

        return {
          id: uid(),
          label: f.name.replace(/\.[^.]+$/, ""),
          path,
          icon: dataUrl,
        } satisfies AppItem;
      }),
    );

    setBoxes((prev) => [
      ...prev,
      { id: uid(), kind: "app", title: "Apps", rect: nextRect(), apps },
    ]);
  };

  const addNoteBox = () =>
    setBoxes((prev) => [
      ...prev,
      { id: uid(), kind: "note", title: "Note", rect: nextRect(), text: "" },
    ]);

  return (
    <div
      className="flex h-screen w-screen flex-col overflow-hidden bg-transparent"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files ?? []);
        if (files.length) addAppBox(files);
      }}
    >
      {/* Frameless window drag strip */}
      <div className="drag-strip">
        <span className="drag-strip-dots" aria-hidden />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground/70">
          Desktop Organizer
        </span>
        <div className="ml-auto flex items-center gap-1.5 no-drag">
          <AddBoxButton onAddAppBox={addAppBox} onAddNoteBox={addNoteBox} />
          <button className="win-button" onClick={onMinimize} aria-label="Minimize">
            <Minus className="h-3 w-3" />
          </button>
          <button className="win-button" onClick={onMaximize} aria-label="Maximize">
            <Square className="h-2.5 w-2.5" />
          </button>
          <button className="win-button win-close" onClick={onClose} aria-label="Close">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      <main className="min-h-0 flex-1">
        <BoxGrid
          boxes={boxes}
          onMove={(id, pos) => {
            const box = boxes.find((b) => b.id === id);
            if (box) update(id, { rect: { ...box.rect, ...pos } });
          }}
          onResize={(id, size) => {
            const box = boxes.find((b) => b.id === id);
            if (box) update(id, { rect: { ...box.rect, ...size } });
          }}
          onRemove={(id) => setBoxes((prev) => prev.filter((b) => b.id !== id))}
          onHide={(id) => {
            // If currently hidden, restore instead
            const box = boxes.find((b) => b.id === id);
            if (box?.hidden) restoreBox(id);
            else hideBox(id);
          }}
          onRename={(id, title) => renameBox(id, title)}
          onLaunch={(_boxId, app) => onLaunchApp?.(app)}
          onNoteChange={(id, text) => update(id, { text } as Partial<DesktopBox>)}
        />
      </main>
    </div>
  );
}
