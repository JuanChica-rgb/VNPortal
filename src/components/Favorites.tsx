import { Heart, LogIn } from 'lucide-react';
import type { GameWithDetails } from '@/types';
import { useLang } from '@/context/LanguageContext';
import GameCard from './GameCard';

interface FavoritesProps {
  games: GameWithDetails[];
  onFavorite: (gameId: string) => void;
  onGameClick: (gameId: string) => void;
  onOpenAuth: () => void;
}

export default function Favorites({
  games, onFavorite, onGameClick, onOpenAuth,
}: FavoritesProps) {
  const { t } = useLang();

  if (games.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-base-800 mb-5">
            <Heart className="w-10 h-10 text-slate-600" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-200 mb-2">
            {t.noFavoritesTitle}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mb-6">
            {t.noFavoritesMsg}
          </p>
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:from-accent-400 hover:to-accent-500 shadow-lg shadow-accent-500/20"
          >
            <LogIn className="w-4 h-4" />
            {t.exploreCatalog}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          {t.myFavorites}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {games.length} {games.length === 1 ? t.savedSingular : t.savedPlural}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onFavorite={onFavorite}
            onClick={onGameClick}
            isAuthenticated={true}
          />
        ))}
      </div>
    </div>
  );
}
