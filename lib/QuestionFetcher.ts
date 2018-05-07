import * as _ from 'lodash';
import SpotifyClient from './SpotifyClient';
import {
  QuestionType,
  Playlist,
} from './interfaces';
import Track from './Track';
import Question from './Question';

export default class QuestionFetcher {
  private defaultPlaylistOptions = {
    country: 'SE',
    limit: 100,
    offset: 0,
  };
  private playlistOffset: number = 0;
  private tracks: Track[];

  constructor(
    private playlist: Playlist,
    private questionType: QuestionType,
    private amount: number,
    private spotifyClient: SpotifyClient,
  ) { }

  public getQuestions = async (): Promise<Question[]> => {
    await this.getTracks();
    await this.getAdditionalTrackData();
    return this.generateQuestions();
  }

  private getTracks = async () => {
    await this.getPlaylistInfo();
    await this.getTracksFromPlaylist();
  }

  private getPlaylistInfo = async () => {
    const playlist = await this.spotifyClient.getPlaylist(this.playlist.owner, this.playlist.id);
    this.playlistOffset = this.randomizePlaylistOffset(playlist);
  }

  private randomizePlaylistOffset = (data: SpotifyApi.ExtendedSinglePlaylistResponse): number => {
    const { total } = data.body.tracks;
    let offset = 0;
    if (total > 100) offset = _.random(0, (total - 100));
    return offset;
  }

  private getTracksFromPlaylist = async () => {
    const playlistOptions = { ...this.defaultPlaylistOptions, offset: this.playlistOffset };
    const playlistResponse = await this.spotifyClient.getPlaylistTracks(
      this.playlist.owner, this.playlist.id, playlistOptions,
    );
    this.tracks = _(playlistResponse.body.items)
      .map(item => new Track(item.track, this.playlist))
      .filter(track => track.hasAudio())
      .sampleSize(this.amount)
      .shuffle()
      .value();
  }

  private generateQuestions = (): Question[] => this.tracks.map(t => new Question(t));

  private getAdditionalTrackData = async () => {
    switch (this.questionType) {
      case 'track title':
        this.tracks = await Promise.all(this.tracks.map(track => this.getArtistTopTracks(track)));
        break;
      case 'artist name':
        this.tracks = await Promise.all(this.tracks.map(track => this.getRelatedArtists(track)));
        break;
      case 'mix':
        this.tracks = await Promise.all(this.tracks.map((track, index) => {
          if (index % 2) return this.getArtistTopTracks(track);
          return this.getRelatedArtists(track);
        }));
        break;
    }
  }

  private getRelatedArtists = async (track: Track): Promise<Track> => {
    const responseData = await this.spotifyClient.getArtistRelatedArtists(track.getArtistId());
    const relatedArtists: string[] = _.map(responseData.body.artists, 'name');
    track.setRelatedArtists(relatedArtists);
    return track;
  }

  private getArtistTopTracks = async (track: Track): Promise<Track> => {
    const { country } = this.defaultPlaylistOptions;
    const responseData = await this.spotifyClient.getArtistTopTracks(track.getArtistId(), country);
    const topTracks: string[] = _.map(responseData.body.tracks, 'name');
    track.setTopTracks(topTracks);
    return track;
  }
}
