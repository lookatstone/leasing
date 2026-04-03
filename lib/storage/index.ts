"use client";

import type { AppData, Angebot, Vergleich, BaselineProfil } from "@/types";
import { SEED_DATA } from "@/data/seed";
import { supabase, supabaseVerfuegbar } from "@/lib/supabase";

const STORAGE_KEY = "ev-leasing-app-v1";

// ─────────────────────────────────────────────────────────────────────────────
// localStorage (Fallback / offline)
// ─────────────────────────────────────────────────────────────────────────────

function ladeLokal(): AppData {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      speichereLokal(SEED_DATA);
      return SEED_DATA;
    }
    const parsed = JSON.parse(raw) as AppData;
    if (parsed.version !== SEED_DATA.version) return migriere(parsed);
    return parsed;
  } catch {
    speichereLokal(SEED_DATA);
    return SEED_DATA;
  }
}

function speichereLokal(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function migriere(data: Partial<AppData>): AppData {
  const result: AppData = {
    version: SEED_DATA.version,
    angebote: data.angebote ?? SEED_DATA.angebote,
    vergleiche: data.vergleiche ?? SEED_DATA.vergleiche,
    baselineProfile: data.baselineProfile ?? SEED_DATA.baselineProfile,
    aktiveBaselineProfilId:
      data.aktiveBaselineProfilId ?? SEED_DATA.aktiveBaselineProfilId,
  };
  speichereLokal(result);
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Supabase
// ─────────────────────────────────────────────────────────────────────────────

async function ladeSupabase(): Promise<AppData> {
  if (!supabase) return ladeLokal();

  const [angRes, verRes, baseRes, einRes] = await Promise.all([
    supabase.from("angebote").select("id, data"),
    supabase.from("vergleiche").select("id, data"),
    supabase.from("baseline_profile").select("id, data"),
    supabase.from("app_einstellungen").select("schluessel, wert"),
  ]);

  const angebote: Angebot[] =
    angRes.data && angRes.data.length > 0
      ? angRes.data.map((r) => r.data as Angebot)
      : [];

  const vergleiche: Vergleich[] =
    verRes.data && verRes.data.length > 0
      ? verRes.data.map((r) => r.data as Vergleich)
      : [];

  const baselineProfile: BaselineProfil[] =
    baseRes.data && baseRes.data.length > 0
      ? baseRes.data.map((r) => r.data as BaselineProfil)
      : [];

  const aktiveId =
    einRes.data?.find((e) => e.schluessel === "aktiveBaselineProfilId")?.wert
      ?.value ?? SEED_DATA.aktiveBaselineProfilId;

  // Beim ersten Start Seeds einspielen
  if (angebote.length === 0 && vergleiche.length === 0) {
    await seedsEinspielen();
    return SEED_DATA;
  }

  return {
    version: SEED_DATA.version,
    angebote,
    vergleiche,
    baselineProfile:
      baselineProfile.length > 0
        ? baselineProfile
        : SEED_DATA.baselineProfile,
    aktiveBaselineProfilId: aktiveId,
  };
}

async function seedsEinspielen(): Promise<void> {
  if (!supabase) return;

  await Promise.all([
    ...SEED_DATA.angebote.map((a) =>
      supabase!.from("angebote").upsert({ id: a.id, data: a })
    ),
    ...SEED_DATA.vergleiche.map((v) =>
      supabase!.from("vergleiche").upsert({ id: v.id, data: v })
    ),
    ...SEED_DATA.baselineProfile.map((p) =>
      supabase!.from("baseline_profile").upsert({ id: p.id, data: p })
    ),
    supabase!.from("app_einstellungen").upsert({
      schluessel: "aktiveBaselineProfilId",
      wert: { value: SEED_DATA.aktiveBaselineProfilId },
    }),
  ]);
}

// ─────────────────────────────────────────────────────────────────────────────
// Öffentliche API (identisch für localStorage und Supabase)
// ─────────────────────────────────────────────────────────────────────────────

export async function ladeAppDataAsync(): Promise<AppData> {
  if (supabaseVerfuegbar) return ladeSupabase();
  return ladeLokal();
}

export function ladeAppData(): AppData {
  return ladeLokal();
}

export function speichereAppData(data: AppData): void {
  speichereLokal(data);
}

// ─── Angebote ─────────────────────────────────────────────────────────────────

export async function speichereAngebotAsync(angebot: Angebot): Promise<void> {
  const mit = { ...angebot, aktualisiertAm: new Date().toISOString() };
  if (supabase && supabaseVerfuegbar) {
    await supabase.from("angebote").upsert({ id: mit.id, data: mit });
  } else {
    const data = ladeLokal();
    const idx = data.angebote.findIndex((a) => a.id === mit.id);
    if (idx >= 0) data.angebote[idx] = mit;
    else data.angebote.push(mit);
    speichereLokal(data);
  }
}

export function speichereAngebot(angebot: Angebot): void {
  speichereAngebotAsync(angebot);
}

export async function loescheAngebotAsync(id: string): Promise<void> {
  if (supabase && supabaseVerfuegbar) {
    await supabase.from("angebote").delete().eq("id", id);
    // Aus Vergleichen entfernen
    const { data } = await supabase.from("vergleiche").select("id, data");
    if (data) {
      await Promise.all(
        data.map((r) => {
          const v = r.data as Vergleich;
          if (!v.angebotIds.includes(id)) return Promise.resolve();
          return supabase!.from("vergleiche").upsert({
            id: v.id,
            data: {
              ...v,
              angebotIds: v.angebotIds.filter((a) => a !== id),
              aktualisiertAm: new Date().toISOString(),
            },
          });
        })
      );
    }
  } else {
    const data = ladeLokal();
    data.angebote = data.angebote.filter((a) => a.id !== id);
    data.vergleiche = data.vergleiche.map((v) => ({
      ...v,
      angebotIds: v.angebotIds.filter((a) => a !== id),
    }));
    speichereLokal(data);
  }
}

export function loescheAngebot(id: string): void {
  loescheAngebotAsync(id);
}

export function ladeAngebot(id: string): Angebot | undefined {
  return ladeLokal().angebote.find((a) => a.id === id);
}

// ─── Vergleiche ───────────────────────────────────────────────────────────────

export async function speichereVergleichAsync(
  vergleich: Vergleich
): Promise<void> {
  const mit = { ...vergleich, aktualisiertAm: new Date().toISOString() };
  if (supabase && supabaseVerfuegbar) {
    await supabase.from("vergleiche").upsert({ id: mit.id, data: mit });
  } else {
    const data = ladeLokal();
    const idx = data.vergleiche.findIndex((v) => v.id === mit.id);
    if (idx >= 0) data.vergleiche[idx] = mit;
    else data.vergleiche.push(mit);
    speichereLokal(data);
  }
}

export function speichereVergleich(vergleich: Vergleich): void {
  speichereVergleichAsync(vergleich);
}

export function loescheVergleich(id: string): void {
  if (supabase && supabaseVerfuegbar) {
    supabase.from("vergleiche").delete().eq("id", id);
  } else {
    const data = ladeLokal();
    data.vergleiche = data.vergleiche.filter((v) => v.id !== id);
    speichereLokal(data);
  }
}

export function dupliziereVergleich(id: string): Vergleich | null {
  const data = ladeLokal();
  const original =
    data.vergleiche.find((v) => v.id === id) ?? null;
  if (!original) return null;
  const kopie: Vergleich = {
    ...original,
    id: generiereId(),
    name: `${original.name} (Kopie)`,
    erstelltAm: new Date().toISOString(),
    aktualisiertAm: new Date().toISOString(),
  };
  speichereVergleich(kopie);
  return kopie;
}

export function archiviereVergleich(id: string, archiviert: boolean): void {
  const data = ladeLokal();
  const v = data.vergleiche.find((v) => v.id === id);
  if (!v) return;
  speichereVergleich({ ...v, archiviert });
}

// ─── Baseline ─────────────────────────────────────────────────────────────────

export async function speichereBaselineProfilAsync(
  profil: BaselineProfil
): Promise<void> {
  if (supabase && supabaseVerfuegbar) {
    await supabase
      .from("baseline_profile")
      .upsert({ id: profil.id, data: profil });
  } else {
    const data = ladeLokal();
    const idx = data.baselineProfile.findIndex((p) => p.id === profil.id);
    if (idx >= 0) data.baselineProfile[idx] = profil;
    else data.baselineProfile.push(profil);
    speichereLokal(data);
  }
}

export function speichereBaselineProfil(profil: BaselineProfil): void {
  speichereBaselineProfilAsync(profil);
}

export async function setzeAktivesBaselineProfilAsync(
  id: string
): Promise<void> {
  if (supabase && supabaseVerfuegbar) {
    await supabase.from("app_einstellungen").upsert({
      schluessel: "aktiveBaselineProfilId",
      wert: { value: id },
    });
  } else {
    const data = ladeLokal();
    data.aktiveBaselineProfilId = id;
    speichereLokal(data);
  }
}

export function setzeAktivesBaselineProfil(id: string): void {
  setzeAktivesBaselineProfilAsync(id);
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

export function generiereId(): string {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

export function resetAufSeeds(): void {
  if (supabase && supabaseVerfuegbar) {
    seedsEinspielen();
  } else {
    speichereLokal(SEED_DATA);
  }
}
