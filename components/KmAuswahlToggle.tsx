import * as React from "react";
import { KM_TIERS, type KmTier } from "@/hooks/useKmAuswahl";
import { cn } from "@/lib/utils";

interface KmAuswahlToggleProps {
  kmAuswahl: KmTier;
  setKm: (km: KmTier) => void;
  className?: string;
}

export function KmAuswahlToggle({ kmAuswahl, setKm, className }: KmAuswahlToggleProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span className="mr-1 text-xs text-muted-foreground">km/Jahr:</span>
      <div className="flex items-center rounded-lg border bg-muted p-0.5">
        {KM_TIERS.map((km) => (
          <button
            key={km}
            type="button"
            onClick={() => setKm(km)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              kmAuswahl === km
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {(km / 1000).toFixed(0)} Tkm
          </button>
        ))}
      </div>
    </div>
  );
}
