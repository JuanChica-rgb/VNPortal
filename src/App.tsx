import { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { LanguageProvider, useLang } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import type { Game, GameWithDetails, SiteSettings } from '@/types';
import Header from '@/components/Header';
import Catalog from '@/components/Catalog';
import Favorites from '@/components/Favorites';
import AdminPanel from '@/components/AdminPanel';
import AuthModal from '@/components/AuthModal';
import GameDetail from '@/components/GameDetail';
import { Gamepad2 } from 'lucide-react';

type View = 'catalog' | 'favorites' | 'admin';

function AppContent() {
  const { user, isAdmin: isAdminFromAuth, loading, signOut } = useAuth();
  const isAdmin = isAdminFromAuth || user?.email === 'juanmiguel71293@gmail.com';
  const { t } = useLang();
  const [view, setView] = useState<View>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [games, setGames] = useState<Game[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [ratingMap, setRatingMap] = useState<Map<string, { avg: number; count: number }>>(new Map());
  const [userRatings, setUserRatings] = useState<Map<string, number>>(new Map());

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();
    if (data) setSettings(data as SiteSettings);
  }, []);

  const fetchGames = useCallback(async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      return;
    }

    setGames(data ?? []);

    // Fetch ratings for all games
    if (data && data.length > 0) {
      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('game_id, score');

      if (ratingsData) {
        const acc = new Map<string, { sum: number; count: number }>();
        ratingsData.forEach((r: { game_id: string; score: number }) => {
          const existing = acc.get(r.game_id) ?? { sum: 0, count: 0 };
          existing.sum += r.score;
          existing.count += 1;
          acc.set(r.game_id, existing);
        });

        const finalMap = new Map<string, { avg: number; count: number }>();
        acc.forEach((val, key) => {
          finalMap.set(key, { avg: val.sum / val.count, count: val.count });
        });
        setRatingMap(finalMap);
      }
    }
  }, []);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    const { data } = await supabase
      .from('favorites')
      .select('game_id')
      .eq('user_id', user.id);

    setFavoriteIds(new Set(data?.map((f: { game_id: string }) => f.game_id) ?? []));
  }, [user]);

  const fetchUserRatings = useCallback(async () => {
    if (!user) {
      setUserRatings(new Map());
      return;
    }
    const { data } = await supabase
      .from('ratings')
      .select('game_id, score')
      .eq('user_id', user.id);

    const map = new Map<string, number>();
    data?.forEach((r: { game_id: string; score: number }) => {
      map.set(r.game_id, r.score);
    });
    setUserRatings(map);
  }, [user]);

  useEffect(() => {
    fetchSettings();
    fetchGames();
  }, [fetchSettings, fetchGames]);

  useEffect(() => {
    fetchFavorites();
    fetchUserRatings();
  }, [fetchFavorites, fetchUserRatings]);

  // Build games with details
  const gamesWithDetails: GameWithDetails[] = games.map((game) => {
    const ratingInfo = ratingMap.get(game.id);
    return {
      ...game,
      avg_rating: ratingInfo?.avg ?? null,
      rating_count: ratingInfo?.count ?? 0,
      is_favorite: favoriteIds.has(game.id),
      user_rating: userRatings.get(game.id) ?? null,
    };
  });

  const favoriteGames = gamesWithDetails.filter((g) => g.is_favorite);

  const handleFavorite = async (gameId: string) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    if (favoriteIds.has(gameId)) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
      await supabase
        .from('favorites')
        .delete()
        .eq('game_id', gameId)
        .eq('user_id', user.id);
    } else {
      setFavoriteIds((prev) => new Set([...prev, gameId]));
      await supabase
        .from('favorites')
        .insert({ game_id: gameId, user_id: user.id });
    }
  };

  const handleNavigate = (newView: View) => {
    setView(newView);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    await signOut();
    setView('catalog');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 shadow-lg shadow-accent-500/20 animate-pulse-glow">
            <Gamepad2 className="w-7 h-7 text-white" />
          </div>
          <p className="text-sm text-slate-500">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-950">
      <Header
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAuth={() => setShowAuth(true)}
        onSignOut={handleSignOut}
        view={view}
        onNavigate={handleNavigate}
      />

      <main>
        {view === 'catalog' && (
          <Catalog
            games={gamesWithDetails}
            searchQuery={searchQuery}
            onFavorite={handleFavorite}
            onGameClick={(id) => {
              const game = games.find((g) => g.id === id);
              if (game) setSelectedGame(game);
            }}
            isAuthenticated={!!user}
          />
        )}

        {view === 'favorites' && (
          <Favorites
            games={favoriteGames}
            onFavorite={handleFavorite}
            onGameClick={(id) => {
              const game = games.find((g) => g.id === id);
              if (game) setSelectedGame(game);
            }}
            onOpenAuth={() => setShowAuth(true)}
          />
        )}

        {view === 'admin' && isAdmin && (
          <AdminPanel
            settings={settings}
            onSettingsUpdate={fetchSettings}
            onGamesUpdate={fetchGames}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-base-800 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 text-center">
          <p className="text-sm text-slate-600">
            {settings?.title || 'VN Portal'} — {t.footerSuffix}
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {selectedGame && (
        <GameDetail
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          onFavorite={handleFavorite}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
