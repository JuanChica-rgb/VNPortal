import { Heart, Monitor, Smartphone, Globe, Download } from 'lucide-react';
import type { GameWithDetails } from '@/types';
import { useLang } from '@/context/LanguageContext';
import StarRating from './StarRating';

interface GameCardProps {
  game: GameWithDetails;
  onFavorite: (gameId: string) => void;
  onClick: (gameId: string) => void;
  isAuthenticated: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  PC: <Monitor className="w-3.5 h-3.5" />,
  Android: <Smartphone className="w-3.5 h-3.5" />,
  Both: (
    <span className="flex items-center gap-1">
      <Monitor className="w-3.5 h-3.5" />
      <Smartphone className="w-3.5 h-3.5" />
    </span>
  ),
};

const platformColors: Record<string, string> = {
  PC: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  Android: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  Both: 'bg-accent-500/15 text-accent-400 border-accent-500/20',
};

export default function GameCard({ game, onFavorite, onClick, isAuthenticated }: GameCardProps) {
  const { t } = useLang();

  return (
    <div
      onClick={() => onClick(game.id)}
      className="card-hover group relative cursor-pointer overflow-hidden rounded-2xl border border-base-700 bg-base-850 animate-fade-in"
    >
      {/* Cover Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={game.cover_url}
          alt={game.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-base-950 via-base-950/20 to-transparent" />

        {/* Platform badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm ${platformColors[game.platform]}`}>
            {platformIcons[game.platform]}
            {game.platform === 'Both' ? t.platformBoth : game.platform}
          </span>
        </div>

        {/* Favorite button */}
        {isAuthenticated && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(game.id);
            }}
            className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
              game.is_favorite
                ? 'bg-rose-500/90 text-white'
                : 'bg-base-950/60 text-slate-300 hover:bg-rose-500/80 hover:text-white'
            }`}
            aria-label={t.favorite}
          >
            <Heart className={`h-4.5 w-4.5 ${game.is_favorite ? 'fill-white' : ''}`} />
          </button>
        )}

        {/* Rating overlay */}
        <div className="absolute bottom-3 left-3 rounded-lg bg-base-950/70 px-2 py-1 backdrop-blur-sm">
          <StarRating rating={game.avg_rating ?? 0} count={game.rating_count} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display text-lg font-bold text-white line-clamp-1 group-hover:text-accent-400 transition-colors">
          {game.title}
        </h3>
        <p className="mt-1.5 text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {game.synopsis}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {game.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-base-800 px-2 py-0.5 text-xs font-medium text-slate-500"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Download links preview */}
        <div className="mt-3.5 flex items-center gap-2 border-t border-base-700 pt-3">
          <Download className="w-4 h-4 text-slate-500" />
          <div className="flex flex-wrap gap-1.5">
            {game.download_links.slice(0, 3).map((link, i) => (
              <span
                key={i}
                className="rounded-md bg-base-800 px-2 py-0.5 text-xs font-medium text-cyan-400"
              >
                {link.server}
              </span>
            ))}
          </div>
          <span className="ml-auto text-xs text-slate-600">
            <Globe className="w-3.5 h-3.5 inline" />
          </span>
        </div>
      </div>
    </div>
  );
}
