
export interface SpotifyClientConstructorOptions {
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
  shouldUpdateRefreshToken?: boolean;
}

export interface Playlist {
  name: string;
  id: string;
  owner: string;
}

export interface QuestionOptions {
  playlist?: Playlist;
  questionType?: QuestionType;
  amount?: number;
}

export interface Artist {
  name: string;
  id: string;
  related: string[];
  topTracks: string[];
}

export interface MetaInfo {
  httpLink: string;
  uriLink: string;
}

export type QuestionType = 'track title' | 'artist name' | 'mix';
