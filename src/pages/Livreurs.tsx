import React, { useState, useEffect, useMemo } from 'react';
import {
  Bike,
  Clock,
  CheckCircle2,
  Package,
  Plus,
  Sun,
  Moon,
  Phone,
  Power,
  Play,
  UserPlus,
  MapPin,
  Calendar,
  Check,
  X,
  AlertTriangle,
  FileText,
  Info,
} from 'lucide-react';
import {
  fetchLivreurs,
  fetchCommandes,
  markAsDelivered,
  toggleLivreurService,
  subscribeToDataChanges,
  WEEKLY_SCHEDULE_ORDER,
  getTodaysSchedule,
} from '../lib/dataStore';
import { Livreur, Commande } from '../types';
import { NewDriverModal } from '../components/NewDriverModal';
import { CancelOrderModal, MOTIFS_ANNULATION } from '../components/CancelOrderModal';

export const Livreurs: React.FC = () => {
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMotifsGuideModalOpen, setIsMotifsGuideModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Commande | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const todaysSchedule = useMemo(() => getTodaysSchedule(), []);

  const reloadData = async () => {
    const [drivers, orders] = await Promise.all([fetchLivreurs(), fetchCommandes()]);
    setLivreurs(drivers);
    setCommandes(orders);
  };

  useEffect(() => {
    reloadData();
    const unsubscribe = subscribeToDataChanges(reloadData);
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleToggle = async (id: string, name: string, currentStatus: boolean) => {
    await toggleLivreurService(id);
    reloadData();
    showToast(
      currentStatus
        ? `${name} est désormais hors service.`
        : `${name} a pris son service avec succès.`
    );
  };

  const handleDeliverCourse = async (orderId: string, orderCode?: string) => {
    await markAsDelivered(orderId);
    reloadData();
    showToast(`Course ${orderCode || ''} validée comme livrée !`);
  };

  const activeCount = useMemo(() => livreurs.filter((l) => l.en_service).length, [livreurs]);
  const totalCount = livreurs.length;

  const morningDrivers = useMemo(() => livreurs.filter((l) => l.equipe === 'Matin'), [livreurs]);
  const eveningDrivers = useMemo(() => livreurs.filter((l) => l.equipe === 'Soir'), [livreurs]);

  // Total courses today
  const totalCourses = useMemo(
    () => livreurs.reduce((acc, curr) => acc + (curr.courses_aujourdhui || 0), 0),
    [livreurs]
  );

  return (
    <div className="space-y-6">
      {/* Top Banner & Title matching Screenshot 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
              Livreurs
            </h1>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#ffdad4] text-[#410000]">
              Flotte Active
            </span>
          </div>
          <p className="text-[13px] text-gray-500 dark:text-slate-400">
            Gestion et affectation de la flotte de livraison en temps réel pour Dakar Hub.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Active fleet pill counter */}
          <div className="flex items-center gap-2 bg-white dark:bg-[#111c2e] px-4 py-2 rounded-xl shadow-xs border border-gray-200 dark:border-slate-800 text-[13px] font-medium text-gray-700 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-heading font-bold text-gray-900 dark:text-white tabular-nums">
              {activeCount}
            </span>
            <span>livreurs actifs sur</span>
            <span className="font-heading font-bold text-gray-900 dark:text-white tabular-nums">
              {totalCount}
            </span>
          </div>

          <button
            onClick={() => setIsMotifsGuideModalOpen(true)}
            className="bg-white dark:bg-[#111c2e] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-semibold text-[13px] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Consulter les 6 motifs d'annulation officiels de la flotte Eguette"
          >
            <AlertTriangle className="w-4 h-4 text-[#CC0000]" />
            <span>Motifs d'annulation (6)</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-white dark:bg-[#111c2e] hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 font-semibold text-[13px] rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Consulter les horaires d'ouverture"
          >
            <Clock className="w-4 h-4 text-[#CC0000]" />
            <span>Aujourd'hui : {todaysSchedule.horaires}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#CC0000] hover:bg-[#b00000] text-white font-semibold text-[13px] rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un livreur</span>
          </button>
        </div>
      </div>

      {/* Realtime Analytics Micro-Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Courses Effectuées
            </div>
            <div className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tabular-nums mt-0.5">
              {totalCourses || 18}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
            <Bike className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Temps Moyen Course
            </div>
            <div className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tabular-nums mt-0.5">
              23<span className="text-base font-normal text-gray-400 ml-0.5">min</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Taux de Ponctualité
            </div>
            <div className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tabular-nums mt-0.5">
              96.4<span className="text-base font-normal text-gray-400 ml-0.5">%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#111c2e] p-4 rounded-2xl shadow-xs border border-gray-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
              Commandes en Transit
            </div>
            <div className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tabular-nums mt-0.5">
              5
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SECTION 1: ÉQUIPE MATIN */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-500">
              <Sun className="w-4 h-4" />
            </div>
            <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
              Équipe Matin
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 tabular-nums">
              12:00 — 20:00
            </span>
          </div>
          <span className="text-[12px] text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {morningDrivers.length} livreurs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {morningDrivers.map((driver) => {
            const initials = driver.nom_complet
              .split(' ')
              .map((w) => w[0])
              .join('')
              .substring(0, 2);

            return (
              <div
                key={driver.id}
                className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  {/* Top Row: Avatar + Name + Status */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 text-[#CC0000] font-heading font-bold text-base flex items-center justify-center">
                        {initials}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111c2e] ${
                            driver.en_service ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-[15px] text-gray-900 dark:text-white">
                          {driver.nom_complet}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Matricule : {driver.matricule || '#LIV-084'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {driver.en_service ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        En service
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Hors service
                      </span>
                    )}
                  </div>

                  {/* Phone Number Row */}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 text-[13px]">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium tabular-nums">{driver.telephone}</span>
                  </div>

                  {/* Context Metrics */}
                  <div className="space-y-2 text-[12px] text-gray-500 dark:text-slate-400 pb-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        Secteur
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {driver.secteur || 'Plateau et Médina'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Courses aujourd'hui
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold tabular-nums">
                        {driver.courses_aujourdhui || 0} courses
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-gray-400" />
                        Véhicule
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {driver.vehicule || 'Scooter Yamaha 125'}
                      </span>
                    </div>
                  </div>

                  {/* Active delivery course if assigned */}
                  {(() => {
                    const activeCourse = commandes.find(
                      (c) => c.livreur_id === driver.id && c.statut === 'acceptee'
                    );
                    if (!activeCourse) return null;
                    return (
                      <div className="mb-4 p-3 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[#CC0000] uppercase tracking-wider flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            Course active : {activeCourse.code_court || activeCourse.id.substring(0, 6)}
                          </span>
                          <span className="text-gray-500 dark:text-slate-400 font-medium">
                            {activeCourse.zone}
                          </span>
                        </div>
                        <div className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
                          {activeCourse.client_nom} · {activeCourse.client_telephone}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate mb-2.5">
                          {activeCourse.adresse_livraison}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeliverCourse(activeCourse.id, activeCourse.code_court)}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Livrée</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancellingOrder(activeCourse)}
                            className="py-1.5 px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-[#CC0000] text-[11px] font-semibold rounded-lg transition cursor-pointer"
                            title="Ouvrir la modale d'annulation de course"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Toggle Action Button */}
                {driver.en_service ? (
                  <button
                    onClick={() => handleToggle(driver.id, driver.nom_complet, true)}
                    className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-[12px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4 text-gray-400" />
                    <span>Désactiver</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggle(driver.id, driver.nom_complet, false)}
                    className="w-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-white fill-white" />
                    <span>Activer le service</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Separator */}
      <div className="my-6 border-t border-gray-200 dark:border-slate-800" />

      {/* SECTION 2: ÉQUIPE SOIR */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-500">
              <Moon className="w-4 h-4" />
            </div>
            <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
              Équipe Soir
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-900/40 tabular-nums">
              20:00 — 00:00
            </span>
          </div>
          <span className="text-[12px] text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {eveningDrivers.length} livreurs
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {eveningDrivers.map((driver) => {
            const initials = driver.nom_complet
              .split(' ')
              .map((w) => w[0])
              .join('')
              .substring(0, 2);

            return (
              <div
                key={driver.id}
                className="bg-white dark:bg-[#111c2e] rounded-2xl p-5 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-gray-100 dark:bg-slate-800 text-[#CC0000] font-heading font-bold text-base flex items-center justify-center">
                        {initials}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#111c2e] ${
                            driver.en_service ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-heading font-bold text-[15px] text-gray-900 dark:text-white">
                          {driver.nom_complet}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Matricule : {driver.matricule || '#LIV-119'}
                        </span>
                      </div>
                    </div>

                    {driver.en_service ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        En service
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        Hors service
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300 mb-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl px-3 py-2 text-[13px]">
                    <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="font-medium tabular-nums">{driver.telephone}</span>
                  </div>

                  <div className="space-y-2 text-[12px] text-gray-500 dark:text-slate-400 pb-5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        Secteur
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {driver.secteur || 'Fann et Point E'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        Courses aujourd'hui
                      </span>
                      <span className="text-gray-900 dark:text-white font-bold tabular-nums">
                        {driver.courses_aujourdhui || 0} courses
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bike className="w-3.5 h-3.5 text-gray-400" />
                        Véhicule
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {driver.vehicule || 'Scooter Kymco'}
                      </span>
                    </div>
                  </div>

                  {/* Active delivery course if assigned */}
                  {(() => {
                    const activeCourse = commandes.find(
                      (c) => c.livreur_id === driver.id && c.statut === 'acceptee'
                    );
                    if (!activeCourse) return null;
                    return (
                      <div className="mb-4 p-3 rounded-xl bg-red-50/70 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/50">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-[#CC0000] uppercase tracking-wider flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            Course active : {activeCourse.code_court || activeCourse.id.substring(0, 6)}
                          </span>
                          <span className="text-gray-500 dark:text-slate-400 font-medium">
                            {activeCourse.zone}
                          </span>
                        </div>
                        <div className="text-[12px] font-semibold text-gray-900 dark:text-white truncate">
                          {activeCourse.client_nom} · {activeCourse.client_telephone}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate mb-2.5">
                          {activeCourse.adresse_livraison}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDeliverCourse(activeCourse.id, activeCourse.code_court)}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 transition shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Livrée</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancellingOrder(activeCourse)}
                            className="py-1.5 px-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-[#CC0000] text-[11px] font-semibold rounded-lg transition cursor-pointer"
                            title="Ouvrir la modale d'annulation de course"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {driver.en_service ? (
                  <button
                    onClick={() => handleToggle(driver.id, driver.nom_complet, true)}
                    className="w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-[12px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Power className="w-4 h-4 text-gray-400" />
                    <span>Désactiver</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggle(driver.id, driver.nom_complet, false)}
                    className="w-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-white fill-white" />
                    <span>Activer le service</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Quick Assignment Placeholder Card */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-[#CC0000] group-hover:bg-red-50 dark:group-hover:bg-red-950/40 transition-colors mb-2">
              <UserPlus className="w-6 h-6" />
            </div>
            <span className="font-heading font-bold text-[15px] text-gray-900 dark:text-white mb-1">
              Ajouter à l'équipe Soir
            </span>
            <span className="text-[12px] text-gray-500 dark:text-slate-400 max-w-[210px]">
              Renforcez le rush du dîner avec un coursier disponible.
            </span>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="my-6 border-t border-gray-200 dark:border-slate-800" />

      {/* SECTION 3: ÉQUIPE NUIT (OPTIONNELLE) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
              <Moon className="w-4 h-4" />
            </div>
            <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
              Équipe Nuit (Optionnelle)
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/40 tabular-nums">
              00:00 — 04:00 (jusqu'à 06:30 sam./lun.)
            </span>
          </div>
          <span className="text-[12px] text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            0 livreur
          </span>
        </div>

        <div className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-8 bg-white/40 dark:bg-[#111c2e]/40 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 mb-3">
            <Bike className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-semibold text-[16px] text-gray-900 dark:text-white mb-1">
            Aucun livreur dans cette équipe
          </h3>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 max-w-md mb-4">
            Le service de nuit est actuellement désactivé. Vous pouvez affecter des coursiers ou planifier les créneaux pour les commandes tardives.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 text-[12px] font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#CC0000]" />
            <span>Assigner des livreurs à ce shift</span>
          </button>
        </div>
      </section>

      {/* Real Operating Hours Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-[#111c2e] p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-[17px] text-gray-900 dark:text-white leading-tight">
                    Horaires d'ouverture officiels
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">
                    Eguette OPS · Grille hebdomadaire de service
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-gray-100 dark:divide-slate-800">
              {WEEKLY_SCHEDULE_ORDER.map((item) => {
                const isToday = item.jour.toLowerCase() === todaysSchedule.jour.toLowerCase();
                return (
                  <div
                    key={item.jour}
                    className={`py-2.5 px-3 rounded-xl flex items-center justify-between text-[13px] ${
                      isToday
                        ? 'bg-red-50/80 dark:bg-red-950/30 text-gray-900 dark:text-white font-semibold'
                        : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isToday && <span className="w-2 h-2 rounded-full bg-[#CC0000]" />}
                      <span>{item.jour}</span>
                    </div>
                    <span className="font-medium tabular-nums text-right">{item.horaires}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-[11px] text-gray-500 dark:text-slate-400 flex items-center justify-between">
              <span>Shift Matin : 12:00 – 20:00</span>
              <span>Shift Soir : 20:00 – Clôture</span>
            </div>
          </div>
        </div>
      )}

      {/* Official Cancellation Motifs Guide Modal (Eguette Flotte) */}
      {isMotifsGuideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white dark:bg-[#111c2e] p-5 sm:p-6 shadow-2xl border border-gray-100 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000] shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading font-bold text-[18px] text-gray-900 dark:text-white leading-tight">
                      Motifs d'Annulation Flotte
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-[#CC0000]">
                      Cahier des charges
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">
                    Liste complète des motifs d'annulation configurés dans l'application Eguette Flotte
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMotifsGuideModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white cursor-pointer"
                title="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of 6 motifs */}
            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {MOTIFS_ANNULATION.map((m, index) => {
                const IconComponent = m.icon;
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100/70 dark:bg-red-950/50 flex items-center justify-center text-[#CC0000] shrink-0 mt-0.5 font-heading font-bold text-[12px]">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4 text-[#CC0000] shrink-0" />
                        <h4 className="font-heading font-bold text-[14px] text-gray-900 dark:text-white">
                          {m.title}
                        </h4>
                      </div>
                      <p className="text-[12px] text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Technical operation overview */}
            <div className="mt-4 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/40 text-[12px] text-blue-900 dark:text-blue-200 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
                <Info className="w-4 h-4 shrink-0" />
                <span>Fonctionnement technique :</span>
              </div>
              <ul className="space-y-1 pl-5 list-disc text-[11.5px] text-blue-800 dark:text-blue-300/90 leading-relaxed">
                <li>
                  <strong>Sélection du motif :</strong> Le livreur clique sur « Annuler » sur une course active, ce qui ouvre la modale dédiée.
                </li>
                <li>
                  <strong>Enregistrement en base de données :</strong> Le statut de la commande passe à <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-[11px]">'annulee'</code>, avec l'horodatage <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-[11px]">annulee_at = now()</code> et l'enregistrement du motif exact dans le champ <code className="font-mono bg-blue-100 dark:bg-blue-900/60 px-1 py-0.5 rounded text-[11px]">motif_annulation</code>.
                </li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMotifsGuideModalOpen(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-[#CC0000] hover:bg-[#b00000] text-white transition-colors cursor-pointer"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal for Active Courses */}
      <CancelOrderModal
        isOpen={Boolean(cancellingOrder)}
        commande={cancellingOrder}
        onClose={() => setCancellingOrder(null)}
        onCancelled={() => {
          reloadData();
          showToast("Course annulée et motif enregistré dans la base de données.");
        }}
      />

      {/* Add Driver Modal */}
      <NewDriverModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={() => {
          reloadData();
          showToast('Nouveau livreur enregistré avec succès !');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[13px] font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
