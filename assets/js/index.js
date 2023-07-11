//setting the types of players for each color
localStorage.setItem('white', 'player');
localStorage.setItem('black', 'player');
//dictates which color will start on top of the board
localStorage.setItem('topPosition', 'black');

//building the default dynamic settings when the page loads
window.onload = buildDynamicSettings('pvp');

/**
 * Creates 
 */
function buildDynamicSettings(playerType) {
    //finding the div to add the settings html to
    let dynamicDiv = document.getElementById('settings-dynamic');

    //the inner html that will be added to the div
    let newHtml = ``;

    switch (playerType) {
        case 'pvp':
            //updating the types of player that will be playing the game
            localStorage.setItem('white', 'player');
            localStorage.setItem('black', 'player');
            //adding name inputs for each of the players
            newHtml += optionPlayerName('Player 1 Name:', 'p1-name');
            newHtml += optionPlayerName('Player 2 Name:', 'p2-name');
            break;
        case 'pve':
            //updating the types of player that will be playing the game
            localStorage.setItem('white', 'player');
            localStorage.setItem('black', 'computer');
            //adding name inputs for the human player
            newHtml += optionPlayerName('Player Name:', 'p1-name');
            break;
        case 'eve':
            //updating the types of player that will be playing the game
            localStorage.setItem('white', 'computer');
            localStorage.setItem('black', 'computer');
            break;
    }

    //setting the 
    dynamicDiv.innerHTML = newHtml;
}

function optionPlayerName(innerText, inputId) {
    return `
    <label for="${inputId}">${innerText}</label>
    <input type="text" id="${inputId}" required>
    <br>
    `;
}