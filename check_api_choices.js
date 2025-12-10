const API_URL = 'http://localhost:5000/api/questions';

async function check() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const qcm = data.filter(q => q.type === 'QCM');
        console.log(`Found ${qcm.length} QCM questions.`);

        const emptyChoices = qcm.filter(q => !q.choices || q.choices.length === 0);

        if (emptyChoices.length > 0) {
            console.log(`❌ Found ${emptyChoices.length} QCM questions with EMPTY choices!`);
            console.log(JSON.stringify(emptyChoices[0], null, 2));
        } else {
            console.log("✅ All QCM questions have choices.");
            // Print one to be sure
            if (qcm.length > 0) {
                console.log("Sample:", JSON.stringify(qcm[0].choices));
            }
        }

    } catch (e) {
        console.error(e);
    }
}

check();
