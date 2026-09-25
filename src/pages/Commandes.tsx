import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  FileDown,
  Clock,
  Phone,
  MapPin,
  Bike,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import {
  fetchCommandes,
  fetchLivreurs,
  assignDriver,
  refuseDriver,
  markAsDelivered,
  subscribeToDataChanges,
  getCurrentEquipe,
  formatFCFA,
} from '../lib/dataStore';
import { Commande, Livreur, CommandeStatut, EquipeType } from '../types';
import { exportCommandesPDF } from '../lib/pdfExport';
import { NewOrderModal } from '../components/NewOrderModal';
import { CancelOrderModal } from '../components/CancelOrderModal';

export const Commandes: React.FC = () => {
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | CommandeStatut>('all');
  const [equipeFilter, setEquipeFilter] = useState<'all' | EquipeType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Commande | null>(null);
  const [activeAssignDropdown, setActiveAssignDropdown] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const reloadData = async () => {
    const [cmds, livs] = await Promise.all([fetchCommandes(), fetchLivreurs()]);
    setCommandes(cmds);
    setLivreurs(livs);
    setLastUpdated(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeToDataChanges(reloadData);

    // Live clock ticker
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const activeEquipe = getCurrentEquipe();

  // Filter available drivers only (en_service === true)
  const availableDrivers = useMemo(() => {
    return livreurs.filter((l) => l.en_service);
  }, [livreurs]);

  // Filtered orders list
  const filteredCommandes = useMemo(() => {
    return commandes.filter((c) => {
      if (statusFilter !== 'all' && c.statut !== statusFilter) return false;
      if (equipeFilter !== 'all' && c.equipe !== equipeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesClient = c.client_nom.toLowerCase().includes(q);
        const matchesPhone = c.client_telephone.toLowerCase().includes(q);
        const matchesZone = c.zone.toLowerCase().includes(q);
        const matchesPlats = c.plats.toLowerCase().includes(q);
        const matchesCode = (c.code_court || '').toLowerCase().includes(q);
        if (!matchesClient && !matchesPhone && !matchesZone && !matchesPlats && !matchesCode) {
          return false;
        }
      }
      return true;
    });
  }, [commandes, statusFilter, equipeFilter, searchQuery]);

  const handleAssign = async (cmdId: string, driverId: string) => {
    setActiveAssignDropdown(null);
    await assignDriver(cmdId, driverId);
    reloadData();
  };

  const handleRefuse = async (cmdId: string) => {
    await refuseDriver(cmdId);
    reloadData();
  };

  const handleDeliver = async (cmdId: string) => {
    await markAsDelivered(cmdId);
    reloadData();
  };

  const formatTimeOnly = (isoString: string | null) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dayDateFormatted = currentTime.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="space-y-6">
      {/* Top Bar with Live Clock & Shift Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
            Commandes
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-0.5">
            Saisie et suivi en temps réel des livraisons
          </p>
        </div>

        {/* Live Clock & Team Pill matching screenshot */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#111c2e] p-2.5 px-4 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-xs self-start md:self-auto">
          <Clock className="w-5 h-5 text-gray-400" />
          <div className="flex flex-col">
            <span className="font-heading font-bold text-[18px] text-gray-900 dark:text-white tabular-nums leading-tight">
              {currentTime.toLocaleTimeString('fr-FR')}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-slate-400 capitalize leading-tight">
              {dayDateFormatted}
            </span>
          </div>
          <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1" />
          <div className="flex flex-col pl-1">
            <span className="text-[10px] uppercase font-bold text-gray-400">Équipe active</span>
            <span className="font-heading font-bold text-[14px] text-[#CC0000]">
              {activeEquipe}
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: New Order, PDF Export, Filters, Refresh */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#111c2e] p-3 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle commande</span>
          </button>

          <button
            onClick={() => exportCommandesPDF(filteredCommandes, 'Bilan des Commandes')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-[12px] font-semibold border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-gray-400" />
            <span>Exporter en PDF</span>
          </button>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="h-9 px-3 rounded-full bg-gray-50 dark:bg-slate-800 text-[12px] font-medium text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
          >
            <option value="all">Tous statuts</option>
            <option value="en_attente">En attente</option>
            <option value="acceptee">Acceptée</option>
            <option value="livree">Livrée</option>
            <option value="annulee">Annulée</option>
          </select>

          {/* Team Filter */}
          <select
            value={equipeFilter}
            onChange={(e) => setEquipeFilter(e.target.value as any)}
            className="h-9 px-3 rounded-full bg-gray-50 dark:bg-slate-800 text-[12px] font-medium text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20"
          >
            <option value="all">Toutes équipes</option>
            <option value="Matin">Équipe Matin (11h–21h)</option>
            <option value="Soir">Équipe Soir (21h–11h)</option>
          </select>
        </div>

        {/* Right: Search + Sync status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Filtrer client, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 rounded-full bg-gray-50 dark:bg-slate-800 text-[12px] text-gray-800 dark:text-slate-200 border border-gray-200 dark:border-slate-700 focus:outline-none w-44"
            />
          </div>

          <button
            onClick={reloadData}
            title="Rafraîchir les données"
            className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">Mis à jour à {lastUpdated || '15:21'}</span>
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredCommandes.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-slate-800 p-12 text-center bg-white/50 dark:bg-[#111c2e]/50">
          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-gray-400 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-semibold text-gray-800 dark:text-slate-200 text-lg">
            Aucune commande trouvée
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Aucune commande ne correspond aux filtres actifs. Cliquez sur "Nouvelle commande" pour en enregistrer une.
          </p>
          <button
            onClick={() => setIsNewOrderModalOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#CC0000] text-white text-[12px] font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle commande</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredCommandes.map((cmd) => {
            const assignedLivreur = livreurs.find((l) => l.id === cmd.livreur_id);
            const totalMontant = cmd.montant_repas + cmd.frais_livraison;
            const isDropdownOpen = activeAssignDropdown === cmd.id;

            return (
              <div
                key={cmd.id}
                className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  {/* Top Header: Code + Status Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-[16px] text-gray-900 dark:text-white">
                        {cmd.code_court || cmd.id.substring(0, 6)}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
                        {cmd.equipe}
                      </span>
                    </div>

                    {/* Status badge */}
                    {cmd.statut === 'en_attente' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                        En attente
                      </span>
                    )}
                    {cmd.statut === 'acceptee' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                        Acceptée
                      </span>
                    )}
                    {cmd.statut === 'livree' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle className="w-3 h-3" />
                        Livrée
                      </span>
                    )}
                    {cmd.statut === 'annulee' && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-50 dark:bg-red-950/60 text-[#CC0000]">
                        <XCircle className="w-3 h-3" />
                        Annulée
                      </span>
                    )}
                  </div>

                  {/* Client Info */}
                  <div className="space-y-1 mb-3">
                    <div className="font-semibold text-[14px] text-gray-900 dark:text-white">
                      {cmd.client_nom}
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500 dark:text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{cmd.client_telephone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
                      <span className="truncate">
                        {cmd.adresse_livraison} · <strong className="text-gray-900 dark:text-white">{cmd.zone}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Plats Box */}
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 mb-3 text-[12px]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">
                      Articles commandés
                    </div>
                    <div className="text-gray-800 dark:text-slate-200 line-clamp-2">
                      {cmd.plats}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="space-y-1 text-[11px] text-gray-500 dark:text-slate-400 pb-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span>Créée à :</span>
                      <span className="font-semibold text-gray-700 dark:text-slate-300 tabular-nums">
                        {formatTimeOnly(cmd.created_at)}
                      </span>
                    </div>

                    {cmd.statut === 'livree' && (
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                        <span>Livrée à :</span>
                        <span className="font-semibold tabular-nums">
                          {formatTimeOnly(cmd.livree_at)} {cmd.duree_livraison ? `(${cmd.duree_livraison} min)` : ''}
                        </span>
                      </div>
                    )}

                    {cmd.statut === 'annulee' && (
                      <div className="flex flex-col gap-0.5 text-[#CC0000] pt-1">
                        <div className="flex items-center justify-between">
                          <span>Annulée à :</span>
                          <span className="font-semibold tabular-nums">{formatTimeOnly(cmd.annulee_at)}</span>
                        </div>
                        <div className="text-[11px] bg-red-50 dark:bg-red-950/40 p-1.5 rounded-lg mt-0.5">
                          <strong>Motif :</strong> {cmd.motif_annulation || 'Non précisé'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Bottom: Total + Driver Assignment */}
                <div className="pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-gray-400">Total repas</span>
                    <span className="font-heading font-bold text-[15px] text-gray-900 dark:text-white tabular-nums">
                      {formatFCFA(totalMontant)}
                    </span>
                  </div>

                  {/* Driver Assignment Actions */}
                  {cmd.statut !== 'annulee' && cmd.statut !== 'livree' && (
                    <div className="relative">
                      {assignedLivreur ? (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40">
                          <div className="flex items-center gap-2 truncate">
                            <Bike className="w-4 h-4 text-blue-600 shrink-0" />
                            <div className="flex flex-col truncate">
                              <span className="text-[12px] font-semibold text-blue-900 dark:text-blue-200 truncate">
                                {assignedLivreur.nom_complet}
                              </span>
                              <span className="text-[10px] text-blue-600 dark:text-blue-300">
                                {assignedLivreur.telephone}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRefuse(cmd.id)}
                            title="Refuser ou réassigner"
                            className="p-1 rounded-md text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setActiveAssignDropdown(isDropdownOpen ? null : cmd.id)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-[12px] font-semibold transition-colors cursor-pointer"
                          >
                            <Bike className="w-4 h-4 text-[#CC0000]" />
                            <span>Assigner un livreur ({availableDrivers.length} dispo)</span>
                          </button>

                          {/* Driver selection dropdown */}
                          {isDropdownOpen && (
                            <div className="absolute bottom-full mb-1 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-1.5 z-20 max-h-48 overflow-y-auto">
                              <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase">
                                Livreurs en service
                              </div>
                              {availableDrivers.length === 0 ? (
                                <div className="p-2 text-[12px] text-gray-500 text-center">
                                  Aucun livreur en service
                                </div>
                              ) : (
                                availableDrivers.map((d) => (
                                  <button
                                    key={d.id}
                                    type="button"
                                    onClick={() => handleAssign(cmd.id, d.id)}
                                    className="w-full text-left p-2 rounded-lg text-[12px] hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-semibold text-gray-800 dark:text-slate-200">
                                        {d.nom_complet}
                                      </div>
                                      <div className="text-[10px] text-gray-400">
                                        {d.secteur} · {d.courses_aujourdhui} courses
                                      </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                      En service
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Row: Mark Delivered or Cancel */}
                  <div className="flex items-center gap-2">
                    {cmd.statut === 'acceptee' && (
                      <button
                        onClick={() => handleDeliver(cmd.id)}
                        className="flex-1 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Marquer livrée</span>
                      </button>
                    )}

                    {cmd.statut !== 'livree' && cmd.statut !== 'annulee' && (
                      <button
                        onClick={() => setCancellingOrder(cmd)}
                        className="py-1.5 px-3 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-[12px] font-semibold transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onCreated={reloadData}
      />

      <CancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        commande={cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onCancelled={reloadData}
      />
    </div>
  );
};
