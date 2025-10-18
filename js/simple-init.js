// Simple initialization fallback for debugging
console.log('Simple init script loaded');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - simple init');
    
    // Simple button handlers as fallback
    const unitBtn = document.getElementById('unit-quiz-btn');
    const practiceBtn = document.getElementById('practice-test-btn');
    const studyBtn = document.getElementById('study-mode-btn');
    
    console.log('Buttons found:', {
        unit: !!unitBtn,
        practice: !!practiceBtn,
        study: !!studyBtn
    });
    
    if (unitBtn) {
        unitBtn.addEventListener('click', () => {
            console.log('Unit quiz clicked - simple handler');
            alert('Unit Quiz mode selected! (Simple handler)');
        });
    }
    
    if (practiceBtn) {
        practiceBtn.addEventListener('click', () => {
            console.log('Practice test clicked - simple handler');
            alert('Practice Test mode selected! (Simple handler)');
        });
    }
    
    if (studyBtn) {
        studyBtn.addEventListener('click', () => {
            console.log('Study mode clicked - simple handler');
            alert('Study Mode selected! (Simple handler)');
        });
    }
});