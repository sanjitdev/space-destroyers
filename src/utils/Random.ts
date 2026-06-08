export const randomBetween = (min: number, max: number): number => min + Math.random() * (max - min);

export const randomInt = (min: number, max: number): number => Math.floor(randomBetween(min, max + 1));

export const chance = (probability: number): boolean => Math.random() < probability;

export const pickOne = <T>(items: readonly T[]): T => items[randomInt(0, items.length - 1)];

export const pickWeighted = <T>(items: Array<{ value: T; weight: number }>): T => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * total;

  for (const item of items) {
    threshold -= item.weight;
    if (threshold <= 0) {
      return item.value;
    }
  }

  return items[items.length - 1].value;
};
