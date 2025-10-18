/**
 * QuestionManager class for handling question bank operations
 * Manages loading, filtering, and randomization of AP Gov questions
 */
class QuestionManager {
    constructor() {
        this.questions = [];
        this.questionsByUnit = new Map();
    }

    /**
     * Loads questions from data array and organizes by unit
     * @param {Array} questionData - Array of question objects
     */
    loadQuestions(questionData) {
        if (!Array.isArray(questionData)) {
            throw new Error('Question data must be an array');
        }

        this.questions = [];
        this.questionsByUnit.clear();

        // Initialize unit maps
        for (let unit = 1; unit <= 5; unit++) {
            this.questionsByUnit.set(unit, []);
        }

        // Process each question
        questionData.forEach((data, index) => {
            try {
                const question = new Question(data);
                this.questions.push(question);
                
                // Organize by unit
                const unitQuestions = this.questionsByUnit.get(question.unit);
                unitQuestions.push(question);
            } catch (error) {
                console.warn(`Skipping invalid question at index ${index}:`, error.message);
            }
        });

        console.log(`Loaded ${this.questions.length} valid questions`);
        this.logUnitDistribution();
    }

    /**
     * Gets all questions for a specific unit
     * @param {number} unitId - Unit number (1-5)
     * @returns {Array} Array of Question objects for the unit
     */
    getQuestionsByUnit(unitId) {
        if (!Number.isInteger(unitId) || unitId < 1 || unitId > 5) {
            throw new Error('Unit ID must be an integer between 1 and 5');
        }

        return [...this.questionsByUnit.get(unitId)];
    }

    /**
     * Gets random questions from specified units or all units
     * @param {number} count - Number of questions to return
     * @param {Array|null} units - Array of unit numbers, or null for all units
     * @returns {Array} Array of randomly selected Question objects
     */
    getRandomQuestions(count, units = null) {
        if (!Number.isInteger(count) || count < 1) {
            throw new Error('Count must be a positive integer');
        }

        let availableQuestions = [];

        if (units === null) {
            // Use all questions
            availableQuestions = [...this.questions];
        } else {
            // Filter by specified units
            if (!Array.isArray(units)) {
                throw new Error('Units must be an array or null');
            }

            units.forEach(unit => {
                if (!Number.isInteger(unit) || unit < 1 || unit > 5) {
                    throw new Error('All unit numbers must be integers between 1 and 5');
                }
                availableQuestions.push(...this.questionsByUnit.get(unit));
            });
        }

        if (availableQuestions.length === 0) {
            throw new Error('No questions available for the specified criteria');
        }

        if (count > availableQuestions.length) {
            console.warn(`Requested ${count} questions but only ${availableQuestions.length} available`);
            count = availableQuestions.length;
        }

        // Shuffle and select random questions
        const shuffled = this.shuffleArray([...availableQuestions]);
        return shuffled.slice(0, count);
    }

    /**
     * Gets random questions distributed across all units for practice tests
     * @param {number} totalCount - Total number of questions (default 55 for AP exam)
     * @returns {Array} Array of questions distributed across units
     */
    getRandomDistributedQuestions(totalCount = 55) {
        const questionsPerUnit = Math.floor(totalCount / 5);
        const remainder = totalCount % 5;
        const selectedQuestions = [];

        // Get questions from each unit
        for (let unit = 1; unit <= 5; unit++) {
            const unitQuestions = this.getQuestionsByUnit(unit);
            let countForUnit = questionsPerUnit;
            
            // Distribute remainder questions to first few units
            if (unit <= remainder) {
                countForUnit++;
            }

            if (unitQuestions.length < countForUnit) {
                console.warn(`Unit ${unit} has only ${unitQuestions.length} questions, need ${countForUnit}`);
                countForUnit = unitQuestions.length;
            }

            if (countForUnit > 0) {
                const randomFromUnit = this.getRandomQuestions(countForUnit, [unit]);
                selectedQuestions.push(...randomFromUnit);
            }
        }

        // If we don't have enough questions total, fill with random questions from available pool
        if (selectedQuestions.length < totalCount && this.questions.length > 0) {
            const needed = totalCount - selectedQuestions.length;
            const availableQuestions = this.questions.filter(q => 
                !selectedQuestions.some(selected => selected.id === q.id)
            );
            
            if (availableQuestions.length > 0) {
                const additional = this.shuffleArray(availableQuestions).slice(0, needed);
                selectedQuestions.push(...additional);
            }
        }

        // Shuffle the final array to mix units
        return this.shuffleArray(selectedQuestions);
    }

    /**
     * Validates a single question object
     * @param {Object} questionData - Question data to validate
     * @returns {boolean} True if valid, false otherwise
     */
    validateQuestion(questionData) {
        try {
            new Question(questionData);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Gets statistics about the question bank
     * @returns {Object} Statistics object with counts by unit and total
     */
    getStatistics() {
        const stats = {
            total: this.questions.length,
            byUnit: {}
        };

        for (let unit = 1; unit <= 5; unit++) {
            stats.byUnit[unit] = this.questionsByUnit.get(unit).length;
        }

        return stats;
    }

    /**
     * Searches questions by text content
     * @param {string} searchTerm - Term to search for
     * @param {number|null} unitFilter - Optional unit filter
     * @returns {Array} Array of matching questions
     */
    searchQuestions(searchTerm, unitFilter = null) {
        if (typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
            return [];
        }

        const term = searchTerm.toLowerCase();
        let questionsToSearch = this.questions;

        if (unitFilter !== null) {
            questionsToSearch = this.getQuestionsByUnit(unitFilter);
        }

        return questionsToSearch.filter(question => 
            question.question.toLowerCase().includes(term) ||
            question.options.some(option => option.toLowerCase().includes(term)) ||
            question.explanation.toLowerCase().includes(term)
        );
    }

    /**
     * Utility method to shuffle an array using Fisher-Yates algorithm
     * @param {Array} array - Array to shuffle
     * @returns {Array} Shuffled array
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Logs the distribution of questions across units
     */
    logUnitDistribution() {
        console.log('Question distribution by unit:');
        for (let unit = 1; unit <= 5; unit++) {
            const count = this.questionsByUnit.get(unit).length;
            const unitName = new Question({ 
                id: 'temp', 
                unit, 
                question: 'temp', 
                options: ['a', 'b', 'c', 'd'], 
                correct: 0 
            }).getUnitName();
            console.log(`Unit ${unit} (${unitName}): ${count} questions`);
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionManager;
}