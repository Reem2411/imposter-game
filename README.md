# 🎭 Modular Imposter Game

A multiplayer online game where players try to find the imposter among them. Built with a clean, modular architecture for easy debugging, customization, and maintenance.

## ✨ Features

- **Real-time Multiplayer**: Socket.IO powered multiplayer experience
- **Modular Architecture**: Clean, component-based code structure
- **Easy Customization**: Modular CSS and component system
- **Debug-Friendly**: Comprehensive logging and debugging tools
- **Responsive Design**: Works on mobile and desktop
- **Session Management**: Unique session codes for easy joining

## 🏗️ Architecture

### Component Structure
```
public/
├── js/
│   ├── GameController.js          # Main orchestrator
│   ├── components/                # Screen components
│   │   ├── WelcomeScreen.js      # Session creation/joining
│   │   ├── LobbyScreen.js         # Player waiting room
│   │   ├── GameScreen.js          # Main game interface
│   │   ├── VotingScreen.js       # Voting phase
│   │   ├── ResultsScreen.js       # Game results
│   │   └── ErrorHandler.js        # Error management
│   └── utils/                     # Utility modules
│       ├── SocketManager.js       # Socket.IO wrapper
│       └── ScreenManager.js       # Screen transitions
├── css/                           # Modular stylesheets
│   ├── base.css                  # Global styles
│   ├── components.css            # Reusable components
│   ├── screens.css               # Screen-specific styles
│   └── custom-theme.css          # Example custom theme
└── main.js                       # Application entry point
```

### Key Benefits
- **Easy Debugging**: Each component can be debugged independently
- **Easy Customization**: Override specific CSS files for custom themes
- **Maintainable**: Single responsibility principle
- **Extensible**: Add new features by creating new components

## 🚀 Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd imposter-game

# Install dependencies
npm install

# Start the server
npm start
```

### Access the Game
Open your browser to `http://localhost:3000`

## 🎮 How to Play

1. **Create or Join**: One player creates a session, others join with the session code
2. **Wait for Players**: Need at least 3 players to start
3. **Game Begins**: A random word is chosen, one player becomes the imposter
4. **Discussion**: Players discuss the word (imposter tries to blend in)
5. **Voting**: Players vote to eliminate who they think is the imposter
6. **Results**: See if the imposter was caught or got away!

## 🎨 Customization

### Adding Custom Themes
1. Create a new CSS file in the `css/` directory
2. Override the existing styles
3. Include it in `index.html` after the modular CSS files

Example:
```html
<link rel="stylesheet" href="css/base.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/screens.css">
<link rel="stylesheet" href="css/my-custom-theme.css">
```

### Adding New Components
1. Create a new component file in `js/components/`
2. Add it to the GameController
3. Include it in the HTML script loading

### Debugging
- Use browser console to see detailed logs
- Run `testMessageVisibility()` in console to test message display
- Check component-specific logs for targeted debugging

## 🔧 Development

### Project Structure
- **Server**: `server.js` - Express server with Socket.IO
- **Client**: `public/` - Modular frontend architecture
- **Components**: Individual screen components with clear responsibilities
- **Utilities**: Reusable modules for common functionality

### Key Files
- `GameController.js`: Main game orchestrator
- `SocketManager.js`: Socket.IO communication wrapper
- `ScreenManager.js`: Screen transition management
- Component files: Individual screen logic

## 🐛 Debugging Tools

### Console Logging
- Game state changes
- Socket events
- Component interactions
- Message visibility testing

### Debug Functions
```javascript
// Test message visibility
testMessageVisibility()

// Check game state
gameController.getGameState()
```

## 📱 Responsive Design

- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts
- Cross-platform compatibility

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Real-time**: WebSockets via Socket.IO
- **Architecture**: Modular component system

## 🎯 Game Rules

- **Minimum Players**: 3 players required
- **Imposter Selection**: Random selection each round
- **Word Knowledge**: All players except imposter know the word
- **Voting**: Majority vote determines elimination
- **Winning**: Imposter wins if not caught, players win if imposter is found

## 📝 License

MIT License - feel free to use and modify!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Enjoy playing the Modular Imposter Game! 🎭**

*Built with ❤️ and clean architecture principles*