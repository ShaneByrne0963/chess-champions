//how many hours can be set to the time limit
const maxHours = 9;
//The minimum amount of time limit a player can input, which is 30 seconds
const minTimeLimit = 30000;

//building the default dynamic settings when the page loads
window.onload = settingsInit();
/**
 * Runs on page load
 */
function settingsInit() {
    //setting the localStorage variables if they do not exist
    if (localStorage.getItem('white') === null) {
        //setting the types of players for each color
        localStorage.setItem('white', 'player');
        localStorage.setItem('black', 'player');
        //the names for each of the players
        localStorage.setItem('p1-name', '');
        localStorage.setItem('p2-name', '');
        //dictates which color will start on top of the board
        localStorage.setItem('topPosition', 'black');
        //which color the player will be when against a computer
        localStorage.setItem('playerColor', 'white');
        //setting the computer difficulties
        localStorage.setItem('difficulty1', 50);
        localStorage.setItem('difficulty2', 50);
        //for time limits in pvp games
        localStorage.setItem('timeLimit', 'disabled');
        localStorage.setItem('timeHours', '0');
        localStorage.setItem('timeMinutes', '20');
        localStorage.setItem('timeSeconds', '0');
        //special moves
        localStorage.setItem('pawnPromotion', 'any');
        localStorage.setItem("castling", 'enabled');
        localStorage.setItem('passant', 'enabled');
    }
    //getting what type of players will be playing the game and setting the player type dropdown's value to it
    let gameType = getGameType();
    let gameTypeInput = document.getElementById('settings-players');
    gameTypeInput.value = gameType;

    //preventing the enter key from submitting the form
    let form = document.getElementById('menu-settings');
    form.addEventListener('keypress', preventEnterSubmit);

    //building the dynamic html to be added to the settings
    buildDynamicSettings(gameType);
    //setting the advanced moves to what is in local storage
    updateAdvancedMoves();
}

/**
 * Gets the Type of game based on the number of human players
 * @returns {string} 'pvp', 'pve' or 'eve'
 */
function getGameType() {
    let humanPlayers = 0;
    let gameType = '';
    if (localStorage.getItem('white') === 'player') {
        humanPlayers++;
    } if (localStorage.getItem('black') === 'player') {
        humanPlayers++;
    }
    switch (humanPlayers) {
        case 0:
            gameType = 'eve';
            break;
        case 1:
            gameType = 'pve';
            break;
        case 2:
            gameType = 'pvp';
            break;
        default:
            throw `Error at settingsInit(): Invalid number of players ${humanPlayers}. Aborting..`;
    }
    return gameType;
}

/**
 * Creates a section of the game settings that depends on the type of players in the game
 * @param {string} playerType Can be 'pvp', 'pve' or 'eve'
 */
function buildDynamicSettings(playerType) {
    //updating the local storage variables to match the newly selected option
    updatePlayerVariables(playerType);

    //finding the div to add the settings html to
    let dynamicDiv = document.getElementById('settings-dynamic');
    //getting the play game button to change its text
    let playButton = document.getElementById('to-game').children[0];

    //the inner html that will be added to the div
    let newHtml = ``;

    switch (playerType) {
        case 'pvp':
            //adding name inputs for each of the players
            newHtml += optionPlayerName('Player 1 Name:', 'p1-name');
            newHtml += optionPlayerName('Player 2 Name:', 'p2-name');
            newHtml += optionWhitePosition();
            newHtml += optionTimer();
            playButton.innerText = 'Play Game!';
            break;
        case 'pve':
            //adding name inputs for the human player
            newHtml += optionPlayerName('Player Name:', 'p1-name');
            newHtml += optionPlayerColor();
            newHtml += optionWhitePosition();
            newHtml += optionDifficulty('Computer Difficulty:', 'difficulty1');
            playButton.innerText = 'Play Game!';
            break;
        case 'eve':
            newHtml += optionWhitePosition();
            newHtml += optionDifficulty('Computer 1 Difficulty:', 'difficulty1');
            newHtml += optionDifficulty('Computer 2 Difficulty:', 'difficulty2');
            playButton.innerText = 'Watch Game!';
            break;
    }
    //adding the new html to the dynamic div
    dynamicDiv.innerHTML = newHtml;
}

/**
 * Updates the local storage variables depending on the type of players in the game
 * @param {string} playerType Can be 'pvp', 'pve' or 'eve'
 */
function updatePlayerVariables(playerType) {
    switch (playerType) {
        case 'pvp':
            localStorage.setItem('white', 'player');
            localStorage.setItem('black', 'player');
            break;
        case 'pve':
            //changing sides depending on which color the user chooses
            if (localStorage.getItem('playerColor') === 'white') {
                localStorage.setItem('white', 'player');
                localStorage.setItem('black', 'computer');
            } else {
                localStorage.setItem('white', 'computer');
                localStorage.setItem('black', 'player');
            }
            break;
        case 'eve':
            localStorage.setItem('white', 'computer');
            localStorage.setItem('black', 'computer');
            break;
    }
}

/**
 * Updates the player name, ensuring it does not contain more than 10 characters
 * @param {string} id The id of the element that is running the function
 * @param {string} value The text that will be set to the player name
 */
function updatePlayerName(id, value) {
    if (value.length <= 10) {
        localStorage.setItem(id, value);
    } else {
        alert("Sorry, but the name cannot be longer than 10 characters!");
        //resetting the input
        let playerElement = document.getElementById(id);
        playerElement.value = '';
    }
}

/**
 * Sets the advanced move inputs to what is read in local storage
 */
function updateAdvancedMoves() {
    //sets the select input for pawn promotion to what's been previously selected
    let pawnPromotionDiv = document.getElementById('pawn-promotion');
    pawnPromotionDiv.value = localStorage.getItem('pawnPromotion');

    //updating the castling checkbox
    let castlingDiv = document.getElementById('castling');
    //only checking if castling is disabled as the checkbox is enabled by default
    if (localStorage.getItem('castling') === 'disabled') {
        castlingDiv.checked = false;
    }

    //updating the pawn passant checkbox
    let passantDiv = document.getElementById('en-passant');
    //only checking if castling is disabled as the checkbox is enabled by default
    if (localStorage.getItem('passant') === 'disabled') {
        passantDiv.checked = false;
    }
}

/**
 * Changes the pawn promotion setting in local storage
 * @param {string} value The value to be set 'any' or 'dead'
 */
function updatePawnPromotion(value) {
    localStorage.setItem('pawnPromotion', value);
}

/**
 * Sets the castling value in local storage
 * @param {boolean} value true if enabled, false if disabled
 */
function updateCastling(value) {
    if (value) {
        localStorage.setItem('castling', 'enabled');
    } else {
        localStorage.setItem('castling', 'disabled');
    }
}

/**
 * Sets the en passant value in local storage
 * @param {boolean} value true if enabled, false if disabled
 */
function updateEnPassant(value) {
    if (value) {
        localStorage.setItem('passant', 'enabled');
    } else {
        localStorage.setItem('passant', 'disabled');
    }
}

/**
 * Enables the time limit feature for pvp games, also enabling the number inputs to choose the time limit
 * @param {boolean} value If the time limit is enabled or disabled
 */
function updateTimeCheckbox(value) {
    if (value) {
        localStorage.setItem('timeLimit', 'enabled');
    } else {
        localStorage.setItem('timeLimit', 'disabled');
    }
    //enabling or disabling the inputs to get the time limit,
    //depending on if the user wants a time limit in the game
    let hoursInput = document.getElementById('hours');
    let minutesInput = document.getElementById('minutes');
    let secondsInput = document.getElementById('seconds');
    hoursInput.disabled = !value;
    minutesInput.disabled = !value;
    secondsInput.disabled = !value;
}

/**
 * Sets the time limit 
 */
function updateTimeValues(timeType, value) {
    //manipulating the other elements in case the input is lower than the min or higher than the max
    let hoursPrev = parseInt(localStorage.getItem('timeHours'));
    let minutesPrev = parseInt(localStorage.getItem('timeMinutes'));
    let secondsPrev = parseInt(localStorage.getItem('timeSeconds'));
    let input = parseInt(value);
    //setting the right type to the input
    switch (timeType) {
        case 'hours':
            hoursPrev = input;
            break;
        case 'minutes':
            minutesPrev = input;
            break;
        case 'seconds':
            secondsPrev = input;
            break;
    }
    //converting the times to milliseconds and back again to hms if the minutes or seconds are not between 0 and 59
    let timeMilliseconds = timer.getMilliseconds(hoursPrev, minutesPrev, secondsPrev);
    //the time limit is not allowed to go above this value
    let maxMilliseconds = timer.getMilliseconds(maxHours, 59, 59);
    let finalTime;
    if (timeMilliseconds > maxMilliseconds) {
        //if the input is over the max time, then set the values to the max time
        finalTime = timer.getHMS(maxMilliseconds);
    } else if (timeMilliseconds < minTimeLimit) {
        //if the input is under the min time, then set the values to the min time
        finalTime = timer.getHMS(minTimeLimit);
    } else {
        //converting the milliseconds back to hours, minutes and seconds
        finalTime = timer.getHMS(timeMilliseconds);
    }
    //updating all of the inputs
    localStorage.setItem('timeHours', finalTime.hours);
    localStorage.setItem('timeMinutes', finalTime.minutes);
    localStorage.setItem('timeSeconds', finalTime.seconds);
    //setting the values in the number inputs to the correct values
    document.getElementById('hours').value = finalTime.hours;
    document.getElementById('minutes').value = finalTime.minutes;
    document.getElementById('seconds').value = finalTime.seconds;
}

/**
 * Sets which side the white pieces will start on, either top or bottom
 * @param {string} value Either 'top' or 'bottom'
 */
function updateWhitePosition(value) {
    if (value === 'bottom') {
        localStorage.setItem('topPosition', 'black');
    } else {
        localStorage.setItem('topPosition', 'white');
    }
}

/**
 * Sets what color the player will start with
 * @param {string} value Either 'black' or 'white'
 */
function updatePlayerColor(value) {
    //this variable will be used to keep the player color even when the user switches game types
    localStorage.setItem('playerColor', value);
    let oppositeColor = (value === 'white') ? 'black' : 'white';

    //setting the player types to the appropriate colors
    localStorage.setItem(value, 'player');
    localStorage.setItem(oppositeColor, 'computer');
}

/**
 * Updates the difficulty of a computer player
 * @param {string} id The id of the input element
 * @param {integer} value The value to set the difficulty to
 */
function updateDifficulty(id, value) {
    //the difficulty setting has 2 different ways to set the input: using a number and using the range slider
    //we will get both of these to change their values
    let numberInput = document.getElementById(id + '-number');
    let rangeInput = document.getElementById(id + '-range');

    if (value > 100) {
        value = 100;
    } else if (value < 0) {
        value = 0;
    }
    //updating the values of both inputs and setting it in local storage
    numberInput.value = value;
    rangeInput.value = value;
    localStorage.setItem(id, value);
}

/**
 * Returns an HTML text input and it's label for setting a player name
 * @param {string} innerText The text the label will display
 * @param {string} inputId The ID of the input
 * @returns The HTML to create the input
 */
function optionPlayerName(innerText, inputId) {
    //the old player name will be displayed in the text bar
    let currentPlayerName = localStorage.getItem(inputId);
    let inputType = 'value'; //autofills the name input if a name was already put in
    if (currentPlayerName === '') {
        //setting the placeholder if the name is empty
        inputType = 'placeholder';
        let playerNumber = inputId[1]; //is either 1 or 2
        currentPlayerName = 'Player ' + playerNumber;
    }

    return `
    <div class="input-right input-gap">
        <label for="${inputId}">${innerText}</label>
        <input type="text" id="${inputId}" onchange="updatePlayerName('${inputId}', value)" ${inputType}="${currentPlayerName}" required>
    </div>
    `;
}

/**
 * Returns an HTML number input, it's label and a slider underneath for setting a computer's difficulty
 * @param {string} innerText The text the label will display
 * @param {string} inputId The ID of the input
 * @returns The HTML to create the input
 */
function optionDifficulty(innerText, inputId) {
    //getting the previously inputted difficulty to set the default value of the inputs to
    let currentDiff = localStorage.getItem(inputId);
    return `
    <div class="input-right">
        <label for="${inputId}-number">${innerText}</label>
        <div class="text-right">
            <input type="number" id="${inputId}-number" class="text-right" onchange="updateDifficulty('${inputId}', value)" value="${currentDiff}" min="0" max="100" required>
        </div>
    </div>
    <input type="range" id="${inputId}-range" class="input-gap" onchange="updateDifficulty('${inputId}', value)" min="0" max="100" value="${currentDiff}">
    `;
}

/**
 * Returns an HTML radio option for setting the white pieces to either start on
 * the top or the bottom
 * @returns {string} The HTML to be added to the dynamic settings
 */
function optionWhitePosition() {
    let htmlString = `
    <div class="input-right input-gap">
        <p>Position of White:</p>
        <div class="text-right">
            <input type="radio" name="white-pos" value="bottom" id="pos-bottom" class="clickable indented" onchange="updateWhitePosition(value)"
    `;
    //making the radio button checked if the white pieces are at the bottom
    if (localStorage.getItem('topPosition') === 'black') {
        htmlString += ` checked`;
    }
    //adding the second radio button
    htmlString += ` required>
            <label for="pos-bottom" class="clickable small-text">Bottom</label>
            <input type="radio" name="white-pos" value="top" id="pos-top" class="clickable" onchange="updateWhitePosition(value)"
    `;
    //making the radio button checked if the white pieces are at the top
    if (localStorage.getItem('topPosition') === 'white') {
        htmlString += ` checked`;
    }
    htmlString += `>
            <label for="pos-top" class="clickable small-text">Top</label>
        </div>
    </div>`;

    return htmlString;
}

/**
 * Returns an HTML radio option for setting the player color to either white or black
 * @returns {string} The HTML to be added to the dynamic settings
 */
function optionPlayerColor() {
    let htmlString = `
    <div class="input-right">
        <p>Player Color:</p>
        <div class="text-right">
            <input type="radio" name="player-color" value="white" id="col-white" class="clickable indented" onchange="updatePlayerColor('white')"
    `;
    //making the radio button checked if the white pieces are at the bottom
    if (localStorage.getItem('playerColor') === 'white') {
        htmlString += ` checked`;
    }
    //adding the second radio button
    htmlString += ` required>
            <label for="col-white" class="clickable small-text">White</label>
            <input type="radio" name="player-color" value="black" id="col-black" class="clickable" onchange="updatePlayerColor('black')"
    `;
    //making the radio button checked if the white pieces are at the top
    if (localStorage.getItem('playerColor') === 'black') {
        htmlString += ` checked`;
    }
    htmlString += `>
            <label for="col-black" class="clickable small-text">Black</label>
        </div>
    </div>
    <p class="small-text input-gap">*Note: The player with the white pieces always starts first</p>`;

    return htmlString;
}

/**
 * Returns an HTML checkbox and trio of number inputs to allow a time limit for pvp games
 * @returns {string} The HTML to be added to the dynamic settings
 */
function optionTimer() {
    let htmlString = `
    <div class="input-right input-gap">
        <div>
            <input type="checkbox" id="has-timer" onchange="updateTimeCheckbox(checked)"`;
    //enabling the checkbox if the saved time limit option is enabled
    if (localStorage.getItem('timeLimit') === 'enabled') {
        htmlString += ` checked`;
    }
    htmlString += `>
            <label for="has-timer">Time Limit:</label>
        </div>
        <div class="text-right">
            <input type="number" value="${localStorage.getItem('timeHours')}" id="hours"
            class="text-right" min="0" max="9" onchange="updateTimeValues('hours', value)"`;
    //making the number input disabled if the time limit checkbox is not checked
    if (localStorage.getItem('timeLimit') === 'disabled') {
        htmlString += ` disabled`;
    }
    htmlString += `>
            <label for="hours" class="small-text">Hours</label>
            <input type="number" value="${localStorage.getItem('timeMinutes')}" id="minutes"
            class="text-right" onchange="updateTimeValues('minutes', value)"`;
    //making the number input disabled if the time limit checkbox is not checked
    if (localStorage.getItem('timeLimit') === 'disabled') {
        htmlString += ` disabled`;
    }
    htmlString += `>
            <label for="minutes" class="small-text">Minutes</label>
            <input type="number" value="${localStorage.getItem('timeSeconds')}" id="seconds"
            class="text-right" onchange="updateTimeValues('seconds', value)"`;
    //making the number input disabled if the time limit checkbox is not checked
    if (localStorage.getItem('timeLimit') === 'disabled') {
        htmlString += ` disabled`;
    }
    htmlString += `>
            <label for="seconds" class="small-text">Seconds</label>
        </div>
    </div>
    `;
    return htmlString;
}

/**
 * Goes to the game page, if all the required inputs are filled
 * @param {object} event The event the user caused. In this case it is clicking the form submission button (Play game)
 */
function playGame(event) {
    event.preventDefault();
    window.location.href = "game.html";
}

/**
 * Used to prevent the form from submitting when the user presses enter
 */
function preventEnterSubmit(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
    }
}