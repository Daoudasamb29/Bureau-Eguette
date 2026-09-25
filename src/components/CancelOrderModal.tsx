import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  X,
  Check,
  PhoneOff,
  MapPinOff,
  PackageX,
  Clock,
  CreditCard,
  FileText,
  AlertCircle,
  Info,
} from 'lucide-react';
import { cancelCommande, formatFCFA } from '../lib/dataStore';
import { Commande } from '../types';

interface CancelOrderModalProps {
  isOpen: boolean;
  commande: Commande | null;
  onClose: () => void;
  onCancelled: () => void;
}

export interface MotifItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  isCustom?: boolean;
}

export const MOTIFS_ANNULATION: MotifItem[] = [
  {
    id: 'client_injoignable',
    title: 'Client injoignable',
    description: "Le client ne répond pas aux appels ni aux messages après l'arrivée au point de livraison",
    icon: PhoneOff,
  },
  {
    id: 'adresse_introuvable',
    title: 'Adresse introuvable',
    description: "Repères ou indications d'adresse insuffisants / zone inaccessible",
    icon: MapPinOff,
  },
  {
    id: 'rupture_stock',
    title: 'Rupture de stock',
    description: "Le restaurant ou point relais n'a plus les plats demandés",
    icon: PackageX,
  },
  {
    id: 'attente_trop_longue',
    title: 'Attente trop longue',
    description: "Délai de préparation excessif au restaurant pénalisant la tournée",
    icon: Clock,
  },
  {
    id: 'probleme_paiement',
    title: 'Problème paiement',
    description: "Échec de la transaction Wave / Orange Money ou client sans espèces",
    icon: CreditCard,
  },
  {
    id: 'autre_motif',
    title: 'Autre motif',
    description: "Permet au coursier de saisir une explication personnalisée dans un champ texte libre",
    icon: FileText,
    isCustom: true,
  },
];

export const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  isOpen,
  commande,
  onClose,
  onCancelled,
}) => {
  const [selectedMotifTitle, setSelectedMotifTitle] = useState<string>('Client injoignable');
  const [customComment, setCustomComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset state when modal opens with a new order
  useEffect(() => {
    if (isOpen) {
      setSelectedMotifTitle('Client injoignable');
      setCustomComment('');
      setErrorMessage(null);
    }
  }, [isOpen, commande?.id]);

  if (!isOpen || !commande) return null;

  const isCustomSelected = selectedMotifTitle === 'Autre motif';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation for custom motif
    if (isCustomSelected && !customComment.trim()) {
      setErrorMessage('Veuillez préciser le motif personnalisé de l’annulation.');
      return;
    }

    // Build the final motif string
    let finalMotif = selectedMotifTitle;
    if (isCustomSelected) {
      finalMotif = `Autre motif : ${customComment.trim()}`;
    } else if (customComment.trim()) {
      finalMotif = `${selectedMotifTitle} (${customComment.trim()})`;
    }

    setIsSubmitting(true);
    try {
      await cancelCommande(commande.id, finalMotif);
      onCancelled();
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage('Une erreur est survenue lors de l’annulation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#111c2e] p-5 sm:p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-[#CC0000] shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-heading font-bold text-[18px] text-gray-900 dark:text-white leading-tight">
                  Annuler la course {commande.code_court || commande.id.substring(0, 6)}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-[#CC0000]">
                  Eguette Flotte
                </span>
              </div>
              <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">
                Client : <strong className="text-gray-700 dark:text-slate-200">{commande.client_nom}</strong> · Zone : <span className="font-medium text-gray-700 dark:text-slate-200">{commande.zone}</span>
              </p>
              {commande.plats && (
                <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate max-w-sm mt-0.5">
                  Plats : {commande.plats}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Operational Loss Alert */}
        <div className="mt-3.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 flex items-start gap-2.5 text-[12px] text-amber-800 dark:text-amber-300">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Impact d'annulation :</strong> Le statut passera à{' '}
            <code className="px-1 py-0.5 bg-amber-100 dark:bg-amber-900/60 rounded text-[11px] font-mono">
              'annulee'
            </code>{' '}
            avec horodatage immédiat (<code className="text-[11px] font-mono">annulee_at = now()</code>).
            Perte repas : <strong>{formatFCFA(commande.montant_repas)}</strong>.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300">
                Motif de l'annulation *
              </label>
              <span className="text-[11px] text-gray-400 dark:text-slate-500">
                Sélectionnez un motif ci-dessous
              </span>
            </div>

            {/* List of 6 motifs with title + description */}
            <div className="space-y-2 mt-2">
              {MOTIFS_ANNULATION.map((m) => {
                const isSelected = selectedMotifTitle === m.title;
                const IconComponent = m.icon;

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMotifTitle(m.title);
                      setErrorMessage(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-red-50/80 dark:bg-red-950/40 border-[#CC0000] ring-1 ring-[#CC0000]/30 shadow-xs'
                        : 'bg-gray-50/70 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700/80 hover:bg-gray-100/70 dark:hover:bg-slate-800 hover:border-gray-300'
                    }`}
                  >
                    {/* Radio bullet / Check icon */}
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-[#CC0000] bg-[#CC0000] text-white'
                          : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="w-1.5 h-1.5 rounded-full" />}
                    </div>

                    {/* Motif Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <IconComponent
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? 'text-[#CC0000]' : 'text-gray-500 dark:text-slate-400'
                          }`}
                        />
                        <span
                          className={`text-[13px] font-semibold ${
                            isSelected
                              ? 'text-[#CC0000] dark:text-red-400'
                              : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {m.title}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {m.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom comment / details textarea */}
            <div className="mt-3.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:text-slate-300 mb-1">
                {isCustomSelected ? (
                  <span className="text-[#CC0000]">Explication personnalisée obligatoire *</span>
                ) : (
                  <span>Précision facultative pour le rapport</span>
                )}
              </label>
              <textarea
                rows={isCustomSelected ? 3 : 2}
                required={isCustomSelected}
                placeholder={
                  isCustomSelected
                    ? "Expliquez précisément la cause rencontrée par le coursier (ex: accident bénin, refus formel client, barrage routier...)..."
                    : "Ajoutez un commentaire ou détail complémentaire si nécessaire..."
                }
                value={customComment}
                onChange={(e) => {
                  setCustomComment(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                className={`w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white border transition focus:outline-none focus:ring-2 ${
                  isCustomSelected && !customComment.trim()
                    ? 'border-amber-300 dark:border-amber-700 focus:ring-amber-500/20 focus:border-amber-500'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-[#CC0000]/20 focus:border-[#CC0000]'
                }`}
              />
            </div>

            {errorMessage && (
              <div className="mt-2 flex items-center gap-1.5 text-[12px] text-[#CC0000] font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Fermer sans annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isCustomSelected && !customComment.trim())}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-[#CC0000] hover:bg-[#b00000] text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>Confirmer l'annulation de la course</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
