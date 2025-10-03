(function () {
    const storageKey = 'onboardingSeen';

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn, { once: true });
        } else {
            fn();
        }
    }

    ready(() => {
        const modal = document.getElementById('onboarding-modal');
        if (!modal) {
            return;
        }

        const steps = Array.from(modal.querySelectorAll('.onboarding-step'));
        const helpButton = document.getElementById('help-trigger');
        const nextButton = modal.querySelector('[data-action="next"]');
        const prevButton = modal.querySelector('[data-action="prev"]');
        const closeButtons = modal.querySelectorAll('[data-action="close"]');
        const dialog = modal.querySelector('.onboarding-dialog');
        let currentIndex = 0;
        let openedFromHelp = false;

        function updateSteps() {
            steps.forEach((step, index) => {
                const active = index === currentIndex;
                step.setAttribute('aria-hidden', String(!active));
            });
            if (prevButton) {
                prevButton.disabled = currentIndex === 0;
            }
            if (nextButton) {
                nextButton.textContent = currentIndex === steps.length - 1 ? 'Terminer' : 'Suivant';
            }
        }

        function openModal(fromHelp = false) {
            openedFromHelp = fromHelp;
            modal.hidden = false;
            document.body.setAttribute('data-onboarding-open', 'true');
            currentIndex = 0;
            updateSteps();
            requestAnimationFrame(() => {
                dialog?.focus?.();
            });
        }

        function closeModal() {
            modal.hidden = true;
            document.body.removeAttribute('data-onboarding-open');
            if (!openedFromHelp) {
                try {
                    localStorage.setItem(storageKey, 'true');
                } catch (error) {
                    console.warn('Impossible d’enregistrer le tutoriel', error);
                }
            }
            openedFromHelp = false;
        }

        function handleNext() {
            if (currentIndex < steps.length - 1) {
                currentIndex += 1;
                updateSteps();
            } else {
                closeModal();
            }
        }

        function handlePrev() {
            if (currentIndex > 0) {
                currentIndex -= 1;
                updateSteps();
            }
        }

        nextButton?.addEventListener('click', handleNext);
        prevButton?.addEventListener('click', handlePrev);
        closeButtons.forEach((button) => {
            button.addEventListener('click', closeModal);
        });

        modal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.action === 'close') {
                closeModal();
            }
        });

        modal.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        });

        if (helpButton) {
            helpButton.addEventListener('click', () => {
                openModal(true);
            });
        }

        try {
            const hasSeen = localStorage.getItem(storageKey);
            if (!hasSeen) {
                openModal(false);
            }
        } catch (error) {
            console.warn('Accès à localStorage impossible', error);
            openModal(false);
        }
    });
})();
