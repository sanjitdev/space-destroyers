export type RunGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export class StatsManager {
  private shotsFired = 0;
  private enemiesKilled = 0;
  private bossesKilled = 0;
  private livesLost = 0;
  private peakCombo = 0;

  recordShot(): void      { this.shotsFired++; }
  recordKill(): void      { this.enemiesKilled++; }
  recordBossKill(): void  { this.bossesKilled++; }
  recordDamage(): void    { this.livesLost++; }
  recordCombo(n: number): void { if (n > this.peakCombo) this.peakCombo = n; }

  getAccuracy(): number {
    return this.shotsFired === 0 ? 1 : Math.min(1, this.enemiesKilled / this.shotsFired);
  }

  computeGrade(score: number): RunGrade {
    const accuracy = this.getAccuracy();
    // Simple weighted score: raw points + accuracy bonus + boss bonus - damage penalty
    const gradeScore =
      score * (1 + accuracy * 0.5) +
      this.bossesKilled * 500 -
      this.livesLost * 200 +
      this.peakCombo * 20;

    if (gradeScore >= 8_000) return 'S';
    if (gradeScore >= 4_000) return 'A';
    if (gradeScore >= 2_000) return 'B';
    if (gradeScore >= 800)   return 'C';
    return 'D';
  }

  getSummary() {
    return {
      shotsFired: this.shotsFired,
      enemiesKilled: this.enemiesKilled,
      bossesKilled: this.bossesKilled,
      livesLost: this.livesLost,
      peakCombo: this.peakCombo,
      accuracy: Math.round(this.getAccuracy() * 100),
    };
  }
}
