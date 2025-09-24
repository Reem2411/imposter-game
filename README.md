# 🎭 Imposter Game Server

An online multiplayer game where players try to identify the imposter among them. Similar to Among Us, but with a word-based twist!

## How to Play

1. **Create or Join a Session**: One player creates a session and shares the session code with others
2. **Gather Players**: Wait for at least 3 players to join (up to 10 players)
3. **Start the Game**: The host clicks "Start Game" to begin
4. **Find the Imposter**: 
   - All players except one receive a secret word
   - One player (the imposter) sees "IMPOSTER" instead of the word
   - Players discuss and try to figure out who doesn't know the word
5. **Vote**: When ready, players vote on who they think is the imposter
6. **Results**: If the imposter is caught, players win! If not, the imposter wins!

## Features

- ✅ Real-time multiplayer gameplay using WebSockets
- ✅ Session-based rooms with unique codes
- ✅ Host controls for starting games and new rounds
- ✅ Responsive design that works on mobile and desktop
- ✅ Automatic player management and reconnection
- ✅ Multiple rounds with the same group
- ✅ Beautiful, modern UI with smooth animations

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000`

## Game Rules

- **Minimum Players**: 3 players required to start
- **Maximum Players**: 15 players per session
- **Word Selection**: Random words from a curated list
- **Voting**: Majority vote determines who gets voted out
- **Winning**: 
  - Players win if they vote out the imposter
  - Imposter wins if someone else gets voted out
- **Rounds**: Host can start new rounds with the same group

## Technical Details

- **Backend**: Node.js with Express and Socket.IO
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Real-time Communication**: WebSocket connections for instant updates
- **Session Management**: Unique 8-character session codes
- **Game State**: Server-side state management for consistency

## File Structure

```
imposter-game/
├── server.js          # Main server file with game logic
├── package.json       # Dependencies and scripts
├── public/
│   ├── index.html     # Main game interface
│   ├── style.css      # Styling and responsive design
│   └── script.js      # Client-side game logic
└── README.md          # This file
```

## Development

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## Game Flow

1. **Welcome Screen**: Enter name and create/join session
2. **Lobby**: See all players and wait for host to start
3. **Game Screen**: See your word (or "IMPOSTER" if you're the imposter)
4. **Voting Screen**: Vote on who you think is the imposter
5. **Results Screen**: See who won and start a new round

Enjoy playing the Imposter Game! 🎮
