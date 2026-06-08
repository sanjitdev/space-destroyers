import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, THEMES, type GameMode } from '../utils/Constants';
import { type RunGrade } from '../managers/StatsManager';
import { Storage } from '../utils/Storage';

interface RunSummary {
  shotsFired: number;
  enemiesKilled: number;
  bossesKilled: number;
  livesLost: number;
  peakCombo: number;
  accuracy: number;
}

interface GameOverData {
  score: number;
  highScore: number;
  mode: GameMode;
  reason: 'time' | 'death';
  grade: RunGrade;
  summary: RunSummary;
}

const GRADE_COLORS: Record<RunGrade, string> = {
  S: '#ffe050',
  A: '#7cff6b',
  B: '#57e2e5',
  C: '#f4f7ff',
  D: '#ff8ba7',
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    const theme = THEMES[Storage.getTheme()];
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(theme.bgTint);

    const headlineText = data.reason === 'time' ? 'TIME\'S UP!' : 'GAME OVER';
    this.add.text(GAME_WIDTH / 2, 80, headlineText, {
      color: data.reason === 'time' ? '#7cff6b' : '#ff6b8a',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '52px',
      stroke: '#09101f',
      strokeThickness: 8,
    }).setOrigin(0.5);

    // Grade badge
    this.add.text(GAME_WIDTH / 2, 180, data.grade, {
      color: GRADE_COLORS[data.grade],
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '90px',
      stroke: '#09101f',
      strokeThickness: 10,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 268, `Score: ${data.score}    High: ${data.highScore}`, {
      align: 'center',
      color: '#f4f7ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Run stats panel
    const stats = data.summary;
    const statsLines = [
      `Enemies: ${stats.enemiesKilled}   Bosses: ${stats.bossesKilled}`,
      `Accuracy: ${stats.accuracy}%   Peak Combo: ×${stats.peakCombo}`,
      `Shots: ${stats.shotsFired}   Lives Lost: ${stats.livesLost}`,
    ].join('\n');

    this.add.text(GAME_WIDTH / 2, 340, statsLines, {
      align: 'center',
      color: '#aaccff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      lineSpacing: 8,
      stroke: '#09101f',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const button = this.add.rectangle(GAME_WIDTH / 2, 490, 240, 60, 0x1f3d68, 0.95)
      .setStrokeStyle(3, 0x6cf3ff)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(GAME_WIDTH / 2, 490, 'PLAY AGAIN', {
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      stroke: '#09101f',
      strokeThickness: 6,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, 568, 240, 48, 0x0a1326, 0.9)
      .setStrokeStyle(2, 0x445577)
      .setInteractive({ useHandCursor: true });
    const menuLabel = this.add.text(GAME_WIDTH / 2, 568, 'MAIN MENU', {
      color: '#aaccff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const playAgain = (): void => { this.scene.start('GameScene', { mode: data.mode }); };
    const goMenu = (): void => { this.scene.start('MenuScene'); };

    button.on('pointerdown', playAgain);
    label.on('pointerdown', playAgain);
    menuBtn.on('pointerdown', goMenu);
    menuLabel.on('pointerdown', goMenu);
    this.input.keyboard?.once('keydown-SPACE', playAgain);
  }
}
