// ==========================================
// 1. LEARNER MODEL (Data Schema & State)
// ==========================================
let learnerModel = {
    currentIndex: 0,
    streak: 0,
    masteryScore: 0,
    misconceptions: [],
    hintsUsedOnCurrent: 0,
    errorsOnCurrent: 0
};

// Load saved progress from browser storage (simulating a database)
if (localStorage.getItem('mathLearnerModel')) {
    learnerModel = JSON.parse(localStorage.getItem('mathLearnerModel'));
}

// ==========================================
// 2. CURRICULUM DATA (Content & Logic)
// ==========================================
const curriculumData = [
    // --- SUBTOPIC 1: Welcome to the Negative Zone ---
    {
        id: "1.1",
        title: "1.1 The Boundary of Zero",
        content: "<p>You know the counting numbers: 1, 2, 3... and you know 0. But what if 0 isn't the end? What if it's a doorway?</p><p>Numbers extend in <b>two</b> directions. A number with a minus sign (−) is a <b>negative number</b>. It represents a value less than zero.</p><p><b>🔑 Key Insight:</b> Zero is special. It is <b>neither positive nor negative</b>. Think of 0 as the neutral boundary between both worlds.</p>",
        assessment: {
            question: "Which of the following statements about the number 0 is true?",
            options: [
                { text: "It is a positive number.", isCorrect: false, misconception: "M3" },
                { text: "It is a negative number.", isCorrect: false, misconception: "M3" },
                { text: "It is both positive and negative.", isCorrect: false, misconception: "M3" },
                { text: "It is neither positive nor negative.", isCorrect: true, misconception: null }
            ],
            hints: [
                "Think about 0 as the exact middle point between the two sides.",
                "Positive numbers have a '+' sign, and negative numbers have a '−' sign. Does 0 have a sign?",
                "Since 0 is exactly in the center, it doesn't belong to either team.",
                "Zero is the boundary. It is neither positive nor negative. Choose the last option."
            ],
            remediation: "<b>Misconception Detected:</b> You treated zero as a positive or negative number. Remember, zero is the freezing point of water (0°C). It is neither 'hot' (positive) nor 'cold' (negative). It is the exact boundary!"
        }
    },
    {
        id: "1.2",
        title: "1.2 The Vertical Number Line",
        content: "<p>Welcome to <b>Bela's Building of Fun!</b></p><p>The ground floor is Floor 0. The elevator has two buttons: '+' to go up, and '−' to go down.</p><ul><li><b>Going Up (+):</b> Floors above ground are positive (+2 goes to the Art Centre).</li><li><b>Going Down (−):</b> Floors below ground are negative (−2 goes to the Video Games shop!).</li></ul>",
        assessment: {
            question: "You are in the Welcome Hall (Floor 0). You want to go to the Dinosaur Museum, which is 4 floors underground. What button do you press?",
            options: [
                { text: "+4", isCorrect: false, misconception: "M4" },
                { text: "−4", isCorrect: true, misconception: null },
                { text: "0", isCorrect: false, misconception: null },
                { text: "−3", isCorrect: false, misconception: null }
            ],
            hints: [
                "Are you going up above the ground, or down below the ground?",
                "Going underground uses negative (−) numbers.",
                "You are starting at 0 and going down 4 floors.",
                "Underground floors are negative. Moving down 4 floors from 0 takes you to Floor −4."
            ],
            remediation: "<b>Wait!</b> You chose a positive number (+4). Positive numbers take you UP into the sky. To go underground, you must use negative numbers!"
        }
    },
    // --- SUBTOPIC 2: Integers in the Wild ---
    {
        id: "2.1",
        title: "2.1 City Climates (Temperature)",
        content: "<p>When we measure temperature in Celsius, 0°C is where water turns into ice.</p><p>Anything above zero is warm. But in places like Leh in Ladakh, the temperature drops below freezing! <b>−4°C</b> means it is 4 degrees colder than freezing.</p>",
        assessment: {
            question: "The city was 5°C in the evening. By midnight, it dropped by 8 degrees. What is the temperature at midnight?",
            options: [
                { text: "13°C", isCorrect: false, misconception: "M4" },
                { text: "3°C", isCorrect: false, misconception: null },
                { text: "−3°C", isCorrect: true, misconception: null },
                { text: "−8°C", isCorrect: false, misconception: null }
            ],
            hints: [
                "If the temperature 'drops', which direction are you moving on the thermometer?",
                "You are starting at 5 and going down. If you go down 5 degrees, you hit 0.",
                "5 minus 5 gets you to 0. How many more do you need to drop to reach a total drop of 8?",
                "5 - 5 = 0. You still have 3 more degrees to drop. 0 - 3 = −3."
            ],
            remediation: "<b>Misconception:</b> You added the numbers together! When temperature 'drops', you are moving down (subtracting), not up."
        }
    }
    // Note: You can easily add the objects for Subtopics 3, 4, and 5 here following the exact same format!
];

// ==========================================
// 3. ADAPTIVE DECISION ENGINE & UI LOGIC
// ==========================================

function updateDashboard() {
    document.getElementById('ui-streak').innerText = learnerModel.streak;
    document.getElementById('ui-mastery').innerText = Math.round((learnerModel.currentIndex / curriculumData.length) * 100) + "%";
    document.getElementById('ui-misconceptions').innerText = learnerModel.misconceptions.length > 0 ? learnerModel.misconceptions.join(', ') : "None";
    localStorage.setItem('mathLearnerModel', JSON.stringify(learnerModel));
}

function loadConcept() {
    if (learnerModel.currentIndex >= curriculumData.length) {
        document.getElementById('learning-section').innerHTML = "<h2>🎉 Course Complete!</h2><p>You are a Master of the Negative Zone!</p>";
        document.getElementById('assessment-section').classList.add('hidden');
        return;
    }

    const current = curriculumData[learnerModel.currentIndex];
    learnerModel.hintsUsedOnCurrent = 0;
    learnerModel.errorsOnCurrent = 0;

    // Load UI
    document.getElementById('concept-title').innerText = current.title;
    document.getElementById('concept-content').innerHTML = current.content;
    document.getElementById('question-text').innerText = current.assessment.question;
    document.getElementById('hint-text').classList.add('hidden');
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; // Clear old options

    current.assessment.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.text;
        btn.onclick = () => checkAnswer(opt, btn);
        optionsContainer.appendChild(btn);
    });

    updateDashboard();
}

function checkAnswer(option, buttonElement) {
    const current = curriculumData[learnerModel.currentIndex];

    // Disable buttons after guess
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);

    if (option.isCorrect) {
        buttonElement.classList.add('correct');
        learnerModel.streak++;
        
        // Advance to next concept after a short delay
        setTimeout(() => {
            learnerModel.currentIndex++;
            loadConcept();
        }, 1500);

    } else {
        buttonElement.classList.add('wrong');
        learnerModel.streak = 0;
        learnerModel.errorsOnCurrent++;

        // Track Misconceptions (Pedagogical Logic)
        if (option.misconception && !learnerModel.misconceptions.includes(option.misconception)) {
            learnerModel.misconceptions.push(option.misconception);
        }

        // Trigger Remediation if struggling
        if (learnerModel.errorsOnCurrent >= 1) {
            triggerRemediation(current.assessment.remediation);
        } else {
            // Let them try again
            setTimeout(() => {
                document.querySelectorAll('.option-btn').forEach(b => {
                    b.disabled = false;
                    b.classList.remove('wrong');
                });
            }, 1500);
        }
    }
    updateDashboard();
}

function requestHint() {
    const current = curriculumData[learnerModel.currentIndex];
    const hintBox = document.getElementById('hint-text');
    
    if (learnerModel.hintsUsedOnCurrent < current.assessment.hints.length) {
        hintBox.innerText = "💡 Hint: " + current.assessment.hints[learnerModel.hintsUsedOnCurrent];
        hintBox.classList.remove('hidden');
        learnerModel.hintsUsedOnCurrent++;
        
        // Pedagogical Logic: Using too many hints breaks the streak (indicates non-fluency)
        if (learnerModel.hintsUsedOnCurrent >= 3) {
            learnerModel.streak = 0;
            updateDashboard();
        }
    } else {
        hintBox.innerText = "You've used all the hints! Give it your best guess.";
    }
}

function triggerRemediation(text) {
    document.getElementById('remediation-text').innerHTML = text;
    document.getElementById('remediation-modal').classList.remove('hidden');
}

function closeRemediation() {
    document.getElementById('remediation-modal').classList.add('hidden');
    // Reset buttons to try again
    document.querySelectorAll('.option-btn').forEach(b => {
        b.disabled = false;
        b.classList.remove('wrong');
    });
}

function resetProgress() {
    localStorage.removeItem('mathLearnerModel');
    location.reload();
}

// Initialize the app
loadConcept();
