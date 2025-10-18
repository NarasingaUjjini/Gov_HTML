/**
 * ConfirmationDialogs - Specialized confirmation dialogs for destructive actions
 * Provides pre-configured dialogs for common quiz actions like ending quizzes
 */
class ConfirmationDialogs {
    constructor(errorHandler) {
        this.errorHandler = errorHandler;
    }

    /**
     * Show confirmation dialog for ending an active quiz
     * @param {Object} quizState - Current quiz state information
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    async confirmEndQuiz(quizState) {
        const { mode, currentQuestion, totalQuestions, answeredCount, timeRemaining } = quizState;
        
        let message = this.buildEndQuizMessage(mode, currentQuestion, totalQuestions, answeredCount, timeRemaining);
        
        const options = {
            title: 'End Quiz',
            confirmText: 'End Quiz',
            cancelText: 'Continue Quiz',
            type: 'warning',
            destructive: true
        };

        return await this.errorHandler.showConfirmDialog(message, options);
    }

    /**
     * Build appropriate message for ending quiz based on quiz state
     * @param {string} mode - Quiz mode
     * @param {number} currentQuestion - Current question number
     * @param {number} totalQuestions - Total questions
     * @param {number} answeredCount - Number of answered questions
     * @param {string} timeRemaining - Remaining time (for practice tests)
     * @returns {string} Confirmation message
     */
    buildEndQuizMessage(mode, currentQuestion, totalQuestions, answeredCount, timeRemaining) {
        let message = '';
        
        switch (mode) {
            case 'practice':
                message = `You are currently taking a timed practice test.<br><br>`;
                message += `<strong>Progress:</strong> Question ${currentQuestion} of ${totalQuestions}<br>`;
                message += `<strong>Answered:</strong> ${answeredCount} questions<br>`;
                if (timeRemaining) {
                    message += `<strong>Time Remaining:</strong> ${timeRemaining}<br><br>`;
                }
                message += `If you end the quiz now, your current answers will be scored, but you won't be able to continue this test.<br><br>`;
                message += `Are you sure you want to end the practice test?`;
                break;
                
            case 'unit':
                const unanswered = totalQuestions - answeredCount;
                message = `You are currently taking a unit quiz.<br><br>`;
                message += `<strong>Progress:</strong> Question ${currentQuestion} of ${totalQuestions}<br>`;
                message += `<strong>Answered:</strong> ${answeredCount} questions<br>`;
                if (unanswered > 0) {
                    message += `<strong>Unanswered:</strong> ${unanswered} questions<br><br>`;
                    message += `You still have ${unanswered} unanswered questions. `;
                }
                message += `If you end the quiz now, only your answered questions will be scored.<br><br>`;
                message += `Are you sure you want to end the unit quiz?`;
                break;
                
            case 'study':
                message = `You are currently in study mode.<br><br>`;
                message += `<strong>Questions Completed:</strong> ${answeredCount}<br><br>`;
                message += `Your progress has been automatically saved. You can return to study mode anytime.<br><br>`;
                message += `Are you sure you want to end your study session?`;
                break;
                
            default:
                message = `Are you sure you want to end the current quiz?<br><br>`;
                message += `Your progress will be saved, but you won't be able to continue this session.`;
        }
        
        return message;
    }

    /**
     * Show confirmation dialog for navigating away during active quiz
     * @param {Object} quizState - Current quiz state
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    async confirmNavigation(quizState) {
        const { mode, timeRemaining } = quizState;
        
        let message = `You are currently taking a quiz. `;
        
        if (mode === 'practice' && timeRemaining) {
            message += `Your timed practice test is still active with ${timeRemaining} remaining. `;
        }
        
        message += `If you leave this page, your current progress may be lost.<br><br>`;
        message += `Are you sure you want to leave?`;
        
        const options = {
            title: 'Leave Quiz',
            confirmText: 'Leave Page',
            cancelText: 'Stay Here',
            type: 'warning',
            destructive: true
        };

        return await this.errorHandler.showConfirmDialog(message, options);
    }

    /**
     * Show confirmation dialog for clearing all progress data
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    async confirmClearProgress() {
        const message = `This will permanently delete all your progress data, including:<br><br>`;
        message += `• Unit progress and aptitude scores<br>`;
        message += `• Practice test history and scores<br>`;
        message += `• Study session records<br><br>`;
        message += `<strong>This action cannot be undone.</strong><br><br>`;
        message += `Are you sure you want to clear all progress?`;
        
        const options = {
            title: 'Clear All Progress',
            confirmText: 'Delete All Data',
            cancelText: 'Keep Data',
            type: 'error',
            destructive: true
        };

        return await this.errorHandler.showConfirmDialog(message, options);
    }

    /**
     * Show confirmation dialog for resetting a specific unit's progress
     * @param {number} unitId - Unit ID (1-5)
     * @param {string} unitName - Unit name
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    async confirmResetUnit(unitId, unitName) {
        const message = `This will reset all progress for <strong>${unitName}</strong>:<br><br>`;
        message += `• Aptitude score will be reset to 0%<br>`;
        message += `• Question history will be cleared<br>`;
        message += `• Practice test scores for this unit will remain<br><br>`;
        message += `Are you sure you want to reset this unit's progress?`;
        
        const options = {
            title: `Reset Unit ${unitId}`,
            confirmText: 'Reset Unit',
            cancelText: 'Keep Progress',
            type: 'warning',
            destructive: true
        };

        return await this.errorHandler.showConfirmDialog(message, options);
    }

    /**
     * Show confirmation dialog for submitting quiz with unanswered questions
     * @param {number} unansweredCount - Number of unanswered questions
     * @param {string} mode - Quiz mode
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    async confirmSubmitIncomplete(unansweredCount, mode) {
        let message = `You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.<br><br>`;
        
        if (mode === 'practice') {
            message += `Unanswered questions will be marked as incorrect and will affect your practice test score.<br><br>`;
        } else {
            message += `Only answered questions will be included in your score calculation.<br><br>`;
        }
        
        message += `Would you like to:<br>`;
        message += `• <strong>Review</strong> unanswered questions (Cancel)<br>`;
        message += `• <strong>Submit</strong> the quiz as-is (OK)`;
        
        const options = {
            title: 'Submit Incomplete Quiz',
            confirmText: 'Submit Quiz',
            cancelText: 'Review Questions',
            type: 'warning',
            destructive: false
        };

        return await this.errorHandler.showConfirmDialog(message, options);
    }

    /**
     * Show confirmation dialog for auto-submit warning (practice tests)
     * @param {string} timeRemaining - Time remaining before auto-submit
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    async confirmAutoSubmitWarning(timeRemaining) {
        const message = `Your practice test will automatically submit in ${timeRemaining}.<br><br>`;
        message += `You can:<br>`;
        message += `• <strong>Continue</strong> working on the test<br>`;
        message += `• <strong>Submit now</strong> to see your results<br><br>`;
        message += `Would you like to submit the test now?`;
        
        const options = {
            title: 'Time Warning',
            confirmText: 'Submit Now',
            cancelText: 'Continue Test',
            type: 'warning',
            destructive: false
        };

        return await this.errorHandler.showConfirmDialog(message, options);
    }

    /**
     * Show information dialog (non-destructive)
     * @param {string} message - Information message
     * @param {Object} options - Dialog options
     * @returns {Promise<boolean>} Promise that resolves when user acknowledges
     */
    async showInfo(message, options = {}) {
        const defaultOptions = {
            title: 'Information',
            confirmText: 'OK',
            cancelText: null, // No cancel button for info dialogs
            type: 'info',
            destructive: false
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // For info dialogs, we only show one button
        if (!finalOptions.cancelText) {
            // Create a simple info dialog with just OK button
            return new Promise((resolve) => {
                const dialogId = `info-dialog-${Date.now()}`;
                
                const overlay = document.createElement('div');
                overlay.id = dialogId;
                overlay.className = 'modal-overlay';
                
                overlay.innerHTML = `
                    <div class="modal-dialog info-dialog">
                        <div class="modal-header">
                            <div class="modal-icon">${this.getIcon(finalOptions.type)}</div>
                            <h3 class="modal-title">${finalOptions.title}</h3>
                        </div>
                        <div class="modal-body">
                            <p class="modal-message">${message}</p>
                        </div>
                        <div class="modal-actions">
                            <button class="modal-btn primary" data-action="ok">${finalOptions.confirmText}</button>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(overlay);
                
                const handleClose = () => {
                    resolve(true);
                    this.removeDialog(dialogId);
                };
                
                // Add event listeners
                overlay.addEventListener('click', (event) => {
                    if (event.target.dataset.action === 'ok' || event.target === overlay) {
                        handleClose();
                    }
                });
                
                // Handle escape key
                const handleEscape = (event) => {
                    if (event.key === 'Escape') {
                        handleClose();
                        document.removeEventListener('keydown', handleEscape);
                    }
                };
                document.addEventListener('keydown', handleEscape);
                
                // Focus the OK button
                setTimeout(() => {
                    const okBtn = overlay.querySelector('[data-action="ok"]');
                    if (okBtn) okBtn.focus();
                }, 100);
            });
        }
        
        return await this.errorHandler.showConfirmDialog(message, finalOptions);
    }

    /**
     * Get icon for dialog type
     * @param {string} type - Dialog type
     * @returns {string} Icon
     */
    getIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove dialog from DOM
     * @param {string} dialogId - Dialog ID
     */
    removeDialog(dialogId) {
        const dialog = document.getElementById(dialogId);
        if (dialog) {
            dialog.classList.add('modal-exit');
            setTimeout(() => {
                if (dialog.parentNode) {
                    dialog.parentNode.removeChild(dialog);
                }
            }, 300);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfirmationDialogs;
}