/**
 * Results Screen Component
 * Handles the results screen showing game outcomes and vote counts
 */
class ResultsScreen {
    constructor(gameController) {
        this.gameController = gameController;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.elements = {
            resultsContent: document.getElementById('results-content'),
            hostControls: document.getElementById('host-controls-results'),
            newRoundBtn: document.getElementById('new-round-btn')
        };
    }

    attachEventListeners() {
        this.elements.newRoundBtn.addEventListener('click', () => {
            this.gameController.startNewRound();
        });
    }

    show(resultsData) {
        this.gameController.hideAllScreens();
        document.getElementById('results-screen').classList.remove('hidden');
        
        this.renderResults(resultsData);
        this.updateHostControls();
    }

    renderResults(data) {
        const resultClass = data.isImposterVotedOut ? 'win' : 'lose';
        const resultMessage = data.isImposterVotedOut ? 
            '🎉 Players Win! The imposter was caught!' : 
            '😈 Imposter Wins! The imposter got away!';
        
        const voteCountsHtml = this.generateVoteCountsHtml(data.voteCounts);
        
        this.elements.resultsContent.innerHTML = `
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
    }

    generateVoteCountsHtml(voteCounts) {
        const gameState = this.gameController.getGameState();
        let voteCountsHtml = '';
        
        for (const [playerId, count] of Object.entries(voteCounts)) {
            const player = gameState.players.find(p => p.id === playerId);
            if (player) {
                voteCountsHtml += `
                    <div class="vote-count">
                        <span>${player.name}</span>
                        <span>${count} vote${count !== 1 ? 's' : ''}</span>
                    </div>
                `;
            }
        }
        
        return voteCountsHtml;
    }

    updateHostControls() {
        const gameState = this.gameController.getGameState();
        if (gameState.isHost) {
            this.elements.hostControls.classList.remove('hidden');
        } else {
            this.elements.hostControls.classList.add('hidden');
        }
    }
}
