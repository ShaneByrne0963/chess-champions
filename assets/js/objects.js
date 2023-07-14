//object that stores tile functions
const tile = {
    /**
     * Gets the element of a piece located on a specified tile
     * @param {object} tileElement The element of the tile you wish to check
     * @returns The element of the piece on the tile, or null if there is none
     */
    getPieceElement: (tileElement) => {
        //assuming the tile doesn't have a piece until it finds one
        let tilePiece = null;

        //getting all the children of the tile
        let tileChildren = tileElement.children;

        //looping through each child element to check if it is a chess piece
        for (let child of tileChildren) {
            //checking if the child element is a chess piece using its classes
            let childClass = child.classList;
            if (childClass.contains('chess-piece')) {
                //getting the information of the piece that was found
                tilePiece = child;
                break;
            }
        }
        return tilePiece;
    },

    /**
     * Gets an HTML element of a tile in a specified location
     * @param {*} x The x position of the tile on the board
     * @param {*} y The y position of the tile on the board
     * @returns The tile HTML element
     */
    getElement: (x, y) => {
        return document.getElementById(`tile-${x}-${y}`);
    },

    /**
     * Gets the x coordinate of a tile element
     * @param {object} tileElement The element of the tile
     * @returns {integer} The x coordinate of the tile on the board
     */
    getX: (tileElement) => {
        return parseInt(tileElement.id[5]); //"tile-x-y": "x" is the 5th character of the id string
    },

    /**
     * Gets the y coordinate of a tile element
     * @param {object} tileElement The element of the tile
     * @returns {integer} The y coordinate of the tile on the board
     */
    getY: (tileElement) => {
        return parseInt(tileElement.id[7]); //"tile-x-y": "y" is the 7th character of the id string
    },

    /**
     * Gets a data object {x, y, piece, color} at a certain tile
     * @param {object} tileElement The element of the tile you wish to get the data from
     * @returns {object} {x, y, piece, color}
     */
    getData: (tileElement) => {
        //get the coordinates of the tile
        let x = tile.getX(tileElement);
        let y = tile.getY(tileElement);
        let piece = '';
        let color = '';

        let pieceElement = tile.getPieceElement(tileElement);

        //updates the piece and color of the object if there is a piece
        //if not, the values of color and piece will be ''
        piece = chessPiece.getType(pieceElement);
        color = chessPiece.getColor(pieceElement);

        return {
            x: x,
            y: y,
            piece: piece,
            color: color
        };
    },

    /**
     * Finds the tile data of the king with the specified color
     * @param {string} color The color of the king
     * @returns {object} The tile data object {x, y, piece, color} of the king
     */
    findKing: (color) => {
        let kings = document.getElementsByClassName('king');
        let kingData;
        for (let king of kings) {
            kingData = tile.getData(king.parentNode);
            if (kingData.color === color) {
                break;
            }
        }
        return kingData;
    },

    /**
     * Clears all pieces from the board
     */
    clearAll: () => {
        //getting all the chess piece elements
        let pieces = document.getElementsByClassName('chess-piece');

        //keep removing the elements from the DOM until there is none left
        while (pieces.length > 0) {
            pieces[0].remove();
        }
    },

    /**
     * Checks if a coordinate is within the board boundaries
     * @param {integer} x The x position of the tile
     * @param {integer} y The y position of the tile
     * @returns A boolean that is true if the tile to be checked is within the chess board
     */
    inBounds: (x, y) => {
        return (x >= 0 && x < boardSize && y >= 0 && y < boardSize);
    },

    /**
     * Selects a tile a human player clicks on, highlighting the tile and showing the
     * possible moves the piece on it can take
     * @param {object} tileElement The tile that has been clicked on
     */
    select: (tileElement) => {
        //getting the tile data
        let pieceElement = tile.getPieceElement(tileElement);
        let pieceData = tile.getData(tileElement);

        if (localStorage.getItem(pieceData.color) === 'player') {
            //creates another div to be set as a child of the selected piece
            let selectDiv = document.createElement('div');
            selectDiv.id = 'tile-selected';
            pieceElement.appendChild(selectDiv);

            //show all the available moves the selected piece can take
            let possibleMoves = pieceMovement.getAllMoveTiles(pieceData);

            for (let move of possibleMoves) {
                //creating a div displaying an image on every possible move
                let moveOption = document.createElement('div');
                moveOption.className = "possible-move";
                let movePiece = tile.getPieceElement(move);
                //if there is an enemy piece on the tile to move to, add the possible move to the piece instead of the tile
                if (movePiece !== null) {
                    movePiece.appendChild(moveOption);
                } else {
                    move.appendChild(moveOption);
                }

                //adding the 'clickable' class to the possible move tile
                tile.addInteraction(move);
            }
        }
    },

    /**
     * Removes the selected div from the tile that is selected and any tiles showing possible moves
     */
    deselectAll: () => {
        //removing the selected tile highlight
        let selectExisting = document.getElementById('tile-selected');
        if (selectExisting) {
            selectExisting.remove();
        }
        //removing the possible move divs
        let movesExisting = document.getElementsByClassName('possible-move');

        while (movesExisting.length > 0) {
            //remove the 'clickable' class from the parent element
            let moveParent = movesExisting[0].parentNode;
            tile.removeInteraction(moveParent);

            //then remove the possible move div itself
            movesExisting[0].remove();
        }
    },

    /**
     * Adds the 'clickable' class name to the specified element
     * @param {object} tileElement The element you wish to add interaction to
     */
    addInteraction: (tileElement) => {
        if (!tileElement.className.includes('clickable')) {
            tileElement.className += ' clickable';
        }
    },

    /**
     * Removes the 'clickable' class name to the specified element
     * @param {object} tileElement The element you wish to remove interaction from
     */
    removeInteraction: (tileElement) => {
        tileElement.classList.remove('clickable');
    },

    /**
     * Removes interaction from all tiles
     */
    removeAllInteraction: () => {
        //getting all the clickable objects
        let clickablePieces = document.getElementsByClassName('clickable');

        let i = 0;
        while (i < clickablePieces.length) {
            let clickPiece = clickablePieces[i];
            //only remove the 'clickable' class from tile elements
            if (clickPiece.classList.contains('tile')) {
                tile.removeInteraction(clickPiece);
            } else {
                //only increment the loop if the 'clickable' element is not a tile
                i++;
            }
        }
    }
};

//object that stores piece functions and the information of different pieces
const chessPiece = {
    //the value of all the pieces used to calculate the best move for the ai
    value: {
        pawn: 100,
        pawnNew: 100,
        bishop: 300,
        knight: 300,
        rook: 500,
        queen: 900,
        king: 2000
    },

    /**
     * Creates a chess piece at a certain tile
     * @param {object} tileElement The element of the tile that will contain the new piece
     * @param {string} piece The type of piece that will be created
     * @param {string} color The color of the new piece
     */
    create: (tileElement, piece, color) => {
        //creating a new element and setting it's classes
        let newPiece = document.createElement('div');

        //converting the camelCase in pawnNew to html standard pawn-new
        let pieceClass = piece;
        //used to find the correct location of it's image in the directory. "pawnNew" will result in nothing
        let pieceImage = piece;
        if (piece === 'pawnNew') {
            pieceClass = 'pawn-new';
            pieceImage = 'pawn';
        }
        //setting all the classes for the piece
        newPiece.className = `chess-piece ${color} ${pieceClass}`;

        //finding the correct image using pieceImage and color
        chessPiece.setImage(newPiece, pieceImage, color);

        //adding the newly created element to the specified tile element
        tileElement.appendChild(newPiece);
    },

    /**
     * Gets a chess piece element on a certain tile
     * @param {integer} x The x position of the tile on the board
     * @param {integer} y The y position of the tile on the board
     * @returns {object} The element of the piece at this tile, or null if the tile is empty
     */
    findElement: (x, y) => {
        //getting the tile at the specified coordinates
        let tileElement = tile.getElement(x, y);
        //getting all the children at that tile
        let tileChildren = tileElement.children;

        //loops through the children to find a piece
        for (let child of tileChildren) {
            if (child.classList.contains('chess-piece')) {
                return child;
            }
        }
        return null;
    },

    /**
     * Finds a chess piece at a coordinate, and returns it's information
     * @param {integer} x The x coordinate on the board
     * @param {integer} y The y coordinate on the board
     * @returns {object} The data {x, y, piece, color} of the piece
     */
    findData: (x, y) => {
        let tileElement = tile.getElement(x, y);
        let pieceData = tile.getData(tileElement);

        return pieceData;
    },

    /**
     * Gets the type of piece from an element
     * @param {object} pieceElement The piece element you wish to find the type of
     * @returns {string} The type of piece, or an empty string if the tile is empty
     */
    getType: (pieceElement) => {
        let piece = '';
        if (pieceElement !== null) {
            tileClass = pieceElement.classList;
            //searching through all the classes until one matches one of the piece types
            piece = chessPiece.getTypeFromClass(tileClass);
        }
        return piece;
    },

    /**
     * reads a tiles class and determines what piece it has
     * @param {object} tileClass the class of the tile. should be in string or array form
     * @returns {string} The piece in the given tile, or an empty string if there is no piece
     */
    getTypeFromClass: (tileClass) => {
        let foundPiece = '';
        //validating if the class is a string or an array
        if (typeof tileClass === 'string' || typeof tileClass === 'object') {
            //all of the classes that are considered chess pieces
            let pieceNames = ['pawn-new', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
            for (let i = 0; i < pieceNames.length; i++) {
                //checking for a class that matches any piece if the input is a string
                if (typeof tileClass === 'string') {
                    if (tileClass.includes(pieceNames[i])) {
                        foundPiece = pieceNames[i];
                        break;
                    }
                }
                //checking for a class that matches any piece if the input is an array
                else {
                    if (tileClass.contains(pieceNames[i])) {
                        foundPiece = pieceNames[i];
                        break;
                    }
                }
            }
            //converting the html naming convention to camelCase if necessary
            if (foundPiece === 'pawn-new') {
                foundPiece = 'pawnNew';
            }
        }
        return foundPiece;
    },

    /**
     * Gets the color of a chess piece
     * @param {object} pieceElement The element of the piece
     * @returns {string} The color of the piece, or an empty string if the piece does not exist
     */
    getColor: (pieceElement) => {
        let color = '';
        if (pieceElement !== null) {
            //searching through the classes for either 'white' or 'black'
            let tileClass = pieceElement.classList;
            if (tileClass.contains('white')) {
                color = 'white';
            } else if (tileClass.contains('black')) {
                color = 'black';
            }
        }
        return color;
    },

    /**
     * Changes the piece type of a specified element
     * @param {object} pieceElement The element you wish to change
     * @param {string} newPiece The new piece type
     */
    setPieceType: (pieceElement, newPiece) => {
        //getting the original piece type from the element
        let oldPiece = chessPiece.getTypeFromClass(pieceElement.classList);
        //converting camelCase to html naming convention
        if (oldPiece === 'pawnNew') {
            oldPiece = 'pawn-new';
        }
        //removing the piece type
        pieceElement.classList.remove(oldPiece);
        //and replacing it with the new one
        pieceElement.classList.add(newPiece);
        //getting the color of the piece from it's parent tile
        let pieceData = tile.getData(pieceElement.parentNode);
        //updating the piece image
        chessPiece.setImage(pieceElement, newPiece, pieceData.color);
    },

    /**
     * Finds the location of the correct piece image and applies it to the element
     * @param {object} pieceElement The element which you want to change the piece image to
     * @param {string} piece The type of piece it will change to
     * @param {string} color The color it will change to
     */
    setImage: (pieceElement, piece, color) => {
        pieceElement.style.backgroundImage = `url(./assets/images/chess-pieces/${color}-${piece}.png)`;
    },

    /**
     * Initializes a piece move from it's original tile to a new one, starting the movement animation
     * @param {*} pieceElement The element of the chess piece that will move
     * @param {*} newTileElement The tile element the piece will move to
     */
    move: (pieceElement, newTileElement) => {
        //first removing the 'clickable' class from all of the pieces to stop player input until it's their turn again
        tile.removeAllInteraction();

        //getting the information about the piece
        let pieceData = tile.getData(pieceElement.parentNode);

        //if the piece is "pawnNew", then it will be converted to 'pawn' after its first move
        if (pieceData.piece === 'pawnNew') {
            chessPiece.setPieceType(pieceElement, 'pawn');
        }

        //starting the movement animation
        pieceAnimation.start(pieceElement, newTileElement);
    },

    /**
     * Finishes a piece moving to a different tile by setting it to the tile's parent
     * and destroying any piece that was already on it
     * @param {object} pieceElement The element of the piece that is moving
     * @param {object} newTileElement The element of the tile the piece is moving to
     */
    changeTile: (pieceElement, newTileElement) => {
        //checking if the tile has another piece on it, and destroying it if it does
        let otherPiece = tile.getPieceElement(newTileElement);
        if (otherPiece !== null) {
            chessPiece.destroy(otherPiece);
        }
        //changing the parent of the chess piece to the new tile
        newTileElement.appendChild(pieceElement);
        //removing the position style properties set during the animation
        pieceElement.style.removeProperty('left');
        pieceElement.style.removeProperty('top');

        //reviving pieces if the pawn reaches the other side of the board
        let pieceData = tile.getData(pieceElement.parentNode);
        let newYPosition = tile.getY(newTileElement);
        let isRevive = false;
        if (pieceData.piece === 'pawn') {
            //checking if the pawn is at the end of the board to initite the piece revive sequence
            if (chessPiece.isAtBoardEnd(pieceData.color, newYPosition)) {
                isRevive = true;
                graveyard.revive(pieceElement);
            }
        }
        //if a pawn has moved to the other side of the board,
        //stop the game until a piece to revive has been selected.
        //if not, continue the game as normal
        if (!isRevive) {
            nextTurn();
        }
    },

    /**
     * Removes a piece from the board and adds it to the graveyard
     * @param {object} pieceElement The element to be destroyed
     */
    destroy: (pieceElement) => {
        let pieceData = tile.getData(pieceElement.parentNode);
        //finding the appropriate graveyard to add the piece to, using the piece's color
        let graveyardDiv = (pieceData.color === 'black') ? document.getElementById('player1-graveyard') : document.getElementById('player2-graveyard');
        graveyard.add(graveyardDiv, pieceData.piece);

        //adding an announcement for the piece elimination
        announceElimination(pieceData);

        //removes the piece from the DOM
        pieceElement.remove();
    },

    /**
     * Gets if a certain tile is at the end of the board
     * @param {string} color The color of the piece
     * @param {integer} y The y position of the piece
     * @returns {boolean} if the given tile has reached the end of the board
     */
    isAtBoardEnd: (color, y) => {
        //getting which color started at the top
        let topColor = localStorage.getItem('topPosition');
        //if the player started on the top, then the end of the board is at the bottom. if not then the end is at the top
        let endPosition = (color === topColor) ? boardSize - 1 : 0;

        //return true if the y value of the tile is at the end position
        return (y === endPosition);
    },

    /**
     * Finds the piece with the lowest value in an array
     * @param {object} pieces The tile data of all the pieces to be checked
     * @returns An array containing the lowest value and it's position on the pieces array [lowestValue, lowestPosition]
     */
    findLowestValue: (pieces) => {
        let lowestValue = chessPiece.value[pieces[0].piece];
        let lowestPosition = 0;

        for (let i = 1; i < pieces.length; i++) {
            let currentPiece = pieces[i];
            let pieceValue = chessPiece.value[currentPiece.piece];
            if (pieceValue < lowestValue) {
                lowestValue = pieceValue;
                lowestPosition = i;
            }
        }

        return [lowestValue, lowestPosition];
    },

    /**
     * Gets all the pieces on the board of a certain color
     * @param {string} color The color of the pieces
     * @returns {object} An array of data objects {x, y, piece, color} for all the pieces
     */
    getAll: (color) => {
        let pieceElements = document.getElementsByClassName(color);
        let pieces = [];

        for (let element of pieceElements) {
            pieces.push(tile.getData(element.parentNode));
        }

        return pieces;
    },
};

//stores all the functions in relation to the movement of the pieces
//will primarily work with piece data objects {x, y, piece, color}
const pieceMovement = {
    //chess move rules:
    // 'normal' means add the following coordinates to the current tile
    // 'attack' means the piece can only move to the tile if an enemy is on it
    // 'disarmed' means the piece cannot move to the tile if an enemy is on it
    // 'vector' means continue in that direction until an obstacle is reached
    // 'forward' means in the direction of the enemy side, followed by a number which is the number of steps
    pawn: [['disarmed', 0, 'forward1'], ['attack', -1, 'forward1'], ['attack', 1, 'forward1']],

    //for pawns that have not made a move yet, they can move one step further than ones who have
    pawnNew: [['disarmed', 0, 'forward1'], ['disarmed', 0, 'forward2'], ['attack', -1, 'forward1'], ['attack', 1, 'forward1']],

    //can only move to the tiles diagonal to it.
    bishop: [['vector', 1, 1], ['vector', -1, 1], ['vector', -1, -1], ['vector', 1, -1]],

    //can only move in an "L"-shaped pattern
    knight: [['normal', -1, -2], ['normal', 1, -2], ['normal', -2, -1], ['normal', 2, -1],
    ['normal', -2, 1], ['normal', 2, 1], ['normal', -1, 2], ['normal', 1, 2]],

    //moves in the four cardinal directions
    rook: [['vector', 1, 0], ['vector', 0, -1], ['vector', -1, 0], ['vector', 0, 1]],

    //moves in the four cardinal directions and to tiles diagonal to it
    queen: [['vector', 1, 0], ['vector', 1, -1], ['vector', 0, -1], ['vector', -1, -1],
    ['vector', -1, 0], ['vector', -1, 1], ['vector', 0, 1], ['vector', 1, 1]],

    //can move one tile in any direction
    king: [['normal', 1, 0], ['normal', 1, -1], ['normal', 0, -1], ['normal', -1, -1],
    ['normal', -1, 0], ['normal', -1, 1], ['normal', 0, 1], ['normal', 1, 1]],

    //stores the timeout for the ai to make a move
    moveWait: null,

    /**
     * Gets all the valid moves of a piece on the board
     * @param {object} pieceData The data object {x, y, piece, color} of the piece that will be evaluated
     * @returns {array} All the tile elements the piece can move to
     */
    getAllMoveTiles: (pieceData) => {
        //the array that will store all the tile elements the piece can move to
        let moveTiles = [];

        //getting the move set of the piece
        let moves = pieceMovement[pieceData.piece];

        //looping through each of the piece's move sets
        for (let move of moves) {
            let availableTiles = pieceMovement.getTilesFromMove(pieceData, move);
            //looping through all the tiles the piece can reach from this move set
            for (let currentTile of availableTiles) {
                //only add the tile if it doesn't leave it's king in a vulnerable position
                //and if it is a pawn it meets the requirements to move
                if (!pieceMovement.isKingThreatened(currentTile, pieceData) && pieceMovement.canPawnMove(currentTile, pieceData)) {
                    //returns the element instead of the data as this function will be used outside of this object
                    moveTiles.push(tile.getElement(currentTile.x, currentTile.y));
                }
            }
        }
        return moveTiles;
    },

    getTilesFromMove: (pieceData, move) => {
        //storing all the valid moves in this array
        let moveTiles = [];
        //declaring the variables storing the coordinates of the tiles to check
        let newX = pieceData.x + move[1]; //the x coordinate is always the second element in a moves array
        let newY = pieceMovement.getYMovement(newX, pieceData.y, pieceData, move); //the y coordinate is always the third element in a moves array
        //getting the enemy's color
        let enemyColor = (pieceData.color === 'white') ? 'black' : 'white';

        if (!isNaN(newY) && tile.inBounds(newX, newY)) {
            //getting the piece information at the checked tile, if any
            let checkPiece = chessPiece.findData(newX, newY);

            //checking the rule for the move set
            switch (move[0]) {
                //for moves that add the coordinates to its tile position
                case 'normal':
                    //cannot move to a tile that has a friendly piece
                    if (checkPiece.color !== pieceData.color) {
                        moveTiles.push(checkPiece);
                    }
                    break;
                //for moves that continue to move in a direction until an obstacle is reached
                case 'vector':
                    let vectorTiles = pieceMovement.getTilesFromVector(pieceData, newX, newY, move);
                    //adding all the tiles from this vector to the total tiles this piece can make
                    for (let vectorTile of vectorTiles) {
                        moveTiles.push(vectorTile);
                    }
                    break;
                //for moves that are only valid if an enemy is on the tile
                case 'attack':
                    if (checkPiece.color === enemyColor) {
                        moveTiles.push(checkPiece);
                    }
                    break;
                //for moves that are only valid for empty tiles
                case 'disarmed':
                    if (checkPiece.color === '') {
                        moveTiles.push(checkPiece);
                    }
                    break;
            }
        }
        return moveTiles;
    },

    /**
     * Gets all the tile a piece can move to from a single vector
     * @param {object} pieceData The data object {x, y, piece, color} of the piece that has the vector
     * @param {integer} xStart The x coordinate of the starting position of the vector
     * @param {integer} yStart The t coordinate of the starting position of the vector
     * @param {object} move The vector itself, formatted as ['vector', x, y]
     * @returns {object} An array of all the tiles that can be moved to in this vector
     */
    getTilesFromVector: (pieceData, xStart, yStart, move) => {
        let x = xStart;
        let y = yStart;
        //storing all the tiles 
        let moveTiles = [];
        do {
            checkPiece = chessPiece.findData(x, y);
            //adding the move to the array if the tile is not occupied by a friendly piece
            if (checkPiece.color !== pieceData.color) {
                moveTiles.push(checkPiece);
            }
            //stopping the loop if there is any piece on the tile
            if (checkPiece.color !== '') {
                break;
            }
            //move the coordinates in the direction of the vector
            x += move[1];
            y += move[2];
        }
        //keep the loop going if the coordinates are still on the board
        while (tile.inBounds(x, y));
        return moveTiles;
    },

    getYMovement: (xStart, yStart, pieceData, move) => {
        let y;
        //getting the y axis of the move
        let moveY = move[2];

        if (typeof moveY === 'string' && moveY.includes('forward')) {
            //getting the last character of the forward move, which specifies the number of moves forward it can take
            let forwardAmount = parseInt(moveY[moveY.length - 1]);

            //determines which direction is forward
            let forwardDirection = pieceMovement.getForwardDirection(pieceData.color);

            y = yStart + (forwardAmount * forwardDirection);

            //if the forward value is greater than 1, then all tiles in between will be checked to see if they are blank
            let blockMove = false;
            for (let i = 1; i < forwardAmount && !blockMove; i++) {
                let tileInfo = chessPiece.findData(xStart, yStart + (i * forwardDirection));
                //if there is a friendly piece, or any piece at all if the rule 'disarmed' applies, the tile will be considered blocked
                if (tileInfo.color === pieceData.color || (move[0] === 'disarmed' && tileInfo.color !== '')) {
                    y = NaN;
                    break;
                }
            }
        } else {
            y = yStart + moveY;
        }
        return y;
    },

    /**
     * Gets the forward direction of a piece based on it's color
     * @param {*} color The color of the piece
     * @returns The forward direction of the piece
     */
    getForwardDirection: (color) => {
        let topPosition = localStorage.getItem('topPosition');
        if (color === topPosition) {
            return 1;
        } else {
            return -1;
        }
    },

    /**
     * Checks if a piece can move to a certain tile
     * @param {object} pieceData The data object of the piece looking to attack
     * @param {['rule', x, y]} move The direction the piece has to take to move to the new tile
     * @param {boolean} isBeside If there is only one space between the piece and the tile it wants to move to
     * @returns {boolean} If the attacking tile can attack using its move set
     */
    canAttack: (pieceData, move, isBeside) => {
        //checking the rule of the move
        switch (move[0]) {
            //checks if the attacker is a knight
            case 'normal':
                return (pieceData.piece === 'knight');
            //checks for all the other pieces
            case 'vector':
                let vector1 = move[1];
                let vector2 = move[2];
                //if neither vectors are 0, then the move is diagonal
                let isDiagonal = (Math.abs(vector1) === Math.abs(vector2));

                return (pieceData.piece === 'queen'
                    || (isDiagonal && pieceData.piece === 'bishop')
                    || (!isDiagonal && pieceData.piece === 'rook')
                    || (isBeside && (pieceData.piece === 'king'
                        || (vector1 !== 0 && vector2 === pieceMovement.getForwardDirection(pieceData.color)
                            && pieceData.piece.includes('pawn')))));
        }
    },

    /**
     * Returns if the move will result in a check
     * @param {object} tileData The data object {x, y, piece, color} of the tile the piece is moving to
     * @param {object} pieceMovingData The data object {x, y, piece, color} of the piece that will move to the tile
     * @returns {boolean} If the king is left in a vulnerable position after the move
     */
    isKingThreatened: (tileData, pieceMovingData) => {
        let tileEval;
        //the king's y position at the end of the move
        let kingY;

        if (pieceMovingData.piece !== 'king') {
            //finding the king if it isn't the piece that will move
            let kingData = tile.findKing(pieceMovingData.color);
            //if the piece that is looking to move is not the king, that means the king's position won't change
            kingY = kingData.y;

            //getting the elements of the piece that will move and the tile it will move to
            let tileElement = tile.getElement(tileData.x, tileData.y);
            let pieceElement = chessPiece.findElement(pieceMovingData.x, pieceMovingData.y);
            tileEval = evaluateTileWithMove(kingData, kingData, pieceElement, tileElement);
        } else {
            //if the piece that is looking to move is the king, that means the king's position will change to currentTile's position
            kingY = tileData.y;
            tileEval = evaluateTile(tileData, pieceMovingData);
        }
        for (let threat of tileEval.enemyThreat) {
            //pawns cannot reach the end of the board without a graveyard piece to revive,
            //so if the king is at the end of the board with these conditions it is safe from pawns
            if (!(threat.piece === 'pawn' && chessPiece.isAtBoardEnd(threat.color, kingY) && !graveyard.canRevive(threat.color))) {
                return true;
            }
        }
        return false;
    },

    /**
     * Checks if a pawn is able to move to the end of the board when necessary
     * @param {object} tileData The data object of the tile the piece will move to
     * @param {object} pieceMovingData The data object of the moving piece
     * @returns {boolean} If the pawn can move
     */
    canPawnMove: (tileData, pieceMovingData) => {
        //not a valid move if it is a pawn moving to the end of the board with no pieces to revive
        if (pieceMovingData.piece === 'pawn') {
            if (chessPiece.isAtBoardEnd(pieceMovingData.color, tileData.y) && !graveyard.canRevive(pieceMovingData.color)) {
                return false;
            }
        }
        return true;
    },

    /**
     * Removes any timeout delay for the AI making a move
     */
    clearDelay: () => {
        if (pieceMovement.moveWait !== null) {
            clearTimeout(pieceMovement.moveWait);
            pieceMovement.moveWait = null;
        }
    },
};

const graveyard = {
    add: (graveyardElement, piece) => {
        //the first graveyard always has black pieces in it, and the second always has white
        let color = (graveyardElement.id === 'player1-graveyard') ? 'black' : 'white';

        //creating the element to be put in the graveyard
        let deadPiece = document.createElement('div');

        //making pawns and new pawns the same for the image address
        let pieceImage = piece;
        if (pieceImage === 'pawnNew') {
            pieceImage = 'pawn';
        }

        //creating the classes to style and access the piece
        deadPiece.className = `piece-dead dead-${pieceImage}`;
        //creating the image url to access the particular piece
        deadPiece.style.backgroundImage = `url(assets/images/chess-pieces/${color}-${pieceImage}.png)`;

        graveyardElement.appendChild(deadPiece);
    },

    revive: (pawnElement) => {
        //adding the revive id to the pawn to replace it once a new piece has been picked
        pawnElement.id = 'promoting';

        //getting the information about the pawn
        let pawnData = tile.getData(pawnElement.parentNode);

        //getting the appropriate graveyard for the player
        let graves = getGraveyardElements(pawnData.color);

        //if the pawn that moved to the other side belongs to a player, then initiate the ui for reviving a piece
        if (localStorage.getItem(pawnData.color) === 'player') {
            for (let grave of graves) {
                //the player can only revive pieces that are not pawns
                let graveClass = grave.className;
                if (!graveClass.includes('dead-pawn')) {
                    //adding the function to bring the selected piece back when the player clicks on the graveyard element
                    grave.addEventListener('click', revivePlayer);

                    //adding the clickable class to the graveyard pieces to change the mouse cursor when you hover over it
                    grave.classList.add('clickable');
                }
            }
        } else {
            //finding the piece with the highest value
            let highestValue = 0;
            //getting a list of pieces with the highest value and picking one at random
            let highestPieces = [];
            for (let grave of graves) {
                //getting the name of the current piece in the graveyard
                let gravePiece = graveyard.getDeadPiece(grave);

                if (gravePiece !== 'pawn' && chessPiece.value[gravePiece] >= highestValue) {
                    if (chessPiece.value[gravePiece] > highestValue) {
                        //resetting the pieces to select from if there is a piece with a higher value
                        highestPieces = [];
                        highestValue = chessPiece.value[gravePiece];
                    }
                    highestPieces.push(grave);
                    //stopping the loop if the piece is a queen because it has the best value
                    if (gravePiece === 'queen') {
                        break;
                    }
                }
            }

            let finalDecision = Math.floor(Math.random() * highestPieces.length);
            graveyard.replaceWithDead(highestPieces[finalDecision]);

            //continuing on with the game after a decision has been made
            nextTurn();
        }
    },

    /**
     * Checks if there is a piece in the graveyard that the player can revive
     * @param {string} color The color of the player that is running the function
     * @returns {boolean} If there are pieces in the graveyard the player can revive
     */
    canRevive: (color) => {
        let hasDeadPieces = false;
        let graves = getGraveyardElements(color);

        for (let grave of graves) {
            let gravePiece = graveyard.getDeadPiece(grave);
            //pawns don't count as they cannot be revived
            if (gravePiece !== 'pawn') {
                hasDeadPieces = true;
                break;
            }
        }
        return hasDeadPieces;
    },

    /**
     * Gets the piece name of an element in the graveyard
     * @param {object} deadPiece The element of the dead piece
     * @returns {string} The piece name in string form
     */
    getDeadPiece: (deadPiece) => {
        let classes = deadPiece.classList;
        let typeClass = '';
        for (let myClass of classes) {
            //pieces in the graveyard have a class of 'dead-' followed by their piece name
            if (myClass.includes('dead-')) {
                typeClass = myClass;
                break;
            }
        }
        //removes the 'dead-' part of the class to get the piece name
        typeClass = typeClass.replace('dead-', '');
        return typeClass;
    },

    /**
     * Replaces the pawn that has reached the other side of the board with a piece from the graveyard
     * @param {object} deadPiece The element of the dead piece you wish to replace the pawn with
     */
    replaceWithDead: (deadPiece) => {
        //finds the piece name of the clicked on element
        let pieceName = graveyard.getDeadPiece(deadPiece);

        //getting the pawn which reached the end of the board
        let pawnElement = document.getElementById('promoting');

        //replacing it's piece type with the selected dead piece
        chessPiece.setPieceType(pawnElement, pieceName);

        //removing the 'promoting' id from the piece
        pawnElement.removeAttribute('id');

        //removing the grave piece from the graveyard
        deadPiece.remove();
    },

    /**
     * Removes all graveyard pieces from the game
     */
    clearAll: () => {
        //finds every graveyard piece on both sides
        let graveyardPieces = document.getElementsByClassName('piece-dead');
        //removing them one by one
        while (graveyardPieces.length > 0) {
            graveyardPieces[0].remove();
        }
    }
};

const pieceAnimation = {
    //will be used to store the animation functions in order to stop it once it's done
    activeAnimations: [],
    //will increment for every animation. this will give each animation a unique id which
    //will be used to access it when you want an animation to stop
    animationId: 0,

    /**
     * Starts an animation
     * @param {object} pieceElement The element of the piece that will move
     * @param {object} endTileElement The element the animation will end on
     */
    start: (pieceElement, endTileElement) => {
        //storing the frame position in the session storage
        sessionStorage.setItem(`animFrame-${pieceAnimation.animationId}`, '0');

        //storing the id and function of the animation in an object to be accessed when the animation ends
        let animationData = {
            interval: setInterval(pieceAnimation.nextFrame, 1, pieceAnimation.animationId, pieceElement, endTileElement),
            id: pieceAnimation.animationId
        };

        //changing the z index of the moving piece so it appears above all of the other pieces
        pieceElement.style.zIndex = '2';

        //adding the object to the activeAnimations array
        pieceAnimation.activeAnimations.push(animationData);

        //increasing the id by 1 and resetting once it reaches 1000
        pieceAnimation.animationId++;
        if (pieceAnimation.animationId >= 1000) {
            pieceAnimation.animationId = 0;
        }
    },

    /**
     * Progresses through the animation
     * @param {object} animId The animation id used to locate the animation interval
     * @param {object} pieceElement The element undergoing the animation
     * @param {object} endTileElement The tile the animation will finish on
     */
    nextFrame: (animId, pieceElement, endTileElement) => {
        let frame = parseInt(sessionStorage.getItem(`animFrame-${animId}`));

        pieceAnimation.setPosition(pieceElement, endTileElement, frame);

        frame++;
        if (frame >= animationTime) {
            pieceAnimation.end(animId, pieceElement, endTileElement);
        } else {
            sessionStorage.setItem(`animFrame-${animId}`, frame);
        }
    },

    /**
     * Sets the size and position of the animation piece, based on the frame
     * @param {object} tileStart The tile the animation started on
     * @param {object} tileEnd The tile the animation will finish on
     * @param {integer} frame The frame the animation is currently on
     */
    set: (pieceElement, endTileElement, frame) => {
        //changing the width and height
        //pieceAnimation.setSize(tileStart);

        //changing the position
        pieceAnimation.setPosition(pieceElement, endTileElement, frame);
    },

    /**
     * Sets the size of the animation piece to match it's starting tile
     * @param {object} tileStart The tile the animation started on
     */
    setSize: (tileStart) => {
        //getting the id of the animation element
        let animatePiece = document.getElementById('piece-moving');

        //element.offsetWidth source: https://softauthor.com/javascript-get-width-of-an-html-element/#using-innerwidth
        animatePiece.style.width = `${tileStart.offsetWidth}px`;
        animatePiece.style.height = `${tileStart.offsetHeight}px`;
    },

    /**
     * Sets the position of the animation piece, based on the frame
     * @param {object} pieceElement The element undergoing the animation
     * @param {object} endTileElement The tile the animation will finish on
     * @param {integer} frame The frame the animation is currently on
     */
    setPosition: (pieceElement, endTileElement, frame) => {
        //getting the starting tile of the piece element, which is simply it's parent
        let startingTile = pieceElement.parentNode;

        //getting the position of both the start and end elements
        //source: https://stackoverflow.com/questions/442404/retrieve-the-position-x-y-of-an-html-element
        let startPosition = startingTile.getBoundingClientRect();
        let endPosition = endTileElement.getBoundingClientRect();

        //gets the start and end positions of the animation
        let xStart = startPosition.left;
        let yStart = startPosition.top;
        let xEnd = endPosition.left;
        let yEnd = endPosition.top;

        //finds the distance between the start and end position
        let xDistance = xEnd - xStart;
        let yDistance = yEnd - yStart;

        //the animation speeds up until it reaches the halfway point and then slows down to a stop
        //think of it like a point moving around a circle from one side to the other,
        //but remove one axis so it moves in a straight line
        //in this case "frame" is the angle of the point on this theoretical circle
        let frameRadians = (frame / animationTime) * Math.PI; //pi radians is equal to 180 degrees, which would be the full length of the circle

        //using "cos" for both x and y as we are only interested in one axis
        let x = (xDistance / 2) - (Math.cos(frameRadians) * (xDistance / 2));
        let y = (yDistance / 2) - (Math.cos(frameRadians) * (yDistance / 2));

        //setting the css style for the position of the element
        pieceElement.style.top = `${y}px`;
        pieceElement.style.left = `${x}px`;
    },

    /**
     * Calls the end of the piece animation
     * @param {object} animId The animation id used to locate the animation interval
     * @param {object} pieceElement The element undergoing the animation
     * @param {object} endTileElement The tile the animation will finish on
     */
    end: (animId, pieceElement, endTileElement) => {
        //removes the frame position from session storage
        sessionStorage.removeItem(`animFrame-${animId}`);

        //removing the z index style
        pieceElement.style.removeProperty('z-index');

        //finding the function of this specific animation in activeAnimations using the id
        for (let i in pieceAnimation.activeAnimations) {
            let animate = pieceAnimation.activeAnimations[i];
            if (animate.id === animId) {
                //stopping the interval
                clearInterval(animate.interval);
                //removing the animation from activeAnimations
                pieceAnimation.activeAnimations.splice(i, 1);
            }
        }

        chessPiece.changeTile(pieceElement, endTileElement);
    },

    /**
     * Clears all active animations
     */
    clear: () => {
        //continue deleting the animations until there are none left
        while (pieceAnimation.activeAnimations.length > 0) {
            let animate = pieceAnimation.activeAnimations[0];
            //stopping the interval
            clearInterval(animate.interval);
            //removing the animation from activeAnimations
            pieceAnimation.activeAnimations.shift();
        }
        //resetting the animation id
        pieceAnimation.animationId = 0;
    }
};