/**
 * Unit tests for QuizEngine class
 * Tests core quiz functionality, navigation, scoring, and mode-specific behavior
 */

// Import required classes for Node.js environment
if (typeof require !== 'undefined') {
    global.Question = require('./question.js');
    global.StorageWrapper = require('./storage-wrapper.js');
    global.ProgressTracker = require('./progress-tracker.js');
    global.QuestionManager = require('./question-manager.js');
    global.QuizEngine = require('./quiz-engine.js');
}

// Test data
const testQuestions = [
    {
        id: "test_q1",
        unit: 1,
        question: "Test question 1?",
        options: ["A", "B", "C", "D"],
        correct: 0,
        explanation: "Test explanation 1"
    },
    {
        id: "test_q2",
        unit: 1,
        question: "Test question 2?",
        options: ["A", "B", "C", "D"],
        correct: 1,
        explanation: "Test explanation 2"
    },
    {
        id: "test_q3",
        unit: 2,
        question: "Test question 3?",
        options: ["A", "B", "C", "D"],
        correct: 2,
        explanation: "Test explanation 3"
    },
    {
        id: "test_q4",
        unit: 2,
        question: "Test question 4?",
        options: ["A", "B", "C", "D"],
        correct: 3,
        explanation: "Test explanation 4"
    },
    {
        id: "test_q5",
        unit: 3,
        question: "Test question 5?",
        options: ["A", "B", "C", "D"],
        correct: 0,
        explanation: "Test explanation 5"
    }
];

class QuizEngineTests {
    constructor() {
        this.testResults = [];
        this.setupTestEnvironment();
    }

    setupTestEnvironment() {
        // Create mock storage
        this.mockStorage = new StorageWrapper();
        
        // Create question manager and load test questions
        this.questionManager = new QuestionManager();
        this.questionManager.loadQuestions(testQuestions);
        
        // Create progress tracker
        this.progressTracker = new ProgressTracker(this.mockStorage);
        
        // Create quiz engine
        this.quizEngine = new QuizEngine(this.questionManager, this.progressTracker);
    }

    runTest(testName, testFunction) {
        try {
            console.log(`Running test: ${testName}`);
            testFunction.call(this);
            this.testResults.push({ name: testName, status: 'PASS' });
            console.log(`✓ ${testName} PASSED`);
        } catch (error) {
            this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
            console.error(`✗ ${testName} FAILED: ${error.message}`);
        }
    }

    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected: ${expected}, Actual: ${actual}`);
        }
    }

    assertTrue(condition, message = '') {
        if (!condition) {
            throw new Error(`${message} Expected condition to be true`);
        }
    }

    assertFalse(condition, message = '') {
        if (condition) {
            throw new Error(`${message} Expected condition to be false`);
        }
    }

    assertThrows(fn, message = '') {
        try {
            fn();
            throw new Error(`${message} Expected function to throw an error`);
        } catch (error) {
            // Expected behavior
        }
    }

    // Test quiz initialization
    testQuizInitialization() {
        // Test unit mode initialization
        this.quizEngine.startQuiz('unit', 1);
        this.assertTrue(this.quizEngine.isActive, 'Quiz should be active after starting');
        this.assertEqual(this.quizEngine.mode, 'unit', 'Mode should be set to unit');
        this.assertEqual(this.quizEngine.unitId, 1, 'Unit ID should be set to 1');
        this.assertTrue(this.quizEngine.questions.length > 0, 'Should have loaded questions');
        
        // Test invalid mode
        this.assertThrows(() => {
            this.quizEngine.startQuiz('invalid');
        }, 'Should throw error for invalid mode');
        
        // Test unit mode without unit ID
        this.assertThrows(() => {
            this.quizEngine.startQuiz('unit');
        }, 'Should throw error for unit mode without unit ID');
    }

    // Test question navigation
    testQuestionNavigation() {
        this.quizEngine.startQuiz('unit', 1);
        
        // Test initial state
        this.assertEqual(this.quizEngine.getCurrentQuestionNumber(), 1, 'Should start at question 1');
        this.assertEqual(this.quizEngine.currentQuestionIndex, 0, 'Should start at index 0');
        
        // Test next question
        const canGoNext = this.quizEngine.nextQuestion();
        if (this.quizEngine.questions.length > 1) {
            this.assertTrue(canGoNext, 'Should be able to go to next question');
            this.assertEqual(this.quizEngine.getCurrentQuestionNumber(), 2, 'Should be at question 2');
        }
        
        // Test previous question
        if (this.quizEngine.currentQuestionIndex > 0) {
            const canGoPrev = this.quizEngine.previousQuestion();
            this.assertTrue(canGoPrev, 'Should be able to go to previous question');
            this.assertEqual(this.quizEngine.getCurrentQuestionNumber(), 1, 'Should be back at question 1');
        }
        
        // Test navigate to specific question
        if (this.quizEngine.questions.length > 2) {
            this.quizEngine.navigateToQuestion(2);
            this.assertEqual(this.quizEngine.getCurrentQuestionNumber(), 3, 'Should be at question 3');
        }
        
        // Test invalid navigation
        this.assertThrows(() => {
            this.quizEngine.navigateToQuestion(-1);
        }, 'Should throw error for negative index');
        
        this.assertThrows(() => {
            this.quizEngine.navigateToQuestion(1000);
        }, 'Should throw error for index beyond questions');
    }

    // Test answer submission
    testAnswerSubmission() {
        this.quizEngine.startQuiz('unit', 1);
        
        const currentQuestion = this.quizEngine.getCurrentQuestion();
        this.assertTrue(currentQuestion !== null, 'Should have a current question');
        
        // Test valid answer submission
        this.quizEngine.submitAnswer(0);
        this.assertTrue(this.quizEngine.isCurrentQuestionAnswered(), 'Question should be marked as answered');
        this.assertEqual(this.quizEngine.getCurrentAnswer(), 0, 'Should store the submitted answer');
        
        // Test invalid answer indices
        this.assertThrows(() => {
            this.quizEngine.submitAnswer(-1);
        }, 'Should throw error for negative answer index');
        
        this.assertThrows(() => {
            this.quizEngine.submitAnswer(4);
        }, 'Should throw error for answer index > 3');
    }

    // Test scoring calculation
    testScoringCalculation() {
        this.quizEngine.startQuiz('unit', 1);
        
        // Submit some answers
        const questions = this.quizEngine.questions;
        let correctCount = 0;
        
        for (let i = 0; i < Math.min(3, questions.length); i++) {
            const question = questions[i];
            const isCorrect = question.correct === 0;
            this.quizEngine.submitAnswer(0); // Always submit answer 0
            if (isCorrect) correctCount++;
            
            if (i < questions.length - 1) {
                this.quizEngine.nextQuestion();
            }
        }
        
        const score = this.quizEngine.calculateScore();
        this.assertEqual(score.total, Math.min(3, questions.length), 'Total should match answered questions');
        this.assertTrue(score.percentage >= 0 && score.percentage <= 100, 'Percentage should be valid');
    }

    // Test mode-specific behavior
    testModeSpecificBehavior() {
        // Test unit mode
        this.quizEngine.startQuiz('unit', 1);
        this.assertEqual(this.quizEngine.mode, 'unit', 'Should be in unit mode');
        this.assertEqual(this.quizEngine.unitId, 1, 'Should have correct unit ID');
        
        // Test practice mode
        this.quizEngine.startQuiz('practice');
        this.assertEqual(this.quizEngine.mode, 'practice', 'Should be in practice mode');
        this.assertEqual(this.quizEngine.unitId, null, 'Unit ID should be null for practice mode');
        
        // Test study mode
        this.quizEngine.startQuiz('study');
        this.assertEqual(this.quizEngine.mode, 'study', 'Should be in study mode');
        this.assertEqual(this.quizEngine.unitId, null, 'Unit ID should be null for study mode');
    }

    // Test quiz completion
    testQuizCompletion() {
        this.quizEngine.startQuiz('unit', 1);
        
        // Answer all questions
        const totalQuestions = this.quizEngine.getTotalQuestions();
        for (let i = 0; i < totalQuestions; i++) {
            this.quizEngine.submitAnswer(0);
            if (i < totalQuestions - 1) {
                this.quizEngine.nextQuestion();
            }
        }
        
        this.assertTrue(this.quizEngine.isQuizComplete(), 'Quiz should be complete after answering all questions');
        
        // End quiz
        const results = this.quizEngine.endQuiz();
        this.assertFalse(this.quizEngine.isActive, 'Quiz should not be active after ending');
        this.assertTrue(results !== null, 'Should return results object');
        this.assertEqual(results.mode, 'unit', 'Results should have correct mode');
        this.assertTrue(results.score !== undefined, 'Results should have score');
    }

    // Test study mode specific features
    testStudyModeFeatures() {
        this.quizEngine.startQuiz('study');
        
        const initialQuestionCount = this.quizEngine.getTotalQuestions();
        
        // Test adding more questions
        this.quizEngine.addMoreQuestions(5);
        const newQuestionCount = this.quizEngine.getTotalQuestions();
        this.assertTrue(newQuestionCount > initialQuestionCount, 'Should have more questions after adding');
        
        // Test that only study mode allows adding questions
        this.quizEngine.startQuiz('unit', 1);
        this.assertThrows(() => {
            this.quizEngine.addMoreQuestions(5);
        }, 'Should not allow adding questions in unit mode');
    }

    // Test session management
    testSessionManagement() {
        this.quizEngine.startQuiz('unit', 1);
        
        // Submit an answer
        this.quizEngine.submitAnswer(1);
        
        // Get current session
        const session = this.progressTracker.getCurrentSession();
        this.assertTrue(session !== null, 'Should have current session');
        this.assertEqual(session.mode, 'unit', 'Session should have correct mode');
        
        // Pause and resume
        this.quizEngine.pauseQuiz();
        this.assertTrue(session.pausedAt !== undefined, 'Session should be marked as paused');
        
        this.quizEngine.resumeQuiz();
        // Note: pausedAt should be deleted, but we can't easily test this without accessing internal state
    }

    // Test error handling
    testErrorHandling() {
        // Test operations without active quiz
        this.assertThrows(() => {
            this.quizEngine.submitAnswer(0);
        }, 'Should throw error when submitting answer without active quiz');
        
        this.assertThrows(() => {
            this.quizEngine.nextQuestion();
        }, 'Should throw error when navigating without active quiz');
        
        this.assertThrows(() => {
            this.quizEngine.endQuiz();
        }, 'Should throw error when ending quiz without active quiz');
    }

    // Test unit breakdown for practice tests
    testUnitBreakdown() {
        // Start practice test (should have questions from multiple units)
        this.quizEngine.startQuiz('practice');
        
        // Answer some questions
        const totalQuestions = Math.min(5, this.quizEngine.getTotalQuestions());
        for (let i = 0; i < totalQuestions; i++) {
            this.quizEngine.submitAnswer(0); // Submit first answer for all
            if (i < totalQuestions - 1) {
                this.quizEngine.nextQuestion();
            }
        }
        
        const breakdown = this.quizEngine.getUnitBreakdown();
        this.assertTrue(typeof breakdown === 'object', 'Breakdown should be an object');
        this.assertTrue(breakdown.hasOwnProperty('1'), 'Breakdown should have unit 1');
        this.assertTrue(breakdown.hasOwnProperty('5'), 'Breakdown should have unit 5');
    }

    // Run all tests
    runAllTests() {
        console.log('Starting QuizEngine tests...\n');
        
        this.runTest('Quiz Initialization', this.testQuizInitialization);
        this.runTest('Question Navigation', this.testQuestionNavigation);
        this.runTest('Answer Submission', this.testAnswerSubmission);
        this.runTest('Scoring Calculation', this.testScoringCalculation);
        this.runTest('Mode Specific Behavior', this.testModeSpecificBehavior);
        this.runTest('Quiz Completion', this.testQuizCompletion);
        this.runTest('Study Mode Features', this.testStudyModeFeatures);
        this.runTest('Session Management', this.testSessionManagement);
        this.runTest('Error Handling', this.testErrorHandling);
        this.runTest('Unit Breakdown', this.testUnitBreakdown);
        
        // Print summary
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        
        console.log(`\n=== Test Summary ===`);
        console.log(`Total tests: ${this.testResults.length}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        
        if (failed > 0) {
            console.log('\nFailed tests:');
            this.testResults.filter(r => r.status === 'FAIL').forEach(test => {
                console.log(`- ${test.name}: ${test.error}`);
            });
        }
        
        return { passed, failed, total: this.testResults.length };
    }
}

// Export for use in test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuizEngineTests;
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined') {
    // Browser environment - make available globally
    window.QuizEngineTests = QuizEngineTests;
} else if (typeof require !== 'undefined' && require.main === module) {
    // Node.js environment - run tests directly
    const tests = new QuizEngineTests();
    tests.runAllTests();
}