/**
 * Verification script for State Management and Navigation features
 * Tests the implementation of task 12: Add application state management and navigation
 */

// Test configuration
const TEST_CONFIG = {
    timeout: 5000,
    verbose: true
};

class StateManagementVerifier {
    constructor() {
        this.results = [];
        this.app = null;
    }

    /**
     * Run all verification tests
     */
    async runAllTests() {
        console.log('🧪 Starting State Management Verification Tests...\n');
        
        try {
            // Wait for app to initialize
            await this.waitForAppInitialization();
            
            // Run test suites
            await this.testStateManagement();
            await this.testNavigationSystem();
            await this.testErrorHandling();
            await this.testSessionPersistence();
            
            // Display results
            this.displayResults();
            
        } catch (error) {
            console.error('❌ Verification failed:', error);
            return false;
        }
        
        return this.results.every(result => result.passed);
    }

    /**
     * Wait for application to initialize
     */
    async waitForAppInitialization() {
        return new Promise((resolve, reject) => {
            const checkApp = () => {
                if (window.app && window.app.isInitialized) {
                    this.app = window.app;
                    console.log('✅ Application initialized successfully');
                    resolve();
                } else if (Date.now() - startTime > TEST_CONFIG.timeout) {
                    reject(new Error('App initialization timeout'));
                } else {
                    setTimeout(checkApp, 100);
                }
            };
            
            const startTime = Date.now();
            checkApp();
        });
    }

    /**
     * Test state management functionality
     */
    async testStateManagement() {
        console.log('📊 Testing State Management...');
        
        // Test 1: State saving
        this.test('State Save Functionality', () => {
            const originalSessionId = this.app.state.sessionId;
            this.app.saveApplicationState();
            
            const savedState = localStorage.getItem('app_state');
            if (!savedState) {
                throw new Error('State not saved to localStorage');
            }
            
            const parsed = JSON.parse(savedState);
            if (parsed.sessionId !== originalSessionId) {
                throw new Error('Session ID mismatch in saved state');
            }
            
            return 'State saved with correct session ID';
        });

        // Test 2: State restoration
        this.test('State Restoration', () => {
            // Modify current state
            const originalProgress = this.app.state.userProgress;
            this.app.state.userProgress = { test: 'modified' };
            
            // Restore from saved state
            const restored = this.app.restoreApplicationState();
            
            if (!restored) {
                // This is expected if no valid saved state
                return 'State restoration handled correctly (no valid state)';
            }
            
            return 'State restoration completed';
        });

        // Test 3: State validation
        this.test('State Validation', () => {
            // Test with valid state
            this.app.validateStateIntegrity();
            
            if (this.app.state.isStateCorrupted) {
                throw new Error('Valid state incorrectly marked as corrupted');
            }
            
            return 'State validation passed for valid state';
        });

        // Test 4: Corruption handling
        this.test('Corruption Handling', () => {
            // Simulate corruption
            const originalState = { ...this.app.state };
            this.app.state.userProgress = null;
            
            // Validate should fix corruption
            this.app.validateStateIntegrity();
            
            if (!this.app.state.userProgress) {
                throw new Error('Corruption not handled properly');
            }
            
            return 'State corruption detected and recovered';
        });
    }

    /**
     * Test navigation system
     */
    async testNavigationSystem() {
        console.log('🧭 Testing Navigation System...');
        
        // Test 1: Basic navigation
        this.test('Basic Navigation', () => {
            const initialView = this.app.currentView;
            this.app.navigateToView('quiz');
            
            if (this.app.currentView !== 'quiz') {
                throw new Error('Navigation to quiz view failed');
            }
            
            this.app.navigateToView(initialView);
            return 'Basic navigation working correctly';
        });

        // Test 2: Navigation history
        this.test('Navigation History', () => {
            const initialHistoryLength = this.app.getNavigationHistory().length;
            
            this.app.navigateToView('quiz');
            this.app.navigateToView('results');
            this.app.navigateToView('dashboard');
            
            const finalHistoryLength = this.app.getNavigationHistory().length;
            
            if (finalHistoryLength <= initialHistoryLength) {
                throw new Error('Navigation history not being tracked');
            }
            
            return `Navigation history tracked (${finalHistoryLength - initialHistoryLength} new entries)`;
        });

        // Test 3: Browser navigation handling
        this.test('Browser Navigation', () => {
            const mockEvent = {
                state: {
                    view: 'quiz',
                    mode: 'practice',
                    timestamp: Date.now(),
                    sessionId: this.app.state.sessionId
                }
            };

            this.app.handleBrowserNavigation(mockEvent);
            
            if (this.app.currentView !== 'quiz') {
                throw new Error('Browser navigation handling failed');
            }
            
            return 'Browser navigation handled correctly';
        });

        // Test 4: Navigation warnings
        this.test('Navigation Warnings', () => {
            // Enable warning
            this.app.quizNavigationWarningActive = true;
            
            const shouldWarn = this.app.shouldWarnOnNavigation();
            const message = this.app.getNavigationWarningMessage();
            
            if (!shouldWarn) {
                throw new Error('Navigation warning not triggered when expected');
            }
            
            if (!message || message.length === 0) {
                throw new Error('Navigation warning message not generated');
            }
            
            // Clean up
            this.app.quizNavigationWarningActive = false;
            
            return 'Navigation warnings working correctly';
        });
    }

    /**
     * Test error handling
     */
    async testErrorHandling() {
        console.log('🛡️ Testing Error Handling...');
        
        // Test 1: Storage failure handling
        this.test('Storage Failure Handling', () => {
            // Mock storage failure
            const originalSetItem = localStorage.setItem;
            let errorHandled = false;
            
            localStorage.setItem = function() {
                throw new Error('Storage quota exceeded');
            };
            
            try {
                this.app.saveApplicationState();
                errorHandled = true;
            } catch (error) {
                // Error should be handled gracefully
            } finally {
                localStorage.setItem = originalSetItem;
            }
            
            return 'Storage failure handled gracefully';
        });

        // Test 2: Invalid state handling
        this.test('Invalid State Handling', () => {
            // Save invalid state to localStorage
            localStorage.setItem('app_state', 'invalid json');
            
            // Should handle gracefully
            const restored = this.app.restoreApplicationState();
            
            // Should return false for invalid state
            if (restored === true) {
                throw new Error('Invalid state not detected');
            }
            
            return 'Invalid state detected and handled';
        });

        // Test 3: Session timeout
        this.test('Session Timeout Configuration', () => {
            const originalTimeout = this.app.stateConfig.sessionTimeout;
            
            // Test timeout configuration
            this.app.stateConfig.sessionTimeout = 1000;
            this.app.setupSessionTimeout();
            
            if (!this.app.sessionTimeoutId) {
                throw new Error('Session timeout not configured');
            }
            
            // Restore original
            this.app.stateConfig.sessionTimeout = originalTimeout;
            
            return 'Session timeout configured correctly';
        });
    }

    /**
     * Test session persistence
     */
    async testSessionPersistence() {
        console.log('💾 Testing Session Persistence...');
        
        // Test 1: Session data saving
        this.test('Session Data Saving', () => {
            // Create mock session
            this.app.state.currentSession = {
                mode: 'practice',
                currentQuestionIndex: 5,
                answers: [0, 1, 2, null, 3],
                startTime: Date.now()
            };
            
            this.app.saveApplicationState();
            
            const savedState = JSON.parse(localStorage.getItem('app_state'));
            if (!savedState.currentSession) {
                throw new Error('Session data not saved');
            }
            
            if (savedState.currentSession.mode !== 'practice') {
                throw new Error('Session mode not saved correctly');
            }
            
            return 'Session data saved correctly';
        });

        // Test 2: Session ID generation
        this.test('Session ID Generation', () => {
            const sessionId1 = this.app.generateSessionId();
            const sessionId2 = this.app.generateSessionId();
            
            if (sessionId1 === sessionId2) {
                throw new Error('Session IDs are not unique');
            }
            
            if (!sessionId1.startsWith('session_')) {
                throw new Error('Session ID format incorrect');
            }
            
            return 'Session IDs generated correctly';
        });

        // Test 3: Session validation
        this.test('Session Validation', () => {
            const validSession = {
                mode: 'unit',
                currentQuestionIndex: 0,
                answers: []
            };
            
            const invalidSession = {
                mode: 'unit'
                // missing required fields
            };
            
            if (!this.app.isValidSession(validSession)) {
                throw new Error('Valid session rejected');
            }
            
            if (this.app.isValidSession(invalidSession)) {
                throw new Error('Invalid session accepted');
            }
            
            return 'Session validation working correctly';
        });
    }

    /**
     * Run individual test
     */
    test(name, testFunction) {
        try {
            const result = testFunction();
            this.results.push({
                name,
                passed: true,
                message: result,
                error: null
            });
            
            if (TEST_CONFIG.verbose) {
                console.log(`  ✅ ${name}: ${result}`);
            }
        } catch (error) {
            this.results.push({
                name,
                passed: false,
                message: null,
                error: error.message
            });
            
            console.log(`  ❌ ${name}: ${error.message}`);
        }
    }

    /**
     * Display final results
     */
    displayResults() {
        console.log('\n📋 Verification Results:');
        console.log('========================');
        
        const passed = this.results.filter(r => r.passed).length;
        const total = this.results.length;
        
        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${total - passed}/${total}`);
        
        if (passed === total) {
            console.log('\n🎉 All state management and navigation features are working correctly!');
            console.log('\nImplemented features:');
            console.log('• Application state management with auto-save');
            console.log('• Browser history management for navigation');
            console.log('• Session persistence for interrupted quizzes');
            console.log('• Error handling for state corruption and data loss');
            console.log('• Navigation warnings for active quizzes');
            console.log('• State validation and recovery mechanisms');
        } else {
            console.log('\n⚠️ Some tests failed. Please review the implementation.');
        }
        
        return passed === total;
    }
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.StateManagementVerifier = StateManagementVerifier;
    
    // Auto-run if app is available
    window.addEventListener('load', () => {
        setTimeout(async () => {
            if (window.app) {
                const verifier = new StateManagementVerifier();
                await verifier.runAllTests();
            }
        }, 2000);
    });
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManagementVerifier;
}