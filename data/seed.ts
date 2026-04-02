import type { AppData } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Seed-Daten: initiale Befüllung beim ersten App-Start
// ─────────────────────────────────────────────────────────────────────────────

export const SEED_DATA: AppData = {
  version: 1,
  baselineProfile: [
    {
      id: "baseline-julia-standard",
      name: "Julia Standard",
      kmProJahr: 20000,
      mindestLaufzeitMonate: 36,
      mindestBatterieKwh: 55,
      bevorzugteBatterieKwh: 70,
      versicherungPflicht: true,
      gapSichtbarPflicht: true,
    },
  ],
  aktiveBaselineProfilId: "baseline-julia-standard",
  angebote: [
    // ─────────────────────────────────────────────────────────────────────────
    // 1. Opel Grandland Electric
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "angebot-opel-grandland",
      titel: "Opel Grandland Electric",
      anbieter: "LeasingMarkt",
      portal: "leasingmarkt.de",
      originalUrl:
        "https://www.leasingmarkt.de/leasing/pkw/opel-grandland/12694717",
      status: "favorit",
      erfasstAm: "2026-04-01T10:00:00.000Z",
      angebotsdatum: "2026-04-01",
      notizen:
        "Interessant wegen AHK-Option. Verfügbarkeit prüfen. Förderung noch unklar.",
      fahrzeug: {
        marke: "Opel",
        modell: "Grandland",
        variante: "Electric",
        neuOderGebraucht: "neu",
        batteriekapazitaetKwh: 73,
        leistungKw: 157,
        wltpReichweiteKm: 523,
        anhaengerkupplung: "optional",
        sonderausstattung: ["Panoramadach", "Wärmepumpe", "Adaptive Cruise Control"],
        farbe: "Mondstein Grau",
      },
      konditionen: {
        monatsrate: 349,
        laufzeitMonate: 36,
        kmProJahr: 20000,
        sonderzahlung: 0,
        ueberfuehrungskosten: 790,
        zulassungskosten: 120,
        foerderungVomAnbieterEinkalkuliert: "unklar",
        foerderungHoeheEuro: undefined,
        gapEnthalten: "unklar",
        verfuegbarkeit: "mittel",
        spezielleBedingungen: "Nur für Privatpersonen. Mindestbonitätsprüfung erforderlich.",
      },
      laufendeKosten: {
        versicherungProJahr: 1200,
        versicherungsannahmeText: "VK/TK 500 €, Schätzwert",
        kfzSteuerProJahr: 0,
        ladekostenProJahr: 600,
        wartungProJahr: 300,
        reifenProJahr: 400,
        wallboxKostenMonatlich: undefined,
        sonstigeKostenProJahr: undefined,
      },
      erstelltAm: "2026-04-01T10:00:00.000Z",
      aktualisiertAm: "2026-04-01T10:00:00.000Z",
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 2. MG S6 EV
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "angebot-mg-s6",
      titel: "MG S6 EV",
      anbieter: "LeasingMarkt",
      portal: "leasingmarkt.de",
      originalUrl:
        "https://www.leasingmarkt.de/leasing/pkw/mg-s6_ev/12709779?adVariant=34284112&lcn=listing&lcs=Listing&lcsu=https%3A%2F%2Fwww.leasingmarkt.de%2Flisting&ga4pp=%257B%2522resultsCount%2522%253A1524%252C%2522sort%2522%253A%2522popularity%2522%252C%2522position%2522%257D&utm_campaign=12709779&utm_source=InseratsShare&utm_medium=copy",
      status: "favorit",
      erfasstAm: "2026-04-01T11:00:00.000Z",
      angebotsdatum: "2026-04-01",
      notizen:
        "Günstigster Preis pro kWh. Chinesischer Hersteller – Werkstattnetz prüfen. Garantiebedingungen klären.",
      fahrzeug: {
        marke: "MG",
        modell: "S6 EV",
        variante: undefined,
        neuOderGebraucht: "neu",
        batteriekapazitaetKwh: 68.3,
        leistungKw: 150,
        wltpReichweiteKm: 500,
        anhaengerkupplung: "nein",
        sonderausstattung: ["Panoramadach", "Sitzheizung", "360°-Kamera"],
        farbe: "Schwarz",
      },
      konditionen: {
        monatsrate: 289,
        laufzeitMonate: 48,
        kmProJahr: 20000,
        sonderzahlung: 0,
        ueberfuehrungskosten: 699,
        zulassungskosten: 120,
        foerderungVomAnbieterEinkalkuliert: "eingerechnet",
        foerderungHoeheEuro: 3000,
        gapEnthalten: "nicht_enthalten",
        verfuegbarkeit: "kurz",
        spezielleBedingungen: "48 Monate Laufzeit. Rückgabe nur bei zugelassenem Händler.",
      },
      laufendeKosten: {
        versicherungProJahr: 1350,
        versicherungsannahmeText: "VK/TK 500 €, Schätzwert – MG weniger bekannt",
        kfzSteuerProJahr: 0,
        ladekostenProJahr: 550,
        wartungProJahr: 250,
        reifenProJahr: 400,
        wallboxKostenMonatlich: undefined,
        sonstigeKostenProJahr: undefined,
      },
      erstelltAm: "2026-04-01T11:00:00.000Z",
      aktualisiertAm: "2026-04-01T11:00:00.000Z",
    },

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Skoda Enyaq
    // ─────────────────────────────────────────────────────────────────────────
    {
      id: "angebot-skoda-enyaq",
      titel: "Škoda Enyaq",
      anbieter: "Null-Leasing",
      portal: "null-leasing.com",
      originalUrl:
        "https://www.null-leasing.com/skoda-leasing/angebote/451273000?lst=p&lsml=20000&lstm=48&utm_campaign=socialbuttons",
      status: "favorit",
      erfasstAm: "2026-04-01T12:00:00.000Z",
      angebotsdatum: "2026-04-01",
      notizen:
        "48 Monate Laufzeit. Etablierter Hersteller. VW-Konzern. AHK verfügbar? Details prüfen.",
      fahrzeug: {
        marke: "Škoda",
        modell: "Enyaq",
        variante: "60",
        neuOderGebraucht: "neu",
        batteriekapazitaetKwh: 59,
        leistungKw: 132,
        wltpReichweiteKm: 412,
        anhaengerkupplung: "optional",
        sonderausstattung: ["Wärmepumpe", "Sitzheizung", "LED-Matrix"],
        farbe: "Brilliant Silber",
      },
      konditionen: {
        monatsrate: 319,
        laufzeitMonate: 48,
        kmProJahr: 20000,
        sonderzahlung: 0,
        ueberfuehrungskosten: 890,
        zulassungskosten: 120,
        foerderungVomAnbieterEinkalkuliert: "nicht_eingerechnet",
        foerderungHoeheEuro: undefined,
        gapEnthalten: "unklar",
        verfuegbarkeit: "lang",
        spezielleBedingungen: "Bestellung über Null-Leasing. Fahrzeug nach Bestellung konfigurierbar.",
      },
      laufendeKosten: {
        versicherungProJahr: 1100,
        versicherungsannahmeText: "VK/TK 500 €, Schätzwert – VW-Konzern gut verfügbar",
        kfzSteuerProJahr: 0,
        ladekostenProJahr: 580,
        wartungProJahr: 280,
        reifenProJahr: 380,
        wallboxKostenMonatlich: undefined,
        sonstigeKostenProJahr: undefined,
      },
      erstelltAm: "2026-04-01T12:00:00.000Z",
      aktualisiertAm: "2026-04-01T12:00:00.000Z",
    },
  ],
  vergleiche: [
    {
      id: "vergleich-april-2026",
      name: "Julia April 2026",
      referenzdatum: "2026-04-01",
      beschreibung: "Erster Vergleich – die drei Favoriten direkt gegenübergestellt.",
      baselineProfilId: "baseline-julia-standard",
      angebotIds: [
        "angebot-opel-grandland",
        "angebot-mg-s6",
        "angebot-skoda-enyaq",
      ],
      erstelltAm: "2026-04-01T12:00:00.000Z",
      aktualisiertAm: "2026-04-01T12:00:00.000Z",
      archiviert: false,
    },
  ],
};
