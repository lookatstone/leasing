"use client";

import * as React from "react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AngebotSchema } from "@/lib/schemas";
import type { Angebot } from "@/types";

// ─── Validierungsschema ───────────────────────────────────────────────────────

const FormSchema = AngebotSchema.omit({
  erstelltAm: true,
  aktualisiertAm: true,
  erfasstAm: true,
});

type FormErrors = Partial<Record<string, string>>;

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function zahl(v: string): number | undefined {
  const n = parseFloat(v.replace(",", "."));
  return isNaN(n) ? undefined : n;
}

function zahlOder0(v: string): number {
  return zahl(v) ?? 0;
}

function int(v: string): number | undefined {
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}

function intOder0(v: string): number {
  return int(v) ?? 0;
}

// ─── Typen für das lokale Formular-State ─────────────────────────────────────

interface FormState {
  // Allgemein
  titel: string;
  anbieter: string;
  portal: string;
  originalUrl: string;
  status: Angebot["status"];
  angebotsdatum: string;
  notizen: string;
  // Fahrzeug
  marke: string;
  modell: string;
  variante: string;
  neuOderGebraucht: Angebot["fahrzeug"]["neuOderGebraucht"];
  erstzulassung: string;
  kilometerstand: string;
  batteriekapazitaetKwh: string;
  leistungKw: string;
  wltpReichweiteKm: string;
  anhaengerkupplung: Angebot["fahrzeug"]["anhaengerkupplung"];
  sonderausstattung: string;
  farbe: string;
  // Leasingkonditionen
  monatsrate: string;
  laufzeitMonate: string;
  kmProJahr: string;
  sonderzahlung: string;
  ueberfuehrungskosten: string;
  zulassungskosten: string;
  foerderungVomAnbieterEinkalkuliert: Angebot["konditionen"]["foerderungVomAnbieterEinkalkuliert"];
  foerderungHoeheEuro: string;
  gapEnthalten: Angebot["konditionen"]["gapEnthalten"];
  verfuegbarkeit: Angebot["konditionen"]["verfuegbarkeit"];
  spezielleBedingungen: string;
  // Betriebskosten
  versicherungProJahr: string;
  versicherungsannahmeText: string;
  kfzSteuerProJahr: string;
  ladekostenProJahr: string;
  wartungProJahr: string;
  reifenProJahr: string;
  wallboxKostenMonatlich: string;
  sonstigeKostenProJahr: string;
}

function angebotZuFormState(a: Angebot): FormState {
  return {
    titel: a.titel,
    anbieter: a.anbieter,
    portal: a.portal ?? "",
    originalUrl: a.originalUrl ?? "",
    status: a.status,
    angebotsdatum: a.angebotsdatum ?? "",
    notizen: a.notizen ?? "",

    marke: a.fahrzeug.marke,
    modell: a.fahrzeug.modell,
    variante: a.fahrzeug.variante ?? "",
    neuOderGebraucht: a.fahrzeug.neuOderGebraucht,
    erstzulassung: a.fahrzeug.erstzulassung ?? "",
    kilometerstand:
      a.fahrzeug.kilometerstand !== undefined
        ? String(a.fahrzeug.kilometerstand)
        : "",
    batteriekapazitaetKwh:
      a.fahrzeug.batteriekapazitaetKwh !== undefined
        ? String(a.fahrzeug.batteriekapazitaetKwh)
        : "",
    leistungKw:
      a.fahrzeug.leistungKw !== undefined ? String(a.fahrzeug.leistungKw) : "",
    wltpReichweiteKm:
      a.fahrzeug.wltpReichweiteKm !== undefined
        ? String(a.fahrzeug.wltpReichweiteKm)
        : "",
    anhaengerkupplung: a.fahrzeug.anhaengerkupplung,
    sonderausstattung: a.fahrzeug.sonderausstattung.join(", "),
    farbe: a.fahrzeug.farbe ?? "",

    monatsrate: String(a.konditionen.monatsrate),
    laufzeitMonate: String(a.konditionen.laufzeitMonate),
    kmProJahr: String(a.konditionen.kmProJahr),
    sonderzahlung: String(a.konditionen.sonderzahlung),
    ueberfuehrungskosten: String(a.konditionen.ueberfuehrungskosten),
    zulassungskosten: String(a.konditionen.zulassungskosten),
    foerderungVomAnbieterEinkalkuliert:
      a.konditionen.foerderungVomAnbieterEinkalkuliert,
    foerderungHoeheEuro:
      a.konditionen.foerderungHoeheEuro !== undefined
        ? String(a.konditionen.foerderungHoeheEuro)
        : "",
    gapEnthalten: a.konditionen.gapEnthalten,
    verfuegbarkeit: a.konditionen.verfuegbarkeit,
    spezielleBedingungen: a.konditionen.spezielleBedingungen ?? "",

    versicherungProJahr:
      a.laufendeKosten.versicherungProJahr !== undefined
        ? String(a.laufendeKosten.versicherungProJahr)
        : "",
    versicherungsannahmeText: a.laufendeKosten.versicherungsannahmeText ?? "",
    kfzSteuerProJahr: String(a.laufendeKosten.kfzSteuerProJahr),
    ladekostenProJahr:
      a.laufendeKosten.ladekostenProJahr !== undefined
        ? String(a.laufendeKosten.ladekostenProJahr)
        : "",
    wartungProJahr:
      a.laufendeKosten.wartungProJahr !== undefined
        ? String(a.laufendeKosten.wartungProJahr)
        : "",
    reifenProJahr:
      a.laufendeKosten.reifenProJahr !== undefined
        ? String(a.laufendeKosten.reifenProJahr)
        : "",
    wallboxKostenMonatlich:
      a.laufendeKosten.wallboxKostenMonatlich !== undefined
        ? String(a.laufendeKosten.wallboxKostenMonatlich)
        : "",
    sonstigeKostenProJahr:
      a.laufendeKosten.sonstigeKostenProJahr !== undefined
        ? String(a.laufendeKosten.sonstigeKostenProJahr)
        : "",
  };
}

function formStateZuAngebot(f: FormState, basis: Angebot): Angebot {
  const now = new Date().toISOString();
  return {
    ...basis,
    titel: f.titel.trim(),
    anbieter: f.anbieter.trim(),
    portal: f.portal.trim() || undefined,
    originalUrl: f.originalUrl.trim() || undefined,
    status: f.status,
    angebotsdatum: f.angebotsdatum || undefined,
    notizen: f.notizen.trim() || undefined,
    aktualisiertAm: now,
    fahrzeug: {
      marke: f.marke.trim(),
      modell: f.modell.trim(),
      variante: f.variante.trim() || undefined,
      neuOderGebraucht: f.neuOderGebraucht,
      erstzulassung: f.erstzulassung || undefined,
      kilometerstand: f.kilometerstand ? intOder0(f.kilometerstand) : undefined,
      batteriekapazitaetKwh: f.batteriekapazitaetKwh
        ? zahl(f.batteriekapazitaetKwh)
        : undefined,
      leistungKw: f.leistungKw ? zahl(f.leistungKw) : undefined,
      wltpReichweiteKm: f.wltpReichweiteKm ? zahl(f.wltpReichweiteKm) : undefined,
      anhaengerkupplung: f.anhaengerkupplung,
      sonderausstattung: f.sonderausstattung
        ? f.sonderausstattung
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      farbe: f.farbe.trim() || undefined,
    },
    konditionen: {
      monatsrate: zahlOder0(f.monatsrate),
      laufzeitMonate: intOder0(f.laufzeitMonate),
      kmProJahr: intOder0(f.kmProJahr),
      sonderzahlung: zahlOder0(f.sonderzahlung),
      ueberfuehrungskosten: zahlOder0(f.ueberfuehrungskosten),
      zulassungskosten: zahlOder0(f.zulassungskosten),
      foerderungVomAnbieterEinkalkuliert: f.foerderungVomAnbieterEinkalkuliert,
      foerderungHoeheEuro: f.foerderungHoeheEuro
        ? zahl(f.foerderungHoeheEuro)
        : undefined,
      gapEnthalten: f.gapEnthalten,
      verfuegbarkeit: f.verfuegbarkeit,
      spezielleBedingungen: f.spezielleBedingungen.trim() || undefined,
    },
    laufendeKosten: {
      versicherungProJahr: f.versicherungProJahr
        ? zahl(f.versicherungProJahr)
        : undefined,
      versicherungsannahmeText:
        f.versicherungsannahmeText.trim() || undefined,
      kfzSteuerProJahr: zahlOder0(f.kfzSteuerProJahr),
      ladekostenProJahr: f.ladekostenProJahr
        ? zahl(f.ladekostenProJahr)
        : undefined,
      wartungProJahr: f.wartungProJahr ? zahl(f.wartungProJahr) : undefined,
      reifenProJahr: f.reifenProJahr ? zahl(f.reifenProJahr) : undefined,
      wallboxKostenMonatlich: f.wallboxKostenMonatlich
        ? zahl(f.wallboxKostenMonatlich)
        : undefined,
      sonstigeKostenProJahr: f.sonstigeKostenProJahr
        ? zahl(f.sonstigeKostenProJahr)
        : undefined,
    },
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AngebotFormularProps {
  angebot: Angebot;
  onSpeichern: (a: Angebot) => void;
  onAbbrechen: () => void;
  modus: "neu" | "bearbeiten";
}

// ─── Wiederverwendbare Formular-Felder ────────────────────────────────────────

function Feld({
  label,
  fehler,
  hinweis,
  children,
  required,
}: {
  label: string;
  fehler?: string;
  hinweis?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hinweis && !fehler && (
        <p className="text-xs text-muted-foreground">{hinweis}</p>
      )}
      {fehler && <p className="text-xs text-destructive">{fehler}</p>}
    </div>
  );
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export function AngebotFormular({
  angebot,
  onSpeichern,
  onAbbrechen,
  modus,
}: AngebotFormularProps) {
  const [form, setForm] = useState<FormState>(() =>
    angebotZuFormState(angebot)
  );
  const [fehler, setFehler] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (submitted) {
      setFehler((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validiere(): FormErrors {
    const kandidat = formStateZuAngebot(form, angebot);
    const result = FormSchema.safeParse({
      id: kandidat.id,
      titel: kandidat.titel,
      anbieter: kandidat.anbieter,
      portal: kandidat.portal,
      originalUrl: kandidat.originalUrl,
      status: kandidat.status,
      angebotsdatum: kandidat.angebotsdatum,
      notizen: kandidat.notizen,
      fahrzeug: kandidat.fahrzeug,
      konditionen: kandidat.konditionen,
      laufendeKosten: kandidat.laufendeKosten,
    });
    if (result.success) return {};
    const errs: FormErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      if (!errs[key]) errs[key] = issue.message;
    }
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    const errs = validiere();
    if (Object.keys(errs).length > 0) {
      setFehler(errs);
      return;
    }
    onSpeichern(formStateZuAngebot(form, angebot));
  }

  const f = (pfad: string) => fehler[pfad];

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* ── 1. Allgemein ─────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h3 className="text-base font-semibold tracking-tight">Allgemein</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Feld label="Titel" fehler={f("titel")} required>
            <Input
              value={form.titel}
              onChange={(e) => set("titel", e.target.value)}
              placeholder="z. B. VW ID.4 Pro Performance bei ABC Leasing"
            />
          </Feld>
          <Feld label="Anbieter" fehler={f("anbieter")} required>
            <Input
              value={form.anbieter}
              onChange={(e) => set("anbieter", e.target.value)}
              placeholder="z. B. ABC Autohaus GmbH"
            />
          </Feld>
          <Feld
            label="Portal / Vermittler"
            fehler={f("portal")}
            hinweis="z. B. Leasingmarkt, Vehiculum, Direktanbieter"
          >
            <Input
              value={form.portal}
              onChange={(e) => set("portal", e.target.value)}
              placeholder="z. B. Leasingmarkt.de"
            />
          </Feld>
          <Feld
            label="Original-URL"
            fehler={f("originalUrl")}
            hinweis="Link zum Originalangebot im Internet"
          >
            <Input
              type="url"
              value={form.originalUrl}
              onChange={(e) => set("originalUrl", e.target.value)}
              placeholder="https://..."
            />
          </Feld>
          <Feld label="Status" fehler={f("status")} required>
            <Select
              value={form.status}
              onValueChange={(v) =>
                set("status", v as Angebot["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktiv">Aktiv</SelectItem>
                <SelectItem value="favorit">Favorit</SelectItem>
                <SelectItem value="verworfen">Verworfen</SelectItem>
                <SelectItem value="archiviert">Archiviert</SelectItem>
              </SelectContent>
            </Select>
          </Feld>
          <Feld label="Angebotsdatum" fehler={f("angebotsdatum")}>
            <Input
              type="date"
              value={form.angebotsdatum}
              onChange={(e) => set("angebotsdatum", e.target.value)}
            />
          </Feld>
        </div>
        <Feld label="Notizen" fehler={f("notizen")}>
          <Textarea
            value={form.notizen}
            onChange={(e) => set("notizen", e.target.value)}
            placeholder="Eigene Anmerkungen, offene Fragen, Verhandlungsspielraum …"
            rows={3}
          />
        </Feld>
      </section>

      <Separator />

      {/* ── 2. Fahrzeug ──────────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h3 className="text-base font-semibold tracking-tight">Fahrzeug</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feld label="Marke" fehler={f("fahrzeug.marke")} required>
            <Input
              value={form.marke}
              onChange={(e) => set("marke", e.target.value)}
              placeholder="z. B. Volkswagen"
            />
          </Feld>
          <Feld label="Modell" fehler={f("fahrzeug.modell")} required>
            <Input
              value={form.modell}
              onChange={(e) => set("modell", e.target.value)}
              placeholder="z. B. ID.4"
            />
          </Feld>
          <Feld
            label="Variante / Ausstattungslinie"
            fehler={f("fahrzeug.variante")}
          >
            <Input
              value={form.variante}
              onChange={(e) => set("variante", e.target.value)}
              placeholder="z. B. Pro Performance"
            />
          </Feld>
          <Feld label="Fahrzeugzustand" fehler={f("fahrzeug.neuOderGebraucht")} required>
            <Select
              value={form.neuOderGebraucht}
              onValueChange={(v) =>
                set(
                  "neuOderGebraucht",
                  v as Angebot["fahrzeug"]["neuOderGebraucht"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="neu">Neuwagen</SelectItem>
                <SelectItem value="gebraucht">Gebrauchwagen</SelectItem>
              </SelectContent>
            </Select>
          </Feld>
          <Feld
            label="Erstzulassung"
            fehler={f("fahrzeug.erstzulassung")}
            hinweis="Relevant bei Gebrauchwagen"
          >
            <Input
              type="date"
              value={form.erstzulassung}
              onChange={(e) => set("erstzulassung", e.target.value)}
            />
          </Feld>
          <Feld
            label="Kilometerstand (km)"
            fehler={f("fahrzeug.kilometerstand")}
            hinweis="Nur bei Gebrauchwagen relevant"
          >
            <Input
              type="number"
              min={0}
              value={form.kilometerstand}
              onChange={(e) => set("kilometerstand", e.target.value)}
              placeholder="z. B. 15000"
            />
          </Feld>
          <Feld
            label="Batteriekapazität (kWh)"
            fehler={f("fahrzeug.batteriekapazitaetKwh")}
            hinweis="Nutzbare Kapazität; wichtig für Vergleich und Bewertung"
          >
            <Input
              type="number"
              min={0}
              step={0.1}
              value={form.batteriekapazitaetKwh}
              onChange={(e) => set("batteriekapazitaetKwh", e.target.value)}
              placeholder="z. B. 77"
            />
          </Feld>
          <Feld label="Leistung (kW)" fehler={f("fahrzeug.leistungKw")}>
            <Input
              type="number"
              min={0}
              value={form.leistungKw}
              onChange={(e) => set("leistungKw", e.target.value)}
              placeholder="z. B. 210"
            />
          </Feld>
          <Feld
            label="WLTP-Reichweite (km)"
            fehler={f("fahrzeug.wltpReichweiteKm")}
          >
            <Input
              type="number"
              min={0}
              value={form.wltpReichweiteKm}
              onChange={(e) => set("wltpReichweiteKm", e.target.value)}
              placeholder="z. B. 522"
            />
          </Feld>
          <Feld
            label="Anhängerkupplung"
            fehler={f("fahrzeug.anhaengerkupplung")}
            required
          >
            <Select
              value={form.anhaengerkupplung}
              onValueChange={(v) =>
                set(
                  "anhaengerkupplung",
                  v as Angebot["fahrzeug"]["anhaengerkupplung"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ja">Vorhanden</SelectItem>
                <SelectItem value="nein">Nicht vorhanden</SelectItem>
                <SelectItem value="optional">Optional (Aufpreis)</SelectItem>
                <SelectItem value="unbekannt">Unbekannt</SelectItem>
              </SelectContent>
            </Select>
          </Feld>
          <Feld label="Farbe" fehler={f("fahrzeug.farbe")}>
            <Input
              value={form.farbe}
              onChange={(e) => set("farbe", e.target.value)}
              placeholder="z. B. Mondsteingrau Metallic"
            />
          </Feld>
        </div>
        <Feld
          label="Sonderausstattung"
          fehler={f("fahrzeug.sonderausstattung")}
          hinweis="Mehrere Ausstattungsmerkmale kommagetrennt eingeben, z. B. Wärmepumpe, Panoramadach, ACC"
        >
          <Input
            value={form.sonderausstattung}
            onChange={(e) => set("sonderausstattung", e.target.value)}
            placeholder="z. B. Wärmepumpe, Panoramadach, Matrix-LED"
          />
        </Feld>
      </section>

      <Separator />

      {/* ── 3. Leasingkonditionen ─────────────────────────────────────────── */}
      <section className="space-y-5">
        <h3 className="text-base font-semibold tracking-tight">
          Leasingkonditionen
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feld
            label="Monatsrate (€)"
            fehler={f("konditionen.monatsrate")}
            required
            hinweis="Bruttomonatsrate laut Angebot"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.monatsrate}
              onChange={(e) => set("monatsrate", e.target.value)}
              placeholder="z. B. 399"
            />
          </Feld>
          <Feld
            label="Laufzeit (Monate)"
            fehler={f("konditionen.laufzeitMonate")}
            required
          >
            <Input
              type="number"
              min={1}
              max={120}
              step={1}
              value={form.laufzeitMonate}
              onChange={(e) => set("laufzeitMonate", e.target.value)}
              placeholder="z. B. 36"
            />
          </Feld>
          <Feld
            label="Freikilometer pro Jahr (km)"
            fehler={f("konditionen.kmProJahr")}
            required
            hinweis="Im Vergleich wird auf 20.000 km/Jahr normiert"
          >
            <Input
              type="number"
              min={1000}
              step={1000}
              value={form.kmProJahr}
              onChange={(e) => set("kmProJahr", e.target.value)}
              placeholder="z. B. 15000"
            />
          </Feld>
          <Feld
            label="Sonderzahlung (€)"
            fehler={f("konditionen.sonderzahlung")}
            required
            hinweis="0 eingeben, wenn keine Sonderzahlung anfällt"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.sonderzahlung}
              onChange={(e) => set("sonderzahlung", e.target.value)}
              placeholder="0"
            />
          </Feld>
          <Feld
            label="Überführungskosten (€)"
            fehler={f("konditionen.ueberfuehrungskosten")}
            required
            hinweis="0 eingeben, wenn nicht bekannt oder im Preis enthalten"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.ueberfuehrungskosten}
              onChange={(e) => set("ueberfuehrungskosten", e.target.value)}
              placeholder="z. B. 790"
            />
          </Feld>
          <Feld
            label="Zulassungskosten (€)"
            fehler={f("konditionen.zulassungskosten")}
            required
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.zulassungskosten}
              onChange={(e) => set("zulassungskosten", e.target.value)}
              placeholder="z. B. 150"
            />
          </Feld>
          <Feld
            label="Förderungsstatus"
            fehler={f("konditionen.foerderungVomAnbieterEinkalkuliert")}
            required
            hinweis="Ist eine staatliche oder Anbieterförderung in der Rate bereits enthalten?"
          >
            <Select
              value={form.foerderungVomAnbieterEinkalkuliert}
              onValueChange={(v) =>
                set(
                  "foerderungVomAnbieterEinkalkuliert",
                  v as Angebot["konditionen"]["foerderungVomAnbieterEinkalkuliert"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eingerechnet">
                  Förderung eingerechnet
                </SelectItem>
                <SelectItem value="nicht_eingerechnet">
                  Förderung nicht eingerechnet
                </SelectItem>
                <SelectItem value="unklar">Unklar</SelectItem>
              </SelectContent>
            </Select>
          </Feld>
          <Feld
            label="Förderhöhe (€)"
            fehler={f("konditionen.foerderungHoeheEuro")}
            hinweis="Gesamtbetrag der angerechneten Förderung"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.foerderungHoeheEuro}
              onChange={(e) => set("foerderungHoeheEuro", e.target.value)}
              placeholder="z. B. 4500"
            />
          </Feld>
          <Feld
            label="GAP-Versicherung"
            fehler={f("konditionen.gapEnthalten")}
            required
            hinweis="Deckt die Differenz zwischen Restwert und Versicherungsleistung bei Totalschaden"
          >
            <Select
              value={form.gapEnthalten}
              onValueChange={(v) =>
                set(
                  "gapEnthalten",
                  v as Angebot["konditionen"]["gapEnthalten"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enthalten">Enthalten</SelectItem>
                <SelectItem value="nicht_enthalten">Nicht enthalten</SelectItem>
                <SelectItem value="unklar">Unklar</SelectItem>
              </SelectContent>
            </Select>
          </Feld>
          <Feld
            label="Verfügbarkeit"
            fehler={f("konditionen.verfuegbarkeit")}
            required
          >
            <Select
              value={form.verfuegbarkeit}
              onValueChange={(v) =>
                set(
                  "verfuegbarkeit",
                  v as Angebot["konditionen"]["verfuegbarkeit"]
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sofort">Sofort verfügbar</SelectItem>
                <SelectItem value="kurz">Kurzfristig (&lt; 4 Wochen)</SelectItem>
                <SelectItem value="mittel">Mittelfristig (1–3 Monate)</SelectItem>
                <SelectItem value="lang">Langfristig (&gt; 3 Monate)</SelectItem>
                <SelectItem value="unbekannt">Unbekannt</SelectItem>
              </SelectContent>
            </Select>
          </Feld>
        </div>
        <Feld
          label="Besondere Bedingungen"
          fehler={f("konditionen.spezielleBedingungen")}
          hinweis="z. B. Mindestabnahme, spezielle Kundenbedingungen, befristetes Angebot"
        >
          <Textarea
            value={form.spezielleBedingungen}
            onChange={(e) => set("spezielleBedingungen", e.target.value)}
            placeholder="Besondere Vertragsbedingungen oder Einschränkungen …"
            rows={2}
          />
        </Feld>
      </section>

      <Separator />

      {/* ── 4. Betriebskosten ─────────────────────────────────────────────── */}
      <section className="space-y-5">
        <h3 className="text-base font-semibold tracking-tight">
          Betriebskosten
        </h3>
        <p className="text-sm text-muted-foreground">
          Alle Felder sind optional. Vollständige Angaben ermöglichen einen
          genaueren Gesamtkostenvergleich.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Feld
            label="Kfz-Versicherung pro Jahr (€)"
            fehler={f("laufendeKosten.versicherungProJahr")}
            hinweis="Jahresbeitrag der Kfz-Haftpflicht + Kasko"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.versicherungProJahr}
              onChange={(e) => set("versicherungProJahr", e.target.value)}
              placeholder="z. B. 1200"
            />
          </Feld>
          <Feld
            label="Versicherungsannahme"
            fehler={f("laufendeKosten.versicherungsannahmeText")}
            hinweis="Kurze Beschreibung der Annahme, z. B. Vollkasko SF 10"
          >
            <Input
              value={form.versicherungsannahmeText}
              onChange={(e) =>
                set("versicherungsannahmeText", e.target.value)
              }
              placeholder="z. B. Vollkasko, SF 10, Regionalklasse 5"
            />
          </Feld>
          <Feld
            label="KFZ-Steuer pro Jahr (€)"
            fehler={f("laufendeKosten.kfzSteuerProJahr")}
            hinweis="Für reine Elektrofahrzeuge in Deutschland bis 2030: 0 €"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.kfzSteuerProJahr}
              onChange={(e) => set("kfzSteuerProJahr", e.target.value)}
              placeholder="0"
            />
          </Feld>
          <Feld
            label="Ladekosten pro Jahr (€)"
            fehler={f("laufendeKosten.ladekostenProJahr")}
            hinweis="Geschätzte jährliche Kosten für Strom (Heim + Öffentlich)"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.ladekostenProJahr}
              onChange={(e) => set("ladekostenProJahr", e.target.value)}
              placeholder="z. B. 600"
            />
          </Feld>
          <Feld
            label="Wartung pro Jahr (€)"
            fehler={f("laufendeKosten.wartungProJahr")}
            hinweis="Inkl. Inspektionen und kleinerer Reparaturen"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.wartungProJahr}
              onChange={(e) => set("wartungProJahr", e.target.value)}
              placeholder="z. B. 300"
            />
          </Feld>
          <Feld
            label="Reifen pro Jahr (€)"
            fehler={f("laufendeKosten.reifenProJahr")}
            hinweis="Anteilige Kosten für Reifenwechsel und -kauf"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.reifenProJahr}
              onChange={(e) => set("reifenProJahr", e.target.value)}
              placeholder="z. B. 250"
            />
          </Feld>
          <Feld
            label="Wallbox monatlich (€)"
            fehler={f("laufendeKosten.wallboxKostenMonatlich")}
            hinweis="Monatliche Rate für Wallbox-Finanzierung oder -Miete"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.wallboxKostenMonatlich}
              onChange={(e) => set("wallboxKostenMonatlich", e.target.value)}
              placeholder="z. B. 20"
            />
          </Feld>
          <Feld
            label="Sonstige Kosten pro Jahr (€)"
            fehler={f("laufendeKosten.sonstigeKostenProJahr")}
            hinweis="Weitere regelmäßige Kosten, die nicht oben erfasst sind"
          >
            <Input
              type="number"
              min={0}
              step={1}
              value={form.sonstigeKostenProJahr}
              onChange={(e) => set("sonstigeKostenProJahr", e.target.value)}
              placeholder="z. B. 100"
            />
          </Feld>
        </div>
      </section>

      <Separator />

      {/* ── Aktionsleiste ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onAbbrechen}>
          Abbrechen
        </Button>
        <div className="flex items-center gap-2">
          {Object.keys(fehler).filter((k) => fehler[k]).length > 0 && (
            <p className="text-sm text-destructive">
              Bitte korrigiere die markierten Felder.
            </p>
          )}
          <Button type="submit">
            {modus === "neu" ? "Angebot speichern" : "Änderungen speichern"}
          </Button>
        </div>
      </div>
    </form>
  );
}
