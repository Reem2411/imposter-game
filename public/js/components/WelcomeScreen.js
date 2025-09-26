/**
 * Welcome Screen Component
 * Handles the initial welcome screen with session creation and joining
 */
class WelcomeScreen {
    constructor(gameController) {
        this.gameController = gameController;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            playerNameInput: document.getElementById('player-name'),
            sessionCodeInput: document.getElementById('session-code'),
            createSessionBtn: document.getElementById('create-session-btn'),
            joinSessionBtn: document.getElementById('join-session-btn')
        };
    }

    attachEventListeners() {
        // Input validation
        this.elements.playerNameInput.addEventListener('input', () => {
            this.updateButtonStates();
        });

        this.elements.sessionCodeInput.addEventListener('input', () => {
            this.updateButtonStates();
        });

        // Button clicks
        this.elements.createSessionBtn.addEventListener('click', () => {
            this.handleCreateSession();
        });

        this.elements.joinSessionBtn.addEventListener('click', () => {
            this.handleJoinSession();
        });

        // Enter key support
        this.elements.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.elements.createSessionBtn.disabled) {
                this.handleCreateSession();
            }
        });

        this.elements.sessionCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.elements.joinSessionBtn.disabled) {
                this.handleJoinSession();
            }
        });
    }

    updateButtonStates() {
        const hasName = this.elements.playerNameInput.value.trim().length > 0;
        const hasSessionCode = this.elements.sessionCodeInput.value.trim().length > 0;

        // Create session enabled when name is entered
        this.elements.createSessionBtn.disabled = !hasName;

        // Join session enabled when both name and session code are entered
        this.elements.joinSessionBtn.disabled = !(hasName && hasSessionCode);
    }

    handleCreateSession() {
        const playerName = this.elements.playerNameInput.value.trim();
        if (!playerName) {
            this.gameController.showError('Please enter your name');
            return;
        }
        this.gameController.createSession(playerName);
    }

    handleJoinSession() {
        const playerName = this.elements.playerNameInput.value.trim();
        const sessionCode = this.elements.sessionCodeInput.value.trim().toUpperCase();
        
        if (!playerName) {
            this.gameController.showError('Please enter your name');
            return;
        }
        
        if (!sessionCode) {
            this.gameController.showError('Please enter a session code');
            return;
        }

        this.gameController.joinSession(sessionCode, playerName);
    }

    show() {
        this.gameController.hideAllScreens();
        document.getElementById('welcome-screen').classList.remove('hidden');
        // Reset form and button states
        this.elements.playerNameInput.value = '';
        this.elements.sessionCodeInput.value = '';
        this.updateButtonStates();
    }
}
