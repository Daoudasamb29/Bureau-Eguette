import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Store,
  Bell,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  User,
  CheckCircle,
  LogOut,
  LogIn,
  Shield,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  searchTerm = '',
  onSearchChange,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentBranch, setCurrentBranch] = useState('Dakar Plateau');
  const [showBranchMenu, setShowBranchMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const branches = ['Dakar Plateau', 'Almadies Hub', 'Point E Express', 'Paris Opéra'];

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111c2e]/90 backdrop-blur-md border-b border-[#E5E7EB] dark:border-slate-800 flex items-center justify-between px-4 md:px-6 transition-colors">
      {/* Left: Mobile Menu Trigger + Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un plat, commande, client..."
            value={searchTerm}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-12 rounded-full bg-[#F5F5F5] dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC0000]/20 focus:bg-white dark:focus:bg-slate-900 border border-transparent transition-all"
          />
          <div className="hidden sm:flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-gray-200 dark:bg-slate-700 text-[10px] font-semibold text-gray-500 dark:text-slate-300">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Branch / Restaurant Hub Selector */}
        <div className="relative">
          <button
            onClick={() => setShowBranchMenu(!showBranchMenu)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F5] dark:bg-slate-800 text-[12px] font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4 text-[#CC0000]" />
            <span>{currentBranch}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showBranchMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-gray-100 dark:border-slate-700 py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase text-gray-400">
                Changer de Hub
              </div>
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    setCurrentBranch(b);
                    setShowBranchMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700 ${
                    currentBranch === b ? 'text-[#CC0000] font-semibold' : 'text-gray-700 dark:text-slate-200'
                  }`}
                >
                  <span>{b}</span>
                  {currentBranch === b && <CheckCircle className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-600 dark:text-amber-400 border border-gray-200/60 dark:border-slate-700/80 transition-all duration-200 active:scale-95 shadow-xs cursor-pointer"
          title={isDark ? 'Mode sombre actif - Cliquer pour passer en mode clair' : 'Mode clair actif - Cliquer pour passer en mode sombre'}
          aria-label="Basculer le mode sombre"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-gray-600 hover:text-[#CC0000] transition-transform duration-300 -rotate-12 hover:rotate-0" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#CC0000] ring-2 ring-white dark:ring-[#111c2e]" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-700">
                <span className="text-[13px] font-bold text-gray-900 dark:text-white">Notifications</span>
                <span className="text-[10px] font-semibold text-[#CC0000] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full">
                  2 nouvelles
                </span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <div className="p-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 text-[12px]">
                  <div className="font-semibold text-gray-800 dark:text-slate-200">
                    Course livrée #4091
                  </div>
                  <div className="text-gray-500 dark:text-slate-400 text-[11px]">
                    Alioune Sarr a finalisé la livraison à Almadies en 22 min.
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-red-50/60 dark:bg-red-950/20 text-[12px]">
                  <div className="font-semibold text-[#CC0000]">
                    Alerte Retard Médina
                  </div>
                  <div className="text-gray-500 dark:text-slate-400 text-[11px]">
                    Créneau de 21h congestionné. Prévoir renfort livreur.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile / Auth */}
        <div className="relative pl-1 border-l border-gray-200 dark:border-slate-800">
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#CC0000] flex items-center justify-center text-white font-semibold text-[13px] shadow-xs">
                  {user.name
                    ? user.name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase()
                    : 'U'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[12px] font-bold text-gray-900 dark:text-white leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-gray-500 dark:text-slate-400 leading-tight">
                    {user.role} · {user.email}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden lg:block" />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-2 border-b border-gray-100 dark:border-slate-700/80 mb-1">
                    <div className="font-heading font-bold text-[13px] text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400 truncate">
                      {user.email}
                    </div>
                    <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-[#CC0000]">
                      {user.role}
                    </span>
                  </div>

                  <Link
                    to="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5 text-gray-400" />
                    <span>Page de connexion</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Se déconnecter</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#CC0000] hover:bg-[#b00000] text-white text-[12px] font-semibold transition-colors shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
