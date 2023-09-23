//constants
const boardSize = 8; //the width and height of the board in terms of tiles
const animationTime = 500; //the amount of time the animation takes to move from one tile to another, in milliseconds
//the maximum number of announcements that can be displayed. when this limit is reached the oldest will be destroyed
const announcementLimit = 10;
//the time it takes for an ai to make its move
const aiDelay = 1000;
//how long the checkmate banner appears on screen before removing itself
const checkmateBannerTime = 5000;
//how long it takes to alternate the piece revive flash animation
const flashTime = 500;

//initializes game when the page loads
document.onload = gameInit();
//clearing all intervals when leaving the page
window.addEventListener('onbeforeunload', clearIntervals);
//calling the screen resize function every time the screen size changes
window.addEventListener('resize', resizeScreen);

/**
 * Creates the chess tiles and then starts the game
 */
function gameInit() {
    //setting the player names in the player ui
    setPlayerNames();
    //organizing the elements depending on the screen size
    resizeScreen();

    //Setting up the chess board tiles
    let chessBoard = document.getElementById("chess-board");
    let chessGrid = ``;
    let isWhite = true;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let tileClass;
            //alternating between light and dark tiles
            if (isWhite) {
                tileClass = 'tile-light';
            }
            else {
                tileClass = 'tile-dark';
            }
            //creating the tile div
            chessGrid += `
            <div id="tile-${j}-${i}" class="tile ${tileClass}" onclick="tileClick(${j}, ${i});"></div>`;
            //reverses the tile order
            isWhite = !isWhite;
        }
        //reverses the tile order again after each row
        isWhite = !isWhite;
    }
    //adding what is already in the chess-board element (which is the banner HTML) to the new innerHTML
    chessGrid += chessBoard.innerHTML;
    
    chessBoard.innerHTML = chessGrid;
    startGame();
}

/**
 * Places the chess pieces in their starting positions on the board
 */
function startGame() {
    //player1 always starts first
    setPlayerTurn(1);

    //resetting everything that can be changed during the previous game
    pieceAnimation.clear();
    clearAnnouncements();
    removeBanner();
    tile.removeAllInteraction();
    pieceMovement.clearDelay();
    timer.clear();
    tile.deselectAll();
    tile.clearAll();
    graveyard.clearAll();

    //resetting the time limits for each player if applicable
    if (getHumanPlayers() === 2 && localStorage.getItem('timeLimit') === 'enabled') {
        timer.init();
    }

    //iterating through every tile on the board to create chess pieces where necessary
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let tileElement = tile.getElement(i, j);
            //finding what piece and color belongs on this tile
            let tilePiece = getStartingPiece(i, j);
            
            //creating a piece when it should be created
            if (tilePiece.piece != '' && tilePiece.color != '') {
                chessPiece.create(tileElement, tilePiece.piece, tilePiece.color);
            }
        }
    }
    //allow the player to make it's move, whether it is a player or computer
    allowTurn('white');
}

/**
 * Rearranges some of the elements depending on the screen size
 */
function resizeScreen() {
    let width = window.innerWidth;

    //swapping the announcements element between the ui section and the game section
    let announceUI = document.getElementById('announce-ui');
    let announceGame = document.getElementById('announce-game');
    let announceDiv = document.getElementById('announcements');
    if (width >= 1400) {
        announceUI.appendChild(announceDiv);
    } else {
        announceGame.appendChild(announceDiv);
    }

    //moving the player turn heading above the chess board
    let turnUi = document.getElementById('player-turn');
    let turnGame = document.getElementById('turn-game');
    let turnHeading = document.getElementById('turn-heading');
    if (width >= 800) {
        turnUi.appendChild(turnHeading);
    } else {
        turnGame.appendChild(turnHeading);
    }
}

/**
 * Gets the starting position of a piece at a specific tile
 * @param {integer} x The x coordinate of the tile
 * @param {integer} y The y coordinate of the tile
 * @returns {object} An object {piece, color} containing what piece should start at that tile
 */
function getStartingPiece(x, y) {
    //finding which color starts on the top and which starts on the bottom
    let topColor = localStorage.getItem('topPosition');
    let bottomColor = (topColor === 'white') ? 'black' : 'white';
    //default the piece and color to an empty string in case no piece should start at this tile
    let piece = '';
    let color = '';

    //creating the back row of chess pieces for each side
    if (y === 0 || y === boardSize - 1) {
        if (x === 0 || x === boardSize - 1) {
            piece = 'rook';
        } else if (x === 1 || x === boardSize - 2) {
            piece = 'knight';
        } else if (x === 2 || x === boardSize - 3) {
            piece = 'bishop';
        } else if (x === 3) {
            piece = 'queen';
        } else {
            piece = 'king';
        }
        //setting the color
        if (y === 0) {
            color = topColor;
        } else {
            color = bottomColor;
        }
    }
    //setting up the pawns for both sides
    else if (y === 1 || y === boardSize - 2) {
        piece = 'pawn';
        if (y === 1) {
            color = topColor;
        } else {
            color = bottomColor;
        }
    }
    return {
        piece: piece,
        color: color
    };
}

/**
 * Gets how many players in the game are controlled manually by the user
 * @returns {integer} The number of human players in the game
 */
function getHumanPlayers() {
    let humans = 0;
    if (localStorage.getItem('white') === 'player') {
        humans++;
    }
    if (localStorage.getItem('black') === 'player') {
        humans++;
    }
    return humans;
}

/**
 * Sets the player names to what is stored in local storage
 */
function setPlayerNames() {
    //getting the heading elements that display the player names, which is the first element of the player ui
    let player1Heading = document.getElementById('player1-ui').children[0];
    let player2Heading = document.getElementById('player2-ui').children[0];

    //setting the inner text to the names stored in local storage, or as 'Chess Bot' if the player is the computer
    let player1Type = localStorage.getItem('white');
    let player2Type = localStorage.getItem('black');
    if (player1Type === 'player') {
        player1Heading.innerHTML = localStorage.getItem('p1-name');
    } else {
        if (player2Type === 'computer') {
            player1Heading.innerHTML = 'Chess Bot 1';
        } else {
            player1Heading.innerHTML = 'Chess Bot';
        }
    }
    if (player2Type === 'player') {
        if (player1Type === 'computer') {
            player2Heading.innerHTML = localStorage.getItem('p1-name');
        } else {
            player2Heading.innerHTML = localStorage.getItem('p2-name');
        }
    } else {
        if (player1Type === 'computer') {
            player2Heading.innerHTML = 'Chess Bot 2';
        } else {
            player2Heading.innerHTML = 'Chess Bot';
        }
    }

    //adding the font awesome chess icon to indicate the color of the player
    player1Heading.innerHTML += `
    <span><i class="fa-solid fa-chess-king"></i></span>
    `;
    player2Heading.innerHTML += `
    <span><i class="fa-solid fa-chess-king"></i></span>
    `;
}

/**
 * Is called when a player clicks on a tile containing a click event listener, ie. if
 * the tile has a player piece or if a selected piece can move to that tile
 * @param {*} x The x position of the clicked tile
 * @param {*} x The y position of the clicked tile
 */
function tileClick(x, y) {
    let clickedTile = tile.getElement(x, y);
    let clickedClass = clickedTile.className;

    //if the tile is enabled to be clicked on by the player
    if (clickedClass.includes('clickable')) {
        //checking if the tile that's been clicked on is a possible move
        if (canMoveHere(clickedTile)) {
            let selectedTile = document.getElementById('tile-selected').parentNode;
            //deselects all the tiles and begins the piece movement animation
            tile.deselectAll();
            chessPiece.move(selectedTile, clickedTile);
        } else {
            tile.deselectAll();
            //selecting the piece that has been clicked on
            let pieceElement = tile.getPieceElement(clickedTile);
            if (pieceElement !== null) {
                tile.select(clickedTile);
            }
        }
    } else {
        tile.deselectAll();
    }
}

/**
 * Checks if a tile has a possible move icon
 * @param {object} tileElement The element of the tile that is being checked
 * @returns {boolean} If a selected piece can move to this tile
 */
function canMoveHere(tileElement) {
    let childDivs = tileElement.children;
    for (let child of childDivs) {
        if (child.classList.contains('possible-move')) {
            return true;
        } else if (child.classList.contains('chess-piece')) {
            //if there is a piece already on the tile, then check within the piece element if there is a move icon
            let pieceChildren = child.children;
            for (let pieceChild of pieceChildren) {
                if (pieceChild.classList.contains('possible-move')) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Gets the information about the player making the next move
 * @returns an object containing the information of the player {name: place: color}
 */
function getPlayerTurn() {
    let currentPlayerDiv = document.getElementsByClassName('player-active')[0];
    let currentChildren = currentPlayerDiv.children;

    //the name of the player
    let name = currentChildren[0].innerText;

    //gets the place of the current player on the ui. the 7th character of the player ui divs is either 1 or 2
    let playerPlace = parseInt(currentPlayerDiv.id[6]);
    let playerColor = (playerPlace === 1) ? 'white' : 'black';

    return {
        name: name,
        place: playerPlace,
        color: playerColor
    };
}

/**
 * Gets the name of the player that owns a given color
 * @param {*} player The color/number of the player you wish to retrieve
 * @returns {string} The name of the player with the specified color
 */
function getPlayerName(player) {
    //getting the place on the ui based on the color. 'white' always goes first so it will always be 1
    let playerPlace;
    if (typeof player === 'string') {
        switch (player) {
            case 'white':
                playerPlace = 1;
                break;
            case 'black':
                playerPlace = 2;
                break;
            default:
                throw `Error at getPlayerName: Invalid color ${player}. Aborting!`;
        }
    } else if (typeof player === 'number') {
        playerPlace = player;
    }
    //finding the ui element that contains the information of the player
    let playerUi = document.getElementById(`player${playerPlace}-ui`);
    let playerChildren = playerUi.children;

    //the name of the player
    return playerChildren[0].innerText;
}

/**
 * 
 * @param {*} playerPlace the place of the player on the ui. is either 1 or 2
 */
function setPlayerTurn(playerPlace) {
    if (playerPlace === 1 || playerPlace === 2) {
        //clearing the 'player-active' class from the previous turn
        let previousTurnDiv = document.getElementsByClassName('player-active');
        if (previousTurnDiv.length > 0) {
            previousTurnDiv[0].removeAttribute('class');
        }

        //finding the player ui div with the id that contains the playerPlace number
        let newTurnDiv = document.getElementById(`player${playerPlace}-ui`);
        newTurnDiv.className = 'player-active';

        //updating the player turn heading to display the correct player name
        let turnHeading = document.getElementById('turn-heading');
        let newHeading = newTurnDiv.children[0].innerText;
        turnHeading.innerText = `It is ${newHeading}'s turn`;
    } else {
        throw `Error in setPlayerTurn: Invalid input ${playerPlace} (Should be either 1 or 2). Aborting..`;
    }
}

/**
 * Switches to the next turn
 */
function nextTurn() {
    //getting the information of the current player before moving on to the next turn
    let playerTurn = getPlayerTurn();
    let lastPlayerName = playerTurn.name;
    //if place = 2, then 3 - 2 = 1. if place = 1, then 3 - 1 = 2.
    let newTurn = 3 - playerTurn.place;
    setPlayerTurn(newTurn);

    //updating the playerTurn info to the new player
    playerTurn = getPlayerTurn();
    let checkmate = isCheckmate(playerTurn.color);

    
    //alerting the player if there is a check this round
    if (isCheck(playerTurn.color)) {
        //if the player has no legal moves to take
        if (checkmate) {
            //stopping the timer
            timer.clear();
            addAnnouncement(`Checkmate! ${lastPlayerName} wins!`);
            setBanner('Checkmate!', lastPlayerName + ' wins!', '');
            //removes the checkmate banner after a certain amount of time to allow the user to see the board again
            setTimeout(removeBanner, checkmateBannerTime);
        } else {
            addAnnouncement("Check");
        }
    } else {
        //checking if the player is in stalemate, i.e. has no legal moves but is not in check
        if (checkmate) {
            //ending the game
            timer.clear();
            addAnnouncement(`Stalemate! It's a draw!`);
            setBanner('Stalemate!', `It's a draw!`, '');
            //removes the checkmate banner after a certain amount of time to allow the user to see the board again
            setTimeout(removeBanner, checkmateBannerTime);
        }
    }
    //if there isn't a checkmate, then continue the game
    if (!checkmate) {
        allowTurn(playerTurn.color);
    }
}

/**
 * Gives the go ahead to let the next player make their move
 * @param {string} color The color of the player making the next move
 */
function allowTurn(color) {
    //if the player has the next turn
    if (localStorage.getItem(color) === 'player') {
        //adding the 'clickable' class to the player pieces
        let playerElements = document.getElementsByClassName(color);
        for (let playerPiece of playerElements) {
            tile.addInteraction(playerPiece.parentNode);
        }
    } else {
        //the ai script running if it is the computer's turn
        pieceMovement.moveWait = setTimeout(makeMove, aiDelay, color);
    }
    //starting the timer
    if (getHumanPlayers() === 2 && localStorage.getItem('timeLimit') === 'enabled') {
        let playerTurn = getPlayerTurn();
        timer.start(playerTurn.place);
    }
}

/**
 * Adds a new HTML element to the announcements section containing some text
 * @param {string} text the test you wish to display in the announcements
 */
function addAnnouncement(text) {
    /*if the width of the screen is less than 800px, then clear any new announcements.
    only one announcement can be displayed at this width, so there can only be one new announcement at a time*/
    let width = window.innerWidth;
    if (width <= 800) {
        clearNewAnnouncements();
    }
    //creating the announcement element
    let announcement = document.getElementById('announcements').children[0];
    let newAnnouncement = document.createElement('div');
    newAnnouncement.innerText = text;
    newAnnouncement.className = 'announcement announce-new';

    announcement.appendChild(newAnnouncement);

    //if the amount of announcements have exceeded the limit, the oldest will be deleted
    let announceTexts = announcement.children;
    if (announceTexts.length > announcementLimit) {
        announceTexts[0].remove();
    }
}

/**
 * Adds an announcement about the elimination of a given piece
 * @param {object} pieceData The data object {x, y, piece, color} of the piece that was eliminated
 */
function announceElimination(pieceData) {
    let enemyColor = (pieceData.color === 'white') ? 'black' : 'white';

    //getting the type of piece that was eliminated
    let displayPiece = pieceData.piece;
    //making the first letter capital
    let firstLetter = displayPiece[0];
    firstLetter = firstLetter.toUpperCase();
    displayPiece = firstLetter + displayPiece.slice(1);

    addAnnouncement(`${getPlayerName(enemyColor)} eliminated ${getPlayerName(pieceData.color)}'s ${displayPiece}!`);
}

/**
 * Removes the announce-new class from all announcements
 */
function clearNewAnnouncements() {
    let newAnnounces = document.getElementsByClassName('announce-new');
    //keep removing the class from all the elements until there are none left
    while (newAnnounces.length > 0) {
        newAnnounces[0].classList.remove('announce-new');
    }
}

/**
 * Clears all announcements in the ui
 */
function clearAnnouncements() {
    //getting the grandchildren of the announcement div, which will be the individual announcement text elements
    let announceChildren = document.getElementById('announcements').children[0].children;

    while (announceChildren.length > 0) {
        announceChildren[0].remove();
    }
}

/**
 * Displays a banner over the chess board with a specified heading, subheading and,
 * if specified, an array of pawn promotion icons
 * @param {string} heading The heading of the banner
 * @param {string} subheading The subheading of the banner
 * @param {string} promotionColor The color of the pawn promotion icons, or an empty string if not wanted
 */
function setBanner(heading, subheading, promotionColor) {
    let bannerDiv = document.getElementById('banner');
    //removing the hidden display css property to show it on screen
    bannerDiv.style.removeProperty('display');

    //updating the heading and subheading
    let bannerChildren = bannerDiv.children;
    bannerChildren[0].innerText = heading;
    bannerChildren[1].innerText = subheading;

    //displaying the pawn promotion grid if necessary, while changing the height of the banner to give appropriate room
    if (promotionColor !== '') {
        bannerDiv.className = 'pawn-pick';
        setPromotionIcons(promotionColor);
    } else {
        bannerDiv.className = 'notify';
    }
}

/**
 * Removes the banner
 */
function removeBanner() {
    let bannerDiv = document.getElementById('banner');
    //setting its display style to none to remove it from the screen
    bannerDiv.style.display = 'none';
    //disabling the pawn promotion grid
    let promoteGrid = document.getElementById('promotion-icons');
    promoteGrid.style.display = 'none';
}

/**
 * Sets each of the icons in the pawn promotion banner grid
 * @param {string} color The color of the pieces to be displayed
 */
function setPromotionIcons(color) {
    //enabling the pawn promotion grid
    let promoteGrid = document.getElementById('promotion-icons');
    promoteGrid.style.removeProperty('display');

    //finding all the promotion icons
    let knightIcon = document.getElementById('promote-knight');
    let bishopIcon = document.getElementById('promote-bishop');
    let rookIcon = document.getElementById('promote-rook');
    let queenIcon = document.getElementById('promote-queen');

    //setting their images
    chessPiece.setImage(knightIcon, 'knight', color);
    chessPiece.setImage(bishopIcon, 'bishop', color);
    chessPiece.setImage(rookIcon, 'rook', color);
    chessPiece.setImage(queenIcon, 'queen', color);
}

/**
 * Sets the pawn's new piece type to the selected piece
 * @param {string} piece The piece that has been chosen
 */
function selectPromotion(piece) {
    //promoting the pawn to the piece that was selected
    chessPiece.promotePlayerPawn(piece);
    removeBanner();
    nextTurn();
}

/**
 * Returns if the king is in check for this turn
 * @param {string} color The color of the king that will be evaluated
 * @returns {boolean} If the king is being threatened by an enemy piece
 */
function isCheck(color) {
    let kingData = tile.findKing(color);
    return pieceMovement.isKingThreatened(kingData, kingData);
}

/**
 * Gets if a player is in checkmate
 * @param {string} color The color of the player that could be in checkmate
 * @returns {boolean} If the player is in checkmate
 */
function isCheckmate(color) {
    //getting all of the pieces to check if there is a move that will save the king
    let playerPieces = chessPiece.getAll(color);

    for (let playerPiece of playerPieces) {
        let pieceMoves = pieceMovement.getAllMoveTiles(playerPiece);

        //if there is a valid move, then it is not checkmate
        if (pieceMoves.length > 0) {
            return false;
        }
    }
    return true;
}

/**
 * Is called when a player clicks on a piece in the graveyard when a pawn reaches
 * the other side of the board. Brings the piece back to life in place of the pawn
 */
function revivePlayer() {
    removeBanner();
    //stops the graveyard icons flashing
    graveyard.stopFlash();
    //replaces the pawn with the piece that was clicked on
    graveyard.replaceWithDead(this);

    //removing the clickable class and event listeners from the graveyard pieces once a piece has been picked
    let reviveButtons = document.getElementsByClassName('piece-dead');
    for (let reviveButton of reviveButtons) {
        if (reviveButton.classList.contains('clickable')) {
            reviveButton.classList.remove('clickable');
            reviveButton.removeEventListener('click', revivePlayer);
        }
    }
    nextTurn();
}

/**
 * Clears all intervals running on the page
 */
function clearIntervals() {
    timer.clear();
    pieceAnimation.clear();
}