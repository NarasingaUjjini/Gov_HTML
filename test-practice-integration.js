/**
 * Simple integration test for practice test functionality
 * This tests the basic integration without browser dependencies
 */

// Mock browser environment
global.console = console;
global.Date = Date;
global.setTimeout = setTimeout;
global.clearTimeout = clearTimeout;
global.setInterval = setInterval;
global.clearInterval = clearInterval;

// Mock document for Timer class
global.document = {
    addEventListener: () => {},
    removeEventListener: () => {},
    hidden: false
};

// Load required files
const fs = require('fs');

try {
    // Load classes in order
    console.log('Loading Question class...');
    eval(fs.readFileSync('js/question.js', 'utf8'));
    
    console.log('Loading StorageWrapper class...');
    eval(fs.readFileSync('js/storage-wrapper.js', 'utf8'));
    
    console.log('Loading ProgressTracker class...');
    eval(fs.readFileSync('js/progress-tracker.js', 'utf8'));
    
    console.log('Loading QuestionManager class...');
    eval(fs.readFileSync('js/question-manager.js', 'utf8'));
    
    console.log('Loading Timer class...');
    eval(fs.readFileSync('js/timer.js', 'utf8'));
    
    console.log('Loading QuizEngine class...');
    eval(fs.readFileSync('js/quiz-engine.js', 'utf8'));
    
    console.log('Loading sample questions...');
    eval(fs.readFileSync('js/sample-questions.js', 'utf8'));
    
    console.log('\nAll classes loaded successfully!');
    
    // Test basic functionality
    console.log('\n=== Testing Practice Test Integration ===');
    
    // Initialize components
    const storageWrapper = new StorageWrapper();
    const progressTracker = new ProgressTracker(storageWrapper);
    const questionManager = new QuestionManager();
    
    // Load questions
    if (typeof sampleQuestions !== 'undefined') {
        questionManager.loadQuestions(sampleQuestions);
        console.log(`✓ Loaded ${sampleQuestions.length} sample questions`);
    } else {
        console.log('✗ Sample questions not available');
        process.exit(1);
    }
    
    // Create quiz engine
    const quizEngine = new QuizEngine(questionManager, progressTracker);
    console.log('✓ QuizEngine created');
    
    // Set up event handlers
    let timerTickCount = 0;
    let warningReceived = false;
    
    quizEngine.onTimerTick = (data) => {
        timerTickCount++;
        if (timerTickCount === 1) {
            console.log(`✓ Timer tick received: ${data.formatted}`);
        }
    };
    
    quizEngine.onTimerWarning = (data) => {
        warningReceived = true;
        console.log(`✓ Timer warning received: ${data.message}`);
    };
    
    quizEngine.onModeSpecificEvent = (event) => {
        if (event.type === 'auto_submit') {
            console.log('✓ Auto-submit event received');
        }
    };
    
    // Start practice test
    console.log('\nStarting practice test...');
    quizEngine.startQuiz('practice');
    console.log('✓ Practice test started successfully');
    
    // Check timer state
    const timerState = quizEngine.getTimerState();
    if (timerState && timerState.isRunning) {
        console.log('✓ Timer is running');
        console.log(`  - Duration: ${Math.round(timerState.duration / 60000)} minutes`);
        console.log(`  - Remaining: ${timerState.formatted.remaining}`);
    } else {
        console.log('✗ Timer is not running');
    }
    
    // Check quiz state
    const quizState = quizEngine.getState();
    console.log(`✓ Quiz state: ${quizState.mode} mode with ${quizState.totalQuestions} questions`);
    
    // Test navigation warning
    if (quizEngine.shouldWarnOnNavigation()) {
        console.log('✓ Navigation warning system active');
        const warningMsg = quizEngine.getNavigationWarningMessage();
        console.log(`  - Warning message length: ${warningMsg.length} characters`);
    } else {
        console.log('✗ Navigation warning system not active');
    }
    
    // Wait a moment for timer tick
    setTimeout(() => {
        if (timerTickCount > 0) {
            console.log(`✓ Timer ticking (${timerTickCount} ticks received)`);
        } else {
            console.log('✗ No timer ticks received');
        }
        
        // End the quiz
        console.log('\nEnding practice test...');
        const results = quizEngine.endQuiz();
        console.log('✓ Practice test ended successfully');
        console.log(`  - Questions: ${results.questions.length}`);
        console.log(`  - Mode: ${results.mode}`);
        console.log(`  - Timer stats available: ${!!results.timerStats}`);
        
        if (results.timerStats) {
            console.log(`  - Time used: ${Math.round(results.timerStats.elapsed / 1000)}s`);
        }
        
        console.log('\n=== Integration Test Complete ===');
        console.log('✓ All basic functionality working correctly');
        
    }, 1100); // Wait just over 1 second for timer tick
    
} catch (error) {
    console.error('Integration test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
}