import React, { useState } from 'react';
import { X, UserPlus, Phone, User, Bike, MapPin } from 'lucide-react';
import { addLivreur } from '../lib/dataStore';
import { EquipeType } from '../types';

interface NewDriverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const NewDriverModal: React.FC<NewDriverModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [nomComplet, setNomComplet] = useState('');
  const [telephone, setTelephone] = useState('+221 ');
  const [equipe, setEquipe] = useState<EquipeType>('Matin');
  const [secteur, setSecteur] = useState('Plateau et Médina');
  const [vehicule, setVehicule] = useState('Scooter Yamaha 125');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomComplet.trim() || !telephone.trim()) return;

    setIsSubmitting(true);
    try {
      await addLivreur({
        nom_complet: nomComplet.trim(),
        telephone: telephone.trim(),
        equipe,
        en_service: true, // starts on service
        secteur: secteur.trim(),
        vehicule: vehicule.trim(),
      });

      setNomComplet('');
      setTelephone('+221 ');
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111c2e] p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#CC0000] flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[17px] text-gray-900 dark:text-white leading-tight">
                Ajouter un nouveau livreur
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Flotte active · Hub Dakar
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
              Nom et Prénom *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                placeholder="Ex: Moussa Ndiaye"
                value={nomComplet}
                onChange={(e) => setNomComplet(e.target.value)}
                className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Shift / Équipe *
              </label>
              <select
                value={equipe}
                onChange={(e) => setEquipe(e.target.value as EquipeType)}
                className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
              >
                <option value="Matin">Équipe Matin (12h00 — 20h00)</option>
                <option value="Soir">Équipe Soir (20h00 — Clôture)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Secteur prioritaire
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ex: Almadies et Ngor"
                  value={secteur}
                  onChange={(e) => setSecteur(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 mb-1">
                Véhicule
              </label>
              <div className="relative">
                <Bike className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ex: Moto Honda CG"
                  value={vehicule}
                  onChange={(e) => setVehicule(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:border-[#CC0000]"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[13px] font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full text-[13px] font-semibold bg-[#CC0000] hover:bg-[#b00000] text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer le coursier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
