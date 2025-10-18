/**
 * Timer Class Tests
 * Tests for the Timer functionality used in practice tests
 */

// Test suite for Timer class
function runTimerTests() {
    console.log('Running Timer Tests...');
    
    const tests = [
        testTimerInitialization,
        testTimerStart,
        testTimerPauseResume,
        testTimerStop,
        testTimerWarnings,
        testTimerExpiration,
        testTimerSerialization,
        testTimerFormatting
    ];
    
    let passed = 0;
    let failed = 0;
    
    tests.forEach(test => {
        try {
            test();
            console.log(`✓ ${test.name}`);
            passed++;
        } catch (error) {
            console.error(`✗ ${test.name}: ${error.message}`);
            failed++;
        }
    });
    
    console.log(`\nTimer Tests Complete: ${passed} passed, ${failed} failed`);
    return { passed, failed };
}

function testTimerInitialization() {
    const timer = new Timer();
    
    if (timer.duration !== 0) throw new Error('Initial duration should be 0');
    if (timer.remaining !== 0) throw new Error('Initial remaining should be 0');
    if (timer.isRunning !== false) throw new Error('Timer should not be running initially');
    if (timer.isPaused !== false) throw new Error('Timer should not be paused initially');
    
    timer.destroy();
}

function testTimerStart() {
    const timer = new Timer();
    
    timer.start(1); // 1 minute
    
    if (!timer.isRunning) throw new Error('Timer should be running after start');
    if (timer.duration !== 60000) throw new Error('Duration should be 60000ms for 1 minute');
    if (timer.getTimeRemaining() <= 0) throw new Error('Should have time remaining');
    if (timer.getFormattedTime() === '00:00') throw new Error('Formatted time should not be 00:00');
    
    timer.destroy();
}

function testTimerPauseResume() {
    const timer = new Timer();
    
    timer.start(1);
    const initialRemaining = timer.getTimeRemaining();
    
    timer.pause();
    if (!timer.isPaused) throw new Error('Timer should be paused');
    if (timer.getTimeRemaining() !== initialRemaining) throw new Error('Time should not change when paused');
    
    timer.resume();
    if (timer.isPaused) throw new Error('Timer should not be paused after resume');
    
    timer.destroy();
}

function testTimerStop() {
    const timer = new Timer();
    
    timer.start(1);
    timer.stop();
    
    if (timer.isRunning) throw new Error('Timer should not be running after stop');
    if (timer.getTimeRemaining() !== 0) throw new Error('Time remaining should be 0 after stop');
    
    timer.destroy();
}

function testTimerWarnings() {
    const timer = new Timer();
    let warningTriggered = false;
    
    timer.onWarning = (data) => {
        warningTriggered = true;
        if (!data.threshold) throw new Error('Warning should have threshold');
        if (!data.formatted) throw new Error('Warning should have formatted time');
    };
    
    // Test warning check manually
    timer.warningThresholds = [60]; // 60 minutes
    timer.remaining = 59 * 60 * 1000; // 59 minutes remaining
    timer.checkWarnings();
    
    if (!warningTriggered) throw new Error('Warning should have been triggered');
    
    timer.destroy();
}

function testTimerExpiration() {
    const timer = new Timer();
    let timeUpTriggered = false;
    
    timer.onTimeUp = () => {
        timeUpTriggered = true;
    };
    
    // Simulate time expiration
    timer.remaining = 0;
    timer.handleTimeUp();
    
    if (!timeUpTriggered) throw new Error('Time up callback should have been triggered');
    if (timer.isRunning) throw new Error('Timer should not be running after expiration');
    
    timer.destroy();
}

function testTimerSerialization() {
    const timer = new Timer();
    
    timer.start(80);
    const state = timer.serialize();
    
    if (!state.duration) throw new Error('Serialized state should have duration');
    if (!state.hasOwnProperty('isRunning')) throw new Error('Serialized state should have isRunning');
    if (!state.hasOwnProperty('isPaused')) throw new Error('Serialized state should have isPaused');
    
    const newTimer = new Timer();
    newTimer.deserialize(state);
    
    if (!newTimer.isRunning) throw new Error('Deserialized timer should be running');
    if (newTimer.duration !== timer.duration) throw new Error('Deserialized duration should match');
    
    timer.destroy();
    newTimer.destroy();
}

function testTimerFormatting() {
    const timer = new Timer();
    
    // Test formatting with known values
    const formatted1 = timer.formatTime(60000); // 1 minute
    if (formatted1 !== '01:00') throw new Error(`Expected '01:00', got '${formatted1}'`);
    
    const formatted2 = timer.formatTime(90000); // 1.5 minutes
    if (formatted2 !== '01:30') throw new Error(`Expected '01:30', got '${formatted2}'`);
    
    const formatted3 = timer.formatTime(3661000); // 61 minutes 1 second
    if (formatted3 !== '61:01') throw new Error(`Expected '61:01', got '${formatted3}'`);
    
    timer.destroy();
}

// Run tests if this file is loaded directly
if (typeof window !== 'undefined') {
    // Add to global test runner if available
    if (typeof addTestSuite === 'function') {
        addTestSuite('Timer', runTimerTests);
    }
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runTimerTests };
}