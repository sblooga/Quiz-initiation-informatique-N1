import Papa from 'papaparse';

export type CsvQuestionRow = {
  QuestionID?: string;
  Type?: 'QCM' | 'VraiFaux' | 'Compléter' | string;
  Question?: string;
  Choix?: string;                 // "A|B|C|D" ou vide
  Réponse?: string;               // texte libre, "Vrai"/"Faux", etc.
  Thème?: string;
  RéférenceCours?: string;
  MotCléRecherchePDF?: string;
  Leçon?: string;
  PagePDF?: string | number;
  TexteRecherchePDF?: string;
};

// Charge un File et parse en objets (en-têtes du CSV conservées)
export function parseCsvFile(file: File): Promise<CsvQuestionRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CsvQuestionRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (val) => (typeof val === 'string' ? val.trim() : val),
      encoding: 'utf-8',
      delimiter: ';', // votre fichier est en ';' (détecté)
      complete: (res) => {
        if (res.errors?.length) {
          return reject(new Error('Erreur de parsing CSV: ' + res.errors[0].message));
        }
        resolve((res.data || []).map(normalizeRow));
      },
      error: (err) => reject(err),
    });
  });
}

// Normalise des valeurs (supprime espaces, BOM résiduel, etc.)
function normalizeRow(r: CsvQuestionRow): CsvQuestionRow {
  const clean = (v?: string) => (v ?? '').replace(/\uFEFF/g, '').trim();
  return {
    QuestionID: clean(r.QuestionID),
    Type: clean(r.Type) as any,
    Question: clean(r.Question),
    Choix: clean(r.Choix),
    Réponse: clean(r.Réponse),
    Thème: clean(r.Thème),
    RéférenceCours: clean(r.RéférenceCours),
    MotCléRecherchePDF: clean(r.MotCléRecherchePDF),
    Leçon: clean(r.Leçon),
    PagePDF: clean(String(r.PagePDF ?? '')),
    TexteRecherchePDF: clean(r.TexteRecherchePDF),
  };
}

// Validation légère + normalisation Type si besoin
export function validateCsvRows(rows: CsvQuestionRow[]): { rows: CsvQuestionRow[]; warnings: string[] } {
  const warnings: string[] = [];
  const out = rows.map((r, i) => {
    const rowNum = i + 2; // +1 en-tête, +1 index→ligne humaine
    const q = { ...r };

    // Champs obligatoires minimaux
    if (!q.Question || q.Question.length < 3) warnings.push(`Ligne ${rowNum}: Question vide ou trop courte.`);
    if (!q.Type) {
      // Heuristique : si Réponse ∈ {Vrai,Faux} et Choix vide → VraiFaux
      if (!q.Choix && ['vrai', 'faux'].includes((q.Réponse || '').toLowerCase())) {
        q.Type = 'VraiFaux';
      } else {
        q.Type = 'QCM';
        warnings.push(`Ligne ${rowNum}: Type manquant → forcé à "QCM".`);
      }
    }

    // PagePDF → nombre optionnel
    if (q.PagePDF !== undefined && q.PagePDF !== '') {
      const n = parseInt(String(q.PagePDF), 10);
      if (!Number.isFinite(n)) warnings.push(`Ligne ${rowNum}: PagePDF non numérique (« ${q.PagePDF} »).`);
      q.PagePDF = String(Number.isFinite(n) ? n : '');
    }

    return q;
  });

  return { rows: out, warnings };
}

// Construit le payload pour le backend (clés conservées)
export function buildImportPayload(rows: CsvQuestionRow[]): { questions: CsvQuestionRow[] } {
  // On renvoie EXACTEMENT les mêmes clés que le CSV (backend fait le mapping/normalisation)
  return { questions: rows };
}
