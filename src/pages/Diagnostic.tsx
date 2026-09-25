import React, { useState } from 'react';
import {
  TrendingUp,
  MapPin,
  Flame,
  Calendar,
  Download,
  UtensilsCrossed,
  Sparkles,
  CheckCircle,
  Clock,
  ArrowUp,
  Check,
} from 'lucide-react';
import { formatFCFA } from '../lib/dataStore';
import { exportDiagnosticCompletPDF } from '../lib/pdfExport';

export const Diagnostic: React.FC = () => {
  const [hasAppliedStrategies, setHasAppliedStrategies] = useState(false);

  const tranchesHoraire = [
    { tranche: '08h–10h', livraisons: 14, temps: '19 min', type: 'optimal' },
    { tranche: '10h–12h', livraisons: 28, temps: '22 min', type: 'optimal' },
    { tranche: '12h–14h', livraisons: 86, temps: '38 min', type: 'critique' },
    { tranche: '14h–16h', livraisons: 31, temps: '24 min', type: 'optimal' },
    { tranche: '16h–18h', livraisons: 22, temps: '21 min', type: 'optimal' },
    { tranche: '18h–21h', livraisons: 94, temps: '41 min', type: 'critique' },
    { tranche: '21h–00h', livraisons: 52, temps: '29 min', type: 'modere' },
    { tranche: '00h–02h', livraisons: 18, temps: '23 min', type: 'optimal' },
    { tranche: '02h–04h', livraisons: 12, temps: '18 min', type: 'optimal' },
    { tranche: '04h–06h30', livraisons: 6, temps: '20 min', type: 'optimal' },
  ];

  const zoneAnalysis = [
    { zone: 'Almadies', delai: '22 min', coursier: 'Alioune Sarr', initials: 'AS' },
    { zone: 'Plateau', delai: '24 min', coursier: 'Mamadou Diop', initials: 'MD' },
    { zone: 'Ouakam', delai: '28 min', coursier: 'Babacar Faye', initials: 'BF' },
    { zone: 'Médina', delai: '39 min', coursier: 'Ibrahima Fall', initials: 'IF', critique: true },
    { zone: 'Yoff et Ngor', delai: '27 min', coursier: 'Oumar Fall', initials: 'OF' },
    { zone: 'Fann et Point E', delai: '21 min', coursier: 'Cheikh Ndiaye', initials: 'CN' },
  ];

  const topDishes = [
    {
      rang: 1,
      nom: 'Thieboudienne Penda',
      commandes: 342,
      ca: 2736000,
    },
    {
      rang: 2,
      nom: 'Yassa Poulet Braisé',
      commandes: 289,
      ca: 2312000,
    },
    {
      rang: 3,
      nom: "Dibi d'Agneau Frais",
      commandes: 215,
      ca: 1935000,
    },
  ];

  const handleApplyStrategies = () => {
    setHasAppliedStrategies(true);
    setTimeout(() => {
      alert(
        'Les 3 stratégies ont été enregistrées : le menu digital et les créneaux livreurs ont été synchronisés.'
      );
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* PAGE HEADER & ACTION CONTROLS matching Screenshot 6 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Rapports et Statistiques</span>
            <span>•</span>
            <span className="text-[#CC0000] font-bold">Analyse Détaillée</span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
            Voir l'analyse
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Diagnostic avancé des performances de commande, efficacité logistique par tranche horaire et leviers de croissance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#111c2e] border border-gray-200 dark:border-slate-800 text-[12px] text-gray-700 dark:text-slate-200 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Derniers 30 jours</span>
          </div>

          <button
            onClick={() => exportDiagnosticCompletPDF()}
            title="Télécharger le diagnostic stratégique et l'analyse de flotte au format PDF"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#111c2e] text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-800 text-[12px] font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-400" />
            <span>Exporter l'analyse</span>
          </button>
        </div>
      </div>

      {/* TOP INSIGHT HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Red Gradient Card */}
        <div className="relative overflow-hidden rounded-2xl p-5 text-white shadow-xs bg-gradient-to-br from-[#CC0000] to-[#990000] flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                Meilleur moment pour une promo
              </span>
              <div className="font-heading font-bold text-3xl md:text-4xl tracking-tight mt-1 text-white tabular-nums">
                18h–21h
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-[11px] text-white/95">
            <Sparkles className="w-4 h-4 text-white" />
            <span>+34% de conversion constatée sur cette plage de service</span>
          </div>
        </div>

        {/* Card 2: Strategic Zone Insights */}
        <div className="rounded-2xl p-5 bg-white dark:bg-[#111c2e] border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Zone à fort potentiel
              </span>
              <div className="font-heading font-bold text-2xl md:text-3xl tracking-tight text-gray-900 dark:text-white mt-1">
                Almadies
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0 text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-[11px] text-[#CC0000] font-semibold">
            <ArrowUp className="w-4 h-4" />
            <span>Panier moyen le plus élevé : 16 800 FCFA (+18%)</span>
          </div>
        </div>

        {/* Card 3: Top Item Strategy */}
        <div className="rounded-2xl p-5 bg-white dark:bg-[#111c2e] border border-gray-100 dark:border-slate-800 shadow-xs flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Plat à mettre en avant
              </span>
              <div className="font-heading font-bold text-2xl md:text-3xl tracking-tight text-gray-900 dark:text-white mt-1 truncate">
                Thieboudienne
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0 text-[#CC0000]">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-4 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400">
            <CheckCircle className="w-4 h-4 text-[#CC0000]" />
            <span>Marge brute 68% · 94% de retours clients positifs</span>
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: LOGISTIC & ZONE ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Table Card: Delivery Times by Hourly Slot (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 gap-2 mb-3">
            <div>
              <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                Temps moyen de livraison par tranche
              </h2>
              <p className="text-[11px] text-gray-400">
                Évaluation de la fluidité coursier selon les pics d'activité journaliers (08:00 à 04:00)
              </p>
            </div>

            {/* Legend Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                &lt; 25 min Optimal
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                25–35 min Modéré
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 dark:bg-red-950/40 text-[#CC0000]">
                &gt; 35 min Critique
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 px-4 rounded-l-xl">Tranche</th>
                  <th className="py-2.5 px-4">Livraisons</th>
                  <th className="py-2.5 px-4 text-right rounded-r-xl">Temps moyen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {tranchesHoraire.map((t) => (
                  <tr key={t.tranche} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-gray-900 dark:text-white tabular-nums">
                      {t.tranche}
                    </td>
                    <td className="py-2.5 px-4 text-gray-500 dark:text-slate-400">
                      {t.livraisons} livraisons
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {t.type === 'critique' ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/60 text-[#CC0000] tabular-nums">
                          {t.temps}
                        </span>
                      ) : t.type === 'modere' ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 tabular-nums">
                          {t.temps}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 tabular-nums">
                          {t.temps}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table Card: Geographic Zone Performance (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col">
          <div className="pb-3 border-b border-gray-100 dark:border-slate-800 mb-3">
            <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">
              Analyse par zone
            </h2>
            <p className="text-[11px] text-gray-400">
              Performances comparées des secteurs de livraison de la presqu'île
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-2.5 px-3 rounded-l-xl">Zone</th>
                  <th className="py-2.5 px-3">Délai</th>
                  <th className="py-2.5 px-3 text-right rounded-r-xl">Meilleur coursier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                {zoneAnalysis.map((z) => (
                  <tr key={z.zone} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-gray-900 dark:text-white">
                      {z.zone}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                          z.critique
                            ? 'bg-red-100 dark:bg-red-950/60 text-[#CC0000]'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200'
                        }`}
                      >
                        {z.delai}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[9px] font-bold flex items-center justify-center">
                          {z.initials}
                        </span>
                        <span className="text-[11px] text-gray-700 dark:text-slate-300">
                          {z.coursier}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TOP PLATS & STRATÉGIES RECOMMANDÉES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Top Plats Card (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                  Top plats
                </h2>
                <p className="text-[12px] text-gray-400">
                  Articles les plus commandés sur la période analysée
                </p>
              </div>
              <UtensilsCrossed className="w-5 h-5 text-gray-400" />
            </div>

            {/* 3 Items Ranking */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topDishes.map((dish) => (
                <div
                  key={dish.rang}
                  className="rounded-xl p-3.5 bg-gray-50 dark:bg-slate-800/60 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-[12px] shadow-xs ${
                        dish.rang === 1
                          ? 'bg-[#CC0000]'
                          : dish.rang === 2
                          ? 'bg-[#CC0000]/80'
                          : 'bg-[#CC0000]/60'
                      }`}
                    >
                      {dish.rang}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Rang {dish.rang}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-[13px] text-gray-900 dark:text-white leading-tight line-clamp-1">
                      {dish.nom}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">
                      {dish.commandes} commandes
                    </p>
                    <div className="mt-2 text-[12px] font-bold text-[#CC0000] tabular-nums">
                      {formatFCFA(dish.ca)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[12px] text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CC0000]" />
              <span>Contribution top 3 au CA mensuel :</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">64,2%</span>
          </div>
        </div>

        {/* Stratégies Recommandées Card (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
              <div>
                <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white">
                  Stratégies recommandées
                </h2>
                <p className="text-[12px] text-gray-400">
                  Actions data-driven suggérées pour maximiser la rentabilité
                </p>
              </div>
              <Sparkles className="w-5 h-5 text-[#CC0000]" />
            </div>

            <div className="space-y-3">
              {/* Rec 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#CC0000] text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Lancer une offre Flash sur le créneau 18h–21h
                  </h4>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Activer un pack boisson offerte sur les commandes groupées pour capter l'afflux du dîner tout en lissant le panier moyen.
                  </p>
                </div>
              </div>

              {/* Rec 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Renforcer les effectifs coursiers sur la Médina dès 12h et 19h
                  </h4>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Pré-positionner 2 livreurs volants pour réduire le temps moyen qui excède actuellement le seuil critique (39 min).
                  </p>
                </div>
              </div>

              {/* Rec 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center shrink-0 text-[11px] font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Mettre en avant le combo Thieboudienne + Jus de Bissap en tête de carte
                  </h4>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5 leading-snug">
                    Exploiter la forte récurrence du plat vedette avec un format bundle à forte valeur ajoutée.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={handleApplyStrategies}
              disabled={hasAppliedStrategies}
              className={`w-full inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full text-[13px] font-semibold transition-all shadow-xs cursor-pointer ${
                hasAppliedStrategies
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 hover:bg-[#CC0000] hover:text-white text-gray-900 dark:text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {hasAppliedStrategies
                  ? 'Recommandations en cours d’application'
                  : 'Mettre en application les recommandations'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
