/**
 * Simple AP Government Study Tool - Basic Mode Selection
 */

class SimpleApp {
    constructor() {
        this.currentMode = null;
        this.isInitialized = false;
    }

    init() {
        console.log('Initializing Simple AP Government Study Tool...');
        
        try {
            // Cache DOM elements
            this.elements = {
                unitQuizBtn: document.getElementById('unit-quiz-btn'),
                practiceTestBtn: document.getElementById('practice-test-btn'),
                studyModeBtn: document.getElementById('study-mode-btn'),
                dashboardView: document.getElementById('dashboard'),
                quizView: document.getElementById('quiz'),
                resultsView: document.getElementById('results')
            };

            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('Simple app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize simple app:', error);
        }
    }

    setupEventListeners() {
        console.log('Setting up simple event listeners...');
        
        if (this.elements.unitQuizBtn) {
            this.elements.unitQuizBtn.addEventListener('click', () => {
                console.log('Unit quiz clicked - simple app');
                this.handleModeSelection('unit');
            });
            console.log('Unit quiz button listener added');
        }
        
        if (this.elements.practiceTestBtn) {
            this.elements.practiceTestBtn.addEventListener('click', () => {
                console.log('Practice test clicked - simple app');
                this.handleModeSelection('practice');
            });
            console.log('Practice test button listener added');
        }
        
        if (this.elements.studyModeBtn) {
            this.elements.studyModeBtn.addEventListener('click', () => {
                console.log('Study mode clicked - simple app');
                this.handleModeSelection('study');
            });
            console.log('Study mode button listener added');
        }
    }

    handleModeSelection(mode) {
        console.log(`Simple app: Mode selected - ${mode}`);
        this.currentMode = mode;
        
        switch (mode) {
            case 'unit':
                this.showModeDialog('Unit Quiz Mode', 'Select a specific unit to focus your studying on. This mode will test you on questions from a single AP Government unit.', () => {
                    this.startQuiz('unit');
                });
                break;
            case 'practice':
                this.showModeDialog('Practice Test Mode', 'Take a full 55-question timed practice exam that simulates the real AP Government test experience.', () => {
                    this.startQuiz('practice');
                });
                break;
            case 'study':
                this.showModeDialog('Study Mode', 'Practice with unlimited questions and get immediate feedback on your answers. Perfect for learning!', () => {
                    this.startQuiz('study');
                });
                break;
        }
    }

    async startQuiz(mode) {
        console.log(`Starting ${mode} quiz...`);
        
        try {
            // Load questions
            console.log('Loading questions...');
            await this.loadQuestions();
            console.log(`Questions loaded: ${this.questions ? this.questions.length : 0}`);
            
            // Initialize quiz state
            console.log('About to get questions for mode...');
            const selectedQuestions = this.getQuestionsForMode(mode);
            console.log(`Got ${selectedQuestions.length} questions`);
            
            this.quizState = {
                mode: mode,
                currentQuestionIndex: 0,
                answers: [],
                startTime: Date.now(),
                questions: selectedQuestions
            };
            
            console.log(`Quiz state initialized with ${this.quizState.questions.length} questions`);
            
            // Show quiz interface
            console.log('Showing quiz interface...');
            this.showQuizInterface();
            
            console.log('Displaying first question...');
            this.displayCurrentQuestion();
            
        } catch (error) {
            console.error('Failed to start quiz:', error);
            alert(`Failed to start quiz: ${error.message}`);
        }
    }

    async loadQuestions() {
        if (this.questions) return; // Already loaded
        
        try {
            // Try to load from the question bank file
            const response = await fetch('ap_gov_complete_question_bank.json');
            if (response.ok) {
                const data = await response.json();
                this.questions = data.questions || data;
                console.log(`Loaded ${this.questions.length} questions from question bank`);
            } else {
                throw new Error('Failed to fetch question bank');
            }
        } catch (error) {
            console.warn('Failed to load question bank, using sample questions:', error);
            // Fallback to sample questions if available
            if (typeof sampleQuestions !== 'undefined') {
                this.questions = sampleQuestions;
            } else {
                // Create some basic sample questions as last resort
                this.questions = this.createSampleQuestions();
            }
        }
    }

    createSampleQuestions() {
        return [
            {
                question: "Which of the following is a power specifically granted to Congress by the Constitution?",
                options: [
                    "The power to regulate interstate commerce",
                    "The power to establish local governments",
                    "The power to create public schools",
                    "The power to issue marriage licenses"
                ],
                correct: 0,
                unit: "Constitutional Foundations",
                explanation: "The Commerce Clause gives Congress the power to regulate interstate commerce."
            },
            {
                question: "The system of checks and balances in the U.S. government is designed to:",
                options: [
                    "Ensure that no single branch becomes too powerful",
                    "Speed up the legislative process",
                    "Reduce the cost of government",
                    "Eliminate political parties"
                ],
                correct: 0,
                unit: "Constitutional Foundations",
                explanation: "Checks and balances prevent any one branch from dominating the others."
            },
            {
                question: "Which amendment to the Constitution guarantees freedom of speech?",
                options: [
                    "First Amendment",
                    "Second Amendment", 
                    "Fourth Amendment",
                    "Fifth Amendment"
                ],
                correct: 0,
                unit: "Civil Liberties",
                explanation: "The First Amendment protects freedom of speech, religion, press, assembly, and petition."
            }
        ];
    }

    getQuestionsForMode(mode) {
        console.log(`Getting questions for mode: ${mode}`);
        console.log(`Available questions: ${this.questions ? this.questions.length : 0}`);
        
        if (!this.questions) {
            console.log('No questions available');
            return [];
        }
        
        let selectedQuestions = [...this.questions];
        console.log(`Copied questions: ${selectedQuestions.length}`);
        
        switch (mode) {
            case 'unit':
                // For now, just use all questions - later we can add unit selection
                selectedQuestions = selectedQuestions.slice(0, 10);
                console.log(`Unit mode: selected ${selectedQuestions.length} questions`);
                break;
            case 'practice':
                // Practice test: 55 questions (or all available if less)
                selectedQuestions = this.shuffleArray(selectedQuestions).slice(0, Math.min(55, selectedQuestions.length));
                console.log(`Practice mode: selected ${selectedQuestions.length} questions`);
                break;
            case 'study':
                // Study mode: unlimited, but start with 5 for demo
                selectedQuestions = this.shuffleArray(selectedQuestions).slice(0, 5);
                console.log(`Study mode: selected ${selectedQuestions.length} questions`);
                break;
        }
        
        console.log(`Returning ${selectedQuestions.length} questions for ${mode} mode`);
        return selectedQuestions;
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    createSimpleQuizInterface() {
        console.log('Creating simple quiz interface...');
        
        // Hide dashboard
        if (this.elements.dashboardView) {
            this.elements.dashboardView.style.display = 'none';
        }
        
        // Create quiz interface
        const quizHTML = `
            <div id="simple-quiz" style="padding: 20px; max-width: 800px; margin: 0 auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
                    <span id="question-counter">Question 1 of 10</span>
                    <button id="end-quiz-btn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">End Quiz</button>
                </div>
                
                <div id="question-container" style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px;">
                    <!-- Question content will go here -->
                </div>
                
                <div style="display: flex; gap: 10px; justify-content: center;">
                    <button id="prev-btn" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Previous</button>
                    <button id="submit-btn" style="background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;" disabled>Submit Answer</button>
                    <button id="next-btn" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Next</button>
                </div>
            </div>
        `;
        
        // Insert quiz interface into the page
        const main = document.querySelector('main') || document.body;
        const quizDiv = document.createElement('div');
        quizDiv.innerHTML = quizHTML;
        main.appendChild(quizDiv);
        
        console.log('Simple quiz interface created');
    }

    showModeDialog(title, description, onStart) {
        // Create a dialog with a start button
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = `
            <h2 style="color: #4A90E2; margin-bottom: 15px;">${title}</h2>
            <p style="margin-bottom: 20px; line-height: 1.5;">${description}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button id="start-quiz" style="
                    background: #4A90E2;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                ">Start Quiz</button>
                <button id="cancel-quiz" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 16px;
                ">Cancel</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Close modal function
        const closeModal = () => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        };
        
        // Start quiz when start button is clicked
        const startBtn = modal.querySelector('#start-quiz');
        if (startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
                onStart();
            });
        }
        
        // Cancel button
        const cancelBtn = modal.querySelector('#cancel-quiz');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                closeModal();
            });
        }
        
        // Close modal when overlay is clicked
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    showQuizInterface() {
        console.log('Showing quiz interface...');
        
        // Hide dashboard and show quiz view
        if (this.elements.dashboardView) {
            console.log('Hiding dashboard view');
            this.elements.dashboardView.style.display = 'none';
        } else {
            console.log('Dashboard view not found');
        }
        
        if (this.elements.quizView) {
            console.log('Showing quiz view');
            this.elements.quizView.style.display = 'block';
        } else {
            console.log('Quiz view not found, creating simple quiz interface');
            this.createSimpleQuizInterface();
        }
    }

    displayCurrentQuestion() {
        console.log(`Displaying question ${this.quizState.currentQuestionIndex + 1}`);
        
        const question = this.quizState.questions[this.quizState.currentQuestionIndex];
        if (!question) {
            console.log('No question found, ending quiz');
            this.endQuiz();
            return;
        }

        console.log('Question:', question.question);

        // Update question counter
        const counter = document.getElementById('question-counter');
        if (counter) {
            if (this.quizState.mode === 'study') {
                counter.textContent = `Study Question ${this.quizState.currentQuestionIndex + 1}`;
            } else {
                counter.textContent = `Question ${this.quizState.currentQuestionIndex + 1} of ${this.quizState.questions.length}`;
            }
            console.log('Updated question counter');
        } else {
            console.log('Question counter not found');
        }

        // Display question
        const container = document.getElementById('question-container');
        if (container) {
            console.log('Found question container, populating...');
            container.innerHTML = `
                <div class="question-text">${question.question}</div>
                <div class="answer-options">
                    ${question.options.map((option, index) => `
                        <label class="answer-option" data-answer-index="${index}">
                            <input type="radio" name="answer" value="${index}">
                            <span class="answer-text">
                                <span class="answer-letter">${String.fromCharCode(65 + index)}.</span> ${option}
                            </span>
                        </label>
                    `).join('')}
                </div>
            `;

            // Add click handlers to options
            const options = container.querySelectorAll('.answer-option');
            options.forEach(option => {
                option.addEventListener('click', () => {
                    // Clear previous selections
                    options.forEach(opt => opt.classList.remove('selected'));
                    // Select this option
                    option.classList.add('selected');
                    option.querySelector('input').checked = true;
                    
                    // Enable submit button
                    const submitBtn = document.getElementById('submit-btn');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                    }
                });
            });
        }

        // Set up control buttons
        this.setupQuizControls();
    }

    setupQuizControls() {
        const submitBtn = document.getElementById('submit-btn');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        const endBtn = document.getElementById('end-quiz-btn');

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.onclick = () => this.submitAnswer();
        }

        if (nextBtn) {
            nextBtn.onclick = () => this.nextQuestion();
            nextBtn.disabled = this.quizState.currentQuestionIndex >= this.quizState.questions.length - 1;
        }

        if (prevBtn) {
            prevBtn.onclick = () => this.previousQuestion();
            prevBtn.disabled = this.quizState.currentQuestionIndex <= 0;
        }

        if (endBtn) {
            endBtn.onclick = () => this.endQuiz();
        }
    }

    submitAnswer() {
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) return;

        const answerIndex = parseInt(selectedOption.value);
        this.quizState.answers[this.quizState.currentQuestionIndex] = answerIndex;

        console.log(`Answer submitted: ${answerIndex}`);

        // In study mode, show immediate feedback
        if (this.quizState.mode === 'study') {
            this.showFeedback(answerIndex);
        } else {
            // In other modes, just move to next question
            this.nextQuestion();
        }
    }

    showFeedback(answerIndex) {
        const question = this.quizState.questions[this.quizState.currentQuestionIndex];
        const isCorrect = answerIndex === question.correct;

        const container = document.getElementById('question-container');
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
        feedbackDiv.innerHTML = `
            <div class="feedback-result" style="
                padding: 15px;
                margin: 20px 0;
                border-radius: 5px;
                background: ${isCorrect ? '#d4edda' : '#f8d7da'};
                border: 1px solid ${isCorrect ? '#c3e6cb' : '#f5c6cb'};
                color: ${isCorrect ? '#155724' : '#721c24'};
            ">
                <strong>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
                ${!isCorrect ? `<br>Correct answer: ${String.fromCharCode(65 + question.correct)}. ${question.options[question.correct]}` : ''}
                ${question.explanation ? `<br><br><em>${question.explanation}</em>` : ''}
                <br><br>
                <button onclick="window.simpleApp.nextQuestion()" style="
                    background: #4A90E2;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Continue</button>
            </div>
        `;

        container.appendChild(feedbackDiv);

        // Disable answer options
        const options = container.querySelectorAll('.answer-option');
        options.forEach(opt => opt.style.pointerEvents = 'none');
    }

    nextQuestion() {
        this.quizState.currentQuestionIndex++;
        if (this.quizState.currentQuestionIndex >= this.quizState.questions.length) {
            this.endQuiz();
        } else {
            this.displayCurrentQuestion();
        }
    }

    previousQuestion() {
        if (this.quizState.currentQuestionIndex > 0) {
            this.quizState.currentQuestionIndex--;
            this.displayCurrentQuestion();
        }
    }

    endQuiz() {
        console.log('Quiz ended');
        
        // Calculate results
        let correct = 0;
        this.quizState.questions.forEach((question, index) => {
            if (this.quizState.answers[index] === question.correct) {
                correct++;
            }
        });

        const percentage = Math.round((correct / this.quizState.questions.length) * 100);
        
        // Show results
        alert(`Quiz Complete!\n\nScore: ${correct}/${this.quizState.questions.length} (${percentage}%)\n\nClick OK to return to dashboard.`);
        
        // Return to dashboard
        this.returnToDashboard();
    }

    returnToDashboard() {
        if (this.elements.quizView) {
            this.elements.quizView.style.display = 'none';
        }
        if (this.elements.dashboardView) {
            this.elements.dashboardView.style.display = 'block';
        }
        
        this.quizState = null;
        this.currentMode = null;
    }

    showMessage(title, description) {
        // Create a simple modal-like message
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        const modal = document.createElement('div');
        modal.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 10px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;
        
        modal.innerHTML = `
            <h2 style="color: #4A90E2; margin-bottom: 15px;">${title}</h2>
            <p style="margin-bottom: 20px; line-height: 1.5;">${description}</p>
            <button id="close-modal" style="
                background: #4A90E2;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 16px;
            ">Got it!</button>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // Close modal function
        const closeModal = () => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        };
        
        // Close modal when button is clicked
        const closeBtn = modal.querySelector('#close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Close button clicked');
                closeModal();
            });
        }
        
        // Close modal when overlay is clicked
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                console.log('Overlay clicked');
                closeModal();
            }
        });
        
        // Close modal with Escape key
        const handleKeydown = (e) => {
            if (e.key === 'Escape') {
                console.log('Escape key pressed');
                closeModal();
                document.removeEventListener('keydown', handleKeydown);
            }
        };
        document.addEventListener('keydown', handleKeydown);
    }
}

// Initialize the simple app
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - checking for simple app need');
    
    // Wait a bit to see if the main app initializes
    setTimeout(() => {
        if (!window.app || !window.app.isInitialized) {
            console.log('Main app not initialized, using simple app');
            
            // Clear any existing event handlers first
            const buttons = ['unit-quiz-btn', 'practice-test-btn', 'study-mode-btn'];
            buttons.forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.onclick = null;
                    // Remove all event listeners by cloning the element
                    const newBtn = btn.cloneNode(true);
                    btn.parentNode.replaceChild(newBtn, btn);
                }
            });
            
            window.simpleApp = new SimpleApp();
            window.simpleApp.init();
            window.appStatus.simpleAppLoaded = true;
        } else {
            console.log('Main app is running, simple app not needed');
            window.appStatus.mainAppLoaded = true;
        }
    }, 1500);
});