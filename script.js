// Configuration
const CARD_BACK = 'assets/images/Tarot Card Cover Design.jpg';
const deckContainer = document.getElementById('deck-container');
const instructions = document.getElementById('instructions');
const responseContainer = document.getElementById('ai-response-text');

let selectedCards = [];
let allCards = [];

// 1. Initial Load
async function initDeck() {
    try {
        const response = await fetch('cards.json');
        allCards = await response.json();
        shuffle(allCards);
        renderDeck();
    } catch (err) {
        console.error("Error:", err);
        instructions.innerText = "Check your cards.json or paths!";
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 2. Render Deck
function renderDeck() {
    deckContainer.innerHTML = ''; 
    allCards.forEach((cardName, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        // Initial state: Saare cards ek ke upar ek (Stack)
        cardDiv.style.transform = `translateY(0) rotate(0deg)`;
        cardDiv.style.zIndex = index;

        cardDiv.innerHTML = `
            <div class="card-face card-back"><img src="${CARD_BACK}"></div>
            <div class="card-face card-front"><img src="assets/images/${cardName}.jpg"></div>
        `;
        
        cardDiv.onclick = () => handleCardClick(cardDiv, cardName);
        deckContainer.appendChild(cardDiv);

        setTimeout(() => {
            const total = allCards.length;
    
            const angle = (index - total/2) * 5; 
            const xPos = (index - total/2) * 20;  
            const yPos = Math.abs(index - total/2) * 5; 
    
            cardDiv.style.transform = `translateX(${xPos}px) translateY(${yPos}px) rotate(${angle}deg)`;
        }, 500); 
    });
}

// 3. Handle Click (Fixed Variables)

function handleCardClick(cardElement, cardName) {
    if (selectedCards.length >= 3 || cardElement.classList.contains('selected')) return;

    cardElement.classList.add('selected');
    const slotIdx = selectedCards.length;
    selectedCards.push({ name: cardName, element: cardElement });

    const slot = document.getElementById(`slot-${slotIdx}`);
    const slotRect = slot.getBoundingClientRect();
    const deckRect = deckContainer.getBoundingClientRect();

    // --- MAGIC CALCULATION ---
    // 1. Hum slot ki position lete hain screen ke center ke hisaab se
    // 2. 35 isliye kyunki card width (70px) ka aadha hai, taaki center match ho
    const moveX = slotRect.left - (window.innerWidth / 2) + (slotRect.width / 2) + 8; 
    
    // 3. Deck container se slot kitna upar hai
    const moveY = slotRect.top - deckRect.top + 10;

    cardElement.style.zIndex = 1000 + slotIdx;
    
    // Rotation ko 0 karna zaroori hai taaki slot mein card seedha dikhe
    cardElement.style.transform = `translate(${moveX}px, ${moveY}px) rotate(0deg) scale(1.1)`;
    
    if (selectedCards.length === 1) instructions.innerText = "Now, the Present...";
    if (selectedCards.length === 2) instructions.innerText = "And finally, the Future.";
    
    if (selectedCards.length === 3) {
        instructions.innerText = "The spirits are revealing your path...";
        setTimeout(revealAndPredict, 1000);
    }
}
// 4. Reveal Animation
function revealAndPredict() {
    // 1. Pehle subtitle ko change karein (Mystical feel ke liye)
    instructions.style.opacity = "0"; // Chota sa fade out effect
    setTimeout(() => {
        instructions.innerText = "The Oracle is reading your cards...";
        instructions.style.opacity = "1";
    }, 300);

    // 2. Cards ko flip karna (Staggered effect)
    // 0.4s (400ms) ka gap perfect hai, isse teeno cards 1.2 seconds mein flip ho jayenge
    selectedCards.forEach((item, i) => {
        setTimeout(() => {
            // Transform ko safely update karna bina movement bigade
            const currentTransform = item.element.style.transform.replace('rotateY(180deg)', '').trim();
            item.element.style.transform = `${currentTransform} rotateY(180deg)`;
            item.element.classList.add('is-flipped');
        }, i * 400); 
    });

    // 3. Intentional Delay (3.5 Seconds total)
    // Calculation: 1.2s (flipping time) + 2.3s (user observing the cards)
    setTimeout(() => {
        // Modal dikhane se pehle subtitle ko final state mein laayein
        instructions.innerText = "The energies have aligned.";
        
        // Modal open karein
        const modal = document.getElementById('prediction-modal');
        modal.classList.remove('hidden');
        
        // AI reading shuru karein
        getAIPrediction();
    }, 3500); 
}

function typeWriter(text, el) {
    el.innerHTML = ""; let i = 0;
    function type() {
        if (i < text.length) { el.innerHTML += text.charAt(i); i++; setTimeout(type, 30); }
    }
    type();
}

// 5. AI Prediction
async function getAIPrediction() {
    responseContainer.innerHTML = '<p class="typing">Reading the stars...</p>';
    
    // Exact structure that Google Gemini expects
    const payload = {
        contents: [{
            parts: [{
                text: `You are a Tarot Card Reader. Cards selected by the seeker: Past: ${selectedCards[0].name}, Present: ${selectedCards[1].name}, Future: ${selectedCards[2].name}.Based on these selected cards, give a short mystical reading based on these cards (not more than 100 Words). Use 3 very short paragraphs (one for each card). The predictions must be interesting and spicy. Keep the tone mystical but concise and use simpler language.`
            }]
        }]
    };

    try {
        // Calling our Netlify proxy function
        const res = await fetch('/.netlify/functions/getPrediction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) 
        });
        
        const data = await res.json();
        
        // Handling API errors from Gemini
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            throw new Error(data.error.message || "The stars are unclear right now.");
        }

        // Checking if we got a valid response back
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            typeWriter(text, responseContainer);
        } else {
            console.log("Unexpected data structure:", data);
            throw new Error("Mystical energies are blocked. Please try again.");
        }
    } catch (e) {
        console.error("Oracle Error:", e);
        // Displaying a user-friendly error
        responseContainer.innerText = "The Oracle is silent. " + e.message;
    }
}



function closeModal() {
    document.getElementById('prediction-modal').classList.add('hidden');
}

initDeck();
