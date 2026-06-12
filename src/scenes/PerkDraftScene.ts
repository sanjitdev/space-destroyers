import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PERK_RARITY_COLORS, type PerkDef } from '../utils/Constants';

const FONT = 'Arial Black, sans-serif';
const CARD_W = 128;
const CARD_H = 186;
const CARD_GAP = 16;
const CARDS_TOTAL_W = CARD_W * 3 + CARD_GAP * 2;
const CARD_Y = GAME_HEIGHT / 2 + 20;

interface PerkDraftPayload {
  choices: PerkDef[];
  bossLevel: number;
}

export class PerkDraftScene extends Phaser.Scene {
  constructor() {
    super('PerkDraftScene');
  }

  create(data: PerkDraftPayload): void {
    const { choices, bossLevel } = data;

    // Dark overlay
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.78)
      .setDepth(0).setScrollFactor(0);

    // Header
    this.add.text(GAME_WIDTH / 2, 110, `BOSS ${bossLevel} DEFEATED`, {
      fontFamily: FONT, fontSize: '14px', color: '#ff88aa', letterSpacing: 3,
    }).setOrigin(0.5).setDepth(1);

    this.add.text(GAME_WIDTH / 2, 140, 'CHOOSE A PERK', {
      fontFamily: FONT, fontSize: '28px', color: '#ffe050',
      stroke: '#000000', strokeThickness: 6,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffe050', blur: 20, fill: true },
    }).setOrigin(0.5).setDepth(1);

    this.add.text(GAME_WIDTH / 2, 170, 'Persists for this run', {
      fontFamily: FONT, fontSize: '11px', color: '#6cf3ff', letterSpacing: 1,
    }).setOrigin(0.5).setDepth(1);

    const startX = (GAME_WIDTH - CARDS_TOTAL_W) / 2 + CARD_W / 2;

    choices.forEach((perk, i) => {
      const cx = startX + i * (CARD_W + CARD_GAP);
      this.buildCard(perk, cx, CARD_Y, i * 80);
    });
  }

  private buildCard(perk: PerkDef, cx: number, cy: number, delayMs: number): void {
    const rarityColor = Phaser.Display.Color.HexStringToColor(
      PERK_RARITY_COLORS[perk.rarity].replace('#', ''),
    ).color;

    const container = this.add.container(cx, cy + 60).setDepth(2).setAlpha(0);

    // Card background
    const bg = this.add.graphics();
    bg.fillStyle(0x04101e, 0.97);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 12);
    bg.lineStyle(2, rarityColor, 0.9);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 12);

    // Rarity glow bar at top
    const glowBar = this.add.graphics();
    glowBar.fillStyle(rarityColor, 0.7);
    glowBar.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, 6, { tl: 12, tr: 12, bl: 0, br: 0 });

    const rarityLabel = this.add.text(0, -CARD_H / 2 + 18, perk.rarity.toUpperCase(), {
      fontFamily: FONT, fontSize: '8px', letterSpacing: 2,
      color: PERK_RARITY_COLORS[perk.rarity],
    }).setOrigin(0.5);

    const icon = this.add.text(0, -CARD_H / 2 + 50, perk.icon, {
      fontFamily: FONT, fontSize: '36px',
    }).setOrigin(0.5);

    const label = this.add.text(0, -CARD_H / 2 + 96, perk.label, {
      fontFamily: FONT, fontSize: '13px', color: '#e8faff',
      stroke: '#060c1a', strokeThickness: 3, wordWrap: { width: CARD_W - 12 },
      align: 'center',
    }).setOrigin(0.5);

    const desc = this.add.text(0, CARD_H / 2 - 28, perk.description, {
      fontFamily: FONT, fontSize: '9px', color: '#8faabb', wordWrap: { width: CARD_W - 14 },
      align: 'center',
    }).setOrigin(0.5);

    // Invisible hit area
    const hit = this.add.rectangle(0, 0, CARD_W, CARD_H, 0x000000, 0)
      .setInteractive({ cursor: 'pointer' });

    container.add([bg, glowBar, rarityLabel, icon, label, desc, hit]);

    // Entrance animation
    this.tweens.add({
      targets: container,
      alpha: 1,
      y: cy,
      delay: delayMs,
      duration: 320,
      ease: 'Back.easeOut',
    });

    // Hover effect
    hit.on('pointerover', () => {
      this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 100 });
      bg.lineStyle(2, rarityColor, 1);
    });
    hit.on('pointerout', () => {
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });

    // Pick perk
    hit.on('pointerdown', () => this.choosePerk(perk));
  }

  private choosePerk(perk: PerkDef): void {
    // Notify GameScene
    const gameScene = this.scene.get('GameScene') as Phaser.Scene & { onPerkChosen: (id: string) => void };
    gameScene.onPerkChosen(perk.id);

    // Flash selected perk label then exit
    const flash = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xffffff, 0)
      .setDepth(10);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20, perk.icon, {
      fontFamily: FONT, fontSize: '56px',
    }).setOrigin(0.5).setDepth(11);

    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 38, `${perk.label} UNLOCKED`, {
      fontFamily: FONT, fontSize: '20px', color: PERK_RARITY_COLORS[perk.rarity],
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5).setDepth(11);

    this.tweens.add({
      targets: flash, alpha: 0.45, duration: 180, yoyo: true,
      onComplete: () => {
        this.time.delayedCall(400, () => {
          this.scene.stop();
          this.scene.resume('GameScene');
        });
      },
    });
  }
}
