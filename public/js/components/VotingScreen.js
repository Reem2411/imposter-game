/**
 * Voting Screen Component
 * Handles the voting phase where players vote for who they think is the imposter
 */
class VotingScreen {
    constructor(gameController) {
        this.gameController = gameController;
        this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            votingPlayers: document.getElementById('voting-players')
        };
    }

    show(players) {
        this.gameController.hideAllScreens();
        document.getElementById('voting-screen').classList.remove('hidden');
        
        this.renderVotingPlayers(players);
    }

    renderVotingPlayers(players) {
        this.elements.votingPlayers.innerHTML = '';
        
        players.forEach(player => {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'voting-player';
            playerDiv.innerHTML = `
                <div class="player-name">${player.name}</div>
            `;
            
            playerDiv.addEventListener('click', () => {
                this.handleVote(player.id, playerDiv);
            });
            
            this.elements.votingPlayers.appendChild(playerDiv);
        });
    }

    handleVote(targetId, playerDiv) {
        // Visual feedback
        document.querySelectorAll('.voting-player').forEach(p => p.classList.remove('selected'));
        playerDiv.classList.add('selected');
        
        this.gameController.castVote(targetId);
    }
}
