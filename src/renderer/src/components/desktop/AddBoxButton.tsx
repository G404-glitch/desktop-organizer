import { useRef, useState } from "react";
import { Plus, LayoutGrid, StickyNote } from "lucide-react";

type AddBoxButtonProps = {
  onAddAppBox: (files: File[]) => void;
  onAddNoteBox: () => void;
};

export function AddBoxButton({ onAddAppBox, onAddNoteBox }: AddBoxButtonProps) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="strip-button"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Plus className="h-3.5 w-3.5" />
        New box
      </button>

      {open && (
        <div className="glass-menu absolute right-0 z-50 mt-1.5 w-44" role="menu">
          <button
            className="menu-item"
            onClick={() => {
              setOpen(false);
              fileRef.current?.click();
            }}
          >
            <LayoutGrid className="h-3.5 w-3.5 text-accent" />
            App box…
          </button>
          <button
            className="menu-item"
            onClick={() => {
              setOpen(false);
              onAddNoteBox();
            }}
          >
            <StickyNote className="h-3.5 w-3.5 text-note-accent" />
            Sticky note
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) onAddAppBox(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
