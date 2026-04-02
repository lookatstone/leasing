"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  Car,
  ExternalLink,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BatterieBadge } from "@/components/BatterieBadge";
import { FitBadge } from "@/components/FitBadge";
import { WarnListe } from "@/components/WarnBadge";
import { AngebotStatusBadge } from "@/components/AngebotStatusBadge";
import { useAppData } from "@/hooks/useAppData";
import {
  berechneAlleVergleichsergebnisse,
} from "@/lib/calculations";
import {
  formatEuro,
  formatMonate,
  formatDatumZeit,
  labelAhk,
  labelVerfuegbarkeit,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type {
  Angebot,
  AngebotStatus,
  FahrzeugZustand,
  AnhaengerkupplungStatus,
  Verfuegbarkeit,
  Vergleichsergebnis,
  BaselineProfil,
} from "@/types";

// ─── Filter- und Sortier-Typen ────────────────────────────────────────────────

type StatusFilter = "alle" | AngebotStatus;
type ZustandFilter = "alle" | FahrzeugZustand;
type AhkFilter = "alle" | AnhaengerkupplungStatus;
type VerfuegbarkeitFilter = "alle" | Verfuegbarkeit;
type SortKey =
  | "monatsrate"
  | "effektiveGesamtkosten"
  | "batterie"
  | "erfasstAm";

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function sortierAngebote(
  angebote: Angebot[],
  ergebnisse: Vergleichsergebnis[],
  sortKey: SortKey
): Angebot[] {
  return [...angebote].sort((a, b) => {
    switch (sortKey) {
      case "monatsrate":
        return a.konditionen.monatsrate - b.konditionen.monatsrate;
      case "effektiveGesamtkosten": {
        const ea =
          ergebnisse.find((e) => e.angebotId === a.id)
            ?.effektiveMonatlicheGesamtkosten ?? Infinity;
        const eb =
          ergebnisse.find((e) => e.angebotId === b.id)
            ?.effektiveMonatlicheGesamtkosten ?? Infinity;
        return ea - eb;
      }
      case "batterie": {
        const ka = a.fahrzeug.batteriekapazitaetKwh ?? -1;
        const kb = b.fahrzeug.batteriekapazitaetKwh ?? -1;
        return kb - ka; // absteigend: größte Batterie zuerst
      }
      case "erfasstAm":
        return (
          new Date(b.erfasstAm).getTime() - new Date(a.erfasstAm).getTime()
        );
      default:
        return 0;
    }
  });
}

// ─── Kartenansicht ────────────────────────────────────────────────────────────

function AngebotKarte({
  angebot,
  ergebnis,
  baseline,
}: {
  angebot: Angebot;
  ergebnis?: Vergleichsergebnis;
  baseline?: BaselineProfil;
}) {
  return (
    <Link href={`/angebote/${angebot.id}`}>
      <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          {/* Kopfzeile */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold leading-snug">
                {angebot.titel}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {angebot.anbieter}
                {angebot.portal ? ` · ${angebot.portal}` : ""}
              </p>
            </div>
            <AngebotStatusBadge status={angebot.status} />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <BatterieBadge
              kwh={angebot.fahrzeug.batteriekapazitaetKwh}
              baseline={baseline}
            />
            {ergebnis && (
              <FitBadge
                bewertung={ergebnis.bewertung.gesamtbewertung}
                erklaerung={ergebnis.bewertung.erklaerung}
                size="sm"
              />
            )}
          </div>

          {/* Kosten */}
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">
                Monatsrate laut Angebot
              </p>
              <p className="text-sm font-medium">
                {formatEuro(angebot.konditionen.monatsrate)}/Monat
              </p>
            </div>
            {ergebnis && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  Effektive Gesamtkosten
                </p>
                <p className="text-base font-bold text-primary">
                  {formatEuro(ergebnis.effektiveMonatlicheGesamtkosten)}/Monat
                </p>
              </div>
            )}
          </div>

          {/* Laufzeit + km */}
          <p className="text-xs text-muted-foreground">
            {formatMonate(angebot.konditionen.laufzeitMonate)}
            {" · "}
            {(angebot.konditionen.kmProJahr / 1000).toFixed(0)}.000 km/Jahr
          </p>

          {/* Warnungen */}
          {ergebnis && ergebnis.warnungen.length > 0 && (
            <WarnListe warnungen={ergebnis.warnungen} maxAnzeigen={2} />
          )}

          {/* Externer Link */}
          {angebot.originalUrl && (
            <div className="mt-auto">
              <span
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(angebot.originalUrl, "_blank", "noopener");
                }}
              >
                <ExternalLink className="h-3 w-3" />
                Originalangebot
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// ─── Tabellenansicht ──────────────────────────────────────────────────────────

function AngebotTabelle({
  angebote,
  ergebnisse,
  baseline,
}: {
  angebote: Angebot[];
  ergebnisse: Vergleichsergebnis[];
  baseline?: BaselineProfil;
}) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 text-left">Angebot</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Monatsrate</th>
            <th className="px-4 py-3 text-right">Eff. Gesamtkosten/Mo.</th>
            <th className="px-4 py-3 text-left">Batterie</th>
            <th className="px-4 py-3 text-left">Laufzeit</th>
            <th className="px-4 py-3 text-right">km/Jahr</th>
            <th className="px-4 py-3 text-left">Verfügbarkeit</th>
            <th className="px-4 py-3 text-left">Fit</th>
            <th className="px-4 py-3 text-center">Erfasst</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {angebote.map((a) => {
            const e = ergebnisse.find((r) => r.angebotId === a.id);
            return (
              <tr
                key={a.id}
                className="transition-colors hover:bg-accent/40"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/angebote/${a.id}`}
                    className="block hover:underline"
                  >
                    <p className="font-medium">{a.titel}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.anbieter}
                      {a.portal ? ` · ${a.portal}` : ""}
                    </p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <AngebotStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatEuro(a.konditionen.monatsrate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {e
                    ? formatEuro(e.effektiveMonatlicheGesamtkosten)
                    : "–"}
                </td>
                <td className="px-4 py-3">
                  <BatterieBadge
                    kwh={a.fahrzeug.batteriekapazitaetKwh}
                    baseline={baseline}
                  />
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatMonate(a.konditionen.laufzeitMonate)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {(a.konditionen.kmProJahr / 1000).toFixed(0)}.000
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {labelVerfuegbarkeit(a.konditionen.verfuegbarkeit)}
                </td>
                <td className="px-4 py-3">
                  {e && (
                    <FitBadge
                      bewertung={e.bewertung.gesamtbewertung}
                      erklaerung={e.bewertung.erklaerung}
                      size="sm"
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                  {formatDatumZeit(a.erfasstAm)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Hauptseite ───────────────────────────────────────────────────────────────

export default function AngebotListePage() {
  const { data, geladen, aktiveBaseline } = useAppData();

  const [ansicht, setAnsicht] = useState<"karten" | "tabelle">("karten");
  const [suche, setSuche] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alle");
  const [zustandFilter, setZustandFilter] = useState<ZustandFilter>("alle");
  const [ahkFilter, setAhkFilter] = useState<AhkFilter>("alle");
  const [verfuegbarkeitFilter, setVerfuegbarkeitFilter] =
    useState<VerfuegbarkeitFilter>("alle");
  const [sortKey, setSortKey] = useState<SortKey>("erfasstAm");

  const baseline = aktiveBaseline ?? data?.baselineProfile[0];

  const ergebnisse = useMemo<Vergleichsergebnis[]>(() => {
    if (!data || !baseline) return [];
    return berechneAlleVergleichsergebnisse(data.angebote, baseline);
  }, [data, baseline]);

  const gefiltertUndSortiert = useMemo(() => {
    if (!data) return [];
    let liste = data.angebote;

    const suchBegriff = suche.trim().toLowerCase();
    if (suchBegriff) {
      liste = liste.filter(
        (a) =>
          a.titel.toLowerCase().includes(suchBegriff) ||
          a.anbieter.toLowerCase().includes(suchBegriff) ||
          a.fahrzeug.marke.toLowerCase().includes(suchBegriff) ||
          a.fahrzeug.modell.toLowerCase().includes(suchBegriff)
      );
    }

    if (statusFilter !== "alle") {
      liste = liste.filter((a) => a.status === statusFilter);
    }
    if (zustandFilter !== "alle") {
      liste = liste.filter(
        (a) => a.fahrzeug.neuOderGebraucht === zustandFilter
      );
    }
    if (ahkFilter !== "alle") {
      liste = liste.filter(
        (a) => a.fahrzeug.anhaengerkupplung === ahkFilter
      );
    }
    if (verfuegbarkeitFilter !== "alle") {
      liste = liste.filter(
        (a) => a.konditionen.verfuegbarkeit === verfuegbarkeitFilter
      );
    }

    return sortierAngebote(liste, ergebnisse, sortKey);
  }, [
    data,
    suche,
    statusFilter,
    zustandFilter,
    ahkFilter,
    verfuegbarkeitFilter,
    sortKey,
    ergebnisse,
  ]);

  if (!geladen || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Daten werden geladen …
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Seitenkopf ────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Angebote</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {data.angebote.length}{" "}
            {data.angebote.length === 1 ? "Angebot" : "Angebote"} gespeichert
            {gefiltertUndSortiert.length !== data.angebote.length &&
              ` · ${gefiltertUndSortiert.length} angezeigt`}
          </p>
        </div>
        <Button asChild>
          <Link href="/angebote/neu">
            <Plus className="h-4 w-4" />
            Neues Angebot
          </Link>
        </Button>
      </div>

      {/* ── Suche + Toolbar ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Nach Titel, Anbieter, Marke oder Modell suchen …"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status */}
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Status</SelectItem>
              <SelectItem value="favorit">Favorit</SelectItem>
              <SelectItem value="aktiv">Aktiv</SelectItem>
              <SelectItem value="verworfen">Verworfen</SelectItem>
              <SelectItem value="archiviert">Archiviert</SelectItem>
            </SelectContent>
          </Select>

          {/* Zustand */}
          <Select
            value={zustandFilter}
            onValueChange={(v) => setZustandFilter(v as ZustandFilter)}
          >
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="Zustand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Neu & Gebraucht</SelectItem>
              <SelectItem value="neu">Nur Neuwagen</SelectItem>
              <SelectItem value="gebraucht">Nur Gebrauchwagen</SelectItem>
            </SelectContent>
          </Select>

          {/* AHK */}
          <Select
            value={ahkFilter}
            onValueChange={(v) => setAhkFilter(v as AhkFilter)}
          >
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
              <SelectValue placeholder="AHK" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle AHK-Status</SelectItem>
              <SelectItem value="ja">AHK vorhanden</SelectItem>
              <SelectItem value="optional">AHK optional</SelectItem>
              <SelectItem value="nein">Keine AHK</SelectItem>
              <SelectItem value="unbekannt">AHK unbekannt</SelectItem>
            </SelectContent>
          </Select>

          {/* Verfügbarkeit */}
          <Select
            value={verfuegbarkeitFilter}
            onValueChange={(v) =>
              setVerfuegbarkeitFilter(v as VerfuegbarkeitFilter)
            }
          >
            <SelectTrigger className="h-8 w-auto min-w-[150px] text-xs">
              <SelectValue placeholder="Verfügbarkeit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Verfügbarkeiten</SelectItem>
              <SelectItem value="sofort">Sofort</SelectItem>
              <SelectItem value="kurz">Kurzfristig</SelectItem>
              <SelectItem value="mittel">Mittelfristig</SelectItem>
              <SelectItem value="lang">Langfristig</SelectItem>
              <SelectItem value="unbekannt">Unbekannt</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-6" />

          {/* Sortierung */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <Select
              value={sortKey}
              onValueChange={(v) => setSortKey(v as SortKey)}
            >
              <SelectTrigger className="h-8 w-auto min-w-[180px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="erfasstAm">Erfassungsdatum (neu)</SelectItem>
                <SelectItem value="monatsrate">Monatsrate (günstig)</SelectItem>
                <SelectItem value="effektiveGesamtkosten">
                  Effektive Gesamtkosten (günstig)
                </SelectItem>
                <SelectItem value="batterie">Batterie (groß)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <Button
              variant={ansicht === "karten" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setAnsicht("karten")}
              title="Kartenansicht"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={ansicht === "tabelle" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setAnsicht("tabelle")}
              title="Tabellenansicht"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Inhalt ────────────────────────────────────────────────────────── */}
      {gefiltertUndSortiert.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Car className="mb-4 h-10 w-10 text-muted-foreground/40" />
            {data.angebote.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold">
                  Noch keine Angebote erfasst
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Erfasse dein erstes Leasingangebot, um den Vergleich zu
                  starten.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/angebote/neu">
                    <Plus className="h-4 w-4" />
                    Erstes Angebot erfassen
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">
                  Keine Treffer gefunden
                </h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Passe die Suche oder die Filter an, um Angebote anzuzeigen.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSuche("");
                    setStatusFilter("alle");
                    setZustandFilter("alle");
                    setAhkFilter("alle");
                    setVerfuegbarkeitFilter("alle");
                  }}
                >
                  Filter zurücksetzen
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : ansicht === "karten" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gefiltertUndSortiert.map((a) => (
            <AngebotKarte
              key={a.id}
              angebot={a}
              ergebnis={ergebnisse.find((e) => e.angebotId === a.id)}
              baseline={baseline}
            />
          ))}
        </div>
      ) : (
        <AngebotTabelle
          angebote={gefiltertUndSortiert}
          ergebnisse={ergebnisse}
          baseline={baseline}
        />
      )}
    </div>
  );
}
