import fs from 'fs';
import csv from 'csv-parser';

const inputPath = './import_002_quiz_200_questions_with_header.csv';
const outputPath = './import_002_quiz_200_questions_with_header_backup.csv';

// D'abord, faire une sauvegarde
fs.copyFileSync(inputPath, outputPath);
console.log(`💾 Sauvegarde créée: ${outputPath}`);

const results: any[] = [];

console.log('\n📝 Lecture du CSV...');

fs.createReadStream(inputPath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
        // Vider le champ Leçon pour les questions 28 et 78
        if (data.QuestionID === '28' || data.QuestionID === '78') {
            const oldLesson = data.Leçon;
            data.Leçon = '';
            console.log(`  ✓ Q${data.QuestionID}: Leçon "${oldLesson}" → vide`);
        }
        results.push(data);
    })
    .on('end', () => {
        console.log(`\n✅ ${results.length} questions lues`);

        // Reconstruire le CSV manuellement
        const header = 'QuestionID;Type;Question;Choix;Réponse;Thème;RéférenceCours;MotCléRecherchePDF;Leçon;PagePDF;TexteRecherchePDF\n';

        const lines = results.map(row => {
            return [
                `"${row.QuestionID}"`,
                `"${row.Type}"`,
                `"${row.Question}"`,
                `"${row.Choix || ''}"`,
                `"${row.Réponse}"`,
                `"${row.Thème}"`,
                `"${row.RéférenceCours}"`,
                `"${row.MotCléRecherchePDF}"`,
                `"${row.Leçon || ''}"`,
                `"${row.PagePDF}"`,
                `"${row.TexteRecherchePDF}"`
            ].join(';');
        });

        const csvContent = header + lines.join('\n');

        fs.writeFileSync(inputPath, csvContent, 'utf-8');

        console.log(`\n💾 Fichier mis à jour: ${inputPath}`);
        console.log(`📊 Total: ${results.length} questions`);
        console.log('\n✅ Modifications appliquées:');
        console.log('  - Question 28: Champ Leçon vidé');
        console.log('  - Question 78: Champ Leçon vidé');
    })
    .on('error', (error) => {
        console.error('❌ Erreur:', error);
    });
