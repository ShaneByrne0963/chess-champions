//constants
const boardSize = 8; //the width and height of the board in terms of tiles
const animationTime = 100; //the amount of time the animation takes to move from one tile to another
//the maximum number of announcements that can be displayed
//when this limit is reached the oldest will be destroyed
const announcementLimit = 10;

//initializes game when the page loads
document.onload = gameInit();

/**
 * Creates the chess tiles and then starts the game
 */
function gameInit() {
    //setting the player names in the player ui
    setPlayerNames();

    //Setting up the chess board tiles
    let chessBoard = document.getElementById("chess-board");
    let chessGrid = ``;
    let isWhite = true;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let tileClass;
            if (isWhite) {
                tileClass = 'tile-light';
            }
            else {
                tileClass = 'tile-dark';
            }

            chessGrid += `
            <div id="tile-${j}-${i}" class="tile ${tileClass}" onclick="tileClick(${j}, ${i});"></div>`;

            //reverses the tile order
            isWhite = !isWhite;
        }
        //reverses the tile order again after each row
        isWhite = !isWhite;
    }

    chessBoard.innerHTML = chessGrid;
    startGame();
}

/**
 * Places the chess pieces in their starting positions on the board
 */
function startGame() {
    //player1 always starts first
    setPlayerTurn(1);

    //clears all the animations and announcements from the ui
    pieceAnimation.clear();
    clearAnnouncements();

    //stops any timeouts for the ai making its move
    pieceMovement.clearDelay();

    //clears the board before creating new pieces
    tile.clearAll();

    //removing any piece images from the graveyard
    graveyard.clearAll();

    //iterating through every tile on the board to create chess pieces where necessary
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            //getting the current tile's element
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
        //setting the piece type
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
        piece = 'pawnNew';
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
 * Sets the player names to what is stored in local storage
 */
function setPlayerNames() {
    //getting the heading elements that display the player names, which is the first element of the player ui
    let player1Heading = document.getElementById('player1-ui').children[0];
    let player2Heading = document.getElementById('player2-ui').children[0];

    //setting the inner text to the names stored in local storage, or as 'Chess Bot' if the player is the computer
    let player1Type = localStorage.getItem('white');
    let player2Type = localStorage.getItem('black');
    //setting player 1's name
    if (player1Type === 'player') {
        player1Heading.innerHTML = localStorage.getItem('p1-name');
    } else {
        if (player2Type === 'computer') {
            player1Heading.innerHTML = 'Chess Bot 1';
        } else {
            player1Heading.innerHTML = 'Chess Bot';
        }
    }
    //setting player 2's name
    if (player2Type === 'player') {
        player2Heading.innerHTML = localStorage.getItem('p2-name');
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
    //only select the tile if it has a clickable class attached to it
    let clickedTile = tile.getElement(x, y);
    let clickedClass = clickedTile.className;
    if (clickedClass.includes('clickable')) {

        //checking if the tile that's been clicked on is a possible move
        let clickedChildren = clickedTile.children;

        //if the tile has any children
        if (clickedChildren.length > 0) {
            //loop through all the children until a child with class name 'possible-move' is found.
            //should only have one child but this is a safeguard in case there's more than one
            let isPossibleMove = false;
            for (let child of clickedChildren) {
                //if there is a move icon as a child of the tile, then the piece can move there
                if (child.classList.contains('possible-move')) {
                    isPossibleMove = true;
                } else if (child.classList.contains('chess-piece')) {
                    //if there is a piece already on the tile, then check within the piece element if there is a move icon
                    let pieceChildren = child.children;
                    for (let pieceChild of pieceChildren) {
                        if (pieceChild.classList.contains('possible-move')) {
                            isPossibleMove = true;
                            break;
                        }
                    }
                }
                if (isPossibleMove) {
                    //gets the selected tile
                    let selectedTile = document.getElementById('tile-selected').parentNode;
                    //deselects all the tiles and begins the piece movement animation
                    tile.deselectAll();
                    chessPiece.move(selectedTile, clickedTile);
                    break;
                }
            }
            if (!isPossibleMove) {
                //clear all selected tiles
                tile.deselectAll();

                let pieceElement = tile.getPieceElement(clickedTile);
                if (pieceElement !== null) {
                    tile.select(clickedTile);
                }
            }
        }
    } else {
        //clear all selected tiles
        tile.deselectAll();
    }
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

    //gets the place of the current player on the ui. the 7th character of the player ui divs is either 1 or 2.
    //can be used to get the color. white is always first so if the value is 1 then the color is white
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
 * @param {*} playerColor The color of the player you wish to retrieve
 * @returns {string} The name of the player with the specified color
 */
function getPlayerName(playerColor) {
    //getting the place on the ui based on the color. 'white' always goes first so it will always be 1
    let playerPlace;
    switch (playerColor) {
        case 'white':
            playerPlace = 1;
            break;
        case 'black':
            playerPlace = 2;
            break;
        default:
            throw `Error at getPlayerName: Invalid color ${playerColor}. Aborting!`;
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
        let turnHeading = document.getElementById('player-turn').children[0]; //the first child is the h2 element
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
    let playerTurn = getPlayerTurn();
    //for display if the other player is in checkmate
    let lastPlayerName = playerTurn.name;
    //if place = 2, then 3 - 2 = 1. if place = 1, then 3 - 1 = 2.
    let newTurn = 3 - playerTurn.place;
    setPlayerTurn(newTurn);

    //updating the playerTurn info to the other player
    playerTurn = getPlayerTurn();
    let checkmate = isCheckmate(playerTurn.color);

    //alerting the player if there is a check this round
    if (isCheck(playerTurn.color)) {
        //looking for a checkmate

        if (checkmate) {
            checkmate = true;
            addAnnouncement(`Checkmate! ${lastPlayerName} wins!`);
        } else {
            addAnnouncement("Check");
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
        pieceMovement.moveWait = setTimeout(makeMove, 1000, color);
    }
}

/**
 * Adds a new HTML element to the announcements section containing some text
 * @param {string} text the test you wish to display in the announcements
 */
function addAnnouncement(text) {
    let announcement = document.getElementById('announcements').children[0];
    let newAnnouncement = document.createElement('div');
    newAnnouncement.innerText = text;
    newAnnouncement.className = 'announcement';

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

    //changing the piece text to be more suitable for the announcement
    let displayPiece = pieceData.piece;
    //converting 'pawnNew' to just 'pawn'
    if (displayPiece === 'pawnNew') {
        displayPiece = 'pawn';
    }
    //making the first letter capital
    let firstLetter = displayPiece[0];
    firstLetter = firstLetter.toUpperCase();
    displayPiece = firstLetter + displayPiece.slice(1);

    addAnnouncement(`${getPlayerName(enemyColor)} eliminated ${getPlayerName(pieceData.color)}'s ${displayPiece}!`);
}

/**
 * Clears all announcements in the ui
 */
function clearAnnouncements() {
    //getting the grandchildren of the announcement div
    let announceChildren = document.getElementById('announcements').children[0].children;

    while (announceChildren.length > 0) {
        announceChildren[0].remove();
    }
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
    //continuing the game
    nextTurn();
}

/**
 * Gets the graveyard elements of a certain player
 * @param {string} color The color of the player
 * @returns {object} an array of graveyard piece elements
 */
function getGraveyardElements(color) {
    let graveyardDiv = (color === 'black') ? document.getElementById('player1-graveyard') : document.getElementById('player2-graveyard');
    let graves = graveyardDiv.children;

    return graves;
}