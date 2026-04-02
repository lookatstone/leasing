"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Edit,
  Trash2,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { FitBadge } from "@/components/FitBadge";
import { BatterieBadge } from "@/components/BatterieBadge";
import { WarnListe } from "@/components/WarnBadge";
import { KostenBreakdownCard } from "@/components/KostenBreakdownCard";
import { useAppData } from "@/hooks/useAppData";
import { berechneAlleVergleichsergebnisse } from "@/lib/calculations";
import {
  formatEuro,
  formatDatum,
  formatDatumZeit,
  labelAhk,
  labelVerfuegbarkeit,
  labelFoerderungStatus,
  labelGapStatus,
} from "@/lib/formatters";
import type { Angebot, Vergleichsergebnis, BaselineProfil } from "@/types";

export default function VergleichDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    data,
    geladen,
    vergleichLoeschen,
    vergleichArchivieren,
    vergleichSpeichern,
    aktiveBaseline,
  } = useAppData();

  const [loeschenOffen, setLoeschenOffen] = React.useState(false);
  const [bearbeitenOffen, setBearbeitenOffen] = React.useState(false);
  const [angeboteHinzuOffen, setAngeboteHinzuOffen] = React.useState(false);

  if (!geladen || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Daten werden geladen …
      </div>
    );
  }

  const vergleich = data.vergleiche.find((v) => v.id === id);
  if (!vergleich) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Vergleich nicht gefunden.</p>
        <Button className="mt-4" asChild>
          <Link href="/vergleiche">Zurück zur Liste</Link>
        </Button>
      </div>
    );
  }

  const baseline =
    data.baselineProfile.find((p) => p.id === vergleich.baselineProfilId) ??
    aktiveBaseline ??
    data.baselineProfile[0];

  const angeboteImVergleich = data.angebote.filter((a) =>
    vergleich.angebotIds.includes(a.id)
  );

  const ergebnisse = baseline
    ? berechneAlleVergleichsergebnisse(angeboteImVergleich, baseline)
    : [];

  // Sortiert nach effektiven Gesamtkosten
  const sortiert = [...angeboteImVergleich].sort((a, b) => {
    const eA =
      ergebnisse.find((e) => e.angebotId === a.id)
        ?.effektiveMonatlicheGesamtkosten ?? Infinity;
    const eB =
      ergebnisse.find((e) => e.angebotId === b.id)
        ?.effektiveMonatlicheGesamtkosten ?? Infinity;
    return eA - eB;
  });

  const guenstigstesId = sortiert[0]?.id;

  const handleLoeschen = () => {
    vergleichLoeschen(id);
    router.push("/vergleiche");
  };

  const handleAngebotEntfernen = (angebotId: string) => {
    vergleichSpeichern({
      ...vergleich,
      angebotIds: vergleich.angebotIds.filter((aid) => aid !== angebotId),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/vergleiche">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {vergleich.name}
            </h1>
            {vergleich.beschreibung && (
              <p className="mt-1 text-sm text-muted-foreground">
                {vergleich.beschreibung}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => vergleichArchivieren(id, !vergleich.archiviert)}
          >
            {vergleich.archiviert ? (
              <><ArchiveRestore className="h-4 w-4" />Aktivieren</>
            ) : (
              <><Archive className="h-4 w-4" />Archivieren</>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setBearbeitenOffen(true)}
          >
            <Edit className="h-4 w-4" />
            Bearbeiten
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setLoeschenOffen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Referenzdatum – prominent */}
      <div className="flex flex-wrap items-center gap-6 rounded-lg border bg-muted/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              Referenzdatum
            </p>
            <p className="text-base font-semibold">
              {formatDatum(vergleich.referenzdatum, "lang")}
            </p>
          </div>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Baseline-Profil
          </p>
          <p className="text-sm font-medium">{baseline?.name ?? "–"}</p>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Angebote
          </p>
          <p className="text-sm font-medium">
            {angeboteImVergleich.length} im Vergleich
          </p>
        </div>
        <Separator orientation="vertical" className="h-10" />
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Zuletzt geändert
          </p>
          <p className="text-sm">{formatDatumZeit(vergleich.aktualisiertAm)}</p>
        </div>
      </div>

      {/* Vergleichstabelle */}
      {angeboteImVergleich.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Keine Angebote in diesem Vergleich.
            </p>
            <Button
              className="mt-3"
              variant="outline"
              onClick={() => setAngeboteHinzuOffen(true)}
            >
              <Plus className="h-4 w-4" />
              Angebote hinzufügen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Zusammenfassungstabelle */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">
                Direktvergleich
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAngeboteHinzuOffen(true)}
              >
                <Plus className="h-4 w-4" />
                Angebot hinzufügen
              </Button>
            </div>
            <VergleichsTabelle
              angebote={sortiert}
              ergebnisse={ergebnisse}
              baseline={baseline}
              guenstigstesId={guenstigstesId}
              onEntfernen={handleAngebotEntfernen}
            />
          </div>

          {/* Detailkarten */}
          <div>
            <h2 className="mb-4 text-lg font-semibold tracking-tight">
              Kostenaufschlüsselung
            </h2>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {sortiert.map((a) => {
                const e = ergebnisse.find((r) => r.angebotId === a.id);
                if (!e) return null;
                return (
                  <div key={a.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/angebote/${a.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {a.titel}
                      </Link>
                      {a.id === guenstigstesId && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Günstigster
                        </span>
                      )}
                    </div>
                    <KostenBreakdownCard
                      angebot={a}
                      ergebnis={e}
                      hervorheben={a.id === guenstigstesId}
                    />
                    <WarnListe warnungen={e.warnungen} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Löschen-Dialog */}
      <Dialog open={loeschenOffen} onOpenChange={setLoeschenOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vergleich löschen?</DialogTitle>
            <DialogDescription>
              &bdquo;{vergleich.name}&ldquo; wird unwiderruflich gelöscht. Die
              enthaltenen Angebote bleiben erhalten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoeschenOffen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleLoeschen}>
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bearbeiten-Dialog */}
      <BearbeitenDialog
        offen={bearbeitenOffen}
        onClose={() => setBearbeitenOffen(false)}
        vergleich={vergleich}
        onSpeichern={(aktualisiert) => {
          vergleichSpeichern(aktualisiert);
          setBearbeitenOffen(false);
        }}
      />

      {/* Angebote hinzufügen Dialog */}
      <AngeboteHinzufuegenDialog
        offen={angeboteHinzuOffen}
        onClose={() => setAngeboteHinzuOffen(false)}
        vergleich={vergleich}
        alleAngebote={data.angebote}
        onSpeichern={(ids) => {
          vergleichSpeichern({ ...vergleich, angebotIds: ids });
          setAngeboteHinzuOffen(false);
        }}
      />
    </div>
  );
}

// ─── Vergleichstabelle ────────────────────────────────────────────────────────

function VergleichsTabelle({
  angebote,
  ergebnisse,
  baseline,
  guenstigstesId,
  onEntfernen,
}: {
  angebote: Angebot[];
  ergebnisse: Vergleichsergebnis[];
  baseline?: BaselineProfil;
  guenstigstesId?: string;
  onEntfernen: (id: string) => void;
}) {
  const felder: Array<{
    label: string;
    render: (a: Angebot, e?: Vergleichsergebnis) => React.ReactNode;
  }> = [
    {
      label: "Monatsrate (Angebot)",
      render: (a) => (
        <span className="font-medium">{formatEuro(a.konditionen.monatsrate)}/Mo.</span>
      ),
    },
    {
      label: "Effektive Leasingkosten",
      render: (_, e) =>
        e ? (
          <span className="font-semibold text-primary">
            {formatEuro(e.effektiveMonatlicheLeasingkosten)}/Mo.
          </span>
        ) : "–",
    },
    {
      label: "Effektive Gesamtkosten",
      render: (a, e) =>
        e ? (
          <span className={`font-bold ${a.id === guenstigstesId ? "text-emerald-700" : ""}`}>
            {formatEuro(e.effektiveMonatlicheGesamtkosten)}/Mo.
          </span>
        ) : "–",
    },
    {
      label: "Gesamtkosten Laufzeit",
      render: (_, e) => (e ? formatEuro(e.gesamtkostenUeberLaufzeit) : "–"),
    },
    {
      label: "Kosten pro km",
      render: (_, e) =>
        e && e.kostenProKm > 0
          ? (e.kostenProKm * 100).toFixed(1).replace(".", ",") + " ct/km"
          : "–",
    },
    {
      label: "Laufzeit",
      render: (a) => `${a.konditionen.laufzeitMonate} Monate`,
    },
    {
      label: "km/Jahr",
      render: (a) =>
        a.konditionen.kmProJahr.toLocaleString("de-DE") + " km",
    },
    {
      label: "Sonderzahlung",
      render: (a) => formatEuro(a.konditionen.sonderzahlung),
    },
    {
      label: "Batterie",
      render: (a) => (
        <BatterieBadge kwh={a.fahrzeug.batteriekapazitaetKwh} baseline={baseline} />
      ),
    },
    {
      label: "Anhängerkupplung",
      render: (a) => labelAhk(a.fahrzeug.anhaengerkupplung),
    },
    {
      label: "Verfügbarkeit",
      render: (a) => labelVerfuegbarkeit(a.konditionen.verfuegbarkeit),
    },
    {
      label: "Förderung",
      render: (a) => labelFoerderungStatus(a.konditionen.foerderungVomAnbieterEinkalkuliert),
    },
    {
      label: "GAP",
      render: (a) => labelGapStatus(a.konditionen.gapEnthalten),
    },
    {
      label: "Bewertung",
      render: (_, e) =>
        e ? (
          <FitBadge
            bewertung={e.bewertung.gesamtbewertung}
            erklaerung={e.bewertung.erklaerung}
            size="sm"
          />
        ) : "–",
    },
    {
      label: "Warnungen",
      render: (_, e) =>
        e ? <WarnListe warnungen={e.warnungen} maxAnzeigen={2} /> : "–",
    },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/60">
            <th className="sticky left-0 bg-muted/60 px-4 py-3 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider min-w-[140px]">
              Kriterium
            </th>
            {angebote.map((a) => (
              <th
                key={a.id}
                className={`px-4 py-3 text-left font-semibold min-w-[180px] ${
                  a.id === guenstigstesId ? "bg-emerald-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <div>
                    <Link
                      href={`/angebote/${a.id}`}
                      className="hover:underline text-sm"
                    >
                      {a.titel}
                    </Link>
                    {a.id === guenstigstesId && (
                      <p className="text-xs font-normal text-emerald-600">
                        Günstigster
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onEntfernen(a.id)}
                    className="text-muted-foreground hover:text-destructive mt-0.5"
                    title="Aus Vergleich entfernen"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {felder.map(({ label, render }, i) => (
            <tr
              key={label}
              className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
            >
              <td className="sticky left-0 bg-inherit px-4 py-2.5 text-xs text-muted-foreground font-medium">
                {label}
              </td>
              {angebote.map((a) => {
                const e = ergebnisse.find((r) => r.angebotId === a.id);
                return (
                  <td
                    key={a.id}
                    className={`px-4 py-2.5 ${
                      a.id === guenstigstesId ? "bg-emerald-50/50" : ""
                    }`}
                  >
                    {render(a, e)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Dialoge ──────────────────────────────────────────────────────────────────

function BearbeitenDialog({
  offen,
  onClose,
  vergleich,
  onSpeichern,
}: {
  offen: boolean;
  onClose: () => void;
  vergleich: import("@/types").Vergleich;
  onSpeichern: (v: import("@/types").Vergleich) => void;
}) {
  const [name, setName] = React.useState(vergleich.name);
  const [referenzdatum, setReferenzdatum] = React.useState(
    vergleich.referenzdatum
  );
  const [beschreibung, setBeschreibung] = React.useState(
    vergleich.beschreibung ?? ""
  );

  React.useEffect(() => {
    if (offen) {
      setName(vergleich.name);
      setReferenzdatum(vergleich.referenzdatum);
      setBeschreibung(vergleich.beschreibung ?? "");
    }
  }, [offen, vergleich]);

  return (
    <Dialog open={offen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vergleich bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Name</label>
            <input
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Referenzdatum <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={referenzdatum}
              onChange={(e) => setReferenzdatum(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Beschreibung</label>
            <textarea
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              value={beschreibung}
              onChange={(e) => setBeschreibung(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button
            onClick={() =>
              onSpeichern({
                ...vergleich,
                name: name.trim(),
                referenzdatum,
                beschreibung: beschreibung.trim() || undefined,
              })
            }
            disabled={!name.trim() || !referenzdatum}
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AngeboteHinzufuegenDialog({
  offen,
  onClose,
  vergleich,
  alleAngebote,
  onSpeichern,
}: {
  offen: boolean;
  onClose: () => void;
  vergleich: import("@/types").Vergleich;
  alleAngebote: Angebot[];
  onSpeichern: (ids: string[]) => void;
}) {
  const [ausgewaehlteIds, setAusgewaehlteIds] = React.useState<string[]>(
    vergleich.angebotIds
  );

  React.useEffect(() => {
    if (offen) setAusgewaehlteIds(vergleich.angebotIds);
  }, [offen, vergleich.angebotIds]);

  const toggle = (id: string) => {
    setAusgewaehlteIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const aktive = alleAngebote.filter(
    (a) => a.status === "aktiv" || a.status === "favorit"
  );

  return (
    <Dialog open={offen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Angebote verwalten</DialogTitle>
          <DialogDescription>
            Wähle die Angebote für diesen Vergleich.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto space-y-2 py-2">
          {aktive.map((a) => {
            const ausgewaehlt = ausgewaehlteIds.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => toggle(a.id)}
                className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                  ausgewaehlt
                    ? "border-primary bg-primary/5"
                    : "hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.titel}</span>
                  <div
                    className={`h-4 w-4 rounded border-2 flex-shrink-0 ${
                      ausgewaehlt ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {a.konditionen.monatsrate}€/Mo. · {a.konditionen.laufzeitMonate} Mo.
                </span>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={() => onSpeichern(ausgewaehlteIds)}>
            Speichern ({ausgewaehlteIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
