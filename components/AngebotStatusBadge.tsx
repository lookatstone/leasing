import * as React from "react";
import { Star, CheckCircle, XCircle, Archive, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AngebotStatus } from "@/types";

const statusConfig: Record<
  AngebotStatus,
  { label: string; container: string; icon: React.ReactNode }
> = {
  favorit: {
    label: "Favorit",
    container: "bg-yellow-50 text-yellow-700 border-yellow-200",
    icon: <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />,
  },
  aktiv: {
    label: "Aktiv",
    container: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CheckCircle className="h-3 w-3 text-blue-500" />,
  },
  verworfen: {
    label: "Verworfen",
    container: "bg-gray-50 text-gray-500 border-gray-200",
    icon: <XCircle className="h-3 w-3 text-gray-400" />,
  },
  archiviert: {
    label: "Archiviert",
    container: "bg-gray-50 text-gray-400 border-gray-200",
    icon: <Archive className="h-3 w-3 text-gray-400" />,
  },
  nicht_verfuegbar: {
    label: "Nicht verfügbar",
    container: "bg-red-50 text-red-600 border-red-200",
    icon: <Ban className="h-3 w-3 text-red-500" />,
  },
};

interface AngebotStatusBadgeProps {
  status: AngebotStatus;
  className?: string;
}

export function AngebotStatusBadge({
  status,
  className,
}: AngebotStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.container,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
