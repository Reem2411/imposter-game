/**
 * Screen Manager Utility
 * Handles screen visibility and transitions
 */
class ScreenManager {
    constructor() {
        this.screens = [
            'welcome-screen',
            'lobby-screen', 
            'game-screen',
            'voting-screen',
            'results-screen'
        ];
    }

    /**
     * Hide all screens
     */
    hideAllScreens() {
        this.screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.add('hidden');
            }
        });
    }

    /**
     * Show a specific screen
     * @param {string} screenId - The ID of the screen to show
     */
    showScreen(screenId) {
        this.hideAllScreens();
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('hidden');
        }
    }

    /**
     * Check if a screen is currently visible
     * @param {string} screenId - The ID of the screen to check
     * @returns {boolean} True if the screen is visible
     */
    isScreenVisible(screenId) {
        const screen = document.getElementById(screenId);
        return screen && !screen.classList.contains('hidden');
    }
}
