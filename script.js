const GEMINI_API_KEY = "AIzaSyCAKW9GMQbsZCcIdWtC8d12vqPe9mbxZeg";
const CARD_BACK = 'assets/images/Tarot Card Cover Design.jpg';
const deckContainer = document.getElementById('deck-container');
const instructions = document.getElementById('instructions');
const responseContainer = document.getElementById('ai-response-text');

let selectedCards = [];
let allCards = [];

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

function renderDeck() {
    deckContainer.innerHTML = ''; 
    allCards.forEach((cardName, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        
        const total = allCards.length;
        const angle = (index - total/2) * 2;
        const xPos = (index - total/2) * 4;
        const yPos = Math.abs(index - total/2) * 0.5;

        cardDiv.style.transform = `translateX(${xPos}px) translateY(${yPos}px) rotate(${angle}deg)`;
        cardDiv.style.zIndex = index;

        cardDiv.innerHTML = `
            <div class="card-face card-back"><img src="${CARD_BACK}"></div>
            <div class="card-face card-front"><img src="assets/images/${cardName}.jpg"></div>
        `;

        cardDiv.onclick = () => handleCardClick(cardDiv, cardName);
        deckContainer.appendChild(cardDiv);
    });
}

function handleCardClick(cardElement, cardName) {
    if (selectedCards.length >= 3 || cardElement.classList.contains('selected')) return;

    cardElement.classList.add('selected');
    const slotIdx = selectedCards.length;
    selectedCards.push({ name: cardName, element: cardElement });

    const slot = document.getElementById(`slot-${slotIdx}`);
    const slotRect = slot.getBoundingClientRect();
    const deckRect = deckContainer.getBoundingClientRect();

    // Calculate exact screen coordinates
    const moveX = slotRect.left - (window.innerWidth / 2) + 35; 
    const moveY = slotRect.top - deckRect.top;

    cardElement.style.zIndex = 500 + slotIdx;
    cardElement.style.transform = `translate(${moveX}px, ${moveY}px) rotate(0deg) scale(1.1)`;
    
    if (selectedCards.length === 1) instructions.innerText = "Now, the Present...";
    if (selectedCards.length === 2) instructions.innerText = "And finally, the Future.";
    
    if (selectedCards.length === 3) {
        instructions.innerText = "The spirits are revealing your path...";
        setTimeout(revealAndPredict, 1000);
    }
}

function revealAndPredict() {
    selectedCards.forEach((item, i) => {
        setTimeout(() => {
            item.element.classList.add('is-flipped');
        }, i * 300);
    });

    setTimeout(() => {
        document.getElementById('prediction-modal').classList.remove('hidden');
        getAIPrediction();
    }, 1500);
}

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
