/**
 * ProgressTracker - Handles user progress tracking and aptitude calculations
 * Manages unit-specific performance metrics and practice test history
 */
class ProgressTracker {
    constructor(storageWrapper) {
        this.storage = storageWrapper;
        this.progress = this.loadProgress();
    }

    /**
     * Load user progress from storage or initialize default structure
     * @returns {Object} User progress data
     */
    loadProgress() {
        const defaultProgress = {
            units: {
                1: { seen: 0, correct: 0, total: 0 },
                2: { seen: 0, correct: 0, total: 0 },
                3: { seen: 0, correct: 0, total: 0 },
                4: { seen: 0, correct: 0, total: 0 },
                5: { seen: 0, correct: 0, total: 0 }
            },
            practiceTests: [],
            currentSession: null
        };

        const saved = this.storage.getItem('ap-gov-progress');
        return saved ? { ...defaultProgress, ...saved } : defaultProgress;
    }

    /**
     * Update progress for a specific unit based on question attempts
     * @param {number} unitId - Unit number (1-5)
     * @param {number} correct - Number of correct answers
     * @param {number} total - Total number of questions attempted
     */
    updateUnitProgress(unitId, correct, total) {
        try {
            if (unitId < 1 || unitId > 5) {
                throw new Error('Unit ID must be between 1 and 5');
            }

            if (typeof correct !== 'number' || correct < 0) {
                throw new Error('Correct answers must be a non-negative number');
            }

            if (typeof total !== 'number' || total < 0) {
                throw new Error('Total questions must be a non-negative number');
            }

            if (correct > total) {
                throw new Error('Correct answers cannot exceed total questions');
            }

            const unit = this.progress.units[unitId];
            unit.seen += total;
            unit.correct += correct;
            unit.total += total;

            this.saveProgress();
        } catch (error) {
            this.handleProgressError(error, 'updateUnitProgress');
            throw error;
        }
    }

    /**
     * Calculate aptitude percentage for a specific unit
     * @param {number} unitId - Unit number (1-5)
     * @returns {number} Aptitude percentage (0-100)
     */
    getUnitAptitude(unitId) {
        if (unitId < 1 || unitId > 5) {
            throw new Error('Unit ID must be between 1 and 5');
        }

        const unit = this.progress.units[unitId];
        if (unit.total === 0) {
            return 0;
        }

        return Math.round((unit.correct / unit.total) * 100);
    }

    /**
     * Get the number of questions seen for a unit
     * @param {number} unitId - Unit number (1-5)
     * @returns {number} Number of questions seen
     */
    getUnitSeen(unitId) {
        if (unitId < 1 || unitId > 5) {
            throw new Error('Unit ID must be between 1 and 5');
        }

        return this.progress.units[unitId].seen;
    }

    /**
     * Get complete progress data for a specific unit
     * @param {number} unitId - Unit number (1-5)
     * @returns {Object} Unit progress data with aptitude calculation
     */
    getUnitProgress(unitId) {
        if (unitId < 1 || unitId > 5) {
            throw new Error('Unit ID must be between 1 and 5');
        }

        const unit = this.progress.units[unitId];
        return {
            seen: unit.seen,
            correct: unit.correct,
            total: unit.total,
            aptitude: this.getUnitAptitude(unitId)
        };
    }

    /**
     * Record a completed practice test with score and unit breakdown
     * @param {number} score - Number of correct answers
     * @param {number} total - Total number of questions (should be 55)
     * @param {Object} unitBreakdown - Correct answers per unit {1: 8, 2: 9, ...}
     */
    recordPracticeTest(score, total, unitBreakdown) {
        const testRecord = {
            date: new Date().toISOString(),
            score: score,
            total: total,
            percentage: Math.round((score / total) * 100),
            unitBreakdown: unitBreakdown || {}
        };

        this.progress.practiceTests.push(testRecord);

        // Update unit progress based on practice test results
        Object.keys(unitBreakdown || {}).forEach(unitId => {
            const unitCorrect = unitBreakdown[unitId];
            // Assuming roughly 11 questions per unit in practice test (55/5)
            const unitTotal = 11;
            this.updateUnitProgress(parseInt(unitId), unitCorrect, unitTotal);
        });

        this.saveProgress();
    }

    /**
     * Get practice test score history
     * @returns {Array} Array of practice test records
     */
    getPracticeTestHistory() {
        return [...this.progress.practiceTests];
    }

    /**
     * Get overall progress across all units
     * @returns {Object} Overall progress statistics
     */
    getOverallProgress() {
        let totalSeen = 0;
        let totalCorrect = 0;
        let totalQuestions = 0;
        const unitAptitudes = {};

        Object.keys(this.progress.units).forEach(unitId => {
            const unit = this.progress.units[unitId];
            totalSeen += unit.seen;
            totalCorrect += unit.correct;
            totalQuestions += unit.total;
            unitAptitudes[unitId] = this.getUnitAptitude(parseInt(unitId));
        });

        return {
            totalSeen,
            totalCorrect,
            totalQuestions,
            overallAptitude: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
            unitAptitudes,
            practiceTestCount: this.progress.practiceTests.length,
            lastPracticeTest: this.progress.practiceTests.length > 0 ? 
                this.progress.practiceTests[this.progress.practiceTests.length - 1] : null
        };
    }

    /**
     * Save current progress to storage
     */
    saveProgress() {
        try {
            const success = this.storage.setItem('ap-gov-progress', this.progress);
            if (!success) {
                throw new Error('Failed to save progress to storage');
            }
        } catch (error) {
            this.handleProgressError(error, 'saveProgress');
            throw error;
        }
    }

    /**
     * Reset all progress data
     */
    resetProgress() {
        this.progress = {
            units: {
                1: { seen: 0, correct: 0, total: 0 },
                2: { seen: 0, correct: 0, total: 0 },
                3: { seen: 0, correct: 0, total: 0 },
                4: { seen: 0, correct: 0, total: 0 },
                5: { seen: 0, correct: 0, total: 0 }
            },
            practiceTests: [],
            currentSession: null
        };
        this.saveProgress();
    }

    /**
     * Save current session state
     * @param {Object} sessionData - Current session information
     */
    saveCurrentSession(sessionData) {
        this.progress.currentSession = sessionData;
        this.saveProgress();
    }

    /**
     * Get current session state
     * @returns {Object|null} Current session data or null
     */
    getCurrentSession() {
        return this.progress.currentSession;
    }

    /**
     * Clear current session
     */
    clearCurrentSession() {
        try {
            this.progress.currentSession = null;
            this.saveProgress();
        } catch (error) {
            this.handleProgressError(error, 'clearCurrentSession');
        }
    }

    /**
     * Handle progress tracking errors
     * @param {Error} error - The error that occurred
     * @param {string} operation - The operation that failed
     */
    handleProgressError(error, operation = 'progress operation') {
        console.error(`Progress tracking error during ${operation}:`, error);
        
        // If we have access to a global error handler, use it
        if (typeof window !== 'undefined' && window.app && window.app.errorHandler) {
            window.app.errorHandler.handleQuizError(error, `progress ${operation}`);
        }
        
        // Attempt recovery
        this.attemptProgressRecovery(error, operation);
    }

    /**
     * Attempt to recover from progress tracking errors
     * @param {Error} error - The error that occurred
     * @param {string} operation - The operation that failed
     */
    attemptProgressRecovery(error, operation) {
        try {
            switch (operation) {
                case 'saveProgress':
                    // If save failed, try to reload from storage
                    console.log('Attempting to reload progress from storage...');
                    const reloaded = this.storage.getItem('ap-gov-progress');
                    if (reloaded) {
                        this.progress = reloaded;
                        console.log('Progress reloaded from storage');
                    }
                    break;
                    
                case 'loadProgress':
                    // If load failed, use default progress
                    console.log('Using default progress structure...');
                    this.progress = {
                        units: {
                            1: { seen: 0, correct: 0, total: 0 },
                            2: { seen: 0, correct: 0, total: 0 },
                            3: { seen: 0, correct: 0, total: 0 },
                            4: { seen: 0, correct: 0, total: 0 },
                            5: { seen: 0, correct: 0, total: 0 }
                        },
                        practiceTests: [],
                        currentSession: null
                    };
                    break;
                    
                default:
                    // General recovery - validate and fix progress structure
                    this.validateAndFixProgress();
            }
        } catch (recoveryError) {
            console.error('Progress recovery failed:', recoveryError);
            // If recovery fails, reset to default state
            this.resetToDefault();
        }
    }

    /**
     * Validate and fix progress data structure
     */
    validateAndFixProgress() {
        try {
            // Ensure units object exists
            if (!this.progress.units || typeof this.progress.units !== 'object') {
                this.progress.units = {};
            }
            
            // Ensure all units 1-5 exist with proper structure
            for (let i = 1; i <= 5; i++) {
                if (!this.progress.units[i] || typeof this.progress.units[i] !== 'object') {
                    this.progress.units[i] = { seen: 0, correct: 0, total: 0 };
                } else {
                    const unit = this.progress.units[i];
                    unit.seen = Math.max(0, parseInt(unit.seen) || 0);
                    unit.correct = Math.max(0, parseInt(unit.correct) || 0);
                    unit.total = Math.max(0, parseInt(unit.total) || 0);
                    
                    // Ensure correct doesn't exceed total
                    if (unit.correct > unit.total) {
                        unit.correct = unit.total;
                    }
                }
            }
            
            // Ensure practiceTests array exists
            if (!Array.isArray(this.progress.practiceTests)) {
                this.progress.practiceTests = [];
            }
            
            // Validate practice test entries
            this.progress.practiceTests = this.progress.practiceTests.filter(test => {
                return test && 
                       typeof test.score === 'number' && 
                       typeof test.total === 'number' && 
                       test.date;
            });
            
            console.log('Progress structure validated and fixed');
        } catch (error) {
            console.error('Progress validation failed:', error);
            this.resetToDefault();
        }
    }

    /**
     * Reset progress to default state
     */
    resetToDefault() {
        this.progress = {
            units: {
                1: { seen: 0, correct: 0, total: 0 },
                2: { seen: 0, correct: 0, total: 0 },
                3: { seen: 0, correct: 0, total: 0 },
                4: { seen: 0, correct: 0, total: 0 },
                5: { seen: 0, correct: 0, total: 0 }
            },
            practiceTests: [],
            currentSession: null
        };
        
        console.log('Progress reset to default state');
        
        // Notify user if possible
        if (typeof window !== 'undefined' && window.app && window.app.errorHandler) {
            window.app.errorHandler.showNotification(
                'Progress data was corrupted and has been reset. Sorry for the inconvenience.',
                'warning',
                8000
            );
        }
    }

    /**
     * Get progress statistics for debugging
     * @returns {Object} Progress statistics
     */
    getProgressStats() {
        try {
            const stats = {
                totalQuestionsSeen: 0,
                totalCorrect: 0,
                overallAptitude: 0,
                practiceTestCount: this.progress.practiceTests.length,
                unitStats: {}
            };
            
            for (let i = 1; i <= 5; i++) {
                const unit = this.progress.units[i];
                stats.totalQuestionsSeen += unit.seen;
                stats.totalCorrect += unit.correct;
                stats.unitStats[i] = {
                    aptitude: this.getUnitAptitude(i),
                    seen: unit.seen,
                    correct: unit.correct,
                    total: unit.total
                };
            }
            
            if (stats.totalQuestionsSeen > 0) {
                stats.overallAptitude = (stats.totalCorrect / stats.totalQuestionsSeen) * 100;
            }
            
            return stats;
        } catch (error) {
            console.error('Failed to generate progress stats:', error);
            return { error: error.message };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgressTracker;
}