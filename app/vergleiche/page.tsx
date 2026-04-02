"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Archive,
  Copy,
  Trash2,
  BarChart3,
  Calendar,
  Car,
  ArchiveRestore,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppData } from "@/hooks/useAppData";
import { formatDatum, formatDatumZeit } from "@/lib/formatters";
import type { Vergleich } from "@/types";

export default function VergleichListePage() {
  const router = useRouter();
  const {
    data,
    geladen,
    vergleichLoeschen,
    vergleichDuplizieren,
    vergleichArchivieren,
  } = useAppData();

  const [zeigeArchiviert, setZeigeArchiviert] = React.useState(false);
  const [loeschenId, setLoeschenId] = React.useState<string | null>(null);

  if (!geladen || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Daten werden geladen …
      </div>
    );
  }

  const vergleiche = data.vergleiche.filter(
    (v) => v.archiviert === zeigeArchiviert
  );

  const handleLoeschen = (id: string) => {
    vergleichLoeschen(id);
    setLoeschenId(null);
  };

  const handleDuplizieren = (id: string) => {
    const kopie = vergleichDuplizieren(id);
    if (kopie) router.push(`/vergleiche/${kopie.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Vergleiche</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gespeicherte Vergleichsstände mit Name und Referenzdatum
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZeigeArchiviert(!zeigeArchiviert)}
          >
            {zeigeArchiviert ? (
              <>
                <ArchiveRestore className="h-4 w-4" />
                Aktive anzeigen
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Archiv anzeigen
              </>
            )}
          </Button>
          <Button asChild>
            <Link href="/vergleiche/neu">
              <Plus className="h-4 w-4" />
              Neuer Vergleich
            </Link>
          </Button>
        </div>
      </div>

      {vergleiche.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-4" />
            {zeigeArchiviert ? (
              <>
                <h3 className="text-lg font-semibold">Kein Archiv</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Noch keine Vergleiche archiviert.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">Noch keine Vergleiche</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  Erstelle deinen ersten Vergleich, um mehrere Angebote
                  nebeneinander zu sehen.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/vergleiche/neu">
                    <Plus className="h-4 w-4" />
                    Ersten Vergleich erstellen
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vergleiche.map((v) => (
          <VergleichKarte
            key={v.id}
            vergleich={v}
            angebotAnzahl={
              data.angebote.filter((a) => v.angebotIds.includes(a.id)).length
            }
            onLoeschen={() => setLoeschenId(v.id)}
            onDuplizieren={() => handleDuplizieren(v.id)}
            onArchivieren={() => vergleichArchivieren(v.id, !v.archiviert)}
          />
        ))}
      </div>

      {/* Löschen-Dialog */}
      <Dialog open={!!loeschenId} onOpenChange={() => setLoeschenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vergleich löschen?</DialogTitle>
            <DialogDescription>
              Dieser Vergleich wird unwiderruflich gelöscht. Die enthaltenen
              Angebote bleiben erhalten.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoeschenId(null)}>
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={() => loeschenId && handleLoeschen(loeschenId)}
            >
              Löschen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VergleichKarte({
  vergleich,
  angebotAnzahl,
  onLoeschen,
  onDuplizieren,
  onArchivieren,
}: {
  vergleich: Vergleich;
  angebotAnzahl: number;
  onLoeschen: () => void;
  onDuplizieren: () => void;
  onArchivieren: () => void;
}) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <Link href={`/vergleiche/${vergleich.id}`}>
              <h3 className="font-semibold text-sm truncate hover:underline">
                {vergleich.name}
              </h3>
            </Link>
            {vergleich.archiviert && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Archive className="h-3 w-3" />
                Archiviert
              </span>
            )}
          </div>
        </div>

        {/* Referenzdatum – prominent */}
        <div className="mt-3 flex items-center gap-1.5 rounded-md border bg-muted/60 px-3 py-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
              Referenzdatum
            </p>
            <p className="text-sm font-semibold">
              {formatDatum(vergleich.referenzdatum, "lang")}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Car className="h-3.5 w-3.5" />
          <span>
            {angebotAnzahl} Angebot{angebotAnzahl !== 1 ? "e" : ""}
          </span>
        </div>

        {vergleich.beschreibung && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {vergleich.beschreibung}
          </p>
        )}

        <p className="mt-3 text-[10px] text-muted-foreground">
          Zuletzt geändert: {formatDatumZeit(vergleich.aktualisiertAm)}
        </p>

        {/* Aktionen */}
        <div className="mt-4 flex items-center gap-1 border-t pt-3">
          <Button variant="outline" size="sm" className="flex-1 text-xs" asChild>
            <Link href={`/vergleiche/${vergleich.id}`}>Öffnen</Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onDuplizieren}
            title="Duplizieren"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onArchivieren}
            title={vergleich.archiviert ? "Aus Archiv holen" : "Archivieren"}
          >
            {vergleich.archiviert ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={onLoeschen}
            title="Löschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
