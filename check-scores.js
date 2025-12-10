// Script pour vérifier les scores/sessions dans la base de données
const API_URL = 'http://localhost:5000';

async function checkScores() {
    try {
        // Vérifier les profils
        const studentsResponse = await fetch(`${API_URL}/api/students`);
        const students = await studentsResponse.json();

        console.log('\n📊 État de la base de données:\n');
        console.log(`👤 Profils: ${students.length}`);

        // Essayer de récupérer les scores via différentes routes possibles
        console.log('\n🔍 Recherche des scores...\n');

        // Tester différentes routes API possibles
        const possibleRoutes = [
            '/api/scores',
            '/api/sessions',
            '/api/results'
        ];

        for (const route of possibleRoutes) {
            try {
                const response = await fetch(`${API_URL}${route}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ Route ${route} trouvée:`);
                    console.log(`   ${Array.isArray(data) ? data.length : 'N/A'} enregistrement(s)`);
                    if (Array.isArray(data) && data.length > 0) {
                        console.log('   Exemple:', JSON.stringify(data[0], null, 2).substring(0, 200));
                    }
                }
            } catch (e) {
                // Route n'existe pas
            }
        }

        console.log('\n💡 Les scores sont probablement stockés dans une table séparée');
        console.log('   qui n\'a pas été nettoyée avec les profils.');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkScores();
