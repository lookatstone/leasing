"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AngebotFormular } from "@/components/AngebotFormular";
import { useAppData } from "@/hooks/useAppData";
import type { Angebot } from "@/types";

export default function AngebotBearbeitenPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, geladen, angebotSpeichern } = useAppData();

  if (!geladen || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Daten werden geladen …
      </div>
    );
  }

  const angebot = data.angebote.find((a) => a.id === id);

  if (!angebot) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-lg font-semibold">Angebot nicht gefunden</p>
        <p className="text-sm text-muted-foreground">
          Das gesuchte Angebot existiert nicht oder wurde gelöscht.
        </p>
        <Button asChild variant="outline">
          <Link href="/angebote">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Übersicht
          </Link>
        </Button>
      </div>
    );
  }

  function handleSpeichern(a: Angebot) {
    angebotSpeichern(a);
    router.push(`/angebote/${a.id}`);
  }

  function handleAbbrechen() {
    router.push(`/angebote/${id}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
          <Link href={`/angebote/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            Zurück zum Angebot
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          Angebot bearbeiten
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {angebot.titel} · {angebot.anbieter}
        </p>
      </div>

      <AngebotFormular
        angebot={angebot}
        onSpeichern={handleSpeichern}
        onAbbrechen={handleAbbrechen}
        modus="bearbeiten"
      />
    </div>
  );
}
