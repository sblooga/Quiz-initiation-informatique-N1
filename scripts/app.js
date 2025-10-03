(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    function setAlert(alertElement, { message, icon, tone, title }) {
        if (!alertElement) return;

        const iconElement = alertElement.querySelector('.alert-icon');
        const messageElement = alertElement.querySelector('.alert-message');
        const titleElement = alertElement.querySelector('.alert-title');

        alertElement.classList.remove('alert-success', 'alert-info');
        if (tone === 'success') {
            alertElement.classList.add('alert-success');
        } else {
            alertElement.classList.add('alert-info');
        }

        if (titleElement) {
            const defaultTitle = tone === 'success' ? 'Bravo !' : 'Information importante';
            titleElement.textContent = title || defaultTitle;
        }

        if (iconElement) {
            iconElement.textContent = icon;
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        alertElement.removeAttribute('hidden');
    }

    function hideAlert(alertElement) {
        if (!alertElement) return;
        alertElement.setAttribute('hidden', '');
    }

    ready(() => {
        const quizForm = document.getElementById('quiz-form');
        const quizStatus = document.getElementById('quiz-status');
        const quizRetry = quizStatus?.querySelector('[data-action="retry-quiz"]');
        const quizContinue = quizStatus?.querySelector('[data-action="continue-quiz"]');

        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');
        const formRetry = formStatus?.querySelector('[data-action="retry-form"]');
        const formContinue = formStatus?.querySelector('[data-action="continue-form"]');

        if (quizForm && quizStatus) {
            quizForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const formData = new FormData(quizForm);
                const answer = formData.get('password');
                const isCorrect = answer === 'complexe';

                setAlert(quizStatus, {
                    message: isCorrect
                        ? 'Excellente réponse ! Un mot de passe complexe protège mieux vos comptes.'
                        : 'Pensez à choisir un mot de passe long et unique pour chaque site afin de rester protégé.',
                    icon: isCorrect ? '🎉' : '💡',
                    tone: isCorrect ? 'success' : 'info',
                    title: isCorrect ? 'Bonne réponse !' : 'Un petit rappel',
                });

                const alertFocusTarget = quizStatus.querySelector('.alert-actions .primary');
                alertFocusTarget?.focus?.();
            });

            quizRetry?.addEventListener('click', () => {
                quizForm.reset();
                hideAlert(quizStatus);
                const firstOption = quizForm.querySelector('input[type="radio"]');
                firstOption?.focus?.();
            });

            quizContinue?.addEventListener('click', () => {
                hideAlert(quizStatus);
                document.getElementById('aides')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (contactForm && formStatus) {
            contactForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const formData = new FormData(contactForm);
                const name = formData.get('name')?.toString().trim() || 'cher utilisateur';

                setAlert(formStatus, {
                    message: `Merci ${name}, votre message a bien été envoyé. Nous reviendrons vers vous rapidement.`,
                    icon: '🤝',
                    tone: 'success',
                    title: 'Message bien reçu !',
                });

                const alertFocusTarget = formStatus.querySelector('.alert-actions .primary');
                alertFocusTarget?.focus?.();
            });

            formRetry?.addEventListener('click', () => {
                contactForm.reset();
                hideAlert(formStatus);
                contactForm.querySelector('input, textarea')?.focus?.();
            });

            formContinue?.addEventListener('click', () => {
                hideAlert(formStatus);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });
})();
