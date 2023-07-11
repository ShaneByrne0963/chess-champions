//setting the types of players for each color
localStorage.setItem('white', 'player');
localStorage.setItem('black', 'player');
//the names for each of the players
localStorage.setItem('p1-name', 'Player 1');
localStorage.setItem('p2-name', 'Player 2');
//dictates which color will start on top of the board
localStorage.setItem('topPosition', 'black');

//building the default dynamic settings when the page loads
window.onload = buildDynamicSettings('pvp');

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
            break;
        case 'pve':
            //adding name inputs for the human player
            newHtml += optionPlayerName('Player Name:', 'p1-name');
            break;
        case 'eve':
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
 * Returns an HTML text input and it's label for setting a player name
 * @param {*} innerText The text the label will display
 * @param {*} inputId The ID of the input
 * @returns The HTML to create the input
 */
function optionPlayerName(innerText, inputId) {
    return `
    <label for="${inputId}">${innerText}</label>
    <input type="text" id="${inputId}" onchange="localStorage.setItem('${inputId}', value)" required>
    <br>
    `;
}