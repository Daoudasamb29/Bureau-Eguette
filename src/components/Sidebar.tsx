import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  Bike,
  BarChart3,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  LogOut,
  LogIn,
  Smartphone,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingOrdersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, pendingOrdersCount = 0 }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      to: '/',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      to: '/commandes',
      label: 'Commandes',
      icon: Receipt,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
    },
    {
      to: '/livreurs',
      label: 'Livreurs',
      icon: Bike,
    },
    {
      to: '/rapport',
      label: 'Rapports et Stats',
      icon: BarChart3,
    },
    {
      to: '/diagnostic',
      label: 'Diagnostic et Décisions',
      icon: Sparkles,
    },
    {
      to: '/import-export',
      label: 'Import / Export',
      icon: FileSpreadsheet,
    },
    {
      to: '/login',
      label: 'Connexion (Auth)',
      icon: LogIn,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-60 md:w-64 bg-white dark:bg-[#111c2e] border-r border-[#E5E7EB] dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto px-4 pt-5">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between px-2 pb-5 mb-2 border-b border-gray-100 dark:border-slate-800/80">
            <NavLink to="/" onClick={onClose} className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#CC0000] flex items-center justify-center shadow-xs">
                <UtensilsCrossed className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="font-heading font-bold text-[17px] tracking-tight flex items-center leading-none">
                  <span className="text-[#CC0000]">Eguette</span>
                  <span className="text-[#0b1c30] dark:text-white ml-1">OPS</span>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-widest mt-1">
                  Resto OS Dakar
                </span>
              </div>
            </NavLink>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white md:hidden"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section: Menu */}
          <div className="px-2 mb-2 text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
            Menu
          </div>
          <nav className="flex flex-col gap-1 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                      isActive
                        ? 'bg-[#CC0000] text-white shadow-xs font-semibold'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#ffdad4] text-[#410000]">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Section: Général */}
          <div className="px-2 mb-2 text-[11px] font-semibold text-gray-400 dark:text-slate-400 uppercase tracking-wider">
            Général
          </div>
          <nav className="flex flex-col gap-1">
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-600 dark:text-slate-300 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 transition-colors text-left"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Paramètres</span>
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-gray-600 dark:text-slate-300 hover:bg-[#F5F5F5] dark:hover:bg-slate-800 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 shrink-0" />
              <span>Support / Aide</span>
            </button>
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Déconnexion</span>
            </button>
          </nav>
        </div>

        {/* Mobile App Promo Card */}
        <div className="p-3">
          <div className="rounded-2xl p-3.5 bg-[#EFF4FF] dark:bg-slate-800/80 flex flex-col gap-1 border border-blue-100/60 dark:border-slate-700/60">
            <div className="flex items-center gap-1.5 text-[#CC0000] font-semibold text-[11px] uppercase tracking-wide">
              <Smartphone className="w-4 h-4" />
              <span>App Mobile</span>
            </div>
            <p className="text-[12px] text-gray-600 dark:text-slate-300 leading-snug">
              Gérez vos commandes en direct sur iOS et Android.
            </p>
            <button
              type="button"
              className="inline-flex items-center justify-center text-[12px] font-semibold rounded-full bg-white dark:bg-slate-700 text-[#0b1c30] dark:text-white py-1.5 px-3 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors mt-1 shadow-xs cursor-pointer"
            >
              Télécharger
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
