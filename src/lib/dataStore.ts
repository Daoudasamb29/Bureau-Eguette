import { Commande, Livreur, CommissionJournaliere, EquipeType, CommandeStatut } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Real restaurant operating hours:
 * Vendredi:  12:00–04:00
 * Samedi:    12:00–06:30
 * Dimanche:  12:00–00:00
 * Lundi:     00:00–06:30, 12:00–04:00
 * Mardi:     12:00–04:00
 * Mercredi:  12:00–04:00
 * Jeudi:     12:00–04:00
 */
export interface ScheduleDay {
  jour: string;
  horaires: string;
  isNuitExtended?: boolean;
}

export const RESTAURANT_SCHEDULE: Record<number, ScheduleDay> = {
  0: { jour: 'Dimanche', horaires: '12:00 – 00:00' },
  1: { jour: 'Lundi', horaires: '00:00 – 06:30, 12:00 – 04:00', isNuitExtended: true },
  2: { jour: 'Mardi', horaires: '12:00 – 04:00' },
  3: { jour: 'Mercredi', horaires: '12:00 – 04:00' },
  4: { jour: 'Jeudi', horaires: '12:00 – 04:00' },
  5: { jour: 'Vendredi', horaires: '12:00 – 04:00' },
  6: { jour: 'Samedi', horaires: '12:00 – 06:30', isNuitExtended: true },
};

export const WEEKLY_SCHEDULE_ORDER: ScheduleDay[] = [
  { jour: 'Lundi', horaires: '00:00–06:30, 12:00–04:00' },
  { jour: 'Mardi', horaires: '12:00–04:00' },
  { jour: 'Mercredi', horaires: '12:00–04:00' },
  { jour: 'Jeudi', horaires: '12:00–04:00' },
  { jour: 'Vendredi', horaires: '12:00–04:00' },
  { jour: 'Samedi', horaires: '12:00–06:30' },
  { jour: 'Dimanche', horaires: '12:00–00:00' },
];

export function getTodaysSchedule(): ScheduleDay {
  const day = new Date().getDay();
  return RESTAURANT_SCHEDULE[day] || RESTAURANT_SCHEDULE[5];
}

/**
 * Calculates current active team from browser local time:
 * Between 12:00 and 20:00 -> "Matin", otherwise "Soir".
 */
export function getCurrentEquipe(): EquipeType {
  const now = new Date();
  const hours = now.getHours();
  if (hours >= 12 && hours < 20) {
    return 'Matin';
  }
  return 'Soir';
}

/**
 * Format currency in FCFA (e.g. "14 500 FCFA")
 * Rules: Never use '&' symbol.
 */
export function formatFCFA(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} FCFA`;
}

// Initial seed drivers matching screenshots and Dakar context
const INITIAL_LIVREURS: Livreur[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    matricule: '#LIV-084',
    nom_complet: 'Mamadou Diop',
    telephone: '+221 77 452 19 88',
    equipe: 'Matin',
    en_service: true,
    secteur: 'Plateau et Médina',
    vehicule: 'Scooter Yamaha 125',
    courses_aujourdhui: 6,
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    matricule: '#LIV-091',
    nom_complet: 'Alioune Sarr',
    telephone: '+221 76 991 32 10',
    equipe: 'Matin',
    en_service: true,
    secteur: 'Almadies et Ngor',
    vehicule: 'Moto Honda CG',
    courses_aujourdhui: 8,
    created_at: new Date(Date.now() - 3600000 * 24 * 25).toISOString(),
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    matricule: '#LIV-102',
    nom_complet: 'Babacar Faye',
    telephone: '+221 70 811 05 34',
    equipe: 'Matin',
    en_service: false,
    secteur: 'Ouakam',
    vehicule: 'Scooter Piaggio',
    courses_aujourdhui: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 20).toISOString(),
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    matricule: '#LIV-119',
    nom_complet: 'Oumar Fall',
    telephone: '+221 78 504 22 17',
    equipe: 'Soir',
    en_service: true,
    secteur: 'Fann et Point E',
    vehicule: 'Scooter Kymco',
    courses_aujourdhui: 4,
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    matricule: '#LIV-124',
    nom_complet: 'Cheikh Tidiane Ndiaye',
    telephone: '+221 77 638 90 12',
    equipe: 'Soir',
    en_service: false,
    secteur: 'Grand Yoff',
    vehicule: 'Moto Suzuki',
    courses_aujourdhui: 0,
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    matricule: '#LIV-104',
    nom_complet: 'Ibrahima Fall',
    telephone: '+221 77 123 45 67',
    equipe: 'Soir',
    en_service: true,
    secteur: 'Médina',
    vehicule: 'Scooter SYM 125',
    courses_aujourdhui: 5,
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
  },
];

// Initial seed orders matching screenshots
const INITIAL_COMMANDES: Commande[] = [
  {
    id: 'cmd-4092',
    code_court: '#4092',
    client_nom: 'Aïssatou Diallo',
    client_telephone: '+221 77 345 67 89',
    adresse_livraison: 'Rue Félix Faure, Plateau',
    zone: 'Plateau',
    plats: '2x Thiéboudienne Penda, 2x Bissap 50cl',
    montant_repas: 13000,
    frais_livraison: 1500,
    statut: 'acceptee',
    equipe: 'Matin',
    livreur_id: '11111111-1111-4111-8111-111111111111',
    livree_at: null,
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: null,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: 'cmd-4091',
    code_court: '#4091',
    client_nom: 'Cheikh Ndiaye',
    client_telephone: '+221 76 222 33 44',
    adresse_livraison: 'Route des Almadies, en face King Fahd',
    zone: 'Almadies',
    plats: "1x Dibi d'agneau grillé, 1x Frites maison",
    montant_repas: 7500,
    frais_livraison: 1500,
    statut: 'livree',
    equipe: 'Matin',
    livreur_id: '22222222-2222-4222-8222-222222222222',
    livree_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: 22,
    created_at: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'cmd-4090',
    code_court: '#4090',
    client_nom: 'Fatou Binetou',
    client_telephone: '+221 78 444 55 66',
    adresse_livraison: 'Cité Comico, Ouakam',
    zone: 'Ouakam',
    plats: '3x Yassa Poulet braisé, 1x Alloco',
    montant_repas: 16500,
    frais_livraison: 1500,
    statut: 'en_attente',
    equipe: 'Matin',
    livreur_id: null,
    livree_at: null,
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: null,
    created_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'cmd-4089',
    code_court: '#4089',
    client_nom: 'Ibrahim Ba',
    client_telephone: '+221 70 999 11 22',
    adresse_livraison: 'Rue 22 angle Blaise Diagne, Médina',
    zone: 'Médina',
    plats: '1x Burger Dakarois Dibi, 1x Jus de Bouye',
    montant_repas: 5000,
    frais_livraison: 1500,
    statut: 'livree',
    equipe: 'Matin',
    livreur_id: '11111111-1111-4111-8111-111111111111',
    livree_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: 30,
    created_at: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    id: 'cmd-4088',
    code_court: '#4088',
    client_nom: 'Marie Gomis',
    client_telephone: '+221 77 888 77 66',
    adresse_livraison: 'BCEAO Yoff Tonghor',
    zone: 'Yoff et Ngor',
    plats: '2x Mafé Boeuf traditionnel',
    montant_repas: 10500,
    frais_livraison: 1500,
    statut: 'annulee',
    equipe: 'Matin',
    livreur_id: null,
    livree_at: null,
    annulee_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    motif_annulation: 'Rupture sauces accompagnement en cuisine',
    duree_livraison: null,
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: 'cmd-4087',
    code_court: '#4087',
    client_nom: 'Samba Diaw',
    client_telephone: '+221 78 123 99 88',
    adresse_livraison: 'Point E, rue de Kaolack',
    zone: 'Fann et Point E',
    plats: '1x Thiéboudienne Rouge Royale, 1x Canette Vimto',
    montant_repas: 8000,
    frais_livraison: 1200,
    statut: 'livree',
    equipe: 'Matin',
    livreur_id: '44444444-4444-4444-8444-444444444444',
    livree_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: 21,
    created_at: new Date(Date.now() - 1000 * 60 * 111).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'cmd-4086',
    code_court: '#4086',
    client_nom: 'Khadija Sow',
    client_telephone: '+221 76 654 32 10',
    adresse_livraison: 'Ngor Virage, Résidence Océan',
    zone: 'Almadies',
    plats: '2x Dibi Agneau Royal, 2x Bissap Menthe',
    montant_repas: 17000,
    frais_livraison: 1500,
    statut: 'livree',
    equipe: 'Matin',
    livreur_id: '22222222-2222-4222-8222-222222222222',
    livree_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: 24,
    created_at: new Date(Date.now() - 1000 * 60 * 144).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'cmd-4085',
    code_court: '#4085',
    client_nom: 'Modou Lô',
    client_telephone: '+221 77 987 65 43',
    adresse_livraison: 'Médina Rue 6, Dakar',
    zone: 'Médina',
    plats: '1x Poisson Braisé Royal',
    montant_repas: 9500,
    frais_livraison: 1500,
    statut: 'annulee',
    equipe: 'Matin',
    livreur_id: null,
    livree_at: null,
    annulee_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
    motif_annulation: 'Dépassement de créneau Médina (+38 min)',
    duree_livraison: null,
    created_at: new Date(Date.now() - 1000 * 60 * 190).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 150).toISOString(),
  }
];

// Initial commissions
const INITIAL_COMMISSIONS: CommissionJournaliere[] = [
  {
    id: 'comm-1',
    livreur_id: '11111111-1111-4111-8111-111111111111',
    livreur_nom: 'Mamadou Diop',
    date_activite: new Date().toISOString().split('T')[0],
    nb_courses: 5,
    montant_commission: 1000,
    payee: false,
  },
  {
    id: 'comm-2',
    livreur_id: '22222222-2222-4222-8222-222222222222',
    livreur_nom: 'Alioune Sarr',
    date_activite: new Date().toISOString().split('T')[0],
    nb_courses: 8,
    montant_commission: 1000,
    payee: true,
    payee_at: '14:10',
  },
  {
    id: 'comm-3',
    livreur_id: '44444444-4444-4444-8444-444444444444',
    livreur_nom: 'Oumar Fall',
    date_activite: new Date().toISOString().split('T')[0],
    nb_courses: 4,
    montant_commission: 1000,
    payee: false,
  },
  {
    id: 'comm-4',
    livreur_id: '66666666-6666-4666-8666-666666666666',
    livreur_nom: 'Ibrahima Fall',
    date_activite: new Date().toISOString().split('T')[0],
    nb_courses: 5,
    montant_commission: 1000,
    payee: false,
  },
];

// In-browser / In-memory Event Bus for Realtime synchronization
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyChange() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error(e);
    }
  });

  // Cross-tab broadcast
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('eguette_ops_sync');
      channel.postMessage({ timestamp: Date.now() });
      channel.close();
    } catch {
      // ignore
    }
  }
}

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    const channel = new BroadcastChannel('eguette_ops_sync');
    channel.onmessage = () => {
      listeners.forEach((fn) => fn());
    };
  } catch {
    // ignore
  }
}

// Local storage keys
const KEY_COMMANDES = 'eguette_ops_commandes_v2';
const KEY_LIVREURS = 'eguette_ops_livreurs_v2';
const KEY_COMMISSIONS = 'eguette_ops_commissions_v2';

export function getLocalLivreurs(): Livreur[] {
  try {
    const stored = localStorage.getItem(KEY_LIVREURS);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  return INITIAL_LIVREURS;
}

export function saveLocalLivreurs(livreurs: Livreur[]) {
  try {
    localStorage.setItem(KEY_LIVREURS, JSON.stringify(livreurs));
  } catch {
    // ignore
  }
  notifyChange();
}

export function getLocalCommandes(): Commande[] {
  try {
    const stored = localStorage.getItem(KEY_COMMANDES);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  return INITIAL_COMMANDES;
}

export function saveLocalCommandes(commandes: Commande[]) {
  try {
    localStorage.setItem(KEY_COMMANDES, JSON.stringify(commandes));
  } catch {
    // ignore
  }
  notifyChange();
}

export function getLocalCommissions(): CommissionJournaliere[] {
  try {
    const stored = localStorage.getItem(KEY_COMMISSIONS);
    if (stored) return JSON.parse(stored);
  } catch {
    // fallback
  }
  return INITIAL_COMMISSIONS;
}

export function saveLocalCommissions(commissions: CommissionJournaliere[]) {
  try {
    localStorage.setItem(KEY_COMMISSIONS, JSON.stringify(commissions));
  } catch {
    // ignore
  }
  notifyChange();
}

// Subscribe to store updates
export function subscribeToDataChanges(callback: () => void): () => void {
  listeners.add(callback);

  // If Supabase is configured, subscribe to Supabase Realtime changes
  let supabaseChannel: any = null;
  if (isSupabaseConfigured && supabase) {
    const channelId = `realtime-ops-${Math.random().toString(36).substring(2, 9)}`;
    supabaseChannel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, () => {
        callback();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'livreurs' }, () => {
        callback();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commissions_journalieres' }, () => {
        callback();
      })
      .subscribe();
  }

  return () => {
    listeners.delete(callback);
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

// Operations API

export async function fetchLivreurs(): Promise<Livreur[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('livreurs').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Livreur[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local store:', e);
    }
  }
  return getLocalLivreurs();
}

export async function addLivreur(livreurData: Omit<Livreur, 'id' | 'created_at'>): Promise<Livreur> {
  const newLivreur: Livreur = {
    ...livreurData,
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `liv-${Date.now()}`,
    matricule: livreurData.matricule || `#LIV-${Math.floor(100 + Math.random() * 900)}`,
    courses_aujourdhui: 0,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('livreurs').insert([newLivreur]);
    } catch (e) {
      console.warn('Supabase insert failed:', e);
    }
  }

  const list = getLocalLivreurs();
  saveLocalLivreurs([newLivreur, ...list]);
  return newLivreur;
}

export async function toggleLivreurService(id: string): Promise<Livreur | null> {
  const list = getLocalLivreurs();
  const index = list.findIndex((l) => l.id === id);
  if (index === -1) return null;

  const updated: Livreur = {
    ...list[index],
    en_service: !list[index].en_service,
  };

  list[index] = updated;
  saveLocalLivreurs([...list]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('livreurs').update({ en_service: updated.en_service }).eq('id', id);
    } catch (e) {
      console.warn('Supabase toggle failed:', e);
    }
  }

  return updated;
}

export async function fetchCommandes(): Promise<Commande[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from('commandes').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as Commande[];
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local store:', e);
    }
  }
  return getLocalCommandes();
}

export async function createCommande(params: {
  client_nom: string;
  client_telephone: string;
  adresse_livraison: string;
  zone: string;
  plats: string;
  montant_repas: number;
  frais_livraison: number;
}): Promise<Commande> {
  // Business logic:
  // - "The equipe is automatically calculated from browser local time. Between 11:00 and 21:00 -> Matin, else Soir"
  // - "When a new order is created, status is 'en_attente', livreur_id and livree_at must be null"
  const currentEquipe = getCurrentEquipe();
  const nextNum = Math.floor(4000 + Math.random() * 900);
  const nowStr = new Date().toISOString();

  const newOrder: Commande = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cmd-${Date.now()}`,
    code_court: `#${nextNum}`,
    client_nom: params.client_nom,
    client_telephone: params.client_telephone,
    adresse_livraison: params.adresse_livraison,
    zone: params.zone,
    plats: params.plats,
    montant_repas: params.montant_repas,
    frais_livraison: params.frais_livraison,
    statut: 'en_attente',
    equipe: currentEquipe,
    livreur_id: null,
    livree_at: null,
    annulee_at: null,
    motif_annulation: null,
    duree_livraison: null,
    created_at: nowStr,
    updated_at: nowStr,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commandes').insert([newOrder]);
    } catch (e) {
      console.warn('Supabase create failed:', e);
    }
  }

  const list = getLocalCommandes();
  saveLocalCommandes([newOrder, ...list]);
  return newOrder;
}

export async function assignDriver(commandeId: string, livreurId: string): Promise<Commande | null> {
  // Business logic:
  // "Assigning a driver sets livreur_id and changes the status to 'acceptee'."
  const list = getLocalCommandes();
  const index = list.findIndex((c) => c.id === commandeId);
  if (index === -1) return null;

  const updated: Commande = {
    ...list[index],
    livreur_id: livreurId,
    statut: 'acceptee',
    updated_at: new Date().toISOString(),
  };

  list[index] = updated;
  saveLocalCommandes([...list]);

  // Update driver courses count
  const drivers = getLocalLivreurs();
  const dIndex = drivers.findIndex((d) => d.id === livreurId);
  if (dIndex !== -1) {
    drivers[dIndex] = {
      ...drivers[dIndex],
      courses_aujourdhui: (drivers[dIndex].courses_aujourdhui || 0) + 1,
    };
    saveLocalLivreurs([...drivers]);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commandes').update({ livreur_id: livreurId, statut: 'acceptee', updated_at: updated.updated_at }).eq('id', commandeId);
    } catch (e) {
      console.warn('Supabase assign failed:', e);
    }
  }

  return updated;
}

export async function refuseDriver(commandeId: string): Promise<Commande | null> {
  // Business logic:
  // "When a driver refuses, livreur_id is set back to null and status to 'en_attente'."
  const list = getLocalCommandes();
  const index = list.findIndex((c) => c.id === commandeId);
  if (index === -1) return null;

  const updated: Commande = {
    ...list[index],
    livreur_id: null,
    statut: 'en_attente',
    updated_at: new Date().toISOString(),
  };

  list[index] = updated;
  saveLocalCommandes([...list]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commandes').update({ livreur_id: null, statut: 'en_attente', updated_at: updated.updated_at }).eq('id', commandeId);
    } catch (e) {
      console.warn('Supabase refuse failed:', e);
    }
  }

  return updated;
}

export async function markAsDelivered(commandeId: string): Promise<Commande | null> {
  const list = getLocalCommandes();
  const index = list.findIndex((c) => c.id === commandeId);
  if (index === -1) return null;

  const now = new Date();
  const created = new Date(list[index].created_at);
  const diffMinutes = Math.max(12, Math.round((now.getTime() - created.getTime()) / 60000));

  const updated: Commande = {
    ...list[index],
    statut: 'livree',
    livree_at: now.toISOString(),
    duree_livraison: diffMinutes,
    updated_at: now.toISOString(),
  };

  list[index] = updated;
  saveLocalCommandes([...list]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commandes').update({
        statut: 'livree',
        livree_at: updated.livree_at,
        duree_livraison: diffMinutes,
        updated_at: updated.updated_at,
      }).eq('id', commandeId);
    } catch (e) {
      console.warn('Supabase delivered failed:', e);
    }
  }

  return updated;
}

export async function cancelCommande(commandeId: string, motif: string): Promise<Commande | null> {
  const list = getLocalCommandes();
  const index = list.findIndex((c) => c.id === commandeId);
  if (index === -1) return null;

  const now = new Date().toISOString();
  const updated: Commande = {
    ...list[index],
    statut: 'annulee',
    annulee_at: now,
    motif_annulation: motif,
    updated_at: now,
  };

  list[index] = updated;
  saveLocalCommandes([...list]);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commandes').update({
        statut: 'annulee',
        annulee_at: now,
        motif_annulation: motif,
        updated_at: now,
      }).eq('id', commandeId);
    } catch (e) {
      console.warn('Supabase cancel failed:', e);
    }
  }

  return updated;
}

export async function payCommission(commissionId: string): Promise<void> {
  const list = getLocalCommissions();
  const index = list.findIndex((c) => c.id === commissionId);
  if (index !== -1) {
    list[index] = {
      ...list[index],
      payee: true,
      payee_at: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };
    saveLocalCommissions([...list]);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('commissions_journalieres').update({ payee: true }).eq('id', commissionId);
    } catch (e) {
      console.warn('Supabase pay commission failed:', e);
    }
  }
}
