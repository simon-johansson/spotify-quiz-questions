/// <reference types="spotify-api" />
import * as _ from 'lodash';
import { Playlist } from './interfaces';

interface Artist {
  name: string;
  id: string;
  related: string[];
  topTracks: string[];
}

interface MetaInfo {
  httpLink: string;
  uriLink: string;
}

export default class Track {
  private audio: string;
  private title: string;
  private image: SpotifyApi.ImageObject;
  private artist: Artist;
  private meta: MetaInfo;
  private fromPlaylist: Playlist;

  constructor(track: SpotifyApi.TrackObjectFull, playlist: Playlist) {
    this.audio = track.preview_url;
    this.title = track.name;
    this.image = track.album.images[1];
    this.artist = {
      name: track.artists[0].name,
      id: track.artists[0].id,
      related: [],
      topTracks: [],
    };
    this.meta = {
      httpLink: track.external_urls.spotify,
      uriLink: track.uri,
    };
    this.fromPlaylist = playlist;
  }

  public getArtist(): string {
    return this.artist.name;
  }

  public getArtistId(): string {
    return this.artist.id;
  }

  public getTitle(): string {
    return this.title;
  }

  public getAudioPreview(): string {
    return this.audio;
  }

  public getImage(): SpotifyApi.ImageObject {
    return this.image;
  }

  public getMetaData(): MetaInfo {
    return this.meta;
  }

  public getRelatedArtists(): string[] {
    return this.artist.related;
  }

  public setRelatedArtists(artists: string[]): void {
    this.artist.related = _.uniq(artists);
  }

  public getTopTracks(): string[] {
    return this.artist.topTracks;
  }

  public setTopTracks(tracks: string[]): void {
    this.artist.topTracks = _.uniq(tracks);
  }

  public getPlaylist(): Playlist {
    return this.fromPlaylist;
  }

  public hasAudio(): boolean {
    return this.audio !== null;
  }
}
