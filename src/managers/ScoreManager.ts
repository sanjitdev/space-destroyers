import { Storage } from '../utils/Storage';

export class ScoreManager {
  private score = 0;
  private highScore = Storage.getHighScore();

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  add(points: number, doubled: boolean): number {
    const awarded = doubled ? points * 2 : points;
    this.score += awarded;

    if (this.score > this.highScore) {
      this.highScore = this.score;
      Storage.setHighScore(this.highScore);
    }

    return awarded;
  }
}
