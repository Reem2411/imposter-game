/**
 * Main Game Controller
 * Orchestrates all game components and manages game state
 */
class GameController {
    constructor() {
        this.gameState = {
            currentSession: null,
            playerName: '',
            isHost: false,
            players: []
        };

        this.initializeComponents();
        this.setupSocketListeners();
    }

    initializeComponents() {
        // Initialize utility managers
        this.socketManager = new SocketManager();
        this.screenManager = new ScreenManager();
        
        // Initialize components
        this.errorHandler = new ErrorHandler(this);
        this.welcomeScreen = new WelcomeScreen(this);
        this.lobbyScreen = new LobbyScreen(this);
        this.gameScreen = new GameScreen(this);
        this.votingScreen = new VotingScreen(this);
        this.resultsScreen = new ResultsScreen(this);
    }

    setupSocketListeners() {
        this.socketManager.on('session-created', (data) => {
            this.gameState.currentSession = data.sessionId;
            this.gameState.isHost = true;
            this.lobbyScreen.show();
        });

        this.socketManager.on('joined-session', (data) => {
            this.gameState.currentSession = data.sessionId;
            this.lobbyScreen.show();
        });

        this.socketManager.on('player-joined', (data) => {
            this.gameState.players = data.players;
            this.lobbyScreen.update();
        });

        this.socketManager.on('player-left', (data) => {
            this.gameState.players = data.players;
            this.lobbyScreen.update();
        });

        this.socketManager.on('game-started', (data) => {
            console.log('GameController received game-started event:', data);
            this.gameScreen.show(data);
        });

        this.socketManager.on('game-state-changed', (data) => {
            this.gameState.players = data.players;
            this.lobbyScreen.update();
        });

        this.socketManager.on('voting-started', (data) => {
            this.votingScreen.show(data.players);
        });

        this.socketManager.on('voting-results', (data) => {
            this.resultsScreen.show(data);
        });

        this.socketManager.on('new-round-started', (data) => {
            this.gameState.players = data.players;
            this.lobbyScreen.show();
        });

        this.socketManager.on('error', (data) => {
            this.showError(data.message);
        });
    }

    // Game actions
    createSession(playerName) {
        this.gameState.playerName = playerName;
        this.socketManager.emit('create-session', { playerName });
    }

    joinSession(sessionId, playerName) {
        this.gameState.playerName = playerName;
        this.socketManager.emit('join-session', { 
            sessionId: sessionId, 
            playerName: playerName 
        });
    }

    startGame() {
        this.socketManager.emit('start-game', { sessionId: this.gameState.currentSession });
    }

    readyToVote() {
        this.socketManager.emit('ready-to-vote', { sessionId: this.gameState.currentSession });
    }

    castVote(targetId) {
        this.socketManager.emit('cast-vote', { 
            sessionId: this.gameState.currentSession, 
            targetId: targetId 
        });
    }

    startNewRound() {
        this.socketManager.emit('start-new-round', { sessionId: this.gameState.currentSession });
    }

    // Utility methods
    getGameState() {
        return this.gameState;
    }

    hideAllScreens() {
        this.screenManager.hideAllScreens();
    }

    showError(message) {
        this.errorHandler.show(message);
    }
}
