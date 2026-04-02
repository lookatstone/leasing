"use client";

import * as React from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AngebotFormular } from "@/components/AngebotFormular";
import { useAppData } from "@/hooks/useAppData";
import type { Angebot } from "@/types";

function leeresFahrzeug(): Angebot["fahrzeug"] {
  return {
    marke: "",
    modell: "",
    neuOderGebraucht: "neu",
    anhaengerkupplung: "unbekannt",
    sonderausstattung: [],
  };
}

function leeresKonditionen(): Angebot["konditionen"] {
  return {
    monatsrate: 0,
    laufzeitMonate: 36,
    kmProJahr: 15000,
    sonderzahlung: 0,
    ueberfuehrungskosten: 0,
    zulassungskosten: 0,
    foerderungVomAnbieterEinkalkuliert: "unklar",
    gapEnthalten: "unklar",
    verfuegbarkeit: "unbekannt",
  };
}

function leeresLaufendeKosten(): Angebot["laufendeKosten"] {
  return {
    kfzSteuerProJahr: 0,
  };
}

export default function NeuesAngebotPage() {
  const router = useRouter();
  const { angebotSpeichern, neuesAngebotId } = useAppData();

  const id = useMemo(() => neuesAngebotId(), [neuesAngebotId]);

  const now = new Date().toISOString();

  const leereAngebot: Angebot = {
    id,
    titel: "",
    anbieter: "",
    status: "aktiv",
    erfasstAm: now,
    erstelltAm: now,
    aktualisiertAm: now,
    fahrzeug: leeresFahrzeug(),
    konditionen: leeresKonditionen(),
    laufendeKosten: leeresLaufendeKosten(),
  };

  function handleSpeichern(a: Angebot) {
    angebotSpeichern(a);
    router.push(`/angebote/${a.id}`);
  }

  function handleAbbrechen() {
    router.push("/angebote");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Neues Angebot erfassen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fülle das Formular aus, um ein neues Leasingangebot zu speichern.
          Pflichtfelder sind mit * markiert.
        </p>
      </div>
      <AngebotFormular
        angebot={leereAngebot}
        onSpeichern={handleSpeichern}
        onAbbrechen={handleAbbrechen}
        modus="neu"
      />
    </div>
  );
}
