const API_URL = 'http://localhost:5000/api/questions';

async function check() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const qcm = data.find(q => q.type === 'QCM');
        if (qcm) {
            console.log(JSON.stringify(qcm, null, 2));
        } else {
            console.log("No QCM question found");
        }
    } catch (e) {
        console.error(e);
    }
}

check();
