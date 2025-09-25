const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Game state storage
const sessions = new Map();
const words = [
  'PIZZA', 'ELEPHANT', 'MOUNTAIN', 'GUITAR', 'OCEAN', 'RAINBOW', 'CASTLE', 'ROCKET',
  'BUTTERFLY', 'TREASURE', 'DRAGON', 'GALAXY', 'VOLCANO', 'PYRAMID', 'LIGHTHOUSE',
  'TELESCOPE', 'ADVENTURE', 'MYSTERY', 'JOURNEY', 'DISCOVERY'
];

// Game states
const GAME_STATES = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  VOTING: 'voting',
  RESULTS: 'results'
};

class Session {
  constructor(hostId, hostName) {
    this.id = uuidv4().substring(0, 8).toUpperCase();
    this.hostId = hostId;
    this.hostName = hostName;
    this.players = new Map();
    this.gameState = GAME_STATES.WAITING;
    this.currentWord = '';
    this.imposterId = '';
    this.votes = new Map();
    this.readyToVote = new Set();
    this.round = 1;
    this.usedWords = []; // Track words used in this session
    
    // Add host as first player
    this.players.set(hostId, {
      id: hostId,
      name: hostName,
      isHost: true,
      isImposter: false
    });
  }

  addPlayer(playerId, playerName) {
    if (this.players.size >= 15) return false; // Max 15 players
    if (this.gameState !== GAME_STATES.WAITING) return false;
    
    this.players.set(playerId, {
      id: playerId,
      name: playerName,
      isHost: false,
      isImposter: false
    });
    return true;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    this.votes.delete(playerId);
    this.readyToVote.delete(playerId);
    
    // If host leaves, assign new host
    if (this.hostId === playerId && this.players.size > 0) {
      const newHost = this.players.values().next().value;
      this.hostId = newHost.id;
      newHost.isHost = true;
    }
  }

  getUnusedWord() {
    // Get all available words that haven't been used
    const availableWords = words.filter(word => !this.usedWords.includes(word));
    
    // If all words have been used, reset the used words list
    if (availableWords.length === 0) {
      console.log(`Session ${this.id}: All words used, resetting word list`);
      this.usedWords = [];
      return words[Math.floor(Math.random() * words.length)];
    }
    
    // Return a random word from available words
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  }

  selectImposter() {
    // Reset all players to not be imposter
    for (const player of this.players.values()) {
      player.isImposter = false;
    }
    
    // Calculate number of imposters: 1 imposter for 1-7 players, 2 imposters for 8+ players
    const totalPlayers = this.players.size;
    const imposterCount = totalPlayers >= 8 ? 2 : 1;
    
    console.log(`Session ${this.id}: Selecting ${imposterCount} imposters from ${totalPlayers} players`);
    
    // Get all player IDs
    const playerIds = Array.from(this.players.keys());
    const selectedImposters = [];
    
    // Select imposters
    for (let i = 0; i < imposterCount; i++) {
      let imposterId;
      
      // Try to avoid selecting the host if we have enough players
      if (playerIds.length > imposterCount && i === 0) {
        const nonHostPlayers = playerIds.filter(id => id !== this.hostId && !selectedImposters.includes(id));
        if (nonHostPlayers.length > 0) {
          imposterId = nonHostPlayers[Math.floor(Math.random() * nonHostPlayers.length)];
        } else {
          imposterId = playerIds.filter(id => !selectedImposters.includes(id))[Math.floor(Math.random() * (playerIds.length - selectedImposters.length))];
        }
      } else {
        const availablePlayers = playerIds.filter(id => !selectedImposters.includes(id));
        imposterId = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
      }
      
      selectedImposters.push(imposterId);
      this.players.get(imposterId).isImposter = true;
    }
    
    // Store the first imposter as the main imposterId for backward compatibility
    this.imposterId = selectedImposters[0];
    
    const imposterNames = selectedImposters.map(id => this.players.get(id).name);
    console.log(`Session ${this.id}: Selected imposters: ${imposterNames.join(', ')}`);
  }

  refreshGame() {
    console.log(`Session ${this.id}: Refreshing game - new word and reshuffled roles`);
    
    // Reset game state
    this.gameState = GAME_STATES.PLAYING;
    this.votes.clear();
    this.readyToVote.clear();
    
    // Get a new word
    this.currentWord = this.getUnusedWord();
    this.usedWords.push(this.currentWord);
    
    // Reshuffle imposter
    this.selectImposter();
    
    console.log(`Session ${this.id}: New word: ${this.currentWord}, Imposter: ${this.imposterId}`);
    
    return {
      word: this.currentWord,
      imposterId: this.imposterId,
      players: Array.from(this.players.values()),
      round: this.round,
      usedWords: [...this.usedWords]
    };
  }

  startGame() {
    if (this.players.size < 3) return false; // Need at least 3 players
    
    this.gameState = GAME_STATES.PLAYING;
    this.currentWord = this.getUnusedWord();
    this.usedWords.push(this.currentWord); // Track this word as used
    
    // Select imposter
    this.selectImposter();
    
    this.votes.clear();
    this.readyToVote.clear();
    
    console.log(`Session ${this.id}: Game started with word "${this.currentWord}" (Round ${this.round})`);
    console.log(`Session ${this.id}: Used words so far: [${this.usedWords.join(', ')}]`);
    
    return true;
  }

  playerReadyToVote(playerId) {
    this.readyToVote.add(playerId);
    const totalPlayers = this.players.size;
    const readyCount = this.readyToVote.size;
    
    return readyCount > Math.floor(totalPlayers / 2);
  }

  startVoting() {
    this.gameState = GAME_STATES.VOTING;
    this.votes.clear();
  }

  castVote(voterId, targetId) {
    if (this.gameState !== GAME_STATES.VOTING) return false;
    this.votes.set(voterId, targetId);
    return true;
  }

  getVotingResults() {
    const voteCounts = {};
    for (const targetId of this.votes.values()) {
      voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
    }
    
    // Find player with most votes
    let maxVotes = 0;
    let votedOutId = '';
    for (const [playerId, count] of Object.entries(voteCounts)) {
      if (count > maxVotes) {
        maxVotes = count;
        votedOutId = playerId;
      }
    }
    
    return {
      votedOutId,
      voteCounts,
      isImposterVotedOut: votedOutId === this.imposterId
    };
  }

  endGame() {
    this.gameState = GAME_STATES.RESULTS;
  }

  resetForNewRound() {
    this.gameState = GAME_STATES.WAITING;
    this.currentWord = '';
    this.imposterId = '';
    this.votes.clear();
    this.readyToVote.clear();
    this.round++;
    
    // Reset all players
    for (const player of this.players.values()) {
      player.isImposter = false;
    }
    
    console.log(`Session ${this.id}: New round ${this.round} prepared. Used words: [${this.usedWords.join(', ')}]`);
  }
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('create-session', (data) => {
    const session = new Session(socket.id, data.playerName);
    sessions.set(session.id, session);
    socket.join(session.id);
    socket.emit('session-created', { sessionId: session.id });
    console.log(`Session created: ${session.id} by ${data.playerName}`);
  });

  socket.on('join-session', (data) => {
    const session = sessions.get(data.sessionId);
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }

    if (session.addPlayer(socket.id, data.playerName)) {
      socket.join(session.id);
      socket.emit('joined-session', { sessionId: session.id });
      
      // Notify all players in session
      io.to(session.id).emit('player-joined', {
        playerName: data.playerName,
        players: Array.from(session.players.values())
      });
    } else {
      socket.emit('error', { message: 'Could not join session' });
    }
  });

  socket.on('start-game', (data) => {
    const session = sessions.get(data.sessionId);
    if (!session || session.hostId !== socket.id) {
      socket.emit('error', { message: 'Not authorized to start game' });
      return;
    }

    if (session.startGame()) {
      // Send word to all players
      for (const [playerId, player] of session.players) {
        if (player.isImposter) {
          io.to(playerId).emit('game-started', { 
            isImposter: true, 
            word: '', // No word for imposters
            round: session.round,
            isHost: player.isHost,
            imposterCount: Array.from(session.players.values()).filter(p => p.isImposter).length
          });
        } else {
          io.to(playerId).emit('game-started', { 
            isImposter: false, 
            word: session.currentWord,
            round: session.round,
            isHost: player.isHost,
            imposterCount: Array.from(session.players.values()).filter(p => p.isImposter).length
          });
        }
      }
      
      io.to(session.id).emit('game-state-changed', { 
        state: session.gameState,
        players: Array.from(session.players.values())
      });
    } else {
      socket.emit('error', { message: 'Could not start game' });
    }
  });

  socket.on('ready-to-vote', (data) => {
    const session = sessions.get(data.sessionId);
    if (!session) return;

    if (session.playerReadyToVote(socket.id)) {
      session.startVoting();
      io.to(session.id).emit('voting-started', {
        players: Array.from(session.players.values())
      });
    } else {
      // Send updated ready count to all players
      io.to(session.id).emit('ready-count-updated', {
        readyCount: session.readyToVote.size,
        totalPlayers: session.players.size
      });
    }
  });

  socket.on('refresh-game', (data) => {
    const session = sessions.get(data.sessionId);
    if (!session) return;

    // Only the host can refresh the game
    const player = session.players.get(socket.id);
    if (!player || !player.isHost) {
      socket.emit('error', { message: 'Only the host can refresh the game' });
      return;
    }

    const refreshData = session.refreshGame();
    
    // Send updated game data to all players
    session.players.forEach((player, playerId) => {
      const isImposter = player.isImposter;
      io.to(playerId).emit('game-started', {
        word: isImposter ? '' : refreshData.word, // No word for imposters
        isImposter: isImposter,
        players: refreshData.players,
        round: refreshData.round,
        isHost: player.isHost,
        usedWords: refreshData.usedWords,
        imposterCount: Array.from(session.players.values()).filter(p => p.isImposter).length
      });
    });
  });

  socket.on('cast-vote', (data) => {
    const session = sessions.get(data.sessionId);
    if (!session) return;

    if (session.castVote(socket.id, data.targetId)) {
      // Check if all players have voted
      if (session.votes.size === session.players.size) {
        const results = session.getVotingResults();
        session.endGame();
        
        io.to(session.id).emit('voting-results', {
          votedOutPlayer: session.players.get(results.votedOutId),
          isImposterVotedOut: results.isImposterVotedOut,
          voteCounts: results.voteCounts,
          imposter: session.players.get(session.imposterId),
          word: session.currentWord,
          usedWords: [...session.usedWords] // Send word history to client
        });
      }
    }
  });

  socket.on('start-new-round', (data) => {
    const session = sessions.get(data.sessionId);
    if (!session || session.hostId !== socket.id) {
      socket.emit('error', { message: 'Not authorized to start new round' });
      return;
    }

    session.resetForNewRound();
    io.to(session.id).emit('new-round-started', {
      players: Array.from(session.players.values()),
      round: session.round
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove player from all sessions
    for (const [sessionId, session] of sessions) {
      if (session.players.has(socket.id)) {
        session.removePlayer(socket.id);
        
        if (session.players.size === 0) {
          sessions.delete(sessionId);
        } else {
          io.to(sessionId).emit('player-left', {
            players: Array.from(session.players.values())
          });
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Imposter Game Server running on port ${PORT}`);
});
