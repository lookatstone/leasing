"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  CheckCircle,
  Star,
  XCircle,
  Archive,
  Ban,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BatterieBadge } from "@/components/BatterieBadge";
import { FitBadge } from "@/components/FitBadge";
import { WarnListe } from "@/components/WarnBadge";
import { AngebotStatusBadge } from "@/components/AngebotStatusBadge";
import { KostenBreakdownCard } from "@/components/KostenBreakdownCard";
import { useAppData } from "@/hooks/useAppData";
import { berechneVergleichsergebnis } from "@/lib/calculations";
import {
  formatEuro,
  formatKm,
  formatKwh,
  formatMonate,
  formatDatum,
  formatDatumZeit,
  labelFahrzeugZustand,
  labelFoerderungStatus,
  labelGapStatus,
  labelAhk,
  labelVerfuegbarkeit,
  labelFitBewertung,
} from "@/lib/formatters";
import type { AngebotStatus } from "@/types";

// ─── Hilfskomponenten ─────────────────────────────────────────────────────────

function DatenZeile({
  label,
  wert,
}: {
  label: string;
  wert: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="min-w-0 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <span className="min-w-0 text-right text-sm font-medium">{wert}</span>
    </div>
  );
}

function DatenGruppe({
  titel,
  children,
}: {
  titel: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {titel}
      </h3>
      <div className="divide-y rounded-md border bg-card px-4">
        {children}
      </div>
    </div>
  );
}

// ─── Hauptseite ───────────────────────────────────────────────────────────────

export default function AngebotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const { data, geladen, aktiveBaseline, angebotSpeichern, angebotLoeschen } =
    useAppData();

  const [loeschDialogOffen, setLoeschDialogOffen] = useState(false);
  const [statusDialogOffen, setStatusDialogOffen] = useState(false);
  const [neuerStatus, setNeuerStatus] = useState<AngebotStatus>("aktiv");

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

  const baseline = aktiveBaseline ?? data.baselineProfile[0];
  const ergebnis = baseline
    ? berechneVergleichsergebnis(angebot, baseline, data.angebote)
    : null;

  function handleLoeschen() {
    angebotLoeschen(id);
    router.push("/angebote");
  }

  function handleStatusAendern() {
    angebotSpeichern({ ...angebot!, status: neuerStatus });
    setStatusDialogOffen(false);
  }

  const k = angebot.konditionen;
  const f = angebot.fahrzeug;
  const lk = angebot.laufendeKosten;

  return (
    <div className="space-y-8">
      {/* ── Kopfzeile ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" asChild className="-ml-2 mb-1">
            <Link href="/angebote">
              <ArrowLeft className="h-4 w-4" />
              Alle Angebote
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {angebot.titel}
            </h1>
            <AngebotStatusBadge status={angebot.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {angebot.anbieter}
            {angebot.portal ? ` · ${angebot.portal}` : ""}
            {angebot.angebotsdatum
              ? ` · Angebotsdatum: ${formatDatum(angebot.angebotsdatum)}`
              : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status ändern */}
          <Dialog
            open={statusDialogOffen}
            onOpenChange={setStatusDialogOffen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNeuerStatus(angebot.status)}
              >
                <CheckCircle className="h-4 w-4" />
                Status ändern
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Status ändern</DialogTitle>
                <DialogDescription>
                  Wähle den neuen Status für dieses Angebot.
                </DialogDescription>
              </DialogHeader>
              <Select
                value={neuerStatus}
                onValueChange={(v) => setNeuerStatus(v as AngebotStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktiv">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
                      Aktiv
                    </span>
                  </SelectItem>
                  <SelectItem value="favorit">
                    <span className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-yellow-500" />
                      Favorit
                    </span>
                  </SelectItem>
                  <SelectItem value="verworfen">
                    <span className="flex items-center gap-2">
                      <XCircle className="h-3.5 w-3.5 text-gray-400" />
                      Verworfen
                    </span>
                  </SelectItem>
                  <SelectItem value="archiviert">
                    <span className="flex items-center gap-2">
                      <Archive className="h-3.5 w-3.5 text-gray-400" />
                      Archiviert
                    </span>
                  </SelectItem>
                  <SelectItem value="nicht_verfuegbar">
                    <span className="flex items-center gap-2">
                      <Ban className="h-3.5 w-3.5 text-red-500" />
                      Nicht verfügbar
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setStatusDialogOffen(false)}
                >
                  Abbrechen
                </Button>
                <Button onClick={handleStatusAendern}>Speichern</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bearbeiten */}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/angebote/${id}/bearbeiten`}>
              <Edit className="h-4 w-4" />
              Bearbeiten
            </Link>
          </Button>

          {/* Löschen */}
          <Dialog
            open={loeschDialogOffen}
            onOpenChange={setLoeschDialogOffen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
                Löschen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Angebot löschen</DialogTitle>
                <DialogDescription>
                  Möchtest du das Angebot{" "}
                  <strong>&quot;{angebot.titel}&quot;</strong> unwiderruflich
                  löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setLoeschDialogOffen(false)}
                >
                  Abbrechen
                </Button>
                <Button variant="destructive" onClick={handleLoeschen}>
                  Endgültig löschen
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ── Fahrzeugfoto ──────────────────────────────────────────────────── */}
      {angebot.fahrzeug.fotoUrl && (
        <div className="overflow-hidden rounded-xl border">
          <img
            src={angebot.fahrzeug.fotoUrl}
            alt={angebot.titel}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      )}

      {/* ── Bewertungsleiste ──────────────────────────────────────────────── */}
      {ergebnis && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-4">
          <BatterieBadge
            kwh={f.batteriekapazitaetKwh}
            baseline={baseline}
          />
          <FitBadge
            bewertung={ergebnis.bewertung.gesamtbewertung}
            erklaerung={ergebnis.bewertung.erklaerung}
          />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm">
            <span className="font-semibold">
              {formatEuro(ergebnis.effektiveMonatlicheGesamtkosten)}/Monat
            </span>
            <span className="ml-1 text-muted-foreground">
              effektive Gesamtkosten
            </span>
          </span>
          {angebot.originalUrl && (
            <a
              href={angebot.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Originalangebot öffnen
            </a>
          )}
        </div>
      )}

      {/* ── Warnungen ─────────────────────────────────────────────────────── */}
      {ergebnis && ergebnis.warnungen.length > 0 && (
        <div>
          <h2 className="mb-3 text-base font-semibold tracking-tight">
            Warnungen & Hinweise
          </h2>
          <WarnListe warnungen={ergebnis.warnungen} />
        </div>
      )}

      {/* ── Kostenaufschlüsselung ─────────────────────────────────────────── */}
      {ergebnis && (
        <div>
          <h2 className="mb-3 text-base font-semibold tracking-tight">
            Kostenaufschlüsselung
          </h2>
          <KostenBreakdownCard angebot={angebot} ergebnis={ergebnis} />
        </div>
      )}

      {/* ── Fit-Bewertung Erklärung ───────────────────────────────────────── */}
      {ergebnis && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Fit-Bewertung</CardTitle>
              <FitBadge
                bewertung={ergebnis.bewertung.gesamtbewertung}
                size="sm"
              />
            </div>
            <CardDescription>{ergebnis.bewertung.erklaerung}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(
                [
                  {
                    label: "Kosten",
                    wert: ergebnis.bewertung.kostenBewertung,
                  },
                  {
                    label: "Batteriefit",
                    wert: ergebnis.bewertung.batteriefit,
                  },
                  {
                    label: "Vergleichbarkeit",
                    wert: ergebnis.bewertung.vergleichbarkeit,
                  },
                ] as const
              ).map(({ label, wert }) => (
                <div
                  key={label}
                  className="flex flex-col gap-1 rounded-md border p-3"
                >
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <FitBadge bewertung={wert} size="sm" />
                </div>
              ))}
              <div className="flex flex-col gap-1 rounded-md border p-3">
                <span className="text-xs text-muted-foreground">
                  Transparenz-Score
                </span>
                <span className="text-sm font-semibold">
                  {ergebnis.bewertung.transparenzScore} / 100
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Stammdaten ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fahrzeug */}
        <DatenGruppe titel="Fahrzeug">
          <DatenZeile label="Marke" wert={f.marke} />
          <DatenZeile label="Modell" wert={f.modell} />
          {f.variante && <DatenZeile label="Variante" wert={f.variante} />}
          <DatenZeile
            label="Zustand"
            wert={labelFahrzeugZustand(f.neuOderGebraucht)}
          />
          {f.erstzulassung && (
            <DatenZeile
              label="Erstzulassung"
              wert={formatDatum(f.erstzulassung)}
            />
          )}
          {f.kilometerstand !== undefined && (
            <DatenZeile
              label="Kilometerstand"
              wert={formatKm(f.kilometerstand)}
            />
          )}
          {f.batteriekapazitaetKwh !== undefined && (
            <DatenZeile
              label="Batterie"
              wert={
                <BatterieBadge
                  kwh={f.batteriekapazitaetKwh}
                  baseline={baseline}
                />
              }
            />
          )}
          {f.leistungKw !== undefined && (
            <DatenZeile label="Leistung" wert={`${f.leistungKw} kW`} />
          )}
          {f.wltpReichweiteKm !== undefined && (
            <DatenZeile
              label="WLTP-Reichweite"
              wert={formatKm(f.wltpReichweiteKm)}
            />
          )}
          <DatenZeile label="AHK" wert={labelAhk(f.anhaengerkupplung)} />
          {f.farbe && <DatenZeile label="Farbe" wert={f.farbe} />}
          {f.sonderausstattung.length > 0 && (
            <DatenZeile
              label="Sonderausstattung"
              wert={
                <span className="text-right">
                  {f.sonderausstattung.join(", ")}
                </span>
              }
            />
          )}
        </DatenGruppe>

        {/* Konditionen */}
        <DatenGruppe titel="Leasingkonditionen">
          <DatenZeile
            label="Monatsrate"
            wert={`${formatEuro(k.monatsrate)}/Monat`}
          />
          <DatenZeile
            label="Laufzeit"
            wert={formatMonate(k.laufzeitMonate)}
          />
          <DatenZeile
            label="Freikilometer"
            wert={`${(k.kmProJahr / 1000).toFixed(0)}.000 km/Jahr`}
          />
          <DatenZeile label="Sonderzahlung" wert={formatEuro(k.sonderzahlung)} />
          <DatenZeile
            label="Überführungskosten"
            wert={
              k.ueberfuehrungskosten > 0
                ? formatEuro(k.ueberfuehrungskosten)
                : "Nicht angegeben"
            }
          />
          <DatenZeile
            label="Zulassungskosten"
            wert={formatEuro(k.zulassungskosten)}
          />
          <DatenZeile
            label="Förderung"
            wert={labelFoerderungStatus(k.foerderungVomAnbieterEinkalkuliert)}
          />
          {k.foerderungHoeheEuro !== undefined && (
            <DatenZeile
              label="Förderhöhe"
              wert={formatEuro(k.foerderungHoeheEuro)}
            />
          )}
          <DatenZeile label="GAP" wert={labelGapStatus(k.gapEnthalten)} />
          <DatenZeile
            label="Verfügbarkeit"
            wert={labelVerfuegbarkeit(k.verfuegbarkeit)}
          />
          {k.spezielleBedingungen && (
            <DatenZeile
              label="Besondere Bedingungen"
              wert={
                <span className="text-right">{k.spezielleBedingungen}</span>
              }
            />
          )}
        </DatenGruppe>

        {/* Betriebskosten */}
        <DatenGruppe titel="Betriebskosten pro Jahr">
          <DatenZeile
            label="Versicherung"
            wert={
              lk.versicherungProJahr
                ? `${formatEuro(lk.versicherungProJahr)}/Jahr${lk.versicherungsannahmeText ? ` (${lk.versicherungsannahmeText})` : ""}`
                : "Nicht angegeben"
            }
          />
          <DatenZeile
            label="KFZ-Steuer"
            wert={`${formatEuro(lk.kfzSteuerProJahr)}/Jahr`}
          />
          <DatenZeile
            label="Ladekosten"
            wert={
              lk.ladekostenProJahr
                ? `${formatEuro(lk.ladekostenProJahr)}/Jahr`
                : "Nicht angegeben"
            }
          />
          <DatenZeile
            label="Wartung"
            wert={
              lk.wartungProJahr
                ? `${formatEuro(lk.wartungProJahr)}/Jahr`
                : "Nicht angegeben"
            }
          />
          <DatenZeile
            label="Reifen"
            wert={
              lk.reifenProJahr
                ? `${formatEuro(lk.reifenProJahr)}/Jahr`
                : "Nicht angegeben"
            }
          />
          {lk.wallboxKostenMonatlich !== undefined && (
            <DatenZeile
              label="Wallbox"
              wert={`${formatEuro(lk.wallboxKostenMonatlich)}/Monat`}
            />
          )}
          {lk.sonstigeKostenProJahr !== undefined && (
            <DatenZeile
              label="Sonstiges"
              wert={`${formatEuro(lk.sonstigeKostenProJahr)}/Jahr`}
            />
          )}
        </DatenGruppe>

        {/* Meta */}
        <DatenGruppe titel="Metadaten">
          <DatenZeile label="ID" wert={<span className="font-mono text-xs">{angebot.id}</span>} />
          <DatenZeile
            label="Erfasst am"
            wert={formatDatumZeit(angebot.erfasstAm)}
          />
          <DatenZeile
            label="Zuletzt geändert"
            wert={formatDatumZeit(angebot.aktualisiertAm)}
          />
          {angebot.originalUrl && (
            <DatenZeile
              label="Originalangebot"
              wert={
                <a
                  href={angebot.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Link öffnen
                </a>
              }
            />
          )}
        </DatenGruppe>
      </div>

      {/* ── Notizen ───────────────────────────────────────────────────────── */}
      {angebot.notizen && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {angebot.notizen}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
