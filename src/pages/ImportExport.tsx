import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Users,
  UploadCloud,
  FileDown,
  Download,
  Clock,
  CheckCircle,
  FileText,
  ListFilter,
  Check,
} from 'lucide-react';
import Papa from 'papaparse';
import {
  getLocalCommandes,
  saveLocalCommandes,
  getLocalLivreurs,
  saveLocalLivreurs,
  createCommande,
  addLivreur,
} from '../lib/dataStore';
import { exportCommandesPDF } from '../lib/pdfExport';

export const ImportExport: React.FC = () => {
  const [ordersFileName, setOrdersFileName] = useState<string | null>(null);
  const [driversFileName, setDriversFileName] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const ordersInputRef = useRef<HTMLInputElement>(null);
  const driversInputRef = useRef<HTMLInputElement>(null);

  // Template download for orders CSV
  const downloadOrdersTemplate = () => {
    const csvContent =
      'client_nom,client_telephone,adresse_livraison,zone,plats,montant_repas,frais_livraison\n' +
      'Moussa Sow,+221 77 123 45 67,Rue Félix Faure,Plateau,2x Thiéboudienne Penda,13000,1500\n' +
      'Aïda Ndiaye,+221 76 987 65 43,Route des Almadies,Almadies,1x Dibi Agneau,8500,1500\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele_import_commandes.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Template download for drivers CSV
  const downloadDriversTemplate = () => {
    const csvContent =
      'nom_complet,telephone,equipe,secteur,vehicule\n' +
      'Ibrahima Diallo,+221 77 111 22 33,Matin,Plateau et Médina,Scooter Yamaha 125\n' +
      'Modou Ndiaye,+221 78 444 55 66,Soir,Almadies et Ngor,Moto Honda CG\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele_import_livreurs.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export orders to CSV
  const exportOrdersCSV = () => {
    const orders = getLocalCommandes();
    const csv = Papa.unparse(
      orders.map((c) => ({
        ID: c.id,
        Code: c.code_court || '',
        Client: c.client_nom,
        Telephone: c.client_telephone,
        Adresse: c.adresse_livraison,
        Zone: c.zone,
        Plats: c.plats,
        Montant_Repas_FCFA: c.montant_repas,
        Frais_Livraison_FCFA: c.frais_livraison,
        Total_FCFA: c.montant_repas + c.frais_livraison,
        Statut: c.statut,
        Equipe: c.equipe,
        Cree_A: c.created_at,
        Livree_A: c.livree_at || '',
        Annulee_A: c.annulee_at || '',
        Motif_Annulation: c.motif_annulation || '',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bilan_commandes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export drivers to CSV
  const exportDriversCSV = () => {
    const drivers = getLocalLivreurs();
    const csv = Papa.unparse(
      drivers.map((d) => ({
        ID: d.id,
        Matricule: d.matricule || '',
        Nom_Complet: d.nom_complet,
        Telephone: d.telephone,
        Equipe: d.equipe,
        En_Service: d.en_service ? 'Oui' : 'Non',
        Secteur: d.secteur || '',
        Vehicule: d.vehicule || '',
        Courses_Aujourdhui: d.courses_aujourdhui || 0,
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `registre_livreurs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle Orders file upload
  const handleOrdersFile = (file: File) => {
    setOrdersFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let importedCount = 0;
        for (const row of results.data as any[]) {
          if (row.client_nom && row.adresse_livraison) {
            await createCommande({
              client_nom: row.client_nom,
              client_telephone: row.client_telephone || '+221 ',
              adresse_livraison: row.adresse_livraison,
              zone: row.zone || 'Plateau',
              plats: row.plats || 'Plat du jour',
              montant_repas: Number(row.montant_repas) || 8000,
              frais_livraison: Number(row.frais_livraison) || 1500,
            });
            importedCount++;
          }
        }
        setImportStatus(`${importedCount} commandes importées avec succès !`);
        setTimeout(() => setImportStatus(null), 4000);
      },
      error: (err) => {
        console.error(err);
        setImportStatus("Erreur lors de l'import du fichier.");
      },
    });
  };

  // Handle Drivers file upload
  const handleDriversFile = (file: File) => {
    setDriversFileName(file.name);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let importedCount = 0;
        for (const row of results.data as any[]) {
          if (row.nom_complet && row.telephone) {
            await addLivreur({
              nom_complet: row.nom_complet,
              telephone: row.telephone,
              equipe: row.equipe === 'Soir' ? 'Soir' : 'Matin',
              en_service: true,
              secteur: row.secteur || 'Plateau',
              vehicule: row.vehicule || 'Scooter 125',
            });
            importedCount++;
          }
        }
        setImportStatus(`${importedCount} livreurs enregistrés avec succès !`);
        setTimeout(() => setImportStatus(null), 4000);
      },
      error: (err) => {
        console.error(err);
        setImportStatus("Erreur lors de l'import du registre.");
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Heading matching Screenshot 4 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider mb-1">
            <span>Passerelle de synchronisation</span>
            <span>•</span>
            <span>Dakar Plateau Hub</span>
          </div>
          <h1 className="font-heading font-bold text-2xl md:text-3xl text-gray-900 dark:text-white tracking-tight">
            Import / Export
          </h1>
          <p className="text-[13px] text-gray-500 dark:text-slate-400 max-w-2xl mt-0.5">
            Centralisation des transferts de données, sauvegardes et intégrations par lots.
          </p>
        </div>

        {/* Active Pipeline Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#111c2e] rounded-full shadow-xs border border-gray-200 dark:border-slate-800 text-[12px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CC0000] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CC0000]" />
          </span>
          <span className="text-gray-900 dark:text-white font-medium">
            Moteur d'intégration : <span className="text-[#CC0000] font-bold">Actif</span>
          </span>
          <span className="text-gray-300 dark:text-slate-600">•</span>
          <span className="text-gray-500 dark:text-slate-400 text-[11px]">Protocole UTF-8 RFC 4180</span>
        </div>
      </div>

      {/* Status banner */}
      {importStatus && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-[13px] flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Main Import Grid: Two Column Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CARD 1: Importer des commandes */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000]">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Flux Opérationnel
                  </span>
                  <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                    Importer des commandes
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                Batch v2.4
              </span>
            </div>

            <p className="text-[13px] text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
              Téléversez vos fichiers de commandes au format CSV ou Excel (.xlsx) pour importer vos historiques ou commandes en attente en masse.
            </p>

            {/* Dropzone */}
            <div
              onClick={() => ordersInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleOrdersFile(e.dataTransfer.files[0]);
                }
              }}
              className="group/dropzone rounded-xl bg-gray-50/70 dark:bg-slate-800/50 hover:bg-gray-100/80 dark:hover:bg-slate-800 p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer mb-4 border border-dashed border-gray-200 dark:border-slate-700"
            >
              <input
                ref={ordersInputRef}
                type="file"
                accept=".csv, .xlsx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleOrdersFile(e.target.files[0]);
                }}
              />
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center text-gray-400 group-hover/dropzone:text-[#CC0000] transition-colors mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800 dark:text-slate-200 mb-0.5">
                Glissez-déposez votre archive ici
              </p>
              <p className="text-[11px] text-gray-400">
                Formats acceptés : <strong className="text-gray-700 dark:text-slate-300">.CSV, .XLSX</strong> (Max 25 Mo). Modèle type disponible.
              </p>
              {ordersFileName && (
                <div className="mt-2 text-[11px] font-bold text-[#CC0000] bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full">
                  Fichier sélectionné : {ordersFileName}
                </div>
              )}
            </div>
          </div>

          {/* Action Row & Template Link */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => ordersInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choisir un fichier</span>
            </button>
            <button
              type="button"
              onClick={downloadOrdersTemplate}
              className="inline-flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-[12px] font-medium py-1 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-gray-400" />
              <span>Télécharger le modèle de fichier .CSV</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Importer des livreurs */}
        <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                    Flotte et RH
                  </span>
                  <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                    Importer des livreurs
                  </h2>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                Registre RH
              </span>
            </div>

            <p className="text-[13px] text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">
              Ajoutez plusieurs coursiers et chauffeurs simultanément en chargeant votre registre d'équipe avec matricules, coordonnées et secteurs.
            </p>

            {/* Dropzone */}
            <div
              onClick={() => driversInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleDriversFile(e.dataTransfer.files[0]);
                }
              }}
              className="group/dropzone rounded-xl bg-gray-50/70 dark:bg-slate-800/50 hover:bg-gray-100/80 dark:hover:bg-slate-800 p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer mb-4 border border-dashed border-gray-200 dark:border-slate-700"
            >
              <input
                ref={driversInputRef}
                type="file"
                accept=".csv, .xlsx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleDriversFile(e.target.files[0]);
                }}
              />
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center text-gray-400 group-hover/dropzone:text-[#CC0000] transition-colors mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-[13px] font-semibold text-gray-800 dark:text-slate-200 mb-0.5">
                Glissez-déposez votre registre ici
              </p>
              <p className="text-[11px] text-gray-400">
                Formats acceptés : <strong className="text-gray-700 dark:text-slate-300">.CSV, .XLSX</strong> (Max 15 Mo). Modèle type disponible.
              </p>
              {driversFileName && (
                <div className="mt-2 text-[11px] font-bold text-[#CC0000] bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full">
                  Fichier sélectionné : {driversFileName}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => driversInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold transition-all shadow-xs cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Choisir un fichier</span>
            </button>
            <button
              type="button"
              onClick={downloadDriversTemplate}
              className="inline-flex items-center justify-center gap-1.5 text-gray-500 hover:text-gray-900 dark:hover:text-white text-[12px] font-medium py-1 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-gray-400" />
              <span>Télécharger le modèle de fichier .CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full-Width Card: Exporter les données */}
      <div className="w-full bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-[#CC0000] shrink-0 mt-0.5">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                  Reporting Financier et Statistiques
                </span>
                <h2 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                  Exporter les données
                </h2>
                <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Générez et téléchargez instantanément les rapports complets de vos opérations pour la comptabilité, les bilans ou le reporting.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-[12px] self-start lg:self-center">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Période : Mois en cours (Septembre 2026)</span>
            </div>
          </div>

          {/* 3 Secondary Export Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Button 1: Commandes (PDF) */}
            <button
              type="button"
              onClick={() => exportCommandesPDF(getLocalCommandes(), 'Export Comptable Commandes')}
              className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-[#CC0000] shadow-xs group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Commandes (PDF)
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">
                    Factures et tickets fiscaux
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:text-[#CC0000] shadow-xs transition-colors">
                <Download className="w-4 h-4" />
              </div>
            </button>

            {/* Button 2: Commandes (Excel/CSV) */}
            <button
              type="button"
              onClick={exportOrdersCSV}
              className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 group-hover:text-[#CC0000] shadow-xs group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Commandes (Excel)
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">
                    Export brut avec ventilations
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:text-[#CC0000] shadow-xs transition-colors">
                <Download className="w-4 h-4" />
              </div>
            </button>

            {/* Button 3: Livreurs (Excel/CSV) */}
            <button
              type="button"
              onClick={exportDriversCSV}
              className="group flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all text-left cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-slate-300 group-hover:text-[#CC0000] shadow-xs group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-[13px] text-gray-900 dark:text-white">
                    Livreurs (Excel)
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">
                    Courses, shifts et pourboires
                  </div>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-gray-400 group-hover:text-[#CC0000] shadow-xs transition-colors">
                <Download className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>

        {/* Bottom Contextual Status Strip */}
        <div className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[12px] text-gray-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400 shrink-0" />
            <span>
              <strong className="text-gray-900 dark:text-white">Dernière exportation :</strong> Aujourd'hui à{' '}
              <span className="font-semibold text-gray-900 dark:text-white">14:30</span> par{' '}
              <span className="text-gray-900 dark:text-white">Chef Marc V.</span> (Bilan Commandes Excel - 1.4 Mo)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] uppercase tracking-wider font-semibold">Archive SHA-256 Validée</span>
          </div>
        </div>
      </div>

      {/* Operational Log / Transfer Journal */}
      <div className="bg-white dark:bg-[#111c2e] rounded-2xl p-6 shadow-xs border border-gray-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-gray-400" />
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white">
              Journal des transferts récents
            </h3>
          </div>
          <span className="text-[11px] text-gray-400">30 derniers jours</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-2.5 px-4 rounded-l-lg">Type</th>
                <th className="py-2.5 px-4">Fichier et Cible</th>
                <th className="py-2.5 px-4">Auteur</th>
                <th className="py-2.5 px-4">Date et Heure</th>
                <th className="py-2.5 px-4">Statut</th>
                <th className="py-2.5 px-4 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800/60">
              <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 font-semibold text-gray-700 dark:text-slate-300 text-[11px]">
                    <Download className="w-3 h-3" />
                    Export
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  bilan_commandes_septembre2026.xlsx <span className="text-gray-400 font-normal">(1.4 Mo)</span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Chef Marc V.</td>
                <td className="py-3 px-4 text-gray-500 dark:text-slate-400 tabular-nums">Aujourd'hui, 14:30</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
                    Terminé
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={exportOrdersCSV}
                    className="font-semibold text-[#CC0000] hover:underline cursor-pointer"
                  >
                    Télécharger à nouveau
                  </button>
                </td>
              </tr>

              <tr className="hover:bg-gray-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdad4] text-[#410000] font-semibold text-[11px]">
                    <UploadCloud className="w-3 h-3" />
                    Import
                  </span>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                  flotte_livreurs_dakar_hub.csv <span className="text-gray-400 font-normal">(142 Ko)</span>
                </td>
                <td className="py-3 px-4 text-gray-600 dark:text-slate-400">Admin Eguette_OPS</td>
                <td className="py-3 px-4 text-gray-500 dark:text-slate-400 tabular-nums">Hier, 09:15</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold text-blue-700 bg-blue-50 dark:bg-blue-950/40">
                    6 entrées ajoutées
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => alert('Log de synchronisation : 6 livreurs importés sans conflit.')}
                    className="text-gray-500 hover:text-gray-900 dark:hover:text-white cursor-pointer"
                  >
                    Voir logs
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
