import { describe, it, expect } from 'vitest';
import { shuffle } from '../../apps/frontend/src/lib/random';

describe('shuffle', () => {
  it('est déterministe avec la seed', () => {
    const arr = [1,2,3,4];
    expect(shuffle(arr, 1)).toEqual(shuffle(arr, 1));
  });
});
