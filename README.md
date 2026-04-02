# EV-Leasing Vergleich

Transparentes Vergleichstool für Elektroauto-Leasingangebote – entwickelt für Privatpersonen in Deutschland.

## Was diese App löst

Leasingangebote sind schwer vergleichbar, weil:
- unterschiedliche Laufzeiten und Kilometerleistungen verwendet werden
- Förderungen schon eingerechnet oder noch offen sind
- Anzahlungen und Nebenkosten fehlen
- Versicherung und GAP oft nicht angegeben sind

Diese App normalisiert alle Angebote auf eine gemeinsame Basis und zeigt Warnungen, wenn Vergleichbarkeit eingeschränkt ist.

---

## Lokaler Start

### Voraussetzungen
- Node.js 20.9+
- npm

### Setup

```bash
npm install
npm run dev
```

App läuft unter: **http://localhost:3000**

### Produktions-Build

```bash
npm run build
npm start
```

---

## Deployment auf Vercel

1. Repository auf GitHub pushen
2. Auf [vercel.com](https://vercel.com) anmelden und „New Project" → GitHub-Repo verbinden
3. Keine Umgebungsvariablen erforderlich (MVP mit localStorage)
4. „Deploy" klicken

Vercel erkennt Next.js automatisch.

---

## Architektur

```
app/                          Next.js App Router Pages
  page.tsx                    Dashboard
  angebote/
    page.tsx                  Angebotsliste (Karten + Tabelle)
    neu/page.tsx              Neues Angebot
    [id]/page.tsx             Angebotsdetail
    [id]/bearbeiten/page.tsx  Angebot bearbeiten
  vergleiche/
    page.tsx                  Vergleichsliste
    neu/page.tsx              Neuer Vergleich
    [id]/page.tsx             Vergleichsdetail mit Direktvergleich-Tabelle
  einstellungen/page.tsx      Baseline-Profile konfigurieren

components/
  ui/                         Primitive UI-Komponenten (Radix-basiert)
  AppNav.tsx                  Navigation
  AngebotFormular.tsx         Haupt-Eingabeformular mit Zod-Validierung
  WarnBadge.tsx               Warn-Badges mit Tooltip-Erklärung
  FitBadge.tsx                Bewertungs-Badge (Guter Fit / Genau prüfen / Schwacher Fit)
  BatterieBadge.tsx           Batteriegröße farblich bewertet
  KostenBreakdownCard.tsx     Kostenaufschlüsselung
  AngebotStatusBadge.tsx      Status-Kennzeichnung

lib/
  calculations/index.ts       Alle Berechnungsformeln (reine Funktionen)
  formatters/index.ts         Deutsche Zahlen- und Datumsformate
  storage/index.ts            localStorage-Persistenz
  schemas.ts                  Zod-Validierungsschemas
  utils.ts                    cn() Tailwind-Merge Hilfsfunktion

types/index.ts                Alle TypeScript-Typen
data/seed.ts                  3 initiale Beispielangebote + Baseline-Profil
hooks/useAppData.ts           React-Hook für globalen App-State
```

---

## Berechnungslogik

Alle Formeln in `lib/calculations/index.ts` als reine Funktionen:

```
Effektive Leasingkosten/Monat =
  (Monatsrate × Laufzeit + Sonderzahlung + Überführung + Zulassung − Förderung*) / Laufzeit

  * Förderung wird nur abgezogen wenn "nicht_eingerechnet" und Betrag bekannt.
  * "eingerechnet" → bereits in Monatsrate enthalten, kein Abzug.
  * "unklar" → Warnung, keine stille Bereinigung.

Effektive Gesamtkosten/Monat =
  Effektive Leasingkosten + (Versicherung + Steuer + Laden + Wartung + Reifen + Wallbox + Sonstiges) / 12

Gesamtkosten über Laufzeit = Gesamtkosten/Monat × Laufzeit in Monaten

Kosten pro km = Gesamtkosten / (km/Jahr × Laufzeit / 12)
```

---

## Gespeicherte Vergleiche: Name & Referenzdatum

Jeder Vergleich hat:
- **Name** – frei wählbar, z. B. `"Julia April 2026"`, `"SUV über 70 kWh"`
- **Referenzdatum** – Pflichtfeld, prominent angezeigt. Dokumentiert, zu welchem Stand die Angebotsdaten erhoben wurden.

Wird ein Angebot später günstiger oder ändert sich die Situation, kann ein neuer Vergleich angelegt werden – der alte Vergleich bleibt als historischer Stand erhalten.

---

## Spätere Erweiterung mit Supabase

Die Storage-Schicht ist in `lib/storage/index.ts` vollständig isoliert. Um auf Supabase umzustellen:

1. `npm install @supabase/supabase-js`
2. Umgebungsvariablen setzen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `lib/storage/index.ts` durch Supabase-Implementierung mit identischer API ersetzen
4. Tabellen anlegen: `angebote`, `vergleiche`, `baseline_profile`
5. Row Level Security (RLS) für Mehrbenutzer-Betrieb konfigurieren

Typen, Berechnungen und UI-Komponenten bleiben unverändert.

---

## Seed-Daten

Beim ersten App-Start werden automatisch drei Favoriten geladen:

| Fahrzeug | Anbieter | Batterie | Laufzeit |
|---|---|---|---|
| Opel Grandland Electric | LeasingMarkt | 73 kWh | 36 Mo. |
| MG S6 EV | LeasingMarkt | 68,3 kWh | 48 Mo. |
| Škoda Enyaq 60 | Null-Leasing | 59 kWh | 48 Mo. |

Alle editierbar. Reset auf Seed-Daten: Einstellungen → „Auf Seed-Daten zurücksetzen".

---

## Tech-Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript** strict mode
- **Tailwind CSS v4**
- **Radix UI** Primitives
- **Zod** Validierung
- **localStorage** Persistenz (kein Backend erforderlich)
