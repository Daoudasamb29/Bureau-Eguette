import React, { useState } from 'react';
import { X, Plus, ShoppingBag, MapPin, Phone, User, DollarSign } from 'lucide-react';
import { createCommande, getCurrentEquipe, formatFCFA } from '../lib/dataStore';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onCreated }) => {
  const currentEquipe = getCurrentEquipe();

  const [clientNom, setClientNom] = useState('');
  const [clientTelephone, setClientTelephone] = useState('+221 ');
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [zone, setZone] = useState('Plateau');
  const [plats, setPlats] = useState('');
  const [montantRepas, setMontantRepas] = useState<number | ''>(10000);
  const [fraisLivraison, setFraisLivraison] = useState<number | ''>(1500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const zonesDakar = [
    'Plateau',
    'Almadies',
    'Ouakam',
    'Médina',
    'Yoff et Ngor',
    'Fann et Point E',
    'Mermoz et Sacré-Cœur',
    'Grand Dakar',
  ];

  const quickPlats = [
    'Thiéboudienne Penda',
    'Yassa Poulet Braisé',
    "Dibi d'Agneau Grillé",
    'Mafé Boeuf',
    'Poisson Braisé Royal',
    'Bissap Menthe 50cl',
  ];

  const handleAddDish = (dish: string) => {
    if (!plats) {
      setPlats(`1x ${dish}`);
    } else {
      setPlats(`${plats}, 1x ${dish}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNom.trim() || !adresseLivraison.trim() || !plats.trim()) return;

    setIsSubmitting(true);
    try {
      await createCommande({
        client_nom: clientNom.trim(),
        client_telephone: clientTelephone.trim(),
        adresse_livraison: adresseLivraison.trim(),
        zone,
        plats: plats.trim(),
        montant_repas: Number(montantRepas) || 0,
        frais_livraison: Number(fraisLivraison) || 0,
      });

      // Reset
      setClientNom('');
      setClientTelephone('+221 ');
      setAdresseLivraison('');
      setPlats('');
      setMontantRepas(10000);
      setFraisLivraison(1500);

      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = (Number(montantRepas) || 0) + (Number(fraisLivraison) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111c2e] p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#CC0000] flex items-center justify-center text-white">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[18px] text-gray-900 dark:text-white leading-tight">
                Nouvelle commande
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Équipe assignée automatiquement :{' '}
                <span className="font-bold text-[#CC0000]">{currentEquipe}</span> (11h–21h = Matin)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Nom du client *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Aïssatou Diallo"
                  value={clientNom}
                  onChange={(e) => setClientNom(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Téléphone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  required
                  placeholder="+221 77 000 00 00"
                  value={clientTelephone}
                  onChange={(e) => setClientTelephone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
                />
              </div>
            </div>
          </div>

          {/* Address & Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Zone de livraison *
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
              >
                {zonesDakar.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Adresse exacte *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder="Ex: Rue 6 angle Blaise Diagne"
                  value={adresseLivraison}
                  onChange={(e) => setAdresseLivraison(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
                />
              </div>
            </div>
          </div>

          {/* Plats Commandés */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Plats commandés *
              </label>
              <span className="text-[11px] text-gray-400">Cliquez pour ajouter rapidement :</span>
            </div>

            {/* Quick add tags */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickPlats.map((dish) => (
                <button
                  key={dish}
                  type="button"
                  onClick={() => handleAddDish(dish)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-[#ffdad4] hover:text-[#CC0000] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{dish}</span>
                </button>
              ))}
            </div>

            <textarea
              required
              rows={2}
              placeholder="Ex: 2x Thiéboudienne Penda, 1x Bissap 50cl"
              value={plats}
              onChange={(e) => setPlats(e.target.value)}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
            />
          </div>

          {/* Montant repas & Frais livraison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Montant repas (FCFA) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={montantRepas}
                  onChange={(e) => setMontantRepas(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Frais de livraison (FCFA) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  required
                  min={0}
                  step={500}
                  value={fraisLivraison}
                  onChange={(e) => setFraisLivraison(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000] tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* Total summary bar */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#EFF4FF] dark:bg-slate-800 text-[#0b1c30] dark:text-white">
            <span className="text-[12px] font-medium text-gray-600 dark:text-slate-300">
              Total à encaisser :
            </span>
            <span className="font-heading font-bold text-[16px] text-[#CC0000] tabular-nums">
              {formatFCFA(total)}
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[13px] font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-full text-[13px] font-semibold bg-[#CC0000] hover:bg-[#b00000] text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Création...' : 'Créer la commande'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
