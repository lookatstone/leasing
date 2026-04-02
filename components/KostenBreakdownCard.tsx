import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatEuro } from "@/lib/formatters";
import type { Angebot, Vergleichsergebnis } from "@/types";
import { cn } from "@/lib/utils";

interface KostenBreakdownCardProps {
  angebot: Angebot;
  ergebnis: Vergleichsergebnis;
  hervorheben?: boolean;
  className?: string;
}

interface ZeileProps {
  label: string;
  wert: string;
  annahme?: boolean;
  fehlt?: boolean;
  bold?: boolean;
}

function Zeile({ label, wert, annahme, fehlt, bold }: ZeileProps) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span
        className={cn(
          "text-sm",
          fehlt ? "text-muted-foreground italic" : "text-foreground",
          bold && "font-semibold"
        )}
      >
        {label}
        {annahme && (
          <span className="ml-1 text-xs text-muted-foreground">(Annahme)</span>
        )}
      </span>
      <span
        className={cn(
          "text-sm tabular-nums",
          fehlt ? "text-muted-foreground" : "text-foreground",
          bold && "font-semibold"
        )}
      >
        {wert}
      </span>
    </div>
  );
}

export function KostenBreakdownCard({
  angebot,
  ergebnis,
  hervorheben = false,
  className,
}: KostenBreakdownCardProps) {
  const k = angebot.konditionen;
  const lk = angebot.laufendeKosten;

  return (
    <Card
      className={cn(
        "overflow-hidden",
        hervorheben && "ring-2 ring-primary",
        className
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Kostenaufschlüsselung</CardTitle>
        <p className="text-xs text-muted-foreground">
          {k.laufzeitMonate} Monate · {(k.kmProJahr / 1000).toFixed(0)}.000 km/Jahr
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Leasingkosten */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Leasing
          </p>
          <Zeile label="Monatsrate (Angebot)" wert={formatEuro(k.monatsrate) + "/Monat"} />
          <Zeile label="Sonderzahlung" wert={formatEuro(k.sonderzahlung)} />
          <Zeile label="Überführungskosten" wert={k.ueberfuehrungskosten > 0 ? formatEuro(k.ueberfuehrungskosten) : "–"} fehlt={k.ueberfuehrungskosten === 0} />
          <Zeile label="Zulassungskosten" wert={formatEuro(k.zulassungskosten)} />
          {k.foerderungHoeheEuro && (
            <Zeile
              label="Förderung"
              wert={`${formatEuro(k.foerderungHoeheEuro)} (${k.foerderungVomAnbieterEinkalkuliert === "eingerechnet" ? "eingerechnet" : "separat"})`}
            />
          )}
        </div>

        <Separator />

        {/* Effektive Leasingkosten */}
        <Zeile
          label="Effektive Leasingkosten/Monat"
          wert={formatEuro(ergebnis.effektiveMonatlicheLeasingkosten) + "/Monat"}
          bold
        />

        <Separator />

        {/* Laufende Betriebskosten */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Betrieb pro Monat
          </p>
          <Zeile
            label="Versicherung"
            wert={lk.versicherungProJahr ? formatEuro(lk.versicherungProJahr / 12) + "/Monat" : "–"}
            annahme={!!lk.versicherungsannahmeText}
            fehlt={!lk.versicherungProJahr}
          />
          <Zeile
            label="Ladekosten"
            wert={lk.ladekostenProJahr ? formatEuro(lk.ladekostenProJahr / 12) + "/Monat" : "–"}
            annahme
            fehlt={!lk.ladekostenProJahr}
          />
          <Zeile
            label="Wartung"
            wert={lk.wartungProJahr ? formatEuro(lk.wartungProJahr / 12) + "/Monat" : "–"}
            annahme
            fehlt={!lk.wartungProJahr}
          />
          <Zeile
            label="Reifen"
            wert={lk.reifenProJahr ? formatEuro(lk.reifenProJahr / 12) + "/Monat" : "–"}
            annahme
            fehlt={!lk.reifenProJahr}
          />
          {lk.wallboxKostenMonatlich ? (
            <Zeile label="Wallbox" wert={formatEuro(lk.wallboxKostenMonatlich) + "/Monat"} />
          ) : null}
          <Zeile label="KFZ-Steuer" wert={formatEuro(lk.kfzSteuerProJahr / 12) + "/Monat"} />
        </div>

        <Separator />

        {/* Zusammenfassung */}
        <div className="space-y-1 rounded-md bg-muted/60 p-3">
          <Zeile
            label="Gesamtkosten/Monat"
            wert={formatEuro(ergebnis.effektiveMonatlicheGesamtkosten) + "/Monat"}
            bold
          />
          <Zeile
            label={`Gesamtkosten (${k.laufzeitMonate} Monate)`}
            wert={formatEuro(ergebnis.gesamtkostenUeberLaufzeit)}
            bold
          />
          <Zeile
            label="Kosten pro km"
            wert={
              ergebnis.kostenProKm > 0
                ? (ergebnis.kostenProKm * 100).toFixed(1).replace(".", ",") + " ct/km"
                : "–"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
