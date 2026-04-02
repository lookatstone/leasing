import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Maximale HTML-Länge, die wir an Claude senden (Token-Effizienz)
const MAX_TEXT_LAENGE = 12000;

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return NextResponse.json(
      { fehler: "Ungültige URL" },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { fehler: "ANTHROPIC_API_KEY nicht konfiguriert" },
      { status: 503 }
    );
  }

  // ─── 1. Seite abrufen ─────────────────────────────────────────────────────
  let seitenText: string;
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; EV-Leasing-Vergleich/1.0; +https://github.com/lookatstone/leasing)",
        "Accept-Language": "de-DE,de;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { fehler: `Seite nicht erreichbar (HTTP ${response.status})` },
        { status: 422 }
      );
    }

    const html = await response.text();
    seitenText = htmlZuText(html).slice(0, MAX_TEXT_LAENGE);
  } catch (err) {
    return NextResponse.json(
      {
        fehler:
          err instanceof Error
            ? `Seite konnte nicht geladen werden: ${err.message}`
            : "Unbekannter Fehler beim Laden der Seite",
      },
      { status: 422 }
    );
  }

  // ─── 2. Claude extrahiert die Daten ───────────────────────────────────────
  const prompt = `Du analysierst den Textinhalt einer deutschen Leasingangebots-Webseite und extrahierst strukturierte Daten.

Seiteninhalt:
<inhalt>
${seitenText}
</inhalt>

Extrahiere alle verfügbaren Leasingdaten und antworte NUR mit einem validen JSON-Objekt (kein Markdown, kein Text drumherum).

JSON-Schema (alle Felder optional außer den markierten):
{
  "titel": "string – Fahrzeugbezeichnung z.B. 'Opel Grandland Electric'",
  "anbieter": "string – Name des Leasinganbieters/Händlers",
  "portal": "string – Domain der Webseite",
  "fahrzeug": {
    "marke": "string *",
    "modell": "string *",
    "variante": "string",
    "neuOderGebraucht": "neu | gebraucht",
    "erstzulassung": "YYYY-MM-DD",
    "kilometerstand": "number",
    "batteriekapazitaetKwh": "number – Netto-kWh",
    "leistungKw": "number",
    "wltpReichweiteKm": "number",
    "anhaengerkupplung": "ja | nein | optional | unbekannt",
    "sonderausstattung": ["string"],
    "farbe": "string"
  },
  "konditionen": {
    "monatsrate": "number * – Monatsrate in EUR",
    "laufzeitMonate": "number * – z.B. 36 oder 48",
    "kmProJahr": "number * – z.B. 10000, 15000, 20000",
    "sonderzahlung": "number – Anzahlung/Sonderzahlung EUR (0 wenn keine)",
    "ueberfuehrungskosten": "number – EUR (0 wenn unbekannt)",
    "zulassungskosten": "number – EUR (0 wenn unbekannt)",
    "foerderungVomAnbieterEinkalkuliert": "eingerechnet | nicht_eingerechnet | unklar",
    "foerderungHoeheEuro": "number",
    "gapEnthalten": "enthalten | nicht_enthalten | unklar",
    "verfuegbarkeit": "sofort | kurz | mittel | lang | unbekannt",
    "spezielleBedingungen": "string"
  },
  "laufendeKosten": {
    "kfzSteuerProJahr": 0
  },
  "notizen": "string – Besonderheiten, die du auf der Seite findest"
}

Wichtige Hinweise:
- monatsrate: nur die monatliche Leasingrate, OHNE Versicherung
- foerderungVomAnbieterEinkalkuliert: 'eingerechnet' wenn Förderung/Prämie explizit in Rate enthalten, 'unklar' wenn unbekannt
- kmProJahr: exakt der Wert aus dem Angebot (nicht schätzen)
- Wenn ein Wert nicht vorhanden: Feld weglassen
- kfzSteuerProJahr immer 0 (Elektroauto)`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const antwort =
      message.content[0].type === "text" ? message.content[0].text : "";

    // JSON aus der Antwort extrahieren
    const jsonMatch = antwort.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { fehler: "Keine strukturierten Daten gefunden" },
        { status: 422 }
      );
    }

    const extrahiert = JSON.parse(jsonMatch[0]);

    // Fehlende Pflichtfelder mit Defaults auffüllen
    const ergebnis = {
      titel: extrahiert.titel ?? "",
      anbieter: extrahiert.anbieter ?? "",
      portal: extrahiert.portal ?? new URL(url).hostname,
      fahrzeug: {
        marke: extrahiert.fahrzeug?.marke ?? "",
        modell: extrahiert.fahrzeug?.modell ?? "",
        variante: extrahiert.fahrzeug?.variante,
        neuOderGebraucht: extrahiert.fahrzeug?.neuOderGebraucht ?? "neu",
        erstzulassung: extrahiert.fahrzeug?.erstzulassung,
        kilometerstand: extrahiert.fahrzeug?.kilometerstand,
        batteriekapazitaetKwh: extrahiert.fahrzeug?.batteriekapazitaetKwh,
        leistungKw: extrahiert.fahrzeug?.leistungKw,
        wltpReichweiteKm: extrahiert.fahrzeug?.wltpReichweiteKm,
        anhaengerkupplung: extrahiert.fahrzeug?.anhaengerkupplung ?? "unbekannt",
        sonderausstattung: extrahiert.fahrzeug?.sonderausstattung ?? [],
        farbe: extrahiert.fahrzeug?.farbe,
      },
      konditionen: {
        monatsrate: extrahiert.konditionen?.monatsrate ?? 0,
        laufzeitMonate: extrahiert.konditionen?.laufzeitMonate ?? 36,
        kmProJahr: extrahiert.konditionen?.kmProJahr ?? 20000,
        sonderzahlung: extrahiert.konditionen?.sonderzahlung ?? 0,
        ueberfuehrungskosten: extrahiert.konditionen?.ueberfuehrungskosten ?? 0,
        zulassungskosten: extrahiert.konditionen?.zulassungskosten ?? 0,
        foerderungVomAnbieterEinkalkuliert:
          extrahiert.konditionen?.foerderungVomAnbieterEinkalkuliert ?? "unklar",
        foerderungHoeheEuro: extrahiert.konditionen?.foerderungHoeheEuro,
        gapEnthalten: extrahiert.konditionen?.gapEnthalten ?? "unklar",
        verfuegbarkeit: extrahiert.konditionen?.verfuegbarkeit ?? "unbekannt",
        spezielleBedingungen: extrahiert.konditionen?.spezielleBedingungen,
      },
      laufendeKosten: {
        kfzSteuerProJahr: 0,
      },
      notizen: extrahiert.notizen,
    };

    return NextResponse.json({ angebot: ergebnis });
  } catch (err) {
    return NextResponse.json(
      {
        fehler:
          err instanceof Error
            ? `Extraktion fehlgeschlagen: ${err.message}`
            : "Unbekannter Fehler bei der Datenextraktion",
      },
      { status: 500 }
    );
  }
}

// ─── HTML → lesbarer Text ─────────────────────────────────────────────────────

function htmlZuText(html: string): string {
  return html
    // Scripts und Styles entfernen
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    // HTML-Tags entfernen
    .replace(/<[^>]+>/g, " ")
    // HTML-Entities dekodieren
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n)))
    // Whitespace normalisieren
    .replace(/\s+/g, " ")
    .trim();
}
