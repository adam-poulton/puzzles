const puzzleCharCounts = new Map();
const board = document.getElementById('game-board');
const submitButton = document.getElementById('submit-button');
const guessesDiv = document.getElementById('guesses');
const guesses = [];
let words = [];
let seeds = [];
let answer = "";
let puzzle = "";


function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
  
    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
  
    return array;
}


function generatePuzzle() {
    puzzle = shuffle(seeds[Math.floor(Math.random() * seeds.length)].split("")).join("");
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


const checkGuess = function(event) {
    event.preventDefault();
    const input = document.getElementById('word-input');
    const userInput = input.value;

    if (isValidGuess(userInput)) {
        document.getElementById('word-input').value = '';
        guesses.push(userInput.toLowerCase());
        guessesDiv.children[0].innerText = [...guesses].join(", ")
    }
    input.focus({preventScroll: true});
}






async function loadWords() {
    let response;
    try {
        response = await fetch('words.json');
        words = await response.json();
        response = await fetch('seeds.json');
        seeds = await response.json();
        generatePuzzle();
    } catch (error) {
        console.error('Error:', error)
    }
}

function setUp() {
    // load the word and seed list from their json files
    loadWords();
    submitButton.addEventListener('click', checkGuess);

    let tiles = document.querySelectorAll(".box");

    tiles.forEach(el => {
        let isClicked = false;
        el.addEventListener('click', () => {
            const userInput = document.getElementById('word-input');
            userInput.value += el.textContent.toLowerCase();
        });
        el.addEventListener('mousedown', () => {
            isClicked = true;
            el.classList.add('clicked');
        });
        el.addEventListener('mouseup', () => {
            isClicked = false;
            el.classList.remove('clicked');
        });
        el.addEventListener('mouseenter', () => {
            isMouseOver = true;
            if (isClicked) {
                el.classList.add('clicked');
            }
        });
        el.addEventListener('mouseleave', () => {
            isMouseOver = false;
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
    })
}

window.onload = setUp;
