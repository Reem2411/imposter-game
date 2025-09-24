/**
 * Debug script for testing message visibility
 * Run this in the browser console to test the message display logic
 */

// Test function to simulate different player roles
function testMessageVisibility() {
    console.log('Testing message visibility...');
    
    const imposterMessage = document.getElementById('imposter-message');
    const playerMessage = document.getElementById('player-message');
    
    console.log('Initial state:');
    console.log('Imposter message hidden:', imposterMessage.classList.contains('hidden'));
    console.log('Player message hidden:', playerMessage.classList.contains('hidden'));
    
    // Test imposter role
    console.log('\n--- Testing Imposter Role ---');
    imposterMessage.classList.remove('hidden');
    playerMessage.classList.add('hidden');
    console.log('After setting imposter role:');
    console.log('Imposter message visible:', !imposterMessage.classList.contains('hidden'));
    console.log('Player message hidden:', playerMessage.classList.contains('hidden'));
    
    // Test regular player role
    console.log('\n--- Testing Regular Player Role ---');
    imposterMessage.classList.add('hidden');
    playerMessage.classList.remove('hidden');
    console.log('After setting regular player role:');
    console.log('Imposter message hidden:', imposterMessage.classList.contains('hidden'));
    console.log('Player message visible:', !playerMessage.classList.contains('hidden'));
    
    // Reset to initial state
    imposterMessage.classList.add('hidden');
    playerMessage.classList.add('hidden');
    console.log('\nReset to initial state (both hidden)');
}

// Make the function available globally
window.testMessageVisibility = testMessageVisibility;

console.log('Debug script loaded. Run testMessageVisibility() to test message visibility.');

