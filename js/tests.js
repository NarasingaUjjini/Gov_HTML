/**
 * Unit tests for AP Government quiz tool data models
 * Tests Question class validation and QuestionManager functionality
 */

// Import dependencies (adjust paths as needed for your environment)
// In a browser environment, these would be loaded via script tags

/**
 * Test suite for Question class
 */
function runQuestionTests(testRunner) {
    // Valid question data for testing
    const validQuestionData = {
        id: "test_q1",
        unit: 1,
        question: "What is federalism?",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct: 1,
        explanation: "Test explanation"
    };

    testRunner.test('Question constructor with valid data', () => {
        const question = new Question(validQuestionData);
        testRunner.assertEqual(question.id, "test_q1");
        testRunner.assertEqual(question.unit, 1);
        testRunner.assertEqual(question.question, "What is federalism?");
        testRunner.assertArrayLength(question.options, 4);
        testRunner.assertEqual(question.correct, 1);
        testRunner.assertEqual(question.explanation, "Test explanation");
    });

    testRunner.test('Question validation - missing ID', () => {
        const invalidData = { ...validQuestionData };
        delete invalidData.id;
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question validation - invalid unit (too low)', () => {
        const invalidData = { ...validQuestionData, unit: 0 };
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question validation - invalid unit (too high)', () => {
        const invalidData = { ...validQuestionData, unit: 6 };
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question validation - empty question text', () => {
        const invalidData = { ...validQuestionData, question: "" };
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question validation - wrong number of options', () => {
        const invalidData = { ...validQuestionData, options: ["A", "B", "C"] };
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question validation - empty option', () => {
        const invalidData = { ...validQuestionData, options: ["A", "", "C", "D"] };
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question validation - invalid correct answer index', () => {
        const invalidData = { ...validQuestionData, correct: 4 };
        
        testRunner.assertThrows(() => {
            new Question(invalidData);
        });
    });

    testRunner.test('Question isCorrect method', () => {
        const question = new Question(validQuestionData);
        testRunner.assert(question.isCorrect(1), "Should return true for correct answer");
        testRunner.assert(!question.isCorrect(0), "Should return false for incorrect answer");
        testRunner.assert(!question.isCorrect(2), "Should return false for incorrect answer");
        testRunner.assert(!question.isCorrect(3), "Should return false for incorrect answer");
    });

    testRunner.test('Question getCorrectAnswer method', () => {
        const question = new Question(validQuestionData);
        testRunner.assertEqual(question.getCorrectAnswer(), "Option B");
    });

    testRunner.test('Question getUnitName method', () => {
        const question1 = new Question({ ...validQuestionData, unit: 1 });
        const question2 = new Question({ ...validQuestionData, unit: 2, id: "test2" });
        const question3 = new Question({ ...validQuestionData, unit: 3, id: "test3" });
        const question4 = new Question({ ...validQuestionData, unit: 4, id: "test4" });
        const question5 = new Question({ ...validQuestionData, unit: 5, id: "test5" });
        
        testRunner.assertEqual(question1.getUnitName(), "Foundations of American Democracy");
        testRunner.assertEqual(question2.getUnitName(), "Interactions Among Branches of Government");
        testRunner.assertEqual(question3.getUnitName(), "Civil Liberties and Civil Rights");
        testRunner.assertEqual(question4.getUnitName(), "American Political Ideologies and Beliefs");
        testRunner.assertEqual(question5.getUnitName(), "Political Participation");
    });

    testRunner.test('Question toJSON method', () => {
        const question = new Question(validQuestionData);
        const json = question.toJSON();
        
        testRunner.assertEqual(json.id, validQuestionData.id);
        testRunner.assertEqual(json.unit, validQuestionData.unit);
        testRunner.assertEqual(json.question, validQuestionData.question);
        testRunner.assertArrayLength(json.options, 4);
        testRunner.assertEqual(json.correct, validQuestionData.correct);
        testRunner.assertEqual(json.explanation, validQuestionData.explanation);
    });

    testRunner.test('Question without explanation', () => {
        const dataWithoutExplanation = { ...validQuestionData };
        delete dataWithoutExplanation.explanation;
        
        const question = new Question(dataWithoutExplanation);
        testRunner.assertEqual(question.explanation, "");
    });
}

/**
 * Test suite for QuestionManager class
 */
function runQuestionManagerTests(testRunner) {
    // Sample test data
    const testQuestions = [
        {
            id: "q1", unit: 1, question: "Question 1?", 
            options: ["A", "B", "C", "D"], correct: 0
        },
        {
            id: "q2", unit: 1, question: "Question 2?", 
            options: ["A", "B", "C", "D"], correct: 1
        },
        {
            id: "q3", unit: 2, question: "Question 3?", 
            options: ["A", "B", "C", "D"], correct: 2
        },
        {
            id: "q4", unit: 2, question: "Question 4?", 
            options: ["A", "B", "C", "D"], correct: 3
        },
        {
            id: "q5", unit: 3, question: "Question 5?", 
            options: ["A", "B", "C", "D"], correct: 0
        }
    ];

    testRunner.test('QuestionManager constructor', () => {
        const manager = new QuestionManager();
        testRunner.assertArrayLength(manager.questions, 0);
        testRunner.assert(manager.questionsByUnit instanceof Map);
    });

    testRunner.test('QuestionManager loadQuestions', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        testRunner.assertArrayLength(manager.questions, 5);
        testRunner.assertArrayLength(manager.getQuestionsByUnit(1), 2);
        testRunner.assertArrayLength(manager.getQuestionsByUnit(2), 2);
        testRunner.assertArrayLength(manager.getQuestionsByUnit(3), 1);
        testRunner.assertArrayLength(manager.getQuestionsByUnit(4), 0);
        testRunner.assertArrayLength(manager.getQuestionsByUnit(5), 0);
    });

    testRunner.test('QuestionManager loadQuestions with invalid data', () => {
        const manager = new QuestionManager();
        
        testRunner.assertThrows(() => {
            manager.loadQuestions("not an array");
        });
    });

    testRunner.test('QuestionManager getQuestionsByUnit validation', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        testRunner.assertThrows(() => {
            manager.getQuestionsByUnit(0);
        });
        
        testRunner.assertThrows(() => {
            manager.getQuestionsByUnit(6);
        });
        
        testRunner.assertThrows(() => {
            manager.getQuestionsByUnit("invalid");
        });
    });

    testRunner.test('QuestionManager getRandomQuestions', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        const randomQuestions = manager.getRandomQuestions(3);
        testRunner.assertArrayLength(randomQuestions, 3);
        
        // Test that all returned questions are valid Question objects
        randomQuestions.forEach(q => {
            testRunner.assert(q instanceof Question);
        });
    });

    testRunner.test('QuestionManager getRandomQuestions with unit filter', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        const unit1Questions = manager.getRandomQuestions(2, [1]);
        testRunner.assertArrayLength(unit1Questions, 2);
        
        unit1Questions.forEach(q => {
            testRunner.assertEqual(q.unit, 1);
        });
    });

    testRunner.test('QuestionManager getRandomQuestions validation', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        testRunner.assertThrows(() => {
            manager.getRandomQuestions(0);
        });
        
        testRunner.assertThrows(() => {
            manager.getRandomQuestions(-1);
        });
        
        testRunner.assertThrows(() => {
            manager.getRandomQuestions(2, "invalid");
        });
    });

    testRunner.test('QuestionManager getRandomDistributedQuestions', () => {
        // Create more test data for better distribution testing
        const moreTestQuestions = [];
        for (let unit = 1; unit <= 5; unit++) {
            for (let i = 0; i < 15; i++) {
                moreTestQuestions.push({
                    id: `unit${unit}_q${i}`,
                    unit: unit,
                    question: `Unit ${unit} Question ${i}?`,
                    options: ["A", "B", "C", "D"],
                    correct: i % 4
                });
            }
        }
        
        const manager = new QuestionManager();
        manager.loadQuestions(moreTestQuestions);
        
        const distributedQuestions = manager.getRandomDistributedQuestions(55);
        testRunner.assertArrayLength(distributedQuestions, 55);
        
        // Check that we have questions from all units
        const unitCounts = {};
        distributedQuestions.forEach(q => {
            unitCounts[q.unit] = (unitCounts[q.unit] || 0) + 1;
        });
        
        // Should have questions from all 5 units
        testRunner.assertEqual(Object.keys(unitCounts).length, 5);
        
        // Each unit should have approximately 11 questions (55/5)
        Object.values(unitCounts).forEach(count => {
            testRunner.assert(count >= 10 && count <= 12, `Unit count ${count} should be between 10-12`);
        });
    });

    testRunner.test('QuestionManager validateQuestion', () => {
        const manager = new QuestionManager();
        
        const validQuestion = {
            id: "test", unit: 1, question: "Test?", 
            options: ["A", "B", "C", "D"], correct: 0
        };
        
        const invalidQuestion = {
            id: "test", unit: 6, question: "Test?", 
            options: ["A", "B"], correct: 0
        };
        
        testRunner.assert(manager.validateQuestion(validQuestion));
        testRunner.assert(!manager.validateQuestion(invalidQuestion));
    });

    testRunner.test('QuestionManager getStatistics', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        const stats = manager.getStatistics();
        testRunner.assertEqual(stats.total, 5);
        testRunner.assertEqual(stats.byUnit[1], 2);
        testRunner.assertEqual(stats.byUnit[2], 2);
        testRunner.assertEqual(stats.byUnit[3], 1);
        testRunner.assertEqual(stats.byUnit[4], 0);
        testRunner.assertEqual(stats.byUnit[5], 0);
    });

    testRunner.test('QuestionManager searchQuestions', () => {
        const manager = new QuestionManager();
        manager.loadQuestions(testQuestions);
        
        const results = manager.searchQuestions("Question 1");
        testRunner.assertArrayLength(results, 1);
        testRunner.assertEqual(results[0].id, "q1");
        
        const emptyResults = manager.searchQuestions("nonexistent");
        testRunner.assertArrayLength(emptyResults, 0);
        
        const invalidResults = manager.searchQuestions("");
        testRunner.assertArrayLength(invalidResults, 0);
    });

    testRunner.test('QuestionManager shuffleArray', () => {
        const manager = new QuestionManager();
        const originalArray = [1, 2, 3, 4, 5];
        const shuffled = manager.shuffleArray(originalArray);
        
        // Should have same length
        testRunner.assertArrayLength(shuffled, 5);
        
        // Should contain all original elements
        originalArray.forEach(item => {
            testRunner.assert(shuffled.includes(item));
        });
        
        // Original array should be unchanged
        testRunner.assertEqual(originalArray[0], 1);
        testRunner.assertEqual(originalArray[4], 5);
    });
}

/**
 * Test suite for StorageWrapper class
 */
function runStorageWrapperTests(testRunner) {
    // Mock localStorage for testing
    class MockLocalStorage {
        constructor(shouldFail = false, quotaExceeded = false) {
            this.data = new Map();
            this.shouldFail = shouldFail;
            this.quotaExceeded = quotaExceeded;
            this.length = 0;
        }

        setItem(key, value) {
            if (this.shouldFail) {
                throw new Error('localStorage not available');
            }
            if (this.quotaExceeded) {
                const error = new Error('Storage quota exceeded');
                error.name = 'QuotaExceededError';
                throw error;
            }
            this.data.set(key, value);
            this.length = this.data.size;
        }

        getItem(key) {
            if (this.shouldFail) {
                throw new Error('localStorage not available');
            }
            return this.data.get(key) || null;
        }

        removeItem(key) {
            if (this.shouldFail) {
                throw new Error('localStorage not available');
            }
            const result = this.data.delete(key);
            this.length = this.data.size;
            return result;
        }

        key(index) {
            const keys = Array.from(this.data.keys());
            return keys[index] || null;
        }

        clear() {
            this.data.clear();
            this.length = 0;
        }

        hasOwnProperty(key) {
            return this.data.has(key);
        }
    }

    testRunner.test('StorageWrapper basic operations', () => {
        // Mock successful localStorage
        const originalLocalStorage = global.localStorage;
        global.localStorage = new MockLocalStorage();
        
        const storage = new StorageWrapper();
        const testData = { test: true, number: 42 };
        
        // Test setItem
        const setResult = storage.setItem('test-key', testData);
        testRunner.assert(setResult === true, 'setItem should return true on success');
        
        // Test getItem
        const retrieved = storage.getItem('test-key');
        testRunner.assertEqual(JSON.stringify(retrieved), JSON.stringify(testData));
        
        // Test removeItem
        const removeResult = storage.removeItem('test-key');
        testRunner.assert(removeResult === true, 'removeItem should return true on success');
        
        // Verify removal
        const afterRemoval = storage.getItem('test-key');
        testRunner.assert(afterRemoval === null, 'Data should be null after removal');
        
        // Restore original localStorage
        global.localStorage = originalLocalStorage;
    });

    testRunner.test('StorageWrapper fallback when localStorage unavailable', () => {
        const originalLocalStorage = global.localStorage;
        global.localStorage = new MockLocalStorage(true); // Simulate localStorage failure
        
        const storage = new StorageWrapper();
        const testData = { fallback: true };
        
        // Should use session fallback
        const setResult = storage.setItem('fallback-key', testData);
        testRunner.assert(setResult === true, 'Should successfully store in fallback');
        
        const retrieved = storage.getItem('fallback-key');
        testRunner.assertEqual(JSON.stringify(retrieved), JSON.stringify(testData));
        
        // Restore original localStorage
        global.localStorage = originalLocalStorage;
    });

    testRunner.test('StorageWrapper quota exceeded handling', () => {
        const originalLocalStorage = global.localStorage;
        global.localStorage = new MockLocalStorage(false, true); // Simulate quota exceeded
        
        const storage = new StorageWrapper();
        const testData = { large: 'data' };
        
        // Should handle quota exceeded gracefully
        const setResult = storage.setItem('quota-test', testData);
        testRunner.assert(setResult === false, 'Should return false when quota exceeded');
        
        // Restore original localStorage
        global.localStorage = originalLocalStorage;
    });
}

/**
 * Test suite for ProgressTracker class
 */
function runProgressTrackerTests(testRunner) {
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

    testRunner.test('ProgressTracker initialization', () => {
        const storage = new MockStorageWrapper();
        const tracker = new ProgressTracker(storage);
        
        const progress = tracker.getOverallProgress();
        
        testRunner.assertEqual(progress.totalSeen, 0);
        testRunner.assertEqual(progress.totalCorrect, 0);
        testRunner.assertEqual(progress.overallAptitude, 0);
        testRunner.assertEqual(progress.practiceTestCount, 0);
        
        // Test all units initialized to 0
        for (let i = 1; i <= 5; i++) {
            testRunner.assertEqual(progress.unitAptitudes[i], 0);
            testRunner.assertEqual(tracker.getUnitSeen(i), 0);
        }
    });

    testRunner.test('ProgressTracker unit progress updates', () => {
        const storage = new MockStorageWrapper();
        const tracker = new ProgressTracker(storage);
        
        // Test single unit update
        tracker.updateUnitProgress(1, 8, 10);
        
        testRunner.assertEqual(tracker.getUnitAptitude(1), 80);
        testRunner.assertEqual(tracker.getUnitSeen(1), 10);
        
        // Test multiple updates to same unit
        tracker.updateUnitProgress(1, 7, 10);
        
        testRunner.assertEqual(tracker.getUnitAptitude(1), 75);
        testRunner.assertEqual(tracker.getUnitSeen(1), 20);
    });

    testRunner.test('ProgressTracker aptitude calculations', () => {
        const storage = new MockStorageWrapper();
        const tracker = new ProgressTracker(storage);
        
        // Test perfect score
        tracker.updateUnitProgress(1, 10, 10);
        testRunner.assertEqual(tracker.getUnitAptitude(1), 100);
        
        // Test zero score
        tracker.updateUnitProgress(2, 0, 10);
        testRunner.assertEqual(tracker.getUnitAptitude(2), 0);
        
        // Test rounding
        tracker.updateUnitProgress(3, 1, 3); // 33.333...%
        testRunner.assertEqual(tracker.getUnitAptitude(3), 33);
        
        tracker.updateUnitProgress(4, 2, 3); // 66.666...%
        testRunner.assertEqual(tracker.getUnitAptitude(4), 67);
    });

    testRunner.test('ProgressTracker practice test recording', () => {
        const storage = new MockStorageWrapper();
        const tracker = new ProgressTracker(storage);
        
        const unitBreakdown = { 1: 8, 2: 9, 3: 7, 4: 10, 5: 8 };
        tracker.recordPracticeTest(42, 55, unitBreakdown);
        
        const history = tracker.getPracticeTestHistory();
        testRunner.assertEqual(history.length, 1);
        
        const test = history[0];
        testRunner.assertEqual(test.score, 42);
        testRunner.assertEqual(test.total, 55);
        testRunner.assertEqual(test.percentage, 76);
        testRunner.assertEqual(test.unitBreakdown[1], 8);
    });

    testRunner.test('ProgressTracker error handling', () => {
        const storage = new MockStorageWrapper();
        const tracker = new ProgressTracker(storage);
        
        // Test invalid unit IDs
        testRunner.assertThrows(() => {
            tracker.updateUnitProgress(0, 5, 10);
        });
        
        testRunner.assertThrows(() => {
            tracker.getUnitAptitude(6);
        });
    });

    testRunner.test('ProgressTracker session management', () => {
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
        
        testRunner.assertEqual(retrieved.mode, 'unit');
        testRunner.assertEqual(retrieved.unitId, 1);
        testRunner.assertEqual(retrieved.currentQuestion, 5);
        
        // Test clearing session
        tracker.clearCurrentSession();
        testRunner.assert(tracker.getCurrentSession() === null);
    });
}

/**
 * Integration tests using sample questions
 */
function runIntegrationTests(testRunner) {
    testRunner.test('Integration test with sample questions', () => {
        // This test requires sampleQuestions to be available
        if (typeof sampleQuestions === 'undefined') {
            console.log('⚠️  Skipping integration test - sampleQuestions not available');
            return;
        }
        
        const manager = new QuestionManager();
        manager.loadQuestions(sampleQuestions);
        
        const stats = manager.getStatistics();
        testRunner.assert(stats.total > 0, "Should load sample questions");
        
        // Test that all units have questions
        for (let unit = 1; unit <= 5; unit++) {
            testRunner.assert(stats.byUnit[unit] > 0, `Unit ${unit} should have questions`);
        }
        
        // Test random selection from each unit
        for (let unit = 1; unit <= 5; unit++) {
            const unitQuestions = manager.getQuestionsByUnit(unit);
            testRunner.assert(unitQuestions.length > 0, `Unit ${unit} should have questions`);
            
            unitQuestions.forEach(q => {
                testRunner.assertEqual(q.unit, unit);
                testRunner.assert(q instanceof Question);
            });
        }
        
        // Test distributed question selection
        const distributed = manager.getRandomDistributedQuestions(20);
        testRunner.assertArrayLength(distributed, 20);
        
        // Should have questions from multiple units
        const unitSet = new Set(distributed.map(q => q.unit));
        testRunner.assert(unitSet.size > 1, "Should have questions from multiple units");
    });
}

/**
 * Test suite for Unit Quiz functionality
 */
function runUnitQuizTests(testRunner) {
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

    testRunner.test('Unit quiz question filtering accuracy', () => {
        const questionManager = new QuestionManager();
        questionManager.loadQuestions(testQuestions);
        
        // Test getting questions for each unit
        const unit1Questions = questionManager.getQuestionsByUnit(1);
        testRunner.assertArrayLength(unit1Questions, 2);
        
        unit1Questions.forEach(question => {
            testRunner.assertEqual(question.unit, 1);
        });
        
        const unit2Questions = questionManager.getQuestionsByUnit(2);
        testRunner.assertArrayLength(unit2Questions, 1);
        testRunner.assertEqual(unit2Questions[0].unit, 2);
        
        // Test random question selection for specific unit
        const randomUnit1 = questionManager.getRandomQuestions(1, [1]);
        testRunner.assertArrayLength(randomUnit1, 1);
        testRunner.assertEqual(randomUnit1[0].unit, 1);
    });

    testRunner.test('Unit quiz creation and configuration', () => {
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Test creating unit quiz
        quizEngine.startQuiz('unit', 1);
        
        testRunner.assert(quizEngine.isActive);
        testRunner.assertEqual(quizEngine.mode, 'unit');
        testRunner.assertEqual(quizEngine.unitId, 1);
        
        // Verify all questions are from the correct unit
        quizEngine.questions.forEach(question => {
            testRunner.assertEqual(question.unit, 1);
        });
        
        quizEngine.endQuiz();
    });

    testRunner.test('Unit quiz scoring and results', () => {
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Start unit 1 quiz
        quizEngine.startQuiz('unit', 1);
        
        // Submit answers
        quizEngine.submitAnswer(0); // Correct for first question
        quizEngine.nextQuestion();
        quizEngine.submitAnswer(0); // Incorrect for second question (correct is 1)
        
        // Calculate score
        const score = quizEngine.calculateScore();
        testRunner.assertEqual(score.correct, 1);
        testRunner.assertEqual(score.total, 2);
        testRunner.assertEqual(score.percentage, 50);
        
        // End quiz and check results
        const results = quizEngine.endQuiz();
        testRunner.assertEqual(results.mode, 'unit');
        testRunner.assertEqual(results.unitId, 1);
        testRunner.assertEqual(results.score.correct, 1);
        testRunner.assertEqual(results.score.total, 2);
    });

    testRunner.test('Unit progress tracking integration', () => {
        const storageWrapper = new StorageWrapper();
        const progressTracker = new ProgressTracker(storageWrapper);
        
        // Clear any existing progress
        storageWrapper.clear();
        
        // Update progress for unit 1
        progressTracker.updateUnitProgress(1, 3, 5);
        
        const unitProgress = progressTracker.getUnitProgress(1);
        testRunner.assertEqual(unitProgress.correct, 3);
        testRunner.assertEqual(unitProgress.total, 5);
        testRunner.assertEqual(unitProgress.aptitude, 60);
        
        // Update progress again (should accumulate)
        progressTracker.updateUnitProgress(1, 2, 3);
        
        const updatedProgress = progressTracker.getUnitProgress(1);
        testRunner.assertEqual(updatedProgress.correct, 5);
        testRunner.assertEqual(updatedProgress.total, 8);
    });

    testRunner.test('Unit quiz completion workflow', () => {
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        questionManager.loadQuestions(testQuestions);
        
        // Start unit quiz
        quizEngine.startQuiz('unit', 1);
        const initialQuestionCount = quizEngine.questions.length;
        
        // Answer all questions
        for (let i = 0; i < initialQuestionCount; i++) {
            quizEngine.navigateToQuestion(i);
            quizEngine.submitAnswer(0);
        }
        
        // Check if quiz is complete
        testRunner.assert(quizEngine.isQuizComplete());
        
        // End quiz
        const results = quizEngine.endQuiz();
        
        // Verify results structure
        testRunner.assert(results.quizId !== undefined);
        testRunner.assert(results.startTime !== undefined);
        testRunner.assert(results.endTime !== undefined);
        testRunner.assert(results.score !== undefined);
        testRunner.assertArrayLength(results.questions, initialQuestionCount);
        
        // Verify quiz is no longer active
        testRunner.assert(!quizEngine.isActive);
    });
}

/**
 * Main test runner function
 */
async function runAllTests() {
    const testRunner = new TestRunner();
    
    console.log('🚀 Starting AP Government Quiz Tool Tests\n');
    
    // Run all test suites
    runQuestionTests(testRunner);
    runQuestionManagerTests(testRunner);
    runStorageWrapperTests(testRunner);
    runProgressTrackerTests(testRunner);
    runUnitQuizTests(testRunner);
    runIntegrationTests(testRunner);
    
    // Execute tests
    await testRunner.run();
    
    return testRunner.results;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        runAllTests, 
        runQuestionTests, 
        runQuestionManagerTests, 
        runStorageWrapperTests,
        runProgressTrackerTests,
        runUnitQuizTests,
        runIntegrationTests 
    };
}

// Auto-run tests if this file is loaded directly in browser
if (typeof window !== 'undefined' && window.location) {
    // Make test functions available globally
    window.runAllTests = runAllTests;
    window.runQuestionTests = runQuestionTests;
    window.runQuestionManagerTests = runQuestionManagerTests;
    window.runStorageWrapperTests = runStorageWrapperTests;
    window.runProgressTrackerTests = runProgressTrackerTests;
    window.runUnitQuizTests = runUnitQuizTests;
    window.runIntegrationTests = runIntegrationTests;
}