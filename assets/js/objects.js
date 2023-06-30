//object that stores tile functions
let tile = {
    /**
     * Gets the tile information at a certain coordinate
     * @param {*} x the x coordinate of the tile
     * @param {*} y the y coordinate of the tile
     * @returns The information of the tile in object form {x, y, piece, color}
     */
    get: (x, y) => {
        let currentTile = tile.getElement(x, y);
        return tile.getData(currentTile);
    },

    /**
     * Gets the coordinates, piece type and color of a tile
     * @param {*} tileElement The tile element you wish to retrieve the information from
     * @returns The information of the tile in object form {x, y, piece, color}
     */
    getData: (tileElement) => {
        let x = parseInt(tileElement.id[5]); //"tile-x-y": "x" is the 5th character of the id string
        let y = parseInt(tileElement.id[7]); //"tile-x-y": "y" is the 7th character of the id string
        let tileClass = tileElement.classList;
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
    },

    /**
     * Gets an HTML element in a given location
     * @param {*} x The x position of the tile on the board
     * @param {*} y The y position of the tile on the board
     * @returns The tile HTML element
     */
    getElement: (x, y) => {
        return document.getElementById(`tile-${x}-${y}`);
    },

    /**
     * Sets a chess piece at a certain tile
     * @param {*} x The x position of the tile (from 0 to boardSize - 1)
     * @param {*} y The y position of the tile (from 0 to boardSize - 1) 
     * @param {*} piece The type of piece you wish to set the tile to 
     * @param {*} color The color of the piece you wish to set the tile to
     */
    set: (x, y, piece, color) => {
        let currentTile = document.getElementById(`tile-${x}-${y}`);
        let tileClass = currentTile.className;
        tileClass = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")

        //converts the camelCase spelling to html naming convention
        let convertPiece = piece;
        if (convertPiece === 'pawnNew') {
            convertPiece = 'pawn-new';
        }

        tileClass += ` ${convertPiece} ${color}`;
        currentTile.className = tileClass;
        //setting the piece type to a regular pawn for the image to be located
        if (piece === 'pawnNew') {
            piece = 'pawn';
        }
        currentTile.style.backgroundImage = `url(assets/images/chess-pieces/${color}-${piece}.png)`;
    },

    
    setData: (x, y, tileData) => {
        tile.set(x, y, tileData.piece, tileData.color);
    },

    /**
     * Moves a chess piece from one tile to another
     * @param {*} tileDataFrom The data {x, y, piece, color} of the tile you are looking to move
     * @param {*} tileDataTo The data {x, y, piece, color} of the tile you are looking to move tileDataFrom to
     */
    move: (tileDataFrom, tileDataTo) => {
        //if the piece is "pawnNew", then it will be converted to 'pawn' after it's first move
        let tilePiece = tileDataFrom.piece;
        if (tilePiece === 'pawnNew') {
            tilePiece = 'pawn';
        }

        //if a piece is destroyed, add it to one of the graveyards
        if (tileDataTo.color !== '' && tileDataFrom.color !== tileDataTo.color) {
            chessPieces.destroy(tileDataTo);
        }

        tile.set(tileDataTo.x, tileDataTo.y, tilePiece, tileDataFrom.color);
        tile.clear(tileDataFrom.x, tileDataFrom.y);
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
                    let tileInfo = tile.get(newX, y + (i * yDirection));
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
                let checkTile = tile.get(newX, newY);

                //if the array has 3 values, then the first one is a rule. see chessPieces object for move rules
                if (currentMove.length >= 3) {
                    switch (currentMove[0]) {
                        case 'attack':
                            if (checkTile.color === enemyColor) {
                                moveTiles.push(checkTile);
                            }
                            break;
                        case 'disarmed':
                            if (checkTile.color === '') {
                                moveTiles.push(checkTile);
                            }
                            break;
                        case 'vector':
                            do {
                                if (checkTile.color !== color) {
                                    moveTiles.push(checkTile);
                                }
                                if (checkTile.color !== '') {
                                    break;
                                }
                                newX += currentMove[1];
                                newY += currentMove[2];
                                if (tile.inBounds(newX, newY)) {
                                    checkTile = tile.get(newX, newY);
                                }
                            } while (tile.inBounds(newX, newY));
                            break;
                    }
                }
                else {
                    //cannot move to a tile that has a friendly piece
                    if (checkTile.color !== color) {
                        moveTiles.push(checkTile);
                    }
                }
            }
        }

        return moveTiles;
    },

    /**
     * Adds an icon div representing the destroyed piece into the opposing player's graveyard
     * @param {*} tileData the tile data object {x, y, piece, color} you wish to destroy
     */
    destroy: (tileData) => {
        let deadPiece = document.createElement('div');
        deadPiece.className = 'piece-dead';

        //making pawns and new pawns the same for the image address
        if (tileData.piece === 'pawnNew') {
            tileData.piece = 'pawn';
        }
        deadPiece.style.backgroundImage = `url(assets/images/chess-pieces/${tileData.color}-${tileData.piece}.png)`;

        let graveyardDiv;
        if (tileData.color === 'black') {
            graveyardDiv = document.getElementById('player1-graveyard');
        } else {
            graveyardDiv = document.getElementById('player2-graveyard');
        }
        graveyardDiv.appendChild(deadPiece);
    }
};