/**
 * AP Government Study Tool - Main Application Entry Point
 * 
 * This is the main application controller that orchestrates the entire
 * AP Government study tool. It manages navigation between different views,
 * initializes components, and handles the overall application state.
 */

// Load other required classes
if (typeof StorageWrapper === 'undefined') {
    console.error('StorageWrapper class not found. Make sure storage-wrapper.js is loaded.');
}
if (typeof ProgressTracker === 'undefined') {
    console.error('ProgressTracker class not found. Make sure progress-tracker.js is loaded.');
}
if (typeof QuestionManager === 'undefined') {
    console.error('QuestionManager class not found. Make sure question-manager.js is loaded.');
}
if (typeof QuizEngine === 'undefined') {
    console.error('QuizEngine class not found. Make sure quiz-engine.js is loaded.');
}

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.currentMode = null;
        this.isInitialized = false;
        
        // Initialize error handling first
        this.errorHandler = null;
        this.confirmationDialogs = null;
        this.loadingIndicator = null;
        
        // Enhanced application state management
        this.state = {
            questions: [],
            userProgress: this.getDefaultProgressStructure(),
            currentSession: null,
            navigationHistory: [],
            lastSavedState: null,
            sessionId: 'session_' + Date.now(),
            isStateCorrupted: false
        };
        
        // State management configuration
        this.stateConfig = {
            autoSaveInterval: 30000, // 30 seconds
            maxHistoryLength: 10,
            sessionTimeout: 3600000, // 1 hour
            corruptionCheckInterval: 60000 // 1 minute
        };
        
        // DOM elements
        this.elements = {};
        
        // Chart instances
        this.scoreChart = null;
        
        // Core components
        this.storageWrapper = null;
        this.progressTracker = null;
        this.questionManager = null;
        this.quizEngine = null;
        
        // State management timers
        this.autoSaveTimer = null;
        this.corruptionCheckTimer = null;
        
        // Bind methods
        this.handleModeSelection = this.handleModeSelection.bind(this);
        this.navigateToView = this.navigateToView.bind(this);
        this.handleReturnToDashboard = this.handleReturnToDashboard.bind(this);
        this.saveApplicationState = this.saveApplicationState.bind(this);
        this.restoreApplicationState = this.restoreApplicationState.bind(this);
        this.handleStateCorruption = this.handleStateCorruption.bind(this);
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            console.log('Initializing AP Government Study Tool...');
            
            // Cache DOM elements first
            this.cacheElements();
            
            // Set up basic event listeners
            this.setupEventListeners();
            
            // Initialize error handling (optional)
            try {
                this.initializeErrorHandling();
            } catch (e) {
                console.warn('Error handling initialization failed, continuing without it:', e);
            }
            
            // Try to load initial data (optional)
            try {
                await this.loadInitialData();
            } catch (e) {
                console.warn('Initial data loading failed, continuing with basic functionality:', e);
            }
            
            // Initialize dashboard (optional)
            try {
                this.initializeDashboard();
            } catch (e) {
                console.warn('Dashboard initialization failed, continuing with basic functionality:', e);
            }
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            this.isInitialized = false;
            throw error;
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        console.log('Caching DOM elements...');
        
        this.elements = {
            // Navigation
            dashboardBtn: document.getElementById('dashboard-btn'),
            
            // Views
            dashboardView: document.getElementById('dashboard'),
            quizView: document.getElementById('quiz'),
            resultsView: document.getElementById('results'),
            
            // Mode selection buttons
            unitQuizBtn: document.getElementById('unit-quiz-btn'),
            practiceTestBtn: document.getElementById('practice-test-btn'),
            studyModeBtn: document.getElementById('study-mode-btn'),
            
            // Progress elements
            progressChart: document.getElementById('progress-chart'),
            scoreCanvas: document.getElementById('score-canvas'),
            overallProgress: document.getElementById('overall-progress'),
            totalAnswered: document.getElementById('total-answered'),
            testCount: document.getElementById('test-count'),
            noDataMessage: document.getElementById('no-data-message'),
            
            // Quiz elements
            questionCounter: document.getElementById('question-counter'),
            timerDisplay: document.getElementById('timer-display'),
            questionContainer: document.getElementById('question-container'),
            
            // Control buttons
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn'),
            submitBtn: document.getElementById('submit-btn'),
            endQuizBtn: document.getElementById('end-quiz-btn'),
            returnDashboardBtn: document.getElementById('return-dashboard-btn'),
            
            // Results
            resultsContent: document.getElementById('results-content')
        };
        
        // Debug: Check if mode buttons were found
        console.log('Mode buttons found:', {
            unitQuizBtn: !!this.elements.unitQuizBtn,
            practiceTestBtn: !!this.elements.practiceTestBtn,
            studyModeBtn: !!this.elements.studyModeBtn
        });
        
        if (!this.elements.unitQuizBtn) console.error('unit-quiz-btn element not found in DOM');
        if (!this.elements.practiceTestBtn) console.error('practice-test-btn element not found in DOM');
        if (!this.elements.studyModeBtn) console.error('study-mode-btn element not found in DOM');
    }

    /**
     * Set up event listeners for the application
     */
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Mode selection buttons
        if (this.elements.unitQuizBtn) {
            console.log('Adding unit quiz button listener');
            this.elements.unitQuizBtn.addEventListener('click', () => {
                console.log('Unit quiz button clicked!');
                this.handleModeSelection('unit');
            });
        } else {
            console.error('Unit quiz button not found!');
        }
        
        if (this.elements.practiceTestBtn) {
            console.log('Adding practice test button listener');
            this.elements.practiceTestBtn.addEventListener('click', () => {
                console.log('Practice test button clicked!');
                this.handleModeSelection('practice');
            });
        } else {
            console.error('Practice test button not found!');
        }
        
        if (this.elements.studyModeBtn) {
            console.log('Adding study mode button listener');
            this.elements.studyModeBtn.addEventListener('click', () => {
                console.log('Study mode button clicked!');
                this.handleModeSelection('study');
            });
        } else {
            console.error('Study mode button not found!');
        }

        // Navigation buttons
        if (this.elements.dashboardBtn) {
            this.elements.dashboardBtn.addEventListener('click', this.handleReturnToDashboard);
        }
        
        if (this.elements.returnDashboardBtn) {
            this.elements.returnDashboardBtn.addEventListener('click', this.handleReturnToDashboard);
        }

        // Quiz control buttons (will be handled by QuizEngine when implemented)
        if (this.elements.prevBtn) {
            this.elements.prevBtn.addEventListener('click', () => this.handleQuizNavigation('previous'));
        }
        
        if (this.elements.nextBtn) {
            this.elements.nextBtn.addEventListener('click', () => this.handleQuizNavigation('next'));
        }
        
        if (this.elements.submitBtn) {
            this.elements.submitBtn.addEventListener('click', () => this.handleQuizSubmit());
        }
        
        if (this.elements.endQuizBtn) {
            this.elements.endQuizBtn.addEventListener('click', () => this.handleEndQuiz());
        }

        // Handle browser back/forward navigation with enhanced state management
        window.addEventListener('popstate', (event) => {
            this.handleBrowserNavigation(event);
        });

        // Handle page unload with enhanced state management
        window.addEventListener('beforeunload', (event) => {
            this.handlePageUnload(event);
        });

        // Handle page visibility changes (for timer accuracy)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle window resize for chart redrawing
        window.addEventListener('resize', () => {
            clearTimeout(this.resizeTimeout);
            this.resizeTimeout = setTimeout(() => {
                if (this.currentView === 'dashboard') {
                    this.updateScoreChart();
                }
            }, 250);
        });

        // Add keyboard navigation for quiz
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });

        // Auto-save progress periodically (handled by state management now)
        // Removed individual timer in favor of comprehensive state management
    }

    /**
     * Load initial application data
     */
    async loadInitialData() {
        try {
            // Initialize core components
            this.initializeCoreComponents();
            
            // Initialize question bank loader
            this.questionBankLoader = new QuestionBankLoader();
            
            // Load questions from the complete question bank
            try {
                const questions = await this.questionBankLoader.loadQuestions();
                this.questionManager.loadQuestions(questions);
                this.state.questions = questions;
                
                // Validate question bank
                const validation = this.questionBankLoader.validateQuestionBank();
                if (!validation.isValid) {
                    console.warn('Question bank validation issues:', validation.issues);
                    this.showNotification('Some question bank issues detected. Check console for details.', 'warning', 5000);
                }
                
                console.log(`Loaded ${questions.length} questions from complete question bank`);
                
            } catch (error) {
                console.error('Failed to load complete question bank:', error);
                
                // Fallback to sample questions
                if (typeof sampleQuestions !== 'undefined') {
                    this.questionManager.loadQuestions(sampleQuestions);
                    this.state.questions = sampleQuestions;
                    console.log('Fallback: Sample questions loaded');
                    this.showNotification('Using sample questions. Full question bank failed to load.', 'warning', 5000);
                } else {
                    throw new Error('No questions available');
                }
            }
            
            console.log('Initial data loaded');
        } catch (error) {
            console.error('Failed to load initial data:', error);
            throw error;
        }
    }

    /**
     * Initialize error handling system
     */
    initializeErrorHandling() {
        try {
            // Initialize error handler
            if (typeof ErrorHandler !== 'undefined') {
                this.errorHandler = new ErrorHandler();
                console.log('Error handler initialized');
            } else {
                console.warn('ErrorHandler class not found');
            }
            
            // Initialize confirmation dialogs
            if (typeof ConfirmationDialogs !== 'undefined' && this.errorHandler) {
                this.confirmationDialogs = new ConfirmationDialogs(this.errorHandler);
                console.log('Confirmation dialogs initialized');
            } else {
                console.warn('ConfirmationDialogs class not found or error handler unavailable');
            }
        } catch (error) {
            console.error('Failed to initialize error handling:', error);
            // Continue without error handling if it fails
        }
    }

    /**
     * Show loading indicator during initialization
     */
    showInitializationLoading() {
        if (this.errorHandler) {
            this.loadingIndicator = this.errorHandler.showLoading('Initializing AP Government Study Tool...', {
                overlay: true,
                spinner: true,
                cancellable: false
            });
        }
    }

    /**
     * Hide initialization loading indicator
     */
    hideInitializationLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.remove();
            this.loadingIndicator = null;
        }
    }

    /**
     * Handle initialization errors
     * @param {Error} error - Initialization error
     */
    handleInitializationError(error) {
        console.error('Application initialization failed:', error);
        
        // Hide loading indicator
        this.hideInitializationLoading();
        
        if (this.errorHandler) {
            this.errorHandler.showErrorBoundary(error, 'Application');
        } else {
            // Fallback error display
            document.body.innerHTML = `
                <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
                    <h2 style="color: #D0021B;">Application Failed to Load</h2>
                    <p>The AP Government Study Tool encountered an error during initialization.</p>
                    <p>Please refresh the page to try again.</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #4A90E2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    /**
     * Initialize core application components
     */
    initializeCoreComponents() {
        try {
            console.log('Initializing storage wrapper...');
            // Initialize storage wrapper with error handler
            this.storageWrapper = new StorageWrapper(this.errorHandler);
            
            console.log('Initializing progress tracker...');
            // Initialize progress tracker
            this.progressTracker = new ProgressTracker(this.storageWrapper);
            
            console.log('Initializing question manager...');
            // Initialize question manager
            this.questionManager = new QuestionManager();
            
            console.log('Initializing quiz engine...');
            // Initialize quiz engine
            this.quizEngine = new QuizEngine(this.questionManager, this.progressTracker);
            
            console.log('Initializing results display...');
            // Initialize results display (with safety check)
            if (this.elements.resultsContent) {
                this.resultsDisplay = new ResultsDisplay(this.elements.resultsContent);
            } else {
                console.warn('Results content element not found, results display will be limited');
                this.resultsDisplay = null;
            }
            
            console.log('Setting up quiz engine events...');
            // Set up quiz engine event handlers
            this.setupQuizEngineEvents();
            
            console.log('Core components initialized successfully');
        } catch (error) {
            console.error('Error initializing core components:', error);
            throw error;
        }
    }

    /**
     * Set up quiz engine event handlers
     */
    setupQuizEngineEvents() {
        // Handle question changes
        this.quizEngine.onQuestionChange = (data) => {
            this.handleQuestionChange(data);
        };
        
        // Handle answer submissions
        this.quizEngine.onAnswerSubmit = (data) => {
            this.handleAnswerSubmit(data);
        };
        
        // Handle quiz completion
        this.quizEngine.onQuizComplete = (results) => {
            this.handleQuizComplete(results);
        };
        
        // Handle mode-specific events
        this.quizEngine.onModeSpecificEvent = (event) => {
            this.handleModeSpecificEvent(event);
        };
        
        // Handle timer tick events
        this.quizEngine.onTimerTick = (data) => {
            this.handleTimerTick(data);
        };
        
        // Handle timer warnings
        this.quizEngine.onTimerWarning = (data) => {
            this.handleTimerWarning(data);
        };
    }

    /**
     * Handle question change events from quiz engine
     */
    handleQuestionChange(data) {
        this.updateQuestionDisplay(data);
        this.updateQuizControls(data);
    }

    /**
     * Handle answer submit events from quiz engine
     */
    handleAnswerSubmit(data) {
        // Update UI to show answer was submitted
        console.log('Answer submitted:', data);
    }

    /**
     * Handle mode-specific events from quiz engine
     */
    handleModeSpecificEvent(event) {
        console.log('Mode-specific event:', event);
        
        switch (event.type) {
            case 'auto_submit':
                this.showAutoSubmitNotification(event);
                break;
            case 'immediate_feedback':
                this.showImmediateFeedback(event);
                break;
        }
    }

    /**
     * Handle timer tick events
     * @param {Object} data - Timer tick data
     */
    handleTimerTick(data) {
        this.updateTimerDisplay(data);
    }

    /**
     * Handle timer warning events
     * @param {Object} data - Timer warning data
     */
    handleTimerWarning(data) {
        this.showTimerWarning(data);
    }

    /**
     * Update timer display in quiz view
     * @param {Object} data - Timer data
     */
    updateTimerDisplay(data) {
        const timerDisplay = this.elements.timerDisplay;
        if (timerDisplay) {
            // Hide timer in study mode
            if (this.currentMode === 'study') {
                timerDisplay.parentElement.style.display = 'none';
                return;
            }
            
            // Show and update timer for other modes
            timerDisplay.parentElement.style.display = 'block';
            timerDisplay.textContent = data.formatted;
            
            // Add visual warning for low time
            const remainingMinutes = Math.ceil(data.remaining / (60 * 1000));
            timerDisplay.classList.toggle('warning', remainingMinutes <= 5);
            timerDisplay.classList.toggle('critical', remainingMinutes <= 1);
        }
    }

    /**
     * Show timer warning notification
     * @param {Object} data - Warning data
     */
    showTimerWarning(data) {
        if (data.type === 'time_warning') {
            this.showNotification(data.message, 'warning', 5000);
        } else if (data.type === 'time_expired') {
            this.showNotification(data.message, 'error', 10000);
        }
    }

    /**
     * Show auto-submit notification
     * @param {Object} event - Auto-submit event data
     */
    showAutoSubmitNotification(event) {
        const message = 'Time expired! Your practice test has been automatically submitted.';
        this.showNotification(message, 'info', 10000);
    }

    /**
     * Show immediate feedback for study mode
     * @param {Object} event - Feedback event data
     */
    showImmediateFeedback(event) {
        // Remove any existing feedback first
        const existingFeedback = document.querySelector('.feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const feedbackContainer = document.createElement('div');
        feedbackContainer.className = `feedback ${event.isCorrect ? 'correct' : 'incorrect'}`;
        feedbackContainer.innerHTML = `
            <div class="feedback-result">
                ${event.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>
            ${!event.isCorrect ? `
                <div class="feedback-answer">
                    Correct answer: ${event.correctAnswer}
                </div>
            ` : ''}
            ${event.explanation ? `
                <div class="feedback-explanation">
                    ${event.explanation}
                </div>
            ` : ''}
            <div class="feedback-actions">
                <button id="continue-study-btn" class="control-btn primary">Continue Studying</button>
            </div>
        `;
        
        // Insert feedback after question container
        const questionContainer = this.elements.questionContainer;
        if (questionContainer && questionContainer.parentNode) {
            questionContainer.parentNode.insertBefore(feedbackContainer, questionContainer.nextSibling);
            
            // Add event listener to continue button
            const continueBtn = document.getElementById('continue-study-btn');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    this.handleStudyModeContinue();
                });
            }
        }
    }

    /**
     * Update question display in quiz view
     */
    updateQuestionDisplay(data) {
        const questionContainer = this.elements.questionContainer;
        const questionCounter = this.elements.questionCounter;
        
        if (!questionContainer || !data.question) return;
        
        // Update question counter - different format for study mode
        if (questionCounter) {
            if (this.currentMode === 'study') {
                questionCounter.textContent = `Study Question ${data.questionNumber}`;
            } else {
                questionCounter.textContent = `Question ${data.questionNumber} of ${data.totalQuestions}`;
            }
        }
        
        // Update progress bar (not for study mode)
        if (this.currentMode !== 'study') {
            this.updateProgressBar(data.questionNumber, data.totalQuestions);
            this.updateQuestionStatus(data);
        }
        
        // Create question HTML with enhanced accessibility
        const question = data.question;
        questionContainer.innerHTML = `
            <div class="question-text" role="heading" aria-level="3">${question.question}</div>
            <fieldset class="answer-options" role="radiogroup" aria-labelledby="question-text">
                <legend class="sr-only">Select your answer</legend>
                ${question.options.map((option, index) => `
                    <label class="answer-option ${data.currentAnswer === index ? 'selected' : ''}" 
                           data-answer-index="${index}"
                           role="radio" 
                           aria-checked="${data.currentAnswer === index ? 'true' : 'false'}"
                           tabindex="${data.currentAnswer === index ? '0' : '-1'}">
                        <input type="radio" name="answer" value="${index}" 
                               ${data.currentAnswer === index ? 'checked' : ''}
                               aria-label="Option ${String.fromCharCode(65 + index)}: ${option}">
                        <span class="answer-text" aria-hidden="true">
                            <span class="answer-letter">${String.fromCharCode(65 + index)}.</span> ${option}
                        </span>
                    </label>
                `).join('')}
            </fieldset>
        `;
        
        // Add event listeners to answer options
        const answerOptions = questionContainer.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            option.addEventListener('click', () => {
                const answerIndex = parseInt(option.dataset.answerIndex);
                this.selectAnswer(answerIndex);
            });
            
            // Add keyboard support for radio group
            option.addEventListener('keydown', (e) => {
                switch (e.key) {
                    case 'ArrowDown':
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = (index + 1) % answerOptions.length;
                        answerOptions[nextIndex].focus();
                        break;
                    case 'ArrowUp':
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = (index - 1 + answerOptions.length) % answerOptions.length;
                        answerOptions[prevIndex].focus();
                        break;
                    case ' ':
                    case 'Enter':
                        e.preventDefault();
                        option.click();
                        break;
                }
            });
        });
        
        // Focus the first option for keyboard users
        if (answerOptions.length > 0) {
            answerOptions[0].setAttribute('tabindex', '0');
        }
    }

    /**
     * Update progress bar display
     * @param {number} currentQuestion - Current question number (1-based)
     * @param {number} totalQuestions - Total number of questions
     */
    updateProgressBar(currentQuestion, totalQuestions) {
        const progressBar = document.getElementById('progress-bar');
        const progressContainer = document.getElementById('progress-bar-container');
        
        if (progressBar && progressContainer) {
            const percentage = (currentQuestion / totalQuestions) * 100;
            progressBar.style.width = `${percentage}%`;
            
            // Hide progress bar in study mode
            if (this.currentMode === 'study') {
                progressContainer.style.display = 'none';
            } else {
                progressContainer.style.display = 'block';
            }
        }
    }

    /**
     * Update question status indicators
     * @param {Object} data - Question data
     */
    updateQuestionStatus(data) {
        const statusContainer = document.getElementById('question-status');
        if (!statusContainer || this.currentMode === 'study') {
            if (statusContainer) statusContainer.style.display = 'none';
            return;
        }

        statusContainer.style.display = 'block';
        
        // Get answered questions from quiz engine
        const answeredQuestions = this.quizEngine.answers || [];
        const totalQuestions = data.totalQuestions;
        const currentIndex = data.questionIndex;

        // Create status grid
        let statusHTML = `
            <h4>Question Status</h4>
            <div class="status-grid">
        `;

        for (let i = 0; i < totalQuestions; i++) {
            const questionNum = i + 1;
            const isAnswered = answeredQuestions[i] !== undefined;
            const isCurrent = i === currentIndex;
            
            let statusClass = 'unanswered';
            if (isCurrent) {
                statusClass = 'current';
            } else if (isAnswered) {
                statusClass = 'answered';
            }

            statusHTML += `
                <div class="status-item ${statusClass}" 
                     data-question-index="${i}"
                     title="Question ${questionNum}${isAnswered ? ' (Answered)' : ' (Not answered)'}">
                    ${questionNum}
                </div>
            `;
        }

        statusHTML += '</div>';
        statusContainer.innerHTML = statusHTML;

        // Add click handlers for navigation
        const statusItems = statusContainer.querySelectorAll('.status-item');
        statusItems.forEach(item => {
            item.addEventListener('click', () => {
                const questionIndex = parseInt(item.dataset.questionIndex);
                if (this.quizEngine.isActive) {
                    this.quizEngine.navigateToQuestion(questionIndex);
                }
            });
        });
    }

    /**
     * Update quiz control buttons
     */
    updateQuizControls(data) {
        const prevBtn = this.elements.prevBtn;
        const nextBtn = this.elements.nextBtn;
        const submitBtn = this.elements.submitBtn;
        const endQuizBtn = this.elements.endQuizBtn;
        
        // Study mode has different controls
        if (this.currentMode === 'study') {
            // Hide navigation buttons in study mode
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            
            // Show submit button only if question not answered
            if (submitBtn) {
                submitBtn.style.display = data.isAnswered ? 'none' : 'inline-block';
                submitBtn.textContent = 'Submit Answer';
            }
            
            // Always show end quiz button in study mode
            if (endQuizBtn) {
                endQuizBtn.style.display = 'inline-block';
                endQuizBtn.textContent = 'End Study Session';
            }
        } else {
            // Normal navigation for unit and practice modes
            if (prevBtn) {
                prevBtn.style.display = 'inline-block';
                prevBtn.disabled = !data.canGoPrevious;
            }
            
            if (nextBtn) {
                nextBtn.style.display = 'inline-block';
                nextBtn.disabled = !data.canGoNext;
            }
            
            if (submitBtn) {
                submitBtn.style.display = 'inline-block';
                submitBtn.textContent = data.isAnswered ? 'Change Answer' : 'Submit Answer';
            }
            
            if (endQuizBtn) {
                endQuizBtn.style.display = 'inline-block';
                endQuizBtn.textContent = 'End Quiz';
            }
        }
    }

    /**
     * Select an answer for the current question
     */
    selectAnswer(answerIndex) {
        // Update UI to show selection
        const answerOptions = document.querySelectorAll('.answer-option');
        answerOptions.forEach((option, index) => {
            option.classList.toggle('selected', index === answerIndex);
            const radio = option.querySelector('input[type="radio"]');
            radio.checked = index === answerIndex;
        });
        
        // Enable submit button when answer is selected
        if (this.elements.submitBtn) {
            this.elements.submitBtn.disabled = false;
        }
        
        // Update navigation buttons to reflect new state
        if (this.quizEngine && this.quizEngine.isActive) {
            const currentData = this.quizEngine.getCurrentQuestionData();
            if (currentData) {
                this.updateNavigationButtons(currentData);
            }
        }
    }

    /**
     * Get the currently selected answer
     */
    getSelectedAnswer() {
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        return selectedRadio ? parseInt(selectedRadio.value) : null;
    }

    /**
     * Show quiz completion prompt
     */
    showQuizCompletionPrompt() {
        const score = this.quizEngine.calculateScore();
        const unansweredCount = score.totalQuestions - score.total;
        
        let message = `You have answered ${score.total} out of ${score.totalQuestions} questions.`;
        
        if (unansweredCount > 0) {
            message += `\n\n${unansweredCount} questions remain unanswered.`;
            message += '\n\nWould you like to:';
            message += '\n• Continue answering questions (Cancel)';
            message += '\n• End the quiz now (OK)';
        } else {
            message += '\n\nAll questions have been answered!';
            message += '\n\nWould you like to end the quiz and see your results?';
        }
        
        if (confirm(message)) {
            this.handleEndQuiz();
        }
    }

    /**
     * Show enhanced completion dialog for better UX
     */
    showEnhancedCompletionDialog() {
        const score = this.quizEngine.calculateScore();
        const unansweredCount = score.totalQuestions - score.total;
        
        // Create modal dialog
        const modal = document.createElement('div');
        modal.className = 'completion-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Quiz Progress</h3>
                </div>
                <div class="modal-body">
                    <div class="completion-stats">
                        <div class="stat-item">
                            <span class="stat-number">${score.total}</span>
                            <span class="stat-label">Answered</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${unansweredCount}</span>
                            <span class="stat-label">Remaining</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${score.totalQuestions}</span>
                            <span class="stat-label">Total</span>
                        </div>
                    </div>
                    ${unansweredCount > 0 ? `
                        <p>You still have ${unansweredCount} unanswered questions. You can continue answering or end the quiz now.</p>
                    ` : `
                        <p>Congratulations! You've answered all questions. Ready to see your results?</p>
                    `}
                </div>
                <div class="modal-actions">
                    <button class="modal-btn secondary" id="continue-quiz-btn">Continue Quiz</button>
                    <button class="modal-btn primary" id="end-quiz-modal-btn">End Quiz</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('continue-quiz-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        document.getElementById('end-quiz-modal-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            this.handleEndQuiz();
        });
        
        // Close on overlay click
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    /**
     * Initialize the dashboard view
     */
    initializeDashboard() {
        this.updateProgressDisplay();
        this.initializeScoreChart();
    }

    /**
     * Handle mode selection from dashboard
     */
    async handleModeSelection(mode) {
        console.log(`Mode selected: ${mode}`);
        this.currentMode = mode;
        
        try {
            switch (mode) {
                case 'unit':
                    console.log('Starting unit quiz mode...');
                    await this.startUnitQuiz();
                    break;
                case 'practice':
                    console.log('Starting practice test mode...');
                    await this.startPracticeTest();
                    break;
                case 'study':
                    console.log('Starting study mode...');
                    await this.startStudyMode();
                    break;
                default:
                    throw new Error(`Unknown mode: ${mode}`);
            }
            
        } catch (error) {
            console.error('Failed to start quiz:', error);
            if (this.errorHandler) {
                this.errorHandler.showNotification(`Error starting ${mode} mode: ${error.message}`, 'error', 5000);
            } else {
                alert(`Error starting ${mode} mode: ${error.message}`);
            }
        }
    }

    /**
     * Start unit quiz mode
     */
    async startUnitQuiz() {
        try {
            // Show unit selection interface
            await this.showUnitSelection();
        } catch (error) {
            console.error('Failed to start unit quiz:', error);
            if (this.errorHandler) {
                this.errorHandler.handleQuizError(error, 'unit quiz initialization');
            }
            throw error;
        }
    }

    /**
     * Start practice test mode
     */
    async startPracticeTest() {
        try {
            // Validate that we have enough questions for a practice test
            if (!this.questionManager || this.questionManager.questions.length < 10) {
                throw new Error('Insufficient questions available for practice test');
            }
            
            this.quizEngine.startQuiz('practice');
            this.navigateToView('quiz');
            console.log('Started practice test');
            
        } catch (error) {
            console.error('Failed to start practice test:', error);
            if (this.errorHandler) {
                this.errorHandler.handleQuizError(error, 'practice test initialization');
            }
            throw error;
        }
    }

    /**
     * Start study mode
     */
    async startStudyMode() {
        try {
            // Validate that we have questions for study mode
            if (!this.questionManager || this.questionManager.questions.length === 0) {
                throw new Error('No questions available for study mode');
            }
            
            this.quizEngine.startQuiz('study');
            this.navigateToView('quiz');
            
            // Hide timer for study mode
            const timerDisplay = this.elements.timerDisplay;
            if (timerDisplay && timerDisplay.parentElement) {
                timerDisplay.parentElement.style.display = 'none';
            }
            
            console.log('Started study mode');
            
        } catch (error) {
            console.error('Failed to start study mode:', error);
            if (this.errorHandler) {
                this.errorHandler.handleQuizError(error, 'study mode initialization');
            }
            throw error;
        }
    }

    /**
     * Navigate between different views with enhanced state management
     */
    navigateToView(viewName, updateHistory = true, saveState = true) {
        try {
            // Validate view exists
            const targetView = document.getElementById(viewName);
            if (!targetView) {
                throw new Error(`View not found: ${viewName}`);
            }
            
            // Save current state before navigation if requested
            if (saveState && this.isInitialized) {
                this.saveApplicationState();
            }
            
            // Add to navigation history
            if (updateHistory && this.currentView !== viewName) {
                this.addToNavigationHistory(this.currentView, viewName);
            }
            
            // Hide all views
            const views = document.querySelectorAll('.view');
            views.forEach(view => view.classList.remove('active'));
            
            // Show target view
            targetView.classList.add('active');
            const previousView = this.currentView;
            this.currentView = viewName;
            
            // Update browser history
            if (updateHistory) {
                const state = { 
                    view: viewName, 
                    mode: this.currentMode,
                    timestamp: Date.now(),
                    sessionId: this.state.sessionId
                };
                const title = `AP Government Study Tool - ${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`;
                
                // Use replaceState for same view, pushState for different views
                if (previousView === viewName) {
                    history.replaceState(state, title, `#${viewName}`);
                } else {
                    history.pushState(state, title, `#${viewName}`);
                }
            }
            
            // Update navigation buttons
            this.updateNavigationState();
            
            // Handle view-specific initialization
            this.handleViewChange(previousView, viewName);
            
            console.log(`Navigated from ${previousView} to ${viewName}`);
            
        } catch (error) {
            console.error('Navigation error:', error);
            this.handleNavigationError(error, viewName);
        }
    }

    /**
     * Add navigation to history tracking
     */
    addToNavigationHistory(fromView, toView) {
        const historyEntry = {
            from: fromView,
            to: toView,
            timestamp: Date.now(),
            mode: this.currentMode
        };
        
        this.state.navigationHistory.push(historyEntry);
        
        // Keep history within limits
        if (this.state.navigationHistory.length > this.stateConfig.maxHistoryLength) {
            this.state.navigationHistory = this.state.navigationHistory.slice(-this.stateConfig.maxHistoryLength);
        }
    }

    /**
     * Handle view change events
     */
    handleViewChange(fromView, toView) {
        // Reset session timeout on navigation
        this.setupSessionTimeout();
        
        // View-specific handling
        switch (toView) {
            case 'dashboard':
                this.handleDashboardEntry(fromView);
                break;
            case 'quiz':
                this.handleQuizEntry(fromView);
                break;
            case 'results':
                this.handleResultsEntry(fromView);
                break;
        }
    }

    /**
     * Handle dashboard entry
     */
    handleDashboardEntry(fromView) {
        // Refresh dashboard data if coming from quiz
        if (fromView === 'quiz' || fromView === 'results') {
            this.updateProgressDisplay();
            this.updateScoreChart();
        }
        
        // Clear any active quiz warnings
        this.clearNavigationWarnings();
    }

    /**
     * Handle quiz entry
     */
    handleQuizEntry(fromView) {
        // Set up quiz-specific navigation warnings
        this.setupQuizNavigationWarnings();
        
        // Initialize quiz UI if needed
        if (this.quizEngine && this.quizEngine.isActive) {
            this.refreshQuizUI();
        }
    }

    /**
     * Handle results entry
     */
    handleResultsEntry(fromView) {
        // Ensure results are properly displayed
        if (fromView === 'quiz') {
            // Results should already be set by quiz completion
            console.log('Entered results view from quiz');
        }
    }

    /**
     * Set up quiz navigation warnings
     */
    setupQuizNavigationWarnings() {
        // This will be used by the beforeunload handler
        this.quizNavigationWarningActive = true;
    }

    /**
     * Clear navigation warnings
     */
    clearNavigationWarnings() {
        this.quizNavigationWarningActive = false;
    }

    /**
     * Handle navigation errors
     */
    handleNavigationError(error, attemptedView) {
        console.error(`Failed to navigate to ${attemptedView}:`, error);
        
        // Try to recover by going to dashboard
        if (attemptedView !== 'dashboard') {
            console.log('Attempting recovery navigation to dashboard');
            try {
                this.navigateToView('dashboard', false, false);
            } catch (recoveryError) {
                console.error('Recovery navigation also failed:', recoveryError);
                this.showError('Navigation system error. Please refresh the page.');
            }
        } else {
            this.showError('Critical navigation error. Please refresh the page.');
        }
    }

    /**
     * Get navigation history
     */
    getNavigationHistory() {
        return [...this.state.navigationHistory];
    }

    /**
     * Can navigate back in history
     */
    canNavigateBack() {
        return this.state.navigationHistory.length > 0;
    }

    /**
     * Navigate back in history
     */
    navigateBack() {
        if (!this.canNavigateBack()) {
            console.warn('No navigation history available');
            return false;
        }
        
        const lastEntry = this.state.navigationHistory[this.state.navigationHistory.length - 1];
        if (lastEntry && lastEntry.from) {
            this.navigateToView(lastEntry.from);
            return true;
        }
        
        return false;
    }

    /**
     * Handle browser navigation (back/forward buttons)
     */
    handleBrowserNavigation(event) {
        try {
            // Check if we have valid state
            if (event.state && event.state.view) {
                const targetView = event.state.view;
                const stateSessionId = event.state.sessionId;
                
                // Validate session continuity
                if (stateSessionId && stateSessionId !== this.state.sessionId) {
                    console.warn('Session ID mismatch in browser navigation');
                    // Could be from a different session, handle carefully
                }
                
                // Check for navigation warnings
                if (this.shouldWarnOnNavigation()) {
                    const shouldProceed = this.showNavigationWarning();
                    if (!shouldProceed) {
                        // Push current state back to prevent navigation
                        const currentState = {
                            view: this.currentView,
                            mode: this.currentMode,
                            timestamp: Date.now(),
                            sessionId: this.state.sessionId
                        };
                        history.pushState(currentState, '', `#${this.currentView}`);
                        return;
                    }
                }
                
                // Proceed with navigation
                this.navigateToView(targetView, false, true);
                
            } else {
                // No state available, default to dashboard
                console.log('No state in popstate event, defaulting to dashboard');
                this.navigateToView('dashboard', false, true);
            }
            
        } catch (error) {
            console.error('Browser navigation error:', error);
            this.handleNavigationError(error, 'unknown');
        }
    }

    /**
     * Handle page unload with state saving and navigation warnings
     */
    handlePageUnload(event) {
        try {
            // Always save state on page unload
            this.saveApplicationState();
            
            // Stop state management timers
            this.stopStateManagement();
            
            // Check for navigation warnings
            if (this.shouldWarnOnNavigation()) {
                const message = this.getNavigationWarningMessage();
                event.preventDefault();
                event.returnValue = message;
                return message;
            }
            
        } catch (error) {
            console.error('Page unload handling error:', error);
            
            // Log error for debugging
            if (this.errorHandler) {
                this.errorHandler.logError({
                    type: 'page_unload',
                    error: error.message,
                    timestamp: Date.now()
                });
            }
            
            // Don't prevent unload on error, but try to save critical data
            try {
                const criticalData = {
                    userProgress: this.state.userProgress,
                    currentSession: this.state.currentSession,
                    timestamp: Date.now(),
                    emergencyBackup: true
                };
                
                // Try multiple storage methods
                if (this.storageWrapper) {
                    this.storageWrapper.setItem('app_emergency_backup', criticalData);
                } else {
                    localStorage.setItem('app_emergency_backup', JSON.stringify(criticalData));
                }
                
            } catch (saveError) {
                console.error('Emergency save failed:', saveError);
                // Last resort: try sessionStorage
                try {
                    sessionStorage.setItem('app_emergency_backup', JSON.stringify({
                        userProgress: this.state.userProgress,
                        timestamp: Date.now()
                    }));
                } catch (sessionError) {
                    console.error('Session storage emergency save also failed:', sessionError);
                }
            }
        }
    }

    /**
     * Check if navigation warning should be shown
     */
    shouldWarnOnNavigation() {
        // Warn if there's an active timed quiz
        if (this.quizEngine && this.quizEngine.shouldWarnOnNavigation && this.quizEngine.shouldWarnOnNavigation()) {
            return true;
        }
        
        // Warn if there's unsaved progress in current session
        if (this.state.currentSession && this.currentView === 'quiz') {
            return true;
        }
        
        // Warn if quiz navigation warning is explicitly active
        if (this.quizNavigationWarningActive) {
            return true;
        }
        
        return false;
    }

    /**
     * Show navigation warning dialog
     */
    showNavigationWarning() {
        let message = 'You have an active quiz session. ';
        
        if (this.quizEngine && this.quizEngine.getNavigationWarningMessage) {
            message = this.quizEngine.getNavigationWarningMessage();
        } else {
            message += 'Are you sure you want to leave? Your progress will be saved but the quiz will end.';
        }
        
        return confirm(message);
    }

    /**
     * Get navigation warning message
     */
    getNavigationWarningMessage() {
        if (this.quizEngine && this.quizEngine.getNavigationWarningMessage) {
            return this.quizEngine.getNavigationWarningMessage();
        }
        
        return 'You have an active quiz session. Your progress will be saved but the quiz will end if you leave.';
    }

    /**
     * Refresh quiz UI after navigation
     */
    refreshQuizUI() {
        try {
            if (this.quizEngine && this.quizEngine.isActive) {
                const currentData = this.quizEngine.getCurrentQuestionData();
                if (currentData) {
                    this.updateQuestionDisplay(currentData);
                    this.updateQuizControls(currentData);
                }
            }
        } catch (error) {
            console.error('Failed to refresh quiz UI:', error);
        }
    }

    /**
     * Update navigation button states
     */
    updateNavigationState() {
        // Update nav button active states
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => btn.classList.remove('active'));
        
        if (this.currentView === 'dashboard' && this.elements.dashboardBtn) {
            this.elements.dashboardBtn.classList.add('active');
        }
    }

    /**
     * Handle return to dashboard with enhanced state management
     */
    handleReturnToDashboard() {
        try {
            // Check for navigation warning (active timed test)
            if (this.shouldWarnOnNavigation()) {
                const shouldProceed = this.showNavigationWarning();
                if (!shouldProceed) {
                    return;
                }
            }
            
            // Save current state before leaving
            this.saveApplicationState();
            
            // End active quiz if running
            if (this.quizEngine && this.quizEngine.isActive) {
                try {
                    // Save quiz progress before ending
                    const quizResults = this.quizEngine.endQuiz();
                    console.log('Quiz ended, results saved:', quizResults);
                } catch (error) {
                    console.warn('Failed to properly end quiz:', error);
                }
            }
            
            // Clear current session and mode
            this.state.currentSession = null;
            this.currentMode = null;
            
            // Clear navigation warnings
            this.clearNavigationWarnings();
            
            // Navigate to dashboard
            this.navigateToView('dashboard');
            
            // Refresh dashboard data
            this.initializeDashboard();
            
            console.log('Successfully returned to dashboard');
            
        } catch (error) {
            console.error('Error returning to dashboard:', error);
            this.handleNavigationError(error, 'dashboard');
        }
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (info, warning, error, success)
     * @param {number} duration - Duration in milliseconds (default: 5000)
     */
    showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close">&times;</button>
            </div>
        `;
        
        // Add to page
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        notificationContainer.appendChild(notification);
        
        // Handle close button
        const closeBtn = notification.querySelector('.notification-close');
        const closeNotification = () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        };
        
        closeBtn.addEventListener('click', closeNotification);
        
        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(closeNotification, duration);
        }
        
        // Add entrance animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    /**
     * Handle quiz navigation
     */
    handleQuizNavigation(direction) {
        if (!this.quizEngine || !this.quizEngine.isActive) {
            if (this.errorHandler) {
                this.errorHandler.showNotification('No active quiz session found', 'warning');
            }
            return;
        }

        try {
            switch (direction) {
                case 'previous':
                    this.quizEngine.previousQuestion();
                    break;
                case 'next':
                    this.quizEngine.nextQuestion();
                    break;
                default:
                    console.warn(`Unknown navigation direction: ${direction}`);
                    if (this.errorHandler) {
                        this.errorHandler.showNotification(`Invalid navigation direction: ${direction}`, 'warning');
                    }
            }
        } catch (error) {
            console.error('Navigation error:', error);
            if (this.errorHandler) {
                this.errorHandler.handleQuizError(error, 'quiz navigation');
            }
        }
    }

    /**
     * Handle quiz submission
     */
    handleQuizSubmit() {
        if (!this.quizEngine || !this.quizEngine.isActive) {
            if (this.errorHandler) {
                this.errorHandler.showNotification('No active quiz session found', 'warning');
            }
            return;
        }

        // Get selected answer from UI
        const selectedAnswer = this.getSelectedAnswer();
        if (selectedAnswer === null) {
            if (this.errorHandler) {
                this.errorHandler.showNotification('Please select an answer before submitting', 'warning');
            }
            return;
        }

        try {
            this.quizEngine.submitAnswer(selectedAnswer);
            
            // Handle mode-specific behavior after submission
            if (this.currentMode === 'study') {
                // Study mode: immediate feedback is shown via event handler
                // Don't auto-advance, wait for user to click continue
                console.log('Answer submitted in study mode - waiting for user to continue');
            } else {
                // Auto-advance to next question in unit and practice modes
                setTimeout(() => {
                    if (!this.quizEngine.nextQuestion()) {
                        // No more questions, show completion option
                        this.showEnhancedCompletionDialog();
                    }
                }, 1000);
            }
        } catch (error) {
            console.error('Submit error:', error);
            if (this.errorHandler) {
                this.errorHandler.handleQuizError(error, 'answer submission');
            }
        }
    }

    /**
     * Handle ending quiz with confirmation dialog
     */
    async handleEndQuiz() {
        if (!this.quizEngine || !this.quizEngine.isActive) {
            if (this.errorHandler) {
                this.errorHandler.showNotification('No active quiz session found', 'warning');
            }
            return;
        }

        try {
            // Get current quiz state for confirmation dialog
            const quizState = this.quizEngine.getState();
            const timerState = this.quizEngine.getTimerState();
            
            const confirmationState = {
                mode: quizState.mode,
                currentQuestion: quizState.currentQuestionIndex + 1,
                totalQuestions: quizState.totalQuestions,
                answeredCount: quizState.answeredCount,
                timeRemaining: timerState ? timerState.formatted.remaining : null
            };

            // Show confirmation dialog
            let confirmEnd = true;
            if (this.confirmationDialogs) {
                confirmEnd = await this.confirmationDialogs.confirmEndQuiz(confirmationState);
            } else {
                // Fallback to basic confirm
                confirmEnd = confirm('Are you sure you want to end this quiz? Your progress will be saved.');
            }

            if (!confirmEnd) {
                return;
            }

            // Show loading indicator for quiz processing
            let loadingIndicator = null;
            if (this.errorHandler) {
                loadingIndicator = this.errorHandler.showLoading('Processing quiz results...', {
                    overlay: true,
                    spinner: true
                });
            }

            try {
                const results = this.quizEngine.endQuiz();
                
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
                
                this.showQuizResults(results);
                
                // Show success notification
                if (this.errorHandler) {
                    this.errorHandler.showNotification('Quiz completed successfully!', 'success');
                }
                
            } catch (processingError) {
                // Hide loading indicator
                if (loadingIndicator) {
                    loadingIndicator.remove();
                }
                throw processingError;
            }
            
        } catch (error) {
            console.error('End quiz error:', error);
            if (this.errorHandler) {
                this.errorHandler.handleQuizError(error, 'quiz completion');
            }
        }
    }

    /**
     * Handle keyboard navigation throughout the application
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyboardNavigation(event) {
        // Handle global keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'h':
                    event.preventDefault();
                    this.handleReturnToDashboard();
                    break;
                case 'u':
                    event.preventDefault();
                    if (this.currentView === 'dashboard') {
                        this.handleModeSelection('unit');
                    }
                    break;
                case 'p':
                    event.preventDefault();
                    if (this.currentView === 'dashboard') {
                        this.handleModeSelection('practice');
                    }
                    break;
                case 's':
                    event.preventDefault();
                    if (this.currentView === 'dashboard') {
                        this.handleModeSelection('study');
                    }
                    break;
            }
            return;
        }

        // Handle view-specific navigation
        switch (this.currentView) {
            case 'dashboard':
                this.handleDashboardKeyboard(event);
                break;
            case 'quiz':
                this.handleQuizKeyboard(event);
                break;
            case 'results':
                this.handleResultsKeyboard(event);
                break;
        }
    }

    /**
     * Handle keyboard navigation in dashboard
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleDashboardKeyboard(event) {
        switch (event.key) {
            case '1':
                event.preventDefault();
                this.handleModeSelection('unit');
                break;
            case '2':
                event.preventDefault();
                this.handleModeSelection('practice');
                break;
            case '3':
                event.preventDefault();
                this.handleModeSelection('study');
                break;
            case 'Tab':
                // Let default tab behavior work for accessibility
                break;
        }
    }

    /**
     * Handle keyboard navigation in quiz
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleQuizKeyboard(event) {
        if (!this.quizEngine.isActive) {
            return;
        }

        switch (event.key) {
            case 'ArrowLeft':
                event.preventDefault();
                if (this.currentMode !== 'study') {
                    this.handleQuizNavigation('previous');
                }
                break;
                
            case 'ArrowRight':
                event.preventDefault();
                if (this.currentMode !== 'study') {
                    this.handleQuizNavigation('next');
                }
                break;
                
            case 'Enter':
            case ' ':
                event.preventDefault();
                const submitBtn = this.elements.submitBtn;
                const continueBtn = document.getElementById('continue-study-btn');
                
                if (continueBtn && continueBtn.style.display !== 'none') {
                    continueBtn.click();
                } else if (submitBtn && submitBtn.style.display !== 'none' && !submitBtn.disabled) {
                    submitBtn.click();
                }
                break;
                
            case '1':
            case '2':
            case '3':
            case '4':
                event.preventDefault();
                const answerIndex = parseInt(event.key) - 1;
                const answerOptions = document.querySelectorAll('.answer-option');
                if (answerOptions[answerIndex]) {
                    answerOptions[answerIndex].click();
                    // Announce selection for screen readers
                    this.announceAnswerSelection(answerIndex + 1);
                }
                break;
                
            case 'Escape':
                event.preventDefault();
                if (this.elements.endQuizBtn) {
                    this.elements.endQuizBtn.click();
                }
                break;
        }
    }

    /**
     * Handle keyboard navigation in results
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleResultsKeyboard(event) {
        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                const focusedElement = document.activeElement;
                if (focusedElement && focusedElement.classList.contains('results-btn')) {
                    focusedElement.click();
                }
                break;
            case 'Escape':
                event.preventDefault();
                this.handleReturnToDashboard();
                break;
        }
    }

    /**
     * Announce answer selection for screen readers
     * @param {number} answerNumber - Answer number (1-4)
     */
    announceAnswerSelection(answerNumber) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Answer ${answerNumber} selected`;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            if (document.body.contains(announcement)) {
                document.body.removeChild(announcement);
            }
        }, 1000);
    }

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type (success, warning, error, info)
     * @param {number} duration - Duration in milliseconds
     */
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" aria-label="Close notification">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Auto-hide notification
        const hideNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        };
        
        // Add close button handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', hideNotification);
        
        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(hideNotification, duration);
        }
        
        return notification;
    }

    /**
     * Show loading overlay
     * @param {string} message - Loading message
     * @returns {HTMLElement} Loading overlay element
     */
    showLoading(message = 'Loading...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${message}</div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        return overlay;
    }

    /**
     * Hide loading overlay
     * @param {HTMLElement} overlay - Loading overlay element
     */
    hideLoading(overlay) {
        if (overlay && document.body.contains(overlay)) {
            document.body.removeChild(overlay);
        }
    }

    /**
     * Handle continue studying in study mode
     */
    handleStudyModeContinue() {
        if (!this.quizEngine.isActive || this.currentMode !== 'study') {
            console.warn('Not in active study mode');
            return;
        }

        try {
            // Remove existing feedback
            const existingFeedback = document.querySelector('.feedback');
            if (existingFeedback) {
                existingFeedback.remove();
            }

            // Check if we need more questions
            const currentIndex = this.quizEngine.currentQuestionIndex;
            const totalQuestions = this.quizEngine.getTotalQuestions();
            
            // If we're near the end, add more questions
            if (currentIndex >= totalQuestions - 3) {
                this.quizEngine.addMoreQuestions(10);
                console.log('Added more questions for continued studying');
            }

            // Move to next question
            if (!this.quizEngine.nextQuestion()) {
                // If no next question available, add more and try again
                this.quizEngine.addMoreQuestions(10);
                this.quizEngine.nextQuestion();
            }

        } catch (error) {
            console.error('Continue study error:', error);
            this.showError(`Failed to continue studying: ${error.message}`);
        }
    }

    /**
     * Show unit selection interface
     */
    showUnitSelection() {
        try {
            console.log('Creating unit selection modal...');
            const units = [
            { id: 1, name: 'Foundations of American Democracy', description: 'Constitutional principles, federalism, and democratic theory' },
            { id: 2, name: 'Interactions Among Branches of Government', description: 'Separation of powers, checks and balances, and institutional relationships' },
            { id: 3, name: 'Civil Liberties and Civil Rights', description: 'Bill of Rights, due process, and equal protection' },
            { id: 4, name: 'American Political Ideologies and Beliefs', description: 'Political culture, public opinion, and political socialization' },
            { id: 5, name: 'Political Participation', description: 'Voting, elections, political parties, and interest groups' }
        ];

        // Create unit selection modal
        const modal = document.createElement('div');
        modal.className = 'unit-selection-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Select a Unit to Study</h2>
                    <button class="modal-close" aria-label="Close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="unit-grid">
                        ${units.map(unit => {
                            try {
                                const unitProgress = this.getUserProgressForUnit(unit.id);
                                const unitData = this.state.userProgress.units[unit.id] || { correct: 0, total: 0 };
                                const questionsAvailable = this.questionManager.getQuestionsByUnit(unit.id).length;
                            
                            return `
                                <div class="unit-card" data-unit-id="${unit.id}">
                                    <div class="unit-header">
                                        <div class="unit-number">Unit ${unit.id}</div>
                                        <div class="unit-progress">${unitProgress}%</div>
                                    </div>
                                    <div class="unit-title">${unit.name}</div>
                                    <div class="unit-description">${unit.description}</div>
                                    <div class="unit-stats">
                                        <span class="stat-item">${unitData.correct || 0}/${unitData.total || 0} correct</span>
                                        <span class="stat-item">${questionsAvailable} questions available</span>
                                    </div>
                                    <div class="unit-progress-bar">
                                        <div class="progress-fill" style="width: ${unitProgress}%"></div>
                                    </div>
                                </div>
                            `;
                            } catch (error) {
                                console.error('Error creating unit card for unit', unit.id, ':', error);
                                return `<div class="unit-card error">Error loading unit ${unit.id}</div>`;
                            }
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        // Add to DOM
        document.body.appendChild(modal);

        // Add event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        const unitCards = modal.querySelectorAll('.unit-card');

        const closeModal = () => {
            document.body.removeChild(modal);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            // Only close if clicking directly on the overlay, not on child elements
            if (e.target === overlay) {
                closeModal();
            }
        });

        unitCards.forEach(card => {
            card.addEventListener('click', (e) => {
                console.log('Unit card clicked:', card.dataset.unitId);
                e.preventDefault();
                e.stopPropagation();
                const unitId = parseInt(card.dataset.unitId);
                console.log('Starting unit quiz with ID:', unitId);
                closeModal();
                this.startUnitQuizWithId(unitId);
            });
            
            // Add visual feedback
            card.style.cursor = 'pointer';
        });

        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        console.log('Unit selection modal created with', unitCards.length, 'unit cards');
        } catch (error) {
            console.error('Error creating unit selection modal:', error);
            this.showError('Failed to show unit selection: ' + error.message);
        }
    }

    /**
     * Start unit quiz with specific unit ID
     */
    startUnitQuizWithId(unitId) {
        try {
            this.quizEngine.startQuiz('unit', unitId);
            this.navigateToView('quiz');
            console.log(`Started unit ${unitId} quiz`);
        } catch (error) {
            console.error('Failed to start unit quiz:', error);
            this.showError(`Failed to start unit ${unitId} quiz: ${error.message}`);
        }
    }

    /**
     * Handle page visibility changes
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('Page hidden - pausing timers if active');
            // Will be used for timer management in future tasks
        } else {
            console.log('Page visible - resuming timers if active');
            // Will be used for timer management in future tasks
        }
    }

    /**
     * Handle quiz completion
     */
    handleQuizComplete(results) {
        this.showQuizResults(results);
        this.navigateToView('results');
    }

    /**
     * Show quiz results
     */
    showQuizResults(results) {
        const resultsContent = this.elements.resultsContent;
        if (!resultsContent) return;

        const { mode, score, unitId } = results;
        
        // Create results HTML based on mode
        let resultsHTML = '';
        
        if (mode === 'unit') {
            const unitName = this.getUnitName(unitId);
            resultsHTML = this.createUnitQuizResults(results, unitName);
        } else if (mode === 'practice') {
            resultsHTML = this.createPracticeTestResults(results);
        } else if (mode === 'study') {
            resultsHTML = this.createStudyModeResults(results);
        }
        
        resultsContent.innerHTML = resultsHTML;
        
        // Update dashboard data
        this.updateProgressDisplay();
        this.updateScoreChart();
    }

    /**
     * Create unit quiz results HTML
     */
    createUnitQuizResults(results, unitName) {
        const { score, questions } = results;
        const percentage = Math.round((score.correct / score.total) * 100);
        
        // Determine performance level
        let performanceLevel = '';
        let performanceColor = '';
        if (percentage >= 90) {
            performanceLevel = 'Excellent';
            performanceColor = '#7ED321';
        } else if (percentage >= 80) {
            performanceLevel = 'Good';
            performanceColor = '#4A90E2';
        } else if (percentage >= 70) {
            performanceLevel = 'Fair';
            performanceColor = '#F5A623';
        } else {
            performanceLevel = 'Needs Improvement';
            performanceColor = '#D0021B';
        }

        return `
            <div class="results-header">
                <div class="results-icon" style="color: ${performanceColor};">📊</div>
                <h2>Unit ${results.unitId} Quiz Complete</h2>
                <div class="unit-name">${unitName}</div>
            </div>
            
            <div class="score-display">
                <div class="score-circle" style="border-color: ${performanceColor};">
                    <div class="score-percentage" style="color: ${performanceColor};">${percentage}%</div>
                    <div class="score-fraction">${score.correct}/${score.total}</div>
                </div>
                <div class="performance-level" style="color: ${performanceColor};">
                    ${performanceLevel}
                </div>
            </div>
            
            <div class="results-details">
                <div class="detail-item">
                    <span class="detail-label">Questions Answered:</span>
                    <span class="detail-value">${score.total}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Correct Answers:</span>
                    <span class="detail-value">${score.correct}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Incorrect Answers:</span>
                    <span class="detail-value">${score.total - score.correct}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time Spent:</span>
                    <span class="detail-value">${this.formatDuration(results.duration)}</span>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="action-btn primary" onclick="app.retakeUnitQuiz(${results.unitId})">
                    Retake Unit ${results.unitId}
                </button>
                <button class="action-btn secondary" onclick="app.showUnitSelection()">
                    Choose Different Unit
                </button>
            </div>
        `;
    }

    /**
     * Create practice test results HTML
     */
    createPracticeTestResults(results) {
        const { score, unitBreakdown } = results;
        const percentage = Math.round((score.correct / score.total) * 100);
        
        return `
            <div class="results-header">
                <div class="results-icon">⏱️</div>
                <h2>Practice Test Complete</h2>
            </div>
            
            <div class="score-display">
                <div class="score-circle">
                    <div class="score-percentage">${percentage}%</div>
                    <div class="score-fraction">${score.correct}/${score.total}</div>
                </div>
            </div>
            
            <div class="unit-breakdown">
                <h3>Performance by Unit</h3>
                ${Object.entries(unitBreakdown).map(([unit, correct]) => `
                    <div class="breakdown-item">
                        <span class="breakdown-unit">Unit ${unit}</span>
                        <span class="breakdown-score">${correct} correct</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Create study mode results HTML
     */
    createStudyModeResults(results) {
        const { score } = results;
        const percentage = Math.round((score.correct / score.total) * 100);
        
        return `
            <div class="results-header">
                <div class="results-icon">📖</div>
                <h2>Study Session Complete</h2>
            </div>
            
            <div class="score-display">
                <div class="score-circle">
                    <div class="score-percentage">${percentage}%</div>
                    <div class="score-fraction">${score.correct}/${score.total}</div>
                </div>
            </div>
            
            <div class="results-actions">
                <button class="action-btn primary" onclick="app.handleModeSelection('study')">
                    Continue Studying
                </button>
            </div>
        `;
    }

    /**
     * Get unit name by ID
     */
    getUnitName(unitId) {
        const unitNames = {
            1: 'Foundations of American Democracy',
            2: 'Interactions Among Branches of Government',
            3: 'Civil Liberties and Civil Rights',
            4: 'American Political Ideologies and Beliefs',
            5: 'Political Participation'
        };
        return unitNames[unitId] || `Unit ${unitId}`;
    }

    /**
     * Format duration in milliseconds to readable format
     */
    formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    }

    /**
     * Retake unit quiz
     */
    retakeUnitQuiz(unitId) {
        this.startUnitQuizWithId(unitId);
    }

    /**
     * Update progress display on dashboard
     */
    updateProgressDisplay() {
        if (!this.elements.progressChart) return;
        
        const units = [
            { id: 1, name: 'Foundations of American Democracy' },
            { id: 2, name: 'Interactions Among Branches of Government' },
            { id: 3, name: 'Civil Liberties and Civil Rights' },
            { id: 4, name: 'American Political Ideologies and Beliefs' },
            { id: 5, name: 'Political Participation' }
        ];
        
        // Clear existing content
        this.elements.progressChart.innerHTML = '';
        
        // Create progress bars for each unit
        units.forEach(unit => {
            const unitData = this.state.userProgress.units[unit.id];
            const aptitude = this.getUserProgressForUnit(unit.id);
            const seenPercentage = this.getSeenPercentageForUnit(unit.id);
            const progressItem = this.createProgressBar(unit.name, aptitude, seenPercentage, unitData);
            this.elements.progressChart.appendChild(progressItem);
        });
        
        // Update summary statistics
        this.updateProgressSummary();
    }

    /**
     * Create a progress bar element with dual progress indicators
     */
    createProgressBar(label, aptitudePercentage, seenPercentage, unitData) {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        
        const correctCount = unitData.correct || 0;
        const totalCount = unitData.total || 0;
        const seenCount = unitData.seen || 0;
        
        progressItem.innerHTML = `
            <div class="progress-info">
                <div class="progress-label">${label}</div>
                <div class="progress-stats">${correctCount}/${totalCount} correct • ${seenCount} seen</div>
            </div>
            <div class="progress-bars">
                <div class="progress-bar">
                    <div class="progress-fill aptitude" style="width: ${aptitudePercentage}%"></div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill seen" style="width: ${seenPercentage}%"></div>
                </div>
            </div>
            <div class="progress-percentage">${aptitudePercentage}%</div>
        `;
        
        return progressItem;
    }

    /**
     * Get seen percentage for a unit (assuming 100 questions per unit as max)
     */
    getSeenPercentageForUnit(unitId) {
        if (!this.state.userProgress || !this.state.userProgress.units) {
            return 0;
        }
        
        const unitKey = String(unitId);
        const unitData = this.state.userProgress.units[unitKey];
        const seenCount = unitData ? unitData.seen || 0 : 0;
        const maxQuestions = 100; // Assuming 100 questions per unit
        return Math.min(Math.round((seenCount / maxQuestions) * 100), 100);
    }

    /**
     * Update progress summary section
     */
    updateProgressSummary() {
        const overallProgressElement = document.getElementById('overall-progress');
        const totalAnsweredElement = document.getElementById('total-answered');
        
        if (overallProgressElement && totalAnsweredElement) {
            let totalCorrect = 0;
            let totalAnswered = 0;
            
            Object.values(this.state.userProgress.units).forEach(unit => {
                totalCorrect += unit.correct || 0;
                totalAnswered += unit.total || 0;
            });
            
            const overallPercentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
            
            overallProgressElement.textContent = `${overallPercentage}%`;
            totalAnsweredElement.textContent = totalAnswered.toString();
        }
    }

    /**
     * Initialize score progression chart
     */
    initializeScoreChart() {
        // Wait for ScoreChart to be loaded
        const initChart = () => {
            if (typeof ScoreChart !== 'undefined') {
                try {
                    // Destroy existing chart if it exists
                    if (this.scoreChart) {
                        this.scoreChart.destroy();
                    }
                    
                    // Create new chart instance
                    this.scoreChart = new ScoreChart('score-canvas');
                    this.updateScoreChart();
                } catch (error) {
                    console.error('Failed to initialize score chart:', error);
                    // Fallback to basic chart implementation
                    this.updateScoreChartFallback();
                }
            } else {
                // Retry after a short delay
                setTimeout(initChart, 100);
            }
        };
        
        initChart();
    }

    /**
     * Update score progression chart
     */
    updateScoreChart() {
        const testCountElement = document.getElementById('test-count');
        const noDataMessage = document.getElementById('no-data-message');
        const canvas = this.elements.scoreCanvas;
        
        if (!canvas) return;
        
        const practiceTests = this.state.userProgress.practiceTests || [];
        
        // Update test count
        if (testCountElement) {
            const count = practiceTests.length;
            testCountElement.textContent = count === 0 ? '0 tests taken' : 
                count === 1 ? '1 test taken' : `${count} tests taken`;
        }
        
        // Show/hide no data message and canvas
        if (noDataMessage) {
            if (practiceTests.length === 0) {
                noDataMessage.style.display = 'flex';
                canvas.style.display = 'none';
                return;
            } else {
                noDataMessage.style.display = 'none';
                canvas.style.display = 'block';
            }
        }
        
        // Update chart with new data
        if (this.scoreChart && practiceTests.length > 0) {
            this.scoreChart.updateData(practiceTests);
        } else if (practiceTests.length > 0) {
            // Fallback to basic implementation if ScoreChart not available
            this.updateScoreChartFallback();
        }
    }

    /**
     * Fallback chart implementation (basic canvas drawing)
     */
    updateScoreChartFallback() {
        const practiceTests = this.state.userProgress.practiceTests || [];
        if (practiceTests.length === 0) return;
        
        this.drawScoreChartBasic(practiceTests);
    }

    /**
     * Draw the score progression chart (basic implementation)
     */
    drawScoreChartBasic(practiceTests) {
        const canvas = this.elements.scoreCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size for high DPI displays
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
        
        const width = rect.width;
        const height = rect.height;
        const padding = 60;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (practiceTests.length === 0) return;
        
        // Prepare data
        const scores = practiceTests.map(test => (test.score / test.total) * 100);
        
        // Draw grid lines
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines (score percentages)
        for (let i = 0; i <= 10; i++) {
            const y = padding + (chartHeight * i) / 10;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(padding + chartWidth, y);
            ctx.stroke();
        }
        
        // Vertical grid lines (tests)
        if (practiceTests.length > 1) {
            for (let i = 0; i < practiceTests.length; i++) {
                const x = padding + (chartWidth * i) / (practiceTests.length - 1);
                ctx.beginPath();
                ctx.moveTo(x, padding);
                ctx.lineTo(x, padding + chartHeight);
                ctx.stroke();
            }
        }
        
        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, padding + chartHeight);
        ctx.lineTo(padding + chartWidth, padding + chartHeight);
        ctx.stroke();
        
        // Draw y-axis labels (percentages)
        ctx.fillStyle = '#6c757d';
        ctx.font = '12px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= 10; i++) {
            const percentage = 100 - (i * 10);
            const y = padding + (chartHeight * i) / 10;
            ctx.fillText(`${percentage}%`, padding - 10, y);
        }
        
        // Draw x-axis labels (test numbers)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        practiceTests.forEach((_, index) => {
            const x = practiceTests.length === 1 ? 
                padding + chartWidth / 2 : 
                padding + (chartWidth * index) / (practiceTests.length - 1);
            ctx.fillText(`Test ${index + 1}`, x, padding + chartHeight + 10);
        });
        
        // Draw the line chart
        if (practiceTests.length > 0) {
            ctx.strokeStyle = '#4A90E2';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            scores.forEach((score, index) => {
                const x = practiceTests.length === 1 ? 
                    padding + chartWidth / 2 : 
                    padding + (chartWidth * index) / (practiceTests.length - 1);
                const y = padding + chartHeight - (chartHeight * score) / 100;
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#4A90E2';
            scores.forEach((score, index) => {
                const x = practiceTests.length === 1 ? 
                    padding + chartWidth / 2 : 
                    padding + (chartWidth * index) / (practiceTests.length - 1);
                const y = padding + chartHeight - (chartHeight * score) / 100;
                
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.fill();
                
                // Draw score label
                ctx.fillStyle = '#333';
                ctx.font = 'bold 11px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`${Math.round(score)}%`, x, y - 8);
                ctx.fillStyle = '#4A90E2';
            });
        }
    }

    /**
     * Get user progress for a specific unit
     */
    getUserProgressForUnit(unitId) {
        // Ensure userProgress and units exist
        if (!this.state.userProgress || !this.state.userProgress.units) {
            return 0;
        }
        
        // Convert unitId to string/number as needed for key access
        const unitKey = String(unitId);
        const unitProgress = this.state.userProgress.units[unitKey];
        
        if (!unitProgress || unitProgress.total === 0) {
            return 0;
        }
        return Math.round((unitProgress.correct / unitProgress.total) * 100);
    }

    /**
     * Get default progress structure
     */
    getDefaultProgressStructure() {
        return {
            units: {
                1: { seen: 0, correct: 0, total: 0 },
                2: { seen: 0, correct: 0, total: 0 },
                3: { seen: 0, correct: 0, total: 0 },
                4: { seen: 0, correct: 0, total: 0 },
                5: { seen: 0, correct: 0, total: 0 }
            },
            practiceTests: [],
            currentSession: null,
            lastUpdated: new Date().toISOString()
        };
    }

    /**
     * Load user progress from local storage
     */
    loadUserProgress() {
        try {
            const saved = localStorage.getItem('ap-gov-progress');
            if (saved) {
                const parsed = JSON.parse(saved);
                // Ensure the structure is valid
                if (parsed && parsed.units && typeof parsed.units === 'object') {
                    return parsed;
                }
            }
        } catch (error) {
            console.error('Failed to load user progress:', error);
        }
        
        // Return default progress structure
        return this.getDefaultProgressStructure();
    }

    /**
     * Save user progress to local storage
     */
    saveUserProgress() {
        try {
            localStorage.setItem('ap-gov-progress', JSON.stringify(this.state.userProgress));
            console.log('User progress saved');
        } catch (error) {
            console.error('Failed to save user progress:', error);
            this.showError('Failed to save progress. Your data may be lost if you close the browser.');
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        // Simple error display - could be enhanced with a proper modal in future
        alert(`Error: ${message}`);
        console.error(message);
    }

    /**
     * Handle question change events from quiz engine
     */
    handleQuestionChange(data) {
        this.updateQuizUI(data);
    }

    /**
     * Handle answer submit events from quiz engine
     */
    handleAnswerSubmit(data) {
        console.log(`Answer submitted: ${data.isCorrect ? 'Correct' : 'Incorrect'}`);
        
        // Update UI to show answer feedback if needed
        this.showAnswerFeedback(data);
    }

    /**
     * Handle quiz completion events from quiz engine
     */
    handleQuizComplete(results) {
        console.log('Quiz completed:', results);
        
        // Update progress tracker
        if (this.progressTracker) {
            this.progressTracker.updateProgress(results);
        }
        
        // Navigate to results view
        this.navigateToView('results');
        
        // Display results using ResultsDisplay component
        if (this.resultsDisplay) {
            const progressData = this.progressTracker ? this.progressTracker.getProgressData() : {};
            this.resultsDisplay.displayResults(results, progressData);
            
            // Set up action button handlers
            this.resultsDisplay.addActionListeners((action) => {
                this.handleResultsAction(action, results);
            });
        } else {
            // Fallback to basic results display
            this.showQuizResults(results);
        }
    }

    /**
     * Handle results action button clicks
     * @param {string} action - Action identifier
     * @param {Object} results - Quiz results data
     */
    handleResultsAction(action, results) {
        switch (action) {
            case 'retake-unit':
                if (results.unitId) {
                    this.handleModeSelection('unit', results.unitId);
                }
                break;
            case 'select-unit':
                this.handleModeSelection('unit');
                break;
            case 'new-practice':
                this.handleModeSelection('practice');
                break;
            case 'study-weak':
                // Find weakest unit and start study mode
                if (results.unitAnalysis && results.unitAnalysis.weaknesses.length > 0) {
                    const weakestUnit = results.unitAnalysis.weaknesses[0].unitId;
                    this.handleModeSelection('study', weakestUnit);
                } else {
                    this.handleModeSelection('study');
                }
                break;
            case 'continue-study':
                this.handleModeSelection('study');
                break;
            case 'take-practice':
                this.handleModeSelection('practice');
                break;
            case 'dashboard':
            default:
                this.handleReturnToDashboard();
                break;
        }
    }

    /**
     * Handle mode-specific events from quiz engine
     */
    handleModeSpecificEvent(event) {
        switch (event.type) {
            case 'immediate_feedback':
                this.showImmediateFeedback(event);
                break;
            default:
                console.log('Mode-specific event:', event);
        }
    }

    /**
     * Update quiz UI with current question data
     */
    updateQuizUI(data) {
        if (!data.question) return;

        // Update question counter
        if (this.elements.questionCounter) {
            this.elements.questionCounter.textContent = 
                `Question ${data.questionNumber} of ${data.totalQuestions}`;
        }

        // Update question content
        if (this.elements.questionContainer) {
            this.elements.questionContainer.innerHTML = this.renderQuestion(data.question, data.currentAnswer);
        }

        // Update navigation buttons
        this.updateNavigationButtons(data);
    }

    /**
     * Render question HTML
     */
    renderQuestion(question, selectedAnswer) {
        return `
            <div class="question-content">
                <h3 class="question-text">${question.question}</h3>
                <div class="question-options">
                    ${question.options.map((option, index) => `
                        <label class="option-label ${selectedAnswer === index ? 'selected' : ''}">
                            <input type="radio" name="answer" value="${index}" 
                                   ${selectedAnswer === index ? 'checked' : ''}>
                            <span class="option-text">${String.fromCharCode(65 + index)}. ${option}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Update navigation button states
     */
    updateNavigationButtons(data) {
        if (this.elements.prevBtn) {
            this.elements.prevBtn.disabled = !data.canGoPrevious;
        }
        
        if (this.elements.nextBtn) {
            this.elements.nextBtn.disabled = !data.canGoNext;
        }
        
        if (this.elements.submitBtn) {
            // Enable submit button if answer is selected OR if question was already answered
            const hasSelection = this.getSelectedAnswer() !== null;
            this.elements.submitBtn.disabled = !data.isAnswered && !hasSelection;
        }
    }

    /**
     * Get selected answer from UI
     */
    getSelectedAnswer() {
        const selectedRadio = document.querySelector('input[name="answer"]:checked');
        return selectedRadio ? parseInt(selectedRadio.value) : null;
    }

    /**
     * Show answer feedback
     */
    showAnswerFeedback(data) {
        // Basic feedback - can be enhanced in future tasks
        const feedbackClass = data.isCorrect ? 'correct' : 'incorrect';
        const feedbackText = data.isCorrect ? 'Correct!' : 'Incorrect';
        
        // Add visual feedback to the selected option
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (selectedOption) {
            const label = selectedOption.closest('.option-label');
            label.classList.add(feedbackClass);
            
            // Show brief feedback message
            const feedback = document.createElement('div');
            feedback.className = `answer-feedback ${feedbackClass}`;
            feedback.textContent = feedbackText;
            label.appendChild(feedback);
            
            // Remove feedback after delay
            setTimeout(() => {
                label.classList.remove(feedbackClass);
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 2000);
        }
    }

    /**
     * Show immediate feedback for study mode
     */
    showImmediateFeedback(event) {
        const feedbackHtml = `
            <div class="immediate-feedback ${event.isCorrect ? 'correct' : 'incorrect'}">
                <h4>${event.isCorrect ? 'Correct!' : 'Incorrect'}</h4>
                ${!event.isCorrect ? `<p><strong>Correct answer:</strong> ${event.correctAnswer}</p>` : ''}
                ${event.explanation ? `<p><strong>Explanation:</strong> ${event.explanation}</p>` : ''}
                <button onclick="app.continueStudyMode()" class="continue-btn">Continue</button>
            </div>
        `;
        
        // Show feedback in a modal or overlay
        this.showModal('Answer Feedback', feedbackHtml);
    }

    /**
     * Continue study mode after feedback
     */
    continueStudyMode() {
        this.closeModal();
        
        // Move to next question or add more questions
        if (!this.quizEngine.nextQuestion()) {
            this.quizEngine.addMoreQuestions(5);
            this.quizEngine.nextQuestion();
        }
    }

    /**
     * Show quiz completion prompt
     */
    showQuizCompletionPrompt() {
        const message = 'You have answered all questions. Would you like to finish the quiz?';
        if (confirm(message)) {
            this.handleEndQuiz();
        }
    }

    /**
     * Show quiz results
     */
    showQuizResults(results) {
        const resultsHtml = `
            <div class="quiz-results">
                <h2>Quiz Complete!</h2>
                <div class="score-summary">
                    <div class="score-circle">
                        <span class="score-percentage">${results.score.percentage}%</span>
                        <span class="score-fraction">${results.score.correct}/${results.score.total}</span>
                    </div>
                </div>
                <div class="results-details">
                    <p><strong>Mode:</strong> ${results.mode.charAt(0).toUpperCase() + results.mode.slice(1)}</p>
                    <p><strong>Duration:</strong> ${this.formatDuration(results.duration)}</p>
                    ${results.unitBreakdown ? this.renderUnitBreakdown(results.unitBreakdown) : ''}
                </div>
                <div class="results-actions">
                    <button onclick="app.handleReturnToDashboard()" class="primary-btn">Return to Dashboard</button>
                    <button onclick="app.retakeQuiz()" class="secondary-btn">Take Another Quiz</button>
                </div>
            </div>
        `;
        
        this.navigateToView('results');
        if (this.elements.resultsContent) {
            this.elements.resultsContent.innerHTML = resultsHtml;
        }
        
        // Update dashboard progress
        this.updateProgressDisplay();
    }

    /**
     * Render unit breakdown for practice tests
     */
    renderUnitBreakdown(breakdown) {
        return `
            <div class="unit-breakdown">
                <h4>Performance by Unit:</h4>
                <ul>
                    ${Object.entries(breakdown).map(([unit, correct]) => `
                        <li>Unit ${unit}: ${correct} correct</li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    /**
     * Format duration in milliseconds to readable string
     */
    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Retake quiz in same mode
     */
    retakeQuiz() {
        if (this.currentMode) {
            this.handleModeSelection(this.currentMode);
        }
    }

    /**
     * Show modal dialog
     */
    showModal(title, content) {
        // Simple modal implementation - can be enhanced
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button onclick="app.closeModal()" class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
    }

    /**
     * Close modal dialog
     */
    closeModal() {
        if (this.currentModal) {
            document.body.removeChild(this.currentModal);
            this.currentModal = null;
        }
    }

    /**
     * Get current application state (for debugging)
     */
    getState() {
        return {
            currentView: this.currentView,
            currentMode: this.currentMode,
            isInitialized: this.isInitialized,
            state: this.state,
            quizEngine: this.quizEngine ? this.quizEngine.getState() : null
        };
    }

    // ===== STATE MANAGEMENT METHODS =====

    /**
     * Initialize state management system
     */
    initializeStateManagement() {
        console.log('Initializing state management...');
        
        // Set up state validation
        this.validateStateIntegrity();
        
        // Initialize session tracking
        this.initializeSessionTracking();
        
        console.log('State management initialized');
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Initialize session tracking
     */
    initializeSessionTracking() {
        // Track session start time
        this.state.sessionStartTime = Date.now();
        
        // Set up session timeout handling
        this.setupSessionTimeout();
        
        // Track page visibility for session management
        this.setupVisibilityTracking();
    }

    /**
     * Set up session timeout handling
     */
    setupSessionTimeout() {
        // Clear existing timeout
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
        }
        
        // Set new timeout
        this.sessionTimeoutId = setTimeout(() => {
            this.handleSessionTimeout();
        }, this.stateConfig.sessionTimeout);
    }

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
        console.log('Session timeout reached');
        
        // Save current state before timeout
        this.saveApplicationState();
        
        // Show timeout notification
        this.showNotification(
            'Your session has timed out. Your progress has been saved.',
            'warning',
            10000
        );
        
        // Reset to dashboard if in quiz
        if (this.currentView === 'quiz' && this.quizEngine && this.quizEngine.isActive) {
            this.handleReturnToDashboard();
        }
    }

    /**
     * Set up visibility tracking for session management
     */
    setupVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page hidden - save state
                this.saveApplicationState();
                console.log('Page hidden - state saved');
            } else {
                // Page visible - check for state corruption
                this.validateStateIntegrity();
                console.log('Page visible - state validated');
            }
        });
    }

    /**
     * Start state management timers
     */
    startStateManagement() {
        // Auto-save timer
        this.autoSaveTimer = setInterval(() => {
            this.saveApplicationState();
        }, this.stateConfig.autoSaveInterval);
        
        // State corruption check timer
        this.corruptionCheckTimer = setInterval(() => {
            this.validateStateIntegrity();
        }, this.stateConfig.corruptionCheckInterval);
        
        console.log('State management timers started');
    }

    /**
     * Stop state management timers
     */
    stopStateManagement() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
        
        if (this.corruptionCheckTimer) {
            clearInterval(this.corruptionCheckTimer);
            this.corruptionCheckTimer = null;
        }
        
        if (this.sessionTimeoutId) {
            clearTimeout(this.sessionTimeoutId);
            this.sessionTimeoutId = null;
        }
        
        console.log('State management timers stopped');
    }

    /**
     * Save complete application state
     */
    saveApplicationState() {
        try {
            const stateToSave = {
                sessionId: this.state.sessionId,
                timestamp: Date.now(),
                currentView: this.currentView,
                currentMode: this.currentMode,
                userProgress: this.state.userProgress,
                currentSession: this.getCurrentSessionData(),
                navigationHistory: this.state.navigationHistory.slice(-this.stateConfig.maxHistoryLength),
                quizEngineState: this.quizEngine ? this.quizEngine.getState() : null
            };
            
            // Save to localStorage with error handling
            if (this.storageWrapper) {
                this.storageWrapper.setItem('app_state', JSON.stringify(stateToSave));
                this.state.lastSavedState = stateToSave;
                console.log('Application state saved successfully');
            }
            
        } catch (error) {
            console.error('Failed to save application state:', error);
            this.handleStateSaveError(error);
        }
    }

    /**
     * Get current session data for saving
     */
    getCurrentSessionData() {
        if (!this.quizEngine || !this.quizEngine.isActive) {
            return null;
        }
        
        return {
            mode: this.currentMode,
            unitId: this.quizEngine.currentUnitId,
            currentQuestionIndex: this.quizEngine.currentQuestionIndex,
            answers: this.quizEngine.answers,
            startTime: this.quizEngine.startTime,
            questions: this.quizEngine.questions,
            timerState: this.quizEngine.timer ? this.quizEngine.timer.getState() : null
        };
    }

    /**
     * Restore application state from storage
     */
    async restoreApplicationState() {
        try {
            if (!this.storageWrapper) {
                console.log('Storage wrapper not available for state restoration');
                return false;
            }
            
            const savedStateStr = this.storageWrapper.getItem('app_state');
            if (!savedStateStr) {
                console.log('No saved state found');
                return false;
            }
            
            const savedState = JSON.parse(savedStateStr);
            
            // Validate saved state
            if (!this.isValidSavedState(savedState)) {
                console.warn('Invalid saved state detected, starting fresh');
                this.clearCorruptedState();
                return false;
            }
            
            // Check if state is too old
            const stateAge = Date.now() - savedState.timestamp;
            if (stateAge > this.stateConfig.sessionTimeout) {
                console.log('Saved state is too old, starting fresh');
                this.clearCorruptedState();
                return false;
            }
            
            // Restore state
            this.currentView = savedState.currentView || 'dashboard';
            this.currentMode = savedState.currentMode;
            this.state.userProgress = savedState.userProgress || this.loadUserProgress();
            this.state.navigationHistory = savedState.navigationHistory || [];
            
            // Restore quiz session if exists
            if (savedState.currentSession && savedState.quizEngineState) {
                this.state.currentSession = savedState.currentSession;
                console.log('Quiz session found in saved state - will restore after initialization');
            }
            
            console.log('Application state restored successfully');
            return true;
            
        } catch (error) {
            console.error('Failed to restore application state:', error);
            this.handleStateRestoreError(error);
            return false;
        }
    }

    /**
     * Validate saved state structure
     */
    isValidSavedState(state) {
        return state &&
               typeof state.sessionId === 'string' &&
               typeof state.timestamp === 'number' &&
               state.userProgress &&
               Array.isArray(state.navigationHistory);
    }

    /**
     * Determine initial view based on restored state
     */
    determineInitialView() {
        // If we have a current session, ask user if they want to resume
        if (this.state.currentSession && this.currentMode) {
            const shouldResume = confirm(
                `You have an interrupted ${this.currentMode} session. Would you like to resume where you left off?`
            );
            
            if (shouldResume) {
                this.resumeQuizSession();
                return 'quiz';
            } else {
                // Clear the session if user doesn't want to resume
                this.state.currentSession = null;
                this.currentMode = null;
            }
        }
        
        return this.currentView || 'dashboard';
    }

    /**
     * Resume interrupted quiz session
     */
    resumeQuizSession() {
        try {
            if (!this.state.currentSession || !this.quizEngine) {
                throw new Error('No valid session to resume');
            }
            
            const session = this.state.currentSession;
            
            // Restore quiz engine state
            this.quizEngine.restoreState({
                mode: session.mode,
                unitId: session.unitId,
                currentQuestionIndex: session.currentQuestionIndex,
                answers: session.answers,
                startTime: session.startTime,
                questions: session.questions,
                timerState: session.timerState
            });
            
            console.log('Quiz session resumed successfully');
            
        } catch (error) {
            console.error('Failed to resume quiz session:', error);
            this.showError('Failed to resume your previous session. Starting fresh.');
            this.state.currentSession = null;
            this.currentMode = null;
        }
    }

    /**
     * Validate state integrity
     */
    validateStateIntegrity() {
        try {
            // Check for basic state corruption
            if (!this.state || typeof this.state !== 'object') {
                throw new Error('State object is corrupted');
            }
            
            // Check user progress integrity
            if (!this.state.userProgress || typeof this.state.userProgress !== 'object') {
                console.warn('User progress corrupted, reinitializing');
                this.state.userProgress = this.loadUserProgress();
            }
            
            // Check navigation history integrity
            if (!Array.isArray(this.state.navigationHistory)) {
                console.warn('Navigation history corrupted, reinitializing');
                this.state.navigationHistory = [];
            }
            
            // Validate current session if exists
            if (this.state.currentSession && !this.isValidSession(this.state.currentSession)) {
                console.warn('Current session corrupted, clearing');
                this.state.currentSession = null;
            }
            
            this.state.isStateCorrupted = false;
            
        } catch (error) {
            console.error('State corruption detected:', error);
            this.handleStateCorruption(error);
        }
    }

    /**
     * Check if session data is valid
     */
    isValidSession(session) {
        return session &&
               typeof session.mode === 'string' &&
               typeof session.currentQuestionIndex === 'number' &&
               Array.isArray(session.answers);
    }

    /**
     * Handle state corruption
     */
    handleStateCorruption(error) {
        console.error('Handling state corruption:', error);
        
        this.state.isStateCorrupted = true;
        
        // Try to recover what we can
        const recoveredState = this.attemptStateRecovery();
        
        if (recoveredState) {
            this.state = { ...this.state, ...recoveredState };
            this.showNotification(
                'Some data was recovered after detecting corruption. Please verify your progress.',
                'warning',
                10000
            );
        } else {
            // Complete reset if recovery fails
            this.resetToCleanState();
            this.showError(
                'Data corruption detected. The application has been reset to prevent further issues. Your previous progress may be lost.'
            );
        }
    }

    /**
     * Attempt to recover state from corruption
     */
    attemptStateRecovery() {
        try {
            // Try to recover user progress from separate storage
            const userProgress = this.loadUserProgress();
            
            // Create minimal valid state
            return {
                userProgress: userProgress,
                navigationHistory: [],
                currentSession: null,
                sessionId: this.generateSessionId(),
                isStateCorrupted: false
            };
            
        } catch (error) {
            console.error('State recovery failed:', error);
            return null;
        }
    }

    /**
     * Reset application to clean state
     */
    resetToCleanState() {
        // Clear corrupted state
        this.clearCorruptedState();
        
        // Reset application state
        this.state = {
            questions: [],
            userProgress: this.loadUserProgress(),
            currentSession: null,
            navigationHistory: [],
            lastSavedState: null,
            sessionId: this.generateSessionId(),
            isStateCorrupted: false
        };
        
        // Reset view and mode
        this.currentView = 'dashboard';
        this.currentMode = null;
        
        // End any active quiz
        if (this.quizEngine && this.quizEngine.isActive) {
            try {
                this.quizEngine.endQuiz();
            } catch (error) {
                console.warn('Failed to properly end quiz during reset:', error);
            }
        }
        
        // Navigate to dashboard
        this.navigateToView('dashboard');
        
        console.log('Application reset to clean state');
    }

    /**
     * Clear corrupted state from storage
     */
    clearCorruptedState() {
        try {
            if (this.storageWrapper) {
                this.storageWrapper.removeItem('app_state');
                console.log('Corrupted state cleared from storage');
            }
        } catch (error) {
            console.error('Failed to clear corrupted state:', error);
        }
    }

    /**
     * Handle state save errors
     */
    handleStateSaveError(error) {
        console.error('State save error:', error);
        
        // Try alternative save method
        try {
            // Attempt to save minimal critical data
            const criticalData = {
                userProgress: this.state.userProgress,
                timestamp: Date.now()
            };
            
            localStorage.setItem('app_critical_backup', JSON.stringify(criticalData));
            console.log('Critical data saved to backup storage');
            
        } catch (backupError) {
            console.error('Backup save also failed:', backupError);
            this.showError('Unable to save your progress. Please avoid closing the browser.');
        }
    }

    /**
     * Handle state restore errors
     */
    handleStateRestoreError(error) {
        console.error('State restore error:', error);
        
        // Try to restore from backup
        try {
            const backupData = localStorage.getItem('app_critical_backup');
            if (backupData) {
                const parsed = JSON.parse(backupData);
                this.state.userProgress = parsed.userProgress;
                console.log('Restored from backup data');
            }
        } catch (backupError) {
            console.error('Backup restore also failed:', backupError);
        }
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        console.error('Initialization error:', error);
        
        // Try to initialize with minimal functionality
        try {
            this.resetToCleanState();
            this.showError('Application initialization failed. Running in limited mode. Please refresh the page.');
        } catch (resetError) {
            console.error('Even reset failed:', resetError);
            document.body.innerHTML = `
                <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
                    <h2>Application Error</h2>
                    <p>The AP Government Study Tool failed to initialize properly.</p>
                    <p>Please refresh the page to try again.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px;">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    // ===== ENHANCED NAVIGATION METHODS =====

    /**
     * Cleanup application resources
     */
    cleanup() {
        try {
            console.log('Cleaning up application resources...');
            
            // Save final state
            this.saveApplicationState();
            
            // Stop all timers
            this.stopStateManagement();
            
            // Clear event listeners
            this.removeEventListeners();
            
            // End active quiz
            if (this.quizEngine && this.quizEngine.isActive) {
                this.quizEngine.endQuiz();
            }
            
            console.log('Application cleanup completed');
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    /**
     * Remove event listeners
     */
    removeEventListeners() {
        // Remove window event listeners
        window.removeEventListener('popstate', this.handleBrowserNavigation);
        window.removeEventListener('beforeunload', this.handlePageUnload);
        window.removeEventListener('resize', this.handleResize);
        
        // Remove document event listeners
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        document.removeEventListener('keydown', this.handleKeyboardNavigation);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('Creating App instance...');
        window.app = new App();
        console.log('App instance created, initializing...');
        window.app.init().catch(error => {
            console.error('App initialization failed:', error);
            // Try fallback initialization
            if (window.fallbackInit) {
                console.log('Attempting fallback initialization...');
                window.fallbackInit();
            }
        });
    } catch (error) {
        console.error('Failed to create App instance:', error);
        // Try fallback initialization
        if (window.fallbackInit) {
            console.log('Attempting fallback initialization...');
            window.fallbackInit();
        }
    }
});

// Cleanup on page unload
window.addEventListener('unload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});