"use client";

import { useState, useEffect, useCallback } from "react";
import type { AppData, Angebot, Vergleich, BaselineProfil } from "@/types";
import {
  ladeAppDataAsync,
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

  const reload = useCallback(async () => {
    const d = await ladeAppDataAsync();
    setData(d);
  }, []);

  useEffect(() => {
    ladeAppDataAsync().then((d) => {
      setData(d);
      setGeladen(true);
    });
  }, []);

  const angebotSpeichern = useCallback(
    (angebot: Angebot) => {
      speichereAngebot(angebot);
      // Optimistisches Update: lokalen State sofort aktualisieren
      setData((prev) => {
        if (!prev) return prev;
        const idx = prev.angebote.findIndex((a) => a.id === angebot.id);
        const neu = { ...angebot, aktualisiertAm: new Date().toISOString() };
        const angebote =
          idx >= 0
            ? prev.angebote.map((a, i) => (i === idx ? neu : a))
            : [...prev.angebote, neu];
        return { ...prev, angebote };
      });
      // Dann aus Quelle nachladen
      setTimeout(() => reload(), 500);
    },
    [reload]
  );

  const angebotLoeschen = useCallback(
    (id: string) => {
      loescheAngebot(id);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          angebote: prev.angebote.filter((a) => a.id !== id),
          vergleiche: prev.vergleiche.map((v) => ({
            ...v,
            angebotIds: v.angebotIds.filter((aid) => aid !== id),
          })),
        };
      });
    },
    []
  );

  const neuesAngebotId = useCallback(() => generiereId(), []);

  const vergleichSpeichern = useCallback(
    (vergleich: Vergleich) => {
      speichereVergleich(vergleich);
      setData((prev) => {
        if (!prev) return prev;
        const idx = prev.vergleiche.findIndex((v) => v.id === vergleich.id);
        const neu = { ...vergleich, aktualisiertAm: new Date().toISOString() };
        const vergleiche =
          idx >= 0
            ? prev.vergleiche.map((v, i) => (i === idx ? neu : v))
            : [...prev.vergleiche, neu];
        return { ...prev, vergleiche };
      });
      setTimeout(() => reload(), 500);
    },
    [reload]
  );

  const vergleichLoeschen = useCallback((id: string) => {
    loescheVergleich(id);
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, vergleiche: prev.vergleiche.filter((v) => v.id !== id) };
    });
  }, []);

  const vergleichDuplizieren = useCallback(
    (id: string) => {
      const kopie = dupliziereVergleich(id);
      if (kopie) {
        setData((prev) => {
          if (!prev) return prev;
          return { ...prev, vergleiche: [...prev.vergleiche, kopie] };
        });
      }
      return kopie;
    },
    []
  );

  const vergleichArchivieren = useCallback((id: string, archiviert: boolean) => {
    archiviereVergleich(id, archiviert);
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        vergleiche: prev.vergleiche.map((v) =>
          v.id === id ? { ...v, archiviert } : v
        ),
      };
    });
  }, []);

  const baselineSpeichern = useCallback(
    (profil: BaselineProfil) => {
      speichereBaselineProfil(profil);
      setData((prev) => {
        if (!prev) return prev;
        const idx = prev.baselineProfile.findIndex((p) => p.id === profil.id);
        const profile =
          idx >= 0
            ? prev.baselineProfile.map((p, i) => (i === idx ? profil : p))
            : [...prev.baselineProfile, profil];
        return { ...prev, baselineProfile: profile };
      });
    },
    []
  );

  const aktiveBaselineSetzen = useCallback((id: string) => {
    setzeAktivesBaselineProfil(id);
    setData((prev) => (prev ? { ...prev, aktiveBaselineProfilId: id } : prev));
  }, []);

  const aktiveBaseline =
    data?.baselineProfile.find((p) => p.id === data.aktiveBaselineProfilId) ??
    data?.baselineProfile[0];

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
