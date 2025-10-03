import { describe, it, expect } from 'vitest';
import { normalize } from '../../apps/frontend/src/lib/normalize';

describe('normalize', () => {
  it('supprime accents et casse', () => {
    expect(normalize('École')).toBe('ecole');
  });
});
