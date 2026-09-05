type NoteBoxProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function NoteBox({ value, onChange, placeholder = "Type a note…" }: NoteBoxProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      spellCheck={false}
      className="h-full w-full resize-none rounded-xl bg-note-surface p-2.5 text-[13px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-accent/50"
    />
  );
}
