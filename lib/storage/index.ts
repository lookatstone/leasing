"use client";

import type { AppData, Angebot, Vergleich, BaselineProfil } from "@/types";
import { SEED_DATA } from "@/data/seed";

const STORAGE_KEY = "ev-leasing-app-v1";

// ─────────────────────────────────────────────────────────────────────────────
// Lesen und Schreiben aus localStorage
// ─────────────────────────────────────────────────────────────────────────────

export function ladeAppData(): AppData {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      speichereAppData(SEED_DATA);
      return SEED_DATA;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Migrations-Hook für zukünftige Versionen
    if (parsed.version !== SEED_DATA.version) {
      return migriere(parsed);
    }
    return parsed;
  } catch {
    speichereAppData(SEED_DATA);
    return SEED_DATA;
  }
}

export function speichereAppData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function migriere(data: Partial<AppData>): AppData {
  // Einfache Migration: fehlende Felder mit Seeds auffüllen
  const result: AppData = {
    version: SEED_DATA.version,
    angebote: data.angebote ?? SEED_DATA.angebote,
    vergleiche: data.vergleiche ?? SEED_DATA.vergleiche,
    baselineProfile: data.baselineProfile ?? SEED_DATA.baselineProfile,
    aktiveBaselineProfilId:
      data.aktiveBaselineProfilId ?? SEED_DATA.aktiveBaselineProfilId,
  };
  speichereAppData(result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Angebote
// ─────────────────────────────────────────────────────────────────────────────

export function speichereAngebot(angebot: Angebot): void {
  const data = ladeAppData();
  const idx = data.angebote.findIndex((a) => a.id === angebot.id);
  if (idx >= 0) {
    data.angebote[idx] = { ...angebot, aktualisiertAm: new Date().toISOString() };
  } else {
    data.angebote.push(angebot);
  }
  speichereAppData(data);
}

export function loescheAngebot(id: string): void {
  const data = ladeAppData();
  data.angebote = data.angebote.filter((a) => a.id !== id);
  // Aus Vergleichen entfernen
  data.vergleiche = data.vergleiche.map((v) => ({
    ...v,
    angebotIds: v.angebotIds.filter((aid) => aid !== id),
    aktualisiertAm: new Date().toISOString(),
  }));
  speichereAppData(data);
}

export function ladeAngebot(id: string): Angebot | undefined {
  const data = ladeAppData();
  return data.angebote.find((a) => a.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Vergleiche
// ─────────────────────────────────────────────────────────────────────────────

export function speichereVergleich(vergleich: Vergleich): void {
  const data = ladeAppData();
  const idx = data.vergleiche.findIndex((v) => v.id === vergleich.id);
  if (idx >= 0) {
    data.vergleiche[idx] = {
      ...vergleich,
      aktualisiertAm: new Date().toISOString(),
    };
  } else {
    data.vergleiche.push(vergleich);
  }
  speichereAppData(data);
}

export function loescheVergleich(id: string): void {
  const data = ladeAppData();
  data.vergleiche = data.vergleiche.filter((v) => v.id !== id);
  speichereAppData(data);
}

export function dupliziereVergleich(id: string): Vergleich | null {
  const data = ladeAppData();
  const original = data.vergleiche.find((v) => v.id === id);
  if (!original) return null;
  const kopie: Vergleich = {
    ...original,
    id: generiereId(),
    name: `${original.name} (Kopie)`,
    erstelltAm: new Date().toISOString(),
    aktualisiertAm: new Date().toISOString(),
  };
  data.vergleiche.push(kopie);
  speichereAppData(data);
  return kopie;
}

export function archiviereVergleich(id: string, archiviert: boolean): void {
  const data = ladeAppData();
  const idx = data.vergleiche.findIndex((v) => v.id === id);
  if (idx >= 0) {
    data.vergleiche[idx] = {
      ...data.vergleiche[idx],
      archiviert,
      aktualisiertAm: new Date().toISOString(),
    };
  }
  speichereAppData(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// Baseline-Profile
// ─────────────────────────────────────────────────────────────────────────────

export function speichereBaselineProfil(profil: BaselineProfil): void {
  const data = ladeAppData();
  const idx = data.baselineProfile.findIndex((p) => p.id === profil.id);
  if (idx >= 0) {
    data.baselineProfile[idx] = profil;
  } else {
    data.baselineProfile.push(profil);
  }
  speichereAppData(data);
}

export function setzeAktivesBaselineProfil(id: string): void {
  const data = ladeAppData();
  data.aktiveBaselineProfilId = id;
  speichereAppData(data);
}

// ─────────────────────────────────────────────────────────────────────────────
// Hilfsfunktionen
// ─────────────────────────────────────────────────────────────────────────────

export function generiereId(): string {
  return (
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 9)
  );
}

export function resetAufSeeds(): void {
  speichereAppData(SEED_DATA);
}
