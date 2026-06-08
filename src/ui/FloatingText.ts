import Phaser from 'phaser';

export class FloatingText extends Phaser.GameObjects.Text {
  constructor(scene: Phaser.Scene, x: number, y: number, text: string, color = '#ffffff') {
    super(scene, x, y, text, {
      color,
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '18px',
      stroke: '#09101f',
      strokeThickness: 4,
    });

    scene.add.existing(this);
    this.setOrigin(0.5);

    scene.tweens.add({
      targets: this,
      y: y - 30,
      alpha: 0,
      duration: 650,
      ease: 'Cubic.easeOut',
      onComplete: () => this.destroy(),
    });
  }
}
