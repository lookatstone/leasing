"use client";

import * as React from "react";
import Link from "next/link";
import {
  Car,
  Star,
  BarChart3,
  TrendingDown,
  AlertTriangle,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FitBadge } from "@/components/FitBadge";
import { BatterieBadge } from "@/components/BatterieBadge";
import { WarnListe } from "@/components/WarnBadge";
import { useAppData } from "@/hooks/useAppData";
import { useKmAuswahl, getRateForKm } from "@/hooks/useKmAuswahl";
import { KmAuswahlToggle } from "@/components/KmAuswahlToggle";
import { berechneAlleVergleichsergebnisse, berechneVergleichsergebnis } from "@/lib/calculations";
import { formatEuro, formatDatumZeit, formatDatum } from "@/lib/formatters";
import type { Angebot, BaselineProfil, Vergleichsergebnis } from "@/types";
import type { KmTier } from "@/hooks/useKmAuswahl";

export default function DashboardPage() {
  const { data, geladen, aktiveBaseline } = useAppData();
  const { kmAuswahl, setKm } = useKmAuswahl();

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
  const favoriten = data.angebote.filter((a) => a.status === "favorit");
  const aktiveVergleiche = data.vergleiche.filter((v) => !v.archiviert);

  const baseline = aktiveBaseline ?? data.baselineProfile[0];

  const ergebnisse = baseline
    ? berechneAlleVergleichsergebnisse(aktiveAngebote, baseline)
    : [];

  const sortNachKosten = [...aktiveAngebote].sort((a, b) => {
    const eA = ergebnisse.find((e) => e.angebotId === a.id)?.effektiveMonatlicheGesamtkosten ?? Infinity;
    const eB = ergebnisse.find((e) => e.angebotId === b.id)?.effektiveMonatlicheGesamtkosten ?? Infinity;
    return eA - eB;
  });

  const guenstigstes = sortNachKosten[0];
  const guenstStesErgebnis = guenstigstes
    ? ergebnisse.find((e) => e.angebotId === guenstigstes.id)
    : undefined;

  const schwachVergleichbar = ergebnisse.filter((e) => !e.vergleichbarMitBaseline).length;

  const letzteAenderungen = [...data.angebote]
    .sort((a, b) => new Date(b.aktualisiertAm).getTime() - new Date(a.aktualisiertAm).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Übersicht</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Aktives Profil:{" "}
            <span className="font-medium text-foreground">{baseline?.name ?? "–"}</span>
            {" · "}{baseline?.kmProJahr.toLocaleString("de-DE")} km/Jahr
            {" · "}mind. {baseline?.mindestLaufzeitMonate} Monate
            {" · "}mind. {baseline?.mindestBatterieKwh} kWh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <KmAuswahlToggle kmAuswahl={kmAuswahl} setKm={setKm} />
          <Button asChild>
            <Link href="/angebote/neu">
              <Plus className="h-4 w-4" />
              Angebot erfassen
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Car className="h-5 w-5 text-blue-600" />} label="Aktive Angebote" wert={aktiveAngebote.length.toString()} sub="gespeichert und aktiv" href="/angebote" />
        <StatCard icon={<Star className="h-5 w-5 text-yellow-500" />} label="Favoriten" wert={favoriten.length.toString()} sub="als Favorit markiert" href="/angebote" />
        <StatCard icon={<BarChart3 className="h-5 w-5 text-primary" />} label="Vergleiche" wert={aktiveVergleiche.length.toString()} sub="gespeicherte Vergleiche" href="/vergleiche" />
        <StatCard icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} label="Eingeschränkt" wert={schwachVergleichbar.toString()} sub="nicht direkt vergleichbar" href="/angebote" warn={schwachVergleichbar > 0} />
      </div>

      {guenstigstes && guenstStesErgebnis && baseline && (
        <div>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Günstigstes Angebot</h2>
          <Link href={`/angebote/${guenstigstes.id}`}>
            <Card className="cursor-pointer border-emerald-200 bg-emerald-50/30 transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-emerald-600" />
                      <h3 className="font-semibold">{guenstigstes.titel}</h3>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {guenstigstes.anbieter}{guenstigstes.portal ? ` · ${guenstigstes.portal}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    {(() => {
                      const rate = getRateForKm(guenstigstes, kmAuswahl);
                      return rate !== undefined ? (
                        <>
                          <p className="text-2xl font-bold text-emerald-700">
                            {formatEuro(rate)}
                            <span className="text-sm font-normal text-muted-foreground">/Monat</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{kmAuswahl / 1000} Tkm/Jahr</p>
                        </>
                      ) : (
                        <>
                          <p className="text-base font-medium text-muted-foreground">–</p>
                          <p className="text-xs text-muted-foreground">Keine Rate für {kmAuswahl / 1000} Tkm</p>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <BatterieBadge kwh={guenstigstes.fahrzeug.batteriekapazitaetKwh} baseline={baseline} />
                  <FitBadge bewertung={guenstStesErgebnis.bewertung.gesamtbewertung} erklaerung={guenstStesErgebnis.bewertung.erklaerung} size="sm" />
                  {(() => {
                    const k = guenstigstes.konditionen;
                    const brutto = guenstStesErgebnis.einmaligeKosten;
                    const foerderung = k.foerderungVomAnbieterEinkalkuliert === "nicht_eingerechnet" && k.foerderungHoeheEuro ? k.foerderungHoeheEuro : 0;
                    const netto = Math.max(0, brutto - foerderung);
                    if (brutto === 0) return null;
                    return (
                      <span className="text-sm text-muted-foreground">
                        Einmalig: <span className="font-medium text-foreground">{netto > 0 ? formatEuro(netto) : "–"}</span>
                      </span>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {favoriten.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Favoriten</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/angebote">Alle <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </div>
            <div className="space-y-2">
              {favoriten.map((a) => {
                const e = ergebnisse.find((r) => r.angebotId === a.id);
                return <AngebotZeile key={a.id} angebot={a} ergebnis={e} baseline={baseline} kmAuswahl={kmAuswahl} />;
              })}
            </div>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Zuletzt geändert</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/angebote">Alle <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="space-y-2">
            {letzteAenderungen.map((a) => <LetzteAenderungZeile key={a.id} angebot={a} />)}
            {letzteAenderungen.length === 0 && (
              <p className="text-sm text-muted-foreground">Noch keine Angebote erfasst.</p>
            )}
          </div>
        </div>
      </div>

      {aktiveVergleiche.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Gespeicherte Vergleiche</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/vergleiche">Alle <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {aktiveVergleiche.slice(0, 3).map((v) => (
              <Link key={v.id} href={`/vergleiche/${v.id}`}>
                <Card className="cursor-pointer transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{v.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">Referenz: {formatDatum(v.referenzdatum)}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{v.angebotIds.length} Angebote</span>
                    </div>
                    {v.beschreibung && <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{v.beschreibung}</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {aktiveAngebote.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Car className="h-10 w-10 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold">Noch keine Angebote</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">Erfasse dein erstes Leasingangebot, um den Vergleich zu starten.</p>
            <Button className="mt-4" asChild>
              <Link href="/angebote/neu"><Plus className="h-4 w-4" />Erstes Angebot erfassen</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, wert, sub, href, warn = false }: {
  icon: React.ReactNode; label: string; wert: string; sub: string; href: string; warn?: boolean;
}) {
  return (
    <Link href={href}>
      <Card className={`cursor-pointer transition-shadow hover:shadow-md ${warn && parseInt(wert) > 0 ? "border-amber-200" : ""}`}>
        <CardContent className="p-5">
          <div className="rounded-md bg-muted p-2 w-fit">{icon}</div>
          <div className="mt-3">
            <p className="text-2xl font-bold tracking-tight">{wert}</p>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AngebotZeile({ angebot, ergebnis, baseline, kmAuswahl }: {
  angebot: Angebot; ergebnis?: Vergleichsergebnis; baseline?: BaselineProfil; kmAuswahl: KmTier;
}) {
  const rate = getRateForKm(angebot, kmAuswahl);
  return (
    <Link href={`/angebote/${angebot.id}`}>
      <div className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 cursor-pointer">
        <div>
          <p className="text-sm font-medium">{angebot.titel}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <BatterieBadge kwh={angebot.fahrzeug.batteriekapazitaetKwh} baseline={baseline} className="text-[10px]" />
            <span className="text-xs text-muted-foreground">{angebot.konditionen.laufzeitMonate} Mo. · {(angebot.konditionen.kmProJahr / 1000).toFixed(0)}.000 km/J</span>
          </div>
        </div>
        <div className="text-right">
          {rate !== undefined ? (
            <p className="text-sm font-semibold">{formatEuro(rate)}/Mo.</p>
          ) : (
            <p className="text-sm text-muted-foreground">–</p>
          )}
          {ergebnis && <FitBadge bewertung={ergebnis.bewertung.gesamtbewertung} size="sm" />}
        </div>
      </div>
    </Link>
  );
}

function LetzteAenderungZeile({ angebot }: { angebot: Angebot }) {
  return (
    <Link href={`/angebote/${angebot.id}`}>
      <div className="flex items-center justify-between rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 cursor-pointer">
        <div>
          <p className="text-sm font-medium">{angebot.titel}</p>
          <p className="text-xs text-muted-foreground">{angebot.anbieter}</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDatumZeit(angebot.aktualisiertAm)}
        </div>
      </div>
    </Link>
  );
}
