/**
 * Lobby Screen Component
 * Handles the game lobby where players wait before the game starts
 */
class LobbyScreen {
    constructor(gameController) {
        this.gameController = gameController;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            sessionCode: document.getElementById('session-code'),
            playerCount: document.getElementById('player-count'),
            playersList: document.getElementById('players-list'),
            hostControls: document.getElementById('host-controls'),
            startGameBtn: document.getElementById('start-game-btn'),
            waitingMessage: document.getElementById('waiting-message')
        };
    }

    attachEventListeners() {
        this.elements.startGameBtn.addEventListener('click', () => {
            this.gameController.startGame();
        });
    }

    show() {
        this.gameController.hideAllScreens();
        document.getElementById('lobby-screen').classList.remove('hidden');
        this.update();
    }

    update() {
        const gameState = this.gameController.getGameState();
        
        // Update session info
        this.elements.sessionCode.textContent = gameState.currentSession;
        this.elements.playerCount.textContent = gameState.players.length;
        
        // Update players list
        this.updatePlayersList(gameState.players);
        
        // Update host controls
        this.updateHostControls(gameState.isHost, gameState.players.length);
    }

    updatePlayersList(players) {
        this.elements.playersList.innerHTML = '';
        
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = `player-item ${player.isHost ? 'host' : ''}`;
            playerDiv.innerHTML = `
                <span class="player-name">${player.name}</span>
                ${player.isHost ? '<span class="player-role">HOST</span>' : ''}
            `;
            this.elements.playersList.appendChild(playerDiv);
        });
    }

    updateHostControls(isHost, playerCount) {
        if (isHost) {
            this.elements.hostControls.classList.remove('hidden');
            this.elements.waitingMessage.classList.add('hidden');
            // Allow starting with any number of players - server will validate
            this.elements.startGameBtn.disabled = false;
        } else {
            this.elements.hostControls.classList.add('hidden');
            this.elements.waitingMessage.classList.remove('hidden');
        }
    }
}
