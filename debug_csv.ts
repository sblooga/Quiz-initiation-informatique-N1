import fs from 'fs';
import csv from 'csv-parser';
import stream from 'node:stream';

const csvPath = './import_002_quiz_200_questions.csv';
const csvBuffer = fs.readFileSync(csvPath);
const questions: any[] = [];

const readable = stream.Readable.from(csvBuffer);

readable
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
        questions.push(data);
    })
    .on('end', () => {
        console.log(`Total questions parsed: ${questions.length}`);

        // Afficher les clés de la première question
        if (questions.length > 0) {
            console.log('\nKeys from first question:');
            console.log(Object.keys(questions[0]));

            console.log('\nFirst question data:');
            console.log(questions[0]);
        }

        // Afficher une question avec Leçon (ligne 101 = index 100)
        if (questions.length > 100) {
            console.log('\nQuestion 101 (index 100):');
            console.log(questions[100]);
            console.log('\nLeçon value:', questions[100].Leçon || questions[100]['Leçon'] || 'NOT FOUND');
        }
    })
    .on('error', (error) => {
        console.error('Error:', error);
    });
