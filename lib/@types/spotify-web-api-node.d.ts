/// <reference path="../../node_modules/@types/spotify-api/index.d.ts" />
/// <reference path="../SpotifyInterfaces.ts" />

declare module 'spotify-web-api-node' {

  interface ConstructorOptions {
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
  }

  interface PlaylistTracksOptions {
    limit: number;
    offset: number;
  }

  class SpotifyWebApi {
    constructor(options: ConstructorOptions)

    clientCredentialsGrant(): Promise<SpotifyApi.ClientCredentials>;
    setAccessToken(token: string): void;
    getPlaylist(owner: string, playlistId: string):
      Promise<SpotifyApi.ExtendedSinglePlaylistResponse>;
    getPlaylistTracks(owner: string, playlistId: string, options: PlaylistTracksOptions):
      Promise<SpotifyApi.ExtendedPlaylistTrackResponse>;
    getArtistRelatedArtists(artistId: string):
      Promise<SpotifyApi.ExtendedArtistsRelatedArtistsResponse>;
    getArtistTopTracks(artistId: string, country: string):
      Promise<SpotifyApi.ExtendedArtistsTopTracksResponse>;
    getUserPlaylists(username: string):
      Promise<SpotifyApi.ListOfUsersPlaylistsResponse>;
    getAccessToken(): string;
  }

  export = SpotifyWebApi;
}

