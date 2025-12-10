import fs from 'fs';

const csvPath = './import_002_quiz_200_questions.csv';
const outputPath = './import_002_quiz_200_questions_with_header.csv';

// En-tête attendu
const header = 'QuestionID;Type;Question;Choix;Réponse;Thème;RéférenceCours;MotCléRecherchePDF;Leçon;PagePDF;TexteRecherchePDF\n';

// Lire le fichier existant
const content = fs.readFileSync(csvPath, 'utf-8');

// Ajouter l'en-tête
const newContent = header + content;

// Écrire le nouveau fichier
fs.writeFileSync(outputPath, newContent, 'utf-8');

console.log(`✅ Fichier créé avec en-tête: ${outputPath}`);
console.log(`   Lignes totales: ${newContent.split('\n').length}`);
