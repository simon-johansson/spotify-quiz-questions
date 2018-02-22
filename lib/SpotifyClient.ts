/// <reference types="spotify-api" />

import * as debug from 'debug';
import spotifyWebApiNode = require('spotify-web-api-node');
import { SpotifyClientConstructorOptions } from './interfaces';
debug('access-token');

export default class SpotifyClient extends spotifyWebApiNode {
  private noOptionsError: string = ['Supply options object containing client id & secret',
    'for Spotify API'].join(' ');
  private noClientIdError: string = 'Supply client id for Spotify API';
  private noClientSecretError: string = 'Supply client secret for Spotify API';
  private shouldUpdateRefreshToken: boolean;

  constructor(options: SpotifyClientConstructorOptions) {
    super(options);

    if (typeof options === 'undefined') { throw new Error(this.noOptionsError); }
    if (typeof options.clientId !== 'string') { throw new Error(this.noClientIdError); }
    if (typeof options.clientSecret !== 'string') { throw new Error(this.noClientSecretError); }

    this.shouldUpdateRefreshToken = options.shouldUpdateRefreshToken || false;
  }

  public refreshAccessToken(): Promise<void> {
    return this.clientCredentialsGrant()
      .then((data) => {

        // Should be debug only log
        debug('Access token has been set');
        debug(`The access token expires in ${data.body.expires_in} seconds`);
        debug(`The access token is ${data.body.access_token}`);

        this.setAccessToken(data.body.access_token);
        this.setAccessTokenTimeout(parseInt(data.body.expires_in, undefined));
      });
  }

  private setAccessTokenTimeout(expirationInSec: number): void {
    if (this.shouldUpdateRefreshToken) {
      const expirationInMs = expirationInSec * 1000;
      const margin = 30000;
      const expirationInMsWithMargin = expirationInMs - margin;
      const timeout = expirationInMsWithMargin < 0 ? 1000 : expirationInMsWithMargin;

      setTimeout(() => this.refreshAccessToken(), timeout);
    }
  }
}
