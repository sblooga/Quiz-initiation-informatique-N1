// Script pour vérifier les questions problématiques
const API_URL = 'http://localhost:5000/api/questions';

async function checkProblematicQuestions() {
    try {
        const response = await fetch(API_URL);
        const questions = await response.json();

        // Question 28 - Raccourci Couper
        const q28 = questions.find(q => q.label.includes('Le raccourci clavier pour Couper'));

        // Question 78 - Shift + clic droit
        const q78 = questions.find(q => q.label.includes('Shift + clic droit'));

        console.log('\n🔍 Vérification des questions problématiques\n');

        if (q28) {
            console.log('Question 28 (Raccourci Couper):');
            console.log(`  ID: ${q28.id}`);
            console.log(`  Lesson: "${q28.meta.lesson}"`);
            console.log(`  Page PDF: ${q28.meta.pdfPage}`);
            console.log(`  Search Text: "${q28.meta.pdfSearchText}"`);
            console.log('');
        }

        if (q78) {
            console.log('Question 78 (Shift + clic droit):');
            console.log(`  ID: ${q78.id}`);
            console.log(`  Lesson: "${q78.meta.lesson}"`);
            console.log(`  Page PDF: ${q78.meta.pdfPage}`);
            console.log(`  Search Text: "${q78.meta.pdfSearchText}"`);
            console.log('');
        }

        console.log('📝 Notes:');
        console.log('- Si lesson est présent, le PDF cherchera ce texte exact');
        console.log('- Si le texte n\'existe pas exactement dans le PDF, la recherche échouera');
        console.log('- Vérifiez que le PDF contient bien ces textes de leçon');

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

checkProblematicQuestions();
