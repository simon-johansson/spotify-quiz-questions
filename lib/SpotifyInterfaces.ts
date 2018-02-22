/// <reference types="spotify-api" />

declare namespace SpotifyApi {

  interface Response<T> { body: T; }

  interface ClientCredentials {
    body: {
      expires_in: string;
      access_token: string;
    };
  }

  interface ExtendedPlaylistTrackResponse
    extends Response<SpotifyApi.PlaylistTrackResponse> { }

  interface ExtendedSinglePlaylistResponse
    extends Response<SpotifyApi.SinglePlaylistResponse> { }

  interface ExtendedArtistsRelatedArtistsResponse
    extends Response<SpotifyApi.ArtistsRelatedArtistsResponse> { }

  interface ExtendedArtistsTopTracksResponse
    extends Response<SpotifyApi.ArtistsTopTracksResponse> { }
}
