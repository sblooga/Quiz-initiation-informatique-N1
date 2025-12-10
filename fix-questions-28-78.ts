import fs from 'fs';

const inputPath = './import_002_quiz_200_questions_with_header.csv';
const outputPath = './import_002_quiz_200_questions_with_header.csv';

console.log('📝 Lecture du CSV...');

const content = fs.readFileSync(inputPath, 'utf-8');
const lines = content.split('\n');

let modifiedCount = 0;

const modifiedLines = lines.map((line, index) => {
    // Ignorer l'en-tête (ligne 0)
    if (index === 0) return line;

    // Vérifier si c'est la question 28 ou 78
    if (line.startsWith('"28";') || line.startsWith('"78";')) {
        // Parser la ligne CSV
        const parts = line.split('";');

        if (parts.length >= 11) {
            const questionId = parts[0].replace('"', '');
            const oldLesson = parts[8].replace(/^"/, '');

            // Vider le champ Leçon (index 8)
            parts[8] = '""';

            console.log(`  ✓ Q${questionId}: Leçon "${oldLesson}" → vide`);
            modifiedCount++;

            return parts.join('";');
        }
    }

    return line;
});

fs.writeFileSync(outputPath, modifiedLines.join('\n'), 'utf-8');

console.log(`\n✅ Modifications terminées: ${modifiedCount} questions modifiées`);
console.log(`💾 Fichier sauvegardé: ${outputPath}`);
console.log('\n📋 Résumé:');
console.log('  - Question 28: Champ Leçon vidé → utilisera page 15');
console.log('  - Question 78: Champ Leçon vidé → utilisera page 52');
console.log('\n🔄 Lancement automatique de la correction et de l\'import...');
