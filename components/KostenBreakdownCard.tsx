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
  gruen?: boolean;
}

function Zeile({ label, wert, annahme, fehlt, bold, gruen }: ZeileProps) {
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
          bold && "font-semibold",
          gruen && "text-green-600 dark:text-green-400"
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

  // Einmalkosten netto (Förderung abziehen wenn explizit nicht eingerechnet)
  const bruttoEinmalig = ergebnis.einmaligeKosten;
  const foerderungAbzug =
    k.foerderungVomAnbieterEinkalkuliert === "nicht_eingerechnet" &&
    k.foerderungHoeheEuro !== undefined
      ? k.foerderungHoeheEuro
      : 0;
  const nettoEinmalig = Math.max(0, bruttoEinmalig - foerderungAbzug);

  // Betriebskosten pro Monat
  const betriebProMonat =
    (lk.versicherungProJahr ?? 0) / 12 +
    (lk.kfzSteuerProJahr ?? 0) / 12 +
    (lk.ladekostenProJahr ?? 0) / 12 +
    (lk.wartungProJahr ?? 0) / 12 +
    (lk.reifenProJahr ?? 0) / 12 +
    (lk.wallboxKostenMonatlich ?? 0) +
    (lk.sonstigeKostenProJahr ?? 0) / 12;

  // Monatliche Gesamtkosten (Einmalkosten NICHT auf Monate umgelegt)
  const monatlichGesamt = k.monatsrate + betriebProMonat;

  // Gesamtkosten = monatlich × laufzeit + einmalig netto
  const gesamtUeberLaufzeit = monatlichGesamt * k.laufzeitMonate + nettoEinmalig;
  const gesamtKm = (k.kmProJahr * k.laufzeitMonate) / 12;
  const kostenProKm = gesamtKm > 0 ? gesamtUeberLaufzeit / gesamtKm : 0;

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
      <CardContent className="space-y-4">

        {/* Leasingrate – primäre Kennzahl */}
        <div className="rounded-lg bg-muted/40 p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
            Leasingrate
          </p>
          <p className="text-4xl font-bold tabular-nums">{formatEuro(k.monatsrate)}</p>
          <p className="text-sm text-muted-foreground mt-0.5">pro Monat</p>
        </div>

        {/* Einmalkosten */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Einmalkosten
          </p>
          <Zeile
            label="Sonderzahlung"
            wert={k.sonderzahlung > 0 ? formatEuro(k.sonderzahlung) : "–"}
            fehlt={k.sonderzahlung === 0}
          />
          <Zeile
            label="Überführungskosten"
            wert={k.ueberfuehrungskosten > 0 ? formatEuro(k.ueberfuehrungskosten) : "–"}
            fehlt={k.ueberfuehrungskosten === 0}
          />
          <Zeile
            label="Zulassungskosten"
            wert={k.zulassungskosten > 0 ? formatEuro(k.zulassungskosten) : "–"}
            fehlt={k.zulassungskosten === 0}
          />
          {foerderungAbzug > 0 && (
            <Zeile
              label="Förderung (abzüglich)"
              wert={`−${formatEuro(foerderungAbzug)}`}
              gruen
            />
          )}
          {k.foerderungVomAnbieterEinkalkuliert === "eingerechnet" && k.foerderungHoeheEuro && (
            <Zeile
              label={`Förderung ${formatEuro(k.foerderungHoeheEuro)}`}
              wert="in Rate eingerechnet"
              fehlt
            />
          )}
          <Separator className="my-1.5" />
          <Zeile
            label="Einmalkosten netto"
            wert={nettoEinmalig > 0 ? formatEuro(nettoEinmalig) : "–"}
            bold
            fehlt={nettoEinmalig === 0}
          />
        </div>

        <Separator />

        {/* Betriebskosten pro Monat */}
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Betriebskosten / Monat
          </p>
          <Zeile
            label="Versicherung"
            wert={
              lk.versicherungProJahr
                ? formatEuro(lk.versicherungProJahr / 12) + "/Mo."
                : "–"
            }
            annahme={!!lk.versicherungsannahmeText}
            fehlt={!lk.versicherungProJahr}
          />
          {(lk.ladekostenProJahr ?? 0) > 0 && (
            <Zeile
              label="Ladekosten"
              wert={formatEuro(lk.ladekostenProJahr! / 12) + "/Mo."}
              annahme
            />
          )}
          {(lk.wartungProJahr ?? 0) > 0 && (
            <Zeile
              label="Wartung"
              wert={formatEuro(lk.wartungProJahr! / 12) + "/Mo."}
              annahme
            />
          )}
          {(lk.reifenProJahr ?? 0) > 0 && (
            <Zeile
              label="Reifen"
              wert={formatEuro(lk.reifenProJahr! / 12) + "/Mo."}
              annahme
            />
          )}
          {(lk.wallboxKostenMonatlich ?? 0) > 0 && (
            <Zeile
              label="Wallbox"
              wert={formatEuro(lk.wallboxKostenMonatlich!) + "/Mo."}
            />
          )}
          {(lk.kfzSteuerProJahr ?? 0) > 0 && (
            <Zeile
              label="KFZ-Steuer"
              wert={formatEuro(lk.kfzSteuerProJahr / 12) + "/Mo."}
            />
          )}
          {betriebProMonat > 0 && (
            <>
              <Separator className="my-1.5" />
              <Zeile
                label="Betriebskosten gesamt"
                wert={formatEuro(betriebProMonat) + "/Mo."}
                bold
              />
            </>
          )}
        </div>

        <Separator />

        {/* Zusammenfassung */}
        <div className="space-y-1 rounded-md bg-muted/60 p-3">
          <Zeile
            label="Rate + Betrieb"
            wert={formatEuro(monatlichGesamt) + "/Mo."}
            bold
          />
          {nettoEinmalig > 0 && (
            <Zeile
              label="Einmalkosten (netto, einmalig)"
              wert={formatEuro(nettoEinmalig)}
            />
          )}
          <Zeile
            label={`Gesamtkosten (${k.laufzeitMonate} Monate)`}
            wert={formatEuro(gesamtUeberLaufzeit)}
            bold
          />
          <Zeile
            label="Kosten pro km"
            wert={
              kostenProKm > 0
                ? (kostenProKm * 100).toFixed(1).replace(".", ",") + " ct/km"
                : "–"
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
