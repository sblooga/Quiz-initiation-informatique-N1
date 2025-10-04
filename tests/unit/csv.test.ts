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

  it('détecte les points-virgules même avec des virgules dans les valeurs', () => {
    const semicolonCsv = [
      'ID;Type;Question;Choix;Réponse;Thème;RéférenceCours;MotCléRecherchePDF;PagePDF',
      '1;QCM;Quelle touche, pour copier?;Ctrl+C|Ctrl+V;Ctrl+C;Clavier;Chapitre 1;;10'
    ].join('\n');

    const { questions, errors } = parseCSV(semicolonCsv);
    expect(errors).toHaveLength(0);
    expect(questions).toHaveLength(1);
    expect(questions[0].choices).toEqual(['Ctrl+C', 'Ctrl+V']);
  });
});
