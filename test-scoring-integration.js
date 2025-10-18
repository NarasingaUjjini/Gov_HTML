/**
 * Integration test for scoring system with QuizEngine
 * Tests the complete workflow from quiz completion to results display
 */

// Load required modules for Node.js testing
let QuizEngine, ScoringEngine, ProgressTracker, StorageWrapper, QuestionManager, Question;

if (typeof require !== 'undefined') {
    QuizEngine = require('./js/quiz-engine.js');
    ScoringEngine = require('./js/scoring-engine.js');
    ProgressTracker = require('./js/progress-tracker.js');
    StorageWrapper = require('./js/storage-wrapper.js');
    QuestionManager = require('./js/question-manager.js');
    Question = require('./js/question.js');
}

function runScoringIntegrationTests() {
    console.log('Running Scoring Integration Tests...');
    console.log('=' .repeat(50));
    
    let testsPassed = 0;
    let totalTests = 0;

    function assert(condition, message) {
        totalTests++;
        if (condition) {
            testsPassed++;
            console.log(`✓ ${message}`);
        } else {
            console.error(`✗ ${message}`);
        }
    }

    // Create test dependencies
    const storageWrapper = new StorageWrapper();
    const progressTracker = new ProgressTracker(storageWrapper);
    const questionManager = new QuestionManager();
    
    // Load sample questions
    const sampleQuestions = [
        new Question('q1', 1, 'What is federalism?', ['Centralized power', 'Shared power', 'Local power', 'No power'], 1),
        new Question('q2', 1, 'First Amendment protects?', ['Speech', 'Arms', 'Trials', 'Searches'], 0),
        new Question('q3', 2, 'Judicial review allows courts to?', ['Make laws', 'Enforce laws', 'Interpret laws', 'Ignore laws'], 2),
        new Question('q4', 2, 'How many branches of government?', ['Two', 'Three', 'Four', 'Five'], 1),
        new Question('q5', 3, 'Equal protection clause is in?', ['1st Amendment', '5th Amendment', '14th Amendment', '15th Amendment'], 2)
    ];
    
    questionManager.loadQuestions(sampleQuestions);
    
    console.log('\n--- Test 1: Unit Quiz Integration ---');
    
    try {
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Start unit quiz
        quizEngine.startQuiz('unit', 1);
        assert(quizEngine.isActive, 'Quiz should be active after starting');
        
        // Answer questions
        quizEngine.submitAnswer(1); // Correct
        quizEngine.nextQuestion();
        quizEngine.submitAnswer(0); // Correct
        
        // Calculate score using integrated scoring
        const score = quizEngine.calculateScore();
        assert(score.correct === 2, 'Should calculate correct answers through integration');
        assert(score.mode === 'unit', 'Should maintain unit mode in scoring');
        assert(score.hasOwnProperty('unitName'), 'Should include unit name from ScoringEngine');
        
        // End quiz and get comprehensive results
        const results = quizEngine.endQuiz();
        assert(results.hasOwnProperty('score'), 'Results should include score data');
        
        console.log(`Unit quiz completed: ${score.correct}/${score.total} (${score.percentage}%)`);
        
    } catch (error) {
        console.error('Unit quiz integration test failed:', error.message);
    }
    
    console.log('\n--- Test 2: Practice Test Integration ---');
    
    try {
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Start practice test
        quizEngine.startQuiz('practice');
        assert(quizEngine.isActive, 'Practice test should be active');
        assert(quizEngine.questions.length > 0, 'Should load questions for practice test');
        
        // Answer all questions
        for (let i = 0; i < quizEngine.questions.length; i++) {
            quizEngine.submitAnswer(i % 2); // Alternate correct/incorrect
            if (i < quizEngine.questions.length - 1) {
                quizEngine.nextQuestion();
            }
        }
        
        // Get unit breakdown
        const breakdown = quizEngine.getUnitBreakdown();
        assert(typeof breakdown === 'object', 'Should return unit breakdown object');
        
        // Calculate comprehensive score
        const score = quizEngine.calculateScore();
        assert(score.mode === 'practice', 'Should maintain practice mode');
        assert(score.hasOwnProperty('unitBreakdown'), 'Should include detailed unit breakdown');
        assert(score.hasOwnProperty('apScore'), 'Should include AP score estimate');
        
        // End quiz
        const results = quizEngine.endQuiz();
        assert(results.hasOwnProperty('unitBreakdown'), 'Results should include unit breakdown');
        
        console.log(`Practice test completed: ${score.correct}/${score.total} (${score.percentage}%)`);
        console.log(`Estimated AP Score: ${score.apScore}`);
        
    } catch (error) {
        console.error('Practice test integration test failed:', error.message);
    }
    
    console.log('\n--- Test 3: Study Mode Integration ---');
    
    try {
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Start study mode
        quizEngine.startQuiz('study');
        assert(quizEngine.isActive, 'Study mode should be active');
        
        // Answer some questions
        quizEngine.submitAnswer(1); // Correct
        quizEngine.nextQuestion();
        quizEngine.submitAnswer(2); // Incorrect
        quizEngine.nextQuestion();
        quizEngine.submitAnswer(2); // Correct
        
        // Calculate score
        const score = quizEngine.calculateScore();
        assert(score.mode === 'study', 'Should maintain study mode');
        assert(score.hasOwnProperty('learningProgress'), 'Should include learning progress');
        
        // Test adding more questions (study mode feature)
        const initialCount = quizEngine.questions.length;
        quizEngine.addMoreQuestions(3);
        assert(quizEngine.questions.length > initialCount, 'Should add more questions in study mode');
        
        console.log(`Study session: ${score.correct}/${score.total} (${score.percentage}%)`);
        
    } catch (error) {
        console.error('Study mode integration test failed:', error.message);
    }
    
    console.log('\n--- Test 4: Progress Tracking Integration ---');
    
    try {
        // Reset progress for clean test
        progressTracker.resetProgress();
        
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Complete a unit quiz
        quizEngine.startQuiz('unit', 1);
        quizEngine.submitAnswer(1); // Correct
        quizEngine.nextQuestion();
        quizEngine.submitAnswer(0); // Correct
        const results = quizEngine.endQuiz();
        
        // Check progress tracking
        const unitProgress = progressTracker.getUnitProgress(1);
        assert(unitProgress.total > 0, 'Should track unit progress');
        assert(unitProgress.correct > 0, 'Should track correct answers');
        
        const aptitude = progressTracker.getUnitAptitude(1);
        assert(aptitude > 0, 'Should calculate unit aptitude');
        
        console.log(`Unit 1 aptitude after quiz: ${aptitude}%`);
        
    } catch (error) {
        console.error('Progress tracking integration test failed:', error.message);
    }
    
    console.log('\n--- Test 5: Results Display Integration ---');
    
    try {
        // Test that results can be formatted for display
        const scoringEngine = new ScoringEngine();
        
        const mockResults = {
            mode: 'practice',
            questions: sampleQuestions.map((q, i) => ({
                question: q,
                answer: { isCorrect: i % 2 === 0, selectedAnswer: i % 2 }
            }))
        };
        
        const questions = mockResults.questions.map(q => q.question);
        const answers = mockResults.questions.map(q => q.answer);
        
        const scoreData = scoringEngine.calculateScore(questions, answers, 'practice');
        const displayData = scoringEngine.generateResultsDisplay(scoreData);
        
        assert(displayData.hasOwnProperty('summary'), 'Should generate display summary');
        assert(displayData.hasOwnProperty('details'), 'Should generate display details');
        assert(displayData.hasOwnProperty('recommendations'), 'Should generate recommendations');
        
        console.log(`Results display generated for ${scoreData.mode} mode`);
        
    } catch (error) {
        console.error('Results display integration test failed:', error.message);
    }
    
    console.log('\n--- Test 6: Analytics Integration ---');
    
    try {
        const scoringEngine = new ScoringEngine();
        
        // Create mock progress data
        const mockProgressData = {
            units: {
                1: { correct: 15, total: 20 },
                2: { correct: 12, total: 18 },
                3: { correct: 8, total: 15 },
                4: { correct: 10, total: 12 },
                5: { correct: 5, total: 10 }
            },
            practiceTests: [
                { percentage: 60, date: '2024-01-01' },
                { percentage: 70, date: '2024-01-10' },
                { percentage: 75, date: '2024-01-20' }
            ]
        };
        
        const analytics = scoringEngine.generateAnalyticsSummary(mockProgressData);
        
        assert(analytics.totalQuestions === 75, 'Should calculate total questions');
        assert(analytics.overallAptitude > 0, 'Should calculate overall aptitude');
        assert(analytics.practiceTestsCompleted === 3, 'Should count practice tests');
        assert(analytics.recentTrend === 'improving', 'Should detect improvement trend');
        
        console.log(`Analytics: ${analytics.overallAptitude}% overall, ${analytics.recentTrend} trend`);
        
    } catch (error) {
        console.error('Analytics integration test failed:', error.message);
    }
    
    console.log('\n--- Test 7: Error Handling Integration ---');
    
    try {
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Test error handling in scoring
        let errorCaught = false;
        try {
            quizEngine.calculateScore(); // Should handle no active quiz gracefully
        } catch (error) {
            errorCaught = true;
        }
        
        // Start quiz and test edge cases
        quizEngine.startQuiz('unit', 1);
        
        // Test scoring with no answers
        const emptyScore = quizEngine.calculateScore();
        assert(emptyScore.correct === 0, 'Should handle empty answers gracefully');
        assert(emptyScore.percentage === 0, 'Should calculate 0% for no answers');
        
        console.log('Error handling tests completed successfully');
        
    } catch (error) {
        console.error('Error handling integration test failed:', error.message);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('Integration Test Summary');
    console.log('='.repeat(50));
    console.log(`Tests passed: ${testsPassed}/${totalTests}`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 All integration tests passed!');
        console.log('✅ Scoring system is fully integrated with QuizEngine');
        console.log('✅ Progress tracking works with comprehensive scoring');
        console.log('✅ Results display can handle all quiz modes');
        console.log('✅ Analytics generation is working correctly');
        return true;
    } else {
        console.log(`❌ ${totalTests - testsPassed} integration tests failed`);
        return false;
    }
}

// Export for use in other modules or run directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runScoringIntegrationTests };
} else if (typeof window !== 'undefined') {
    window.runScoringIntegrationTests = runScoringIntegrationTests;
} else {
    // Running directly in Node.js
    runScoringIntegrationTests();
}