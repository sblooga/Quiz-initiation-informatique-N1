const API_URL = 'http://localhost:5000/api/questions';

async function check() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        if (data.length > 0) {
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log("No questions found");
        }
    } catch (e) {
        console.error(e);
    }
}

check();
