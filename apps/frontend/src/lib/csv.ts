import Papa from "papaparse";
import { normalize } from "./normalize";
import { Question } from "./types";

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

// 🔹 Normalisation des valeurs
function normalizeValueKey(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^\w]/g, "")
    .toLowerCase()
    .trim();

}

// 🔹 Normalisation des en-têtes CSV
function normalizeHeaderKey(key: string): string {
  return key
    .replace(/^\ufeff/, '')
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toLowerCase();
}

// 🔹 Détection du type de question
function resolveQuestionType(
  raw: string | undefined
): "QCM" | "Vrai/Faux" | "Compléter" | "Associer" | undefined {
  if (!raw) return undefined;
  const normalized = normalizeValueKey(raw);
  const has = (t: string) => normalized.includes(t);

  if (
    has("qcm") ||
    has("qcu") ||
    (has("choix") && (has("multiple") || has("unique")))
  )
    return "QCM";

  if (
    has("vraifaux") ||
    has("vf") ||
    has("vraioufaux") ||
    (has("vrai") && has("faux")) ||
    has("vraiaux")
  )
    return "Vrai/Faux";

  if (
    has("completer") ||
    has("ompleter") ||
    has("texte") ||
    has("saisie") ||
    has("lacune")
  )
    return "Compléter";

  if (
    has("associer") ||
    has("assoc") ||
    has("appari") ||
    has("matching") ||
    has("relier")
  )
    return "Associer";

  return undefined;
}

// 🔹 Détection du délimiteur
export function detectDelimiter(csv: string): string {
  const lines = csv.split(/\r?\n/).slice(0, 5);
  let semicolons = 0,
    commas = 0;
  for (const line of lines) {
    semicolons += (line.match(/;/g) ?? []).length;
    commas += (line.match(/,/g) ?? []).length;
  }
  if (semicolons === 0 && commas === 0) return ",";
  return semicolons >= commas ? ";" : ",";
}

// 🔹 Conversion clé/valeur des lignes CSV
function buildLookup(
  row: Record<string, string | undefined>
): Record<string, string> {
  const lookup: Record<string, string> = {};
  for (const key of Object.keys(row)) {
    const normalizedKey = normalizeHeaderKey(key);
    if (!normalizedKey) continue;
    const value = row[key];
    if (value !== undefined && value !== null && value !== "")
      lookup[normalizedKey] = String(value).trim();
  }
  return lookup;
}

function getValue(
  lookup: Record<string, string>,
  ...candidates: string[]
): string | undefined {
  for (const c of candidates) {
    const normalized = normalizeHeaderKey(c);
    const val = lookup[normalized];
    if (val !== undefined && val !== "") return val;
  }
  return undefined;
}

// 🔹 Parsing des paires “Associer”
function parsePairs(raw: string): Array<{ gauche: string; droite: string }> {
  return raw
    .split(/[|;]/)
    .map((e) => e.split(/=|->|:/))
    .filter((p) => p.length >= 2)
    .map(([gauche, droite]) => ({
      gauche: gauche.trim(),
      droite: droite.trim(),
    }))
    .filter((p) => p.gauche && p.droite);
}

// 🔹 Parsing complet du CSV
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
      const id = getValue(lookup, "ID", "Id")?.trim();
      const typeRaw = getValue(lookup, "Type", "QuestionType")?.trim();
      const questionText = getValue(lookup, "Question", "Intitulé")?.trim();

      if (!id || !typeRaw || !questionText) throw new Error("Champ manquant");

      const type = resolveQuestionType(typeRaw);
      if (!type) throw new Error(`Type inconnu (${typeRaw})`);

      const base = {
        id,
        type,
        question: questionText,
        theme: getValue(lookup, "Theme", "Thème") ?? "",
        referenceCours:
          getValue(lookup, "ReferenceCours", "RéférenceCours") ?? "",
        motClePDF:
          getValue(lookup, "MotClePDF", "MotCléRecherchePDF") ?? undefined,
        pagePDF: Number(getValue(lookup, "PagePDF", "Page")),
      };

      switch (type) {
        case "QCM": {
          const choices = (getValue(lookup, "Choix", "Options") ?? "")
            .split(/[|;]/)
            .map((s) => s.trim())
            .filter(Boolean);
          const answers = (getValue(lookup, "Reponse", "Answer") ?? "")
            .split(/[|;]/)
            .map((s) => s.trim())
            .filter(Boolean);
          questions.push({
            ...base,
            choices,
            answer: answers.length > 1 ? answers : answers[0],
          });
          break;
        }
        case "Vrai/Faux": {
          const rawAnswer = getValue(lookup, "Reponse", "Answer")?.trim() ?? "";
          const normalized = normalize(rawAnswer);
          if (!normalized.match(/^(vrai|faux)$/i))
            throw new Error("Réponse Vrai/Faux incorrecte");
          questions.push({
            ...base,
            answer: normalized === "vrai" ? "Vrai" : "Faux",
          });
          break;
        }
        case "Compléter": {
          const answers = (getValue(lookup, "Reponse", "Answer") ?? "")
            .split(/[|;]/)
            .map((a) => a.trim())
            .filter(Boolean);
          if (!answers.length) throw new Error("Réponse manquante");
          questions.push({
            ...base,
            answer: answers.length > 1 ? answers : answers[0],
          });
          break;
        }
        case "Associer": {
          const pairsRaw =
            getValue(lookup, "Choix", "Pairs", "Associations", "Reponse") ?? "";
          const pairs = parsePairs(pairsRaw);
          if (!pairs.length) throw new Error("Paires manquantes");
          questions.push({ ...base, pairs });
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
