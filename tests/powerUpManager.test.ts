import { describe, expect, it } from 'vitest';
import { PowerUpManager } from '../src/managers/PowerUpManager';

describe('PowerUpManager', () => {
  it('caps shield charges at 3 and consumes one per hit', () => {
    const manager = new PowerUpManager();

    manager.activate('shield');
    manager.activate('shield');
    manager.activate('shield');
    manager.activate('shield');

    expect(manager.isActive('shield')).toBe(true);
    expect(manager.consumeShieldCharge()).toBe(2);
    expect(manager.consumeShieldCharge()).toBe(1);
    expect(manager.consumeShieldCharge()).toBe(0);
    expect(manager.isActive('shield')).toBe(false);
  });

  it('keeps weapon buffs active until explicitly cleared', () => {
    const manager = new PowerUpManager();

    manager.activate('rapidFire');
    manager.activate('doubleShot');
    manager.activate('tripleShot');

    manager.update(120_000);

    expect(manager.isActive('rapidFire')).toBe(true);
    expect(manager.isActive('doubleShot')).toBe(true);
    expect(manager.isActive('tripleShot')).toBe(true);

    manager.clearActive();

    expect(manager.isActive('rapidFire')).toBe(false);
    expect(manager.isActive('doubleShot')).toBe(false);
    expect(manager.isActive('tripleShot')).toBe(false);
  });

  it('expires ribbon laser after 15 seconds', () => {
    const manager = new PowerUpManager();
    manager.activate('ribbonLaser');

    manager.update(14_999);
    expect(manager.isActive('ribbonLaser')).toBe(true);

    manager.update(1);
    expect(manager.isActive('ribbonLaser')).toBe(false);
  });

  it('stores up to three power-ups during boss fights', () => {
    const manager = new PowerUpManager();

    expect(manager.tryStore('rapidFire')).toBe(true);
    expect(manager.tryStore('doubleShot')).toBe(true);
    expect(manager.tryStore('shield')).toBe(true);
    expect(manager.tryStore('slowTime')).toBe(false);
    expect(manager.getStored()).toHaveLength(3);
  });
});
