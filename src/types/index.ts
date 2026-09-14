export type Platform = 'PC' | 'Android' | 'Both';

export interface DownloadLink {
  server: string;
  url: string;
}

export interface Game {
  id: string;
  title: string;
  synopsis: string;
  platform: Platform;
  cover_url: string;
  tags: string[];
  download_links: DownloadLink[];
  created_by: string | null;
  created_at: string;
}

export interface SiteSettings {
  id: number;
  title: string;
  logo_url: string;
  updated_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  game_id: string;
  created_at: string;
}

export interface Rating {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  game_id: string;
  content: string;
  created_at: string;
  author_email?: string;
}

export interface Subscriber {
  id: string;
  email: string;
  user_id: string | null;
  created_at: string;
}

export interface GameWithDetails extends Game {
  avg_rating: number | null;
  rating_count: number;
  is_favorite: boolean;
  user_rating: number | null;
}
