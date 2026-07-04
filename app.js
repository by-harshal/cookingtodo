document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('setup-form');
    const dayContextInput = document.getElementById('day-context');
    const budgetInput = document.getElementById('budget');
    const dietInput = document.getElementById('diet');
    const generateBtn = document.getElementById('generate-btn');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Capture Data
        const userInput = {
            dayContext: dayContextInput.value.trim(),
            budget: parseFloat(budgetInput.value),
            diet: dietInput.value.trim()
        };

        // 2. Log to console to verify data flow for Slice 1
        console.log('User Input Captured:', userInput);
        
        // 3. Update UI state (temporarily just changing button text to simulate processing)
        const originalBtnText = generateBtn.textContent;
        generateBtn.textContent = 'Planning your meals...';
        generateBtn.disabled = true;
        
        // Simulating the hand-off to Slice 2
        setTimeout(() => {
            alert('Slice 1 complete! Data captured in memory. Ready for AI Integration.');
            generateBtn.textContent = originalBtnText;
            generateBtn.disabled = false;
        }, 1000);
    });
});
