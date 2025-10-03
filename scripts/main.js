const FONT_PREFERENCE_KEY = 'quiz-font-preference';
const CONTRAST_PREFERENCE_KEY = 'quiz-contrast-preference';

function getStoredPreference(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function setStoredPreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Storage might be unavailable (private mode, etc.)
  }
}

function applyFontPreference(preference) {
  if (preference === 'large') {
    document.body.classList.add('font-large');
  } else {
    document.body.classList.remove('font-large');
  }
}

function applyContrastPreference(preference) {
  const isHighContrast = preference === 'high';
  document.body.classList.toggle('contrast-high', isHighContrast);
  const contrastButton = document.querySelector('[data-action="toggle-contrast"]');
  if (contrastButton) {
    contrastButton.setAttribute('aria-pressed', String(isHighContrast));
  }
}

function increaseFont() {
  document.body.classList.add('font-large');
  setStoredPreference(FONT_PREFERENCE_KEY, 'large');
}

function decreaseFont() {
  document.body.classList.remove('font-large');
  setStoredPreference(FONT_PREFERENCE_KEY, 'normal');
}

function toggleHighContrast() {
  const isHighContrast = !document.body.classList.contains('contrast-high');
  document.body.classList.toggle('contrast-high', isHighContrast);
  setStoredPreference(CONTRAST_PREFERENCE_KEY, isHighContrast ? 'high' : 'normal');
  const contrastButton = document.querySelector('[data-action="toggle-contrast"]');
  if (contrastButton) {
    contrastButton.setAttribute('aria-pressed', String(isHighContrast));
  }
}

function speakText(text, fallbackElement) {
  if (!text) {
    return;
  }

  if ('speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined') {
    if (fallbackElement) {
      fallbackElement.hidden = true;
      fallbackElement.setAttribute('aria-hidden', 'true');
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = 'fr-FR';
    window.speechSynthesis.speak(utterance);
  } else if (fallbackElement) {
    fallbackElement.hidden = false;
    fallbackElement.setAttribute('aria-hidden', 'false');
  }
}

function handleListenButton(event) {
  const button = event.currentTarget;
  const selector = button.dataset.speakTarget;
  const fallback = button.nextElementSibling?.classList.contains('speech-fallback')
    ? button.nextElementSibling
    : null;
  let textToSpeak = '';

  if (selector) {
    const target = document.querySelector(selector);
    if (target) {
      textToSpeak = target.textContent || '';
    }
  }

  if (!textToSpeak) {
    textToSpeak = button.getAttribute('aria-label') || button.textContent || '';
  }

  speakText(textToSpeak, fallback);
}

document.addEventListener('DOMContentLoaded', () => {
  applyFontPreference(getStoredPreference(FONT_PREFERENCE_KEY));
  applyContrastPreference(getStoredPreference(CONTRAST_PREFERENCE_KEY));

  const decreaseButton = document.querySelector('[data-action="decrease-font"]');
  const increaseButton = document.querySelector('[data-action="increase-font"]');
  const contrastButton = document.querySelector('[data-action="toggle-contrast"]');

  if (decreaseButton) {
    decreaseButton.addEventListener('click', decreaseFont);
  }

  if (increaseButton) {
    increaseButton.addEventListener('click', increaseFont);
  }

  if (contrastButton) {
    contrastButton.addEventListener('click', toggleHighContrast);
  }

  const listenButtons = document.querySelectorAll('[data-speak-target]');
  listenButtons.forEach((button) => {
    button.addEventListener('click', handleListenButton);
  });
});

window.increaseFont = increaseFont;
window.decreaseFont = decreaseFont;
window.toggleHighContrast = toggleHighContrast;
