import React, { useState } from 'react';
import {
  TrendingUp,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  FileDown,
  Calendar,
  AlertOctagon,
  Zap,
  MapPin,
  TimerOff,
  Bike,
  Sparkles,
  PackageOpen,
  CheckCircle,
} from 'lucide-react';
import { exportRapportOperationnelPDF } from '../lib/pdfExport';
import { getLocalCommandes, formatFCFA } from '../lib/dataStore';

export const Rapport: React.FC = () => {
  const [hasAppliedRecommendations, setHasAppliedRecommendations] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleApply = () => {
    setHasAppliedRecommendations(true);
    setTimeout(() => {
      alert(
        'Recommandations appliquées avec succès ! Le régulateur logistique et la cuisine centrale ont été notifiés.'
      );
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* 1. EXECUTIVE HEADER matching Screenshot 5 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Tableau Analytique
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#CC0000]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#CC0000]">
              Temps Réel
            </span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
            Rapport et Diagnostic Opérationnel
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Analyse prédictive des performances, cartographie des pertes d'exploitation et leviers d'amélioration continue.
          </p>
        </div>

        {/* Executive Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#111c2e] border border-gray-200 dark:border-slate-800 text-[12px] text-gray-700 dark:text-slate-200 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Semaine en cours · 18 - 24 Septembre</span>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111c2e] text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-800 text-[12px] font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-gray-400" />
            <span>Imprimer</span>
          </button>

          <button
            onClick={() => exportRapportOperationnelPDF()}
            title="Exporter le rapport et diagnostic opérationnel complet au format PDF"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Exporter le rapport</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR METRIC HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Score de santé */}
        <div className="relative bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="h-1 w-full absolute top-0 left-0 bg-blue-600" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Performance Globale
              </span>
              <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white mt-0.5">
                Score de santé
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white tabular-nums">
                78
              </span>
              <span className="text-gray-400 text-sm font-semibold">/100</span>
            </div>
            <div className="flex items-center gap-1 text-blue-600 text-[11px] font-semibold mt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Bon état opérationnel (+4 pts)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '78%' }} />
            </div>
          </div>
        </div>

        {/* Card 2: Taux d'annulation */}
        <div className="relative bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="h-1 w-full absolute top-0 left-0 bg-[#CC0000]" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Taux de friction
              </span>
              <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white mt-0.5">
                Taux d'annulation
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading font-bold text-3xl md:text-4xl text-[#CC0000] tabular-nums">
                7.2%
              </span>
            </div>
            <div className="flex items-center gap-1 text-[#CC0000] text-[11px] font-semibold mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Objectif max &lt; 5.0%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-[#CC0000] h-1.5 rounded-full" style={{ width: '72%' }} />
            </div>
          </div>
        </div>

        {/* Card 3: Revenu perdu */}
        <div className="relative bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="h-1 w-full absolute top-0 left-0 bg-[#CC0000]" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Manque à gagner
              </span>
              <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white mt-0.5">
                Revenu perdu
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tabular-nums">
                24 000
              </span>
              <span className="font-bold text-gray-400 text-sm ml-1">FCFA</span>
            </div>
            <div className="flex items-center gap-1 text-[#CC0000] text-[11px] font-semibold mt-1">
              <span>3 commandes annulées cette semaine</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-[#CC0000] h-1.5 rounded-full" style={{ width: '48%' }} />
            </div>
          </div>
        </div>

        {/* Card 4: Temps moyen course */}
        <div className="relative bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between overflow-hidden">
          <div className="h-1 w-full absolute top-0 left-0 bg-slate-600" />
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Délai opérationnel
              </span>
              <h2 className="font-heading font-bold text-base text-gray-900 dark:text-white mt-0.5">
                Temps moyen course
              </h2>
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white tabular-nums">
                28
              </span>
              <span className="font-bold text-gray-400 text-sm ml-1">min</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-600 text-[11px] font-semibold mt-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Cible &lt; 30 min (conforme)</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-slate-600 h-1.5 rounded-full" style={{ width: '58%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO-COLUMN BALANCED ANALYSIS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Failles identifiées */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-[#CC0000]">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                    Failles identifiées
                  </h2>
                  <span className="text-[12px] text-gray-400">
                    Points de friction majeurs nécessitant une intervention
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/50 text-[#CC0000] uppercase">
                3 anomalies détectées
              </span>
            </div>

            <div className="space-y-3">
              {/* Anomaly 1 */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#CC0000] shrink-0 shadow-xs mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                      Zone critique : Médina
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#CC0000]">
                      5 annulations
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">
                    Congestion routière majeure constatée entre l'Avenue Blaise Diagne et Rue 6. Dépassement de créneau estimé à +19 min par coursier.
                  </p>
                </div>
              </div>

              {/* Anomaly 2 */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-[#CC0000] shrink-0 shadow-xs mt-0.5">
                  <TimerOff className="w-4 h-4" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                      Tranche horaire critique : 21h00
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#CC0000]">
                      3 annulations
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">
                    Goulot d'étranglement aux fourneaux durant le pic de commandes de grillades. Les clients abandonnent après 40 min d'attente sans mise à jour.
                  </p>
                </div>
              </div>

              {/* Anomaly 3 */}
              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-gray-500 shrink-0 shadow-xs mt-0.5">
                  <Bike className="w-4 h-4" />
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                        Livreur à auditer : Ibrahima Fall
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300">
                        #LIV-104
                      </span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300">
                      Écart +14 min
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1">
                    Retards récurrents sur l'acheminement final et signalement client récurrent de joignabilité difficile au point de chute.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[12px] text-gray-500 dark:text-slate-400">
            <span>
              Impact estimé : <strong className="text-[#CC0000] font-bold">-15%</strong> sur la satisfaction du service du soir.
            </span>
            <button
              onClick={() => alert("Revue des réclamations : 8 tickets clients récents analysés.")}
              className="font-bold text-[#CC0000] hover:underline cursor-pointer"
            >
              Voir les réclamations
            </button>
          </div>
        </div>

        {/* Right Column: Décisions recommandées */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                    Décisions recommandées
                  </h2>
                  <span className="text-[12px] text-gray-400">
                    Algorithmes d'optimisation opérationnelle Eguette_OPS
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 uppercase">
                Plan d'action prioritaire
              </span>
            </div>

            <div className="space-y-3">
              {/* Action 1 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#CC0000] text-white font-bold flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Redéployer la flotte sur Médina
                  </span>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Affecter 2 coursiers supplémentaires de l'Équipe Soir sur le secteur Médina entre 19h30 et 21h30 pour absorber les ralentissements.
                  </p>
                </div>
              </div>

              {/* Action 2 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Ajuster le temps de préparation prédictif
                  </span>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Augmenter automatiquement l'estimation affichée au client de +8 minutes à partir de 21h pour désamorcer l'impatience.
                  </p>
                </div>
              </div>

              {/* Action 3 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Entretien de cadrage avec Ibrahima Fall
                  </span>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Faire le point avec le régulateur logistique sur les protocoles d'appel pré-arrivée et le contrôle des sacs isothermes.
                  </p>
                </div>
              </div>

              {/* Action 4 */}
              <div className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[12px] shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex flex-col flex-1">
                  <span className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Automatisation SMS de courtoisie
                  </span>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Déclencher un message automatique de temporisation avec suivi GPS dès 12 minutes de retard avéré au départ de la cuisine.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[12px] text-gray-500 dark:text-slate-400">
              Estimation de gain : <strong className="text-gray-900 dark:text-white font-bold">+9.4%</strong> de rétention
            </span>
            <button
              onClick={handleApply}
              disabled={hasAppliedRecommendations}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-[12px] font-semibold transition-all shadow-xs cursor-pointer ${
                hasAppliedRecommendations
                  ? 'bg-emerald-600'
                  : 'bg-[#CC0000] hover:bg-[#b00000]'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>
                {hasAppliedRecommendations
                  ? 'Recommandations appliquées'
                  : 'Appliquer les recommandations prioritaires'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. COMPLEMENTARY SECTION: DÉTAIL DES PERTES ET POINT DE CONTRÔLE PASS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Breakdown of Losses (2 cols) */}
        <div className="xl:col-span-2 bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                Détail des pertes par catégorie d'incident
              </h2>
              <p className="text-[12px] text-gray-500 dark:text-slate-400">
                Répartition des charges non recouvrées sur les 7 derniers jours de service
              </p>
            </div>
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
              Total : 48 500 FCFA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Metric 1 */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <span>Pertes Denrées</span>
                <PackageOpen className="w-4 h-4 text-[#CC0000]" />
              </div>
              <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white tabular-nums">
                16 500 <span className="text-xs font-normal text-gray-400">FCFA</span>
              </span>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#CC0000] h-1.5 rounded-full" style={{ width: '34%' }} />
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">34% du total des pertes</span>
            </div>

            {/* Metric 2 */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <span>Livraisons Échouées</span>
                <Bike className="w-4 h-4 text-[#CC0000]" />
              </div>
              <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white tabular-nums">
                24 000 <span className="text-xs font-normal text-gray-400">FCFA</span>
              </span>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#CC0000] h-1.5 rounded-full" style={{ width: '49%' }} />
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">49% du total (3 incidents)</span>
            </div>

            {/* Metric 3 */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 flex flex-col gap-2">
              <div className="flex items-center justify-between text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                <span>Geste Commercial</span>
                <Sparkles className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-heading font-bold text-2xl text-gray-900 dark:text-white tabular-nums">
                8 000 <span className="text-xs font-normal text-gray-400">FCFA</span>
              </span>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '17%' }} />
              </div>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">17% remises exceptionnelles</span>
            </div>
          </div>

          {/* Incidents Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-slate-800 text-gray-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="pb-2">Incident et Réf</th>
                  <th className="pb-2">Poste / Cause</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
                <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-bold text-gray-900 dark:text-white">
                    #CMD-8842 · Poisson Braisé Royal
                    <div className="font-normal text-gray-400 text-[11px]">21 Sept · 21:14</div>
                  </td>
                  <td className="py-2.5 text-gray-600 dark:text-slate-300">
                    Dépassement de créneau Médina (+38 min)
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#CC0000] text-[11px] font-semibold">
                      Annulée
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                    9 500 FCFA
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-bold text-gray-900 dark:text-white">
                    #CMD-8819 · Dibiterie Agneau Double
                    <div className="font-normal text-gray-400 text-[11px]">20 Sept · 20:45</div>
                  </td>
                  <td className="py-2.5 text-gray-600 dark:text-slate-300">
                    Erreur adresse client et refus paiement
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-[#CC0000] text-[11px] font-semibold">
                      Annulée
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                    8 500 FCFA
                  </td>
                </tr>

                <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 font-bold text-gray-900 dark:text-white">
                    #CMD-8790 · Pack Familial Yassa Poulet
                    <div className="font-normal text-gray-400 text-[11px]">19 Sept · 21:02</div>
                  </td>
                  <td className="py-2.5 text-gray-600 dark:text-slate-300">
                    Rupture sauces accompagnement en pic
                  </td>
                  <td className="py-2.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-[11px] font-semibold">
                      Remboursé
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-gray-900 dark:text-white tabular-nums">
                    6 000 FCFA
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Chef & Pass Overview Card */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-slate-800">
              <h2 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
                Point de Contrôle Pass
              </h2>
              <span className="text-[11px] text-gray-400 font-semibold">Aujourd'hui</span>
            </div>

            {/* Kitchen Pass Image */}
            <div className="relative rounded-xl overflow-hidden mb-4 shadow-xs h-36">
              <img
                src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
                alt="Cuisine Centrale Eguette OPS Dakar"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CC0000] animate-pulse" />
                  <span className="text-white text-[12px] font-bold">
                    Cuisine Centrale - Ligne A Dakar
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400">Efficacité du dressage</span>
                <span className="font-bold text-gray-900 dark:text-white tabular-nums">94.2%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400">Délai moyen au passe-plat</span>
                <span className="font-bold text-gray-900 dark:text-white tabular-nums">4 min 12s</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60">
                <span className="text-gray-500 dark:text-slate-400">Ruptures signalées</span>
                <span className="font-bold text-[#CC0000]">1 produit (Bissap 50cl)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button
              onClick={() => alert("Seuils d'alerte configurés : avertissement au-delà de 7 minutes au passe.")}
              className="w-full py-2 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Paramétrer les seuils d'alerte KDS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
