-- EV-Leasing Vergleich – Supabase Schema
-- Einmalig im SQL-Editor von Supabase ausführen.
-- Alle Daten werden als JSONB gespeichert (kein Migrations-Overhead).

create table if not exists angebote (
  id text primary key,
  data jsonb not null,
  erstellt_am timestamptz default now(),
  aktualisiert_am timestamptz default now()
);

create table if not exists vergleiche (
  id text primary key,
  data jsonb not null,
  erstellt_am timestamptz default now(),
  aktualisiert_am timestamptz default now()
);

create table if not exists baseline_profile (
  id text primary key,
  data jsonb not null
);

create table if not exists app_einstellungen (
  schluessel text primary key,
  wert jsonb not null
);

-- Automatische Aktualisierung von aktualisiert_am
create or replace function aktualisiert_am_setzen()
returns trigger as $$
begin
  new.aktualisiert_am = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger angebote_aktualisiert
  before update on angebote
  for each row execute function aktualisiert_am_setzen();

create or replace trigger vergleiche_aktualisiert
  before update on vergleiche
  for each row execute function aktualisiert_am_setzen();

-- Row Level Security deaktivieren für Single-User-Betrieb (MVP)
-- Für Multi-User: RLS aktivieren und Policies per auth.uid() definieren.
alter table angebote disable row level security;
alter table vergleiche disable row level security;
alter table baseline_profile disable row level security;
alter table app_einstellungen disable row level security;
