const API_URL = 'http://localhost:5000/api/questions';

async function checkQuestions() {
    try {
        const response = await fetch(API_URL);
        const questions = await response.json();

        // Question 1: Réseaux sociaux - informations à ne pas publier
        const q1 = questions.find(q => q.label.includes('quelles informations ne doivent jamais être publiées'));

        // Question 2: Virus informatique
        const q2 = questions.find(q => q.label.includes('Quels moyens sont souvent utilisés pour transmettre un virus'));

        // Question 3: Réseaux sociaux - comportements à risque
        const q3 = questions.find(q => q.label.includes('quels comportements augmentent les risques en ligne'));

        // Question 4: Signes d'infection
        const q4 = questions.find(q => q.label.includes('Quels signes peuvent montrer que l\'ordinateur est infecté'));

        console.log('\n🔍 Vérification des questions problématiques\n');

        if (q1) {
            console.log('Q1 - Informations à ne pas publier:');
            console.log(`  Label: ${q1.label}`);
            console.log(`  Choices: ${JSON.stringify(q1.choices)}`);
            console.log(`  Answer: ${JSON.stringify(q1.answer)}`);
            console.log('');
        }

        if (q2) {
            console.log('Q2 - Moyens de transmission virus:');
            console.log(`  Label: ${q2.label}`);
            console.log(`  Choices: ${JSON.stringify(q2.choices)}`);
            console.log(`  Answer: ${JSON.stringify(q2.answer)}`);
            console.log('');
        }

        if (q3) {
            console.log('Q3 - Comportements à risque:');
            console.log(`  Label: ${q3.label}`);
            console.log(`  Choices: ${JSON.stringify(q3.choices)}`);
            console.log(`  Answer: ${JSON.stringify(q3.answer)}`);
            console.log('');
        }

        if (q4) {
            console.log('Q4 - Signes d\'infection:');
            console.log(`  Label: ${q4.label}`);
            console.log(`  Choices: ${JSON.stringify(q4.choices)}`);
            console.log(`  Answer: ${JSON.stringify(q4.answer)}`);
            console.log('');
        }

    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

checkQuestions();
