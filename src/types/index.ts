export type EquipeType = 'Matin' | 'Soir';

export type CommandeStatut = 'en_attente' | 'acceptee' | 'livree' | 'annulee';

export interface Livreur {
  id: string;
  nom_complet: string;
  telephone: string;
  equipe: EquipeType;
  en_service: boolean;
  matricule?: string;
  secteur?: string;
  vehicule?: string;
  courses_aujourdhui?: number;
  created_at: string;
}

export interface Commande {
  id: string;
  code_court?: string;
  client_nom: string;
  client_telephone: string;
  adresse_livraison: string;
  zone: string;
  plats: string;
  montant_repas: number;
  frais_livraison: number;
  statut: CommandeStatut;
  equipe: EquipeType;
  livreur_id: string | null;
  livreur_nom?: string;
  livree_at: string | null;
  annulee_at: string | null;
  motif_annulation: string | null;
  duree_livraison: number | null; // in minutes
  created_at: string;
  updated_at: string;
}

export interface CommissionJournaliere {
  id: string;
  livreur_id: string;
  livreur_nom?: string;
  date_activite: string; // YYYY-MM-DD
  nb_courses: number;
  montant_commission: number; // 1000 FCFA
  payee: boolean;
  payee_at?: string;
}

export interface SuiviSuggestion {
  id: string;
  type: string;
  cible: string;
  valeur_avant: number;
  valeur_cible: number;
  action_label: string;
  date_debut: string;
  date_fin: string;
  statut: 'en_cours' | 'reussi' | 'echoue' | 'structurel';
  created_at: string;
}

export interface ZoneStat {
  name: string;
  value: number;
  color: string;
  delaiMoyen: number;
  meilleurCoursier: string;
  initials: string;
}

export interface TrancheStat {
  tranche: string;
  livraisons: number;
  tempsMoyen: number;
  statut: 'optimal' | 'modere' | 'critique';
}
