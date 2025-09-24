# Imposter Game - Modular Architecture

## Overview
The imposter game has been refactored into a clean, modular architecture that makes it easy to debug, maintain, and customize.

## File Structure

```
public/
├── index.html                 # Main HTML file
├── main.js                   # Application entry point
├── css/                      # Modular CSS files
│   ├── base.css             # Base styles and resets
│   ├── components.css       # Reusable component styles
│   └── screens.css          # Screen-specific styles
└── js/                      # JavaScript modules
    ├── GameController.js    # Main game orchestrator
    ├── components/          # Screen components
    │   ├── WelcomeScreen.js
    │   ├── LobbyScreen.js
    │   ├── GameScreen.js
    │   ├── VotingScreen.js
    │   ├── ResultsScreen.js
    │   └── ErrorHandler.js
    └── utils/               # Utility modules
        ├── SocketManager.js
        └── ScreenManager.js
```

## Architecture Components

### 1. GameController
- **Purpose**: Main orchestrator that manages game state and coordinates all components
- **Responsibilities**: 
  - Initialize all components
  - Manage game state
  - Handle socket communication
  - Coordinate screen transitions

### 2. Screen Components
Each screen is now a separate component class:

- **WelcomeScreen**: Handles session creation and joining
- **LobbyScreen**: Manages the waiting room with player list
- **GameScreen**: Shows the game word and player role
- **VotingScreen**: Handles the voting phase
- **ResultsScreen**: Displays game results
- **ErrorHandler**: Manages error display

### 3. Utility Modules
- **SocketManager**: Wraps socket.io functionality with a clean API
- **ScreenManager**: Handles screen visibility and transitions

### 4. CSS Architecture
- **base.css**: Global styles, resets, typography
- **components.css**: Reusable component styles (buttons, forms, etc.)
- **screens.css**: Screen-specific styles

## Benefits of This Architecture

### 1. **Easy Debugging**
- Each component is isolated and can be debugged independently
- Clear separation of concerns makes it easy to identify issues
- Console logging can be added to specific components

### 2. **Easy Customization**
- CSS is modular - override specific files for custom themes
- Components can be easily modified without affecting others
- Add new screens by creating new component files

### 3. **Maintainability**
- Single responsibility principle - each file has one clear purpose
- Easy to find and modify specific functionality
- Clear dependencies between components

### 4. **Extensibility**
- Add new game features by creating new components
- Easy to add new screens or modify existing ones
- Socket events are centralized in GameController

## How to Customize

### Adding Custom CSS
1. **Override existing styles**: Add your custom CSS after the modular CSS files
2. **Create theme files**: Add new CSS files for different themes
3. **Modify component styles**: Edit specific files in the `css/` directory

### Adding New Features
1. **New screens**: Create a new component in `js/components/`
2. **New utilities**: Add utility classes in `js/utils/`
3. **New socket events**: Add handlers in `GameController.js`

### Debugging
1. **Component-specific debugging**: Add console.log to specific component methods
2. **State inspection**: Use `gameController.getGameState()` to inspect current state
3. **Socket debugging**: Add listeners in SocketManager for debugging

## Example: Adding a New Screen

```javascript
// 1. Create js/components/NewScreen.js
class NewScreen {
    constructor(gameController) {
        this.gameController = gameController;
        // Initialize component
    }
    
    show() {
        // Show the screen
    }
}

// 2. Add to GameController.js
this.newScreen = new NewScreen(this);

// 3. Add CSS to css/screens.css
#new-screen {
    /* Your styles here */
}
```

This modular structure makes the codebase much more maintainable and easier to work with!
