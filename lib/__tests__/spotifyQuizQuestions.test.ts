
import * as fs from 'fs';
import * as _ from 'lodash';
import * as path from 'path';
import SpotifyQuizQuestions from '../index';
import {
  playlistArtists,
  playlistTracks,
  relatedArtists,
  topTracks,
} from './mockdata/extractedData.json';

const playlists = [
  {
    id: '3qu74M0PqlkSV76f98aqTd',
    name: 'Top 100 Rock Tracks on Spotify',
    owner: 'spotify',
  }, {
    id: '3Jeow4SULPwNn5DBUMbP2g',
    name: 'test',
    owner: 'eriksson.mimmi',
  },
];

function readFile(fileName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, `mockdata/${fileName}.json`), 'utf8', (err, data) => {
      if (err) {
        reject(err);
      }
      resolve({ body: JSON.parse(data) });
    });
  });
}

function getSpotifyClientMock() {
  const client = require('../SpotifyClient').default;

  client.prototype.getAccessToken = jest.fn()
    .mockReturnValueOnce('')
    .mockReturnValue('token');
  client.prototype.clientCredentialsGrant = jest.fn()
    .mockReturnValueOnce(
      Promise.resolve({
        body: { expires_in: 10, access_token: 'xxx' },
      }),
    ).mockReturnValue(
      Promise.resolve({
        body: { expires_in: 10, access_token: 'yyy' },
      }),
    );
  client.prototype.setAccessToken = jest.fn(() => {});
  client.prototype.getPlaylist = jest.fn(() => readFile('SinglePlaylistResponse'));
  client.prototype.getPlaylistTracks = jest.fn(() => readFile('PlaylistTrackResponse'));
  client.prototype.getArtistRelatedArtists = () => readFile('ArtistsRelatedArtistsResponse');
  client.prototype.getArtistTopTracks = () => readFile('ArtistsTopTracksResponse');
  client.prototype.getUserPlaylists = () => readFile('ListOfUsersPlaylistsResponse');

  return client;
}

describe('SpotifyQuizQuestions', () => {
  let client;
  let spotifyQuestions;

  beforeEach(() => {
    jest.useFakeTimers();
    client = getSpotifyClientMock();
    spotifyQuestions = new SpotifyQuizQuestions({ clientId: 'xxx', clientSecret: 'xxx' }, client);
  });

  afterEach(() => {
    client.prototype.getPlaylist.mockClear();
    client.prototype.getPlaylistTracks.mockClear();
    client.prototype.setAccessToken.mockClear();
  });

  it('throw error if no options object is supplied', () => {
    expect(() => {
      new SpotifyQuizQuestions();
    }).toThrow(/Supply options object containing client id & secret for Spotify API/);
  });
  it('throw error if options object does not contain clientId', () => {
    expect(() => {
      new SpotifyQuizQuestions({ clientSecret: 'xxx' });
    }).toThrow(/Supply client id for Spotify API/);
  });
  it('throw error if options object does not contain clientSecret', () => {
    expect(() => {
      new SpotifyQuizQuestions({ clientId: 'xxx' });
    }).toThrow(/Supply client secret for Spotify API/);
  });
  it('instantiate if clientId and clientSecret is defined in options object', () => {
    expect(() => {
      new SpotifyQuizQuestions({ clientId: 'xxx', clientSecret: 'xxx' });
    }).not.toThrow();
  });
  it.skip('updates token if shouldUpdateRefreshToken is true in options object', async () => {
    const options = {
      clientId: 'xxx',
      clientSecret: 'xxx',
      shouldUpdateRefreshToken: true,
    };
    const sp = new SpotifyQuizQuestions(options, client);

    await sp.getQuestions();
    jest.advanceTimersByTime(2000);
    expect(client.prototype.setAccessToken.mock.calls).toEqual([['xxx'], ['yyy']]);
  });

  describe('#getQuestions()', () => {
    it('is available on instance object', () => {
      expect(spotifyQuestions).toHaveProperty('getQuestions');
    });
    it('can be called without options', () => {
      expect(async () => {
        await spotifyQuestions.getQuestions();
      }).not.toThrow();
    });

    describe('defaults', () => {
      it('returns 10 questions if no amount is specified', async () => {
        const questions = await spotifyQuestions.getQuestions();
        expect(questions).toHaveLength(10);
      });
      it('returns a mix of question types if no specific type is specified', async () => {
        const questions = await spotifyQuestions.getQuestions();
        const questionTypes = questions.map(q => q.questionType);
        expect(questionTypes).toContain('track title');
        expect(questionTypes).toContain('artist name');
      });
      it('returns questions based on default playlist if no playlist is specified', async () => {
        const questions = await spotifyQuestions.getQuestions();
        const playlist = questions[0].track.getPlaylist();
        expect(playlist).toMatchObject({
          name: 'Top 100 tracks currently on Spotify',
          id: '4hOKQuZbraPDIfaGbM3lKI',
          owner: 'spotify',
        });
      });
    });

    describe('amount', () => {
      it('only returns 3 questions if that "amount" is specified', async () => {
        const questions = await spotifyQuestions.getQuestions({ amount: 3 });
        expect(questions).toHaveLength(3);
      });
      it('returns max 12 questions even if higher number is specified', async () => {
        const questions = await spotifyQuestions.getQuestions({ amount: 15 });
        expect(questions).toHaveLength(12);
      });
      it('returns 0 questions if negative number is specified', async () => {
        const questions = await spotifyQuestions.getQuestions({ amount: -5 });
        expect(questions).toHaveLength(0);
      });
    });

    describe('questionType', () => {
      it('only returns "guess the artist" questions if "artist" type is specified', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'artist name' });
        const questionTypes = questions.map(q => q.questionType);
        expect(questionTypes).toContain('artist name');
        expect(questionTypes).not.toContain('track title');
      });
      it('only returns "guess the track title" questions if "song" type is specified', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'track title' });
        const questionTypes = questions.map(q => q.questionType);
        expect(questionTypes).toContain('track title');
        expect(questionTypes).not.toContain('artist name');
      });
      it('returns a mix of question types if "mix" type is specified', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'mix' });
        const questionTypes = questions.map(q => q.questionType);
        expect(questionTypes).toContain('track title');
        expect(questionTypes).toContain('artist name');
      });
    });

    describe('playlist', () => {
      it('returns questions based on specified playlist', async () => {
        const p = playlists[1];
        const { name, id, owner } = p;
        const questions = await spotifyQuestions.getQuestions({ playlist: p });

        expect(client.prototype.getPlaylist.mock.calls[0][0]).toBe(owner);
        expect(client.prototype.getPlaylist.mock.calls[0][1]).toBe(id);

        expect(client.prototype.getPlaylistTracks.mock.calls[0][0]).toBe(owner);
        expect(client.prototype.getPlaylistTracks.mock.calls[0][1]).toBe(id);

        const playlist = questions[0].track.getPlaylist();
        expect(playlist).toMatchObject(playlists[1]);
      });
    });
  });

  describe('Question', () => {
    let client;
    let spotifyQuestions;

    beforeEach(() => {
      client = getSpotifyClientMock();
      spotifyQuestions = new SpotifyQuizQuestions({ clientId: 'xxx', clientSecret: 'xxx' }, client);
    });

    describe('#getChoices()', () => {
      it('get 4 choices', async () => {
        const questions = await spotifyQuestions.getQuestions();
        expect(questions[0].getChoices()).toHaveLength(4);
      });
      it('get "guess the artist"-choices if question type is "artist"', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'artist name' });
        const choices = questions[0].getChoices();
        expect(_.intersection(choices, [...playlistArtists, ...relatedArtists])).toHaveLength(4);
      });
      it('get "guess the track title"-choices if question type is "song"', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'track title' });
        const choices = questions[0].getChoices();
        expect(_.intersection(choices, [...playlistTracks, ...topTracks])).toHaveLength(4);
      });
      it.skip('if not enough data present to create 4 choices', () => {});
    });
    describe('#getRightAnswer()', () => {
      it('correct answer is part of choices', async () => {
        const questions = await spotifyQuestions.getQuestions();
        const choices = questions[0].getChoices();
        expect(choices).toContain(questions[0].getRightAnswer());
      });
      it('returns correct answer if question type is "artist"', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'artist name' });
        const choices = questions[0].getChoices();
        const correctAnswer = _.intersection(choices, playlistArtists)[0];
        expect(correctAnswer).toBe(questions[0].getRightAnswer());
      });
      it('returns correct answer if question type is "song"', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'track title' });
        const choices = questions[0].getChoices();
        const correctAnswer = _.intersection(choices, playlistTracks)[0];
        expect(correctAnswer).toBe(questions[0].getRightAnswer());
      });
    });
    describe('#evaluateAnswer()', () => {
      it('returns true if correct "artist"-answer is supplied', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'artist name' });
        const choices = questions[0].getChoices();
        const correctAnswer = _.intersection(choices, playlistArtists)[0];
        expect(questions[0].evaluateAnswer(correctAnswer)).toBeTruthy();
      });
      it('returns true if correct "song"-answer is supplied', async () => {
        const questions = await spotifyQuestions.getQuestions({ questionType: 'track title' });
        const choices = questions[0].getChoices();
        const correctAnswer = _.intersection(choices, playlistTracks)[0];
        expect(questions[0].evaluateAnswer(correctAnswer)).toBeTruthy();
      });
      it('returns false if wrong answer is supplied', async () => {
        const questions = await spotifyQuestions.getQuestions();
        expect(questions[0].evaluateAnswer('wrong answer')).toBeFalsy();
      });
    });
    describe('#getTrack()', () => {
      it('returns track for question', async () => {
        const questions = await spotifyQuestions.getQuestions();
        const track = questions[0].getTrack();
        expect(track).toHaveProperty('getArtist');
        expect(track).toHaveProperty('getAudioPreview');
        expect(track).toHaveProperty('hasAudio');
      });
    });
  });

  describe('Track', async () => {
    let client;
    let spotifyQuestions;

    beforeEach(() => {
      client = getSpotifyClientMock();
      spotifyQuestions = new SpotifyQuizQuestions({ clientId: 'xxx', clientSecret: 'xxx' }, client);
    });

    it('#getArtist()', async () => {
      const questions = await spotifyQuestions.getQuestions({ questionType: 'artist name' });
      const track = questions[0].track;
      expect(playlistArtists).toContain(track.getArtist());
    });
    it('#getArtistId()', async () => {
      const questions = await spotifyQuestions.getQuestions();
      const track = questions[0].track;
      expect(typeof track.getArtistId()).toBe('string');
    });
    it('#getTitle()', async () => {
      const questions = await spotifyQuestions.getQuestions();
      const track = questions[0].track;
      expect(playlistTracks).toContain(track.getTitle());
    });
    it('#getAudioPreview()', async () => {
      const questions = await spotifyQuestions.getQuestions();
      const track = questions[0].track;
      expect(track.getAudioPreview()).toMatch(/https:\/\/p.scdn.co\/mp3-preview\//);
    });
    it('#getImage()', async () => {
      const questions = await spotifyQuestions.getQuestions();
      const track = questions[0].track;
      const image = track.getImage();
      expect(image).toHaveProperty('height');
      expect(image.height).toBeLessThanOrEqual(300);
      expect(image).toHaveProperty('width');
      expect(image.width).toBeLessThanOrEqual(300);
      expect(image).toHaveProperty('url');
      expect(image.url).toMatch(/https:\/\/i.scdn.co\/image\//);
    });
    it('#getMetaData()', async () => {
      const questions = await spotifyQuestions.getQuestions();
      const track = questions[0].track;
      const metaData = track.getMetaData();
      expect(metaData).toHaveProperty('httpLink');
      expect(metaData.httpLink).toMatch(/https:\/\/open.spotify.com\/track\//);
      expect(metaData).toHaveProperty('uriLink');
      expect(metaData.uriLink).toMatch(/spotify:track:/);
    });
    it('#getRelatedArtists()', async () => {
      const questions = await spotifyQuestions.getQuestions({ questionType: 'artist name' });
      const track = questions[0].track;
      expect(relatedArtists).toEqual(track.getRelatedArtists());
    });
    it('#getTopTracks()', async () => {
      const questions = await spotifyQuestions.getQuestions({ questionType: 'track title' });
      const track = questions[0].track;
      expect(topTracks).toEqual(track.getTopTracks());
    });
    it('#getPlaylist()', async () => {
      const questions = await spotifyQuestions.getQuestions({ playlist: playlists[1] });
      const track = questions[0].track;
      expect(track.getPlaylist()).toEqual(playlists[1]);
    });
    it('#hasAudio()', async () => {
      const questions = await spotifyQuestions.getQuestions();
      const hasAudio = questions.map(q => q.track.hasAudio());
      expect(hasAudio).not.toContain(false);
    });
  });
});
