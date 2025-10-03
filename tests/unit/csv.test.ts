import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { parseCSV } from '../../apps/frontend/src/lib/csv';

const sample = fs.readFileSync('tools/sample-questions.csv', 'utf8');

describe('parseCSV', () => {
  it('parse correctement', () => {
    const { questions, errors } = parseCSV(sample);
    expect(errors.length).toBe(0);
    expect(questions.length).toBeGreaterThan(0);
  });
});
