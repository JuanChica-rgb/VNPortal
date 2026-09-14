import { useState, useEffect, useCallback } from 'react';
import {
  Shield, Settings, Gamepad2, Mail, Plus, Trash2, Save, X, Link2,
  Monitor, Smartphone, Globe, Check, Loader2, Image as ImageIcon, Tag,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import type { Game, Platform, DownloadLink, Subscriber, SiteSettings } from '@/types';

type AdminTab = 'settings' | 'games' | 'emails';

interface AdminPanelProps {
  settings: SiteSettings | null;
  onSettingsUpdate: () => void;
  onGamesUpdate: () => void;
}

export default function AdminPanel({ settings, onSettingsUpdate, onGamesUpdate }: AdminPanelProps) {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [tab, setTab] = useState<AdminTab>('settings');

  // Settings state
  const [siteTitle, setSiteTitle] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Games state
  const [games, setGames] = useState<Game[]>([]);
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({
    title: '',
    synopsis: '',
    platform: 'PC' as Platform,
    cover_url: '',
    tagsInput: '',
  });
  const [downloadLinks, setDownloadLinks] = useState<DownloadLink[]>([{ server: '', url: '' }]);
  const [savingGame, setSavingGame] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);

  // Subscribers state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  useEffect(() => {
    if (settings) {
      setSiteTitle(settings.title);
      setLogoUrl(settings.logo_url);
    }
  }, [settings]);

  const fetchGames = useCallback(async () => {
    const { data } = await supabase.from('games').select('*').order('created_at', { ascending: false });
    setGames(data ?? []);
  }, []);

  const fetchSubscribers = useCallback(async () => {
    const { data } = await supabase.from('subscribers').select('*').order('created_at', { ascending: false });
    setSubscribers(data ?? []);
  }, []);

  useEffect(() => {
    fetchGames();
    fetchSubscribers();
  }, [fetchGames, fetchSubscribers]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from('site_settings')
      .update({ title: siteTitle, logo_url: logoUrl, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (!error) {
      setSettingsSaved(true);
      onSettingsUpdate();
      setTimeout(() => setSettingsSaved(false), 2000);
    }
    setSavingSettings(false);
  };

  const handleSaveGame = async () => {
    setGameError(null);

    if (!gameForm.title.trim() || !gameForm.synopsis.trim() || !gameForm.cover_url.trim()) {
      setGameError(t.fillRequired);
      return;
    }

    const validLinks = downloadLinks.filter((l) => l.server.trim() && l.url.trim());
    if (validLinks.length === 0) {
      setGameError(t.addDownloadLink);
      return;
    }

    setSavingGame(true);

    const tags = gameForm.tagsInput
      .split(',')
      .map((tg) => tg.trim())
      .filter(Boolean);

    const { error } = await supabase.from('games').insert({
      title: gameForm.title.trim(),
      synopsis: gameForm.synopsis.trim(),
      platform: gameForm.platform,
      cover_url: gameForm.cover_url.trim(),
      tags,
      download_links: validLinks,
      created_by: user?.id,
    });

    if (error) {
      setGameError(error.message);
      setSavingGame(false);
      return;
    }

    // Reset form
    setGameForm({ title: '', synopsis: '', platform: 'PC', cover_url: '', tagsInput: '' });
    setDownloadLinks([{ server: '', url: '' }]);
    setShowGameForm(false);
    setSavingGame(false);
    fetchGames();
    onGamesUpdate();
  };

  const handleDeleteGame = async (gameId: string) => {
    if (!confirm(t.deleteGameConfirm)) return;
    const { error } = await supabase.from('games').delete().eq('id', gameId);
    if (!error) {
      fetchGames();
      onGamesUpdate();
    }
  };

  const addDownloadLink = () => {
    setDownloadLinks([...downloadLinks, { server: '', url: '' }]);
  };

  const updateDownloadLink = (index: number, field: 'server' | 'url', value: string) => {
    setDownloadLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  const removeDownloadLink = (index: number) => {
    setDownloadLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'settings', label: t.settings, icon: <Settings className="w-4 h-4" /> },
    { id: 'games', label: t.games, icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'emails', label: t.subscribers, icon: <Mail className="w-4 h-4" /> },
  ];

  const platformOptions: { value: Platform; label: string; icon: React.ReactNode }[] = [
    { value: 'PC', label: t.platformPC, icon: <Monitor className="w-4 h-4" /> },
    { value: 'Android', label: t.platformAndroid, icon: <Smartphone className="w-4 h-4" /> },
    { value: 'Both', label: t.platformBothLabel, icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      {/* Admin header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{t.adminPanel}</h1>
          <p className="text-sm text-slate-500">{t.adminSubtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-base-700 bg-base-850 p-1">
        {tabs.map((tabItem) => (
          <button
            key={tabItem.id}
            onClick={() => setTab(tabItem.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              tab === tabItem.id
                ? 'bg-accent-500 text-white shadow-md shadow-accent-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-base-800'
            }`}
          >
            {tabItem.icon}
            <span className="hidden sm:inline">{tabItem.label}</span>
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === 'settings' && (
        <div className="rounded-2xl border border-base-700 bg-base-850 p-6 animate-fade-in">
          <h2 className="font-display text-lg font-bold text-white mb-4">{t.siteSettings}</h2>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Settings className="w-4 h-4 text-slate-500" />
                {t.siteTitle}
              </label>
              <input
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                placeholder="VN Portal"
                className="w-full rounded-xl bg-base-800 border border-base-700 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                {t.logoUrl}
              </label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full rounded-xl bg-base-800 border border-base-700 px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
              />
              {logoUrl && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={logoUrl} alt="Preview" className="h-12 w-12 rounded-lg object-cover border border-base-700" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <span className="text-xs text-slate-500">{t.logoPreview}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-accent-400 hover:to-accent-500 disabled:opacity-50 shadow-lg shadow-accent-500/20"
            >
              {savingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : settingsSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  {t.saved}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t.saveChanges}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Games tab */}
      {tab === 'games' && (
        <div className="space-y-4 animate-fade-in">
          {/* Publish button / form */}
          {!showGameForm ? (
            <button
              onClick={() => setShowGameForm(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-base-600 bg-base-850 py-4 text-sm font-semibold text-slate-400 transition-all hover:border-accent-500 hover:text-accent-400"
            >
              <Plus className="w-5 h-5" />
              {t.publishNewGame}
            </button>
          ) : (
            <div className="rounded-2xl border border-base-700 bg-base-850 p-6 animate-slide-down">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">{t.newGame}</h2>
                <button
                  onClick={() => setShowGameForm(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-base-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.title}</label>
                  <input
                    type="text"
                    value={gameForm.title}
                    onChange={(e) => setGameForm({ ...gameForm, title: e.target.value })}
                    placeholder={t.titlePlaceholder}
                    className="w-full rounded-xl bg-base-800 border border-base-700 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.synopsisLabel}</label>
                  <textarea
                    value={gameForm.synopsis}
                    onChange={(e) => setGameForm({ ...gameForm, synopsis: e.target.value })}
                    placeholder={t.synopsisPlaceholder}
                    rows={3}
                    className="w-full rounded-xl bg-base-800 border border-base-700 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.platform}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {platformOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setGameForm({ ...gameForm, platform: opt.value })}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          gameForm.platform === opt.value
                            ? 'border-accent-500 bg-accent-500/15 text-accent-400'
                            : 'border-base-700 bg-base-800 text-slate-400 hover:border-base-600'
                        }`}
                      >
                        {opt.icon}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">{t.coverUrl}</label>
                  <input
                    type="text"
                    value={gameForm.cover_url}
                    onChange={(e) => setGameForm({ ...gameForm, cover_url: e.target.value })}
                    placeholder={t.coverPlaceholder}
                    className="w-full rounded-xl bg-base-800 border border-base-700 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {t.tagsLabel}
                  </label>
                  <input
                    type="text"
                    value={gameForm.tagsInput}
                    onChange={(e) => setGameForm({ ...gameForm, tagsInput: e.target.value })}
                    placeholder={t.tagsPlaceholder}
                    className="w-full rounded-xl bg-base-800 border border-base-700 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                  />
                </div>

                {/* Download links */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-400 mb-2">
                    <Link2 className="w-3.5 h-3.5" />
                    {t.downloadLinksLabel}
                  </label>
                  <div className="space-y-2">
                    {downloadLinks.map((link, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          value={link.server}
                          onChange={(e) => updateDownloadLink(i, 'server', e.target.value)}
                          placeholder={t.serverPlaceholder}
                          className="w-32 rounded-xl bg-base-800 border border-base-700 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                        />
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateDownloadLink(i, 'url', e.target.value)}
                          placeholder={t.urlPlaceholder}
                          className="flex-1 rounded-xl bg-base-800 border border-base-700 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                        />
                        {downloadLinks.length > 1 && (
                          <button
                            onClick={() => removeDownloadLink(i)}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-base-800 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addDownloadLink}
                    className="mt-2 flex items-center gap-1.5 text-sm text-accent-400 hover:text-accent-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t.addLink}
                  </button>
                </div>

                {gameError && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
                    {gameError}
                  </div>
                )}

                <button
                  onClick={handleSaveGame}
                  disabled={savingGame}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 py-3 text-sm font-semibold text-white transition-all hover:from-accent-400 hover:to-accent-500 disabled:opacity-50 shadow-lg shadow-accent-500/20"
                >
                  {savingGame ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      {t.publishGame}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Existing games list */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-1">
              {t.publishedGames} ({games.length})
            </h3>
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center gap-4 rounded-xl border border-base-700 bg-base-850 p-3 transition-all hover:border-base-600"
              >
                <img
                  src={game.cover_url}
                  alt={game.title}
                  className="h-14 w-20 flex-shrink-0 rounded-lg object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg'; }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-200 truncate">{game.title}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500">{game.platform}</span>
                    <span className="text-xs text-slate-600">·</span>
                    <span className="text-xs text-slate-500">{game.tags.join(', ')}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteGame(game.id)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-base-800 text-slate-500 transition-all hover:bg-rose-500/15 hover:text-rose-400"
                  aria-label={t.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {games.length === 0 && (
              <p className="text-center text-sm text-slate-600 py-8">{t.noGamesPublished}</p>
            )}
          </div>
        </div>
      )}

      {/* Emails tab */}
      {tab === 'emails' && (
        <div className="rounded-2xl border border-base-700 bg-base-850 p-6 animate-fade-in">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">{t.subscriberList}</h2>
            <span className="rounded-full bg-accent-500/15 px-3 py-1 text-xs font-semibold text-accent-400">
              {subscribers.length} {t.registered}
            </span>
          </div>

          {subscribers.length === 0 ? (
            <p className="text-center text-sm text-slate-600 py-8">{t.noSubscribers}</p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-3 rounded-xl border border-base-700 bg-base-800 p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500/15 text-accent-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="flex-1 text-sm text-slate-300 truncate">{sub.email}</span>
                  <span className="text-xs text-slate-600">
                    {new Date(sub.created_at).toLocaleDateString(locale, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
