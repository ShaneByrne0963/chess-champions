//constants
const boardSize = 8;

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

    //removing any piece images from the graveyard
    let graveyardPieces = document.getElementsByClassName('piece-dead');
    while (graveyardPieces.length > 0) {
        graveyardPieces[0].remove();
    }

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            let piece = '';
            let color = '';

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
                    color = 'black';
                } else {
                    color = 'white';
                }
                tile.set(i, j, piece, color);
            }
            //setting up the pawns for both sides
            else if (j === 1 || j === boardSize - 2) {
                piece = 'pawnNew';
                if (j === 1) {
                    color = 'black';
                } else {
                    color = 'white';
                }
                tile.set(i, j, piece, color);
            }
            //Clearing any tiles set from the previous game
            else {
                tile.clear(i, j);
            }
        }
    }
}

/**
 * Is called when a player clicks on a tile containing a click event listener, ie. if
 * the tile has a player piece or if a selected piece can move to that tile
 * @param {*} x The x position of the clicked tile
 * @param {*} x The y position of the clicked tile
 */
function tileClick(x, y) {
    let playerTurn = getPlayerTurn();

    //only allow for interaction if it is player 1's turn
    if (playerTurn.place === 1) {
        //checking if the tile that's been clicked on is a possible move
        let clickedTile = document.getElementById(`tile-${x}-${y}`);
        let clickedChildren = clickedTile.children;

        //if the tile has any children
        if (clickedChildren.length > 0) {
            //loop through all the children until a child with class name 'possible-move' is found.
            //should only have one child but this is a safeguard in case there's more than one
            for (let child of clickedChildren) {
                if (child.classList.contains('possible-move')) {
                    //gets the div of the selected piece
                    let selectedTile = document.getElementById('tile-selected').parentNode;
                    tile.move(tile.getData(selectedTile), tile.getData(clickedTile));

                    //moving onto the next player's turn
                    nextTurn();
                    break;
                }
            }
            deselectTiles();
        }

        else {
            //clear all selected tiles
            deselectTiles();

            //getting the tile that was clicked on
            let clickedClasses = clickedTile.classList;
            let clickedPiece = chessPieces.getPieceFromClass(clickedClasses);

            //converting the class name for new pawns to the chessPieces object key to access it
            if (clickedPiece === 'pawn-new') {
                clickedPiece = 'pawnNew';
            }

            if (clickedClasses.contains('white')) {
                //creates another div as a child of the selected tile
                let selectDiv = document.createElement('div');
                selectDiv.id = 'tile-selected';
                clickedTile.appendChild(selectDiv);

                //show all the available moves the selected piece can take
                let possibleMoves = chessPieces.getAllMoveTiles(x, y, clickedPiece, 'white');

                for (let move of possibleMoves) {
                    let moveOption = document.createElement('div');
                    moveOption.className = "possible-move";
                    let moveElement = tile.getElement(move.x, move.y);
                    moveElement.appendChild(moveOption);
                }
            }
        }
    }
}

/**
 * Removes the selected div from the tile that is selected and any tiles showing possible moves
 */
function deselectTiles() {
    let selectExisting = document.getElementById('tile-selected');
    if (selectExisting) {
        selectExisting.remove();
    }
    //removing the possible move divs
    let movesExisting = document.getElementsByClassName('possible-move');

    while (movesExisting.length > 0) {
        movesExisting[0].remove();
    }
}

/**
 * Gets the information about the player making the next move
 * @returns an object containing the information of the player
 */
function getPlayerTurn() {
    let currentPlayerDiv = document.getElementsByClassName('player-active')[0];
    let currentChildren = currentPlayerDiv.children;

    //the name of the player
    let name = currentChildren[0].innerText;

    //gets the place of the current player on the ui. the 7th character of the player ui divs is either 1 or 2.
    //can be used to get the color. white is always first so if the value is 1 then the color is white
    let playerPlace = parseInt(currentPlayerDiv.id[6]);
    let playerColor = '';
    if (playerPlace === 1) {
        playerColor = 'white';
    } else {
        playerColor = 'black';
    }

    return {
        name: name,
        place: playerPlace,
        color: playerColor
    };
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
    } else {
        throw `Error in setPlayerTurn: Invalid input ${playerPlace} (Should be either 1 or 2)`;
    }
}

/**
 * Switches to the next turn
 */
function nextTurn() {
    let playerTurn = getPlayerTurn();
    //if place = 2, then 3 - 2 = 1. if place = 1, then 3 - 1 = 2.
    let newTurn = 3 - playerTurn.place
    setPlayerTurn(newTurn);
    if (newTurn == 2) {
        makeMove();
    }
}