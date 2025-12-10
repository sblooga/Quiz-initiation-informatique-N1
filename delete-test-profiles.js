// Script pour supprimer tous les profils de test
const API_URL = 'http://localhost:5000/api/students';

async function deleteAllProfiles() {
    try {
        // Récupérer tous les profils
        const response = await fetch(API_URL);
        const students = await response.json();

        console.log(`\n🗑️  Suppression de ${students.length} profil(s)...\n`);

        // Supprimer chaque profil
        for (const student of students) {
            console.log(`   Suppression de "${student.name}" (ID: ${student.id})...`);

            const deleteResponse = await fetch(`${API_URL}/${student.id}`, {
                method: 'DELETE'
            });

            if (deleteResponse.ok) {
                console.log(`   ✅ "${student.name}" supprimé`);
            } else {
                console.log(`   ❌ Échec de la suppression de "${student.name}"`);
            }
        }

        console.log('\n✅ Nettoyage terminé !');
        console.log('💡 Les scores associés ont également été supprimés (cascade delete)');

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

deleteAllProfiles();
