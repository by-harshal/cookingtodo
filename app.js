document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('setup-form');

    const dayContextInput = document.getElementById('day-context');
    const budgetInput = document.getElementById('budget');
    const dietInput = document.getElementById('diet');
    const generateBtn = document.getElementById('generate-btn');
    const resultsContainer = document.getElementById('results-container');
    const resetBtn = document.getElementById('reset-btn');


    resetBtn.addEventListener('click', () => {
        resultsContainer.classList.add('hidden');
        form.classList.remove('hidden');
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Capture Data
        const apiKey = 'AIzaSyCOX3dHyGsSkzBRcaQwEsbxi1AVPkMe-w8';
        const userInput = {
            dayContext: dayContextInput.value.trim(),
            budget: parseFloat(budgetInput.value),
            diet: dietInput.value.trim()
        };

        // 2. Update UI state
        const originalBtnText = generateBtn.textContent;
        generateBtn.textContent = 'Planning your meals...';
        generateBtn.disabled = true;
        
        // 3. AI Integration
        try {
            const prompt = `You are an expert meal planning assistant specializing in Indian cuisine and the Indian context. Create a daily meal plan based on the following:
Day Context: ${userInput.dayContext}
Budget: ₹${userInput.budget} INR
Dietary Preferences: ${userInput.diet}

Respond ONLY in valid JSON format, exactly matching this structure, with no markdown wrappers or backticks. Use Indian recipes, local Indian ingredients, and realistic prices in INR:
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

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
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
            
            // 4. Render UI
            renderResults(mealPlan);
            
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Error details: ' + error.message);
        } finally {
            generateBtn.textContent = originalBtnText;
            generateBtn.disabled = false;
        }
    });

    function renderResults(plan) {
        // Hide form, show results
        form.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

        // Render Meals
        document.getElementById('meal-breakfast').textContent = plan.meals.breakfast || 'N/A';
        document.getElementById('meal-lunch').textContent = plan.meals.lunch || 'N/A';
        document.getElementById('meal-dinner').textContent = plan.meals.dinner || 'N/A';

        // Render Budget Status
        document.getElementById('budget-status').textContent = plan.budgetFeasibility || 'Budget analysis unavailable.';

        // Render Grocery List
        const groceryListEl = document.getElementById('grocery-list');
        groceryListEl.innerHTML = '';
        if (plan.groceryList && plan.groceryList.length > 0) {
            plan.groceryList.forEach((item, index) => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="list-item-text">
                        <input type="checkbox" id="item-${index}">
                        <label for="item-${index}">${item.item}</label>
                    </div>
                    <span class="price-tag">₹${item.estimatedPrice.toFixed(2)}</span>
                `;
                groceryListEl.appendChild(li);
            });
        } else {
            groceryListEl.innerHTML = '<li>No items needed.</li>';
        }

        // Render Substitutions
        const subsListEl = document.getElementById('substitutions-list');
        subsListEl.innerHTML = '';
        if (plan.substitutions && plan.substitutions.length > 0) {
            plan.substitutions.forEach(sub => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="list-item-text">
                        <span><strong>${sub.original}</strong> &rarr; ${sub.substitute}</span>
                    </div>
                `;
                subsListEl.appendChild(li);
            });
        } else {
            subsListEl.innerHTML = '<li>No substitutions needed.</li>';
        }
    }
});
