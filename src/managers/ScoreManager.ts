import { Storage } from '../utils/Storage';

export class ScoreManager {
  private score = 0;
  private highScore = Storage.getHighScore();
  private passiveScoreRemainderMs = 0;

  getScore(): number {
    return this.score;
  }

  getHighScore(): number {
    return this.highScore;
  }

  addSurvival(deltaMs: number): number {
    this.passiveScoreRemainderMs += deltaMs;
    const survivalPoints = Math.floor(this.passiveScoreRemainderMs / 1_000);
    if (survivalPoints <= 0) return 0;

    this.passiveScoreRemainderMs -= survivalPoints * 1_000;
    this.score += survivalPoints;
    this.updateHighScore();
    return survivalPoints;
  }

  add(points: number, doubled: boolean, comboMultiplier = 1): number {
    const awarded = points * comboMultiplier * (doubled ? 2 : 1);
    this.score += awarded;
    this.updateHighScore();

    return awarded;
  }

  private updateHighScore(): void {
    if (this.score <= this.highScore) return;
    this.highScore = this.score;
    Storage.setHighScore(this.highScore);
  }
}
