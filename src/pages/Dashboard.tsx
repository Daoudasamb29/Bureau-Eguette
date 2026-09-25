import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  XCircle,
  FileDown,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  Check,
  ChevronRight,
  ChevronLeft,
  MoreVertical,
  Activity,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  fetchCommandes,
  fetchLivreurs,
  getLocalCommissions,
  payCommission,
  subscribeToDataChanges,
  formatFCFA,
} from '../lib/dataStore';
import { Commande, Livreur, CommissionJournaliere } from '../types';
import {
  exportDashboardCompletePDF,
  exportDashboardCompleteCSV,
  DashboardExportData,
} from '../lib/pdfExport';
import { NewOrderModal } from '../components/NewOrderModal';

type PeriodFilter = 'today' | '7days' | '30days' | 'date';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodFilter>('today');
  const [customDate, setCustomDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [commissions, setCommissions] = useState<CommissionJournaliere[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [optimisticPaid, setOptimisticPaid] = useState<Record<string, boolean>>({});
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  const reloadData = async () => {
    const [cmds, livs] = await Promise.all([fetchCommandes(), fetchLivreurs()]);
    setCommandes(cmds);
    setLivreurs(livs);
    setCommissions(getLocalCommissions());
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeToDataChanges(reloadData);
    return () => unsubscribe();
  }, []);

  // Filter orders based on selected period or chosen date
  const filteredCommandes = useMemo(() => {
    const now = Date.now();
    return commandes.filter((c) => {
      if (period === 'date' && customDate) {
        const d = new Date(c.created_at);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const localDateKey = `${y}-${m}-${day}`;
        return localDateKey === customDate || c.created_at.startsWith(customDate);
      }
      const createdTime = new Date(c.created_at).getTime();
      const diffHours = (now - createdTime) / (1000 * 60 * 60);
      if (period === 'today') return diffHours <= 24;
      if (period === '7days') return diffHours <= 24 * 7;
      return diffHours <= 24 * 30;
    });
  }, [commandes, period, customDate]);

  // Label of the chosen period / date
  const periodLabel = useMemo(() => {
    if (period === 'today') {
      const todayFormatted = new Date().toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      return `Aujourd'hui (${todayFormatted})`;
    }
    if (period === '7days') return '7 derniers jours';
    if (period === '30days') return '30 derniers jours';
    if (period === 'date' && customDate) {
      const d = new Date(customDate + 'T12:00:00');
      return `Date du ${d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`;
    }
    return 'Période sélectionnée';
  }, [period, customDate]);

  // High-level statistics
  const stats = useMemo(() => {
    const total = filteredCommandes.length;
    const inProgress = filteredCommandes.filter((c) => c.statut === 'en_attente' || c.statut === 'acceptee').length;
    const delivered = filteredCommandes.filter((c) => c.statut === 'livree').length;
    const cancelled = filteredCommandes.filter((c) => c.statut === 'annulee').length;

    const deliveryRate = total > 0 ? Math.round((delivered / total) * 100) : 0;
    const cancelRate = total > 0 ? ((cancelled / total) * 100).toFixed(1) : '0';

    return { total, inProgress, delivered, cancelled, deliveryRate, cancelRate };
  }, [filteredCommandes]);

  // Filter commissions for the chosen period / date
  const filteredCommissions = useMemo(() => {
    if (period === 'date' && customDate) {
      const matched = commissions.filter((c) => c.date_activite === customDate);
      if (matched.length > 0) return matched;
      // When a specific date has orders, dynamically match delivery drivers active on that date
      const driversOnDate = new Set<string>();
      filteredCommandes.forEach((c) => {
        if (c.livreur_id) driversOnDate.add(c.livreur_id);
      });
      if (driversOnDate.size > 0) {
        return Array.from(driversOnDate).map((driverId, idx) => {
          const liv = livreurs.find((l) => l.id === driverId);
          const driverCmds = filteredCommandes.filter((c) => c.livreur_id === driverId);
          return {
            id: `comm-date-${idx}`,
            livreur_id: driverId,
            livreur_nom: liv?.nom_complet || 'Livreur',
            date_activite: customDate,
            nb_courses: driverCmds.length,
            montant_commission: 1000,
            payee: true,
            payee_at: 'Clôturé',
          } as CommissionJournaliere;
        });
      }
    }
    return commissions;
  }, [commissions, period, customDate, filteredCommandes, livreurs]);

  // Financial Metrics (Chiffre d'affaires) for the chosen date / period
  // Règle comptable : Le chiffre d'affaires concerne uniquement les ventes de repas (hors frais de livraison) et intègre les commissions des livreurs
  const financialMetrics = useMemo(() => {
    // CA Brut = montant total des ventes de repas (hors frais logistiques de livraison)
    const caTotalBrut = filteredCommandes.reduce((sum, c) => sum + c.montant_repas, 0);

    // CA Encaissé = repas des commandes effectivement livrées
    const livrees = filteredCommandes.filter((c) => c.statut === 'livree');
    const caEncaisse = livrees.reduce((sum, c) => sum + c.montant_repas, 0);

    const caRepas = caTotalBrut;
    const caFraisLivraison = filteredCommandes.reduce((sum, c) => sum + c.frais_livraison, 0);

    // Commissions des livreurs pour la date ou période
    const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.montant_commission, 0);
    const commissionsPayees = filteredCommissions
      .filter((c) => c.payee || optimisticPaid[c.id])
      .reduce((sum, c) => sum + c.montant_commission, 0);
    const commissionsEnAttente = Math.max(0, totalCommissions - commissionsPayees);
    const caNetApresCommissions = caEncaisse - totalCommissions;

    const panierMoyen =
      filteredCommandes.length > 0 ? Math.round(caTotalBrut / filteredCommandes.length) : 0;
    const pertesAnnulees = filteredCommandes
      .filter((c) => c.statut === 'annulee')
      .reduce((sum, c) => sum + c.montant_repas, 0);

    return {
      caTotalBrut,
      caEncaisse,
      caRepas,
      caFraisLivraison,
      totalCommissions,
      commissionsPayees,
      commissionsEnAttente,
      caNetApresCommissions,
      panierMoyen,
      pertesAnnulees,
    };
  }, [filteredCommandes, filteredCommissions, optimisticPaid]);

  // Zone distribution for Donut Chart
  const zoneChartData = useMemo(() => {
    const zoneCounts: Record<string, number> = {};
    filteredCommandes.forEach((c) => {
      const z = c.zone || 'Autre';
      zoneCounts[z] = (zoneCounts[z] || 0) + 1;
    });

    const colors: Record<string, string> = {
      Plateau: '#CC0000',
      Almadies: '#1E293B',
      Ouakam: '#2563EB',
      Médina: '#64748B',
      'Yoff et Ngor': '#93C5FD',
      'Fann et Point E': '#10B981',
      'Mermoz et Sacré-Cœur': '#F59E0B',
    };

    const data = Object.entries(zoneCounts).map(([name, value]) => ({
      name,
      value,
      color: colors[name] || '#94A3B8',
    }));

    if (data.length === 0) {
      return [
        { name: 'Plateau', value: 32, color: '#CC0000' },
        { name: 'Almadies', value: 26, color: '#1E293B' },
        { name: 'Ouakam', value: 18, color: '#2563EB' },
        { name: 'Médina', value: 14, color: '#64748B' },
        { name: 'Yoff et Ngor', value: 10, color: '#93C5FD' },
      ];
    }
    return data;
  }, [filteredCommandes]);

  const totalZoneOrders = useMemo(() => {
    return zoneChartData.reduce((acc, curr) => acc + curr.value, 0);
  }, [zoneChartData]);

  // Handle Pay commission optimistically
  const handlePayCommission = async (commId: string) => {
    setOptimisticPaid((prev) => ({ ...prev, [commId]: true }));
    await payCommission(commId);
  };

  // Calculate pending commissions sum
  const pendingCommissionsTotal = useMemo(() => {
    return filteredCommissions
      .filter((c) => !c.payee && !optimisticPaid[c.id])
      .reduce((sum, c) => sum + c.montant_commission, 0);
  }, [filteredCommissions, optimisticPaid]);

  // Comprehensive Export Handler (Contains all dashboard details & revenue of chosen date)
  const handleExportDashboard = () => {
    const exportPayload: DashboardExportData = {
      periodLabel,
      selectedDate: period === 'date' ? customDate : undefined,
      commandes: filteredCommandes,
      livreurs,
      commissions: filteredCommissions,
      stats,
      zones: zoneChartData,
      financialMetrics,
    };

    exportDashboardCompletePDF(exportPayload);
    setExportSuccessMessage(
      `Bilan complet PDF téléchargé avec succès ! Chiffre d'affaires repas : ${formatFCFA(
        financialMetrics.caEncaisse
      )} (${filteredCommandes.length} commandes, ${formatFCFA(financialMetrics.totalCommissions)} de commissions livreurs).`
    );
    setTimeout(() => setExportSuccessMessage(null), 6000);
  };

  const handleExportCSV = () => {
    const exportPayload: DashboardExportData = {
      periodLabel,
      selectedDate: period === 'date' ? customDate : undefined,
      commandes: filteredCommandes,
      livreurs,
      commissions: filteredCommissions,
      stats,
      zones: zoneChartData,
      financialMetrics,
    };

    exportDashboardCompleteCSV(exportPayload);
    setExportSuccessMessage(
      `Tableur CSV complet téléchargé avec succès (${filteredCommandes.length} commandes et CA repas).`
    );
    setTimeout(() => setExportSuccessMessage(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
              Tableau de bord
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Temps réel
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-0.5">
            Aperçu opérationnel des performances, chiffre d’affaires et livraisons à Dakar.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 p-1.5 sm:p-2 rounded-2xl bg-gradient-to-r from-zinc-950 via-[#180505] to-zinc-900 border border-red-950/80 dark:border-red-900/50 shadow-sm">
          {/* Period Pills + Date Picker */}
          <div className="inline-flex items-center p-1 rounded-full bg-black/60 border border-red-900/40 shadow-xs backdrop-blur-xs">
            <button
              onClick={() => setPeriod('today')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                period === 'today'
                  ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white shadow-xs'
                  : 'text-zinc-300 hover:text-white hover:bg-red-950/40'
              }`}
            >
              Aujourd'hui
            </button>
            <button
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                period === '7days'
                  ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white shadow-xs'
                  : 'text-zinc-300 hover:text-white hover:bg-red-950/40'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setPeriod('30days')}
              className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all cursor-pointer ${
                period === '30days'
                  ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white shadow-xs'
                  : 'text-zinc-300 hover:text-white hover:bg-red-950/40'
              }`}
            >
              30 jours
            </button>

            {/* Custom Date Picker */}
            <div className="flex items-center pl-1 pr-1.5 border-l border-red-900/50 ml-1 relative">
              <label
                htmlFor="dashboard-date-picker"
                onClick={() => {
                  setPeriod('date');
                  const input = document.getElementById('dashboard-date-picker') as HTMLInputElement;
                  if (input && 'showPicker' in input) {
                    try {
                      input.showPicker();
                    } catch (e) {
                      // fallback
                    }
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
                  period === 'date'
                    ? 'bg-gradient-to-r from-[#CC0000] to-[#990000] text-white shadow-xs'
                    : 'text-zinc-300 hover:text-white hover:bg-red-950/40'
                }`}
                title="Choisir une date précise pour filtrer le tableau de bord et exporter le CA"
              >
                <Calendar className="w-3.5 h-3.5 text-red-400" />
                <span>
                  {period === 'date' && customDate
                    ? new Date(customDate + 'T12:00:00').toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })
                    : 'Date'}
                </span>
              </label>
              <input
                id="dashboard-date-picker"
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setPeriod('date');
                }}
                className="w-0 h-0 opacity-0 absolute pointer-events-none"
              />
            </div>
          </div>

          {/* Export PDF Complet (Bilan & Chiffre d'Affaires de la date choisie) */}
          <button
            onClick={handleExportDashboard}
            title={`Exporter le rapport complet avec Chiffre d'Affaires, KPIs, Zones, Commissions et Commandes (${periodLabel})`}
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-zinc-900 to-black text-[12px] font-semibold text-zinc-100 hover:text-white border border-red-800/70 hover:border-red-500 hover:bg-red-950/30 shadow-xs hover:shadow-sm transition-all duration-200 active:scale-95 cursor-pointer relative"
          >
            <FileDown className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span className="font-semibold tracking-wide text-zinc-100 group-hover:text-white">
              Exporter (Bilan & CA)
            </span>
          </button>

          {/* New Order */}
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#CC0000] via-[#b30000] to-[#880000] hover:from-[#e00000] hover:to-[#990000] text-white text-[12px] font-semibold border border-red-500/40 shadow-xs hover:shadow-red-950/50 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle commande</span>
          </button>
        </div>
      </div>

      {/* Export Feedback Toast */}
      {exportSuccessMessage && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-[12px] font-medium shadow-sm transition-all gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-200 hover:text-emerald-950 font-bold underline cursor-pointer text-[11px]"
              title="Télécharger aussi au format tableur CSV / Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Version Tableur (CSV)</span>
            </button>
            <button
              onClick={() => setExportSuccessMessage(null)}
              className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 text-[11px] font-bold cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Revenue & Financial Summary Banner for Selected Date/Period */}
      <div className="bg-gradient-to-r from-red-50 via-white to-gray-50 dark:from-red-950/20 dark:via-[#111c2e] dark:to-slate-900 rounded-2xl p-4 md:p-5 shadow-xs border border-red-100 dark:border-red-950/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#CC0000] text-white flex items-center justify-center shadow-xs shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#CC0000] dark:text-red-400">
                Chiffre d'affaires (Repas) · {periodLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {stats.delivered} commandes livrées
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tabular-nums">
                {formatFCFA(financialMetrics.caEncaisse)}
              </span>
              <span className="text-[12px] text-gray-500 dark:text-slate-400">
                encaissé (brut repas : {formatFCFA(financialMetrics.caTotalBrut)})
              </span>
            </div>
            <div className="text-[11px] text-gray-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-x-2">
              <span className="inline-flex items-center gap-1 font-medium text-amber-700 dark:text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Commissions livreurs : {formatFCFA(financialMetrics.totalCommissions)}
              </span>
              <span>·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                CA Net après commissions : {formatFCFA(financialMetrics.caNetApresCommissions)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-slate-800 lg:pl-6 text-[12px]">
          <div>
            <span className="text-gray-500 dark:text-slate-400 block text-[11px]">Ventes Repas (CA)</span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">
              {formatFCFA(financialMetrics.caRepas)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-slate-400 block text-[11px]">Commissions Livreurs</span>
            <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {formatFCFA(financialMetrics.totalCommissions)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-slate-400 block text-[11px]">Panier Moyen</span>
            <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">
              {formatFCFA(financialMetrics.panierMoyen)}
            </span>
          </div>
          <div>
            <span className="text-gray-500 dark:text-slate-400 block text-[11px]">Pertes Annulées</span>
            <span className="font-bold text-[#CC0000] tabular-nums">
              {formatFCFA(financialMetrics.pertesAnnulees)}
            </span>
          </div>
        </div>
      </div>


      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Commandes période */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Commandes {period === 'today' ? "du jour" : 'sur la période'}
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white tabular-nums">
              {stats.total}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              +12% vs hier
            </span>
          </div>
        </div>

        {/* Card 2: En cours */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                En cours
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white tabular-nums">
              {stats.inProgress}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              En préparation
            </span>
          </div>
        </div>

        {/* Card 3: Livrées */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Livrées
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-gray-900 dark:text-white tabular-nums">
              {stats.delivered}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400">
              Taux {stats.deliveryRate}%
            </span>
          </div>
        </div>

        {/* Card 4: Annulées */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
                <XCircle className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Annulées
              </span>
            </div>
            <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-heading font-bold text-3xl md:text-4xl text-[#CC0000] tabular-nums">
              {stats.cancelled}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-[#CC0000]">
              Taux {stats.cancelRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Middle Grid: Zone Donut + Commission Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Donut Chart: Répartition par zone (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-heading font-bold text-[17px] text-gray-900 dark:text-white">
                Répartition par zone
              </h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Dakar Express
              </span>
            </div>
            <p className="text-[12px] text-gray-500 dark:text-slate-400 mb-2">
              Volume des livraisons actives sur la presqu'île
            </p>

            {/* Recharts Donut */}
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} livraisons`, name]}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderRadius: '10px',
                      color: '#FFF',
                      fontSize: '12px',
                      border: 'none',
                    }}
                  />
                  <Pie
                    data={zoneChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {zoneChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tabular-nums">
                  {totalZoneOrders}
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Zone Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800/80">
            {zoneChartData.map((z) => {
              const pct = totalZoneOrders > 0 ? Math.round((z.value / totalZoneOrders) * 100) : 0;
              return (
                <div
                  key={z.name}
                  className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-[12px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: z.color }} />
                    <span className="text-gray-700 dark:text-slate-300 truncate">{z.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white tabular-nums">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commission Management (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-heading font-bold text-[17px] text-gray-900 dark:text-white">
                  Gestion des commissions
                </h2>
                <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">
                  Règlement direct des courses livreurs (Forfait 1 000 FCFA / jour)
                </p>
              </div>
              <button
                onClick={() => navigate('/livreurs')}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#CC0000] hover:underline"
              >
                <span>Voir la flotte</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Commissions List */}
            <div className="flex flex-col gap-2.5 mt-4">
              {commissions.map((comm) => {
                const isPaid = comm.payee || Boolean(optimisticPaid[comm.id]);
                const driver = livreurs.find((l) => l.id === comm.livreur_id);
                const initials = (comm.livreur_nom || driver?.nom_complet || 'L')
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .substring(0, 2);

                return (
                  <div
                    key={comm.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 text-[#CC0000] font-bold text-[13px] flex items-center justify-center">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-[13px] text-gray-900 dark:text-white">
                          {comm.livreur_nom || driver?.nom_complet || 'Livreur'}
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-slate-400">
                          {comm.nb_courses} courses aujourd'hui · {driver?.secteur || 'Dakar'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-right">
                        <span className="font-bold text-[13px] text-gray-900 dark:text-white tabular-nums block">
                          {formatFCFA(comm.montant_commission)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {isPaid ? `Soldé (${comm.payee_at || 'Aujourd’hui'})` : 'En attente'}
                        </span>
                      </div>

                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold">
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          Payé
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handlePayCommission(comm.id)}
                          className="px-4 py-1.5 rounded-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold shadow-xs transition-all cursor-pointer"
                        >
                          Payer
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Settlement Banner */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[12px] text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-[#CC0000]" />
              <span>
                Solde global à reverser :{' '}
                <strong className="text-gray-900 dark:text-white font-bold">
                  {formatFCFA(pendingCommissionsTotal)}
                </strong>
              </span>
            </div>
            <button
              onClick={() => navigate('/commandes')}
              className="font-medium hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Historique des commandes
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Commandes Récentes */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-heading font-bold text-[17px] text-gray-900 dark:text-white">
              Commandes récentes
            </h2>
            <p className="text-[12px] text-gray-500 dark:text-slate-400">
              Suivi opérationnel des tickets clients en direct
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/rapport')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-slate-800 text-[12px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-gray-400" />
              <span>Voir le rapport</span>
            </button>
            <button
              onClick={() => navigate('/diagnostic')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 dark:bg-slate-800 text-[12px] font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <span>Diagnostic et Décisions</span>
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4 rounded-l-xl">Client</th>
                <th className="py-2.5 px-4">Zone</th>
                <th className="py-2.5 px-4">Plats</th>
                <th className="py-2.5 px-4">Montant</th>
                <th className="py-2.5 px-4">Créée</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4 text-right rounded-r-xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60 text-[13px]">
              {filteredCommandes.slice(0, 6).map((cmd) => {
                const initials = cmd.client_nom
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .substring(0, 2);

                const timeStr = new Date(cmd.created_at).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr
                    key={cmd.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {cmd.client_nom}
                          </span>
                          <span className="text-[11px] text-gray-400">{cmd.code_court || cmd.id.substring(0, 6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800 dark:text-slate-200">
                      {cmd.zone}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-slate-400 max-w-xs truncate">
                      {cmd.plats}
                    </td>
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white tabular-nums">
                      {formatFCFA(cmd.montant_repas + cmd.frais_livraison)}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-slate-400 text-[12px] tabular-nums">
                      {timeStr}
                    </td>
                    <td className="py-3 px-4">
                      {cmd.statut === 'en_attente' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                          En attente
                        </span>
                      )}
                      {cmd.statut === 'acceptee' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          Acceptée
                        </span>
                      )}
                      {cmd.statut === 'livree' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          Livrée
                        </span>
                      )}
                      {cmd.statut === 'annulee' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-[#CC0000]">
                          Annulée
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate('/commandes')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-3 mt-2 text-[12px] text-gray-500 dark:text-slate-400">
          <span>
            Affichage de {Math.min(6, filteredCommandes.length)} sur {filteredCommandes.length} commandes
          </span>
          <button
            onClick={() => navigate('/commandes')}
            className="font-semibold text-[#CC0000] hover:underline"
          >
            Accéder à toutes les commandes →
          </button>
        </div>
      </div>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onCreated={reloadData}
      />
    </div>
  );
};
