import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';

const CSV_PATH = path.resolve('./import_002_quiz_200_questions_fixed.csv');
const API_URL = 'http://127.0.0.1:5000/api/questions/import';

async function importQuestions() {
    try {
        const form = new FormData();
        form.append('quizFile', fs.createReadStream(CSV_PATH));

        console.log(`Uploading ${CSV_PATH} to ${API_URL}...`);

        const response = await axios.post(API_URL, form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('✅ Import successful:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        console.error('❌ Import failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
        process.exit(1);
    }
}

importQuestions();
