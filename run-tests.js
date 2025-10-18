/**
 * Node.js test runner for AP Government quiz tool
 * Runs tests in Node.js environment for CI/CD compatibility
 */

// Import the modules
const Question = require('./js/question.js');
const QuestionManager = require('./js/question-manager.js');
const sampleQuestions = require('./js/sample-questions.js');
const TestRunner = require('./js/test-runner.js');

// Make classes available globally for tests
global.Question = Question;
global.QuestionManager = QuestionManager;
global.sampleQuestions = sampleQuestions;
global.TestRunner = TestRunner;

// Import test functions
const { runAllTests } = require('./js/tests.js');

// Run the tests
async function main() {
    console.log('🚀 AP Government Quiz Tool - Node.js Test Runner\n');
    
    try {
        const results = await runAllTests();
        
        // Exit with appropriate code
        process.exit(results.failed === 0 ? 0 : 1);
    } catch (error) {
        console.error('💥 Test execution failed:', error.message);
        process.exit(1);
    }
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}