// ─────────────────────────────────────────────────────────────────────────────
// Domänen-Typen für den EV-Leasing-Vergleich
// ─────────────────────────────────────────────────────────────────────────────

export type FoerderungStatus = "eingerechnet" | "nicht_eingerechnet" | "unklar";
export type GapStatus = "enthalten" | "nicht_enthalten" | "unklar";
export type FahrzeugZustand = "neu" | "gebraucht";
export type AnhaengerkupplungStatus = "ja" | "nein" | "optional" | "unbekannt";
export type AngebotStatus = "favorit" | "aktiv" | "verworfen" | "archiviert";
export type Verfuegbarkeit =
  | "sofort"
  | "kurz" // < 4 Wochen
  | "mittel" // 1–3 Monate
  | "lang" // > 3 Monate
  | "unbekannt";

// ─────────────────────────────────────────────────────────────────────────────
// 1. Baseline-Profil
// ─────────────────────────────────────────────────────────────────────────────
export interface BaselineProfil {
  id: string;
  name: string;
  kmProJahr: number;
  mindestLaufzeitMonate: number;
  mindestBatterieKwh: number;
  bevorzugteBatterieKwh: number;
  versicherungPflicht: boolean;
  gapSichtbarPflicht: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Fahrzeugdaten
// ─────────────────────────────────────────────────────────────────────────────
export interface Fahrzeugdaten {
  marke: string;
  modell: string;
  variante?: string;
  fotoUrl?: string; // URL oder base64 data-URL
  neuOderGebraucht: FahrzeugZustand;
  erstzulassung?: string; // ISO-Date-String
  kilometerstand?: number;
  batteriekapazitaetKwh?: number;
  leistungKw?: number;
  wltpReichweiteKm?: number;
  anhaengerkupplung: AnhaengerkupplungStatus;
  sonderausstattung: string[];
  farbe?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Leasingkonditionen
// ─────────────────────────────────────────────────────────────────────────────
export interface Leasingkonditionen {
  monatsrate: number;
  laufzeitMonate: number;
  kmProJahr: number;
  sonderzahlung: number;
  ueberfuehrungskosten: number;
  zulassungskosten: number;
  einmaligeGesamtkostenManuell?: number; // überschreibt Berechnung wenn gesetzt
  kmStaffelRaten?: Array<{ kmProJahr: number; monatsrate: number }>; // Raten für andere km-Stufen
  mehrkostenProKm?: number;   // €/km bei Überschreitung
  minderkostenProKm?: number; // €/km Gutschrift bei Unterschreitung
  foerderungVomAnbieterEinkalkuliert: FoerderungStatus;
  foerderungHoeheEuro?: number;
  gapEnthalten: GapStatus;
  verfuegbarkeit: Verfuegbarkeit;
  spezielleBedingungen?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Laufende Kosten
// ─────────────────────────────────────────────────────────────────────────────
export interface LaufendeKosten {
  versicherungProJahr?: number;
  versicherungsannahmeText?: string;
  kfzSteuerProJahr: number; // EV = 0 in DE
  ladekostenProJahr?: number;
  wartungProJahr?: number;
  reifenProJahr?: number;
  wallboxKostenMonatlich?: number;
  sonstigeKostenProJahr?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Angebotsdatensatz (Wurzel-Entität)
// ─────────────────────────────────────────────────────────────────────────────
export interface Angebot {
  id: string;
  titel: string;
  anbieter: string;
  portal?: string;
  originalUrl?: string;
  status: AngebotStatus;
  erfasstAm: string; // ISO-DateTime
  angebotsdatum?: string; // ISO-Date
  notizen?: string;
  fahrzeug: Fahrzeugdaten;
  konditionen: Leasingkonditionen;
  laufendeKosten: LaufendeKosten;
  erstelltAm: string;
  aktualisiertAm: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Vergleich
// ─────────────────────────────────────────────────────────────────────────────
export interface Vergleich {
  id: string;
  name: string;
  referenzdatum: string; // ISO-Date – Pflicht
  beschreibung?: string;
  baselineProfilId: string;
  angebotIds: string[];
  erstelltAm: string;
  aktualisiertAm: string;
  archiviert: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Warnsystem
// ─────────────────────────────────────────────────────────────────────────────
export type WarnungTyp =
  | "foerderung_eingerechnet"
  | "foerderung_unklar"
  | "km_nicht_normiert"
  | "laufzeit_zu_kurz"
  | "batterie_unter_minimum"
  | "batterie_unter_ziel"
  | "gebrauchtwagen"
  | "hoher_kilometerstand"
  | "versicherung_fehlt"
  | "gap_unklar"
  | "ueberfuehrung_fehlt"
  | "nicht_vergleichbar"
  | "foerderung_nicht_eingerechnet";

export type WarnungSchwere = "info" | "hinweis" | "warnung";

export interface Warnung {
  typ: WarnungTyp;
  schwere: WarnungSchwere;
  titel: string;
  erklaerung: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Bewertungssystem
// ─────────────────────────────────────────────────────────────────────────────
export type FitBewertung = "guter_fit" | "genau_pruefen" | "schwacher_fit";

export interface Bewertung {
  gesamtbewertung: FitBewertung;
  kostenBewertung: FitBewertung;
  transparenzScore: number; // 0–100
  batteriefit: FitBewertung;
  vergleichbarkeit: FitBewertung;
  erklaerung: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Vergleichsergebnis (berechnetes Objekt)
// ─────────────────────────────────────────────────────────────────────────────
export interface Vergleichsergebnis {
  angebotId: string;
  effektiveMonatlicheLeasingkosten: number;
  effektiveMonatlicheGesamtkosten: number;
  gesamtkostenUeberLaufzeit: number;
  kostenProKm: number;
  einmaligeKosten: number;
  vergleichbarMitBaseline: boolean;
  warnungen: Warnung[];
  bewertung: Bewertung;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. App-State (localStorage root)
// ─────────────────────────────────────────────────────────────────────────────
export interface AppData {
  version: number;
  angebote: Angebot[];
  vergleiche: Vergleich[];
  baselineProfile: BaselineProfil[];
  aktiveBaselineProfilId: string;
}
