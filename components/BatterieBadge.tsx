import * as React from "react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BaselineProfil } from "@/types";

interface BatterieBadgeProps {
  kwh?: number;
  baseline?: BaselineProfil;
  className?: string;
}

export function BatterieBadge({ kwh, baseline, className }: BatterieBadgeProps) {
  if (!kwh) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-muted bg-muted px-2.5 py-0.5 text-xs text-muted-foreground",
          className
        )}
      >
        <Zap className="h-3 w-3" />
        Unbekannt
      </span>
    );
  }

  let containerClass =
    "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (baseline) {
    if (kwh < baseline.mindestBatterieKwh) {
      containerClass = "bg-red-50 text-red-700 border-red-200";
    } else if (kwh < baseline.bevorzugteBatterieKwh) {
      containerClass = "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        containerClass,
        className
      )}
    >
      <Zap className="h-3 w-3" />
      {kwh.toLocaleString("de-DE", { maximumFractionDigits: 1 })} kWh
    </span>
  );
}
