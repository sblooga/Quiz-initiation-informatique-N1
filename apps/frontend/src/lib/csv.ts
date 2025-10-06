import Papa from 'papaparse';
import { normalize } from './normalize';
import { Question } from './types';

const DIACRITICS_REGEX = new RegExp('[\u0300-\u036f]', 'g');

export function detectDelimiter(csv: string): string {
  const sampleLines = csv.split(/\r?\n/).slice(0, 5);
  let semicolons = 0;
  let commas = 0;

  for (const line of sampleLines) {
    semicolons += (line.match(/;/g) ?? []).length;
    commas += (line.match(/,/g) ?? []).length;
  }

  if (semicolons === 0 && commas === 0) {
    return ',';
  }

  return semicolons >= commas ? ';' : ',';
}

function normalizeHeaderKey(key: string): string {
  return key
    .replace(/^\ufeff/, '')
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

function normalizeValueKey(value: string): string {
  return value
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-z0-9]/g, '')
    .toLowerCase();
}

function resolveQuestionType(
  raw: string
): 'QCM' | 'Vrai/Faux' | 'Compléter' | 'Associer' | undefined {
  if (!raw) return undefined;
  const normalized = normalizeValueKey(raw);
  if (!normalized) return undefined;

  const has = (token: string) => normalized.includes(token);

  if (
    has('qcm') ||
    has('qcu') ||
    (has('choix') && (has('multiple') || has('unique')))
  ) {
    console.log('✅ Type détecté: QCM');
    return 'QCM';
  }

  if (
    has('vraifaux') ||
    has('vf') ||
    has('vraioufaux') ||
    (has('vrai') && has('faux'))
  ) {
    console.log('✅ Type détecté: Vrai/Faux');
    return 'Vrai/Faux';
  }

  if (
    has('completer') ||
    has('comple') ||
    has('lacune') ||
    has('texte') ||
    has('saisie')
  ) {
    console.log('✅ Type détecté: Compléter');
    return 'Compléter';
  }

  if (
    has('associer') ||
    has('assoc') ||
    has('appari') ||
    has('matching') ||
    has('relier')
  ) {
    console.log('✅ Type détecté: Associer');
    return 'Associer';
  }

  console.warn('⚠️ Type non reconnu après normalisation:', normalized);
  return undefined;
}

function buildLookup(
  row: Record<string, string | undefined>
): Record<string, string> {
  const lookup: Record<string, string> = {};

  for (const key of Object.keys(row)) {
    const normalizedKey = normalizeHeaderKey(key);
    if (!normalizedKey) continue;

    const value = row[key];
    if (value === undefined || value === null) continue;

    if (!(normalizedKey in lookup)) {
      lookup[normalizedKey] =
        typeof value === 'string' ? value.trim() : String(value);
    }
  }

  return lookup;
}

function getValue(
  lookup: Record<string, string>,
  ...candidates: string[]
): string | undefined {
  for (const candidate of candidates) {
    const normalizedCandidate = normalizeHeaderKey(candidate);
    const value = lookup[normalizedCandidate];
    if (value !== undefined && value !== '') {
      return value;
    }
  }
  return undefined;
}

function parsePairs(raw: string): Array<{ gauche: string; droite: string }> {
  return raw
    .split(/[|;]/)
    .map(entry => entry.split(/=|->|:/))
    .filter(parts => parts.length >= 2)
    .map(([left, right]) => ({ gauche: left.trim(), droite: right.trim() }))
    .filter(pair => pair.gauche && pair.droite);
}

export function parseCSV(csv: string): {
  questions: Question[];
  errors: string[];
} {
  const delimiter = detectDelimiter(csv);
  const { data } = Papa.parse<Record<string, string | undefined>>(csv, {
    delimiter,
    header: true,
    skipEmptyLines: 'greedy'
  });
  const questions: Question[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    try {
      const lookup = buildLookup(row);
      const questionType = resolveQuestionType(
        getValue(lookup, 'Type', 'QuestionType') ?? ''
      );
      if (!questionType) throw new Error('Type inconnu');

      const questionText = getValue(lookup, 'Question', 'Enonce', 'Texte');
      if (!questionText) throw new Error('Question manquante');

      const base = {
        id: getValue(lookup, 'ID', 'Identifiant') ?? `${index + 1}`,
        type: questionType,
        question: questionText,
        theme: getValue(lookup, 'Theme', 'Thème', 'Categorie'),
        referenceCours: getValue(lookup, 'ReferenceCours', 'Cours'),
        motClePDF: getValue(lookup, 'MotCleRecherchePDF', 'MotClePDF') ?? undefined,
        pagePDF: Number(getValue(lookup, 'PagePDF', 'Page')) || undefined
      };

      if (!base.id || !base.type || !base.question) throw new Error('Champ manquant');

      switch (questionType) {
        case 'QCM': {
          const rawChoices =
            getValue(lookup, 'Choix', 'Options', 'Reponses') ?? '';
          const choices = rawChoices
            .split(/[|;]/)
            .map(choice => choice.trim())
            .filter(Boolean);
          if (!choices.length) throw new Error('Choix manquants');

          const rawAnswer = getValue(lookup, 'Reponse', 'Answer') ?? '';
          const answerParts = rawAnswer
            .split(/[|;]/)
            .map(part => part.trim())
            .filter(Boolean);
          if (!answerParts.length) throw new Error('Réponse QCM manquante');

          questions.push({
            ...base,
            choices,
            answer: answerParts.length > 1 ? answerParts : answerParts[0]
          });
          break;
        }
        case 'Vrai/Faux': {
          const answerRaw = getValue(lookup, 'Reponse', 'Answer')?.trim();
          if (!answerRaw) throw new Error('Réponse Vrai/Faux manquante');
          const normalizedAnswer = normalize(answerRaw);
          const normalizedTrue = normalize('Vrai');
          const normalizedFalse = normalize('Faux');
          if (normalizedAnswer !== normalizedTrue && normalizedAnswer !== normalizedFalse) {
            throw new Error('Réponse Vrai/Faux incorrecte');
          }
          questions.push({
            ...base,
            answer: normalizedAnswer === normalizedTrue ? 'Vrai' : 'Faux'
          });
          break;
        }
        case 'Compléter': {
          const answerRaw = getValue(lookup, 'Reponse', 'Answer') ?? '';
          const answers = answerRaw
            .split(/[|;]/)
            .map(ans => ans.trim())
            .filter(Boolean);
          if (!answers.length) throw new Error('Réponse manquante');
          questions.push({
            ...base,
            answer: answers.length > 1 ? answers : answers[0]
          });
          break;
        }
        case 'Associer': {
          const pairsSource =
            getValue(lookup, 'Choix', 'Pairs', 'Associations') ??
            getValue(lookup, 'Reponse', 'Answer') ??
            '';
          const pairs = parsePairs(pairsSource);
          if (!pairs.length) throw new Error('Paires manquantes');
          questions.push({
            ...base,
            pairs
          });
          break;
        }
        default:
          throw new Error('Type inconnu');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Ligne ${index + 2}: ${message}`);
    }
  });

  return { questions, errors };
}
