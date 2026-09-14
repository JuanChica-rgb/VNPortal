import { useState, useMemo } from 'react';
import { SearchX, Flame } from 'lucide-react';
import type { GameWithDetails } from '@/types';
import { useLang } from '@/context/LanguageContext';
import GameCard from './GameCard';
import TagFilter from './TagFilter';

interface CatalogProps {
  games: GameWithDetails[];
  searchQuery: string;
  onFavorite: (gameId: string) => void;
  onGameClick: (gameId: string) => void;
  isAuthenticated: boolean;
}

export default function Catalog({
  games, searchQuery, onFavorite, onGameClick, isAuthenticated,
}: CatalogProps) {
  const { t } = useLang();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    games.forEach((g) => g.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [games]);

  const filtered = useMemo(() => {
    let result = games;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.synopsis.toLowerCase().includes(q) ||
          g.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    if (selectedTags.length > 0) {
      result = result.filter((g) =>
        selectedTags.every((tag) => g.tags.includes(tag))
      );
    }

    return result;
  }, [games, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((tg) => tg !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      {/* Hero section */}
      {selectedTags.length === 0 && !searchQuery && (
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-base-700 bg-base-850 noise animate-fade-in">
          <div className="hero-glow absolute inset-0" />
          <div className="relative px-6 py-12 sm:px-12 sm:py-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-4 py-1.5 text-xs font-medium text-accent-400 mb-4">
              <Flame className="w-3.5 h-3.5" />
              {t.heroBadge}
            </div>
            <h1 className="font-display text-3xl sm:text-5xl font-extrabold text-white mb-3">
              {t.heroTitlePre}<span className="gradient-text">{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto">
              {t.heroSubtitle}
            </p>
          </div>
        </div>
      )}

      {/* Tags filter */}
      <div className="mb-6">
        <TagFilter
          tags={allTags}
          selectedTags={selectedTags}
          onToggle={toggleTag}
          onClear={() => setSelectedTags([])}
        />
      </div>

      {/* Results count */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length} {filtered.length === 1 ? t.resultsSingular : t.resultsPlural}
          {selectedTags.length > 0 && `${t.withTags}${selectedTags.join(', ')}`}
          {searchQuery && `${t.forQuery}${searchQuery}"`}
        </p>
      </div>

      {/* Games grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-base-800 mb-4">
            <SearchX className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-300 mb-1">
            {t.noResultsTitle}
          </h3>
          <p className="text-sm text-slate-500">
            {t.noResultsMsg}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onFavorite={onFavorite}
              onClick={onGameClick}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
