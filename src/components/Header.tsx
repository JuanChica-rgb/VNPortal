import { useState, useEffect } from 'react';
import {
  Gamepad2, Search, Heart, LayoutGrid, Shield, LogOut, User as UserIcon, Menu, X,
  Languages,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import type { SiteSettings } from '@/types';

interface HeaderProps {
  settings: SiteSettings | null;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  view: 'catalog' | 'favorites' | 'admin';
  onNavigate: (view: 'catalog' | 'favorites' | 'admin') => void;
}

export default function Header({
  settings, searchQuery, onSearchChange, onOpenAuth, onSignOut, view, onNavigate,
}: HeaderProps) {
  const { user, isAdmin } = useAuth();
  const { t, lang, toggleLang } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const siteTitle = settings?.title || 'VN Portal';

  const navButton = (target: 'catalog' | 'favorites' | 'admin', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => {
        onNavigate(target);
        setMenuOpen(false);
      }}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        view === target
          ? 'bg-accent-500/15 text-accent-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-base-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'glass border-b border-base-700'
          : 'bg-base-950 border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo + Title */}
          <button
            onClick={() => onNavigate('catalog')}
            className="flex items-center gap-2.5 flex-shrink-0"
          >
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt={siteTitle} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-display text-lg font-bold text-white hidden sm:block">{siteTitle}</span>
          </button>

          {/* Search bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-xl bg-base-800 border border-base-700 pl-11 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
            />
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navButton('catalog', t.catalog, <LayoutGrid className="w-4 h-4" />)}
            {user && navButton('favorites', t.favorites, <Heart className="w-4 h-4" />)}
            {isAdmin && navButton('admin', t.admin, <Shield className="w-4 h-4" />)}

            {/* Language selector */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:text-slate-200 hover:bg-base-800"
              aria-label="Language"
            >
              <Languages className="w-4 h-4" />
              {lang}
            </button>

            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <div className="flex items-center gap-2 rounded-lg bg-base-800 px-3 py-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-500/20 text-accent-400">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm text-slate-300 max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={onSignOut}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-base-800 text-slate-400 transition-all hover:bg-rose-500/15 hover:text-rose-400"
                  aria-label={t.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="ml-1 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:from-accent-400 hover:to-accent-500 shadow-lg shadow-accent-500/20"
              >
                {t.login}
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-base-800 text-slate-300"
            aria-label={t.menu}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-slide-down">
            {navButton('catalog', t.catalog, <LayoutGrid className="w-4 h-4" />)}
            {user && navButton('favorites', t.favorites, <Heart className="w-4 h-4" />)}
            {isAdmin && navButton('admin', t.admin, <Shield className="w-4 h-4" />)}
            <button
              onClick={toggleLang}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-base-800"
            >
              <Languages className="w-4 h-4" />
              {lang === 'ES' ? 'EN' : 'ES'}
            </button>
            {user ? (
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-base-700">
                <span className="text-sm text-slate-400 truncate">{user.email}</span>
                <button
                  onClick={() => {
                    onSignOut();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-1.5 text-sm text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                  {t.logoutShort}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth();
                  setMenuOpen(false);
                }}
                className="w-full mt-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-2.5 text-sm font-semibold text-white"
              >
                {t.login}
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
