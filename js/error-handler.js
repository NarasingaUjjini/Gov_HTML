/**
 * ErrorHandler - Comprehensive error handling and user feedback system
 * Provides graceful degradation, user-friendly messages, and notification management
 */
class ErrorHandler {
    constructor() {
        this.notifications = new Map();
        this.notificationId = 0;
        this.isInitialized = false;
        
        // Error tracking
        this.errorLog = [];
        this.maxErrorLogSize = 100;
        
        // Notification settings
        this.defaultDuration = 5000; // 5 seconds
        this.maxNotifications = 5;
        
        // Initialize notification container
        this.initializeNotificationContainer();
        
        // Set up global error handlers
        this.setupGlobalErrorHandlers();
        
        this.isInitialized = true;
        console.log('ErrorHandler initialized');
    }

    /**
     * Initialize the notification container in the DOM
     */
    initializeNotificationContainer() {
        // Remove existing container if present
        const existing = document.getElementById('notification-container');
        if (existing) {
            existing.remove();
        }

        // Create notification container
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    /**
     * Set up global error handlers for unhandled errors
     */
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleGlobalError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                reason: event.reason
            });
        });
    }

    /**
     * Handle global errors with appropriate user feedback
     * @param {Object} errorInfo - Error information
     */
    handleGlobalError(errorInfo) {
        console.error('Global error caught:', errorInfo);
        
        // Log the error
        this.logError(errorInfo);
        
        // Show user-friendly notification for critical errors
        if (this.isCriticalError(errorInfo)) {
            this.showNotification(
                'An unexpected error occurred. The application may not function properly. Please refresh the page.',
                'error',
                10000
            );
        }
    }

    /**
     * Determine if an error is critical and requires user notification
     * @param {Object} errorInfo - Error information
     * @returns {boolean} True if error is critical
     */
    isCriticalError(errorInfo) {
        const criticalPatterns = [
            /storage/i,
            /quota/i,
            /network/i,
            /failed to fetch/i,
            /script error/i
        ];
        
        const message = errorInfo.message || '';
        return criticalPatterns.some(pattern => pattern.test(message));
    }

    /**
     * Log error for debugging and analytics
     * @param {Object} errorInfo - Error information
     */
    logError(errorInfo) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...errorInfo,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorLog.push(logEntry);
        
        // Maintain log size limit
        if (this.errorLog.length > this.maxErrorLogSize) {
            this.errorLog.shift();
        }
    }

    /**
     * Show a notification to the user
     * @param {string} message - Notification message
     * @param {string} type - Notification type: 'info', 'success', 'warning', 'error'
     * @param {number} duration - Duration in milliseconds (0 for persistent)
     * @param {Object} options - Additional options
     * @returns {string} Notification ID
     */
    showNotification(message, type = 'info', duration = null, options = {}) {
        const id = `notification-${++this.notificationId}`;
        const actualDuration = duration !== null ? duration : this.defaultDuration;
        
        // Limit number of notifications
        if (this.notifications.size >= this.maxNotifications) {
            const oldestId = this.notifications.keys().next().value;
            this.removeNotification(oldestId);
        }
        
        const notification = {
            id,
            message,
            type,
            duration: actualDuration,
            timestamp: Date.now(),
            persistent: actualDuration === 0,
            ...options
        };
        
        this.notifications.set(id, notification);
        this.renderNotification(notification);
        
        // Auto-remove non-persistent notifications
        if (!notification.persistent) {
            setTimeout(() => {
                this.removeNotification(id);
            }, actualDuration);
        }
        
        return id;
    }

    /**
     * Render a notification in the DOM
     * @param {Object} notification - Notification object
     */
    renderNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) {
            console.error('Notification container not found');
            return;
        }

        const element = document.createElement('div');
        element.id = notification.id;
        element.className = `notification notification-${notification.type}`;
        
        // Add animation class
        element.classList.add('notification-enter');
        
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">${this.getNotificationIcon(notification.type)}</div>
                <div class="notification-message">${notification.message}</div>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
            ${!notification.persistent ? `
                <div class="notification-progress">
                    <div class="notification-progress-bar" style="animation-duration: ${notification.duration}ms;"></div>
                </div>
            ` : ''}
        `;
        
        // Add close button handler
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.removeNotification(notification.id);
        });
        
        // Insert at the top of the container
        container.insertBefore(element, container.firstChild);
        
        // Trigger enter animation
        requestAnimationFrame(() => {
            element.classList.remove('notification-enter');
            element.classList.add('notification-visible');
        });
    }

    /**
     * Get icon for notification type
     * @param {string} type - Notification type
     * @returns {string} Icon HTML
     */
    getNotificationIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }

    /**
     * Remove a notification
     * @param {string} id - Notification ID
     */
    removeNotification(id) {
        const notification = this.notifications.get(id);
        if (!notification) return;
        
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('notification-exit');
            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            }, 300); // Match CSS animation duration
        }
        
        this.notifications.delete(id);
    }

    /**
     * Clear all notifications
     */
    clearAllNotifications() {
        for (const id of this.notifications.keys()) {
            this.removeNotification(id);
        }
    }

    /**
     * Show a confirmation dialog
     * @param {string} message - Confirmation message
     * @param {Object} options - Dialog options
     * @returns {Promise<boolean>} Promise that resolves to user's choice
     */
    showConfirmDialog(message, options = {}) {
        return new Promise((resolve) => {
            const {
                title = 'Confirm Action',
                confirmText = 'OK',
                cancelText = 'Cancel',
                type = 'warning',
                destructive = false
            } = options;

            const dialogId = `dialog-${++this.notificationId}`;
            
            // Create modal overlay
            const overlay = document.createElement('div');
            overlay.id = dialogId;
            overlay.className = 'modal-overlay';
            
            overlay.innerHTML = `
                <div class="modal-dialog confirmation-dialog">
                    <div class="modal-header">
                        <div class="modal-icon">${this.getNotificationIcon(type)}</div>
                        <h3 class="modal-title">${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p class="modal-message">${message}</p>
                    </div>
                    <div class="modal-actions">
                        <button class="modal-btn secondary" data-action="cancel">${cancelText}</button>
                        <button class="modal-btn ${destructive ? 'danger' : 'primary'}" data-action="confirm">${confirmText}</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            // Add event listeners
            overlay.addEventListener('click', (event) => {
                const action = event.target.dataset.action;
                if (action === 'confirm') {
                    resolve(true);
                    this.removeDialog(dialogId);
                } else if (action === 'cancel') {
                    resolve(false);
                    this.removeDialog(dialogId);
                } else if (event.target === overlay) {
                    // Click on overlay (outside dialog)
                    resolve(false);
                    this.removeDialog(dialogId);
                }
            });
            
            // Handle escape key
            const handleEscape = (event) => {
                if (event.key === 'Escape') {
                    resolve(false);
                    this.removeDialog(dialogId);
                    document.removeEventListener('keydown', handleEscape);
                }
            };
            document.addEventListener('keydown', handleEscape);
            
            // Focus the confirm button
            setTimeout(() => {
                const confirmBtn = overlay.querySelector('[data-action="confirm"]');
                if (confirmBtn) confirmBtn.focus();
            }, 100);
        });
    }

    /**
     * Remove a dialog from the DOM
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

    /**
     * Show a loading indicator
     * @param {string} message - Loading message
     * @param {Object} options - Loading options
     * @returns {Object} Loading controller
     */
    showLoading(message = 'Loading...', options = {}) {
        const {
            overlay = true,
            spinner = true,
            cancellable = false
        } = options;

        const loadingId = `loading-${++this.notificationId}`;
        
        const loadingElement = document.createElement('div');
        loadingElement.id = loadingId;
        loadingElement.className = `loading-indicator ${overlay ? 'loading-overlay' : 'loading-inline'}`;
        
        loadingElement.innerHTML = `
            <div class="loading-content">
                ${spinner ? '<div class="loading-spinner"></div>' : ''}
                <div class="loading-message">${message}</div>
                ${cancellable ? '<button class="loading-cancel">Cancel</button>' : ''}
            </div>
        `;
        
        document.body.appendChild(loadingElement);
        
        // Return controller object
        return {
            id: loadingId,
            update: (newMessage) => {
                const messageEl = loadingElement.querySelector('.loading-message');
                if (messageEl) messageEl.textContent = newMessage;
            },
            remove: () => {
                if (loadingElement.parentNode) {
                    loadingElement.classList.add('loading-exit');
                    setTimeout(() => {
                        if (loadingElement.parentNode) {
                            loadingElement.parentNode.removeChild(loadingElement);
                        }
                    }, 300);
                }
            }
        };
    }

    /**
     * Handle storage-related errors with graceful degradation
     * @param {Error} error - Storage error
     * @param {string} operation - Operation that failed
     * @returns {Object} Error handling result
     */
    handleStorageError(error, operation = 'storage operation') {
        console.error(`Storage error during ${operation}:`, error);
        
        let userMessage = '';
        let severity = 'warning';
        let fallbackAvailable = true;
        
        if (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            userMessage = 'Storage space is full. Some data may not be saved. Consider clearing old practice test results.';
            severity = 'warning';
        } else if (error.message.includes('localStorage')) {
            userMessage = 'Local storage is not available. Your progress will only be saved for this session.';
            severity = 'info';
        } else {
            userMessage = 'Unable to save your progress. Please ensure you have sufficient storage space.';
            severity = 'error';
            fallbackAvailable = false;
        }
        
        // Show user notification
        this.showNotification(userMessage, severity, 8000);
        
        // Log the error
        this.logError({
            type: 'storage',
            operation,
            error: error.message,
            name: error.name
        });
        
        return {
            handled: true,
            fallbackAvailable,
            severity,
            userMessage
        };
    }

    /**
     * Handle network-related errors
     * @param {Error} error - Network error
     * @param {string} operation - Operation that failed
     */
    handleNetworkError(error, operation = 'network operation') {
        console.error(`Network error during ${operation}:`, error);
        
        let userMessage = 'Network connection issue. Please check your internet connection and try again.';
        
        if (error.message.includes('fetch')) {
            userMessage = 'Failed to load data. Please refresh the page and try again.';
        }
        
        this.showNotification(userMessage, 'error', 8000);
        
        this.logError({
            type: 'network',
            operation,
            error: error.message
        });
    }

    /**
     * Handle quiz-related errors
     * @param {Error} error - Quiz error
     * @param {string} context - Context where error occurred
     */
    handleQuizError(error, context = 'quiz operation') {
        console.error(`Quiz error in ${context}:`, error);
        
        let userMessage = 'An error occurred during the quiz. Your progress has been saved.';
        let severity = 'warning';
        
        if (error.message.includes('questions')) {
            userMessage = 'Unable to load questions. Please refresh the page and try again.';
            severity = 'error';
        } else if (error.message.includes('timer')) {
            userMessage = 'Timer error detected. The quiz will continue without timing restrictions.';
            severity = 'warning';
        } else if (error.message.includes('session')) {
            userMessage = 'Session error detected. Your current progress may be lost.';
            severity = 'error';
        }
        
        this.showNotification(userMessage, severity, 8000);
        
        this.logError({
            type: 'quiz',
            context,
            error: error.message
        });
    }

    /**
     * Show error boundary for component failures
     * @param {Error} error - Component error
     * @param {string} componentName - Name of failed component
     */
    showErrorBoundary(error, componentName = 'component') {
        console.error(`Component error in ${componentName}:`, error);
        
        const errorId = `error-boundary-${++this.notificationId}`;
        
        const errorElement = document.createElement('div');
        errorElement.id = errorId;
        errorElement.className = 'error-boundary';
        
        errorElement.innerHTML = `
            <div class="error-boundary-content">
                <div class="error-icon">⚠️</div>
                <h3>Something went wrong</h3>
                <p>The ${componentName} encountered an error and couldn't load properly.</p>
                <div class="error-actions">
                    <button class="error-retry">Try Again</button>
                    <button class="error-report">Report Issue</button>
                </div>
            </div>
        `;
        
        // Add event listeners
        errorElement.querySelector('.error-retry').addEventListener('click', () => {
            window.location.reload();
        });
        
        errorElement.querySelector('.error-report').addEventListener('click', () => {
            this.showErrorReport(error, componentName);
        });
        
        document.body.appendChild(errorElement);
        
        this.logError({
            type: 'component',
            component: componentName,
            error: error.message,
            stack: error.stack
        });
    }

    /**
     * Show error report dialog
     * @param {Error} error - Error to report
     * @param {string} context - Error context
     */
    showErrorReport(error, context) {
        const reportData = {
            error: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        const message = `
            <p>Help us improve by reporting this error:</p>
            <textarea readonly style="width: 100%; height: 100px; margin: 10px 0; font-family: monospace; font-size: 12px;">${JSON.stringify(reportData, null, 2)}</textarea>
            <p>You can copy this information and send it to the developers.</p>
        `;
        
        this.showConfirmDialog(message, {
            title: 'Error Report',
            confirmText: 'Copy to Clipboard',
            cancelText: 'Close',
            type: 'info'
        }).then((confirmed) => {
            if (confirmed) {
                navigator.clipboard.writeText(JSON.stringify(reportData, null, 2)).then(() => {
                    this.showNotification('Error report copied to clipboard', 'success');
                }).catch(() => {
                    this.showNotification('Unable to copy to clipboard', 'warning');
                });
            }
        });
    }

    /**
     * Get error statistics for debugging
     * @returns {Object} Error statistics
     */
    getErrorStats() {
        const stats = {
            totalErrors: this.errorLog.length,
            errorsByType: {},
            recentErrors: this.errorLog.slice(-10),
            activeNotifications: this.notifications.size
        };
        
        this.errorLog.forEach(error => {
            const type = error.type || 'unknown';
            stats.errorsByType[type] = (stats.errorsByType[type] || 0) + 1;
        });
        
        return stats;
    }

    /**
     * Clear error log
     */
    clearErrorLog() {
        this.errorLog = [];
        console.log('Error log cleared');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ErrorHandler;
}