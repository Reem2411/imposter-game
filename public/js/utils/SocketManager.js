/**
 * Socket Manager Utility
 * Handles all socket.io communication
 */
class SocketManager {
    constructor() {
        this.socket = io();
        this.listeners = new Map();
    }

    /**
     * Add a socket event listener
     * @param {string} event - The event name
     * @param {Function} callback - The callback function
     */
    on(event, callback) {
        this.socket.on(event, callback);
        this.listeners.set(event, callback);
    }

    /**
     * Emit a socket event
     * @param {string} event - The event name
     * @param {Object} data - The data to send
     */
    emit(event, data) {
        this.socket.emit(event, data);
    }

    /**
     * Remove a socket event listener
     * @param {string} event - The event name
     */
    off(event) {
        if (this.listeners.has(event)) {
            this.socket.off(event, this.listeners.get(event));
            this.listeners.delete(event);
        }
    }

    /**
     * Get the socket instance
     * @returns {Object} The socket instance
     */
    getSocket() {
        return this.socket;
    }
}
