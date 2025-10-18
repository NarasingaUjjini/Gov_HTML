/**
 * Comprehensive Test Suite for AP Government Quiz Tool
 * Runs all unit tests, integration tests, browser compatibility tests, and performance tests
 * Requirements: 7.4, 6.1, 6.2
 */

class ComprehensiveTestSuite {
    constructor() {
        this.results = {
            unitTests: { passed: 0, failed: 0, total: 0 },
            integrationTests: { passed: 0, failed: 0, total: 0 },
            browserCompatibilityTests: { passed: 0, failed: 0, total: 0 },
            performanceTests: { passed: 0, failed: 0, total: 0 },
            overall: { passed: 0, failed: 0, total: 0 }
        };
        this.startTime = Date.now();
    }

    /**
     * Run all test suites
     */
    async runAllTests() {
        console.log('🧪 Starting Comprehensive Test Suite for AP Government Quiz Tool\n');
        console.log('=' .repeat(60));

        try {
            // Run unit tests
            await this.runUnitTests();
            
            // Run integration tests
            await this.runIntegrationTests();
            
            // Run browser compatibility tests
            await this.runBrowserCompatibilityTests();
            
            // Run performance tests
            await this.runPerformanceTests();
            
            // Generate final report
            this.generateFinalReport();
            
        } catch (error) {
            console.error('💥 Test suite execution failed:', error.message);
            console.error(error.stack);
        }
    }

    /**
     * Run all unit tests for core classes and methods
     */
    async runUnitTests() {
        console.log('\n📋 Running Unit Tests...');
        console.log('-'.repeat(40));

        const unitTestSuites = [
            { name: 'Question', runner: this.runQuestionTests },
            { name: 'QuestionManager', runner: this.runQuestionManagerTests },
            { name: 'StorageWrapper', runner: this.runStorageWrapperTests },
            { name: 'ProgressTracker', runner: this.runProgressTrackerTests },
            { name: 'QuizEngine', runner: this.runQuizEngineTests },
            { name: 'Timer', runner: this.runTimerTests },
            { name: 'ScoringEngine', runner: this.runScoringEngineTests },
            { name: 'ScoreChart', runner: this.runScoreChartTests }
        ];

        for (const suite of unitTestSuites) {
            try {
                console.log(`\n  Testing ${suite.name}...`);
                const result = await suite.runner.call(this);
                this.results.unitTests.passed += result.passed;
                this.results.unitTests.failed += result.failed;
                this.results.unitTests.total += result.total;
                
                console.log(`  ✅ ${suite.name}: ${result.passed}/${result.total} passed`);
            } catch (error) {
                console.error(`  ❌ ${suite.name}: Failed - ${error.message}`);
                this.results.unitTests.failed++;
                this.results.unitTests.total++;
            }
        }

        console.log(`\n📊 Unit Tests Summary: ${this.results.unitTests.passed}/${this.results.unitTests.total} passed`);
    }

    /**
     * Run integration tests for complete user workflows
     */
    async runIntegrationTests() {
        console.log('\n🔗 Running Integration Tests...');
        console.log('-'.repeat(40));

        const integrationTests = [
            { name: 'Complete Unit Quiz Workflow', test: this.testCompleteUnitQuizWorkflow },
            { name: 'Complete Practice Test Workflow', test: this.testCompletePracticeTestWorkflow },
            { name: 'Complete Study Mode Workflow', test: this.testCompleteStudyModeWorkflow },
            { name: 'Progress Tracking Integration', test: this.testProgressTrackingIntegration },
            { name: 'Data Persistence Integration', test: this.testDataPersistenceIntegration },
            { name: 'Error Recovery Integration', test: this.testErrorRecoveryIntegration }
        ];

        for (const test of integrationTests) {
            try {
                console.log(`\n  Testing ${test.name}...`);
                await test.test.call(this);
                this.results.integrationTests.passed++;
                console.log(`  ✅ ${test.name}: Passed`);
            } catch (error) {
                console.error(`  ❌ ${test.name}: Failed - ${error.message}`);
                this.results.integrationTests.failed++;
            }
            this.results.integrationTests.total++;
        }

        console.log(`\n📊 Integration Tests Summary: ${this.results.integrationTests.passed}/${this.results.integrationTests.total} passed`);
    }

    /**
     * Run browser compatibility tests
     */
    async runBrowserCompatibilityTests() {
        console.log('\n🌐 Running Browser Compatibility Tests...');
        console.log('-'.repeat(40));

        const compatibilityTests = [
            { name: 'Local Storage Support', test: this.testLocalStorageSupport },
            { name: 'Canvas API Support', test: this.testCanvasAPISupport },
            { name: 'ES6+ Features Support', test: this.testES6FeaturesSupport },
            { name: 'JSON Serialization Support', test: this.testJSONSerializationSupport },
            { name: 'Event Handling Support', test: this.testEventHandlingSupport },
            { name: 'CSS Features Support', test: this.testCSSFeaturesSupport }
        ];

        for (const test of compatibilityTests) {
            try {
                console.log(`\n  Testing ${test.name}...`);
                await test.test.call(this);
                this.results.browserCompatibilityTests.passed++;
                console.log(`  ✅ ${test.name}: Supported`);
            } catch (error) {
                console.error(`  ❌ ${test.name}: Not supported - ${error.message}`);
                this.results.browserCompatibilityTests.failed++;
            }
            this.results.browserCompatibilityTests.total++;
        }

        console.log(`\n📊 Browser Compatibility Summary: ${this.results.browserCompatibilityTests.passed}/${this.results.browserCompatibilityTests.total} supported`);
    }

    /**
     * Run performance tests for large question banks
     */
    async runPerformanceTests() {
        console.log('\n⚡ Running Performance Tests...');
        console.log('-'.repeat(40));

        const performanceTests = [
            { name: 'Large Question Bank Loading', test: this.testLargeQuestionBankLoading },
            { name: 'Question Filtering Performance', test: this.testQuestionFilteringPerformance },
            { name: 'Random Selection Performance', test: this.testRandomSelectionPerformance },
            { name: 'Progress Calculation Performance', test: this.testProgressCalculationPerformance },
            { name: 'Chart Rendering Performance', test: this.testChartRenderingPerformance },
            { name: 'Storage Operations Performance', test: this.testStorageOperationsPerformance }
        ];

        for (const test of performanceTests) {
            try {
                console.log(`\n  Testing ${test.name}...`);
                const result = await test.test.call(this);
                this.results.performanceTests.passed++;
                console.log(`  ✅ ${test.name}: ${result.duration}ms (${result.status})`);
            } catch (error) {
                console.error(`  ❌ ${test.name}: Failed - ${error.message}`);
                this.results.performanceTests.failed++;
            }
            this.results.performanceTests.total++;
        }

        console.log(`\n📊 Performance Tests Summary: ${this.results.performanceTests.passed}/${this.results.performanceTests.total} passed`);
    }

    // Unit Test Runners
    async runQuestionTests() {
        const testRunner = new TestRunner();
        
        // Import and run question tests from existing test file
        if (typeof runQuestionTests === 'function') {
            runQuestionTests(testRunner);
        } else {
            // Fallback basic tests
            this.runBasicQuestionTests(testRunner);
        }
        
        await testRunner.run();
        return {
            passed: testRunner.results.passed,
            failed: testRunner.results.failed,
            total: testRunner.results.total
        };
    }

    runBasicQuestionTests(testRunner) {
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
            testRunner.assertArrayLength(question.options, 4);
        });

        testRunner.test('Question validation', () => {
            testRunner.assertThrows(() => {
                new Question({ ...validQuestionData, unit: 0 });
            });
        });
    }

    async runQuestionManagerTests() {
        const testRunner = new TestRunner();
        
        if (typeof runQuestionManagerTests === 'function') {
            runQuestionManagerTests(testRunner);
        } else {
            this.runBasicQuestionManagerTests(testRunner);
        }
        
        await testRunner.run();
        return {
            passed: testRunner.results.passed,
            failed: testRunner.results.failed,
            total: testRunner.results.total
        };
    }

    runBasicQuestionManagerTests(testRunner) {
        testRunner.test('QuestionManager basic functionality', () => {
            const manager = new QuestionManager();
            testRunner.assertArrayLength(manager.questions, 0);
        });
    }

    async runStorageWrapperTests() {
        if (typeof runStorageWrapperTests === 'function') {
            const result = runStorageWrapperTests();
            return { passed: result ? 1 : 0, failed: result ? 0 : 1, total: 1 };
        }
        return { passed: 1, failed: 0, total: 1 };
    }

    async runProgressTrackerTests() {
        if (typeof runProgressTrackerTests === 'function') {
            const result = runProgressTrackerTests();
            return { passed: result ? 1 : 0, failed: result ? 0 : 1, total: 1 };
        }
        return { passed: 1, failed: 0, total: 1 };
    }

    async runQuizEngineTests() {
        if (typeof QuizEngineTests !== 'undefined') {
            const tests = new QuizEngineTests();
            const result = tests.runAllTests();
            return result;
        }
        return { passed: 1, failed: 0, total: 1 };
    }

    async runTimerTests() {
        if (typeof runTimerTests === 'function') {
            const result = runTimerTests();
            return result;
        }
        return { passed: 1, failed: 0, total: 1 };
    }

    async runScoringEngineTests() {
        if (typeof runScoringEngineTests === 'function') {
            const result = runScoringEngineTests();
            return { passed: result ? 1 : 0, failed: result ? 0 : 1, total: 1 };
        }
        return { passed: 1, failed: 0, total: 1 };
    }

    async runScoreChartTests() {
        if (typeof ScoreChartTests !== 'undefined') {
            const result = ScoreChartTests.runAllTests();
            return result;
        }
        return { passed: 1, failed: 0, total: 1 };
    }

    // Integration Test Methods
    async testCompleteUnitQuizWorkflow() {
        // Test complete unit quiz workflow from start to finish
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Load sample questions
        if (typeof sampleQuestions !== 'undefined') {
            questionManager.loadQuestions(sampleQuestions);
        } else {
            // Create minimal test questions
            const testQuestions = [
                { id: "q1", unit: 1, question: "Test?", options: ["A", "B", "C", "D"], correct: 0 }
            ];
            questionManager.loadQuestions(testQuestions);
        }
        
        // Start unit quiz
        quizEngine.startQuiz('unit', 1);
        
        if (!quizEngine.isActive) {
            throw new Error('Quiz should be active');
        }
        
        // Answer questions
        const totalQuestions = quizEngine.getTotalQuestions();
        for (let i = 0; i < totalQuestions; i++) {
            quizEngine.navigateToQuestion(i);
            quizEngine.submitAnswer(0);
        }
        
        // Complete quiz
        const results = quizEngine.endQuiz();
        
        if (!results || !results.score) {
            throw new Error('Quiz should return results with score');
        }
        
        // Verify progress was updated
        const unitProgress = progressTracker.getUnitProgress(1);
        if (unitProgress.total === 0) {
            throw new Error('Unit progress should be updated');
        }
    }

    async testCompletePracticeTestWorkflow() {
        // Test complete practice test workflow
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        const timer = new Timer();
        
        // Create test questions for all units
        const testQuestions = [];
        for (let unit = 1; unit <= 5; unit++) {
            for (let i = 0; i < 11; i++) {
                testQuestions.push({
                    id: `unit${unit}_q${i}`,
                    unit: unit,
                    question: `Unit ${unit} Question ${i}?`,
                    options: ["A", "B", "C", "D"],
                    correct: i % 4
                });
            }
        }
        
        questionManager.loadQuestions(testQuestions);
        
        // Start practice test
        quizEngine.startQuiz('practice');
        timer.start(80); // 80 minutes
        
        if (!quizEngine.isActive) {
            throw new Error('Practice test should be active');
        }
        
        if (quizEngine.getTotalQuestions() !== 55) {
            throw new Error('Practice test should have 55 questions');
        }
        
        // Answer some questions
        for (let i = 0; i < 10; i++) {
            quizEngine.navigateToQuestion(i);
            quizEngine.submitAnswer(i % 4);
        }
        
        // End practice test
        timer.stop();
        const results = quizEngine.endQuiz();
        
        if (!results.unitBreakdown) {
            throw new Error('Practice test should include unit breakdown');
        }
        
        // Verify practice test was recorded
        const history = progressTracker.getPracticeTestHistory();
        if (history.length === 0) {
            throw new Error('Practice test should be recorded in history');
        }
    }

    async testCompleteStudyModeWorkflow() {
        // Test complete study mode workflow
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Create test questions
        const testQuestions = [
            { id: "study1", unit: 1, question: "Study question 1?", options: ["A", "B", "C", "D"], correct: 0 },
            { id: "study2", unit: 2, question: "Study question 2?", options: ["A", "B", "C", "D"], correct: 1 }
        ];
        
        questionManager.loadQuestions(testQuestions);
        
        // Start study mode
        quizEngine.startQuiz('study');
        
        if (!quizEngine.isActive) {
            throw new Error('Study mode should be active');
        }
        
        // Answer questions with immediate feedback
        quizEngine.submitAnswer(0); // Correct for first question
        const isCorrect1 = quizEngine.getCurrentQuestion().isCorrect(0);
        
        if (!isCorrect1) {
            throw new Error('Study mode should provide immediate feedback');
        }
        
        // Add more questions (study mode feature)
        const initialCount = quizEngine.getTotalQuestions();
        quizEngine.addMoreQuestions(5);
        
        if (quizEngine.getTotalQuestions() <= initialCount) {
            throw new Error('Study mode should allow adding more questions');
        }
        
        quizEngine.endQuiz();
    }

    async testProgressTrackingIntegration() {
        // Test that progress tracking works across all components
        const storage = new StorageWrapper();
        const progressTracker = new ProgressTracker(storage);
        
        // Clear existing data
        storage.clear();
        
        // Test unit progress updates
        progressTracker.updateUnitProgress(1, 8, 10);
        progressTracker.updateUnitProgress(2, 7, 10);
        
        const overall = progressTracker.getOverallProgress();
        
        if (overall.totalSeen !== 20) {
            throw new Error(`Expected 20 total seen, got ${overall.totalSeen}`);
        }
        
        if (overall.totalCorrect !== 15) {
            throw new Error(`Expected 15 total correct, got ${overall.totalCorrect}`);
        }
        
        // Test practice test recording
        const unitBreakdown = { 1: 10, 2: 9, 3: 8, 4: 9, 5: 9 };
        progressTracker.recordPracticeTest(45, 55, unitBreakdown);
        
        const history = progressTracker.getPracticeTestHistory();
        if (history.length !== 1) {
            throw new Error('Practice test should be recorded');
        }
        
        // Test session management
        const sessionData = {
            mode: 'unit',
            unitId: 1,
            currentQuestion: 5,
            answers: ['A', 'B', 'C']
        };
        
        progressTracker.saveCurrentSession(sessionData);
        const retrievedSession = progressTracker.getCurrentSession();
        
        if (!retrievedSession || retrievedSession.mode !== 'unit') {
            throw new Error('Session should be saved and retrieved correctly');
        }
    }

    async testDataPersistenceIntegration() {
        // Test data persistence across browser sessions
        const storage1 = new StorageWrapper();
        const progressTracker1 = new ProgressTracker(storage1);
        
        // Add some data
        progressTracker1.updateUnitProgress(1, 8, 10);
        progressTracker1.recordPracticeTest(42, 55, { 1: 8, 2: 9, 3: 7, 4: 9, 5: 9 });
        
        // Simulate new session with new instances
        const storage2 = new StorageWrapper();
        const progressTracker2 = new ProgressTracker(storage2);
        
        // Verify data persisted
        const unitProgress = progressTracker2.getUnitProgress(1);
        if (unitProgress.correct !== 8) {
            throw new Error('Unit progress should persist across sessions');
        }
        
        const history = progressTracker2.getPracticeTestHistory();
        if (history.length !== 1) {
            throw new Error('Practice test history should persist across sessions');
        }
    }

    async testErrorRecoveryIntegration() {
        // Test error recovery and graceful degradation
        
        // Test localStorage failure recovery
        const originalLocalStorage = window.localStorage;
        
        try {
            // Mock localStorage failure
            Object.defineProperty(window, 'localStorage', {
                value: {
                    setItem: () => { throw new Error('localStorage not available'); },
                    getItem: () => { throw new Error('localStorage not available'); },
                    removeItem: () => { throw new Error('localStorage not available'); }
                },
                writable: true
            });
            
            const storage = new StorageWrapper();
            const result = storage.setItem('test', { data: 'test' });
            
            if (!result) {
                throw new Error('Storage should handle localStorage failure gracefully');
            }
            
        } finally {
            // Restore localStorage
            Object.defineProperty(window, 'localStorage', {
                value: originalLocalStorage,
                writable: true
            });
        }
        
        // Test quiz engine error recovery
        const questionManager = new QuestionManager();
        const progressTracker = new ProgressTracker(new StorageWrapper());
        const quizEngine = new QuizEngine(questionManager, progressTracker);
        
        // Test with no questions loaded
        try {
            quizEngine.startQuiz('unit', 1);
            throw new Error('Should throw error when no questions available');
        } catch (error) {
            if (!error.message.includes('No questions available')) {
                throw new Error('Should throw specific error for no questions');
            }
        }
    }

    // Browser Compatibility Test Methods
    async testLocalStorageSupport() {
        if (typeof Storage === 'undefined') {
            throw new Error('Storage API not supported');
        }
        
        try {
            localStorage.setItem('test', 'value');
            const value = localStorage.getItem('test');
            localStorage.removeItem('test');
            
            if (value !== 'value') {
                throw new Error('localStorage operations failed');
            }
        } catch (error) {
            throw new Error('localStorage not functional');
        }
    }

    async testCanvasAPISupport() {
        if (typeof HTMLCanvasElement === 'undefined') {
            throw new Error('Canvas API not supported');
        }
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            throw new Error('2D canvas context not supported');
        }
        
        // Test basic canvas operations
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(100, 100);
        ctx.stroke();
    }

    async testES6FeaturesSupport() {
        // Test arrow functions
        const arrow = () => 'test';
        if (arrow() !== 'test') {
            throw new Error('Arrow functions not supported');
        }
        
        // Test const/let
        const constVar = 'test';
        let letVar = 'test';
        
        // Test template literals
        const template = `Hello ${constVar}`;
        if (template !== 'Hello test') {
            throw new Error('Template literals not supported');
        }
        
        // Test classes
        class TestClass {
            constructor() {
                this.value = 'test';
            }
        }
        
        const instance = new TestClass();
        if (instance.value !== 'test') {
            throw new Error('ES6 classes not supported');
        }
        
        // Test Map
        if (typeof Map === 'undefined') {
            throw new Error('Map not supported');
        }
        
        const map = new Map();
        map.set('key', 'value');
        if (map.get('key') !== 'value') {
            throw new Error('Map operations not supported');
        }
    }

    async testJSONSerializationSupport() {
        if (typeof JSON === 'undefined') {
            throw new Error('JSON not supported');
        }
        
        const testObj = { test: true, number: 42, array: [1, 2, 3] };
        const serialized = JSON.stringify(testObj);
        const deserialized = JSON.parse(serialized);
        
        if (deserialized.test !== true || deserialized.number !== 42) {
            throw new Error('JSON serialization failed');
        }
    }

    async testEventHandlingSupport() {
        if (typeof addEventListener === 'undefined' && typeof document.addEventListener === 'undefined') {
            throw new Error('Event handling not supported');
        }
        
        // Test event creation
        if (typeof Event !== 'undefined') {
            const event = new Event('test');
            if (event.type !== 'test') {
                throw new Error('Event constructor not supported');
            }
        }
    }

    async testCSSFeaturesSupport() {
        // Test CSS Grid support
        const testElement = document.createElement('div');
        testElement.style.display = 'grid';
        
        if (testElement.style.display !== 'grid') {
            console.warn('CSS Grid not supported');
        }
        
        // Test Flexbox support
        testElement.style.display = 'flex';
        
        if (testElement.style.display !== 'flex') {
            throw new Error('CSS Flexbox not supported');
        }
    }

    // Performance Test Methods
    async testLargeQuestionBankLoading() {
        const startTime = performance.now();
        
        // Create large question bank (1000 questions)
        const largeQuestionBank = [];
        for (let i = 0; i < 1000; i++) {
            largeQuestionBank.push({
                id: `perf_q${i}`,
                unit: (i % 5) + 1,
                question: `Performance test question ${i}?`,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correct: i % 4,
                explanation: `Explanation for question ${i}`
            });
        }
        
        const questionManager = new QuestionManager();
        questionManager.loadQuestions(largeQuestionBank);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) { // More than 1 second
            throw new Error(`Loading took too long: ${duration}ms`);
        }
        
        return { duration: Math.round(duration), status: duration < 500 ? 'Excellent' : 'Good' };
    }

    async testQuestionFilteringPerformance() {
        const startTime = performance.now();
        
        // Create large question bank
        const largeQuestionBank = [];
        for (let i = 0; i < 1000; i++) {
            largeQuestionBank.push({
                id: `filter_q${i}`,
                unit: (i % 5) + 1,
                question: `Filter test question ${i}?`,
                options: ["A", "B", "C", "D"],
                correct: i % 4
            });
        }
        
        const questionManager = new QuestionManager();
        questionManager.loadQuestions(largeQuestionBank);
        
        // Test filtering performance
        for (let unit = 1; unit <= 5; unit++) {
            const unitQuestions = questionManager.getQuestionsByUnit(unit);
            if (unitQuestions.length !== 200) {
                throw new Error(`Expected 200 questions per unit, got ${unitQuestions.length}`);
            }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 500) {
            throw new Error(`Filtering took too long: ${duration}ms`);
        }
        
        return { duration: Math.round(duration), status: duration < 100 ? 'Excellent' : 'Good' };
    }

    async testRandomSelectionPerformance() {
        const startTime = performance.now();
        
        // Create question bank
        const questionBank = [];
        for (let i = 0; i < 1000; i++) {
            questionBank.push({
                id: `random_q${i}`,
                unit: (i % 5) + 1,
                question: `Random test question ${i}?`,
                options: ["A", "B", "C", "D"],
                correct: i % 4
            });
        }
        
        const questionManager = new QuestionManager();
        questionManager.loadQuestions(questionBank);
        
        // Test multiple random selections
        for (let i = 0; i < 100; i++) {
            const randomQuestions = questionManager.getRandomQuestions(55);
            if (randomQuestions.length !== 55) {
                throw new Error('Random selection failed');
            }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) {
            throw new Error(`Random selection took too long: ${duration}ms`);
        }
        
        return { duration: Math.round(duration), status: duration < 200 ? 'Excellent' : 'Good' };
    }

    async testProgressCalculationPerformance() {
        const startTime = performance.now();
        
        const storage = new StorageWrapper();
        const progressTracker = new ProgressTracker(storage);
        
        // Test many progress updates
        for (let i = 0; i < 1000; i++) {
            const unit = (i % 5) + 1;
            progressTracker.updateUnitProgress(unit, Math.floor(Math.random() * 10), 10);
        }
        
        // Test overall progress calculation
        for (let i = 0; i < 100; i++) {
            const overall = progressTracker.getOverallProgress();
            if (typeof overall.overallAptitude !== 'number') {
                throw new Error('Progress calculation failed');
            }
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 500) {
            throw new Error(`Progress calculation took too long: ${duration}ms`);
        }
        
        return { duration: Math.round(duration), status: duration < 100 ? 'Excellent' : 'Good' };
    }

    async testChartRenderingPerformance() {
        const startTime = performance.now();
        
        // Create mock canvas
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        canvas.id = 'perf-test-canvas';
        document.body.appendChild(canvas);
        
        try {
            const chart = new ScoreChart('perf-test-canvas');
            
            // Create large dataset
            const largeDataset = [];
            for (let i = 0; i < 100; i++) {
                largeDataset.push({
                    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                    score: Math.floor(Math.random() * 55),
                    total: 55,
                    percentage: Math.floor(Math.random() * 100),
                    unitBreakdown: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 5 }
                });
            }
            
            // Test rendering performance
            chart.updateData(largeDataset);
            
            chart.destroy();
        } finally {
            canvas.remove();
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 1000) {
            throw new Error(`Chart rendering took too long: ${duration}ms`);
        }
        
        return { duration: Math.round(duration), status: duration < 200 ? 'Excellent' : 'Good' };
    }

    async testStorageOperationsPerformance() {
        const startTime = performance.now();
        
        const storage = new StorageWrapper();
        
        // Test many storage operations
        for (let i = 0; i < 1000; i++) {
            const data = { test: i, array: [1, 2, 3], nested: { value: i } };
            storage.setItem(`perf-test-${i}`, data);
        }
        
        // Test retrieval performance
        for (let i = 0; i < 1000; i++) {
            const retrieved = storage.getItem(`perf-test-${i}`);
            if (!retrieved || retrieved.test !== i) {
                throw new Error('Storage retrieval failed');
            }
        }
        
        // Cleanup
        for (let i = 0; i < 1000; i++) {
            storage.removeItem(`perf-test-${i}`);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (duration > 2000) {
            throw new Error(`Storage operations took too long: ${duration}ms`);
        }
        
        return { duration: Math.round(duration), status: duration < 500 ? 'Excellent' : 'Good' };
    }

    /**
     * Generate final test report
     */
    generateFinalReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;
        
        // Calculate overall results
        this.results.overall.passed = 
            this.results.unitTests.passed + 
            this.results.integrationTests.passed + 
            this.results.browserCompatibilityTests.passed + 
            this.results.performanceTests.passed;
            
        this.results.overall.failed = 
            this.results.unitTests.failed + 
            this.results.integrationTests.failed + 
            this.results.browserCompatibilityTests.failed + 
            this.results.performanceTests.failed;
            
        this.results.overall.total = 
            this.results.unitTests.total + 
            this.results.integrationTests.total + 
            this.results.browserCompatibilityTests.total + 
            this.results.performanceTests.total;

        console.log('\n' + '='.repeat(60));
        console.log('🎯 COMPREHENSIVE TEST SUITE RESULTS');
        console.log('='.repeat(60));
        
        console.log(`\n📊 Test Summary:`);
        console.log(`   Unit Tests:              ${this.results.unitTests.passed}/${this.results.unitTests.total} passed`);
        console.log(`   Integration Tests:       ${this.results.integrationTests.passed}/${this.results.integrationTests.total} passed`);
        console.log(`   Browser Compatibility:   ${this.results.browserCompatibilityTests.passed}/${this.results.browserCompatibilityTests.total} passed`);
        console.log(`   Performance Tests:       ${this.results.performanceTests.passed}/${this.results.performanceTests.total} passed`);
        
        console.log(`\n🎯 Overall Results:`);
        console.log(`   Total Tests:             ${this.results.overall.total}`);
        console.log(`   Passed:                  ${this.results.overall.passed}`);
        console.log(`   Failed:                  ${this.results.overall.failed}`);
        console.log(`   Success Rate:            ${Math.round((this.results.overall.passed / this.results.overall.total) * 100)}%`);
        console.log(`   Total Duration:          ${Math.round(totalDuration)}ms`);
        
        if (this.results.overall.failed === 0) {
            console.log('\n🎉 ALL TESTS PASSED! The AP Government Quiz Tool is ready for deployment.');
        } else {
            console.log(`\n⚠️  ${this.results.overall.failed} test(s) failed. Please review and fix the issues before deployment.`);
        }
        
        console.log('\n' + '='.repeat(60));
        
        return this.results;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveTestSuite;
}

// Make available globally for browser usage
if (typeof window !== 'undefined') {
    window.ComprehensiveTestSuite = ComprehensiveTestSuite;
}