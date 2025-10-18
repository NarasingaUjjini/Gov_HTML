/**
 * Tests for ScoringEngine - Comprehensive scoring and analytics system
 */

// Mock Question class for testing
class MockQuestion {
    constructor(id, unit, question, options, correct, explanation = '') {
        this.id = id;
        this.unit = unit;
        this.question = question;
        this.options = options;
        this.correct = correct;
        this.explanation = explanation;
    }

    isCorrect(answerIndex) {
        return answerIndex === this.correct;
    }

    getCorrectAnswer() {
        return this.options[this.correct];
    }
}

// Test data
const createMockQuestions = () => [
    new MockQuestion('q1', 1, 'What is federalism?', ['A', 'B', 'C', 'D'], 1),
    new MockQuestion('q2', 1, 'Which amendment guarantees freedom of speech?', ['A', 'B', 'C', 'D'], 0),
    new MockQuestion('q3', 2, 'What is judicial review?', ['A', 'B', 'C', 'D'], 2),
    new MockQuestion('q4', 2, 'How many branches of government are there?', ['A', 'B', 'C', 'D'], 1),
    new MockQuestion('q5', 3, 'What does the 14th Amendment guarantee?', ['A', 'B', 'C', 'D'], 3)
];

const createMockAnswers = (correctIndices) => {
    return correctIndices.map((isCorrect, index) => ({
        questionId: `q${index + 1}`,
        selectedAnswer: isCorrect ? 1 : 0, // Simplified for testing
        isCorrect: isCorrect,
        timestamp: new Date(Date.now() + index * 1000)
    }));
};

// Test Suite
function runScoringEngineTests() {
    console.log('Running ScoringEngine Tests...');
    
    const scoringEngine = new ScoringEngine();
    let testsPassed = 0;
    let totalTests = 0;

    // Helper function for assertions
    function assert(condition, message) {
        totalTests++;
        if (condition) {
            testsPassed++;
            console.log(`✓ ${message}`);
        } else {
            console.error(`✗ ${message}`);
        }
    }

    // Test 1: Basic Score Calculation
    console.log('\n--- Basic Score Calculation Tests ---');
    
    const questions = createMockQuestions();
    const answers = createMockAnswers([true, true, false, true, false]); // 3/5 correct
    
    const basicScore = scoringEngine.calculateScore(questions, answers, 'unit');
    
    assert(basicScore.correct === 3, 'Should calculate correct answers correctly');
    assert(basicScore.total === 5, 'Should calculate total answers correctly');
    assert(basicScore.percentage === 60, 'Should calculate percentage correctly');
    assert(basicScore.mode === 'unit', 'Should set mode correctly');

    // Test 2: Unit Quiz Scoring
    console.log('\n--- Unit Quiz Scoring Tests ---');
    
    const unitQuestions = questions.filter(q => q.unit === 1);
    const unitAnswers = answers.slice(0, 2); // First 2 answers (both correct)
    
    const unitScore = scoringEngine.calculateScore(unitQuestions, unitAnswers, 'unit');
    
    assert(unitScore.unitId === 1, 'Should identify unit ID correctly');
    assert(unitScore.unitName === 'Foundations of American Democracy', 'Should set unit name correctly');
    assert(unitScore.aptitudeScore === 100, 'Should calculate unit aptitude correctly');
    assert(unitScore.performance === 'excellent', 'Should determine performance level correctly');

    // Test 3: Practice Test Scoring
    console.log('\n--- Practice Test Scoring Tests ---');
    
    const practiceScore = scoringEngine.calculateScore(questions, answers, 'practice');
    
    assert(practiceScore.mode === 'practice', 'Should set practice mode correctly');
    assert(practiceScore.hasOwnProperty('unitBreakdown'), 'Should include unit breakdown');
    assert(practiceScore.hasOwnProperty('apScore'), 'Should include AP score estimate');
    assert(practiceScore.apScore === 3, 'Should estimate AP score correctly for 60%');

    // Test 4: Unit Breakdown Calculation
    console.log('\n--- Unit Breakdown Tests ---');
    
    const breakdown = scoringEngine.calculateUnitBreakdown(questions, answers);
    
    assert(breakdown[1].correct === 2, 'Should count Unit 1 correct answers');
    assert(breakdown[1].total === 2, 'Should count Unit 1 total answers');
    assert(breakdown[1].percentage === 100, 'Should calculate Unit 1 percentage');
    assert(breakdown[2].correct === 1, 'Should count Unit 2 correct answers');
    assert(breakdown[2].total === 2, 'Should count Unit 2 total answers');
    assert(breakdown[2].percentage === 50, 'Should calculate Unit 2 percentage');

    // Test 5: Performance Level Classification
    console.log('\n--- Performance Level Tests ---');
    
    assert(scoringEngine.getPerformanceLevel(95) === 'excellent', 'Should classify 95% as excellent');
    assert(scoringEngine.getPerformanceLevel(85) === 'good', 'Should classify 85% as good');
    assert(scoringEngine.getPerformanceLevel(75) === 'satisfactory', 'Should classify 75% as satisfactory');
    assert(scoringEngine.getPerformanceLevel(65) === 'needs_improvement', 'Should classify 65% as needs improvement');
    assert(scoringEngine.getPerformanceLevel(45) === 'needs_significant_improvement', 'Should classify 45% as needs significant improvement');

    // Test 6: AP Score Estimation
    console.log('\n--- AP Score Estimation Tests ---');
    
    assert(scoringEngine.estimateAPScore(90) === 5, 'Should estimate score 5 for 90%');
    assert(scoringEngine.estimateAPScore(80) === 4, 'Should estimate score 4 for 80%');
    assert(scoringEngine.estimateAPScore(65) === 3, 'Should estimate score 3 for 65%');
    assert(scoringEngine.estimateAPScore(50) === 2, 'Should estimate score 2 for 50%');
    assert(scoringEngine.estimateAPScore(30) === 1, 'Should estimate score 1 for 30%');

    // Test 7: Unit Analysis
    console.log('\n--- Unit Analysis Tests ---');
    
    const unitAnalysis = scoringEngine.analyzeUnitPerformance(breakdown);
    
    assert(unitAnalysis.strengths.length > 0, 'Should identify strengths');
    assert(unitAnalysis.strengths[0].unitId === 1, 'Should identify Unit 1 as strength');
    assert(unitAnalysis.weaknesses.length > 0, 'Should identify weaknesses');
    assert(unitAnalysis.average > 0, 'Should calculate average performance');

    // Test 8: Aptitude Calculation
    console.log('\n--- Aptitude Calculation Tests ---');
    
    const aptitude1 = scoringEngine.calculateAptitude(8, 10, 0, 0);
    assert(aptitude1 === 80, 'Should calculate aptitude correctly for new data');
    
    const aptitude2 = scoringEngine.calculateAptitude(3, 5, 8, 10);
    assert(aptitude2 === 73, 'Should calculate aptitude correctly with previous data');
    
    const aptitude3 = scoringEngine.calculateAptitude(0, 0, 0, 0);
    assert(aptitude3 === 0, 'Should handle zero questions correctly');

    // Test 9: Study Mode Scoring
    console.log('\n--- Study Mode Scoring Tests ---');
    
    const studyAnswers = createMockAnswers([true, false, true, true, false]);
    const studyScore = scoringEngine.calculateScore(questions, studyAnswers, 'study');
    
    assert(studyScore.mode === 'study', 'Should set study mode correctly');
    assert(studyScore.hasOwnProperty('learningProgress'), 'Should include learning progress');
    assert(studyScore.learningProgress.questionsAttempted === 5, 'Should count attempted questions');

    // Test 10: Learning Progress Calculation
    console.log('\n--- Learning Progress Tests ---');
    
    const progressAnswers = [];
    for (let i = 0; i < 10; i++) {
        progressAnswers.push({
            questionId: `q${i}`,
            selectedAnswer: 1,
            isCorrect: i >= 5, // Improvement over time
            timestamp: new Date(Date.now() + i * 60000) // 1 minute apart
        });
    }
    
    const learningProgress = scoringEngine.calculateLearningProgress(questions.slice(0, 10), progressAnswers);
    
    assert(learningProgress.questionsAttempted === 10, 'Should count learning questions correctly');
    assert(learningProgress.improvementTrend === 'improving', 'Should detect improvement trend');

    // Test 11: Results Display Generation
    console.log('\n--- Results Display Tests ---');
    
    const displayData = scoringEngine.generateResultsDisplay(practiceScore);
    
    assert(displayData.hasOwnProperty('summary'), 'Should include summary section');
    assert(displayData.hasOwnProperty('details'), 'Should include details section');
    assert(displayData.hasOwnProperty('recommendations'), 'Should include recommendations');
    assert(displayData.summary.score === '3/5', 'Should format score correctly');
    assert(displayData.summary.percentage === '60%', 'Should format percentage correctly');

    // Test 12: Analytics Summary Generation
    console.log('\n--- Analytics Summary Tests ---');
    
    const mockProgressData = {
        units: {
            1: { correct: 15, total: 20 },
            2: { correct: 12, total: 18 },
            3: { correct: 8, total: 15 },
            4: { correct: 10, total: 12 },
            5: { correct: 5, total: 10 }
        },
        practiceTests: [
            { percentage: 65, date: '2024-01-01' },
            { percentage: 70, date: '2024-01-02' },
            { percentage: 75, date: '2024-01-03' }
        ]
    };
    
    const analyticsSummary = scoringEngine.generateAnalyticsSummary(mockProgressData);
    
    assert(analyticsSummary.totalQuestions === 75, 'Should calculate total questions correctly');
    assert(analyticsSummary.practiceTestsCompleted === 3, 'Should count practice tests correctly');
    assert(analyticsSummary.recentTrend === 'improving', 'Should detect improving trend');
    assert(analyticsSummary.unitsCompleted === 5, 'Should count completed units correctly');

    // Test 13: Recommendations Generation
    console.log('\n--- Recommendations Tests ---');
    
    const unitRecs = scoringEngine.getUnitRecommendations(45, 1);
    assert(unitRecs.length > 0, 'Should generate unit recommendations');
    assert(unitRecs.some(rec => rec.includes('Review')), 'Should suggest review for low scores');
    
    const practiceRecs = scoringEngine.getPracticeRecommendations(unitAnalysis);
    assert(practiceRecs.length > 0, 'Should generate practice recommendations');

    // Test 14: Edge Cases
    console.log('\n--- Edge Case Tests ---');
    
    // Empty answers
    const emptyScore = scoringEngine.calculateScore(questions, [], 'unit');
    assert(emptyScore.correct === 0, 'Should handle empty answers');
    assert(emptyScore.percentage === 0, 'Should calculate 0% for no answers');
    
    // All correct answers
    const allCorrectAnswers = createMockAnswers([true, true, true, true, true]);
    const perfectScore = scoringEngine.calculateScore(questions, allCorrectAnswers, 'practice');
    assert(perfectScore.percentage === 100, 'Should handle perfect scores');
    assert(perfectScore.apScore === 5, 'Should estimate AP score 5 for perfect');

    // Test 15: Time-based Progress Analysis
    console.log('\n--- Time-based Progress Tests ---');
    
    const timeAnswers = [];
    const baseTime = Date.now();
    
    // Create answers with timestamps showing improvement
    for (let i = 0; i < 20; i++) {
        timeAnswers.push({
            questionId: `q${i}`,
            selectedAnswer: 1,
            isCorrect: Math.random() > (0.8 - i * 0.03), // Gradual improvement
            timestamp: new Date(baseTime + i * 30000) // 30 seconds apart
        });
    }
    
    const timeProgress = scoringEngine.calculateTimeBasedProgress(timeAnswers);
    assert(timeProgress.hasOwnProperty('trend'), 'Should analyze time-based trends');
    assert(timeProgress.hasOwnProperty('recent'), 'Should calculate recent performance');

    // Summary
    console.log('\n--- Test Summary ---');
    console.log(`Tests passed: ${testsPassed}/${totalTests}`);
    
    if (testsPassed === totalTests) {
        console.log('🎉 All ScoringEngine tests passed!');
        return true;
    } else {
        console.log(`❌ ${totalTests - testsPassed} tests failed`);
        return false;
    }
}

// Export test function
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runScoringEngineTests, MockQuestion, createMockQuestions, createMockAnswers };
} else {
    // Browser environment - add to global scope
    window.runScoringEngineTests = runScoringEngineTests;
}