import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';

interface GameOverData {
  score: number;
  highScore: number;
}

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(0xaa88ff);

    this.add.text(GAME_WIDTH / 2, 180, 'GAME OVER', {
      color: '#ff6b8a',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '52px',
      stroke: '#09101f',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 320, `Final Score: ${data.score}
High Score: ${data.highScore}`, {
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

    const playAgain = (): void => {
      this.scene.start('GameScene');
    };

    button.on('pointerdown', playAgain);
    label.on('pointerdown', playAgain);
    this.input.keyboard?.once('keydown-SPACE', playAgain);
  }
}
