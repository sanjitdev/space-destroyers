import Phaser from 'phaser';
import { Storage } from '../utils/Storage';

const STORAGE_KEY = 'space-destroyers-achievements';

interface AchievementDef {
  readonly id: string;
  readonly label: string;
  readonly icon: string;
  readonly check: () => boolean;
}

const DEFINITIONS: AchievementDef[] = [
  // ── Kill milestones ───────────────────────────────────────────
  { id: 'first-kill',   label: 'First Blood',       icon: '⚔',  check: () => Storage.getTotalKills() >= 1 },
  { id: 'kills-100',    label: '100 Kills',          icon: '💀', check: () => Storage.getTotalKills() >= 100 },
  { id: 'kills-500',    label: '500 Kills',          icon: '☠',  check: () => Storage.getTotalKills() >= 500 },
  { id: 'kills-2000',   label: '2000 Kills',         icon: '🔥', check: () => Storage.getTotalKills() >= 2_000 },
  { id: 'kills-10000',  label: '10,000 Kills',       icon: '💥', check: () => Storage.getTotalKills() >= 10_000 },
  // ── Boss milestones ───────────────────────────────────────────
  { id: 'first-boss',   label: 'Boss Slayer',        icon: '👾', check: () => Storage.getTotalBossesKilled() >= 1 },
  { id: 'bosses-5',     label: '5 Bosses Down',      icon: '🏅', check: () => Storage.getTotalBossesKilled() >= 5 },
  { id: 'bosses-10',    label: '10 Bosses Down',     icon: '🏆', check: () => Storage.getTotalBossesKilled() >= 10 },
  { id: 'bosses-25',    label: '25 Bosses Down',     icon: '👑', check: () => Storage.getTotalBossesKilled() >= 25 },
  { id: 'bosses-50',    label: 'Boss Conqueror',     icon: '🌟', check: () => Storage.getTotalBossesKilled() >= 50 },
  // ── Score milestones ──────────────────────────────────────────
  { id: 'score-500',    label: 'Getting Going',      icon: '✨', check: () => Storage.getHighScore() >= 500 },
  { id: 'score-1000',   label: 'Getting Started',    icon: '⭐', check: () => Storage.getHighScore() >= 1_000 },
  { id: 'score-5000',   label: 'High Roller',        icon: '🌟', check: () => Storage.getHighScore() >= 5_000 },
  { id: 'score-10000',  label: 'Legend',             icon: '👑', check: () => Storage.getHighScore() >= 10_000 },
  { id: 'score-25000',  label: 'Unstoppable',        icon: '🚀', check: () => Storage.getHighScore() >= 25_000 },
  { id: 'score-50000',  label: 'Hall of Fame',       icon: '🏆', check: () => Storage.getHighScore() >= 50_000 },
  // ── Playtime milestones ────────────────────────────────────────
  { id: 'games-1',      label: 'First Run',          icon: '🎮', check: () => Storage.getGamesPlayed() >= 1 },
  { id: 'games-5',      label: 'Getting Warmed Up',  icon: '🔥', check: () => Storage.getGamesPlayed() >= 5 },
  { id: 'games-10',     label: 'Veteran',            icon: '🎖',  check: () => Storage.getGamesPlayed() >= 10 },
  { id: 'games-25',     label: 'Battle-Hardened',    icon: '⚔',  check: () => Storage.getGamesPlayed() >= 25 },
  { id: 'games-50',     label: 'Dedicated',          icon: '🎯', check: () => Storage.getGamesPlayed() >= 50 },
  { id: 'games-100',    label: 'True Devotion',      icon: '💎', check: () => Storage.getGamesPlayed() >= 100 },
  // ── Ship milestones ────────────────────────────────────────────
  { id: 'ship-3',       label: 'Moving Up',          icon: '🚀', check: () => Storage.getMaxUnlockedShipLevel() >= 3 },
  { id: 'ship-5',       label: 'Half-Way There',     icon: '⚡', check: () => Storage.getMaxUnlockedShipLevel() >= 5 },
  { id: 'ship-8',       label: 'Elite Pilot',        icon: '🛸', check: () => Storage.getMaxUnlockedShipLevel() >= 8 },
  { id: 'ship-10',      label: 'Fleet Admiral',      icon: '👑', check: () => Storage.getMaxUnlockedShipLevel() >= 10 },
  // ── Mastery ────────────────────────────────────────────────────
  { id: 'score-any-ship', label: 'Versatile',        icon: '🎭', check: () => [0,1,2,3,4].some(i => Storage.getShipBest(i) > 0 && Storage.getShipBest(i + 5) > 0) },
  { id: 'score-3-ships',  label: 'Multi-Pilot',      icon: '✈',  check: () => Array.from({ length: 10 }, (_, i) => Storage.getShipBest(i)).filter(s => s > 0).length >= 3 },
  { id: 'high-roller-boss', label: 'Wealthy Slayer', icon: '💰', check: () => Storage.getHighScore() >= 5_000 && Storage.getTotalBossesKilled() >= 3 },
  { id: 'dedicated-boss',   label: 'Boss Obsessed',  icon: '👹', check: () => Storage.getTotalBossesKilled() >= 10 && Storage.getGamesPlayed() >= 20 },
];

const getUnlocked = (): Set<string> => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
};

const saveUnlocked = (set: Set<string>): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch { /* noop */ }
};

export class AchievementManager {
  private readonly scene: Phaser.Scene;
  private toastQueue: AchievementDef[] = [];
  private showingToast = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /** Call after stats are updated to trigger any newly unlocked achievements. */
  check(): void {
    const unlocked = getUnlocked();
    for (const def of DEFINITIONS) {
      if (!unlocked.has(def.id) && def.check()) {
        unlocked.add(def.id);
        this.toastQueue.push(def);
      }
    }
    saveUnlocked(unlocked);
    this.drainQueue();
  }

  private drainQueue(): void {
    if (this.showingToast || this.toastQueue.length === 0) return;
    this.showToast(this.toastQueue.shift()!);
  }

  private showToast(def: AchievementDef): void {
    this.showingToast = true;
    const FONT = 'Arial Black, sans-serif';
    const cx = 240;
    const toastW = 320;
    const toastH = 60;
    const toastY = 740;

    const bg = this.scene.add.graphics().setDepth(60).setScrollFactor(0);
    bg.fillStyle(0x030a18, 0.95);
    bg.fillRoundedRect(cx - toastW / 2, toastY - toastH / 2, toastW, toastH, 12);
    bg.lineStyle(2, 0xffe050, 0.75);
    bg.strokeRoundedRect(cx - toastW / 2, toastY - toastH / 2, toastW, toastH, 12);

    const icon = this.scene.add.text(cx - toastW / 2 + 18, toastY, def.icon, {
      fontFamily: FONT, fontSize: '26px',
    }).setOrigin(0, 0.5).setDepth(61).setScrollFactor(0);

    const title = this.scene.add.text(cx - toastW / 2 + 54, toastY - 9, 'ACHIEVEMENT UNLOCKED', {
      fontFamily: FONT, fontSize: '9px', color: '#ffe050', letterSpacing: 2,
    }).setOrigin(0, 0.5).setDepth(61).setScrollFactor(0);

    const name = this.scene.add.text(cx - toastW / 2 + 54, toastY + 9, def.label, {
      fontFamily: FONT, fontSize: '16px', color: '#e8faff',
      stroke: '#060c1a', strokeThickness: 3,
    }).setOrigin(0, 0.5).setDepth(61).setScrollFactor(0);

    const all = [bg, icon, title, name];
    all.forEach(o => o.setAlpha(0).setY((o as { y: number }).y + 20));

    this.scene.tweens.add({
      targets: all, alpha: 1, y: '-=20', duration: 300, ease: 'Cubic.easeOut',
      onComplete: () => {
        this.scene.time.delayedCall(2200, () => {
          this.scene.tweens.add({
            targets: all, alpha: 0, y: '-=12', duration: 280, ease: 'Cubic.easeIn',
            onComplete: () => {
              all.forEach(o => o.destroy());
              this.showingToast = false;
              this.drainQueue();
            },
          });
        });
      },
    });
  }
}
