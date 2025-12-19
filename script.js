// Configuration
const part1 = "AIzaSyCAKW9GMQbsZCc";
const part2 = "IdWtC8d12vqPe9mbxZeg"; 
const GEMINI_API_KEY = part1 + part2;
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

        // Chota sa delay taaki stack se fan bante hue dikhe
        setTimeout(() => {
            const total = allCards.length;
            const angle = (index - total/2) * 2;
            const xPos = (index - total/2) * 4;
            const yPos = Math.abs(index - total/2) * 0.5;
            cardDiv.style.transform = `translateX(${xPos}px) translateY(${yPos}px) rotate(${angle}deg)`;
        }, 500); // 0.5 second baad fan phelega
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
    selectedCards.forEach((item, i) => {
        setTimeout(() => {
            const currentTransform = item.element.style.transform.replace('rotateY(180deg)', '');
            item.element.style.transform = currentTransform + " rotateY(180deg)";
            item.element.classList.add('is-flipped');
        }, i * 400);
    });

    setTimeout(() => {
        document.getElementById('prediction-modal').classList.remove('hidden');
        getAIPrediction();
    }, 2000);
}

// 5. AI Prediction
async function getAIPrediction() {
    responseContainer.innerHTML = '<p class="typing">Reading the stars...</p>';
    const promptText = `You are a Tarot Reader. Cards: Past: ${selectedCards[0].name}, Present: ${selectedCards[1].name}, Future: ${selectedCards[2].name}. Write a 3-paragraph mystical reading without bold or special characters.`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        typeWriter(text, responseContainer);
    } catch (e) {
        responseContainer.innerText = "The connection to the beyond was lost. Try again.";
    }
}

function typeWriter(text, el) {
    el.innerHTML = ""; let i = 0;
    function type() {
        if (i < text.length) { el.innerHTML += text.charAt(i); i++; setTimeout(type, 30); }
    }
    type();
}

function closeModal() {
    document.getElementById('prediction-modal').classList.add('hidden');
}

initDeck();
