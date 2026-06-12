import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, SHIP_CONFIGS, THEMES, type GameMode } from '../utils/Constants';
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
      color: isNewBest ? '#ffe050' : '#aed4ea',
      letterSpacing: 2,
      stroke: '#061220', strokeThickness: 3,
      shadow: isNewBest
        ? { offsetX: 0, offsetY: 0, color: '#ffaa00', blur: 8, fill: true }
        : { offsetX: 0, offsetY: 0, color: '#57a8d8', blur: 6, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    // ── Stats card ───────────────────────────────────────────────
    const s = data.summary;
    const statRows = [
      [`\u2736  ${s.enemiesKilled} enemies`, `\u2605  ${s.bossesKilled} bosses`],
      [`\u25ce  ${s.accuracy}% accuracy`, `\u00d7${s.peakCombo} combo`],
      [`\u25b8  ${s.shotsFired} shots`, `\u2665  ${s.livesLost} lives lost`],
    ];

    const statPanel = this.add.rectangle(GAME_WIDTH / 2, 432, GAME_WIDTH - 40, 90, 0x030d1a, 0.85)
      .setStrokeStyle(1, 0x0f2a48, 0.8).setAlpha(0);

    const statTextObjs: Phaser.GameObjects.Text[] = [];
    statRows.forEach((row, i) => {
      const y = 404 + i * 28;
      statTextObjs.push(
        this.add.text(GAME_WIDTH / 2 - 14, y, row[0], {
          fontFamily: FONT, fontSize: '14px', color: '#c8e6f7', stroke: '#061220', strokeThickness: 3,
        }).setOrigin(1, 0).setAlpha(0),
        this.add.text(GAME_WIDTH / 2 + 14, y, row[1], {
          fontFamily: FONT, fontSize: '14px', color: '#c8e6f7', stroke: '#061220', strokeThickness: 3,
        }).setOrigin(0, 0).setAlpha(0),
      );
    });

    // ── Career stats strip ────────────────────────────────────────
    const careerY = 498;
    const careerPanel = this.add.rectangle(GAME_WIDTH / 2, careerY, GAME_WIDTH - 40, 36, 0x010810, 0.80)
      .setStrokeStyle(1, 0x0a1e38, 0.7).setAlpha(0);
    const careerText = this.add.text(GAME_WIDTH / 2, careerY,
      `CAREER  ·  ${Storage.getGamesPlayed()} runs  ·  ${Storage.getTotalKills().toLocaleString()} kills  ·  ${Storage.getTotalBossesKilled()} bosses`, {
      fontFamily: FONT, fontSize: '11px', color: '#a8d0e8', letterSpacing: 1,
      stroke: '#061220', strokeThickness: 2,
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

    // Leaderboard link
    const lbLink = this.add.text(GAME_WIDTH / 2, 706, '★  Best Runs', {
      fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#7fa8c0',
      stroke: '#04101e', strokeThickness: 3, letterSpacing: 1,
    }).setOrigin(0.5).setAlpha(0).setInteractive({ useHandCursor: true });
    lbLink.on('pointerover', () => lbLink.setColor('#ffe050'));
    lbLink.on('pointerout',  () => lbLink.setColor('#7fa8c0'));
    lbLink.on('pointerdown', () => this.showLeaderboardOverlay(data.score));
    fadeIn([lbLink], 1050, true);

    this.input.keyboard?.once('keydown-SPACE', playAgain);
  }

  private showLeaderboardOverlay(currentScore: number): void {
    const W = GAME_WIDTH;
    const history = Storage.getRunHistory();
    const panelH = Math.max(280, 100 + Math.min(history.length, 10) * 36);
    const panelW = 420;
    const panelX = (W - panelW) / 2;
    const panelY = (GAME_HEIGHT - panelH) / 2;

    const container = this.add.container(0, 0).setDepth(70).setAlpha(0);
    const backdrop = this.add.rectangle(W / 2, GAME_HEIGHT / 2, W, GAME_HEIGHT, 0x000000, 0.80).setInteractive();
    container.add(backdrop);

    const gfx = this.add.graphics();
    gfx.fillStyle(0x030c1c, 0.97);
    gfx.fillRoundedRect(panelX, panelY, panelW, panelH, 18);
    gfx.lineStyle(1.5, 0x1a3060, 1);
    gfx.strokeRoundedRect(panelX, panelY, panelW, panelH, 18);
    gfx.lineStyle(1, 0xffe050, 0.20);
    gfx.strokeRoundedRect(panelX + 2, panelY + 2, panelW - 4, panelH - 4, 16);
    container.add(gfx);

    container.add(this.add.text(W / 2, panelY + 26, '\u2605  BEST RUNS', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '18px', color: '#ffe050',
      stroke: '#09101f', strokeThickness: 4,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffcc00', blur: 14, fill: true },
    }).setOrigin(0.5));
    container.add(this.add.rectangle(W / 2, panelY + 50, panelW - 36, 1, 0x1a3060, 0.8));

    if (history.length === 0) {
      container.add(this.add.text(W / 2, panelY + panelH / 2, 'No runs yet!', {
        fontFamily: 'Arial, sans-serif', fontSize: '14px', color: '#4a6a8a',
      }).setOrigin(0.5));
    } else {
      history.slice(0, 10).forEach((run, i) => {
        const rowY = panelY + 62 + i * 32;
        const isCurrentRun = run.score === currentScore && i === 0;
        const shipLabel = SHIP_CONFIGS[run.shipIndex]?.label ?? `Ship ${run.shipIndex + 1}`;
        const durationSec = Math.round(run.durationMs / 1_000);
        const timeLabel = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`;

        if (isCurrentRun) {
          const hl = this.add.graphics();
          hl.fillStyle(0x0a1e10, 0.9);
          hl.fillRoundedRect(panelX + 10, rowY - 8, panelW - 20, 28, 6);
          hl.lineStyle(1, 0xffe050, 0.5);
          hl.strokeRoundedRect(panelX + 10, rowY - 8, panelW - 20, 28, 6);
          container.add(hl);
        }

        const rankColor = i === 0 ? '#ffe050' : i === 1 ? '#c0c8d0' : i === 2 ? '#d08844' : '#4a7a9a';
        container.add(this.add.text(panelX + 22, rowY + 5, `#${i + 1}`, {
          fontFamily: 'Arial Black, sans-serif', fontSize: '11px', color: rankColor,
          stroke: '#04101e', strokeThickness: 2,
        }).setOrigin(0, 0.5));

        container.add(this.add.text(panelX + 60, rowY + 5, run.score.toLocaleString(), {
          fontFamily: 'Arial Black, sans-serif', fontSize: '13px',
          color: isCurrentRun ? '#ffe050' : '#d8f0ff',
          stroke: '#04101e', strokeThickness: 3,
        }).setOrigin(0, 0.5));

        container.add(this.add.text(panelX + 170, rowY + 5, run.grade, {
          fontFamily: 'Arial Black, sans-serif', fontSize: '13px', color: '#c0d8f0',
          stroke: '#04101e', strokeThickness: 2,
        }).setOrigin(0, 0.5));

        container.add(this.add.text(panelX + 210, rowY + 5, shipLabel, {
          fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#7fa8c0',
          stroke: '#04101e', strokeThickness: 2,
        }).setOrigin(0, 0.5));

        container.add(this.add.text(panelX + panelW - 20, rowY + 5, timeLabel, {
          fontFamily: 'Arial, sans-serif', fontSize: '10px', color: '#5a7a9a',
          stroke: '#04101e', strokeThickness: 2,
        }).setOrigin(1, 0.5));
      });
    }

    this.tweens.add({ targets: container, alpha: 1, duration: 160 });
    const close = (): void => {
      escKey?.off('down', close);
      this.tweens.add({ targets: container, alpha: 0, duration: 120, onComplete: () => container.destroy() });
    };
    backdrop.on('pointerdown', close);
    const escKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    escKey?.once('down', close);
  }
}

