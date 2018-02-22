/// <reference types="spotify-api" />
/// <reference path="./SpotifyInterfaces.ts" />

import * as _ from 'lodash';
import SpotifyClient from './SpotifyClient';
import {
  SpotifyClientConstructorOptions,
  QuestionOptions,
  QuestionType,
  Playlist,
} from './interfaces';
import Track from './Track';
import Question from './Question';

export default class SpotifyQuizQuestions {
  private spotifyClient: SpotifyClient;
  private defaultPlaylistOptions = {
    country: 'SE',
    limit: 100,
    offset: 0,
  };
  private defaultPlaylist: Playlist = {
    name: 'Top 100 tracks currently on Spotify',
    id: '4hOKQuZbraPDIfaGbM3lKI',
    owner: 'spotify',
  };
  private defaultQuestionType: QuestionType = 'mix';
  private defaultQuestionAmount = 10;
  private maxNumberOfQuestions = 12;

  constructor(options: SpotifyClientConstructorOptions, mockClient?: any) {
    this.spotifyClient = mockClient ? new mockClient(options) : new SpotifyClient(options);
  }

  public getQuestions = async (options?: QuestionOptions): Promise<Question[]> => {
    const playlist = options && options.playlist ?
      options.playlist :
      this.defaultPlaylist;

    const questionType = options && options.questionType ?
      options.questionType :
      this.defaultQuestionType;

    const amount = options && options.amount ?
      this.cleanQuestionAmount(options.amount) :
      this.defaultQuestionAmount;

    if (!this.spotifyClient.getAccessToken()) {
      await this.spotifyClient.refreshAccessToken();
    }

    const tracks = await this.getTracks(playlist, amount);
    const tracksWithAdditionalData = await this.getAdditionalData(questionType, tracks);
    const questions = this.generateQuestions(tracksWithAdditionalData);
    const shuffledQuestions = _.shuffle(questions);
    return shuffledQuestions;
  }

  private getTracks = async (playlist: Playlist, numberOfTracks: number): Promise<Track[]> => {
    const playlistInfo = await this.spotifyClient.getPlaylist(playlist.owner, playlist.id);
    const playlistOffset = this.randomizePlaylistOffset(playlistInfo);
    const playableTracks = await this.getPlayableTracks(playlist, playlistOffset);
    const randomTracks = _.sampleSize(playableTracks, numberOfTracks);
    return randomTracks;
  }

  private randomizePlaylistOffset = (data: SpotifyApi.ExtendedSinglePlaylistResponse): number => {
    const { total } = data.body.tracks;
    let offset = 0;
    if (total > 100) offset = _.random(0, (total - 100));
    return offset;
  }

  private cleanQuestionAmount = (amount: number) => {
    if (amount > this.maxNumberOfQuestions) return this.maxNumberOfQuestions;
    if (amount < 0) return 0;
    return amount;
  }

  private getPlayableTracks = (playlist: Playlist, offset: number): Promise<Track[]> => {
    const options = { ...this.defaultPlaylistOptions, offset };
    return this.spotifyClient.getPlaylistTracks(playlist.owner, playlist.id, options)
      .then(data => data.body.items.map(item => new Track(item.track, playlist)))
      .then(this.filterTracks);
  }

  private filterTracks = (tracks: Track[]) => _.filter(tracks, t => t.hasAudio());

  private generateQuestions = (tracks: Track[]): Question[] => tracks.map(t => new Question(t));

  private getAdditionalData = async (
    questionType: QuestionType,
    tracks: Track[],
  ): Promise<Track[]> => {
    switch (questionType) {
      case 'track title':
        return Promise.all(tracks.map(track => this.getArtistTopTracks(track)));
      case 'artist name':
        return Promise.all(tracks.map(track => this.getRelatedArtists(track)));
      case 'mix':
        return Promise.all(tracks.map((track, index) => {
          if (index % 2) return this.getArtistTopTracks(track);
          return this.getRelatedArtists(track);
        }));
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
