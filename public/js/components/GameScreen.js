/**
 * Game Screen Component
 * Handles the main game screen where players see the word and their role
 */
class GameScreen {
    constructor(gameController) {
        this.gameController = gameController;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            currentRound: document.getElementById('current-round'),
            gameWord: document.getElementById('game-word'),
            imposterMessage: document.getElementById('imposter-message'),
            playerMessage: document.getElementById('player-message'),
            readyToVoteBtn: document.getElementById('ready-to-vote-btn'),
            readyPlayers: document.getElementById('ready-players'),
            readyCount: document.getElementById('ready-count')
        };
        this.isReady = false;
    }

    attachEventListeners() {
        this.elements.readyToVoteBtn.addEventListener('click', () => {
            if (!this.isReady) {
                this.setReadyState(true);
                this.gameController.readyToVote();
            }
        });
    }

    show(gameData) {
        console.log('GameScreen show called with data:', gameData);
        this.gameController.hideAllScreens();
        document.getElementById('game-screen').classList.remove('hidden');
        
        this.updateGameInfo(gameData);
        this.updatePlayerRole(gameData.isImposter);
    }

    updateGameInfo(gameData) {
        this.elements.currentRound.textContent = gameData.round;
        this.elements.gameWord.textContent = gameData.word;
    }

    updatePlayerRole(isImposter) {
        console.log('Updating player role - isImposter:', isImposter);
        
        if (isImposter) {
            this.elements.imposterMessage.classList.remove('hidden');
            this.elements.playerMessage.classList.add('hidden');
            console.log('Showing imposter message');
        } else {
            this.elements.imposterMessage.classList.add('hidden');
            this.elements.playerMessage.classList.remove('hidden');
            console.log('Showing player message');
        }
    }

    updateReadyPlayers(readyPlayers) {
        this.elements.readyPlayers.innerHTML = '';
        
        readyPlayers.forEach(player => {
            const readyPlayerDiv = document.createElement('div');
            readyPlayerDiv.className = 'ready-player';
            readyPlayerDiv.textContent = player.name;
            this.elements.readyPlayers.appendChild(readyPlayerDiv);
        });
        
        // Update the counter
        this.updateReadyCount(readyPlayers.length);
    }

    setReadyState(isReady) {
        this.isReady = isReady;
        const btn = this.elements.readyToVoteBtn;
        const statusText = btn.querySelector('.btn-status');
        
        if (isReady) {
            btn.classList.add('ready');
            btn.disabled = true;
            statusText.textContent = "✓ You're ready!";
        } else {
            btn.classList.remove('ready');
            btn.disabled = false;
            statusText.textContent = "Click when ready!";
        }
    }

    updateReadyCount(count) {
        this.elements.readyCount.textContent = count;
        
        // Add animation to counter when it changes
        this.elements.readyCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            this.elements.readyCount.style.transform = 'scale(1)';
        }, 200);
    }

    resetReadyState() {
        this.setReadyState(false);
        this.updateReadyCount(0);
    }
}
