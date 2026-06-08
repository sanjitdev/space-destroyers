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

const FONT = 'Arial Black, sans-serif';

const GRADE_COLOR: Record<RunGrade, number> = {
  S: 0xffe050,
  A: 0x7cff6b,
  B: 0x57e2e5,
  C: 0xf4f7ff,
  D: 0xff8ba7,
};

const GRADE_COLOR_HEX: Record<RunGrade, string> = {
  S: '#ffe050',
  A: '#7cff6b',
  B: '#57e2e5',
  C: '#e0e8ff',
  D: '#ff8ba7',
};

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: GameOverData): void {
    const theme = THEMES[Storage.getTheme()];

    // ── Background ───────────────────────────────────────────────
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-nebula').setOrigin(0).setAlpha(0.80);
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg-far').setOrigin(0).setAlpha(0.50);
    this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, 'space-bg').setOrigin(0).setTint(theme.bgTint).setAlpha(0.55);

    // ── Headline ─────────────────────────────────────────────────
    const isTime = data.reason === 'time';
    const headlineColor = isTime ? '#7cff6b' : '#ff6b8a';
    const headline = this.add.text(GAME_WIDTH / 2, -50, isTime ? "TIME'S UP!" : 'GAME OVER', {
      fontFamily: FONT, fontSize: '50px', color: headlineColor,
      stroke: '#060c1a', strokeThickness: 8,
      shadow: { offsetX: 0, offsetY: 0, color: headlineColor, blur: 22, fill: true },
    }).setOrigin(0.5);

    // ── Grade badge ──────────────────────────────────────────────
    const gradeColor = GRADE_COLOR[data.grade];
    const gradeHex = GRADE_COLOR_HEX[data.grade];

    const gradeRingOuter = this.add.circle(GAME_WIDTH / 2, 220, 74, gradeColor, 0.12).setAlpha(0);
    const gradeRing = this.add.circle(GAME_WIDTH / 2, 220, 62).setStrokeStyle(3, gradeColor, 0.9).setAlpha(0);
    const gradePanel = this.add.circle(GAME_WIDTH / 2, 220, 56, 0x04101e, 0.92).setAlpha(0);
    const gradeText = this.add.text(GAME_WIDTH / 2, 220, data.grade, {
      fontFamily: FONT, fontSize: '80px', color: gradeHex,
      shadow: { offsetX: 0, offsetY: 0, color: gradeHex, blur: 28, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    // ── Score block ──────────────────────────────────────────────
    const scorePanel = this.add.rectangle(GAME_WIDTH / 2, 318, GAME_WIDTH - 40, 64, 0x030d1a, 0.88)
      .setStrokeStyle(1, 0x0f2a48, 0.8).setAlpha(0);
    const scoreText = this.add.text(GAME_WIDTH / 2, 306, data.score.toLocaleString(), {
      fontFamily: FONT, fontSize: '30px', color: '#ffffff',
      shadow: { offsetX: 0, offsetY: 0, color: '#6cf3ff', blur: 14, fill: true },
    }).setOrigin(0.5).setAlpha(0);
    const isNewBest = data.score > 0 && data.score >= data.highScore;
    const highLabel = isNewBest ? '★  NEW HIGH SCORE  ★' : `BEST  ${data.highScore.toLocaleString()}`;
    const highText = this.add.text(GAME_WIDTH / 2, 336, highLabel, {
      fontFamily: FONT, fontSize: '13px',
      color: isNewBest ? '#ffe050' : '#3a6080',
      letterSpacing: 2,
      shadow: isNewBest ? { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 8, fill: true } : undefined,
    }).setOrigin(0.5).setAlpha(0);

    // ── Stats card ───────────────────────────────────────────────
    const s = data.summary;
    const statRows = [
      [`⚔  ${s.enemiesKilled} enemies`, `💀  ${s.bossesKilled} bosses`],
      [`🎯  ${s.accuracy}% accuracy`, `⚡  ×${s.peakCombo} combo`],
      [`💥  ${s.shotsFired} shots`, `💔  ${s.livesLost} lives lost`],
    ];

    const statPanel = this.add.rectangle(GAME_WIDTH / 2, 432, GAME_WIDTH - 40, 90, 0x030d1a, 0.85)
      .setStrokeStyle(1, 0x0f2a48, 0.8).setAlpha(0);

    const statTextObjs: Phaser.GameObjects.Text[] = [];
    statRows.forEach((row, i) => {
      const y = 404 + i * 28;
      statTextObjs.push(
        this.add.text(GAME_WIDTH / 2 - 14, y, row[0], { fontFamily: FONT, fontSize: '14px', color: '#6699bb' }).setOrigin(1, 0).setAlpha(0),
        this.add.text(GAME_WIDTH / 2 + 14, y, row[1], { fontFamily: FONT, fontSize: '14px', color: '#6699bb' }).setOrigin(0, 0).setAlpha(0),
      );
    });

    // ── Career stats strip ────────────────────────────────────────
    const careerY = 498;
    const careerPanel = this.add.rectangle(GAME_WIDTH / 2, careerY, GAME_WIDTH - 40, 36, 0x010810, 0.80)
      .setStrokeStyle(1, 0x0a1e38, 0.7).setAlpha(0);
    const careerText = this.add.text(GAME_WIDTH / 2, careerY,
      `CAREER  ·  ${Storage.getGamesPlayed()} runs  ·  ${Storage.getTotalKills().toLocaleString()} kills  ·  ${Storage.getTotalBossesKilled()} bosses`, {
      fontFamily: FONT, fontSize: '11px', color: '#2c5070', letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(0);

    // ── Buttons ──────────────────────────────────────────────────
    const playAgain = (): void => { this.scene.start('GameScene', { mode: data.mode }); };
    const goMenu    = (): void => { this.scene.start('MenuScene'); };

    const makeBtn = (
      cy: number, w: number, h: number,
      fillHex: number, strokeHex: number,
      text: string, textColor: string, fontSize: string,
      onPress: () => void,
    ): [Phaser.GameObjects.Graphics, Phaser.GameObjects.Text] => {
      const cx = GAME_WIDTH / 2;
      const r = 14;
      const gfx = this.add.graphics().setPosition(cx, cy).setAlpha(0);

      const draw = (glow: number, fill: number): void => {
        gfx.clear();
        gfx.fillStyle(strokeHex, 0.10 * glow);
        gfx.fillRoundedRect(-w / 2 - 9, -h / 2 - 7, w + 18, h + 14, r + 9);
        gfx.fillStyle(fillHex, fill);
        gfx.fillRoundedRect(-w / 2, -h / 2, w, h, r);
        gfx.fillStyle(0x000000, 0.22);
        gfx.fillRoundedRect(-w / 2 + 3, h / 2 - 8, w - 6, 7, { tl: 0, tr: 0, bl: r - 3, br: r - 3 });
        gfx.fillStyle(0xffffff, 0.10);
        gfx.fillRoundedRect(-w / 2 + 3, -h / 2 + 3, w - 6, h * 0.40, { tl: r - 3, tr: r - 3, bl: 0, br: 0 });
        gfx.lineStyle(2, strokeHex, 0.82 * glow);
        gfx.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
        gfx.lineStyle(1, strokeHex, 0.22 * glow);
        gfx.strokeRoundedRect(-w / 2 + 2, -h / 2 + 2, w - 4, h - 4, r - 2);
      };

      draw(0.85, 0.90);

      const label = this.add.text(cx, cy, text, {
        fontFamily: FONT, fontSize, color: textColor,
        stroke: '#060c1a', strokeThickness: 4,
        shadow: { offsetX: 0, offsetY: 0, color: textColor, blur: 18, fill: true },
      }).setOrigin(0.5).setAlpha(0);

      const hit = this.add.rectangle(cx, cy, w + 14, h + 14, 0, 0)
        .setInteractive({ useHandCursor: true });
      hit.on('pointerover', () => { draw(1, 0.96); label.setAlpha(1); });
      hit.on('pointerout',  () => { draw(0.85, 0.90); label.setAlpha(0.9); });
      hit.on('pointerdown', () => {
        this.tweens.add({ targets: [gfx, label], scaleX: 0.93, scaleY: 0.93, duration: 65, yoyo: true, ease: 'Sine.easeIn' });
        onPress();
      });

      return [gfx, label];
    };

    const [btn1Gfx, btn1Label] = makeBtn(570, 280, 58, 0x08192e, 0x6cf3ff, 'PLAY AGAIN', '#6cf3ff', '24px', playAgain);
    const [btn2Gfx, btn2Label] = makeBtn(642, 260, 46, 0x060c1e, 0x2a6090, 'MAIN MENU',  '#4a88b0', '20px', goMenu);

    this.input.keyboard?.once('keydown-SPACE', playAgain);

    // ── Staggered reveal animation ───────────────────────────────
    const fadeIn = (targets: Phaser.GameObjects.GameObject[], delay: number, slideY = false): void => {
      if (slideY) targets.forEach(t => { (t as unknown as { y: number }).y += 18; });
      this.tweens.add({ targets, alpha: 1, ...(slideY ? { y: '-=18' } : {}), delay, duration: 340, ease: 'Cubic.easeOut' });
    };

    this.tweens.add({ targets: headline, y: 75, duration: 500, ease: 'Back.easeOut' });

    [gradeRingOuter, gradeRing, gradePanel, gradeText].forEach(o => o.setScale(0.5));
    this.tweens.add({ targets: [gradeRingOuter, gradeRing, gradePanel, gradeText], alpha: 1, scale: 1, delay: 300, duration: 420, ease: 'Back.easeOut' });

    fadeIn([scorePanel, scoreText, highText], 500, true);
    fadeIn([statPanel, ...statTextObjs], 650, true);
    fadeIn([careerPanel, careerText], 760, true);
    fadeIn([btn1Gfx, btn1Label], 860, true);
    fadeIn([btn2Gfx, btn2Label], 960, true);
  }
}

