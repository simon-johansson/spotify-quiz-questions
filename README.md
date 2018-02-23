# spotify-quiz-questions [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][codecov-image]][codecov-url]

> Generates questions for music quiz

Fetches tracks from playlist of your choosing. Makes additional requests to fetch 'artists top tracks' or 'related artists' to construct question. Module uses [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node) to make requests to Spotify API.

## Installation

```sh
$ npm install --save spotify-quiz-questions
```

## Usage

```js
const SpotifyQuizQuestions = require('spotify-quiz-questions').default

const config = {
  // client id for Spotify API
  clientId: '', 
  // client id for Spotify API
  clientSecret: '',
  // if refresh token should auto update. defaults to false.
  shouldUpdateRefreshToken: false,
}

const spotifyQuizQuestions = new SpotifyQuizQuestions(config)

const options = {
  // playlist used to generate questions. defaults to 'Top 100 tracks currently on Spotify'
  playlist: {
    name: 'Top 100 tracks currently on Spotify',
    id: '4hOKQuZbraPDIfaGbM3lKI',
    owner: 'spotify'
  },
  // "guess the artist name" or "guess the track title" type of questions
  // 'track title', 'artist name' or 'mix'. defaults to 'mix'
  questionType: 'mix',
  // number of questions, max is 12. defaults to 10.
  amount: 10
}

spotifyQuizQuestions.getQuestions(options)
  .then((questions) => {
    const q = questions[0]
    q.getChoices() // [ 'Kevin Lyttle', 'Machel Montano', 'Massari', 'Mavado' ]
    q.getRightAnswer() // 'Kevin Lyttle'
    q.evaluateAnswer('Kevin Lyttle') // true

    const track = q.getTrack()
    track.getArtist() // 'Kevin Lyttle'
    track.getArtistId() // '1GaBsp1ICIp1e6udgE7fba'
    track.getTitle() // 'Turn Me On'
    track.getAudioPreview() // 'https://p.scdn.co/mp3-preview/...'
    track.getImage() // { height: 300, width: 300, url: 'https://i.scdn.co/image/...' }
    track.getMetaData() // { httpLink: 'https://open.spotify.com/track/...', uriLink: 'spotify:track:...' }
  })
  .catch((err) => console.log(err))
```

## Typescript
Yes! Module comes bundled with declaration files.

## License

MIT © [Simon Johansson](https://github.com/simon-johansson)


[npm-image]: https://badge.fury.io/js/spotify-quiz-questions.svg
[npm-url]: https://npmjs.org/package/spotify-quiz-questions
[travis-image]: https://travis-ci.org/simon-johansson/spotify-quiz-questions.svg?branch=master
[travis-url]: https://travis-ci.org/simon-johansson/spotify-quiz-questions
[daviddm-image]: https://david-dm.org/simon-johansson/spotify-quiz-questions.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/simon-johansson/spotify-quiz-questions
[codecov-image]: https://codecov.io/gh/simon-johansson/spotify-quiz-questions/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/simon-johansson/spotify-quiz-questions
