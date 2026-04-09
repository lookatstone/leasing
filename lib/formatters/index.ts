// ─────────────────────────────────────────────────────────────────────────────
// Formatierungs-Hilfsfunktionen (deutsche Locale)
// ─────────────────────────────────────────────────────────────────────────────

const EUR = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const EUR_DEZIMAL = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const ZAHL = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const DEZIMAL = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEuro(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return EUR.format(value);
}

export function formatEuroGenau(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return EUR_DEZIMAL.format(value);
}

export function formatKm(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return ZAHL.format(value) + " km";
}

export function formatKwh(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return DEZIMAL.format(value) + " kWh";
}

export function formatKw(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return ZAHL.format(value) + " kW";
}

export function formatMonate(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return value + " Monate";
}

export function formatDatum(
  isoString: string | undefined | null,
  format: "kurz" | "lang" = "kurz"
): string {
  if (!isoString) return "–";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "–";
    if (format === "lang") {
      return date.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "–";
  }
}

export function formatDatumZeit(isoString: string | undefined | null): string {
  if (!isoString) return "–";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "–";
    return date.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "–";
  }
}

export function formatKostenProKm(value: number | undefined | null): string {
  if (value === undefined || value === null) return "–";
  return (value * 100).toFixed(1).replace(".", ",") + " ct/km";
}

import type {
  AngebotStatus,
  FahrzeugZustand,
  FoerderungStatus,
  GapStatus,
  AnhaengerkupplungStatus,
  Verfuegbarkeit,
  FitBewertung,
  WarnungSchwere,
} from "@/types";

export function labelAngebotStatus(status: AngebotStatus): string {
  const map: Record<AngebotStatus, string> = {
    favorit: "Favorit",
    aktiv: "Aktiv",
    verworfen: "Verworfen",
    archiviert: "Archiviert",
    nicht_verfuegbar: "Nicht verfügbar",
  };
  return map[status] ?? status;
}

export function labelFahrzeugZustand(zustand: FahrzeugZustand): string {
  return zustand === "neu" ? "Neuwagen" : "Gebrauchwagen";
}

export function labelFoerderungStatus(status: FoerderungStatus): string {
  const map: Record<FoerderungStatus, string> = {
    eingerechnet: "Förderung eingerechnet",
    nicht_eingerechnet: "Förderung nicht eingerechnet",
    unklar: "Förderung unklar",
  };
  return map[status] ?? status;
}

export function labelGapStatus(status: GapStatus): string {
  const map: Record<GapStatus, string> = {
    enthalten: "GAP enthalten",
    nicht_enthalten: "GAP nicht enthalten",
    unklar: "GAP unklar",
  };
  return map[status] ?? status;
}

export function labelAhk(status: AnhaengerkupplungStatus): string {
  const map: Record<AnhaengerkupplungStatus, string> = {
    ja: "AHK vorhanden",
    nein: "Keine AHK",
    optional: "AHK optional",
    unbekannt: "AHK unbekannt",
  };
  return map[status] ?? status;
}

export function labelVerfuegbarkeit(v: Verfuegbarkeit): string {
  const map: Record<Verfuegbarkeit, string> = {
    sofort: "Sofort verfügbar",
    kurz: "< 4 Wochen",
    mittel: "1–3 Monate",
    lang: "> 3 Monate",
    unbekannt: "Verfügbarkeit unbekannt",
  };
  return map[v] ?? v;
}

export function labelFitBewertung(b: FitBewertung): string {
  const map: Record<FitBewertung, string> = {
    guter_fit: "Guter Fit",
    genau_pruefen: "Genau prüfen",
    schwacher_fit: "Schwacher Fit",
  };
  return map[b] ?? b;
}

export function labelWarnungSchwere(s: WarnungSchwere): string {
  const map: Record<WarnungSchwere, string> = {
    info: "Info",
    hinweis: "Hinweis",
    warnung: "Warnung",
  };
  return map[s] ?? s;
}
