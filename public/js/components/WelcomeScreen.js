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
            createSessionBtn: document.getElementById('create-session-btn'),
            joinSessionBtn: document.getElementById('join-session-btn'),
            joinForm: document.getElementById('join-form'),
            sessionIdInput: document.getElementById('session-id'),
            joinConfirmBtn: document.getElementById('join-confirm-btn'),
            cancelJoinBtn: document.getElementById('cancel-join-btn')
        };
    }

    attachEventListeners() {
        this.elements.createSessionBtn.addEventListener('click', () => {
            this.handleCreateSession();
        });

        this.elements.joinSessionBtn.addEventListener('click', () => {
            this.showJoinForm();
        });

        this.elements.joinConfirmBtn.addEventListener('click', () => {
            this.handleJoinSession();
        });

        this.elements.cancelJoinBtn.addEventListener('click', () => {
            this.hideJoinForm();
        });
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
        const sessionId = this.elements.sessionIdInput.value.trim().toUpperCase();
        
        if (!playerName) {
            this.gameController.showError('Please enter your name');
            return;
        }
        
        if (!sessionId) {
            this.gameController.showError('Please enter a session code');
            return;
        }

        this.gameController.joinSession(sessionId, playerName);
    }

    showJoinForm() {
        this.elements.joinForm.classList.remove('hidden');
    }

    hideJoinForm() {
        this.elements.joinForm.classList.add('hidden');
        this.elements.sessionIdInput.value = '';
    }

    show() {
        this.gameController.hideAllScreens();
        document.getElementById('welcome-screen').classList.remove('hidden');
    }
}
