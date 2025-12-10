// Script pour vérifier les données d'une question spécifique
const API_URL = 'http://localhost:5000/api/questions';

async function checkQuestion() {
    try {
        const response = await fetch(API_URL);
        const questions = await response.json();

        console.log(`Total questions: ${questions.length}`);

        // Chercher la question sur Macrium Reflect
        const macriumQuestions = questions.filter(q =>
            q.label.includes('Macrium Reflect') ||
            (q.meta.lesson && q.meta.lesson.includes('Macrium'))
        );

        console.log(`\nQuestions Macrium trouvées: ${macriumQuestions.length}`);

        macriumQuestions.forEach(q => {
            console.log('\n---');
            console.log(`ID: ${q.id}`);
            console.log(`Question: ${q.label.substring(0, 80)}...`);
            console.log(`Lesson: ${q.meta.lesson || 'VIDE'}`);
            console.log(`Page PDF: ${q.meta.pdfPage || 'VIDE'}`);
            console.log(`Search Text: ${q.meta.pdfSearchText || 'VIDE'}`);
        });

        // Statistiques générales
        const withLesson = questions.filter(q => q.meta.lesson);
        const withPage = questions.filter(q => q.meta.pdfPage);
        const withSearch = questions.filter(q => q.meta.pdfSearchText);

        console.log('\n=== STATISTIQUES ===');
        console.log(`Questions avec lesson: ${withLesson.length}`);
        console.log(`Questions avec pdfPage: ${withPage.length}`);
        console.log(`Questions avec pdfSearchText: ${withSearch.length}`);

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

checkQuestion();
