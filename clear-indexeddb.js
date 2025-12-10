// Script pour nettoyer IndexedDB (anciennes données de sessions)
// À exécuter dans la console du navigateur (F12)

async function clearIndexedDB() {
    try {
        // Ouvrir la base de données
        const dbName = 'quiz-n1';

        console.log('🧹 Nettoyage d\'IndexedDB...');

        // Supprimer toutes les sessions
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;

            if (db.objectStoreNames.contains('sessions')) {
                const transaction = db.transaction(['sessions'], 'readwrite');
                const store = transaction.objectStore('sessions');
                const clearRequest = store.clear();

                clearRequest.onsuccess = () => {
                    console.log('✅ Sessions supprimées d\'IndexedDB');
                    console.log('💡 Les scores sont maintenant stockés dans la base de données SQLite');
                };

                clearRequest.onerror = () => {
                    console.error('❌ Erreur lors de la suppression des sessions');
                };
            } else {
                console.log('ℹ️ Aucune table sessions trouvée dans IndexedDB');
            }

            db.close();
        };

        request.onerror = () => {
            console.error('❌ Impossible d\'ouvrir IndexedDB');
        };

    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

// Exécuter le nettoyage
clearIndexedDB();

console.log('');
console.log('📝 Instructions:');
console.log('1. Copiez tout ce script');
console.log('2. Ouvrez la console du navigateur (F12)');
console.log('3. Collez et appuyez sur Entrée');
console.log('4. Rechargez la page');
