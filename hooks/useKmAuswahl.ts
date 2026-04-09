"use client";

import { useState, useEffect } from "react";
import type { Angebot } from "@/types";

export type KmTier = 20000 | 25000 | 30000;
export const KM_TIERS: KmTier[] = [20000, 25000, 30000];

const KEY = "ev-leasing-km-auswahl";

export function useKmAuswahl() {
  const [kmAuswahl, setKmAuswahl] = useState<KmTier>(20000);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      const n = Number(stored);
      if ([20000, 25000, 30000].includes(n)) {
        setKmAuswahl(n as KmTier);
      }
    } catch {}
  }, []);

  function setKm(km: KmTier) {
    setKmAuswahl(km);
    try {
      localStorage.setItem(KEY, String(km));
    } catch {}
  }

  return { kmAuswahl, setKm };
}

/**
 * Gibt die Monatsrate für eine bestimmte km-Stufe zurück.
 * Schaut zuerst in kmStaffelRaten, fällt dann auf monatsrate zurück wenn kmProJahr passt.
 */
export function getRateForKm(angebot: Angebot, km: number): number | undefined {
  const staffel = angebot.konditionen.kmStaffelRaten;
  if (staffel) {
    const treffer = staffel.find((s) => s.kmProJahr === km);
    if (treffer) return treffer.monatsrate;
  }
  // Fallback: wenn das Angebot selbst diese km-Stufe hat
  if (angebot.konditionen.kmProJahr === km) return angebot.konditionen.monatsrate;
  return undefined;
}
