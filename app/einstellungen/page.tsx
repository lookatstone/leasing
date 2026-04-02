"use client";

import * as React from "react";
import { Save, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppData } from "@/hooks/useAppData";
import { resetAufSeeds, generiereId } from "@/lib/storage";
import type { BaselineProfil } from "@/types";

export default function EinstellungenPage() {
  const { data, geladen, baselineSpeichern, aktiveBaselineSetzen, reload } =
    useAppData();

  const [resetOffen, setResetOffen] = React.useState(false);

  if (!geladen || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Daten werden geladen …
      </div>
    );
  }

  const handleReset = () => {
    resetAufSeeds();
    reload();
    setResetOffen(false);
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Einstellungen</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Baseline-Profile und Standardannahmen für den Vergleich
        </p>
      </div>

      {/* Aktives Profil */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Baseline-Profile</h2>
        <p className="text-sm text-muted-foreground">
          Das aktive Profil legt die Vergleichsbasis für alle Angebote fest:
          Kilometerleistung, Mindestlaufzeit und Batterieerwartung.
        </p>
        {data.baselineProfile.map((profil) => (
          <BaselineProfilKarte
            key={profil.id}
            profil={profil}
            aktiv={profil.id === data.aktiveBaselineProfilId}
            onAktivieren={() => aktiveBaselineSetzen(profil.id)}
            onSpeichern={baselineSpeichern}
          />
        ))}
      </div>

      <Separator />

      {/* Daten-Management */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Daten</h2>
        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-sm">Gespeicherte Daten</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.angebote.length} Angebote · {data.vergleiche.length} Vergleiche
                </p>
                <p className="text-xs text-muted-foreground">
                  Gespeichert im Browser-Speicher (localStorage)
                </p>
              </div>
            </div>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Die Daten werden lokal im Browser gespeichert. Bei Löschen des
                Browser-Caches gehen sie verloren. Für dauerhaftes Speichern
                empfiehlt sich ein späteres Datenbankbackend (z. B. Supabase).
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:text-destructive border-destructive/30"
              onClick={() => setResetOffen(true)}
            >
              <RotateCcw className="h-4 w-4" />
              Auf Seed-Daten zurücksetzen
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Über diese App</h2>
        <Card>
          <CardContent className="p-5 space-y-2">
            <p className="text-sm font-medium">EV-Leasing Vergleich</p>
            <p className="text-xs text-muted-foreground">
              Transparenter Vergleich von Elektroauto-Leasingangeboten für
              Privatpersonen in Deutschland.
            </p>
            <p className="text-xs text-muted-foreground">
              Alle Berechnungen erfolgen lokal im Browser. Keine Daten werden
              übertragen.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reset-Dialog */}
      <Dialog open={resetOffen} onOpenChange={setResetOffen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auf Seed-Daten zurücksetzen?</DialogTitle>
            <DialogDescription>
              Alle selbst erfassten Angebote und Vergleiche werden gelöscht und
              durch die ursprünglichen Beispieldaten ersetzt. Diese Aktion kann
              nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOffen(false)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Zurücksetzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Baseline-Profil Karte ────────────────────────────────────────────────────

function BaselineProfilKarte({
  profil,
  aktiv,
  onAktivieren,
  onSpeichern,
}: {
  profil: BaselineProfil;
  aktiv: boolean;
  onAktivieren: () => void;
  onSpeichern: (p: BaselineProfil) => void;
}) {
  const [bearbeiten, setBearbeiten] = React.useState(false);
  const [lokal, setLokal] = React.useState<BaselineProfil>(profil);
  const [gespeichert, setGespeichert] = React.useState(false);

  React.useEffect(() => {
    setLokal(profil);
  }, [profil]);

  const handleSpeichern = () => {
    onSpeichern(lokal);
    setBearbeiten(false);
    setGespeichert(true);
    setTimeout(() => setGespeichert(false), 2000);
  };

  const updateLokal = (key: keyof BaselineProfil, value: unknown) => {
    setLokal((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className={aktiv ? "border-primary ring-1 ring-primary" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {profil.name}
              {aktiv && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  Aktiv
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs">
              {profil.kmProJahr.toLocaleString("de-DE")} km/Jahr ·{" "}
              {profil.mindestLaufzeitMonate} Mo. Mindestlaufzeit ·{" "}
              ab {profil.mindestBatterieKwh} kWh
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {!aktiv && (
              <Button variant="outline" size="sm" onClick={onAktivieren}>
                Aktivieren
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBearbeiten(!bearbeiten)}
            >
              {bearbeiten ? "Abbrechen" : "Bearbeiten"}
            </Button>
          </div>
        </div>
      </CardHeader>

      {bearbeiten && (
        <CardContent className="space-y-4 border-t pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormFeld
              label="Name"
              id="name"
              type="text"
              value={lokal.name}
              onChange={(v) => updateLokal("name", v)}
            />
            <FormFeld
              label="km pro Jahr"
              id="km"
              type="number"
              value={lokal.kmProJahr}
              onChange={(v) => updateLokal("kmProJahr", parseInt(v) || 0)}
              hint="Vergleichsstandard für alle Angebote"
            />
            <FormFeld
              label="Mindestlaufzeit (Monate)"
              id="laufzeit"
              type="number"
              value={lokal.mindestLaufzeitMonate}
              onChange={(v) =>
                updateLokal("mindestLaufzeitMonate", parseInt(v) || 0)
              }
            />
            <FormFeld
              label="Mindest-Batteriegröße (kWh)"
              id="minBatterie"
              type="number"
              value={lokal.mindestBatterieKwh}
              onChange={(v) =>
                updateLokal("mindestBatterieKwh", parseFloat(v) || 0)
              }
              hint="Unterhalb dieser Grenze → Warnung"
            />
            <FormFeld
              label="Bevorzugte Batteriegröße (kWh)"
              id="zielBatterie"
              type="number"
              value={lokal.bevorzugteBatterieKwh}
              onChange={(v) =>
                updateLokal("bevorzugteBatterieKwh", parseFloat(v) || 0)
              }
              hint="Unterhalb → Hinweis"
            />
          </div>

          <div className="flex flex-col gap-3">
            <SwitchFeld
              label="Versicherung als Pflicht"
              beschreibung="Warnung, wenn keine Versicherung angegeben"
              checked={lokal.versicherungPflicht}
              onChange={(v) => updateLokal("versicherungPflicht", v)}
            />
            <SwitchFeld
              label="GAP-Status sichtbar"
              beschreibung="Hinweis, wenn GAP unklar"
              checked={lokal.gapSichtbarPflicht}
              onChange={(v) => updateLokal("gapSichtbarPflicht", v)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setBearbeiten(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSpeichern}>
              <Save className="h-4 w-4" />
              {gespeichert ? "Gespeichert ✓" : "Speichern"}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

function FormFeld({
  label,
  id,
  type,
  value,
  onChange,
  hint,
}: {
  label: string;
  id: string;
  type: "text" | "number";
  value: string | number;
  onChange: (v: string) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function SwitchFeld({
  label,
  beschreibung,
  checked,
  onChange,
}: {
  label: string;
  beschreibung: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{beschreibung}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
