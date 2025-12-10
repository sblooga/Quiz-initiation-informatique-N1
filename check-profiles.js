// Script pour vérifier les profils et scores dans la base de données
const API_URL = 'http://localhost:5000/api/students';

async function checkProfiles() {
    try {
        const response = await fetch(API_URL);
        const students = await response.json();

        console.log('\n📊 Profils dans la base de données:\n');
        console.log(`Total: ${students.length} profil(s)\n`);

        students.forEach(student => {
            console.log(`👤 ${student.name}`);
            console.log(`   ID: ${student.id}`);
            console.log(`   Photo: ${student.photo}`);
            console.log(`   Couleur: ${student.color}`);
            console.log('');
        });

        if (students.length > 0) {
            console.log('💡 Pour supprimer ces profils:');
            console.log('   Option 1: Supprimer via l\'interface web');
            console.log('   Option 2: Supprimer via l\'API DELETE /api/students/{id}');
            console.log('   Option 3: Réinitialiser la base de données');
        }

    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

checkProfiles();
