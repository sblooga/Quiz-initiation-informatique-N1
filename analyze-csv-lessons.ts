import fs from 'fs';
import csv from 'csv-parser';

const csvPath = './import_002_quiz_200_questions_with_header.csv';
const results: any[] = [];

fs.createReadStream(csvPath)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(`\n📊 Analyse de ${results.length} questions\n`);

        // Questions avec "Partie" au lieu de "Leçon"
        const partieQuestions = results.filter(q =>
            q.Leçon && q.Leçon.startsWith('Partie')
        );

        console.log(`❌ Questions avec "Partie" au lieu de "Leçon": ${partieQuestions.length}`);
        partieQuestions.forEach(q => {
            console.log(`  - Q${q.QuestionID}: "${q.Question.substring(0, 60)}..."`);
            console.log(`    Leçon actuelle: "${q.Leçon}"`);
            console.log(`    RéférenceCours: "${q.RéférenceCours}"`);
            console.log('');
        });

        // Questions où Leçon != RéférenceCours
        console.log('\n⚠️ Questions où Leçon ≠ RéférenceCours:');
        const mismatch = results.filter(q =>
            q.Leçon && q.RéférenceCours && q.Leçon !== q.RéférenceCours
        );

        console.log(`Total: ${mismatch.length} questions`);
        mismatch.slice(0, 10).forEach(q => {
            console.log(`  - Q${q.QuestionID}: "${q.Question.substring(0, 50)}..."`);
            console.log(`    Leçon: "${q.Leçon}"`);
            console.log(`    RéférenceCours: "${q.RéférenceCours}"`);
            console.log('');
        });

        if (mismatch.length > 10) {
            console.log(`  ... et ${mismatch.length - 10} autres\n`);
        }

        // Questions spécifiques problématiques
        console.log('\n🔍 Vérification des questions signalées:\n');

        const q13 = results.find(q => q.QuestionID === '13');
        const q35 = results.find(q => q.QuestionID === '35');
        const q78 = results.find(q => q.QuestionID === '78');
        const q166 = results.find(q => q.QuestionID === '166');

        [
            { id: 13, q: q13, expected: 'Leçon sur sécurité/mots de passe' },
            { id: 35, q: q35, expected: 'Leçon 020' },
            { id: 78, q: q78, expected: 'Leçon Explorateur Windows' },
            { id: 166, q: q166, expected: 'Vérifier page' }
        ].forEach(({ id, q, expected }) => {
            if (q) {
                console.log(`Question ${id}:`);
                console.log(`  Leçon: "${q.Leçon}"`);
                console.log(`  Page: ${q.PagePDF}`);
                console.log(`  Attendu: ${expected}`);
                console.log('');
            }
        });
    });
