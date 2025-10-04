import Papa from 'papaparse';
import { Question } from './types';
import { normalize } from './normalize';

export function detectDelimiter(csv: string): string {
  const firstLine = csv.split(/\r?\n/, 1)[0] ?? '';
  const commaCount = (firstLine.match(/,/g) ?? []).length;
  const semicolonCount = (firstLine.match(/;/g) ?? []).length;

  if (semicolonCount > commaCount) return ';';
  if (commaCount > semicolonCount) return ',';
  if (semicolonCount > 0) return ';';
  return ',';
}

export function parseCSV(csv: string): { questions: Question[]; errors: string[] } {
  const delimiter = detectDelimiter(csv);
  const { data } = Papa.parse<Record<string, string>>(csv, {
    delimiter,
    header: true,
    skipEmptyLines: true
  });
  const questions: Question[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    try {
      const base = {
        id: row['ID'],
        type: row['Type'] as any,
        question: row['Question'],
        theme: row['Thème'],
        referenceCours: row['RéférenceCours'],
        motClePDF: row['MotCléRecherchePDF'] || undefined,
        pagePDF: row['PagePDF'] ? Number(row['PagePDF']) : undefined
      };
      if (!base.id || !base.type || !base.question) throw new Error('Champ manquant');
      switch (base.type) {
        case 'QCM': {
          const choices = (row['Choix'] || '').split(/[|;]/).map(c => c.trim()).filter(Boolean);
          const answerParts = (row['Réponse'] || '').split(/[|;]/).map(a => a.trim()).filter(Boolean);
          questions.push({ ...base, choices, answer: answerParts.length > 1 ? answerParts : answerParts[0] });
          break;
        }
        case 'Vrai/Faux': {
          const ans = row['Réponse']?.trim();
          if (ans !== 'Vrai' && ans !== 'Faux') throw new Error('Réponse Vrai/Faux incorrecte');
          questions.push({ ...base, answer: ans });
          break;
        }
        case 'Compléter': {
          const ans = (row['Réponse'] || '').split(/[|;]/).map(a => a.trim());
          questions.push({ ...base, answer: ans.length > 1 ? ans : ans[0] });
          break;
        }
        case 'Associer': {
          const pairs = (row['Choix'] || '').split(/[|;]/).map(p => p.split('='))
            .filter(p => p.length === 2)
            .map(([gauche, droite]) => ({ gauche: gauche.trim(), droite: droite.trim() }));
          questions.push({ ...base, pairs });
          break;
        }
        default:
          throw new Error('Type inconnu');
      }
    } catch (e: any) {
      errors.push(`Ligne ${index + 2}: ${e.message}`);
    }
  });

  return { questions, errors };
}
