//constants
const boardSize = 8;

//initializes game when the page loads
document.onload = gameInit();

//object that stores the information of different pieces
let chessPieces = {
    //chess move rules:
    // 'attack' means the piece can only move to the tile if an enemy is on it
    // 'disarmed' means the piece cannot move to the tile if an enemy is on it
    // 'vector' means continue in that direction until an obstacle is reached

    //for pawns that have not made a move yet.
    pawnNew: {
        moves: [['disarmed', 0, 'forward1'], ['disarmed', 0, 'forward2'], ['attack', -1, 'forward1'], ['attack', 1, 'forward1']],
        value: 100
    },
    pawn: {
        moves: [['disarmed', 0, 'forward1'], ['attack', -1, 'forward1'], ['attack', 1, 'forward1']],
        value: 100
    },
    knight: {
        //can only move in an "L"-shaped pattern
        moves: [[-1, -2], [1, -2], [-2, -1], [2, -1], [-2, 1], [2, 1], [-1, 2], [1, 2]],
        value: 300
    },
    bishop: {
        //can only move to the tiles diagonal to it.
        moves: [['vector', 1, 1], ['vector', -1, 1], ['vector', -1, -1], ['vector', 1, -1]],
        value: 300
    },
    rook: {
        //moves in the four cardinal directions
        moves: [['vector', 1, 0], ['vector', 0, -1], ['vector', -1, 0], ['vector', 0, 1]],
        value: 500
    },
    queen: {
        //moves in the four cardinal directions and to tiles diagonal to it
        moves: [['vector', 1, 0], ['vector', 1, 1], ['vector', 0, -1], ['vector', -1, 1],
        ['vector', -1, 0], ['vector', -1, -1], ['vector', 0, 1], ['vector', 1, -1]],
        value: 900
    },
    king: {
        moves: [[1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1]],
        value: 2000
    },

    /**
     * reads a tiles class and determines what piece it has
     * @param {*} tileClass the class of the tile. should be in string or array form
     * @returns The piece in the given tile, in string format
     */
    getPieceFromClass: (tileClass) => {
        if (typeof tileClass === 'string' || typeof tileClass === 'object') {
            let pieceNames = ['pawn-new', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
            let foundPiece = '';
            for (let i = 0; i < pieceNames.length && !foundPiece; i++) {
                if (typeof tileClass === 'string') {
                    if (tileClass.includes(pieceNames[i])) {
                        foundPiece = pieceNames[i];
                    }
                }
                else {
                    if (tileClass.contains(pieceNames[i])) {
                        foundPiece = pieceNames[i];
                    }
                }
            }
            if (foundPiece) {
                return foundPiece;
            } else {
                return null;
            }
        } else {
            return null;
        }
    },

    /**
     * Will return all the tiles a piece can move to within it's move set
     * @param {*} x The x position of the piece on the board
     * @param {*} y The y position of the piece on the board
     * @param {*} moves The array containing all the moves the piece can make. This will be taken from the chessPieces object
     * @param {*} color The color of the selected piece
     * @returns An array of all the tiles the piece can move to
     */
    getAllMoveTiles: (x, y, moves, color) => {
        //the array that will store all the tiles the piece can move to
        let moveTiles = [];

        //getting the enemy's color
        let enemyColor;
        if (color === 'white') {
            enemyColor = 'black';
        } else {
            enemyColor = 'white';
        }

        for (let currentMove of moves) {
            //declaring the variables storing the coordinates of the tiles to check
            let newX = x + currentMove[currentMove.length - 2]; //the x coordinate is always the second last element in a moves array
            let newY;
            //adding forward movement only support for pawns
            let moveY = currentMove[currentMove.length - 1]; //the y coordinate is always the last element in a moves array
            if (typeof moveY === 'string' && moveY.includes('forward')) {
                //getting the last character of the forward move, which specifies the number of moves forward it can take
                let forwardAmount = parseInt(moveY[moveY.length - 1]);
                if (color === 'white') {
                    newY = y - forwardAmount;
                } else {
                    newY = y + forwardAmount;
                }
            } else {
                newY = y + moveY;
            }

            //checking if the move is within the bounding box of the chess board
            if (getTileBounds(newX, newY)) {
                //the tile element that is being checked
                let checkTile = document.getElementById(`tile-${newX}-${newY}`);
                let checkInfo = getTileInfo(checkTile);
                
                //if the array has 3 values, then the first one is a rule. see chessPieces object for move rules
                if (currentMove.length >= 3) {
                    switch (currentMove[0]) {
                        case 'attack':
                            if (checkInfo.color === enemyColor) {
                                moveTiles.push(checkTile);
                            }
                            break;
                        case 'disarmed':
                            if (checkInfo.color === '') {
                                moveTiles.push(checkTile);
                            }
                            break;
                        case 'vector':
                            do {
                                if (checkInfo.color !== color) {
                                    moveTiles.push(checkTile);
                                }
                                if (checkInfo.color !== '') {
                                    break;
                                }
                                newX += currentMove[1];
                                newY += currentMove[2];
                                if (getTileBounds(newX, newY)) {
                                    checkTile = document.getElementById(`tile-${newX}-${newY}`);
                                    checkInfo = getTileInfo(checkTile);
                                }
                            } while (getTileBounds(newX, newY));
                            break;
                    }
                }
                else {
                    //cannot move to a tile that has a friendly piece
                    if (checkInfo.color !== color) {
                        moveTiles.push(checkTile);
                    }
                }
            }
        }

        return moveTiles;
    }
};

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
                setTile(i, j, piece, color);
            }
            //setting up the pawns for both sides
            else if (j === 1 || j === boardSize - 2) {
                piece = 'pawn';
                if (j === 1) {
                    color = 'black';
                } else {
                    color = 'white';
                }
                setTile(i, j, piece, color);
            }
            //Clearing any tiles set from the previous game
            else {
                clearTile(i, j);
            }
        }
    }
}

/**
 * Sets a chess piece at a given tile
 * @param {*} x The x position of the tile (from 0 to boardSize - 1)
 * @param {*} y The y position of the tile (from 0 to boardSize - 1) 
 * @param {*} piece The type of piece you wish to set the tile to 
 * @param {*} color The color of the piece you wish to set the tile to
 */
function setTile(x, y, piece, color) {
    let currentTile = document.getElementById(`tile-${x}-${y}`);
    let tileClass = currentTile.className;
    tileClass = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")

    tileClass += ` ${piece} ${color}`;
    currentTile.className = tileClass;
    currentTile.style.backgroundImage = `url(assets/images/chess-pieces/${color}-${piece}.png)`;
}

/**
 * Moves a chess piece from one tile to another
 * @param {*} tileFrom The tile you are looking to move
 * @param {*} tileTo The tile you are looking to move tileFrom to
 */
function moveTile(tileFrom, tileTo) {
    let tileFromInfo = getTileInfo(tileFrom);
    let tileToInfo = getTileInfo(tileTo);

    setTile(tileToInfo.x, tileToInfo.y, tileFromInfo.piece, tileFromInfo.color);
    clearTile(tileFromInfo.x, tileFromInfo.y);
}

/**
 * Gets the coordinates, piece type and color of a tile
 * @param {*} tile The tile you wish to retrieve the information from
 * @returns The information of the tile in object form
 */
function getTileInfo(tile) {
    //getting the coordinates
    let x = parseInt(tile.id[5]); //"tile-x-y": "x" is the 5th character of the id string
    let y = parseInt(tile.id[7]); //"tile-x-y": "y" is the 7th character of the id string

    //getting the tile piece and color
    let tileClass = tile.classList;
    let piece = chessPieces.getPieceFromClass(tileClass);
    let color = '';
    if (tileClass.contains('white')) {
        color = 'white';
    } else if (tileClass.contains('black')) {
        color = 'black';
    }

    //builds the object containing the information and returns it
    return {
        x: x,
        y: y,
        piece: piece,
        color: color
    };
}

/**
 * Checks if a tile is within the board boundaries
 * @param {*} x The x position of the tile
 * @param {*} y The y position of the tile
 * @returns A boolean that is true if the tile to be checked is within the chess board
 */
function getTileBounds(x, y) {
    return (x >= 0 && x < boardSize && y >= 0 && y < boardSize);
}

/**
 * Clears a given tile of any pieces
 * @param {*} x The x position of the tile (from 0 to boardSize - 1)
 * @param {*} y The y position of the tile (from 0 to boardSize - 1)
 */
function clearTile(x, y) {
    let currentTile = document.getElementById(`tile-${x}-${y}`);
    let tileClass = currentTile.className;
    currentTile.className = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")
    currentTile.style.backgroundImage = "";
}

/**
 * Is called when a player clicks on a tile containing a click event listener, ie. if
 * the tile has a player piece or if a selected piece can move to that tile
 */
function tileClick(x, y) {
    //checking if the tile that's been clicked on is a possible move
    let clickedTile = document.getElementById(`tile-${x}-${y}`);
    let clickedChildren = clickedTile.children;
    
    //if the tile has any children
    if (clickedChildren.length > 0) {
        //loop through all the children until a child with class name 'possible-move' is found.
        //should only have one child but this is a safeguard in case there's more than one
        for (let i of clickedChildren) {
            if (i.classList.contains('possible-move')) {
                //gets the div of the selected piece
                let selectedTile = document.getElementById('tile-selected').parentNode;
                moveTile(selectedTile, clickedTile);
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

        if (clickedClasses.contains('white')) {
            //creates another div as a child of the selected tile
            let selectDiv = document.createElement('div');
            selectDiv.id = 'tile-selected';
            clickedTile.appendChild(selectDiv);

            //show all the available moves the selected piece can take
            let possibleMoves = chessPieces.getAllMoveTiles(x, y, chessPieces[clickedPiece].moves, 'white');
            
            for (let i of possibleMoves) {
                let moveOption = document.createElement('div');
                moveOption.className = "possible-move";
                i.appendChild(moveOption);
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