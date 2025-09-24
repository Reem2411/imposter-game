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

  startGame() {
    if (this.players.size < 3) return false; // Need at least 3 players
    
    this.gameState = GAME_STATES.PLAYING;
    this.currentWord = words[Math.floor(Math.random() * words.length)];
    
    // Randomly select imposter
    const playerIds = Array.from(this.players.keys());
    this.imposterId = playerIds[Math.floor(Math.random() * playerIds.length)];
    this.players.get(this.imposterId).isImposter = true;
    
    this.votes.clear();
    this.readyToVote.clear();
    
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
      // Send word to all players except imposter
      for (const [playerId, player] of session.players) {
        if (player.isImposter) {
          io.to(playerId).emit('game-started', { 
            isImposter: true, 
            word: 'IMPOSTER',
            round: session.round
          });
        } else {
          io.to(playerId).emit('game-started', { 
            isImposter: false, 
            word: session.currentWord,
            round: session.round
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
    }
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
          word: session.currentWord
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
