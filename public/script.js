class ImposterGame {
    constructor() {
        this.socket = io();
        this.currentSession = null;
        this.playerName = '';
        this.isHost = false;
        this.players = [];
        
        this.initializeEventListeners();
        this.setupSocketListeners();
    }

    initializeEventListeners() {
        // Welcome screen
        document.getElementById('create-session-btn').addEventListener('click', () => {
            this.createSession();
        });

        document.getElementById('join-session-btn').addEventListener('click', () => {
            this.showJoinForm();
        });

        document.getElementById('join-confirm-btn').addEventListener('click', () => {
            this.joinSession();
        });

        document.getElementById('cancel-join-btn').addEventListener('click', () => {
            this.hideJoinForm();
        });

        // Lobby screen
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Game screen
        document.getElementById('ready-to-vote-btn').addEventListener('click', () => {
            this.readyToVote();
        });

        // Results screen
        document.getElementById('new-round-btn').addEventListener('click', () => {
            this.startNewRound();
        });

        // Error handling
        document.getElementById('close-error-btn').addEventListener('click', () => {
            this.hideError();
        });
    }

    setupSocketListeners() {
        this.socket.on('session-created', (data) => {
            this.currentSession = data.sessionId;
            this.isHost = true;
            this.showLobby();
        });

        this.socket.on('joined-session', (data) => {
            this.currentSession = data.sessionId;
            this.showLobby();
        });

        this.socket.on('player-joined', (data) => {
            this.players = data.players;
            this.updateLobby();
        });

        this.socket.on('player-left', (data) => {
            this.players = data.players;
            this.updateLobby();
        });

        this.socket.on('game-started', (data) => {
            this.showGame(data);
        });

        this.socket.on('game-state-changed', (data) => {
            this.players = data.players;
            this.updateLobby();
        });

        this.socket.on('voting-started', (data) => {
            this.showVoting(data.players);
        });

        this.socket.on('voting-results', (data) => {
            this.showResults(data);
        });

        this.socket.on('new-round-started', (data) => {
            this.players = data.players;
            this.showLobby();
        });

        this.socket.on('error', (data) => {
            this.showError(data.message);
        });
    }

    createSession() {
        this.playerName = document.getElementById('player-name').value.trim();
        if (!this.playerName) {
            this.showError('Please enter your name');
            return;
        }

        this.socket.emit('create-session', { playerName: this.playerName });
    }

    joinSession() {
        this.playerName = document.getElementById('player-name').value.trim();
        const sessionId = document.getElementById('session-id').value.trim().toUpperCase();
        
        if (!this.playerName) {
            this.showError('Please enter your name');
            return;
        }
        
        if (!sessionId) {
            this.showError('Please enter a session code');
            return;
        }

        this.socket.emit('join-session', { 
            sessionId: sessionId, 
            playerName: this.playerName 
        });
    }

    startGame() {
        this.socket.emit('start-game', { sessionId: this.currentSession });
    }

    readyToVote() {
        this.socket.emit('ready-to-vote', { sessionId: this.currentSession });
    }

    startNewRound() {
        this.socket.emit('start-new-round', { sessionId: this.currentSession });
    }

    showJoinForm() {
        document.getElementById('join-form').classList.remove('hidden');
    }

    hideJoinForm() {
        document.getElementById('join-form').classList.add('hidden');
        document.getElementById('session-id').value = '';
    }

    showLobby() {
        this.hideAllScreens();
        document.getElementById('lobby-screen').classList.remove('hidden');
        this.updateLobby();
    }

    showGame(data) {
        this.hideAllScreens();
        document.getElementById('game-screen').classList.remove('hidden');
        
        document.getElementById('current-round').textContent = data.round;
        document.getElementById('game-word').textContent = data.word;
        
        if (data.isImposter) {
            document.getElementById('imposter-message').classList.remove('hidden');
            document.getElementById('player-message').classList.add('hidden');
        } else {
            document.getElementById('imposter-message').classList.add('hidden');
            document.getElementById('player-message').classList.remove('hidden');
        }
    }

    showVoting(players) {
        this.hideAllScreens();
        document.getElementById('voting-screen').classList.remove('hidden');
        
        const votingContainer = document.getElementById('voting-players');
        votingContainer.innerHTML = '';
        
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'voting-player';
            playerDiv.innerHTML = `
                <div class="player-name">${player.name}</div>
            `;
            
            playerDiv.addEventListener('click', () => {
                this.castVote(player.id);
                // Visual feedback
                document.querySelectorAll('.voting-player').forEach(p => p.classList.remove('selected'));
                playerDiv.classList.add('selected');
            });
            
            votingContainer.appendChild(playerDiv);
        });
    }

    showResults(data) {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.remove('hidden');
        
        const resultsContent = document.getElementById('results-content');
        const resultClass = data.isImposterVotedOut ? 'win' : 'lose';
        const resultMessage = data.isImposterVotedOut ? 
            '🎉 Players Win! The imposter was caught!' : 
            '😈 Imposter Wins! The imposter got away!';
        
        let voteCountsHtml = '';
        for (const [playerId, count] of Object.entries(data.voteCounts)) {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                voteCountsHtml += `
                    <div class="vote-count">
                        <span>${player.name}</span>
                        <span>${count} vote${count !== 1 ? 's' : ''}</span>
                    </div>
                `;
            }
        }
        
        resultsContent.innerHTML = `
            <div class="result-message ${resultClass}">
                <h3>${resultMessage}</h3>
            </div>
            
            <div class="result-details">
                <p><strong>Word:</strong> ${data.word}</p>
                <p><strong>Imposter:</strong> ${data.imposter.name}</p>
                <p><strong>Voted Out:</strong> ${data.votedOutPlayer.name}</p>
                
                <div class="vote-counts">
                    <h4>Vote Results:</h4>
                    ${voteCountsHtml}
                </div>
            </div>
        `;
        
        // Show host controls if this player is the host
        if (this.isHost) {
            document.getElementById('host-controls-results').classList.remove('hidden');
        }
    }

    castVote(targetId) {
        this.socket.emit('cast-vote', { 
            sessionId: this.currentSession, 
            targetId: targetId 
        });
    }

    updateLobby() {

        document.getElementById('session').textContent = this.currentSession;
        document.getElementById('player-count').textContent = this.players.length;
        
        const playersList = document.getElementById('players-list');
        playersList.innerHTML = '';
        
        this.players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = `player-item ${player.isHost ? 'host' : ''}`;
            playerDiv.innerHTML = `
                <span class="player-name">${player.name}</span>
                ${player.isHost ? '<span class="player-role">HOST</span>' : ''}
            `;
            playersList.appendChild(playerDiv);
        });
        
        // Update start game button
        const startBtn = document.getElementById('start-game-btn');
        if (this.isHost) {
            document.getElementById('host-controls').classList.remove('hidden');
            document.getElementById('waiting-message').classList.add('hidden');
            startBtn.disabled = this.players.length < 3;
        } else {
            document.getElementById('host-controls').classList.add('hidden');
            document.getElementById('waiting-message').classList.remove('hidden');
        }
    }

    hideAllScreens() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
    }

    showError(message) {
        document.getElementById('error-text').textContent = message;
        document.getElementById('error-message').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error-message').classList.add('hidden');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImposterGame();
});
