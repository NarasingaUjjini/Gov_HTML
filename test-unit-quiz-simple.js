/**
 * Simple unit quiz functionality test
 */

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

// Load required modules
const fs = require('fs');
const path = require('path');

function loadFile(filePath) {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    eval(content);
}

try {
    // Load dependencies
    loadFile('js/question.js');
    loadFile('js/storage-wrapper.js');
    loadFile('js/progress-tracker.js');
    loadFile('js/question-manager.js');
    loadFile('js/quiz-engine.js');
    loadFile('js/sample-questions.js');
    
    console.log('🧪 Testing Unit Quiz Functionality...\n');
    
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
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    // Test 1: Unit question selection accuracy
    try {
        console.log('Test 1: Unit question selection accuracy');
        const questionManager = new QuestionManager();
        questionManager.loadQuestions(testQuestions);
        
        // Test getting questions for unit 1
        const unit1Questions = questionManager.getQuestionsByUnit(1);
        if (unit1Questions.length !== 2) {
            throw new Error(`Expected 2 questions for unit 1, got ${unit1Questions.length}`);
        }
        
        // Verify all questions belong to unit 1
        unit1Questions.forEach(question => {
            if (question.unit !== 1) {
                throw new Error(`Expected unit 1, got unit ${question.unit}`);
            }
        });
        
        // Test random question selection for specific unit
        const randomUnit1 = questionManager.getRandomQuestions(1, [1]);
        if (randomUnit1.length !== 1) {
            throw new Error(`Expected 1 random question, got ${randomUnit1.length}`);
        }
        if (randomUnit1[0].unit !== 1) {
            throw new Error(`Expected unit 1, got unit ${randomUnit1[0].unit}`);
        }
        
        console.log('✅ Unit question selection works correctly');
        passed++;
    } catch (error) {
        console.log('❌ Unit question selection failed:', error.message);
        failed++;
    }
    
    // Test 2: Unit quiz creation
    try {
        console.log('Test 2: Unit quiz creation');
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Start unit 1 quiz
        quizEngine.startQuiz('unit', 1);
        
        if (!quizEngine.isActive) {
            throw new Error('Quiz should be active after starting');
        }
        if (quizEngine.mode !== 'unit') {
            throw new Error(`Expected mode 'unit', got '${quizEngine.mode}'`);
        }
        if (quizEngine.unitId !== 1) {
            throw new Error(`Expected unit ID 1, got ${quizEngine.unitId}`);
        }
        
        // Verify all questions are from unit 1
        quizEngine.questions.forEach(question => {
            if (question.unit !== 1) {
                throw new Error(`Expected unit 1, got unit ${question.unit}`);
            }
        });
        
        quizEngine.endQuiz();
        console.log('✅ Unit quiz creation works correctly');
        passed++;
    } catch (error) {
        console.log('❌ Unit quiz creation failed:', error.message);
        failed++;
    }
    
    // Test 3: Unit quiz scoring
    try {
        console.log('Test 3: Unit quiz scoring');
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Start unit 1 quiz
        quizEngine.startQuiz('unit', 1);
        
        // Submit correct answer for first question
        quizEngine.submitAnswer(0); // Correct
        quizEngine.nextQuestion();
        
        // Submit incorrect answer for second question
        quizEngine.submitAnswer(0); // Incorrect (correct is 1)
        
        // Calculate score
        const score = quizEngine.calculateScore();
        if (score.correct !== 1) {
            throw new Error(`Expected 1 correct, got ${score.correct}`);
        }
        if (score.total !== 2) {
            throw new Error(`Expected 2 total, got ${score.total}`);
        }
        if (score.percentage !== 50) {
            throw new Error(`Expected 50%, got ${score.percentage}%`);
        }
        
        // End quiz and check results
        const results = quizEngine.endQuiz();
        if (results.mode !== 'unit') {
            throw new Error(`Expected mode 'unit', got '${results.mode}'`);
        }
        if (results.unitId !== 1) {
            throw new Error(`Expected unit ID 1, got ${results.unitId}`);
        }
        
        console.log('✅ Unit quiz scoring works correctly');
        passed++;
    } catch (error) {
        console.log('❌ Unit quiz scoring failed:', error.message);
        failed++;
    }
    
    // Test 4: Unit progress tracking
    try {
        console.log('Test 4: Unit progress tracking');
        const storageWrapper = new StorageWrapper();
        const progressTracker = new ProgressTracker(storageWrapper);
        
        // Clear any existing progress
        storageWrapper.clear();
        
        // Update progress for unit 1
        progressTracker.updateUnitProgress(1, 3, 5);
        
        const unitProgress = progressTracker.getUnitProgress(1);
        if (unitProgress.correct !== 3) {
            throw new Error(`Expected 3 correct, got ${unitProgress.correct}`);
        }
        if (unitProgress.total !== 5) {
            throw new Error(`Expected 5 total, got ${unitProgress.total}`);
        }
        if (unitProgress.aptitude !== 60) {
            throw new Error(`Expected 60% aptitude, got ${unitProgress.aptitude}%`);
        }
        
        console.log('✅ Unit progress tracking works correctly');
        passed++;
    } catch (error) {
        console.log('❌ Unit progress tracking failed:', error.message);
        failed++;
    }
    
    // Test 5: Sample questions integration
    try {
        console.log('Test 5: Sample questions integration');
        const questionManager = new QuestionManager();
        
        if (typeof sampleQuestions !== 'undefined') {
            questionManager.loadQuestions(sampleQuestions);
            
            // Test that all units have questions
            for (let unit = 1; unit <= 5; unit++) {
                const unitQuestions = questionManager.getQuestionsByUnit(unit);
                if (unitQuestions.length === 0) {
                    throw new Error(`Unit ${unit} should have questions`);
                }
                
                // Verify all questions belong to the correct unit
                unitQuestions.forEach(question => {
                    if (question.unit !== unit) {
                        throw new Error(`Unit ${unit} contains question from unit ${question.unit}`);
                    }
                });
            }
            
            console.log('✅ Sample questions integration works correctly');
            passed++;
        } else {
            console.log('⚠️  Skipping sample questions test - not available');
        }
    } catch (error) {
        console.log('❌ Sample questions integration failed:', error.message);
        failed++;
    }
    
    // Summary
    console.log('\n📊 Test Results:');
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total:  ${passed + failed}`);
    
    if (failed === 0) {
        console.log('🎉 All unit quiz tests passed!');
        process.exit(0);
    } else {
        console.log(`❌ ${failed} test(s) failed`);
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.error(error.stack);
    process.exit(1);
}