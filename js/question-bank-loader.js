/**
 * QuestionBankLoader - Loads and processes the complete AP Government question bank
 * Handles data validation, formatting, and integration with the quiz system
 */
class QuestionBankLoader {
    constructor() {
        this.questions = [];
        this.isLoaded = false;
        this.loadingPromise = null;
    }

    /**
     * Load questions from the JSON file
     * @returns {Promise<Array>} Promise that resolves to array of questions
     */
    async loadQuestions() {
        if (this.isLoaded) {
            return this.questions;
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        this.loadingPromise = this.fetchAndProcessQuestions();
        return this.loadingPromise;
    }

    /**
     * Fetch and process questions from the JSON file
     * @returns {Promise<Array>} Processed questions array
     */
    async fetchAndProcessQuestions() {
        try {
            const response = await fetch('ap_gov_complete_question_bank.json');
            if (!response.ok) {
                throw new Error(`Failed to load question bank: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.questions || !Array.isArray(data.questions)) {
                throw new Error('Invalid question bank format: missing questions array');
            }

            // Process and validate questions
            this.questions = this.processQuestions(data.questions);
            this.isLoaded = true;

            console.log(`Loaded ${this.questions.length} questions from question bank`);
            this.logQuestionDistribution();

            return this.questions;

        } catch (error) {
            console.error('Failed to load question bank:', error);
            
            // Fallback to sample questions if available
            if (typeof sampleQuestions !== 'undefined') {
                console.log('Falling back to sample questions');
                this.questions = this.processQuestions(sampleQuestions);
                this.isLoaded = true;
                return this.questions;
            }

            throw error;
        }
    }

    /**
     * Process and validate questions
     * @param {Array} rawQuestions - Raw questions from JSON
     * @returns {Array} Processed and validated questions
     */
    processQuestions(rawQuestions) {
        const processedQuestions = [];

        rawQuestions.forEach((rawQuestion, index) => {
            try {
                const question = this.processQuestion(rawQuestion, index);
                if (question) {
                    processedQuestions.push(question);
                }
            } catch (error) {
                console.warn(`Skipping invalid question at index ${index}:`, error.message);
            }
        });

        return processedQuestions;
    }

    /**
     * Process and validate a single question
     * @param {Object} rawQuestion - Raw question data
     * @param {number} index - Question index for error reporting
     * @returns {Object|null} Processed question or null if invalid
     */
    processQuestion(rawQuestion, index) {
        // Validate required fields
        if (!rawQuestion.id || !rawQuestion.question || !rawQuestion.options) {
            throw new Error(`Missing required fields (id: ${rawQuestion.id})`);
        }

        // Clean and validate question text
        let questionText = this.cleanQuestionText(rawQuestion.question);
        if (!questionText || questionText.length < 10) {
            throw new Error(`Invalid question text (id: ${rawQuestion.id})`);
        }

        // Process options
        let options = this.processOptions(rawQuestion.options);
        if (!options || options.length < 2) {
            throw new Error(`Invalid options (id: ${rawQuestion.id})`);
        }

        // Validate unit (should be 1-5 for AP Gov)
        let unit = parseInt(rawQuestion.unit) || 1;
        if (unit < 1 || unit > 5) {
            unit = 1; // Default to unit 1 if invalid
        }

        // Determine correct answer
        let correct = this.determineCorrectAnswer(rawQuestion, options);

        // Create processed question object
        return {
            id: rawQuestion.id,
            unit: unit,
            question: questionText,
            options: options,
            correct: correct,
            explanation: rawQuestion.explanation || null
        };
    }

    /**
     * Clean and format question text
     * @param {string} questionText - Raw question text
     * @returns {string} Cleaned question text
     */
    cleanQuestionText(questionText) {
        if (typeof questionText !== 'string') {
            return '';
        }

        return questionText
            .replace(/\\n/g, ' ')           // Replace literal \n with spaces
            .replace(/\n/g, ' ')            // Replace actual newlines with spaces
            .replace(/\s+/g, ' ')           // Collapse multiple spaces
            .replace(/[""]/g, '"')          // Normalize quotes
            .replace(/['']/g, "'")          // Normalize apostrophes
            .trim();
    }

    /**
     * Process and clean answer options
     * @param {Array} rawOptions - Raw options array
     * @returns {Array} Cleaned options array
     */
    processOptions(rawOptions) {
        if (!Array.isArray(rawOptions)) {
            return [];
        }

        return rawOptions
            .map(option => {
                if (typeof option !== 'string') {
                    return '';
                }
                
                return option
                    .replace(/\\n/g, ' ')       // Replace literal \n
                    .replace(/\n/g, ' ')        // Replace actual newlines
                    .replace(/^\([A-E]\)\s*/, '') // Remove (A), (B), etc. prefixes
                    .replace(/^[A-E]\.\s*/, '')   // Remove A., B., etc. prefixes
                    .replace(/\s+/g, ' ')       // Collapse spaces
                    .trim();
            })
            .filter(option => option.length > 0)  // Remove empty options
            .slice(0, 4);  // Limit to 4 options max
    }

    /**
     * Determine the correct answer index
     * @param {Object} rawQuestion - Raw question data
     * @param {Array} options - Processed options array
     * @returns {number} Correct answer index (0-based)
     */
    determineCorrectAnswer(rawQuestion, options) {
        // If correct answer is provided as number
        if (typeof rawQuestion.correct === 'number') {
            const index = rawQuestion.correct;
            return Math.max(0, Math.min(index, options.length - 1));
        }

        // If correct answer is provided as letter (A, B, C, D)
        if (typeof rawQuestion.correct === 'string') {
            const letter = rawQuestion.correct.toUpperCase().trim();
            const letterToIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
            if (letterToIndex.hasOwnProperty(letter)) {
                return Math.min(letterToIndex[letter], options.length - 1);
            }
        }

        // Default to first option if no valid correct answer found
        return 0;
    }

    /**
     * Log question distribution by unit
     */
    logQuestionDistribution() {
        const distribution = {};
        const unitNames = {
            1: "Foundations of American Democracy",
            2: "Interactions Among Branches of Government",
            3: "Civil Liberties and Civil Rights",
            4: "American Political Ideologies and Beliefs",
            5: "Political Participation"
        };

        // Count questions by unit
        this.questions.forEach(question => {
            distribution[question.unit] = (distribution[question.unit] || 0) + 1;
        });

        console.log('Question distribution by unit:');
        for (let unit = 1; unit <= 5; unit++) {
            const count = distribution[unit] || 0;
            const unitName = unitNames[unit];
            console.log(`Unit ${unit} (${unitName}): ${count} questions`);
        }
    }

    /**
     * Get questions for a specific unit
     * @param {number} unitId - Unit ID (1-5)
     * @returns {Array} Questions for the specified unit
     */
    getQuestionsByUnit(unitId) {
        return this.questions.filter(question => question.unit === unitId);
    }

    /**
     * Get a random sample of questions
     * @param {number} count - Number of questions to return
     * @param {number|null} unitId - Optional unit filter
     * @returns {Array} Random sample of questions
     */
    getRandomQuestions(count, unitId = null) {
        let availableQuestions = unitId ? 
            this.getQuestionsByUnit(unitId) : 
            this.questions;

        if (availableQuestions.length === 0) {
            return [];
        }

        // Shuffle and return requested count
        const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Get questions for practice test (distributed across all units)
     * @param {number} totalQuestions - Total number of questions needed
     * @returns {Array} Balanced set of questions across units
     */
    getPracticeTestQuestions(totalQuestions = 55) {
        const questionsPerUnit = Math.floor(totalQuestions / 5);
        const remainder = totalQuestions % 5;
        const practiceQuestions = [];

        // Get questions from each unit
        for (let unit = 1; unit <= 5; unit++) {
            const unitQuestions = this.getQuestionsByUnit(unit);
            const neededCount = questionsPerUnit + (unit <= remainder ? 1 : 0);
            
            if (unitQuestions.length > 0) {
                const selectedQuestions = this.getRandomQuestions(neededCount, unit);
                practiceQuestions.push(...selectedQuestions);
            }
        }

        // If we don't have enough questions, fill with random ones
        if (practiceQuestions.length < totalQuestions) {
            const needed = totalQuestions - practiceQuestions.length;
            const usedIds = new Set(practiceQuestions.map(q => q.id));
            const remainingQuestions = this.questions.filter(q => !usedIds.has(q.id));
            
            const additionalQuestions = remainingQuestions
                .sort(() => Math.random() - 0.5)
                .slice(0, needed);
            
            practiceQuestions.push(...additionalQuestions);
        }

        // Final shuffle
        return practiceQuestions.sort(() => Math.random() - 0.5);
    }

    /**
     * Validate question bank integrity
     * @returns {Object} Validation results
     */
    validateQuestionBank() {
        const results = {
            isValid: true,
            totalQuestions: this.questions.length,
            issues: [],
            unitDistribution: {}
        };

        // Check unit distribution
        for (let unit = 1; unit <= 5; unit++) {
            const count = this.getQuestionsByUnit(unit).length;
            results.unitDistribution[unit] = count;
            
            if (count === 0) {
                results.issues.push(`Unit ${unit} has no questions`);
                results.isValid = false;
            }
        }

        // Check for minimum questions
        if (results.totalQuestions < 55) {
            results.issues.push(`Only ${results.totalQuestions} questions available, need at least 55 for practice tests`);
            results.isValid = false;
        }

        return results;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionBankLoader;
}