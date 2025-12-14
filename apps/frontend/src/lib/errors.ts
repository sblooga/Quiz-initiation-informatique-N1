import axios from 'axios';

/**
 * Transforme une erreur technique en message convivial pour l'utilisateur.
 * @param error L'erreur capturée (unknown)
 * @returns Un message d'erreur en français
 */
export function getFriendlyErrorMessage(error: unknown): string {
    if (!error) return 'Une erreur inconnue est survenue.';

    // Gestion des erreurs Axios
    if (axios.isAxiosError(error)) {
        // Pas de réponse du serveur (réseau, serveur éteint...)
        if (!error.response) {
            return 'Impossible de contacter le serveur. Vérifiez votre connexion internet ou réessayez plus tard.';
        }

        const status = error.response.status;
        const data = error.response.data as any;

        // Si le backend renvoie un message 'detail' explicite, on l'utilise en priorité
        if (data && data.detail) {
            return data.detail;
        }

        // Sinon, on utilise des messages par défaut selon le code HTTP
        switch (status) {
            case 400:
                return 'La demande est invalide. Veuillez vérifier les informations saisies.';
            case 401:
                return 'Accès refusé. Veuillez vérifier votre code de sécurité.';
            case 403:
                return 'Vous n\'avez pas les droits nécessaires pour effectuer cette action.';
            case 404:
                return 'La ressource demandée est introuvable.';
            case 413:
                return 'Le fichier envoyé est trop volumineux.';
            case 500:
                return 'Erreur interne du serveur. Veuillez réessayer plus tard.';
            case 503:
                return 'Le service est temporairement indisponible.';
            default:
                return `Une erreur est survenue (Code ${status}).`;
        }
    }

    // Gestion des erreurs standard JS
    if (error instanceof Error) {
        return error.message;
    }

    // Fallback
    return 'Une erreur inattendue est survenue.';
}
