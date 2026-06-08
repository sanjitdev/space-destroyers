import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, THEMES, type GameMode } from '../utils/Constants';
import { Storage } from '../utils/Storage';

interface GameOverData {
  score: number;
  highScore: number;
  mode: GameMode;
  reason: 'time' | 'death';
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    const theme = THEMES[Storage.getTheme()];
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(theme.bgTint);

    const headlineText = data.reason === 'time' ? 'TIME\'S UP!' : 'GAME OVER';
    this.add.text(GAME_WIDTH / 2, 180, headlineText, {
      color: data.reason === 'time' ? '#7cff6b' : '#ff6b8a',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '52px',
      stroke: '#09101f',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 320, `Final Score: ${data.score}\nHigh Score: ${data.highScore}`, {
      align: 'center',
      color: '#f4f7ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '28px',
      lineSpacing: 10,
      stroke: '#09101f',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const button = this.add.rectangle(GAME_WIDTH / 2, 500, 240, 68, 0x1f3d68, 0.95)
      .setStrokeStyle(3, 0x6cf3ff)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(GAME_WIDTH / 2, 500, 'PLAY AGAIN', {
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '30px',
      stroke: '#09101f',
      strokeThickness: 6,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const menuBtn = this.add.rectangle(GAME_WIDTH / 2, 588, 240, 52, 0x0a1326, 0.9)
      .setStrokeStyle(2, 0x445577)
      .setInteractive({ useHandCursor: true });
    const menuLabel = this.add.text(GAME_WIDTH / 2, 588, 'MAIN MENU', {
      color: '#aaccff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '22px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const playAgain = (): void => {
      this.scene.start('GameScene', { mode: data.mode });
    };
    const goMenu = (): void => {
      this.scene.start('MenuScene');
    };

    button.on('pointerdown', playAgain);
    label.on('pointerdown', playAgain);
    menuBtn.on('pointerdown', goMenu);
    menuLabel.on('pointerdown', goMenu);
    this.input.keyboard?.once('keydown-SPACE', playAgain);
  }
}
