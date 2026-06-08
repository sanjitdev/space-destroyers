import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../utils/Constants';
import { Storage } from '../utils/Storage';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const background = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(0x88aaff);
    this.tweens.add({ targets: background, alpha: 0.85, duration: 1800, yoyo: true, repeat: -1 });

    this.add.text(GAME_WIDTH / 2, 120, 'SPACE\nBLASTER', {
      align: 'center',
      color: '#6cf3ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '54px',
      stroke: '#09101f',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 260, `High Score: ${Storage.getHighScore()}`, {
      color: '#f4f7ff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '26px',
      stroke: '#09101f',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 338, 'Move with ← → or touch\nSpace or FIRE to shoot\nSurvive 60 seconds and chase the high score!', {
      align: 'center',
      color: '#dbe7ff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      lineSpacing: 8,
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(GAME_WIDTH / 2, 520, 240, 68, 0x182c52, 0.95)
      .setStrokeStyle(3, 0x6cf3ff)
      .setInteractive({ useHandCursor: true });
    const startLabel = this.add.text(GAME_WIDTH / 2, 520, 'START GAME', {
      color: '#ffffff',
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '30px',
      stroke: '#09101f',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const muteText = this.add.text(GAME_WIDTH / 2, 610, Storage.getMuted() ? 'Sound: Off (tap to toggle)' : 'Sound: On (tap to toggle)', {
      color: '#f5f1a6',
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      stroke: '#09101f',
      strokeThickness: 4,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const startGame = (): void => {
      this.scene.start('GameScene');
    };

    startButton.on('pointerdown', startGame);
    startLabel.setInteractive({ useHandCursor: true }).on('pointerdown', startGame);
    muteText.on('pointerdown', () => {
      const muted = !Storage.getMuted();
      Storage.setMuted(muted);
      muteText.setText(muted ? 'Sound: Off (tap to toggle)' : 'Sound: On (tap to toggle)');
    });

    this.input.keyboard?.once('keydown-SPACE', startGame);
  }
}
