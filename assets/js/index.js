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
        localStorage.setItem('p1-name', 'Player 1');
        localStorage.setItem('p2-name', 'Player 2');
        //dictates which color will start on top of the board
        localStorage.setItem('topPosition', 'black');
        //which color the player will be when against a computer
        localStorage.setItem('playerColor', 'white');
        //special moves
        localStorage.setItem('pawnPromotion', 'all');
        localStorage.setItem("castling", 'enabled');
        localStorage.setItem('passant', 'enabled');
    }
    //getting what type of players will be playing the game
    let gameType = getGameType();

    //setting the select dropdown to display the correct game type
    let gameTypeInput = document.getElementById('settings-players');
    gameTypeInput.value = gameType;

    //building the dynamic html to be added to the settings
    buildDynamicSettings(gameType);
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

    //the inner html that will be added to the div
    let newHtml = ``;

    switch (playerType) {
        case 'pvp':
            //adding name inputs for each of the players
            newHtml += optionPlayerName('Player 1 Name:', 'p1-name');
            newHtml += optionPlayerName('Player 2 Name:', 'p2-name');
            newHtml += optionWhitePosition();
            break;
        case 'pve':
            //adding name inputs for the human player
            newHtml += optionPlayerName('Player Name:', 'p1-name');
            newHtml += optionPlayerColor();
            newHtml += optionWhitePosition();
            break;
        case 'eve':
            newHtml += optionWhitePosition();
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
 * Returns an HTML text input and it's label for setting a player name
 * @param {string} innerText The text the label will display
 * @param {string} inputId The ID of the input
 * @returns The HTML to create the input
 */
function optionPlayerName(innerText, inputId) {
    //the old player name will be displayed in the text bar
    let currentPlayerName = localStorage.getItem(inputId);
    return `
    <div>
        <label for="${inputId}">${innerText}</label>
        <input type="text" id="${inputId}" onchange="localStorage.setItem('${inputId}', value)" placeholder="${currentPlayerName}" required>
    </div>
    `;
}

/**
 * Returns an HTML radio option for setting the white pieces to either start on
 * the top or the bottom
 * @returns {string} The HTML to be added to the dynamic settings
 */
function optionWhitePosition() {
    let htmlString = `
    <div>
        Position of White:
        <input type="radio" name="white-pos" value="bottom" id="pos-bottom" class="clickable" onchange="updateWhitePosition(value)"
    `;
    //making the radio button checked if the white pieces are at the bottom
    if (localStorage.getItem('topPosition') === 'black') {
        htmlString += ` checked`;
    }
    //adding the second radio button
    htmlString += `>
        <label for="pos-bottom" class="clickable">Bottom</label>
        <input type="radio" name="white-pos" value="top" id="pos-top" class="clickable" onchange="updateWhitePosition(value)"
    `;
    //making the radio button checked if the white pieces are at the top
    if (localStorage.getItem('topPosition') === 'white') {
        htmlString += ` checked`;
    }
    htmlString += `>
        <label for="pos-top" class="clickable">Top</label>
    </div>`;

    return htmlString;
}

/**
 * Returns an HTML radio option for setting the player color to either white or black
 * @returns {string} The HTML to be added to the dynamic settings
 */
function optionPlayerColor() {
    let htmlString = `
    <div>
        Player Color:
        <input type="radio" name="player-color" value="white" id="col-white" class="clickable" onchange="updatePlayerColor('white')"
    `;
    //making the radio button checked if the white pieces are at the bottom
    if (localStorage.getItem('playerColor') === 'white') {
        htmlString += ` checked`;
    }
    //adding the second radio button
    htmlString += `>
        <label for="col-white" class="clickable">White</label>
        <input type="radio" name="player-color" value="black" id="col-black" class="clickable" onchange="updatePlayerColor('black')"
    `;
    //making the radio button checked if the white pieces are at the top
    if (localStorage.getItem('playerColor') === 'black') {
        htmlString += ` checked`;
    }
    htmlString += `>
        <label for="col-black" class="clickable">Black</label>
        <p class="small-text indented">Note: The player with the white pieces always starts first</p>
    </div>`;

    return htmlString;
}