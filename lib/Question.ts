
import * as _ from 'lodash';
import { QuestionType } from './interfaces';
import Track from './Track';

export default class Question {
  private numberOfChoices: number = 4;
  private questionType: QuestionType;
  private choices: string[];

  constructor(private track: Track) {
    this.setQuestionType();
  }

  public getChoices(): string[] {
    return _.shuffle(this.choices);
  }

  public getRightAnswer(): string | undefined {
    if (this.questionType === 'track title') {
      return this.track.getTitle();
    }
    if (this.questionType === 'artist name') {
      return this.track.getArtist();
    }
    return undefined;
  }

  public evaluateAnswer(answerGiven: string): boolean {
    return answerGiven === this.getRightAnswer() ? true : false;
  }

  public getTrack(): Track {
    return this.track;
  }

  private setQuestionType(): void {
    if (!!this.track.getTopTracks().length) {
      this.questionType = 'track title';
      this.setTitleChoices();
    } else if (!!this.track.getRelatedArtists().length) {
      this.questionType = 'artist name';
      this.setArtistChoices();
    }
  }

  private setTitleChoices(): void {
    const trackTitle = this.track.getTitle();
    const topTracks = _.remove([...this.track.getTopTracks()], (t) => {
      return t !== trackTitle;
    });
    this.choices = _.sampleSize(topTracks, (this.numberOfChoices - 1));
    this.choices.push(trackTitle);
  }

  private setArtistChoices(): void {
    const related = this.track.getRelatedArtists();
    this.choices = _.sampleSize(related, (this.numberOfChoices - 1));
    this.choices.push(this.track.getArtist());
  }
}
