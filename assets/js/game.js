//constants
const boardSize = 8; //the width and height of the board in terms of tiles
 //the maximum number of announcements that can be displayed
 //when this limit is reached the oldest will be destroyed
const announcementLimit = 10;

//setting the types of players for each color
localStorage.setItem('white', 'player');
localStorage.setItem('black', 'computer');

//dictates which color will start on top of the board
localStorage.setItem('topPosition', 'white');

//initializes game when the page loads
document.onload = gameInit();

/**
 * Creates the chess tiles and then starts the game
 */
function gameInit() {
    //Setting up the chess board tiles
    let chessBoard = document.getElementById("chess-board");
    let chessGrid = ``;
    let isWhite = true;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let tileClass;
            if (isWhite) {
                tileClass = 'tile-white';
            }
            else {
                tileClass = 'tile-black';
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

    //clears all the announcements from the ui
    clearAnnouncements();

    //removing any piece images from the graveyard
    let graveyardPieces = document.getElementsByClassName('piece-dead');
    while (graveyardPieces.length > 0) {
        graveyardPieces[0].remove();
    }

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let piece = '';
            let color = '';
            let topColor = localStorage.getItem('topPosition');
            let bottomColor = (topColor === 'white') ? 'black' : 'white';

            //creating the back row of chess pieces for each side
            if (j === 0 || j === boardSize - 1) {
                //setting the piece type
                if (i === 0 || i === boardSize - 1) {
                    piece = 'rook';
                } else if (i === 1 || i === boardSize - 2) {
                    piece = 'knight';
                } else if (i === 2 || i === boardSize - 3) {
                    piece = 'bishop';
                } else if (i === 3) {
                    piece = 'queen';
                } else {
                    piece = 'king';
                }

                //setting the color
                if (j === 0) {
                    color = topColor;
                } else {
                    color = bottomColor;
                }
                tile.set(i, j, piece, color);
            }
            //setting up the pawns for both sides
            else if (j === 1 || j === boardSize - 2) {
                piece = 'pawnNew';
                if (j === 1) {
                    color = topColor;
                } else {
                    color = bottomColor;
                }
                tile.set(i, j, piece, color);
            }
            //Clearing any tiles set from the previous game
            else {
                tile.clear(i, j);
            }
        }
    }

    //allow the player to make it's move, whether it is a player or computer
    allowTurn('white');
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
            for (let child of clickedChildren) {
                if (child.classList.contains('possible-move')) {
                    //gets the div of the selected piece
                    let selectedTile = document.getElementById('tile-selected').parentNode;
                    tile.deselectAll();
                    tile.move(tile.getData(selectedTile), tile.getData(clickedTile));
                    break;
                }
            }
        }

        else {
            //clear all selected tiles
            tile.deselectAll();

            tile.select(clickedTile);
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
            throw `Error at getPlayerName: Invalid color ${playerColor}. Aborting!`
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

function allowTurn(color) {
    //if the player has the next turn
    if (localStorage.getItem(color) === 'player') {
        //adding the 'clickable' class to the player pieces
        let playerElements = document.getElementsByClassName(color);
        for (let playerPiece of playerElements) {
            tile.addInteraction(playerPiece);
        }
    } else {
        //the ai script running if it is the computer's turn
        makeMove(color);
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

    let kingSurroundings = tile.evaluate(kingData, kingData);

    return (kingSurroundings.enemyThreat.length > 0);
}

/**
 * Gets if a player is in checkmate
 * @param {string} color The color of the player that could be in checkmate
 * @returns {boolean} If the player is in checkmate
 */
function isCheckmate(color) {
    let hasMove = false;
    //getting all of the pieces to check if there is a move that will save the king
    let playerPieces = chessPiece.getAll(color);

    for (let playerPiece of playerPieces) {
        let pieceMoves = chessPiece.getAllMoveTiles(playerPiece);

        //if there is a valid move, then it is not checkmate
        if (pieceMoves.length > 0) {
            hasMove = true;
            break;
        }
    }

    return !hasMove;
}

/**
 * Is called when a player clicks on a piece in the graveyard when a pawn reaches
 * the other side of the board. Brings the piece back to life in place of the pawn
 */
function revivePlayer() {
    //finds the piece name of the clicked on element
    let pieceName = chessPiece.getDeadPiece(this);

    //getting the information saved to session storage and changing the pawn position to the new piece
    let pawnLocation = sessionStorage.getItem('pawnPosition');
    let pawnX = parseInt(pawnLocation[0]);
    let pawnY = parseInt(pawnLocation[2]);
    let pawnColor = sessionStorage.getItem('pawnColor');

    //setting the tile where the pawn moved to the selected grave piece
    tile.set(pawnX, pawnY, pieceName, pawnColor);

    //clearing the session storage data
    sessionStorage.removeItem('pawnPosition');
    sessionStorage.removeItem('pawnColor');

    //removing the grave piece from the graveyard
    this.remove();

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