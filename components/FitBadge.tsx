import * as React from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FitBewertung } from "@/types";
import { labelFitBewertung } from "@/lib/formatters";

const fitConfig: Record<
  FitBewertung,
  { container: string; icon: React.ReactNode; label: string }
> = {
  guter_fit: {
    container: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
    label: "Guter Fit",
  },
  genau_pruefen: {
    container: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertCircle className="h-3.5 w-3.5 text-amber-500" />,
    label: "Genau prüfen",
  },
  schwacher_fit: {
    container: "bg-red-50 text-red-700 border-red-200",
    icon: <XCircle className="h-3.5 w-3.5 text-red-500" />,
    label: "Schwacher Fit",
  },
};

interface FitBadgeProps {
  bewertung: FitBewertung;
  erklaerung?: string;
  size?: "sm" | "md";
  className?: string;
}

export function FitBadge({
  bewertung,
  erklaerung,
  size = "md",
  className,
}: FitBadgeProps) {
  const config = fitConfig[bewertung];

  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium cursor-default",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        config.container,
        className
      )}
    >
      {config.icon}
      {labelFitBewertung(bewertung)}
    </span>
  );

  if (!erklaerung) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{erklaerung}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
