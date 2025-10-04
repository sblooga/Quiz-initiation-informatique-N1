import Papa from 'papaparse';
import { Question } from './types';

const DIACRITICS_REGEX = /\p{Diacritic}/gu;

function normalizeValueKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^\w]/g, '')
    .toLowerCase()
    .trim();
}

function resolveQuestionType(raw: string | undefined): 'QCM' | 'Vrai/Faux' | 'Compléter' | 'Associer' | undefined {
  if (!raw) return undefined;
  const normalized = normalizeValueKey(raw);
  if (!normalized) return undefined;

  const has = (token: string) => normalized.includes(token);

  if (has('qcm') || has('qcu') || (has('choix') && (has('multiple') || has('unique')))) {
    console.log('✅ Type detected: QCM');
    return 'QCM';
  }

  if (has('vraifaux') || has('vf') || has('vraioufaux') || (has('vrai') && has('faux')) || has('vraiaux')) {
    console.log('✅ Type detected: Vrai/Faux');
    return 'Vrai/Faux';
  }

  if (has('completer') || has('ompleter') || has('texte') || has('saisie') || has('lacune')) {
    console.log('✅ Type detected: Compléter');
    return 'Compléter';
  }

  if (has('associer') || has('assoc') || has('appari') || has('matching') || has('relier')) {
    console.log('✅ Type detected: Associer');
    return 'Associer';
  }

  console.warn('⚠️ Unrecognized type after normalization:', normalized);
  return undefined;
}

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
      const resolvedType = resolveQuestionType(row['Type']);
      if (!resolvedType) throw new Error('Type inconnu');

      const base = {
        id: row['ID'],
        type: resolvedType,
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
