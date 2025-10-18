/**
 * Unit tests for ProgressTracker class
 * Tests progress calculation accuracy and data persistence
 */

// Mock StorageWrapper for testing
class MockStorageWrapper {
    constructor() {
        this.data = new Map();
    }

    setItem(key, value) {
        this.data.set(key, value);
        return true;
    }

    getItem(key) {
        return this.data.get(key) || null;
    }

    removeItem(key) {
        return this.data.delete(key);
    }

    clear() {
        this.data.clear();
        return true;
    }
}

// Import ProgressTracker (assuming it's available in test environment)
// In a real test environment, you'd use: const ProgressTracker = require('./progress-tracker');

/**
 * Test Suite: ProgressTracker Initialization
 */
function testProgressTrackerInitialization() {
    console.log('Testing ProgressTracker Initialization...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    // Test default progress structure
    const progress = tracker.getOverallProgress();
    
    assert(progress.totalSeen === 0, 'Initial total seen should be 0');
    assert(progress.totalCorrect === 0, 'Initial total correct should be 0');
    assert(progress.overallAptitude === 0, 'Initial overall aptitude should be 0');
    assert(progress.practiceTestCount === 0, 'Initial practice test count should be 0');
    
    // Test all units initialized to 0
    for (let i = 1; i <= 5; i++) {
        assert(progress.unitAptitudes[i] === 0, `Unit ${i} aptitude should be 0`);
        assert(tracker.getUnitSeen(i) === 0, `Unit ${i} seen should be 0`);
    }
    
    console.log('✓ ProgressTracker initialization tests passed');
}

/**
 * Test Suite: Unit Progress Updates
 */
function testUnitProgressUpdates() {
    console.log('Testing Unit Progress Updates...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    // Test single unit update
    tracker.updateUnitProgress(1, 8, 10);
    
    assert(tracker.getUnitAptitude(1) === 80, 'Unit 1 aptitude should be 80%');
    assert(tracker.getUnitSeen(1) === 10, 'Unit 1 seen should be 10');
    
    // Test multiple updates to same unit
    tracker.updateUnitProgress(1, 7, 10);
    
    assert(tracker.getUnitAptitude(1) === 75, 'Unit 1 aptitude should be 75% after second update');
    assert(tracker.getUnitSeen(1) === 20, 'Unit 1 seen should be 20 after second update');
    
    // Test different units
    tracker.updateUnitProgress(2, 9, 12);
    tracker.updateUnitProgress(3, 5, 8);
    
    assert(tracker.getUnitAptitude(2) === 75, 'Unit 2 aptitude should be 75%');
    assert(tracker.getUnitAptitude(3) === 63, 'Unit 3 aptitude should be 63%');
    
    console.log('✓ Unit progress update tests passed');
}

/**
 * Test Suite: Aptitude Calculations
 */
function testAptitudeCalculations() {
    console.log('Testing Aptitude Calculations...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    // Test perfect score
    tracker.updateUnitProgress(1, 10, 10);
    assert(tracker.getUnitAptitude(1) === 100, 'Perfect score should be 100%');
    
    // Test zero score
    tracker.updateUnitProgress(2, 0, 10);
    assert(tracker.getUnitAptitude(2) === 0, 'Zero score should be 0%');
    
    // Test rounding
    tracker.updateUnitProgress(3, 1, 3); // 33.333...%
    assert(tracker.getUnitAptitude(3) === 33, 'Should round to 33%');
    
    tracker.updateUnitProgress(4, 2, 3); // 66.666...%
    assert(tracker.getUnitAptitude(4) === 67, 'Should round to 67%');
    
    // Test edge case: no questions attempted
    assert(tracker.getUnitAptitude(5) === 0, 'No questions attempted should be 0%');
    
    console.log('✓ Aptitude calculation tests passed');
}

/**
 * Test Suite: Practice Test Recording
 */
function testPracticeTestRecording() {
    console.log('Testing Practice Test Recording...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    const unitBreakdown = { 1: 8, 2: 9, 3: 7, 4: 10, 5: 8 };
    tracker.recordPracticeTest(42, 55, unitBreakdown);
    
    const history = tracker.getPracticeTestHistory();
    assert(history.length === 1, 'Should have one practice test recorded');
    
    const test = history[0];
    assert(test.score === 42, 'Score should be 42');
    assert(test.total === 55, 'Total should be 55');
    assert(test.percentage === 76, 'Percentage should be 76%');
    assert(test.unitBreakdown[1] === 8, 'Unit 1 breakdown should be 8');
    
    // Test that unit progress was updated
    assert(tracker.getUnitAptitude(1) > 0, 'Unit 1 aptitude should be updated');
    assert(tracker.getUnitAptitude(2) > 0, 'Unit 2 aptitude should be updated');
    
    console.log('✓ Practice test recording tests passed');
}

/**
 * Test Suite: Overall Progress Calculation
 */
function testOverallProgressCalculation() {
    console.log('Testing Overall Progress Calculation...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    // Add progress to multiple units
    tracker.updateUnitProgress(1, 8, 10);  // 80%
    tracker.updateUnitProgress(2, 6, 10);  // 60%
    tracker.updateUnitProgress(3, 9, 10);  // 90%
    
    const overall = tracker.getOverallProgress();
    
    assert(overall.totalSeen === 30, 'Total seen should be 30');
    assert(overall.totalCorrect === 23, 'Total correct should be 23');
    assert(overall.totalQuestions === 30, 'Total questions should be 30');
    assert(overall.overallAptitude === 77, 'Overall aptitude should be 77%');
    
    console.log('✓ Overall progress calculation tests passed');
}

/**
 * Test Suite: Data Persistence
 */
function testDataPersistence() {
    console.log('Testing Data Persistence...');
    
    const storage = new MockStorageWrapper();
    
    // Create tracker and add some data
    let tracker = new ProgressTracker(storage);
    tracker.updateUnitProgress(1, 8, 10);
    tracker.recordPracticeTest(42, 55, { 1: 8, 2: 9, 3: 7, 4: 10, 5: 8 });
    
    // Create new tracker with same storage (simulating app restart)
    tracker = new ProgressTracker(storage);
    
    // Verify data persisted
    assert(tracker.getUnitAptitude(1) > 0, 'Unit progress should persist');
    assert(tracker.getPracticeTestHistory().length === 1, 'Practice test history should persist');
    
    console.log('✓ Data persistence tests passed');
}

/**
 * Test Suite: Error Handling
 */
function testErrorHandling() {
    console.log('Testing Error Handling...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    // Test invalid unit IDs
    try {
        tracker.updateUnitProgress(0, 5, 10);
        assert(false, 'Should throw error for unit ID 0');
    } catch (e) {
        assert(e.message.includes('Unit ID must be between 1 and 5'), 'Should throw appropriate error');
    }
    
    try {
        tracker.getUnitAptitude(6);
        assert(false, 'Should throw error for unit ID 6');
    } catch (e) {
        assert(e.message.includes('Unit ID must be between 1 and 5'), 'Should throw appropriate error');
    }
    
    console.log('✓ Error handling tests passed');
}

/**
 * Test Suite: Session Management
 */
function testSessionManagement() {
    console.log('Testing Session Management...');
    
    const storage = new MockStorageWrapper();
    const tracker = new ProgressTracker(storage);
    
    const sessionData = {
        mode: 'unit',
        unitId: 1,
        currentQuestion: 5,
        answers: ['A', 'B', 'C'],
        startTime: Date.now()
    };
    
    // Test saving session
    tracker.saveCurrentSession(sessionData);
    const retrieved = tracker.getCurrentSession();
    
    assert(retrieved.mode === 'unit', 'Session mode should persist');
    assert(retrieved.unitId === 1, 'Session unit ID should persist');
    assert(retrieved.currentQuestion === 5, 'Session current question should persist');
    
    // Test clearing session
    tracker.clearCurrentSession();
    assert(tracker.getCurrentSession() === null, 'Session should be cleared');
    
    console.log('✓ Session management tests passed');
}

/**
 * Simple assertion function for testing
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Run all tests
 */
function runProgressTrackerTests() {
    console.log('Running ProgressTracker Tests...\n');
    
    try {
        testProgressTrackerInitialization();
        testUnitProgressUpdates();
        testAptitudeCalculations();
        testPracticeTestRecording();
        testOverallProgressCalculation();
        testDataPersistence();
        testErrorHandling();
        testSessionManagement();
        
        console.log('\n✅ All ProgressTracker tests passed!');
        return true;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runProgressTrackerTests, MockStorageWrapper };
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    runProgressTrackerTests();
}