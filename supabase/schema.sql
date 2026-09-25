-- Eguette OPS Database Schema for Supabase
-- Based in Senegal, Dakar restaurant operations

-- 1. Table: livreurs
CREATE TABLE IF NOT EXISTS public.livreurs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricule TEXT,
  nom_complet TEXT NOT NULL,
  telephone TEXT NOT NULL,
  equipe TEXT NOT NULL CHECK (equipe IN ('Matin', 'Soir')),
  en_service BOOLEAN NOT NULL DEFAULT true,
  secteur TEXT,
  vehicule TEXT,
  courses_aujourdhui INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table: commandes
CREATE TABLE IF NOT EXISTS public.commandes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_court TEXT,
  client_nom TEXT NOT NULL,
  client_telephone TEXT NOT NULL,
  adresse_livraison TEXT NOT NULL,
  zone TEXT NOT NULL,
  plats TEXT NOT NULL,
  montant_repas NUMERIC NOT NULL DEFAULT 0,
  frais_livraison NUMERIC NOT NULL DEFAULT 1500,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente', 'acceptee', 'livree', 'annulee')),
  equipe TEXT NOT NULL CHECK (equipe IN ('Matin', 'Soir')),
  livreur_id UUID REFERENCES public.livreurs(id) ON DELETE SET NULL,
  livree_at TIMESTAMPTZ,
  annulee_at TIMESTAMPTZ,
  motif_annulation TEXT,
  duree_livraison INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table: commissions_journalieres
CREATE TABLE IF NOT EXISTS public.commissions_journalieres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livreur_id UUID NOT NULL REFERENCES public.livreurs(id) ON DELETE CASCADE,
  date_activite DATE NOT NULL DEFAULT CURRENT_DATE,
  nb_courses INTEGER NOT NULL DEFAULT 0,
  montant_commission NUMERIC NOT NULL DEFAULT 1000,
  payee BOOLEAN NOT NULL DEFAULT false,
  payee_at TIMESTAMPTZ,
  CONSTRAINT unique_livreur_date UNIQUE (livreur_id, date_activite)
);

-- 4. Table: suivi_suggestions
CREATE TABLE IF NOT EXISTS public.suivi_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  cible TEXT NOT NULL,
  valeur_avant NUMERIC,
  valeur_cible NUMERIC,
  action_label TEXT NOT NULL,
  date_debut TIMESTAMPTZ NOT NULL DEFAULT now(),
  date_fin TIMESTAMPTZ,
  statut TEXT NOT NULL DEFAULT 'en_cours' CHECK (statut IN ('en_cours', 'reussi', 'echoue', 'structurel')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.commandes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.livreurs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commissions_journalieres;
ALTER PUBLICATION supabase_realtime ADD TABLE public.suivi_suggestions;
