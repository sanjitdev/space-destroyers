import Phaser from 'phaser';
import { Storage } from '../utils/Storage';

const musicPattern = [262, 330, 392, 330, 523, 392, 330, 294, 349, 440, 523, 440];

export class AudioManager {
  private audioContext?: AudioContext;
  private muted = Storage.getMuted();
  private unlocked = false;
  private musicTimerMs = 0;
  private musicIndex = 0;
  private readonly scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.input.on('pointerdown', this.unlock, this);
    this.scene.input.keyboard?.on('keydown', this.unlock, this);
  }

  update(deltaMs: number): void {
    if (this.muted || !this.unlocked) {
      return;
    }

    this.musicTimerMs -= deltaMs;
    if (this.musicTimerMs > 0) {
      return;
    }

    this.musicTimerMs = 240;
    const frequency = musicPattern[this.musicIndex];
    this.musicIndex = (this.musicIndex + 1) % musicPattern.length;
    this.playTone(frequency, 0.16, 'triangle', 0.03);
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    Storage.setMuted(this.muted);
    return this.muted;
  }

  playShoot(): void {
    this.playTone(660, 0.06, 'square', 0.04, 920);
  }

  playExplosion(): void {
    this.playTone(140, 0.18, 'sawtooth', 0.05, 70);
  }

  playPowerUp(): void {
    this.playTone(520, 0.12, 'triangle', 0.05, 820);
  }

  playDamage(): void {
    this.playTone(180, 0.14, 'square', 0.05, 110);
  }

  playLaser(): void {
    this.playTone(180, 0.65, 'sawtooth', 0.22, 1800);
    this.playTone(360, 0.50, 'square', 0.09, 2200);
  }

  destroy(): void {
    this.scene.input.off('pointerdown', this.unlock, this);
    this.scene.input.keyboard?.off('keydown', this.unlock, this);
  }

  private unlock(): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    void context.resume();
    this.unlocked = true;
  }

  private getContext(): AudioContext | undefined {
    if (this.audioContext) {
      return this.audioContext;
    }

    const AudioContextConstructor = window.AudioContext;
    if (!AudioContextConstructor) {
      return undefined;
    }

    this.audioContext = new AudioContextConstructor();
    return this.audioContext;
  }

  private playTone(
    frequency: number,
    durationSeconds: number,
    type: OscillatorType,
    volume: number,
    slideToFrequency?: number,
  ): void {
    if (this.muted) {
      return;
    }

    const context = this.getContext();
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideToFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(slideToFrequency, now + durationSeconds);
    }

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + durationSeconds);
  }
}
