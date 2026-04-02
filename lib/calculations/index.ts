import type {
  Angebot,
  BaselineProfil,
  Vergleichsergebnis,
  Warnung,
  WarnungTyp,
  Bewertung,
  FitBewertung,
} from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Warn-Definitionen
// ─────────────────────────────────────────────────────────────────────────────

const WARN_TEXTE: Record<
  WarnungTyp,
  { titel: string; erklaerung: string; schwere: "info" | "hinweis" | "warnung" }
> = {
  foerderung_eingerechnet: {
    titel: "Förderung bereits eingerechnet",
    erklaerung:
      "Die angegebene Monatsrate enthält bereits eine Förderung vom Anbieter. Die Rate ist dadurch günstiger als sie ohne Förderung wäre.",
    schwere: "hinweis",
  },
  foerderung_nicht_eingerechnet: {
    titel: "Förderung nicht eingerechnet",
    erklaerung:
      "Der Anbieter hat keine Förderung in die Rate eingerechnet. Mögliche Förderungen müssten separat beantragt werden.",
    schwere: "info",
  },
  foerderung_unklar: {
    titel: "Förderungsstatus unklar",
    erklaerung:
      "Es ist nicht eindeutig, ob eine Förderung in der Rate bereits berücksichtigt ist. Bitte beim Anbieter nachfragen.",
    schwere: "warnung",
  },
  km_nicht_normiert: {
    titel: "Nicht auf 20.000 km normiert",
    erklaerung:
      "Das Angebot basiert auf einer anderen Kilometerleistung als dem Vergleichsstandard von 20.000 km/Jahr. Ein direkter Kostenvergleich ist eingeschränkt.",
    schwere: "warnung",
  },
  laufzeit_zu_kurz: {
    titel: "Laufzeit unter 36 Monaten",
    erklaerung:
      "Die Leasinglaufzeit liegt unter dem bevorzugten Minimum von 36 Monaten. Kürzere Laufzeiten führen oft zu höheren monatlichen Raten.",
    schwere: "warnung",
  },
  batterie_unter_minimum: {
    titel: "Batterie unter Minimalwert",
    erklaerung:
      "Die Batteriekapazität liegt unter dem gesetzten Minimalwert von 55 kWh. Die Reichweite könnte für alltägliche Nutzung eingeschränkt sein.",
    schwere: "warnung",
  },
  batterie_unter_ziel: {
    titel: "Batterie unter bevorzugtem Zielwert",
    erklaerung:
      "Die Batteriekapazität liegt unter dem bevorzugten Zielwert von 70 kWh. Das Fahrzeug erfüllt die Mindestanforderungen, aber nicht die Präferenz.",
    schwere: "hinweis",
  },
  gebrauchtwagen: {
    titel: "Gebrauchtfahrzeug",
    erklaerung:
      "Es handelt sich um ein gebrauchtes Fahrzeug. Batterie-Gesundheit, Garantiestatus und Vorschäden sollten geprüft werden.",
    schwere: "hinweis",
  },
  hoher_kilometerstand: {
    titel: "Hoher Kilometerstand",
    erklaerung:
      "Das Fahrzeug hat bereits einen hohen Kilometerstand. Dies kann die Batteriekapazität und den Restwert beeinflussen.",
    schwere: "hinweis",
  },
  versicherung_fehlt: {
    titel: "Versicherungskosten fehlen",
    erklaerung:
      "Keine Versicherungskosten angegeben. Die effektiven Gesamtkosten sind daher unvollständig und nicht direkt vergleichbar.",
    schwere: "warnung",
  },
  gap_unklar: {
    titel: "GAP-Versicherung unklar",
    erklaerung:
      "Der Status der GAP-Versicherung ist nicht bekannt. Bei Totalschaden oder Diebstahl könnte eine Deckungslücke entstehen.",
    schwere: "hinweis",
  },
  ueberfuehrung_fehlt: {
    titel: "Überführungskosten nicht angegeben",
    erklaerung:
      "Es wurden keine Überführungskosten angegeben. Diese betragen typischerweise 500–1.200 €.",
    schwere: "info",
  },
  nicht_vergleichbar: {
    titel: "Eingeschränkt vergleichbar",
    erklaerung:
      "Dieses Angebot kann aufgrund mehrerer Abweichungen nicht direkt mit anderen Angeboten verglichen werden.",
    schwere: "warnung",
  },
};

function makeWarnung(typ: WarnungTyp): Warnung {
  const w = WARN_TEXTE[typ];
  return { typ, schwere: w.schwere, titel: w.titel, erklaerung: w.erklaerung };
}

// ─────────────────────────────────────────────────────────────────────────────
// Kernberechnungen (reine Funktionen)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Einmalige Kosten ohne geförderte Abzüge.
 */
export function berechneEinmaligeKosten(angebot: Angebot): number {
  const k = angebot.konditionen;
  if (k.einmaligeGesamtkostenManuell !== undefined) {
    return k.einmaligeGesamtkostenManuell;
  }
  return k.sonderzahlung + k.ueberfuehrungskosten + k.zulassungskosten;
}

/**
 * Förderung, die explizit abgezogen werden soll:
 * Nur wenn "nicht_eingerechnet" und Betrag bekannt → subtrahieren wir
 * sie bei der Normierung. Wenn "eingerechnet", ist sie bereits in der Rate.
 */
function foerderungAbzug(angebot: Angebot): number {
  const k = angebot.konditionen;
  if (
    k.foerderungVomAnbieterEinkalkuliert === "nicht_eingerechnet" &&
    k.foerderungHoeheEuro !== undefined
  ) {
    return k.foerderungHoeheEuro;
  }
  return 0;
}

/**
 * Effektive monatliche Leasingkosten (normiert auf die Laufzeit).
 *
 * = (monatsrate × laufzeit + einmaligeKosten − expliziteNichtEingerechneteFordering)
 *   / laufzeit
 */
export function berechneEffektiveLeasingkosten(angebot: Angebot): number {
  const k = angebot.konditionen;
  const einmalig = berechneEinmaligeKosten(angebot);
  const abzug = foerderungAbzug(angebot);
  return (k.monatsrate * k.laufzeitMonate + einmalig - abzug) / k.laufzeitMonate;
}

/**
 * Effektive monatliche Gesamtkosten (inkl. Betrieb).
 */
export function berechneEffektiveGesamtkosten(angebot: Angebot): number {
  const leasing = berechneEffektiveLeasingkosten(angebot);
  const lk = angebot.laufendeKosten;

  const monatlich =
    (lk.versicherungProJahr ?? 0) / 12 +
    (lk.kfzSteuerProJahr ?? 0) / 12 +
    (lk.ladekostenProJahr ?? 0) / 12 +
    (lk.wartungProJahr ?? 0) / 12 +
    (lk.reifenProJahr ?? 0) / 12 +
    (lk.wallboxKostenMonatlich ?? 0) +
    (lk.sonstigeKostenProJahr ?? 0) / 12;

  return leasing + monatlich;
}

/**
 * Gesamtkosten über die gesamte Laufzeit.
 */
export function berechneGesamtkostenUeberLaufzeit(angebot: Angebot): number {
  return berechneEffektiveGesamtkosten(angebot) * angebot.konditionen.laufzeitMonate;
}

/**
 * Kosten pro gefahrenem Kilometer.
 */
export function berechneKostenProKm(angebot: Angebot): number {
  const gesamt = berechneGesamtkostenUeberLaufzeit(angebot);
  const km =
    (angebot.konditionen.kmProJahr * angebot.konditionen.laufzeitMonate) / 12;
  if (km === 0) return 0;
  return gesamt / km;
}

// ─────────────────────────────────────────────────────────────────────────────
// Warnsystem
// ─────────────────────────────────────────────────────────────────────────────

export function ermittleWarnungen(
  angebot: Angebot,
  baseline: BaselineProfil
): Warnung[] {
  const warnungen: Warnung[] = [];
  const k = angebot.konditionen;
  const f = angebot.fahrzeug;
  const lk = angebot.laufendeKosten;

  if (k.foerderungVomAnbieterEinkalkuliert === "eingerechnet") {
    warnungen.push(makeWarnung("foerderung_eingerechnet"));
  }
  if (k.foerderungVomAnbieterEinkalkuliert === "nicht_eingerechnet") {
    warnungen.push(makeWarnung("foerderung_nicht_eingerechnet"));
  }
  if (k.foerderungVomAnbieterEinkalkuliert === "unklar") {
    warnungen.push(makeWarnung("foerderung_unklar"));
  }

  if (k.kmProJahr !== baseline.kmProJahr) {
    warnungen.push(makeWarnung("km_nicht_normiert"));
  }

  if (k.laufzeitMonate < baseline.mindestLaufzeitMonate) {
    warnungen.push(makeWarnung("laufzeit_zu_kurz"));
  }

  if (
    f.batteriekapazitaetKwh !== undefined &&
    f.batteriekapazitaetKwh < baseline.mindestBatterieKwh
  ) {
    warnungen.push(makeWarnung("batterie_unter_minimum"));
  } else if (
    f.batteriekapazitaetKwh !== undefined &&
    f.batteriekapazitaetKwh < baseline.bevorzugteBatterieKwh
  ) {
    warnungen.push(makeWarnung("batterie_unter_ziel"));
  }

  if (f.neuOderGebraucht === "gebraucht") {
    warnungen.push(makeWarnung("gebrauchtwagen"));
    if (f.kilometerstand !== undefined && f.kilometerstand > 30000) {
      warnungen.push(makeWarnung("hoher_kilometerstand"));
    }
  }

  if (baseline.versicherungPflicht && !lk.versicherungProJahr) {
    warnungen.push(makeWarnung("versicherung_fehlt"));
  }

  if (baseline.gapSichtbarPflicht && k.gapEnthalten === "unklar") {
    warnungen.push(makeWarnung("gap_unklar"));
  }

  if (k.ueberfuehrungskosten === 0) {
    warnungen.push(makeWarnung("ueberfuehrung_fehlt"));
  }

  return warnungen;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bewertungssystem
// ─────────────────────────────────────────────────────────────────────────────

function bewertungFuerKosten(
  angebot: Angebot,
  alleAngebote: Angebot[]
): FitBewertung {
  if (alleAngebote.length < 2) return "genau_pruefen";
  const eigeneKosten = berechneEffektiveGesamtkosten(angebot);
  const alleKosten = alleAngebote.map(berechneEffektiveGesamtkosten).sort((a, b) => a - b);
  const median = alleKosten[Math.floor(alleKosten.length / 2)];
  if (eigeneKosten <= median * 0.95) return "guter_fit";
  if (eigeneKosten <= median * 1.1) return "genau_pruefen";
  return "schwacher_fit";
}

function berechneTransparenzScore(angebot: Angebot): number {
  let score = 100;
  const k = angebot.konditionen;
  const lk = angebot.laufendeKosten;
  const f = angebot.fahrzeug;

  if (k.foerderungVomAnbieterEinkalkuliert === "unklar") score -= 20;
  if (k.gapEnthalten === "unklar") score -= 10;
  if (!lk.versicherungProJahr) score -= 20;
  if (!f.batteriekapazitaetKwh) score -= 15;
  if (!lk.ladekostenProJahr) score -= 5;
  if (!lk.wartungProJahr) score -= 5;
  if (!angebot.originalUrl) score -= 5;
  if (k.ueberfuehrungskosten === 0) score -= 5;

  return Math.max(0, score);
}

function bewertungFuerBatteriefit(
  angebot: Angebot,
  baseline: BaselineProfil
): FitBewertung {
  const kwh = angebot.fahrzeug.batteriekapazitaetKwh;
  if (kwh === undefined) return "genau_pruefen";
  if (kwh >= baseline.bevorzugteBatterieKwh) return "guter_fit";
  if (kwh >= baseline.mindestBatterieKwh) return "genau_pruefen";
  return "schwacher_fit";
}

function bewertungFuerVergleichbarkeit(
  angebot: Angebot,
  baseline: BaselineProfil
): FitBewertung {
  const warnungen = ermittleWarnungen(angebot, baseline);
  const kritisch = warnungen.filter((w) => w.schwere === "warnung").length;
  if (kritisch === 0) return "guter_fit";
  if (kritisch <= 2) return "genau_pruefen";
  return "schwacher_fit";
}

function gesamtbewertungAusEinzel(einzel: FitBewertung[]): FitBewertung {
  const schlechteste = einzel.reduce<FitBewertung>((worst, current) => {
    const rang = { guter_fit: 0, genau_pruefen: 1, schwacher_fit: 2 };
    return rang[current] > rang[worst] ? current : worst;
  }, "guter_fit");
  return schlechteste;
}

function erklaerungAusBewertungen(
  kosten: FitBewertung,
  transparenz: number,
  batterie: FitBewertung,
  vergleich: FitBewertung
): string {
  const teile: string[] = [];
  if (kosten === "guter_fit") teile.push("günstige Kosten");
  if (kosten === "schwacher_fit") teile.push("vergleichsweise hohe Kosten");
  if (batterie === "schwacher_fit") teile.push("Batterie unter Mindestanforderung");
  if (batterie === "genau_pruefen") teile.push("Batterie knapp unter Zielwert");
  if (transparenz < 60) teile.push("wenig Transparenz bei Kostenpositionen");
  if (vergleich === "schwacher_fit") teile.push("mehrere kritische Warnungen");
  if (teile.length === 0) return "Solides Angebot ohne kritische Auffälligkeiten.";
  return teile.join(", ") + ".";
}

export function berechneBewertung(
  angebot: Angebot,
  baseline: BaselineProfil,
  alleAngebote: Angebot[]
): Bewertung {
  const kostenBewertung = bewertungFuerKosten(angebot, alleAngebote);
  const transparenzScore = berechneTransparenzScore(angebot);
  const transparenzBewertung: FitBewertung =
    transparenzScore >= 75
      ? "guter_fit"
      : transparenzScore >= 50
        ? "genau_pruefen"
        : "schwacher_fit";
  const batteriefit = bewertungFuerBatteriefit(angebot, baseline);
  const vergleichbarkeit = bewertungFuerVergleichbarkeit(angebot, baseline);

  const gesamtbewertung = gesamtbewertungAusEinzel([
    kostenBewertung,
    transparenzBewertung,
    batteriefit,
    vergleichbarkeit,
  ]);

  return {
    gesamtbewertung,
    kostenBewertung,
    transparenzScore,
    batteriefit,
    vergleichbarkeit,
    erklaerung: erklaerungAusBewertungen(
      kostenBewertung,
      transparenzScore,
      batteriefit,
      vergleichbarkeit
    ),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Haupt-Berechnungsfunktion
// ─────────────────────────────────────────────────────────────────────────────

export function berechneVergleichsergebnis(
  angebot: Angebot,
  baseline: BaselineProfil,
  alleAngebote: Angebot[]
): Vergleichsergebnis {
  const warnungen = ermittleWarnungen(angebot, baseline);
  const kritischeWarnungen = warnungen.filter((w) => w.schwere === "warnung");
  const vergleichbarMitBaseline = kritischeWarnungen.length === 0;

  return {
    angebotId: angebot.id,
    effektiveMonatlicheLeasingkosten: berechneEffektiveLeasingkosten(angebot),
    effektiveMonatlicheGesamtkosten: berechneEffektiveGesamtkosten(angebot),
    gesamtkostenUeberLaufzeit: berechneGesamtkostenUeberLaufzeit(angebot),
    kostenProKm: berechneKostenProKm(angebot),
    einmaligeKosten: berechneEinmaligeKosten(angebot),
    vergleichbarMitBaseline,
    warnungen,
    bewertung: berechneBewertung(angebot, baseline, alleAngebote),
  };
}

export function berechneAlleVergleichsergebnisse(
  angebote: Angebot[],
  baseline: BaselineProfil
): Vergleichsergebnis[] {
  return angebote.map((a) => berechneVergleichsergebnis(a, baseline, angebote));
}
