// apps/frontend/src/pages/AdminImport.tsx

import axios from 'axios';
import React, { useCallback, useMemo, useState } from 'react';

// Mettez à jour ceci si l'URL de votre backend est différente
// Mettez à jour ceci si l'URL de votre backend est différente
const API_BASE = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api');
const API_URL = `${API_BASE}/questions/import`;

const SECURITY_CODE_EXPECTED = '00000'; // <-- REMPLACEZ PAR VOTRE VRAI CODE

const AdminImport: React.FC = () => {
    // État pour stocker le fichier sélectionné
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    // État pour le code de sécurité entré par l'utilisateur
    const [securityCode, setSecurityCode] = useState('');
    // États pour gérer l'interface utilisateur (chargement, messages)
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    // Gère la sélection du fichier par l'utilisateur
    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        // Le fichier est le premier élément de la liste 'files'
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    }, []);

    // Détermine si le bouton d'importation doit être désactivé
    const isImportDisabled = useMemo(() => {
        // Désactivé si : chargement en cours, pas de fichier, ou code incorrect
        return loading || !selectedFile || securityCode !== SECURITY_CODE_EXPECTED;
    }, [loading, selectedFile, securityCode]);

    // Gère la soumission du formulaire d'importation
    const handleImport = useCallback(async () => {
        if (!selectedFile || securityCode !== SECURITY_CODE_EXPECTED) {
            // Cette vérification ne devrait pas être atteinte si le bouton est désactivé
            return;
        }

        setLoading(true);
        setMessage('Importation en cours...');
        setIsError(false);

        try {
            // CRUCIAL : Création de l'objet FormData
            const formData = new FormData();

            // Les clés doivent correspondre EXACTEMENT à ce que multer attend sur le backend
            formData.append('quizFile', selectedFile);
            formData.append('securityCode', securityCode);

            // Requête POST avec FormData. Axios gère automatiquement
            // le Content-Type: multipart/form-data
            const response = await axios.post(API_URL, formData);

            setMessage(`✅ Importation réussie ! ${response.data.message || 'Données importées.'}`);
            setIsError(false);
            setSelectedFile(null); // Nettoyer le champ fichier après succès

        } catch (error: any) {
            console.error('Erreur lors de l\'importation :', error);
            setIsError(true);

            // Tente de récupérer un message d'erreur spécifique du backend
            const errorMessage = error.response?.data?.error || 'Erreur inconnue lors de l\'importation.';
            setMessage(`❌ Échec de l'importation : ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [selectedFile, securityCode]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h2>Importation de Questions (CSV)</h2>
            <p>Veuillez télécharger votre fichier CSV et entrer le code de sécurité.</p>

            <div style={{ marginBottom: '15px' }}>
                <label htmlFor="csv-file" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Sélectionner le Fichier CSV (séparateur point-virgule 😉) :
                </label>
                {/* L'attribut accept limite la sélection aux fichiers .csv */}
                <input
                    type="file"
                    id="csv-file"
                    accept=".csv"
                    onChange={handleFileChange}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                />
                {selectedFile && (
                    <p style={{ marginTop: '5px', fontSize: '14px', color: '#555' }}>
                        Fichier sélectionné : **{selectedFile.name}**
                    </p>
                )}
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="security-code" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Code de Sécurité :
                </label>
                <input
                    type="password"
                    id="security-code"
                    value={securityCode}
                    onChange={(e) => setSecurityCode(e.target.value)}
                    placeholder="Entrez le code secret"
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                />
                {securityCode && securityCode !== SECURITY_CODE_EXPECTED && (
                    <p style={{ color: 'red', marginTop: '5px' }}>Code incorrect.</p>
                )}
            </div>

            <button
                onClick={handleImport}
                disabled={isImportDisabled}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: isImportDisabled ? '#ccc' : '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isImportDisabled ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.3s',
                    width: '100%'
                }}
            >
                {loading ? 'Chargement...' : 'Importer les Questions'}
            </button>

            {/* Affichage du message de statut */}
            {message && (
                <div style={{
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '4px',
                    backgroundColor: isError ? '#fdd' : '#dfd',
                    border: `1px solid ${isError ? '#f00' : '#0f0'}`,
                    color: isError ? '#f00' : '#0a0',
                    fontWeight: 'bold'
                }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default AdminImport;
