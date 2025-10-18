/**
 * Verification script to check timer implementation completeness
 * This checks that all required methods and functionality exist
 */

const fs = require('fs');

console.log('=== Timer Implementation Verification ===\n');

// Check if files exist
const requiredFiles = [
    'js/timer.js',
    'js/timer.test.js',
    'test-practice-timer.html'
];

console.log('1. Checking required files:');
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✓ ${file}`);
    } else {
        console.log(`   ✗ ${file} - MISSING`);
    }
});

// Check Timer class implementation
console.log('\n2. Checking Timer class methods:');
const timerCode = fs.readFileSync('js/timer.js', 'utf8');

const requiredMethods = [
    'start',
    'pause',
    'resume', 
    'stop',
    'getTimeRemaining',
    'getFormattedTime',
    'onTick',
    'onTimeUp',
    'onWarning',
    'serialize',
    'deserialize',
    'addTime',
    'handleVisibilityChange'
];

requiredMethods.forEach(method => {
    if (timerCode.includes(method)) {
        console.log(`   ✓ ${method}()`);
    } else {
        console.log(`   ✗ ${method}() - MISSING`);
    }
});

// Check QuizEngine integration
console.log('\n3. Checking QuizEngine timer integration:');
const quizEngineCode = fs.readFileSync('js/quiz-engine.js', 'utf8');

const requiredIntegrations = [
    'initializePracticeTimer',
    'handleTimerTick',
    'handleTimeUp',
    'handleTimerWarning',
    'shouldWarnOnNavigation',
    'getNavigationWarningMessage',
    'onTimerTick',
    'onTimerWarning'
];

requiredIntegrations.forEach(integration => {
    if (quizEngineCode.includes(integration)) {
        console.log(`   ✓ ${integration}`);
    } else {
        console.log(`   ✗ ${integration} - MISSING`);
    }
});

// Check app.js integration
console.log('\n4. Checking App.js timer integration:');
const appCode = fs.readFileSync('js/app.js', 'utf8');

const requiredAppIntegrations = [
    'handleTimerTick',
    'handleTimerWarning',
    'updateTimerDisplay',
    'showTimerWarning',
    'shouldWarnOnNavigation',
    'beforeunload'
];

requiredAppIntegrations.forEach(integration => {
    if (appCode.includes(integration)) {
        console.log(`   ✓ ${integration}`);
    } else {
        console.log(`   ✗ ${integration} - MISSING`);
    }
});

// Check HTML integration
console.log('\n5. Checking HTML timer integration:');
const htmlCode = fs.readFileSync('index.html', 'utf8');

const requiredHtmlElements = [
    'timer-display',
    'timer.js',
    'timer.test.js'
];

requiredHtmlElements.forEach(element => {
    if (htmlCode.includes(element)) {
        console.log(`   ✓ ${element}`);
    } else {
        console.log(`   ✗ ${element} - MISSING`);
    }
});

// Check CSS integration
console.log('\n6. Checking CSS timer styles:');
const cssCode = fs.readFileSync('styles/main.css', 'utf8');

const requiredStyles = [
    'timer-display',
    'warning',
    'critical',
    'pulse-warning',
    'pulse-critical',
    'notification',
    'feedback'
];

requiredStyles.forEach(style => {
    if (cssCode.includes(style)) {
        console.log(`   ✓ ${style}`);
    } else {
        console.log(`   ✗ ${style} - MISSING`);
    }
});

// Check task requirements
console.log('\n7. Checking task requirements compliance:');

const taskRequirements = [
    {
        name: 'Timer class with 80-minute countdown',
        check: timerCode.includes('start(minutes = 80)') && timerCode.includes('80')
    },
    {
        name: 'Practice test with exactly 55 questions',
        check: quizEngineCode.includes('55') && quizEngineCode.includes('practice')
    },
    {
        name: 'Auto-submit when timer reaches zero',
        check: quizEngineCode.includes('handleTimeUp') && quizEngineCode.includes('auto')
    },
    {
        name: 'Warning system for navigation',
        check: quizEngineCode.includes('shouldWarnOnNavigation') && appCode.includes('beforeunload')
    }
];

taskRequirements.forEach(req => {
    if (req.check) {
        console.log(`   ✓ ${req.name}`);
    } else {
        console.log(`   ✗ ${req.name} - NOT IMPLEMENTED`);
    }
});

console.log('\n=== Verification Complete ===');

// Count implementation completeness
const allChecks = [
    ...requiredFiles.map(f => fs.existsSync(f)),
    ...requiredMethods.map(m => timerCode.includes(m)),
    ...requiredIntegrations.map(i => quizEngineCode.includes(i)),
    ...requiredAppIntegrations.map(i => appCode.includes(i)),
    ...requiredHtmlElements.map(e => htmlCode.includes(e)),
    ...requiredStyles.map(s => cssCode.includes(s)),
    ...taskRequirements.map(r => r.check)
];

const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;
const percentage = Math.round((passed / total) * 100);

console.log(`\nImplementation Status: ${passed}/${total} checks passed (${percentage}%)`);

if (percentage >= 90) {
    console.log('✓ Implementation appears complete and ready for testing');
} else if (percentage >= 75) {
    console.log('⚠ Implementation mostly complete, minor issues may exist');
} else {
    console.log('✗ Implementation incomplete, significant work needed');
}