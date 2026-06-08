import Phaser from 'phaser';
import './style.css';
import { BootScene } from './scenes/BootScene';
import { GameOverScene } from './scenes/GameOverScene';
import { GameScene } from './scenes/GameScene';
import { MenuScene } from './scenes/MenuScene';
import { GAME_HEIGHT, GAME_WIDTH } from './utils/Constants';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'app',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#040814',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [BootScene, MenuScene, GameScene, GameOverScene],
});

if (import.meta.env.DEV) {
  (
    window as Window & {
      __SPACE_BLASTER__?: Phaser.Game;
    }
  ).__SPACE_BLASTER__ = game;
}

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});
