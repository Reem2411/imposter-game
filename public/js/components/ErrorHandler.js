/**
 * Error Handler Component
 * Handles error display and management
 */
class ErrorHandler {
    constructor(gameController) {
        this.gameController = gameController;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            errorMessage: document.getElementById('error-message'),
            errorText: document.getElementById('error-text'),
            closeErrorBtn: document.getElementById('close-error-btn')
        };
    }

    attachEventListeners() {
        this.elements.closeErrorBtn.addEventListener('click', () => {
            this.hide();
        });
    }

    show(message) {
        this.elements.errorText.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    }

    hide() {
        this.elements.errorMessage.classList.add('hidden');
    }
}
