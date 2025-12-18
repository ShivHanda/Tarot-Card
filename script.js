// Configuration
const GEMINI_API_KEY = "AIzaSyCAKW9GMQbsZCcIdWtC8d12vqPe9mbxZeg";
const CARD_BACK = 'assets/images/Tarot Card Cover Design.jpg';
const deckContainer = document.getElementById('deck-container');
const instructions = document.getElementById('instructions');
const responseContainer = document.getElementById('ai-response-text');

let selectedCards = [];
let allCards = [];

// 1. Initial Load: Fetch cards list and Shuffle
async function initDeck() {
    try {
        const response = await fetch('cards.json');
        allCards = await response.json();
        shuffle(allCards);
        renderDeck();
    } catch (err) {
        console.error("Error loading cards:", err);
        instructions.innerText = "The cards are missing! Check assets/cards.json";
    }
}

// 2. Fisher-Yates Shuffle Algorithm
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 3. Render Cards in a Mystical Fan Shape
function renderDeck() {
    deckContainer.innerHTML = ''; 
    allCards.forEach((cardName, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.dataset.name = cardName;

        // Math logic for the Fan spread
        const totalCards = allCards.length;
        const angle = (index - (totalCards / 2)) * 1.8; 
        const xOffset = (index - (totalCards / 2)) * 3.5;
        const yOffset = Math.abs(index - (totalCards / 2)) * 0.8;
        
        cardDiv.style.transform = `translateX(${xOffset}px) translateY(${yOffset}px) rotate(${angle}deg)`;
        cardDiv.style.zIndex = index;

        cardDiv.innerHTML = `
            <div class="card-face card-back">
                <img src="${CARD_BACK}" alt="Cover">
            </div>
            <div class="card-face card-front">
                <img src="assets/images/${cardName}.jpg" alt="${cardName}">
            </div>
        `;

        cardDiv.onclick = () => handleCardClick(cardDiv, cardName);
        deckContainer.appendChild(cardDiv);
    });
}

// 4. Handle Card Selection & Animation
function handleCardClick(cardElement, cardName) {
    if (selectedCards.length >= 3 || cardElement.classList.contains('selected')) return;

    cardElement.classList.add('selected');
    selectedCards.push({ name: cardName, element: cardElement });

    const slotIndex = selectedCards.length - 1;
    const slot = document.getElementById(`slot-${slotIndex}`);
    const slotRect = slot.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();

    // Calculate distance to fly to slot
    const moveX = slotRect.left - cardRect.left;
    const moveY = slotRect.top - cardRect.top;

    cardElement.style.zIndex = 2000 + selectedCards.length;
    cardElement.style.transform = `translate(${moveX}px, ${moveY}px) rotate(0deg) scale(1.1)`;
    
    // Update Dynamic Captions
    if (selectedCards.length === 1) instructions.innerText = "Second card... what does the Present hold?";
    if (selectedCards.length === 2) instructions.innerText = "Final card... looking into the Future.";
    
    if (selectedCards.length === 3) {
        instructions.innerText = "Selection complete. Reading the energies...";
        setTimeout(revealAndPredict, 1200);
    }
}

// 5. Reveal Cards & Call Gemini API
function revealAndPredict() {
    // Flip selected cards to show their front
    selectedCards.forEach(item => {
        item.element.classList.add('is-flipped');
    });

    // Show the Prediction Modal after a short delay
    setTimeout(() => {
        document.getElementById('prediction-modal').classList.remove('hidden');
        getAIPrediction();
    }, 1500);
}

// 6. Gemini AI Integration
async function getAIPrediction() {
    responseContainer.innerHTML = '<p class="typing">Channeling the cosmos...</p>';

    const past = selectedCards[0].name;
    const present = selectedCards[1].name;
    const future = selectedCards[2].name;

    const promptText = `You are an expert Tarot Reader. A seeker has chosen:
    - Past: ${past}
    - Present: ${present}
    - Future: ${future}
    Create a deeply mystical, 3-paragraph reading. Connect the flow of energy between these cards. Do not use bold characters, asterisk or any special markdown. Keep it pure, beautiful text.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: promptText }] }]
            })
        });

        const data = await response.json();
        const prediction = data.candidates[0].content.parts[0].text;

        typeWriter(prediction, responseContainer);
        
        // Save to Supabase (Optional: if connected)
        if (typeof saveReadingToSupabase === 'function') {
            saveReadingToSupabase(selectedCards.map(c => c.name));
        }

    } catch (error) {
        console.error("AI Error:", error);
        responseContainer.innerHTML = "<p>The spirits are silent. Check your connection or API key.</p>";
    }
}

// 7. Elegant Typing Effect
function typeWriter(text, element) {
    element.innerHTML = "";
    let i = 0;
    const speed = 40; 

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function closeModal() {
    document.getElementById('prediction-modal').classList.add('hidden');
    // Optional: Refresh page to restart
    // location.reload();
}

// Start the Application
initDeck();
