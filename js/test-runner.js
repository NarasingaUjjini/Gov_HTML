/**
 * Simple test runner for AP Government quiz tool
 * Provides basic testing functionality without external dependencies
 */

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }

    /**
     * Adds a test to the test suite
     * @param {string} name - Test name
     * @param {Function} testFn - Test function
     */
    test(name, testFn) {
        this.tests.push({ name, testFn });
    }

    /**
     * Runs all tests and reports results
     */
    async run() {
        console.log('🧪 Running tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                this.results.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.results.failed++;
                console.log(`❌ ${test.name}`);
                console.log(`   Error: ${error.message}`);
            }
            this.results.total++;
        }

        this.printSummary();
    }

    /**
     * Prints test results summary
     */
    printSummary() {
        console.log('\n📊 Test Results:');
        console.log(`   Passed: ${this.results.passed}`);
        console.log(`   Failed: ${this.results.failed}`);
        console.log(`   Total:  ${this.results.total}`);
        
        if (this.results.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log(`⚠️  ${this.results.failed} test(s) failed`);
        }
    }

    /**
     * Assertion helper - throws error if condition is false
     * @param {boolean} condition - Condition to test
     * @param {string} message - Error message if assertion fails
     */
    assert(condition, message = 'Assertion failed') {
        if (!condition) {
            throw new Error(message);
        }
    }

    /**
     * Assertion helper - checks if two values are equal
     * @param {*} actual - Actual value
     * @param {*} expected - Expected value
     * @param {string} message - Error message if assertion fails
     */
    assertEqual(actual, expected, message = `Expected ${expected}, got ${actual}`) {
        if (actual !== expected) {
            throw new Error(message);
        }
    }

    /**
     * Assertion helper - checks if array lengths are equal
     * @param {Array} actual - Actual array
     * @param {number} expectedLength - Expected length
     * @param {string} message - Error message if assertion fails
     */
    assertArrayLength(actual, expectedLength, message = `Expected array length ${expectedLength}, got ${actual.length}`) {
        if (!Array.isArray(actual) || actual.length !== expectedLength) {
            throw new Error(message);
        }
    }

    /**
     * Assertion helper - checks if function throws an error
     * @param {Function} fn - Function that should throw
     * @param {string} message - Error message if assertion fails
     */
    assertThrows(fn, message = 'Expected function to throw an error') {
        try {
            fn();
            throw new Error(message);
        } catch (error) {
            // Expected behavior - function threw an error
            if (error.message === message) {
                throw error; // Re-throw if it's our assertion error
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestRunner;
}