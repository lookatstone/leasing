import { z } from "zod";

// ─────────────────────────────────────────────────────────────────────────────
// Enum-Schemas
// ─────────────────────────────────────────────────────────────────────────────

export const FoerderungStatusSchema = z.enum([
  "eingerechnet",
  "nicht_eingerechnet",
  "unklar",
]);

export const GapStatusSchema = z.enum([
  "enthalten",
  "nicht_enthalten",
  "unklar",
]);

export const FahrzeugZustandSchema = z.enum(["neu", "gebraucht"]);

export const AnhaengerkupplungStatusSchema = z.enum([
  "ja",
  "nein",
  "optional",
  "unbekannt",
]);

export const AngebotStatusSchema = z.enum([
  "favorit",
  "aktiv",
  "verworfen",
  "archiviert",
]);

export const VerfuegbarkeitSchema = z.enum([
  "sofort",
  "kurz",
  "mittel",
  "lang",
  "unbekannt",
]);

// ─────────────────────────────────────────────────────────────────────────────
// Baseline-Profil
// ─────────────────────────────────────────────────────────────────────────────

export const BaselineProfilSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name ist erforderlich"),
  kmProJahr: z.number().int().min(1000).max(100000),
  mindestLaufzeitMonate: z.number().int().min(1).max(120),
  mindestBatterieKwh: z.number().min(1).max(300),
  bevorzugteBatterieKwh: z.number().min(1).max(300),
  versicherungPflicht: z.boolean(),
  gapSichtbarPflicht: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Fahrzeugdaten
// ─────────────────────────────────────────────────────────────────────────────

export const FahrzeugdatenSchema = z.object({
  marke: z.string().min(1, "Marke ist erforderlich"),
  modell: z.string().min(1, "Modell ist erforderlich"),
  variante: z.string().optional(),
  neuOderGebraucht: FahrzeugZustandSchema,
  erstzulassung: z.string().optional(),
  kilometerstand: z.number().int().min(0).optional(),
  batteriekapazitaetKwh: z.number().min(0).max(300).optional(),
  leistungKw: z.number().min(0).max(2000).optional(),
  wltpReichweiteKm: z.number().min(0).max(2000).optional(),
  anhaengerkupplung: AnhaengerkupplungStatusSchema,
  sonderausstattung: z.array(z.string()),
  farbe: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Leasingkonditionen
// ─────────────────────────────────────────────────────────────────────────────

export const LeasingkonditionenSchema = z.object({
  monatsrate: z.number().min(0, "Monatsrate muss positiv sein"),
  laufzeitMonate: z.number().int().min(1).max(120),
  kmProJahr: z.number().int().min(1000).max(200000),
  sonderzahlung: z.number().min(0),
  ueberfuehrungskosten: z.number().min(0),
  zulassungskosten: z.number().min(0),
  einmaligeGesamtkostenManuell: z.number().min(0).optional(),
  foerderungVomAnbieterEinkalkuliert: FoerderungStatusSchema,
  foerderungHoeheEuro: z.number().min(0).optional(),
  gapEnthalten: GapStatusSchema,
  verfuegbarkeit: VerfuegbarkeitSchema,
  spezielleBedingungen: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Laufende Kosten
// ─────────────────────────────────────────────────────────────────────────────

export const LaufendeKostenSchema = z.object({
  versicherungProJahr: z.number().min(0).optional(),
  versicherungsannahmeText: z.string().optional(),
  kfzSteuerProJahr: z.number().min(0).default(0),
  ladekostenProJahr: z.number().min(0).optional(),
  wartungProJahr: z.number().min(0).optional(),
  reifenProJahr: z.number().min(0).optional(),
  wallboxKostenMonatlich: z.number().min(0).optional(),
  sonstigeKostenProJahr: z.number().min(0).optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Angebot (vollständig)
// ─────────────────────────────────────────────────────────────────────────────

export const AngebotSchema = z.object({
  id: z.string().min(1),
  titel: z.string().min(1, "Titel ist erforderlich"),
  anbieter: z.string().min(1, "Anbieter ist erforderlich"),
  portal: z.string().optional(),
  originalUrl: z.string().url("Bitte eine gültige URL eingeben").optional().or(z.literal("")),
  status: AngebotStatusSchema,
  erfasstAm: z.string(),
  angebotsdatum: z.string().optional(),
  notizen: z.string().optional(),
  fahrzeug: FahrzeugdatenSchema,
  konditionen: LeasingkonditionenSchema,
  laufendeKosten: LaufendeKostenSchema,
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Vergleich
// ─────────────────────────────────────────────────────────────────────────────

export const VergleichSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "Name ist erforderlich"),
  referenzdatum: z.string().min(1, "Referenzdatum ist erforderlich"),
  beschreibung: z.string().optional(),
  baselineProfilId: z.string().min(1),
  angebotIds: z.array(z.string()),
  erstelltAm: z.string(),
  aktualisiertAm: z.string(),
  archiviert: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Formular-Schemas (für react-hook-form oder direkte Validierung)
// ─────────────────────────────────────────────────────────────────────────────

export const AngebotFormSchema = AngebotSchema.omit({
  id: true,
  erstelltAm: true,
  aktualisiertAm: true,
  erfasstAm: true,
});

export const VergleichFormSchema = VergleichSchema.omit({
  id: true,
  erstelltAm: true,
  aktualisiertAm: true,
});

export type AngebotFormData = z.infer<typeof AngebotFormSchema>;
export type VergleichFormData = z.infer<typeof VergleichFormSchema>;
