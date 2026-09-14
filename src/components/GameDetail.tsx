import { useState, useEffect, useCallback } from 'react';
import {
  X, Heart, Monitor, Smartphone, Download, ExternalLink, MessageSquare,
  Send, Trash2, User, Calendar,
} from 'lucide-react';
import type { Game, Comment } from '@/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useLang } from '@/context/LanguageContext';
import StarRating from './StarRating';

interface GameDetailProps {
  game: Game;
  onClose: () => void;
  onFavorite: (gameId: string) => void;
}

interface GameStats {
  avgRating: number;
  ratingCount: number;
  isFavorite: boolean;
  userRating: number | null;
}

export default function GameDetail({ game, onClose, onFavorite }: GameDetailProps) {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [stats, setStats] = useState<GameStats>({
    avgRating: 0,
    ratingCount: 0,
    isFavorite: false,
    userRating: null,
  });
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const platformIcon: Record<string, React.ReactNode> = {
    PC: <Monitor className="w-4 h-4" />,
    Android: <Smartphone className="w-4 h-4" />,
    Both: (
      <span className="flex items-center gap-1">
        <Monitor className="w-4 h-4" />
        <Smartphone className="w-4 h-4" />
      </span>
    ),
  };

  const platformColors: Record<string, string> = {
    PC: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    Android: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    Both: 'bg-accent-500/15 text-accent-400 border-accent-500/30',
  };

  const fetchData = useCallback(async () => {
    setLoading(true);

    const [ratingsRes, commentsRes, favRes, userRatingRes] = await Promise.all([
      supabase
        .from('ratings')
        .select('score')
        .eq('game_id', game.id),
      supabase
        .from('comments')
        .select('id, user_id, game_id, content, created_at')
        .eq('game_id', game.id)
        .order('created_at', { ascending: false }),
      user
        ? supabase
            .from('favorites')
            .select('id')
            .eq('game_id', game.id)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      user
        ? supabase
            .from('ratings')
            .select('score')
            .eq('game_id', game.id)
            .eq('user_id', user.id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    const scores = ratingsRes.data?.map((r: { score: number }) => r.score) ?? [];
    const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

    // Fetch author emails for comments
    const commentData = commentsRes.data ?? [];
    let commentsWithEmail: Comment[] = commentData as Comment[];
    if (commentData.length > 0) {
      const userIds = [...new Set(commentData.map((c: { user_id: string }) => c.user_id))];
      let usersData: { id: string; email: string }[] | null = null;
      try {
        const rpcResult = await supabase.rpc('get_user_emails', { user_ids: userIds });
        usersData = rpcResult.data as { id: string; email: string }[] | null;
      } catch {
        usersData = null;
      }

      if (usersData && Array.isArray(usersData)) {
        const emailMap = new Map<string, string>();
        (usersData as { id: string; email: string }[]).forEach((u) => {
          emailMap.set(u.id, u.email);
        });
        commentsWithEmail = commentData.map((c: { user_id: string }) => ({
          ...c,
          author_email: emailMap.get(c.user_id) ?? t.anonymous,
        })) as Comment[];
      }
    }

    setStats({
      avgRating: avg,
      ratingCount: scores.length,
      isFavorite: !!favRes.data,
      userRating: userRatingRes.data?.score ?? null,
    });
    setComments(commentsWithEmail);
    setLoading(false);
  }, [game.id, user?.id, user, t.anonymous]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleRate = async (score: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('ratings')
      .upsert(
        { game_id: game.id, user_id: user?.id, score },
        { onConflict: 'user_id,game_id' }
      );

    if (!error) {
      fetchData();
    }
  };

  const handleFavorite = () => {
    onFavorite(game.id);
    setStats((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    setSubmitting(true);

    const { data, error } = await supabase
      .from('comments')
      .insert({
        game_id: game.id,
        user_id: user?.id,
        content: newComment.trim(),
      })
      .select('id, user_id, game_id, content, created_at')
      .single();

    if (!error && data) {
      setComments((prev) => [
        { ...data, author_email: user?.email ?? t.anonymous },
        ...prev,
      ]);
      setNewComment('');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user?.id);

    if (!error) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
  };

  const serverColors: Record<string, string> = {
    Mega: 'from-red-600 to-red-500 hover:from-red-500 hover:to-red-400',
    'Google Drive': 'from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400',
    MediaFire: 'from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-base-950/80 backdrop-blur-sm p-4 sm:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl my-4 overflow-hidden rounded-2xl border border-base-700 bg-base-900 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero cover */}
        <div className="relative aspect-[2/1] overflow-hidden">
          <img
            src={game.cover_url}
            alt={game.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-base-900 via-base-900/40 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-base-950/60 text-slate-300 backdrop-blur-sm transition-all hover:bg-base-950/80 hover:text-white"
            aria-label={t.close}
          >
            <X className="w-5 h-5" />
          </button>

          {user && (
            <button
              onClick={handleFavorite}
              className={`absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
                stats.isFavorite
                  ? 'bg-rose-500/90 text-white'
                  : 'bg-base-950/60 text-slate-300 hover:bg-rose-500/80 hover:text-white'
              }`}
              aria-label={t.favorite}
            >
              <Heart className={`w-5 h-5 ${stats.isFavorite ? 'fill-white' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title + badges */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${platformColors[game.platform]}`}>
                {platformIcon[game.platform]}
                {game.platform === 'Both' ? t.platformBoth : game.platform}
              </span>
              <div className="flex items-center gap-2">
                <StarRating rating={stats.avgRating} count={stats.ratingCount} size="md" />
              </div>
            </div>
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {game.title}
            </h2>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {game.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-base-800 px-3 py-1 text-xs font-medium text-accent-400"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Synopsis */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">{t.synopsis}</h3>
            <p className="text-slate-400 leading-relaxed">{game.synopsis}</p>
          </div>

          {/* Download links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              <Download className="w-4 h-4 inline mr-1.5" />
              {t.downloadLinks}
            </h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {game.download_links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex items-center justify-between rounded-xl bg-gradient-to-r px-4 py-3 text-white font-semibold transition-all shadow-lg ${
                    serverColors[link.server] ?? 'from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    {link.server}
                  </span>
                  <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Rating section */}
          {user && (
            <div className="rounded-xl border border-base-700 bg-base-850 p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">{t.yourRating}</h3>
              <StarRating
                rating={stats.userRating ?? 0}
                interactive
                onRate={handleRate}
                userRating={stats.userRating}
                size="lg"
              />
              <p className="mt-2 text-xs text-slate-500">
                {stats.userRating ? `${t.ratedWith} ${stats.userRating} ★` : t.clickToRate}
              </p>
            </div>
          )}

          {/* Comments section */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              {t.comments} ({comments.length})
            </h3>

            {/* Comment form */}
            {user ? (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !submitting) handleSubmitComment();
                  }}
                  placeholder={t.writeComment}
                  className="flex-1 rounded-xl bg-base-800 border border-base-700 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-accent-500 transition-colors"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white transition-all hover:bg-accent-400 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={t.send}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="mb-4 rounded-xl border border-base-700 bg-base-850 px-4 py-3 text-center text-sm text-slate-500">
                {t.loginToComment}
              </div>
            )}

            {/* Comments list */}
            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-xl skeleton" />
                  ))}
                </div>
              ) : comments.length === 0 ? (
                <p className="text-center text-sm text-slate-600 py-6">
                  {t.noComments}
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-xl border border-base-700 bg-base-850 p-4 animate-fade-in"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-500/20 text-accent-400">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                          {comment.author_email ?? t.anonymous}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar className="w-3 h-3" />
                          {new Date(comment.created_at).toLocaleDateString(locale, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      {comment.user_id === user?.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-slate-600 hover:text-rose-400 transition-colors"
                          aria-label={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
