"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/hooks/useAppData";
import { generiereId } from "@/lib/storage";
import type { Vergleich } from "@/types";

export default function NeuerVergleichPage() {
  const router = useRouter();
  const { data, geladen, vergleichSpeichern, aktiveBaseline } = useAppData();

  const heute = new Date().toISOString().split("T")[0];

  const [name, setName] = React.useState("");
  const [referenzdatum, setReferenzdatum] = React.useState(heute);
  const [beschreibung, setBeschreibung] = React.useState("");
  const [ausgewaehlteIds, setAusgewaehlteIds] = React.useState<string[]>([]);
  const [fehler, setFehler] = React.useState<Record<string, string>>({});

  if (!geladen || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Daten werden geladen …
      </div>
    );
  }

  const aktiveAngebote = data.angebote.filter(
    (a) => a.status === "aktiv" || a.status === "favorit"
  );

  const toggleAngebot = (id: string) => {
    setAusgewaehlteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSpeichern = () => {
    const neuerFehler: Record<string, string> = {};
    if (!name.trim()) neuerFehler.name = "Name ist erforderlich";
    if (!referenzdatum) neuerFehler.referenzdatum = "Referenzdatum ist erforderlich";
    if (ausgewaehlteIds.length < 1)
      neuerFehler.angebote = "Mindestens ein Angebot auswählen";

    if (Object.keys(neuerFehler).length > 0) {
      setFehler(neuerFehler);
      return;
    }

    const vergleich: Vergleich = {
      id: generiereId(),
      name: name.trim(),
      referenzdatum,
      beschreibung: beschreibung.trim() || undefined,
      baselineProfilId:
        aktiveBaseline?.id ?? data.baselineProfile[0]?.id ?? "",
      angebotIds: ausgewaehlteIds,
      erstelltAm: new Date().toISOString(),
      aktualisiertAm: new Date().toISOString(),
      archiviert: false,
    };

    vergleichSpeichern(vergleich);
    router.push(`/vergleiche/${vergleich.id}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vergleiche">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Neuer Vergleich
          </h1>
          <p className="text-sm text-muted-foreground">
            Wähle Angebote und vergib einen Namen mit Referenzdatum
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vergleich benennen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="z. B. Julia April 2026, Favoriten Runde 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Ein aussagekräftiger Name hilft beim späteren Wiederfinden.
            </p>
            {fehler.name && (
              <p className="text-xs text-destructive">{fehler.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="referenzdatum">
              Referenzdatum <span className="text-destructive">*</span>
            </Label>
            <Input
              id="referenzdatum"
              type="date"
              value={referenzdatum}
              onChange={(e) => setReferenzdatum(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Das Datum, zu dem die Angebotsdaten erhoben wurden. Wichtig für
              die spätere Nachvollziehbarkeit.
            </p>
            {fehler.referenzdatum && (
              <p className="text-xs text-destructive">{fehler.referenzdatum}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="beschreibung">Beschreibung (optional)</Label>
            <Textarea
              id="beschreibung"
              placeholder="z. B. Fokus auf SUVs über 70 kWh, erste Auswahl vor finalem Entscheid"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Angebote auswählen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {aktiveAngebote.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Keine aktiven Angebote vorhanden. Zuerst Angebote erfassen.
            </p>
          )}
          {aktiveAngebote.map((a) => {
            const ausgewaehlt = ausgewaehlteIds.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggleAngebot(a.id)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  ausgewaehlt
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.titel}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.anbieter} ·{" "}
                      {a.konditionen.monatsrate.toLocaleString("de-DE")} €/Mo. ·{" "}
                      {a.konditionen.laufzeitMonate} Monate ·{" "}
                      {a.fahrzeug.batteriekapazitaetKwh ?? "?"} kWh
                    </p>
                  </div>
                  <div
                    className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                      ausgewaehlt
                        ? "border-primary bg-primary"
                        : "border-muted-foreground"
                    }`}
                  >
                    {ausgewaehlt && (
                      <svg
                        className="h-2.5 w-2.5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          {fehler.angebote && (
            <p className="text-xs text-destructive">{fehler.angebote}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" asChild>
          <Link href="/vergleiche">Abbrechen</Link>
        </Button>
        <Button onClick={handleSpeichern}>
          Vergleich erstellen ({ausgewaehlteIds.length} Angebote)
        </Button>
      </div>
    </div>
  );
}
