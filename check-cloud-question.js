const API_URL = 'http://localhost:5000/api/questions';

async function checkCloudQuestion() {
    try {
        const response = await fetch(API_URL);
        const questions = await response.json();

        const cloudQ = questions.find(q => q.label.includes('services cloud sont cités'));

        console.log('\n🔍 Question sur les services cloud:\n');

        if (cloudQ) {
            console.log(`Label: ${cloudQ.label}`);
            console.log(`Type: ${cloudQ.type}`);
            console.log(`Choices: ${JSON.stringify(cloudQ.choices, null, 2)}`);
            console.log(`Answer (raw): ${JSON.stringify(cloudQ.answer, null, 2)}`);
        } else {
            console.log('❌ Question non trouvée');
        }

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

checkCloudQuestion();
