import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import pdfParse from 'pdf-parse';

const CSV_PATH = path.resolve('./import_quiz_100_questions.csv');
const PDF_PATH = path.resolve('./apps/frontend/public/cours.pdf');

interface Question {
    questionId: string;
    question: string;
    motCle: string;
    pageActuelle: string;
    searchText: string;
}

async function analyzePDF() {
    console.log('📂 Lecture du CSV...');
    const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
    const records = parse(csvContent, {
        columns: true,
        delimiter: ';',
        skip_empty_lines: true
    });

    console.log('📄 Lecture du PDF...');
    const pdfBuffer = fs.readFileSync(PDF_PATH);
    const pdfData = await pdfParse(pdfBuffer);

    console.log(`✅ PDF chargé : ${pdfData.numpages} pages\n`);

    // Extraire le texte de chaque page
    console.log('🔍 Extraction du texte par page...');
    const pageTexts: string[] = [];

    // pdf-parse ne donne pas le texte par page directement, on va utiliser une approche simple
    // On va diviser le texte total en estimant les pages
    const totalText = pdfData.text;
    const avgCharsPerPage = totalText.length / pdfData.numpages;

    for (let i = 0; i < pdfData.numpages; i++) {
        const start = Math.floor(i * avgCharsPerPage);
        const end = Math.floor((i + 1) * avgCharsPerPage);
        pageTexts.push(totalText.substring(start, end));
    }

    console.log('\n📊 Analyse des questions...\n');
    console.log('='.repeat(80));

    const suggestions: any[] = [];

    for (const record of records) {
        const questionId = record.QuestionID;
        const question = record.Question;
        const motCle = record.MotCléRecherchePDF || '';
        const pageActuelle = record.PagePDF || '';
        const searchText = record.TexteRecherchePDF || '';

        if (!pageActuelle) continue;

        // Chercher le mot-clé dans toutes les pages
        const foundPages: number[] = [];
        const searchTerms = [
            motCle,
            searchText,
            ...question.split(' ').filter(w => w.length > 5)
        ].filter(Boolean);

        for (let pageNum = 0; pageNum < pageTexts.length; pageNum++) {
            const pageText = pageTexts[pageNum].toLowerCase();

            for (const term of searchTerms) {
                if (term && pageText.includes(term.toLowerCase())) {
                    if (!foundPages.includes(pageNum + 1)) {
                        foundPages.push(pageNum + 1);
                    }
                    break;
                }
            }
        }

        const currentPage = parseInt(pageActuelle);
        const isCorrect = foundPages.includes(currentPage);

        suggestions.push({
            questionId,
            question: question.substring(0, 60) + '...',
            motCle,
            pageActuelle: currentPage,
            pagesTrouvées: foundPages.slice(0, 5),
            status: isCorrect ? '✅' : '❌',
            suggestion: foundPages.length > 0 ? foundPages[0] : currentPage
        });

        if (!isCorrect && foundPages.length > 0) {
            console.log(`❌ Q${questionId}: ${question.substring(0, 50)}...`);
            console.log(`   Page actuelle: ${currentPage}`);
            console.log(`   Pages trouvées: ${foundPages.join(', ')}`);
            console.log(`   Mot-clé: "${motCle}"`);
            console.log(`   → SUGGESTION: Page ${foundPages[0]}`);
            console.log('');
        }
    }

    console.log('='.repeat(80));
    console.log('\n📈 Résumé:');
    const correct = suggestions.filter(s => s.status === '✅').length;
    const incorrect = suggestions.filter(s => s.status === '❌').length;
    console.log(`✅ Correctes: ${correct}`);
    console.log(`❌ À corriger: ${incorrect}`);
    console.log(`📊 Total: ${suggestions.length}`);

    // Sauvegarder le rapport
    const reportPath = path.resolve('./pdf_analysis_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(suggestions, null, 2));
    console.log(`\n💾 Rapport sauvegardé: ${reportPath}`);
}

analyzePDF().catch(console.error);
