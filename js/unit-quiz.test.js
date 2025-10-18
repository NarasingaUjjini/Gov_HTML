/**
 * Unit Quiz Tests
 * Tests for unit-specific quiz mode functionality
 */

// Test data
const testQuestions = [
    {
        id: "test_unit1_q1",
        unit: 1,
        question: "Test question for Unit 1?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 0,
        explanation: "Test explanation"
    },
    {
        id: "test_unit1_q2",
        unit: 1,
        question: "Another test question for Unit 1?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 1,
        explanation: "Test explanation"
    },
    {
        id: "test_unit2_q1",
        unit: 2,
        question: "Test question for Unit 2?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 2,
        explanation: "Test explanation"
    },
    {
        id: "test_unit3_q1",
        unit: 3,
        question: "Test question for Unit 3?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 3,
        explanation: "Test explanation"
    }
];

/**
 * Test Suite: Unit Quiz Functionality
 */
function runUnitQuizTests() {
    console.log('Running Unit Quiz Tests...');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // Test 1: Unit selection accuracy
    results.tests.push(testUnitQuestionSelection(results));
    
    // Test 2: Unit quiz creation
    results.tests.push(testUnitQuizCreation(results));
    
    // Test 3: Unit quiz scoring
    results.tests.push(testUnitQuizScoring(results));
    
    // Test 4: Unit progress tracking
    results.tests.push(testUnitProgressTracking(results));
    
    // Test 5: Unit quiz completion
    results.tests.push(testUnitQuizCompletion(results));
    
    console.log(`Unit Quiz Tests Complete: ${results.passed} passed, ${results.failed} failed`);
    return results;
}

/**
 * Test unit-specific question selection accuracy
 */
function testUnitQuestionSelection(results) {
    const testName = 'Unit Question Selection Accuracy';
    
    try {
        // Create question manager and load test questions
        const questionManager = new QuestionManager();
        questionManager.loadQuestions(testQuestions);
        
        // Test getting questions for each unit
        for (let unitId = 1; unitId <= 3; unitId++) {
            const unitQuestions = questionManager.getQuestionsByUnit(unitId);
            const expectedCount = testQuestions.filter(q => q.unit === unitId).length;
            
            if (unitQuestions.length !== expectedCount) {
                throw new Error(`Unit ${unitId}: Expected ${expectedCount} questions, got ${unitQuestions.length}`);
            }
            
            // Verify all questions belong to the correct unit
            unitQuestions.forEach(question => {
                if (question.unit !== unitId) {
                    throw new Error(`Unit ${unitId}: Found question from unit ${question.unit}`);
                }
            });
        }
        
        // Test random question selection for specific unit
        const unit1Questions = questionManager.getRandomQuestions(1, [1]);
        if (unit1Questions.length !== 1) {
            throw new Error(`Expected 1 random question from unit 1, got ${unit1Questions.length}`);
        }
        
        if (unit1Questions[0].unit !== 1) {
            throw new Error(`Random question should be from unit 1, got unit ${unit1Questions[0].unit}`);
        }
        
        results.passed++;
        return { name: testName, status: 'PASSED', message: 'Unit question selection works correctly' };
        
    } catch (error) {
        results.failed++;
        return { name: testName, status: 'FAILED', message: error.message };
    }
}

/**
 * Test unit quiz creation
 */
function testUnitQuizCreation(results) {
    const testName = 'Unit Quiz Creation';
    
    try {
        // Create components
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Test creating unit quiz for each unit
        for (let unitId = 1; unitId <= 3; unitId++) {
            quizEngine.startQuiz('unit', unitId);
            
            if (!quizEngine.isActive) {
                throw new Error(`Unit ${unitId} quiz should be active after starting`);
            }
            
            if (quizEngine.mode !== 'unit') {
                throw new Error(`Quiz mode should be 'unit', got '${quizEngine.mode}'`);
            }
            
            if (quizEngine.unitId !== unitId) {
                throw new Error(`Quiz unit ID should be ${unitId}, got ${quizEngine.unitId}`);
            }
            
            // Verify all questions are from the correct unit
            quizEngine.questions.forEach(question => {
                if (question.unit !== unitId) {
                    throw new Error(`Unit ${unitId} quiz contains question from unit ${question.unit}`);
                }
            });
            
            // End quiz for next test
            quizEngine.endQuiz();
        }
        
        results.passed++;
        return { name: testName, status: 'PASSED', message: 'Unit quiz creation works correctly' };
        
    } catch (error) {
        results.failed++;
        return { name: testName, status: 'FAILED', message: error.message };
    }
}

/**
 * Test unit quiz scoring
 */
function testUnitQuizScoring(results) {
    const testName = 'Unit Quiz Scoring';
    
    try {
        // Create components
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Start unit 1 quiz
        quizEngine.startQuiz('unit', 1);
        
        // Submit correct answer for first question
        quizEngine.submitAnswer(0); // Correct answer for test_unit1_q1
        
        // Submit incorrect answer for second question
        quizEngine.submitAnswer(0); // Incorrect answer for test_unit1_q2 (correct is 1)
        
        // Calculate score
        const score = quizEngine.calculateScore();
        
        if (score.correct !== 1) {
            throw new Error(`Expected 1 correct answer, got ${score.correct}`);
        }
        
        if (score.total !== 2) {
            throw new Error(`Expected 2 total answers, got ${score.total}`);
        }
        
        if (score.percentage !== 50) {
            throw new Error(`Expected 50% score, got ${score.percentage}%`);
        }
        
        // End quiz and check results
        const results_obj = quizEngine.endQuiz();
        
        if (results_obj.mode !== 'unit') {
            throw new Error(`Results mode should be 'unit', got '${results_obj.mode}'`);
        }
        
        if (results_obj.unitId !== 1) {
            throw new Error(`Results unit ID should be 1, got ${results_obj.unitId}`);
        }
        
        results.passed++;
        return { name: testName, status: 'PASSED', message: 'Unit quiz scoring works correctly' };
        
    } catch (error) {
        results.failed++;
        return { name: testName, status: 'FAILED', message: error.message };
    }
}

/**
 * Test unit progress tracking
 */
function testUnitProgressTracking(results) {
    const testName = 'Unit Progress Tracking';
    
    try {
        // Create components
        const storageWrapper = new StorageWrapper();
        const progressTracker = new ProgressTracker(storageWrapper);
        
        // Clear any existing progress
        storageWrapper.clear();
        
        // Update progress for unit 1
        progressTracker.updateUnitProgress(1, 3, 5); // 3 correct out of 5
        
        // Get unit progress
        const unitProgress = progressTracker.getUnitProgress(1);
        
        if (unitProgress.correct !== 3) {
            throw new Error(`Expected 3 correct answers, got ${unitProgress.correct}`);
        }
        
        if (unitProgress.total !== 5) {
            throw new Error(`Expected 5 total answers, got ${unitProgress.total}`);
        }
        
        if (unitProgress.aptitude !== 60) {
            throw new Error(`Expected 60% aptitude, got ${unitProgress.aptitude}%`);
        }
        
        // Update progress again (should accumulate)
        progressTracker.updateUnitProgress(1, 2, 3); // 2 more correct out of 3 more
        
        const updatedProgress = progressTracker.getUnitProgress(1);
        
        if (updatedProgress.correct !== 5) {
            throw new Error(`Expected 5 total correct answers, got ${updatedProgress.correct}`);
        }
        
        if (updatedProgress.total !== 8) {
            throw new Error(`Expected 8 total answers, got ${updatedProgress.total}`);
        }
        
        results.passed++;
        return { name: testName, status: 'PASSED', message: 'Unit progress tracking works correctly' };
        
    } catch (error) {
        results.failed++;
        return { name: testName, status: 'FAILED', message: error.message };
    }
}

/**
 * Test unit quiz completion flow
 */
function testUnitQuizCompletion(results) {
    const testName = 'Unit Quiz Completion';
    
    try {
        // Create components
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Start unit 1 quiz
        quizEngine.startQuiz('unit', 1);
        
        const initialQuestionCount = quizEngine.questions.length;
        
        // Answer all questions
        for (let i = 0; i < initialQuestionCount; i++) {
            quizEngine.navigateToQuestion(i);
            quizEngine.submitAnswer(0); // Submit any answer
        }
        
        // Check if quiz is complete
        if (!quizEngine.isQuizComplete()) {
            throw new Error('Quiz should be complete after answering all questions');
        }
        
        // End quiz
        const quizResults = quizEngine.endQuiz();
        
        // Verify results structure
        if (!quizResults.quizId) {
            throw new Error('Quiz results should have a quiz ID');
        }
        
        if (!quizResults.startTime || !quizResults.endTime) {
            throw new Error('Quiz results should have start and end times');
        }
        
        if (!quizResults.score) {
            throw new Error('Quiz results should have score information');
        }
        
        if (!quizResults.questions || quizResults.questions.length !== initialQuestionCount) {
            throw new Error(`Quiz results should have ${initialQuestionCount} questions`);
        }
        
        // Verify quiz is no longer active
        if (quizEngine.isActive) {
            throw new Error('Quiz should not be active after ending');
        }
        
        results.passed++;
        return { name: testName, status: 'PASSED', message: 'Unit quiz completion works correctly' };
        
    } catch (error) {
        results.failed++;
        return { name: testName, status: 'FAILED', message: error.message };
    }
}

/**
 * Run all unit quiz tests and display results
 */
function displayUnitQuizTestResults() {
    const results = runUnitQuizTests();
    
    console.log('\n=== Unit Quiz Test Results ===');
    results.tests.forEach(test => {
        const status = test.status === 'PASSED' ? '✅' : '❌';
        console.log(`${status} ${test.name}: ${test.message}`);
    });
    
    console.log(`\nSummary: ${results.passed} passed, ${results.failed} failed`);
    
    return results.failed === 0;
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runUnitQuizTests,
        displayUnitQuizTestResults
    };
}

// Make available globally for browser testing
if (typeof window !== 'undefined') {
    window.runUnitQuizTests = runUnitQuizTests;
    window.displayUnitQuizTestResults = displayUnitQuizTestResults;
}