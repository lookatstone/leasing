"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppData, Angebot, Vergleich, BaselineProfil } from "@/types";
import {
  ladeAppData,
  speichereAppData,
  speichereAngebot,
  loescheAngebot,
  speichereVergleich,
  loescheVergleich,
  dupliziereVergleich,
  archiviereVergleich,
  speichereBaselineProfil,
  setzeAktivesBaselineProfil,
  generiereId,
} from "@/lib/storage";

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null);
  const [geladen, setGeladen] = useState(false);

  useEffect(() => {
    const d = ladeAppData();
    setData(d);
    setGeladen(true);
  }, []);

  const reload = useCallback(() => {
    setData(ladeAppData());
  }, []);

  // ─── Angebote ──────────────────────────────────────────────────────────────

  const angebotSpeichern = useCallback(
    (angebot: Angebot) => {
      speichereAngebot(angebot);
      reload();
    },
    [reload]
  );

  const angebotLoeschen = useCallback(
    (id: string) => {
      loescheAngebot(id);
      reload();
    },
    [reload]
  );

  const neuesAngebotId = useCallback(() => generiereId(), []);

  // ─── Vergleiche ────────────────────────────────────────────────────────────

  const vergleichSpeichern = useCallback(
    (vergleich: Vergleich) => {
      speichereVergleich(vergleich);
      reload();
    },
    [reload]
  );

  const vergleichLoeschen = useCallback(
    (id: string) => {
      loescheVergleich(id);
      reload();
    },
    [reload]
  );

  const vergleichDuplizieren = useCallback(
    (id: string) => {
      const kopie = dupliziereVergleich(id);
      reload();
      return kopie;
    },
    [reload]
  );

  const vergleichArchivieren = useCallback(
    (id: string, archiviert: boolean) => {
      archiviereVergleich(id, archiviert);
      reload();
    },
    [reload]
  );

  // ─── Baseline ──────────────────────────────────────────────────────────────

  const baselineSpeichern = useCallback(
    (profil: BaselineProfil) => {
      speichereBaselineProfil(profil);
      reload();
    },
    [reload]
  );

  const aktiveBaselineSetzen = useCallback(
    (id: string) => {
      setzeAktivesBaselineProfil(id);
      reload();
    },
    [reload]
  );

  const aktiveBaseline =
    data?.baselineProfile.find(
      (p) => p.id === data.aktiveBaselineProfilId
    ) ?? data?.baselineProfile[0];

  return {
    data,
    geladen,
    aktiveBaseline,
    angebotSpeichern,
    angebotLoeschen,
    neuesAngebotId,
    vergleichSpeichern,
    vergleichLoeschen,
    vergleichDuplizieren,
    vergleichArchivieren,
    baselineSpeichern,
    aktiveBaselineSetzen,
    reload,
  };
}
