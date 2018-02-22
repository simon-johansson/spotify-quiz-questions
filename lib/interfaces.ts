
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
  playlist: Playlist;
  questionType: QuestionType;
  amount: number;
}

export type QuestionType = 'track title' | 'artist name' | 'mix';
