const puzzleCharCounts = new Map();
const board = document.getElementById('game-board');
const input = document.getElementById('word-input')
const submitButton = document.getElementById('submit-button');
const guessesDiv = document.getElementById('guesses');
const initialDate = '2023-01-01';
let guesses = [];
let words = [];
let seeds = [];
let answers = [];
let answer = "";
let puzzle = "";


function shuffle(guesses, index) {
    const saved = guesses[index]; // Store the element at the specified index
    const remaining = guesses.filter((_, i) => i !== index); // Get the remaining elements
    const shuffled = remaining.sort(() => Math.random() - 0.5); // Shuffle the remaining elements
    const middleIndex = Math.floor(shuffled.length / 2); // Calculate the middle index
  
    // Insert the saved element in the middle of the shuffled array
    const result = [
      ...shuffled.slice(0, middleIndex),
      saved,
      ...shuffled.slice(middleIndex)
    ];
  
    return result;
  }

function getDaysElapsed(arbitraryDate) {
    const currentDate = new Date();
    const pastDate = new Date(arbitraryDate);
    const timeDifference = currentDate.getTime() - pastDate.getTime();
    const daysElapsed = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return daysElapsed;
}

function getSavedGuesses() {
    const savedGuesses = JSON.parse(localStorage.getItem('savedGuesses'));
    return savedGuesses
}

function setSavedGuesses(guesses) {
    localStorage.setItem('savedGuesses', JSON.stringify(guesses));
}

function generatePuzzle() {
    const lastElapsed = localStorage.getItem('lastElapsed');
    const elapsed = getDaysElapsed(initialDate).toString();
    if (lastElapsed === elapsed) {
        let savedGuesses = getSavedGuesses();
        console.log(savedGuesses);
        if (savedGuesses !== null) {
            guesses = savedGuesses;
            updateGuessDisplay(guesses);
        }
    } else {
        setSavedGuesses([]);
        localStorage.setItem('lastElapsed', elapsed);
    }

    const index = elapsed % seeds.length;
    answer = seeds[index];
    puzzle = shuffle(answer.split(""), elapsed % answer.length).join("");
    for (let index = 0; index < board.children.length; index++) {
        const element = board.children[index];
        element.innerHTML = puzzle.charAt(index).toUpperCase()
        
    }
    // store # of occurances of each character in the puzzle
    for (let i = 0; i < puzzle.length; i++) {
        const char = puzzle.charAt(i);
        puzzleCharCounts.set(char, (puzzleCharCounts.get(char) || 0) + 1);
    }

}


function isValidGuess(string) {
    const guess = string.toLowerCase();
    // Check if the guess has already been accepted
    if (guesses.includes(guess)) {
        return false;
    }

    // Check that each character is in the puzzle a legal number of times
    for (let i = 0; i < guess.length; i++) {
        const char = guess.charAt(i);
        
        // Check if the current character is not present in the puzzleString
        if (!puzzleCharCounts.has(char)) {
            return false;
        }

        // Check if the count of the current characer is valid
        const countGuess = guess.split(char).length - 1;
        const countPuzzle = puzzleCharCounts.get(char);
        if (countGuess > countPuzzle) {
            return false;
        }
    }

    // Check if the 'magic' character is present in the guess
    const isPresent = guess.includes(puzzle.charAt(4))
    if (!isPresent) {
        return false;
    }

    // Check if the guess is a valid word
    const isValid = words.includes(guess);
    if (isValid) {
        return true;
    } 
    else {
        return false;
    }

}

const updateGuessDisplay = function(guesses) {
    guessesDiv.children[0].innerText = [...guesses].join(", ");
}

const checkGuess = function(event) {
    event.preventDefault();
    const userInput = input.value;
    clearError();
    if (isValidGuess(userInput)) {
        guesses.push(userInput.toLowerCase());
        setSavedGuesses(guesses);
        updateGuessDisplay(guesses);
        updateProgressBar();
    } else if (userInput.length > 0) {
        showError();
    }
    document.getElementById('word-input').value = '';
    input.focus({preventScroll: true});
}


const showError = () => {
    input.classList.add('error');
}


const clearError = () => {
    input.classList.remove('error');
}

const updateProgressBar = () => {
    var container = document.querySelector('.progress-container');
    var progress = document.querySelector('.progress');
    var progressBar = document.querySelector('.progress-bar');
    var progressGoal = document.querySelector('.progress-goal');
    var progressValue = document.querySelector('.progress-value');
    progress.style.width = Math.floor(100 * (guesses.length / answers.length)) + '%';
    container.title = guesses.length + " / " + answers.length;
    progressGoal.innerText = answers.length;
    progressValue.innerText = guesses.length;
    if (guesses.length === answers.length) {
        progress.classList.add('complete')
    }
}


async function loadWords() {
    let response
    try {
        response = await fetch('words.json');
        words = await response.json();
        response = await fetch('seeds.json');
        seeds = await response.json();
        generatePuzzle();
        await fetch('answers.json')
            .then(response => response.json())
            .then(data => {
                answers = data[answer].filter(word => word.includes(answer.charAt(4)));
                answers.push(answer);
            })
            .then(()=> updateProgressBar());

    } catch (error) {
        console.error('Error:', error);
    }
}


function setUp() {
    // load the word and seed list from their json files
    loadWords();
    submitButton.addEventListener('click', checkGuess);
    input.addEventListener('keydown', clearError);
    document.addEventListener('mousedown', clearError);

    let tiles = document.querySelectorAll(".box");

    tiles.forEach(el => {
        let isClicked = false;
        el.addEventListener('click', () => {
            const userInput = document.getElementById('word-input');
            userInput.value += el.textContent.toLowerCase();
        });
        el.addEventListener('mousedown', () => {
            clearError();
            isClicked = true;
            el.classList.add('clicked');
        });
        el.addEventListener('mouseup', () => {
            isClicked = false;
            el.classList.remove('clicked');
        });
        el.addEventListener('mouseenter', () => {
            if (isClicked) {
                el.classList.add('clicked');
            }
        });
        el.addEventListener('mouseleave', () => {
            if (!isClicked) {
                el.classList.remove('clicked');
            }
        });
    });

    document.addEventListener('mouseup', () => {
        tiles.forEach(el => {
          if (el.classList.contains('clicked')) {
            el.classList.remove('clicked');
          }
        });
      });

    document.addEventListener('keyup', (e) => {
        let key = String(e.key);
        if (key === 'Enter') {
            checkGuess(e);
            return;
        }
    });
}


window.onload = setUp;
