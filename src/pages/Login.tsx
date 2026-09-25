import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  UtensilsCrossed,
  ShieldCheck,
  Bike,
  Sparkles,
} from 'lucide-react';
import { useAuth, AuthUser } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const { isDark } = useTheme();

  // Mode: 'signup' corresponds directly to reference image conex.jpg!
  // In 'signup' mode: Red panel on LEFT ("Welcome Back!", "SIGN IN"), Form on RIGHT ("Create Account", "SIGN UP").
  // In 'signin' mode: Red panel on RIGHT ("Hello, Friend!", "SIGN UP"), Form on LEFT ("Sign In", "SIGN IN").
  const [isSignUpMode, setIsSignUpMode] = useState(true);

  // Language toggle (EN matches the screenshot text verbatim, FR provides local ops translation)
  const [lang, setLang] = useState<'en' | 'fr'>('en');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<AuthUser['role']>('Manager');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const t = {
    en: {
      welcomeBack: 'Welcome Back!',
      welcomeBackSub: 'Enter your personal details to use all of site features',
      signInBtnOutline: 'SIGN IN',
      helloFriend: 'Hello, Friend!',
      helloFriendSub: 'Register with your personal details to use all of site features',
      signUpBtnOutline: 'SIGN UP',
      createAccount: 'Create Account',
      signInTitle: 'Sign In',
      socialOrRegister: 'or use your email for registration',
      socialOrSignIn: 'or use your email password',
      namePlaceholder: 'Name',
      emailPlaceholder: 'Email',
      passwordPlaceholder: 'Password',
      forgotPassword: 'Forgot Your Password?',
      signUpSubmit: 'SIGN UP',
      signInSubmit: 'SIGN IN',
      backToApp: 'Back to Dashboard',
      demoLogin: 'Quick Demo Access',
      switchLang: 'Passer en Français',
    },
    fr: {
      welcomeBack: 'Bon retour !',
      welcomeBackSub: 'Saisissez vos identifiants pour accéder à toutes les fonctionnalités',
      signInBtnOutline: 'SE CONNECTER',
      helloFriend: 'Bienvenue !',
      helloFriendSub: 'Rejoignez la plateforme Eguette OPS et commencez vos opérations',
      signUpBtnOutline: 'CRÉER UN COMPTE',
      createAccount: 'Créer un compte',
      signInTitle: 'Connexion',
      socialOrRegister: 'ou utilisez votre email pour vous inscrire',
      socialOrSignIn: 'ou utilisez votre adresse email et mot de passe',
      namePlaceholder: 'Nom complet',
      emailPlaceholder: 'Adresse email',
      passwordPlaceholder: 'Mot de passe',
      forgotPassword: 'Mot de passe oublié ?',
      signUpSubmit: "S'INSCRIRE",
      signInSubmit: 'SE CONNECTER',
      backToApp: "Retour à l'application",
      demoLogin: 'Accès Rapide Démo',
      switchLang: 'Switch to English',
    },
  }[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(lang === 'en' ? 'Please fill in all required fields' : 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (isSignUpMode && !name.trim()) {
      setError(lang === 'en' ? 'Please enter your name' : 'Veuillez renseigner votre nom complet');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUpMode) {
        await signup(name, email, role);
        setSuccessMessage(lang === 'en' ? 'Account created successfully! Redirecting...' : 'Compte créé avec succès ! Redirection...');
      } else {
        await login(email, undefined, role);
        setSuccessMessage(lang === 'en' ? 'Welcome back! Redirecting...' : 'Connexion réussie ! Redirection...');
      }
      setTimeout(() => {
        navigate('/');
      }, 700);
    } catch (err) {
      console.error(err);
      setError(lang === 'en' ? 'Authentication failed. Please try again.' : 'Échec de la connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoName: string, demoRole: AuthUser['role']) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(demoEmail, demoName, demoRole);
      setSuccessMessage(`${demoName} connecté ! Redirection...`);
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la connexion rapide.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EBF0F7] dark:bg-[#0c1322] flex flex-col justify-between p-4 sm:p-6 md:p-8 transition-colors duration-200">
      {/* Top Bar with Brand, Back button & Language switcher */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 hover:text-[#CC0000] dark:hover:text-red-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToApp}</span>
        </Link>

        {/* Brand center */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#CC0000] flex items-center justify-center text-white shadow-xs">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
          <span className="font-heading font-bold text-base tracking-tight text-gray-900 dark:text-white">
            Eguette <span className="text-[#CC0000]">OPS</span>
          </span>
        </div>

        {/* Language switch button */}
        <button
          onClick={() => setLang(lang === 'en' ? 'fr' : 'en')}
          className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 border border-gray-200 dark:border-slate-700 shadow-xs hover:bg-gray-50 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          {t.switchLang} ({lang.toUpperCase()})
        </button>
      </div>

      {/* Main Floating Auth Card matching conex.jpg */}
      <div className="w-full max-w-[860px] mx-auto my-auto">
        <div className="relative bg-white dark:bg-[#111c2e] rounded-[32px] shadow-2xl shadow-indigo-950/10 dark:shadow-black/50 overflow-hidden border border-gray-100 dark:border-slate-800 min-h-[520px] flex flex-col md:flex-row transition-all duration-300">
          {/* =========================================================================
              PANEL 1: RED CURVED HIGHLIGHT PANEL
              In SIGN UP mode (default matching conex.jpg): Placed on LEFT with outward curve to the right.
              In SIGN IN mode: Placed on RIGHT with outward curve to the left.
             ========================================================================= */}
          <div
            className={`w-full md:w-1/2 bg-gradient-to-br from-[#FF4336] via-[#FF3324] to-[#CC0000] text-white p-8 md:p-12 flex flex-col items-center justify-center text-center relative z-10 transition-all duration-500 ease-in-out order-first ${
              isSignUpMode
                ? 'md:rounded-r-[160px] md:order-1'
                : 'md:rounded-l-[160px] md:order-2'
            }`}
          >
            {/* Subtle glow / light flare */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-[inherit]">
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-black/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 max-w-xs space-y-4">
              <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight leading-tight">
                {isSignUpMode ? t.welcomeBack : t.helloFriend}
              </h2>
              <p className="text-sm font-normal text-white/90 leading-relaxed px-2">
                {isSignUpMode ? t.welcomeBackSub : t.helloFriendSub}
              </p>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUpMode(!isSignUpMode);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-block border-2 border-white rounded-full py-2.5 px-11 text-white font-heading font-bold text-xs uppercase tracking-widest hover:bg-white hover:text-[#CC0000] hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                >
                  {isSignUpMode ? t.signInBtnOutline : t.signUpBtnOutline}
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PANEL 2: FORM PANEL (White background matching conex.jpg)
             ========================================================================= */}
          <div
            className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center relative z-0 transition-all duration-500 order-last ${
              isSignUpMode ? 'md:order-2' : 'md:order-1'
            }`}
          >
            <div className="w-full max-w-sm flex flex-col items-center">
              {/* Form Title */}
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-gray-900 dark:text-white tracking-tight mb-4 text-center">
                {isSignUpMode ? t.createAccount : t.signInTitle}
              </h1>

              {/* 3 Social Login Icons (matching the 3 rounded square boxes in conex.jpg) */}
              <div className="flex items-center gap-3.5 mb-4">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('google.user@eguette.sn', 'Utilisateur Google', 'Manager')}
                  title="Continuer avec Google"
                  className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-gray-700 dark:text-slate-200 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/60 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.76-2.1-6.71-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.29 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.05-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.05 3.15c.95-2.83 3.59-4.98 6.71-4.98z"
                    />
                  </svg>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('apple.user@eguette.sn', 'Utilisateur Apple', 'Manager')}
                  title="Continuer avec Apple"
                  className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-gray-800 dark:text-slate-100 hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/60 shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.93-2.85-.9.04-1.99.6-2.64 1.35-.58.66-1.08 1.74-.95 2.76 1.01.08 2.04-.51 2.66-1.26z" />
                  </svg>
                </button>

                {/* Wave / Orange Money / SSO */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('wave.pay@eguette.sn', 'Opérateur Wave', 'Opérateur')}
                  title="Accès Wave / Téléphone"
                  className="w-11 h-11 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-[#1DA1F2] hover:border-gray-400 dark:hover:border-slate-500 hover:bg-gray-50 dark:hover:bg-slate-700/60 shadow-xs transition-all active:scale-95 cursor-pointer font-bold text-xs"
                >
                  <span className="font-heading font-black text-sm text-[#1DA1F2]">W</span>
                </button>
              </div>

              {/* Subtitle / Separator */}
              <span className="text-[12px] text-gray-400 dark:text-slate-400 mb-4 text-center">
                {isSignUpMode ? t.socialOrRegister : t.socialOrSignIn}
              </span>

              {/* Error and Success Alerts */}
              {error && (
                <div className="w-full mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs text-[#CC0000] dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="w-full mb-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form matching input fields in conex.jpg */}
              <form onSubmit={handleSubmit} className="w-full space-y-3">
                {isSignUpMode && (
                  <div>
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#EEEEEE] dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-transparent focus:border-[#CC0000] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                    />
                  </div>
                )}

                <div>
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-[#EEEEEE] dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-transparent focus:border-[#CC0000] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-xl bg-[#EEEEEE] dark:bg-slate-800 text-[13px] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 border border-transparent focus:border-[#CC0000] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Role selector if signing up */}
                {isSignUpMode && (
                  <div className="pt-1">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                      {lang === 'en' ? 'Role / Responsibility' : 'Rôle opérationnel'}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-[#EEEEEE] dark:bg-slate-800 text-[12px] text-gray-800 dark:text-slate-200 border border-transparent focus:border-[#CC0000] focus:outline-none"
                    >
                      <option value="Manager">Manager / Superviseur Restaurant</option>
                      <option value="Livreur">Livreur / Coursier Flotte</option>
                      <option value="Opérateur">Opérateur Caisse / Dispatch</option>
                      <option value="Admin">Administrateur Système</option>
                    </select>
                  </div>
                )}

                {/* Forgot Password link in sign in mode */}
                {!isSignUpMode && (
                  <div className="text-center pt-1">
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert(
                          lang === 'en'
                            ? 'Password reset instructions have been dispatched to your email.'
                            : 'Un email de réinitialisation de mot de passe a été envoyé.'
                        );
                      }}
                      className="text-xs text-gray-500 dark:text-slate-400 hover:text-[#CC0000] dark:hover:text-red-400 transition-colors"
                    >
                      {t.forgotPassword}
                    </a>
                  </div>
                )}

                {/* Primary Button matching conex.jpg button */}
                <div className="pt-3 text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto min-w-[170px] inline-flex items-center justify-center bg-[#FF3838] hover:bg-[#CC0000] text-white font-heading font-bold text-xs uppercase tracking-wider py-3.5 px-12 rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>{isSignUpMode ? t.signUpSubmit : t.signInSubmit}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-6 p-4 rounded-2xl bg-white/70 dark:bg-[#111c2e]/70 backdrop-blur-sm border border-gray-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-[#CC0000]" />
            <span className="font-semibold">{t.demoLogin} :</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button
              onClick={() => handleQuickLogin('manager@jengu.tech', 'Chef Marc V.', 'Manager')}
              className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-[#CC0000] dark:text-red-300 border border-red-200/60 dark:border-red-900/40 hover:bg-red-100 font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manager (Chef Marc)</span>
            </button>

            <button
              onClick={() => handleQuickLogin('alioune.sarr@eguette.sn', 'Alioune Sarr', 'Livreur')}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40 hover:bg-emerald-100 font-medium transition cursor-pointer flex items-center gap-1.5"
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Coursier (Alioune Sarr)</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 font-medium transition cursor-pointer"
            >
              Mode Invité →
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="w-full max-w-5xl mx-auto text-center pt-4 text-[11px] text-gray-400 dark:text-slate-500">
        Eguette OPS Dakar · Plateforme de gestion des commandes et de la flotte de livraison · Dakar Hub
      </div>
    </div>
  );
};
