/**
 * StorageWrapper - Provides safe local storage access with error handling and fallbacks
 * Handles storage quota limits, privacy mode restrictions, and provides session fallback
 */
class StorageWrapper {
    constructor(errorHandler = null) {
        this.errorHandler = errorHandler;
        this.isLocalStorageAvailable = this.checkLocalStorageAvailability();
        this.sessionFallback = new Map();
        this.storageQuotaWarned = false;
        this.degradationNotified = false;
    }

    /**
     * Check if localStorage is available and functional
     * @returns {boolean} True if localStorage is available
     */
    checkLocalStorageAvailability() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e.message);
            
            // Notify user about storage degradation
            if (this.errorHandler && !this.degradationNotified) {
                this.errorHandler.handleStorageError(e, 'localStorage availability check');
                this.degradationNotified = true;
            }
            
            return false;
        }
    }

    /**
     * Store an item with error handling and fallback
     * @param {string} key - Storage key
     * @param {*} value - Value to store (will be JSON stringified)
     * @returns {boolean} True if storage was successful
     */
    setItem(key, value) {
        try {
            const serializedValue = JSON.stringify(value);
            
            if (this.isLocalStorageAvailable) {
                localStorage.setItem(key, serializedValue);
                return true;
            } else {
                // Fallback to session storage
                this.sessionFallback.set(key, serializedValue);
                return true;
            }
        } catch (e) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                this.handleStorageQuotaExceeded(key, value);
                return false;
            } else {
                console.error('Error storing data:', e);
                
                // Use error handler if available
                if (this.errorHandler) {
                    this.errorHandler.handleStorageError(e, 'setItem operation');
                }
                
                // Try session fallback
                try {
                    this.sessionFallback.set(key, JSON.stringify(value));
                    return true;
                } catch (fallbackError) {
                    console.error('Session fallback also failed:', fallbackError);
                    
                    if (this.errorHandler) {
                        this.errorHandler.handleStorageError(fallbackError, 'session fallback');
                    }
                    
                    return false;
                }
            }
        }
    }

    /**
     * Retrieve an item with error handling
     * @param {string} key - Storage key
     * @returns {*} Parsed value or null if not found/error
     */
    getItem(key) {
        try {
            let serializedValue = null;

            if (this.isLocalStorageAvailable) {
                serializedValue = localStorage.getItem(key);
            }

            // If not found in localStorage, try session fallback
            if (serializedValue === null && this.sessionFallback.has(key)) {
                serializedValue = this.sessionFallback.get(key);
            }

            if (serializedValue === null) {
                return null;
            }

            return JSON.parse(serializedValue);
        } catch (e) {
            console.error('Error retrieving data:', e);
            return null;
        }
    }

    /**
     * Remove an item from storage
     * @param {string} key - Storage key
     * @returns {boolean} True if removal was successful
     */
    removeItem(key) {
        try {
            if (this.isLocalStorageAvailable) {
                localStorage.removeItem(key);
            }
            this.sessionFallback.delete(key);
            return true;
        } catch (e) {
            console.error('Error removing data:', e);
            return false;
        }
    }

    /**
     * Clear all stored data
     * @returns {boolean} True if clearing was successful
     */
    clear() {
        try {
            if (this.isLocalStorageAvailable) {
                // Only clear our app's data, not all localStorage
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('ap-gov-')) {
                        keysToRemove.push(key);
                    }
                }
                keysToRemove.forEach(key => localStorage.removeItem(key));
            }
            this.sessionFallback.clear();
            return true;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    }

    /**
     * Handle storage quota exceeded error
     * @param {string} key - The key that failed to store
     * @param {*} value - The value that failed to store
     */
    handleStorageQuotaExceeded(key, value) {
        if (!this.storageQuotaWarned) {
            console.warn('Storage quota exceeded. Attempting to free space...');
            this.storageQuotaWarned = true;
            
            // Use error handler for user notification
            if (this.errorHandler) {
                this.errorHandler.handleStorageError(
                    new Error('Storage quota exceeded'), 
                    'storage quota management'
                );
            }
        }

        try {
            // Try to free space by removing old practice test records
            const progress = this.getItem('ap-gov-progress');
            if (progress && progress.practiceTests && progress.practiceTests.length > 10) {
                // Keep only the last 10 practice tests
                progress.practiceTests = progress.practiceTests.slice(-10);
                
                // Try to store the reduced data
                const serializedValue = JSON.stringify(progress);
                if (this.isLocalStorageAvailable) {
                    localStorage.setItem('ap-gov-progress', serializedValue);
                } else {
                    this.sessionFallback.set('ap-gov-progress', serializedValue);
                }
                
                console.log('Freed storage space by removing old practice test records');
            }
        } catch (cleanupError) {
            console.error('Failed to free storage space:', cleanupError);
            // Fall back to session storage
            try {
                this.sessionFallback.set(key, JSON.stringify(value));
            } catch (sessionError) {
                console.error('Session fallback failed:', sessionError);
            }
        }
    }

    /**
     * Get storage information and status
     * @returns {Object} Storage status information
     */
    getStorageInfo() {
        const info = {
            localStorageAvailable: this.isLocalStorageAvailable,
            usingSessionFallback: this.sessionFallback.size > 0,
            sessionFallbackSize: this.sessionFallback.size
        };

        if (this.isLocalStorageAvailable) {
            try {
                // Estimate localStorage usage
                let totalSize = 0;
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key) && key.startsWith('ap-gov-')) {
                        totalSize += localStorage[key].length;
                    }
                }
                info.localStorageUsage = totalSize;
            } catch (e) {
                info.localStorageUsage = 'unknown';
            }
        }

        return info;
    }

    /**
     * Test storage functionality
     * @returns {Object} Test results
     */
    testStorage() {
        const testKey = 'ap-gov-storage-test';
        const testValue = { test: true, timestamp: Date.now() };
        
        const results = {
            setItem: false,
            getItem: false,
            removeItem: false,
            dataIntegrity: false
        };

        try {
            // Test setItem
            results.setItem = this.setItem(testKey, testValue);

            // Test getItem
            const retrieved = this.getItem(testKey);
            results.getItem = retrieved !== null;
            results.dataIntegrity = JSON.stringify(retrieved) === JSON.stringify(testValue);

            // Test removeItem
            results.removeItem = this.removeItem(testKey);

            // Verify removal
            const afterRemoval = this.getItem(testKey);
            results.removeItem = results.removeItem && afterRemoval === null;

        } catch (e) {
            console.error('Storage test failed:', e);
        }

        return results;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageWrapper;
}