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
import Question from './Question';
import QuestionFetcher from './QuestionFetcher';

export default class SpotifyQuizQuestions {
  private spotifyClient: SpotifyClient;
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

    const fetcher = new QuestionFetcher(playlist, questionType, amount, this.spotifyClient);
    return fetcher.getQuestions();
  }

  private cleanQuestionAmount = (amount: number) => {
    if (amount > this.maxNumberOfQuestions) return this.maxNumberOfQuestions;
    if (amount < 0) return 0;
    return amount;
  }
}
