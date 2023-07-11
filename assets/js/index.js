//building the default dynamic settings when the page loads
window.onload = settingsInit;

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
    }
    buildDynamicSettings('pvp');
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
            newHtml += optionWhitePosition();
            break;
        case 'eve':
            newHtml += optionWhitePosition();
            break;
    }

    //setting the 
    dynamicDiv.innerHTML = newHtml;
}

/**
 * Updates the local storage variables depending on the type of players in the game
 * @param {string} playerType Can be 'pvp', 'pve' or 'eve'
 */
function updatePlayerVariables(playerType) {
    switch (playerType) {
        case 'pvp':
            //updating the types of player that will be playing the game
            localStorage.setItem('white', 'player');
            localStorage.setItem('black', 'player');
            break;
        case 'pve':
            //updating the types of player that will be playing the game
            localStorage.setItem('white', 'player');
            localStorage.setItem('black', 'computer');
            //updating the name of the computer player
            localStorage.setItem('p2-name', 'Chess Bot');
            break;
        case 'eve':
            //updating the types of player that will be playing the game
            localStorage.setItem('white', 'computer');
            localStorage.setItem('black', 'computer');
            //updating the name of both computer players
            localStorage.setItem('p1-name', 'Chess Bot 1');
            localStorage.setItem('p2-name', 'Chess Bot 2');
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
 * Returns an HTML text input and it's label for setting a player name
 * @param {string} innerText The text the label will display
 * @param {string} inputId The ID of the input
 * @returns The HTML to create the input
 */
function optionPlayerName(innerText, inputId) {
    //the old player name will be displayed in the text bar
    let currentPlayerName = localStorage.getItem(inputId);
    return `
    <label for="${inputId}">${innerText}</label>
    <input type="text" id="${inputId}" onchange="localStorage.setItem('${inputId}', value)" placeholder="${currentPlayerName}" required>
    <br>
    `;
}

/**
 * Returns an HTML radio option for setting the white pieces to either start on
 * the top or the bottom
 */
function optionWhitePosition() {
    let htmlString = `
    Position of White:
    <input type="radio" name="white-pos" value="bottom" id="pos-bottom" onchange="updateWhitePosition(value)"`;
    //making the radio button checked if the white pieces are at the bottom
    if (localStorage.getItem('topPosition') === 'black') {
        htmlString += ` checked`;
    }
    htmlString += `>
    <label for="pos-bottom">Bottom</label>
    <input type="radio" name="white-pos" value="top" id="pos-top" onchange="updateWhitePosition(value)"`;
    //making the radio button checked if the white pieces are at the top
    if (localStorage.getItem('topPosition') === 'white') {
        htmlString += ` checked`;
    }
    htmlString += `>
    <label for="pos-top">Top</label>
    `;

    return htmlString;
}