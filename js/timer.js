/**
 * Timer - Manages countdown timer functionality for practice tests
 * Handles 80-minute countdown with auto-submit and warning system
 */
class Timer {
    constructor() {
        this.duration = 0; // Total duration in milliseconds
        this.remaining = 0; // Remaining time in milliseconds
        this.startTime = null;
        this.pausedTime = 0; // Total paused time
        this.isRunning = false;
        this.isPaused = false;
        this.intervalId = null;
        
        // Event callbacks
        this.onTick = null; // Called every second with remaining time
        this.onTimeUp = null; // Called when timer reaches zero
        this.onWarning = null; // Called at warning intervals
        
        // Warning thresholds (in minutes)
        this.warningThresholds = [30, 15, 5, 1]; // Minutes remaining
        this.warningsTriggered = new Set();
        
        // Handle page visibility changes for accurate timing
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    /**
     * Start the timer with specified duration
     * @param {number} minutes - Duration in minutes (default: 80 for AP exam)
     */
    start(minutes = 80) {
        try {
            if (this.isRunning) {
                console.warn('Timer is already running');
                return;
            }

            if (typeof minutes !== 'number' || minutes <= 0) {
                throw new Error('Timer duration must be a positive number');
            }

            this.duration = minutes * 60 * 1000; // Convert to milliseconds
            this.remaining = this.duration;
            this.startTime = Date.now();
            this.pausedTime = 0;
            this.isRunning = true;
            this.isPaused = false;
            this.warningsTriggered.clear();

            console.log(`Timer started: ${minutes} minutes`);
            this.startInterval();
        } catch (error) {
            console.error('Timer start error:', error);
            this.handleTimerError(error, 'start');
            throw error;
        }
    }

    /**
     * Pause the timer
     */
    pause() {
        try {
            if (!this.isRunning || this.isPaused) {
                console.warn('Timer is not running or already paused');
                return;
            }

            this.isPaused = true;
            this.clearInterval();
            console.log('Timer paused');
        } catch (error) {
            this.handleTimerError(error, 'pause');
        }
    }

    /**
     * Resume the paused timer
     */
    resume() {
        try {
            if (!this.isRunning || !this.isPaused) {
                console.warn('Timer is not paused');
                return;
            }

            this.isPaused = false;
            this.startTime = Date.now() - (this.duration - this.remaining);
            this.startInterval();
            console.log('Timer resumed');
        } catch (error) {
            this.handleTimerError(error, 'resume');
        }
    }

    /**
     * Stop the timer completely
     */
    stop() {
        if (!this.isRunning) {
            console.warn('Timer is not running');
            return;
        }

        this.isRunning = false;
        this.isPaused = false;
        this.clearInterval();
        console.log('Timer stopped');
    }

    /**
     * Get remaining time in milliseconds
     * @returns {number} Remaining time in milliseconds
     */
    getTimeRemaining() {
        if (!this.isRunning) {
            return 0;
        }

        if (this.isPaused) {
            return this.remaining;
        }

        const elapsed = Date.now() - this.startTime;
        const remaining = Math.max(0, this.duration - elapsed);
        return remaining;
    }

    /**
     * Get remaining time formatted as MM:SS
     * @returns {string} Formatted time string
     */
    getFormattedTime() {
        const remaining = this.getTimeRemaining();
        const totalSeconds = Math.ceil(remaining / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Get elapsed time in milliseconds
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsedTime() {
        if (!this.startTime) {
            return 0;
        }

        if (this.isPaused) {
            return this.duration - this.remaining;
        }

        return Math.min(this.duration, Date.now() - this.startTime);
    }

    /**
     * Get progress as percentage (0-100)
     * @returns {number} Progress percentage
     */
    getProgress() {
        if (this.duration === 0) {
            return 0;
        }

        const elapsed = this.getElapsedTime();
        return Math.min(100, (elapsed / this.duration) * 100);
    }

    /**
     * Check if timer has expired
     * @returns {boolean} True if time is up
     */
    isExpired() {
        return this.getTimeRemaining() === 0;
    }

    /**
     * Add time to the timer (for extensions)
     * @param {number} minutes - Minutes to add
     */
    addTime(minutes) {
        if (!this.isRunning) {
            console.warn('Cannot add time to stopped timer');
            return;
        }

        const additionalTime = minutes * 60 * 1000;
        this.duration += additionalTime;
        this.remaining += additionalTime;
        
        console.log(`Added ${minutes} minutes to timer`);
    }

    /**
     * Start the interval for timer updates
     */
    startInterval() {
        this.clearInterval(); // Clear any existing interval
        
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000); // Update every second
    }

    /**
     * Clear the timer interval
     */
    clearInterval() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * Handle timer tick (called every second)
     */
    tick() {
        try {
            if (!this.isRunning || this.isPaused) {
                return;
            }

            this.remaining = this.getTimeRemaining();

            // Check if time is up
            if (this.remaining === 0) {
                this.handleTimeUp();
                return;
            }

            // Check for warnings
            this.checkWarnings();

            // Trigger tick callback
            if (this.onTick) {
                this.onTick({
                    remaining: this.remaining,
                    formatted: this.getFormattedTime(),
                    progress: this.getProgress(),
                    elapsed: this.getElapsedTime()
                });
            }
        } catch (error) {
            this.handleTimerError(error, 'tick');
        }
    }

    /**
     * Handle time expiration
     */
    handleTimeUp() {
        console.log('Timer expired - time is up!');
        
        this.stop();
        
        if (this.onTimeUp) {
            this.onTimeUp();
        }
    }

    /**
     * Check and trigger warnings at specified thresholds
     */
    checkWarnings() {
        const remainingMinutes = Math.ceil(this.remaining / (60 * 1000));
        
        for (const threshold of this.warningThresholds) {
            if (remainingMinutes <= threshold && !this.warningsTriggered.has(threshold)) {
                this.warningsTriggered.add(threshold);
                
                console.log(`Timer warning: ${threshold} minutes remaining`);
                
                if (this.onWarning) {
                    this.onWarning({
                        threshold: threshold,
                        remaining: this.remaining,
                        formatted: this.getFormattedTime()
                    });
                }
            }
        }
    }

    /**
     * Handle page visibility changes to maintain accurate timing
     */
    handleVisibilityChange() {
        try {
            if (!this.isRunning) {
                return;
            }

            if (document.hidden) {
                // Page is hidden - record the time for accuracy
                this.hiddenTime = Date.now();
                console.log('Page hidden - timer continues in background');
            } else {
                // Page is visible again - adjust for any time discrepancy
                if (this.hiddenTime) {
                    const hiddenDuration = Date.now() - this.hiddenTime;
                    console.log(`Page visible again after ${hiddenDuration}ms`);
                    
                    // Force a tick to update the display
                    this.tick();
                    this.hiddenTime = null;
                }
            }
        } catch (error) {
            this.handleTimerError(error, 'visibility');
        }
    }

    /**
     * Serialize timer state for persistence
     * @returns {Object} Timer state object
     */
    serialize() {
        return {
            duration: this.duration,
            remaining: this.getTimeRemaining(),
            startTime: this.startTime,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            warningsTriggered: Array.from(this.warningsTriggered)
        };
    }

    /**
     * Restore timer state from serialized data
     * @param {Object} state - Serialized timer state
     */
    deserialize(state) {
        if (!state || typeof state !== 'object') {
            console.warn('Invalid timer state for deserialization');
            return;
        }

        this.stop(); // Stop current timer if running

        this.duration = state.duration || 0;
        this.remaining = state.remaining || 0;
        this.startTime = state.startTime || null;
        this.warningsTriggered = new Set(state.warningsTriggered || []);

        if (state.isRunning && !state.isPaused) {
            // Recalculate start time based on remaining time
            this.startTime = Date.now() - (this.duration - this.remaining);
            this.isRunning = true;
            this.isPaused = false;
            this.startInterval();
            console.log('Timer restored and resumed');
        } else if (state.isRunning && state.isPaused) {
            this.isRunning = true;
            this.isPaused = true;
            console.log('Timer restored in paused state');
        }
    }

    /**
     * Get timer statistics
     * @returns {Object} Timer statistics
     */
    getStats() {
        return {
            duration: this.duration,
            remaining: this.getTimeRemaining(),
            elapsed: this.getElapsedTime(),
            progress: this.getProgress(),
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            formatted: {
                remaining: this.getFormattedTime(),
                elapsed: this.formatTime(this.getElapsedTime())
            }
        };
    }

    /**
     * Format time in milliseconds to MM:SS
     * @param {number} milliseconds - Time in milliseconds
     * @returns {string} Formatted time string
     */
    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Handle timer-related errors
     * @param {Error} error - The error that occurred
     * @param {string} operation - The operation that failed
     */
    handleTimerError(error, operation = 'timer operation') {
        console.error(`Timer error during ${operation}:`, error);
        
        // If we have access to a global error handler, use it
        if (typeof window !== 'undefined' && window.app && window.app.errorHandler) {
            window.app.errorHandler.handleQuizError(error, `timer ${operation}`);
        }
        
        // Attempt recovery based on error type
        this.attemptRecovery(error, operation);
    }

    /**
     * Attempt to recover from timer errors
     * @param {Error} error - The error that occurred
     * @param {string} operation - The operation that failed
     */
    attemptRecovery(error, operation) {
        try {
            switch (operation) {
                case 'start':
                    // If start failed, ensure timer is in clean state
                    this.isRunning = false;
                    this.isPaused = false;
                    this.clearInterval();
                    break;
                    
                case 'tick':
                    // If tick failed, try to restart the interval
                    if (this.isRunning && !this.isPaused) {
                        this.clearInterval();
                        setTimeout(() => {
                            if (this.isRunning && !this.isPaused) {
                                this.startInterval();
                            }
                        }, 1000);
                    }
                    break;
                    
                case 'visibility':
                    // If visibility handling failed, force a tick update
                    if (this.isRunning && !this.isPaused) {
                        setTimeout(() => this.tick(), 100);
                    }
                    break;
                    
                default:
                    // General recovery - ensure timer state is consistent
                    if (this.isRunning && !this.intervalId) {
                        this.startInterval();
                    }
            }
        } catch (recoveryError) {
            console.error('Timer recovery failed:', recoveryError);
            // If recovery fails, stop the timer to prevent further issues
            this.stop();
        }
    }

    /**
     * Validate timer state for consistency
     * @returns {boolean} True if timer state is valid
     */
    validateState() {
        try {
            // Check for basic consistency
            if (this.isRunning && this.duration <= 0) {
                throw new Error('Timer is running but has no duration');
            }
            
            if (this.isRunning && !this.startTime) {
                throw new Error('Timer is running but has no start time');
            }
            
            if (this.isPaused && !this.isRunning) {
                throw new Error('Timer is paused but not running');
            }
            
            if (this.remaining < 0) {
                throw new Error('Timer has negative remaining time');
            }
            
            return true;
        } catch (error) {
            this.handleTimerError(error, 'state validation');
            return false;
        }
    }

    /**
     * Cleanup timer resources
     */
    destroy() {
        try {
            this.stop();
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            console.log('Timer destroyed');
        } catch (error) {
            this.handleTimerError(error, 'destroy');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Timer;
}