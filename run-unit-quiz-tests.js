/**
 * Test runner for unit quiz functionality
 */

// Load required modules
const fs = require('fs');
const path = require('path');

// Mock browser globals for Node.js environment
global.window = {};
global.document = {};
global.localStorage = {
    data: new Map(),
    setItem(key, value) { this.data.set(key, value); },
    getItem(key) { return this.data.get(key) || null; },
    removeItem(key) { this.data.delete(key); },
    clear() { this.data.clear(); },
    get length() { return this.data.size; }
};

// Load the source files
function loadFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    eval(content);
}

try {
    // Load dependencies in order
    loadFile('js/question.js');
    loadFile('js/storage-wrapper.js');
    loadFile('js/progress-tracker.js');
    loadFile('js/question-manager.js');
    loadFile('js/quiz-engine.js');
    loadFile('js/sample-questions.js');
    loadFile('js/test-runner.js');
    loadFile('js/tests.js');
    loadFile('js/unit-quiz.test.js');
    
    console.log('🧪 Running Unit Quiz Tests...\n');
    
    // Debug: Check what functions are available
    console.log('Available functions:', Object.keys(global).filter(key => key.includes('test') || key.includes('Test')));
    
    // Create a simple test runner and run unit quiz tests
    const testRunner = new TestRunner();
    
    // Run unit quiz tests
    if (typeof runUnitQuizTests !== 'undefined') {
        console.log('Running unit quiz tests...');
        runUnitQuizTests(testRunner);
        
        // Execute the tests
        testRunner.run().then(() => {
            if (testRunner.results.failed === 0) {
                console.log('🎉 All unit quiz tests passed!');
                process.exit(0);
            } else {
                console.log(`❌ ${testRunner.results.failed} test(s) failed`);
                process.exit(1);
            }
        }).catch(error => {
            console.error('❌ Error running tests:', error);
            process.exit(1);
        });
    } else {
        console.log('❌ runUnitQuizTests function not found');
        console.log('Available globals:', Object.keys(global).slice(0, 20));
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.error(error.stack);
    process.exit(1);
}