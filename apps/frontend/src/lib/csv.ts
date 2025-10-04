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
=======
import Papa from "papaparse";
import { normalize } from "./normalize";
import { Question } from "./types";

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

export function detectDelimiter(csv: string): string {
  const sampleLines = csv.split(/\r?\n/).slice(0, 5);
  let semicolons = 0;
  let commas = 0;

  for (const line of sampleLines) {
    semicolons += (line.match(/;/g) ?? []).length;
    commas += (line.match(/,/g) ?? []).length;
  }

  if (semicolons === 0 && commas === 0) {
    return ",";
  }

  return semicolons >= commas ? ";" : ",";

}

function normalizeHeaderKey(key: string): string {
  return key
    .replace(/^\ufeff/, "")
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function normalizeValueKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9]/g, "")
    .toLowerCase();
}

function resolveQuestionType(
  raw: string
): "QCM" | "Vrai/Faux" | "Compléter" | "Associer" | undefined {
  if (!raw) return undefined;
  const normalized = normalizeValueKey(raw); // ex: "Vrai/Faux" → "vraifaux", "Compléter" → "completer"
  if (!normalized) return undefined;

  const has = (token: string) => normalized.includes(token);

  // 🔹 Détection QCM (choix multiples)
  if (
    has("qcm") ||
    has("qcu") ||
    (has("choix") && (has("multiple") || has("unique")))
  ) {
    console.log("✅ Type détecté: QCM");
    return "QCM";
  }

  // 🔹 Détection Vrai/Faux (questions booléennes)
  if (
    has("vraifaux") ||
    has("vf") ||
    has("vraioufaux") ||
    (has("vrai") && has("faux"))
  ) {
    console.log("✅ Type détecté: Vrai/Faux");
    return "Vrai/Faux";
  }

  // 🔹 Détection Compléter (réponse libre)
  if (
    has("completer") ||
    has("comple") ||
    has("lacune") ||
    has("texte") ||
    has("saisie")
  ) {
    console.log("✅ Type détecté: Compléter");
    return "Compléter";
  }

  // 🔹 Détection Associer (appariement)
  if (
    has("associer") ||
    has("assoc") ||
    has("appari") ||
    has("matching") ||
    has("relier")
  ) {
    console.log("✅ Type détecté: Associer");
    return "Associer";
  }

  console.warn("⚠️ Type non reconnu après normalisation:", normalized);
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
        typeof value === "string" ? value.trim() : String(value);
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
    if (value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
}

function parsePairs(raw: string): Array<{ gauche: string; droite: string }> {
  return raw
    .split(/[|;]/)
    .map((entry) => entry.split(/=|->|:/))
    .filter((parts) => parts.length >= 2)
    .map(([left, right]) => ({ gauche: left.trim(), droite: right.trim() }))
    .filter((pair) => pair.gauche && pair.droite);
}

export function parseCSV(csv: string): {
  questions: Question[];
  errors: string[];
} {
  const delimiter = detectDelimiter(csv);
  const { data } = Papa.parse<Record<string, string | undefined>>(csv, {
    delimiter,
    header: true,
    skipEmptyLines: "greedy",
  });
  const questions: Question[] = [];
  const errors: string[] = [];

  data.forEach((row, index) => {
    try {
<<<<<<< HEAD
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
        case "Vrai/Faux": {
          const answerRaw = getValue(lookup, "Reponse", "Answer")?.trim();
          if (!answerRaw) throw new Error("Reponse Vrai/Faux manquante");
          const normalizedAnswer = normalize(answerRaw);
          if (
            normalizedAnswer !== normalize("Vrai") &&
            normalizedAnswer !== normalize("Faux")
          ) {
            throw new Error("Reponse Vrai/Faux incorrecte");
          }
          questions.push({
            ...base,
            type: questionType,
            answer: normalizedAnswer === normalize("Vrai") ? "Vrai" : "Faux",
          });
          break;
        }
        case "Compléter": {
          const answerRaw = getValue(lookup, "Reponse", "Answer") ?? "";
          const answers = answerRaw
            .split(/[|;]/)
            .map((ans) => ans.trim())
            .filter(Boolean);
          if (!answers.length) throw new Error("Reponse manquante");
          questions.push({
            ...base,
            type: questionType,
            answer: answers.length > 1 ? answers : answers[0],
          });
          break;
        }
        case "Associer": {
          const pairsSource =
            getValue(lookup, "Choix", "Pairs", "Associations") ??
            getValue(lookup, "Reponse", "Answer") ??
            "";
          const pairs = parsePairs(pairsSource);
          if (!pairs.length) throw new Error("Paires manquantes");
          questions.push({
            ...base,
            type: questionType,
            pairs,
          });
          break;
        }
        default:
          throw new Error("Type inconnu");
      }
    } catch (e: any) {
      errors.push(`Ligne ${index + 2}: ${e.message}`);
    }
  });

  return { questions, errors };
}
