import { AppWindow } from "lucide-react";

export type AppItem = {
  id: string;
  label: string;
  icon?: string;
};

type AppBoxProps = {
  title: string;
  apps: AppItem[];
  onLaunch: (app: AppItem) => void;
};

export function AppBox({ apps, onLaunch }: AppBoxProps) {
  if (apps.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/60 text-[11px] text-muted-foreground">
        Drop shortcuts here
      </div>
    );
  }

  return (
    <div className="grid h-full auto-rows-min grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-1 overflow-y-auto">
      {apps.map((app) => (
        <button
          key={app.id}
          onDoubleClick={() => onLaunch(app)}
          onClick={() => onLaunch(app)}
          className="app-tile"
          title={app.label}
        >
          <span className="app-tile-icon">
            {app.icon ? (
              <img src={app.icon} alt="" className="h-7 w-7 object-contain" />
            ) : (
              <AppWindow className="h-5 w-5 text-accent" />
            )}
          </span>
          <span className="w-full truncate text-center text-[10px] leading-tight text-foreground/80">
            {app.label}
          </span>
        </button>
      ))}
    </div>
  );
}
