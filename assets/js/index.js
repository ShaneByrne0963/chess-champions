window.onload = buildDynamicSettings('pvp');

function buildDynamicSettings(playerType) {
    //finding the div to add the settings html to
    let dynamicDiv = document.getElementById('settings-dynamic');

    //the inner html that will be added to the div
    let newHtml = ``;

    switch (playerType) {
        case 'pvp':
            newHtml += optionPlayerName('Player 1 Name:', 'p1-name');
            newHtml += optionPlayerName('Player 2 Name:', 'p2-name');
            break;
        case 'pve':
            newHtml += optionPlayerName('Player Name:', 'p1-name');
            break;
        case 'eve':
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