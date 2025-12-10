import fs from 'fs';

const inputPath = './import_002_quiz_200_questions_with_header.csv';
const outputPath = './import_002_quiz_200_questions_fixed.csv';

// Lire le fichier
let content = fs.readFileSync(inputPath, 'utf-8');

// Remplacer ;; par ;""; (champ vide avec guillemets)
// On doit faire attention à ne pas remplacer les ;; qui sont déjà entre guillemets
content = content.replace(/;;/g, ';"";');

// Écrire le fichier corrigé
fs.writeFileSync(outputPath, content, 'utf-8');

console.log(`✅ Fichier corrigé créé: ${outputPath}`);
console.log(`   Les champs vides ;; ont été remplacés par ;"";`);
