import type PhaserType from 'phaser';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH } from './utils/Constants';

const [{ default: Phaser }, { BootScene }, { MenuScene }, { GameScene }, { GameOverScene }, { PerkDraftScene }] = await Promise.all([
  import('phaser'),
  import('./scenes/BootScene'),
  import('./scenes/MenuScene'),
  import('./scenes/GameScene'),
  import('./scenes/GameOverScene'),
  import('./scenes/PerkDraftScene'),
]);

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
  scene: [BootScene, MenuScene, GameScene, GameOverScene, PerkDraftScene],
});

if (import.meta.env.DEV) {
  (
    window as Window & {
      __SPACE_BLASTER__?: PhaserType.Game;
    }
  ).__SPACE_BLASTER__ = game;
}

window.addEventListener('beforeunload', () => {
  game.destroy(true);
});
