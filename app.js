document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('setup-form');
    const apiKeyInput = document.getElementById('api-key');
    const dayContextInput = document.getElementById('day-context');
    const budgetInput = document.getElementById('budget');
    const dietInput = document.getElementById('diet');
    const generateBtn = document.getElementById('generate-btn');

    // Load saved API key
    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
        apiKeyInput.value = savedKey;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Capture Data
        const apiKey = apiKeyInput.value.trim();
        const userInput = {
            dayContext: dayContextInput.value.trim(),
            budget: parseFloat(budgetInput.value),
            diet: dietInput.value.trim()
        };

        // Save API key
        localStorage.setItem('gemini_api_key', apiKey);

        console.log('User Input Captured:', userInput);
        
        // 2. Update UI state
        const originalBtnText = generateBtn.textContent;
        generateBtn.textContent = 'Planning your meals...';
        generateBtn.disabled = true;
        
        // 3. AI Integration
        try {
            const prompt = `You are a meal planning assistant. Create a daily meal plan based on the following:
Day Context: ${userInput.dayContext}
Budget: $${userInput.budget}
Dietary Preferences: ${userInput.diet}

Respond ONLY in valid JSON format, exactly matching this structure, with no markdown wrappers or backticks:
{
  "meals": {
    "breakfast": "name of meal",
    "lunch": "name of meal",
    "dinner": "name of meal"
  },
  "groceryList": [
    {"item": "ingredient name", "estimatedPrice": 2.50}
  ],
  "substitutions": [
    {"original": "ingredient name", "substitute": "alternative"}
  ],
  "budgetFeasibility": "A short sentence on if this fits the budget."
}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const aiText = data.candidates[0].content.parts[0].text;
            
            // Clean up possible markdown in response
            const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
            const mealPlan = JSON.parse(cleanJson);
            
            console.log('AI Response parsed:', mealPlan);
            alert('Slice 2 complete! AI response received and parsed successfully. Check console.');
            
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Failed to generate meal plan. Check console for details or verify your API key.');
        } finally {
            generateBtn.textContent = originalBtnText;
            generateBtn.disabled = false;
        }
    });
});
