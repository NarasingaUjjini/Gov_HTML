/**
 * Unit tests for StorageWrapper class
 * Tests storage functionality, error handling, and fallback mechanisms
 */

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

/**
 * Test Suite: StorageWrapper Initialization
 */
function testStorageWrapperInitialization() {
    console.log('Testing StorageWrapper Initialization...');
    
    // Mock successful localStorage
    global.localStorage = new MockLocalStorage();
    const storage = new StorageWrapper();
    
    assert(storage.isLocalStorageAvailable === true, 'Should detect localStorage availability');
    assert(storage.sessionFallback instanceof Map, 'Should initialize session fallback');
    
    console.log('✓ StorageWrapper initialization tests passed');
}

/**
 * Test Suite: Basic Storage Operations
 */
function testBasicStorageOperations() {
    console.log('Testing Basic Storage Operations...');
    
    global.localStorage = new MockLocalStorage();
    const storage = new StorageWrapper();
    
    const testData = { test: true, number: 42, array: [1, 2, 3] };
    
    // Test setItem
    const setResult = storage.setItem('test-key', testData);
    assert(setResult === true, 'setItem should return true on success');
    
    // Test getItem
    const retrieved = storage.getItem('test-key');
    assert(JSON.stringify(retrieved) === JSON.stringify(testData), 'Retrieved data should match stored data');
    
    // Test removeItem
    const removeResult = storage.removeItem('test-key');
    assert(removeResult === true, 'removeItem should return true on success');
    
    // Verify removal
    const afterRemoval = storage.getItem('test-key');
    assert(afterRemoval === null, 'Data should be null after removal');
    
    console.log('✓ Basic storage operation tests passed');
}

/**
 * Test Suite: localStorage Unavailable Fallback
 */
function testLocalStorageUnavailableFallback() {
    console.log('Testing localStorage Unavailable Fallback...');
    
    // Mock failed localStorage
    global.localStorage = new MockLocalStorage(true);
    const storage = new StorageWrapper();
    
    assert(storage.isLocalStorageAvailable === false, 'Should detect localStorage unavailability');
    
    const testData = { fallback: true };
    
    // Test fallback storage
    const setResult = storage.setItem('fallback-key', testData);
    assert(setResult === true, 'Should successfully store in fallback');
    
    const retrieved = storage.getItem('fallback-key');
    assert(JSON.stringify(retrieved) === JSON.stringify(testData), 'Should retrieve from fallback');
    
    console.log('✓ localStorage unavailable fallback tests passed');
}

/**
 * Test Suite: Storage Quota Exceeded Handling
 */
function testStorageQuotaExceededHandling() {
    console.log('Testing Storage Quota Exceeded Handling...');
    
    // Mock localStorage that throws quota exceeded error
    global.localStorage = new MockLocalStorage(false, true);
    const storage = new StorageWrapper();
    
    const testData = { large: 'data' };
    
    // Should handle quota exceeded gracefully
    const setResult = storage.setItem('quota-test', testData);
    assert(setResult === false, 'Should return false when quota exceeded');
    
    // Should fall back to session storage
    const retrieved = storage.getItem('quota-test');
    assert(JSON.stringify(retrieved) === JSON.stringify(testData), 'Should retrieve from session fallback');
    
    console.log('✓ Storage quota exceeded handling tests passed');
}

/**
 * Test Suite: Data Serialization
 */
function testDataSerialization() {
    console.log('Testing Data Serialization...');
    
    global.localStorage = new MockLocalStorage();
    const storage = new StorageWrapper();
    
    // Test various data types
    const testCases = [
        { name: 'string', data: 'hello world' },
        { name: 'number', data: 42 },
        { name: 'boolean', data: true },
        { name: 'array', data: [1, 2, 3, 'four'] },
        { name: 'object', data: { nested: { deep: 'value' }, array: [1, 2] } },
        { name: 'null', data: null },
        { name: 'undefined', data: undefined }
    ];
    
    testCases.forEach(testCase => {
        storage.setItem(`test-${testCase.name}`, testCase.data);
        const retrieved = storage.getItem(`test-${testCase.name}`);
        
        if (testCase.data === undefined) {
            // undefined becomes null when JSON serialized
            assert(retrieved === null, `${testCase.name}: undefined should become null`);
        } else {
            assert(JSON.stringify(retrieved) === JSON.stringify(testCase.data), 
                   `${testCase.name}: should serialize and deserialize correctly`);
        }
    });
    
    console.log('✓ Data serialization tests passed');
}

/**
 * Test Suite: Storage Information
 */
function testStorageInformation() {
    console.log('Testing Storage Information...');
    
    global.localStorage = new MockLocalStorage();
    const storage = new StorageWrapper();
    
    // Add some test data
    storage.setItem('ap-gov-test1', { data: 'test1' });
    storage.setItem('ap-gov-test2', { data: 'test2' });
    
    const info = storage.getStorageInfo();
    
    assert(typeof info.localStorageAvailable === 'boolean', 'Should report localStorage availability');
    assert(typeof info.usingSessionFallback === 'boolean', 'Should report session fallback usage');
    assert(typeof info.sessionFallbackSize === 'number', 'Should report session fallback size');
    
    console.log('✓ Storage information tests passed');
}

/**
 * Test Suite: Storage Testing Functionality
 */
function testStorageTestingFunctionality() {
    console.log('Testing Storage Testing Functionality...');
    
    global.localStorage = new MockLocalStorage();
    const storage = new StorageWrapper();
    
    const testResults = storage.testStorage();
    
    assert(testResults.setItem === true, 'setItem test should pass');
    assert(testResults.getItem === true, 'getItem test should pass');
    assert(testResults.removeItem === true, 'removeItem test should pass');
    assert(testResults.dataIntegrity === true, 'Data integrity test should pass');
    
    console.log('✓ Storage testing functionality tests passed');
}

/**
 * Test Suite: Clear Functionality
 */
function testClearFunctionality() {
    console.log('Testing Clear Functionality...');
    
    global.localStorage = new MockLocalStorage();
    const storage = new StorageWrapper();
    
    // Add test data
    storage.setItem('ap-gov-data1', { test: 1 });
    storage.setItem('ap-gov-data2', { test: 2 });
    storage.setItem('other-app-data', { test: 3 });
    
    // Clear should only remove ap-gov prefixed items
    const clearResult = storage.clear();
    assert(clearResult === true, 'Clear should return true');
    
    // Verify ap-gov data is cleared
    assert(storage.getItem('ap-gov-data1') === null, 'ap-gov data should be cleared');
    assert(storage.getItem('ap-gov-data2') === null, 'ap-gov data should be cleared');
    
    console.log('✓ Clear functionality tests passed');
}

/**
 * Test Suite: Error Recovery
 */
function testErrorRecovery() {
    console.log('Testing Error Recovery...');
    
    // Test with localStorage that fails intermittently
    const mockStorage = new MockLocalStorage();
    global.localStorage = mockStorage;
    
    const storage = new StorageWrapper();
    
    // Store some data successfully
    storage.setItem('test-key', { data: 'test' });
    
    // Make localStorage fail
    mockStorage.shouldFail = true;
    
    // Should still be able to retrieve from session fallback
    const retrieved = storage.getItem('test-key');
    assert(retrieved === null, 'Should return null when localStorage fails and no session fallback');
    
    // Should be able to store in session fallback
    const setResult = storage.setItem('fallback-key', { fallback: true });
    assert(setResult === true, 'Should store in session fallback when localStorage fails');
    
    console.log('✓ Error recovery tests passed');
}

/**
 * Simple assertion function for testing
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Run all tests
 */
function runStorageWrapperTests() {
    console.log('Running StorageWrapper Tests...\n');
    
    try {
        testStorageWrapperInitialization();
        testBasicStorageOperations();
        testLocalStorageUnavailableFallback();
        testStorageQuotaExceededHandling();
        testDataSerialization();
        testStorageInformation();
        testStorageTestingFunctionality();
        testClearFunctionality();
        testErrorRecovery();
        
        console.log('\n✅ All StorageWrapper tests passed!');
        return true;
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Export test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runStorageWrapperTests, MockLocalStorage };
}

// Auto-run tests if this file is executed directly
if (typeof window === 'undefined' && require.main === module) {
    runStorageWrapperTests();
}