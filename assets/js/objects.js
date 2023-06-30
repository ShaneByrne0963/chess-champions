//object that stores tile functions
let tile = {
    get: (x, y) => {

    },

    getData: (tileElement) => {

    },

    getElement: (x, y) => {

    },

    set: (x, y, piece, color) => {

    },

    setData: (x, y, tileData) => {

    },

    move: () => {

    },

    /**
     * Clears a given tile of any pieces
     * @param {*} x The x position of the tile (from 0 to boardSize - 1)
     * @param {*} y The y position of the tile (from 0 to boardSize - 1)
     */
    clear: (x, y) => {
        let currentTile = document.getElementById(`tile-${x}-${y}`);
        let tileClass = currentTile.className;
        currentTile.className = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")
        currentTile.style.backgroundImage = "";
    },

    evaluate: () => {

    },

    /**
     * Checks if a coordinate is within the board boundaries
     * @param {*} x The x position of the tile
     * @param {*} y The y position of the tile
     * @returns A boolean that is true if the tile to be checked is within the chess board
     */
    inBounds: (x, y) => {
        return (x >= 0 && x < boardSize && y >= 0 && y < boardSize);
    },

    select: (x, y) => {

    },

    deselectAll: () => {

    }
};

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
                //converting the html naming convention to camelCase
                if (foundPiece === 'pawn-new') {
                    foundPiece = 'pawnNew';
                }
                return foundPiece;
            } else {
                return '';
            }
        } else {
            return '';
        }
    },

    /**
     * Will return all the tiles a piece can move to within it's move set
     * @param {*} x The x position of the piece on the board
     * @param {*} y The y position of the piece on the board
     * @param {*} piece The piece that will be making the move
     * @param {*} color The color of the selected piece
     * @returns An array of all the tiles the piece can move to
     */
    getAllMoveTiles: (x, y, piece, color) => {
        //the array that will store all the tiles the piece can move to
        let moveTiles = [];

        let moves = chessPieces[piece].moves;

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

                //determines which direction is forward
                let yDirection;
                if (color === 'white') {
                    yDirection = -1;
                } else {
                    yDirection = 1;
                }

                //if the forward value is greater than 1, then all tiles in between will be checked to see if they are blank
                let blockMove = false;
                for (let i = 1; i < forwardAmount && !blockMove; i++) {
                    let tileInfo = getPositionInfo(newX, y + (i * yDirection));
                    //if there is a friendly piece, or any piece at all if the rule 'disarmed' applies, the tile will be considered blocked
                    if (tileInfo.color === color || (currentMove[0] === 'disarmed' && tileInfo.color !== '')) {
                        blockMove = true;
                    }
                }
                //continue onto the next move if this move is blocked by a tile
                if (blockMove) {
                    continue;
                }
                newY = y + (forwardAmount * yDirection);
            } else {
                newY = y + moveY;
            }

            //checking if the move is within the bounding box of the chess board
            if (tile.inBounds(newX, newY)) {
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
                                if (tile.inBounds(newX, newY)) {
                                    checkTile = document.getElementById(`tile-${newX}-${newY}`);
                                    checkInfo = getTileInfo(checkTile);
                                }
                            } while (tile.inBounds(newX, newY));
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