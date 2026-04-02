import * as React from "react";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Warnung, WarnungSchwere } from "@/types";

const schwereFarben: Record<
  WarnungSchwere,
  { container: string; icon: string }
> = {
  warnung: {
    container: "bg-red-50 text-red-700 border-red-200",
    icon: "text-red-500",
  },
  hinweis: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    icon: "text-amber-500",
  },
  info: {
    container: "bg-blue-50 text-blue-700 border-blue-200",
    icon: "text-blue-500",
  },
};

function SchwereIcon({
  schwere,
  className,
}: {
  schwere: WarnungSchwere;
  className?: string;
}) {
  if (schwere === "warnung")
    return <AlertTriangle className={cn("h-3.5 w-3.5", className)} />;
  if (schwere === "hinweis")
    return <AlertCircle className={cn("h-3.5 w-3.5", className)} />;
  return <Info className={cn("h-3.5 w-3.5", className)} />;
}

interface WarnBadgeProps {
  warnung: Warnung;
  className?: string;
}

export function WarnBadge({ warnung, className }: WarnBadgeProps) {
  const farben = schwereFarben[warnung.schwere];
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium cursor-default",
              farben.container,
              className
            )}
          >
            <SchwereIcon schwere={warnung.schwere} className={farben.icon} />
            {warnung.titel}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{warnung.erklaerung}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface WarnListeProps {
  warnungen: Warnung[];
  maxAnzeigen?: number;
  className?: string;
}

export function WarnListe({ warnungen, maxAnzeigen, className }: WarnListeProps) {
  if (warnungen.length === 0) return null;

  const sortiert = [...warnungen].sort((a, b) => {
    const rang = { warnung: 0, hinweis: 1, info: 2 };
    return rang[a.schwere] - rang[b.schwere];
  });

  const angezeigt = maxAnzeigen ? sortiert.slice(0, maxAnzeigen) : sortiert;
  const rest = maxAnzeigen ? Math.max(0, sortiert.length - maxAnzeigen) : 0;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {angezeigt.map((w) => (
        <WarnBadge key={w.typ} warnung={w} />
      ))}
      {rest > 0 && (
        <span className="inline-flex items-center rounded-full border border-muted bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          +{rest} weitere
        </span>
      )}
    </div>
  );
}
