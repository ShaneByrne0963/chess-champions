//object that stores tile functions
const tile = {
    /**
     * Gets the element of a piece located on a specified tile
     * @param {object} tileElement The element of the tile you wish to check
     * @returns The element of the piece on the tile, or null if there is none
     */
    getPieceElement: (tileElement) => {
        let tileChildren = tileElement.children;

        //looping through each child element to check if it is a chess piece
        for (let child of tileChildren) {
            //checking if the child element is a chess piece using its classes
            let childClass = child.classList;
            if (childClass.contains('chess-piece')) {
                //getting the information of the piece that was found
                return child;
            }
        }
        return null;
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
            //checking if the king's color matches the specified color
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

        //keep removing the elements from the DOM until there are none left
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

        //only select the tile if the player making the turn is a human
        if (localStorage.getItem(pieceData.color) === 'player') {
            //creates another div that will display the highlighted color
            let selectDiv = document.createElement('div');
            selectDiv.id = 'tile-selected';
            pieceElement.appendChild(selectDiv);

            //adding move icons to each possible move
            let possibleMoves = pieceMovement.getAllMoveTiles(pieceData);
            tile.addMoveIcons(pieceData, possibleMoves);
        }
    },

    /**
     * Removes the highlight from the selected tile and any possible move icons
     */
    deselectAll: () => {
        //removing the selected tile highlight
        let selectExisting = document.getElementById('tile-selected');
        if (selectExisting) {
            selectExisting.remove();
        }
        //removing the possible move icons
        let movesExisting = document.getElementsByClassName('possible-move');
        while (movesExisting.length > 0) {
            //removing the 'clickable' class from the tile the move icon is on
            let moveParent = movesExisting[0].parentNode;
            if (moveParent.classList.contains('clickable')) {
                tile.removeInteraction(moveParent);
            } else {
                let pieceData = tile.getData(moveParent.parentNode);
                let playerTurn = getPlayerTurn();

                //if the piece at this tile does not belong to the player that is making the move, remove it's interaction
                if (pieceData.color !== playerTurn.color) {
                    tile.removeInteraction(moveParent.parentNode);
                }
            }
            movesExisting[0].remove();
        }
    },

    /**
     * Adds the possible move icons for a selected piece
     * @param {object} pieceData The data object {x, y, piece, color} piece that is selected
     * @param {object} moves An array of all the tile elements the piece can move to
     */
    addMoveIcons: (pieceData, moves) => {
        for (let move of moves) {
            //creating a div displaying an image on every possible move
            let moveOption = document.createElement('div');
            moveOption.className = "possible-move";
            //adding the castling class to the possible move icon if the piece color of the two tiles match
            let moveData = tile.getData(move);
            if (moveData.color === pieceData.color) {
                moveOption.className += " castling";
            }
            //adding the possible-passant class to the move icon if it is a passant move
            if (pieceData.piece === 'pawn' && pieceData.x !== moveData.x && moveData.color === '') {
                let passantType = (pieceMovement.getForwardDirection(pieceData.color) < 0) ? ' passant-bottom' : ' passant-top';
                moveOption.className += passantType;
            }

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
        newPiece.className = `chess-piece ${color} ${piece} not-moved`;

        //finding the correct image using pieceImage and color
        chessPiece.setImage(newPiece, piece, color);

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

        //loops through the children to find a piece
        let tileChildren = tileElement.children;
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
        if (pieceElement !== null) {
            let tileClass = pieceElement.classList;
            //searching through all the classes until one matches one of the piece types
            return chessPiece.getTypeFromClass(tileClass);
        }
        return '';
    },

    /**
     * Gets the value of a piece, taking a pawn's tile position into consideration
     * @param {object} pieceData The data object {x, y, piece, color} of the piece
     * @returns {integer} The value of the piece
     */
    getValue: (pieceData) => {
        if (pieceData.piece === 'pawn') {
            //the further the pawn is down the board, the higher the value
            return chessPiece.value[pieceData.piece] + findPawnScore(pieceData, pieceData);
        } else {
            return chessPiece.value[pieceData.piece];
        }
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
            let pieceNames = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
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
        //removing the original piece type from the element
        let oldPiece = chessPiece.getTypeFromClass(pieceElement.classList);
        pieceElement.classList.remove(oldPiece);
        //and replacing it with the new one
        pieceElement.classList.add(newPiece);

        //updating the piece image
        let pieceData = tile.getData(pieceElement.parentNode);
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
        //stops any countdown timer
        if (getHumanPlayers() === 2 && localStorage.getItem('timeLimit') === 'enabled') {
            let playerTurn = getPlayerTurn();
            timer.stop(playerTurn.place);
        }
        //removes the announce-new class from all announcements
        clearNewAnnouncements();

        //first removing the 'clickable' class from all of the pieces to stop player input until it's their turn again
        tile.removeAllInteraction();
        //removing the not-moved class from the piece after it makes its first move
        pieceElement.classList.remove('not-moved');

        //setting and removing the passant class from pawns when necessary
        if (localStorage.getItem('passant') === 'enabled') {
            chessPiece.clearPassant();
            let pieceType = chessPiece.getTypeFromClass(pieceElement.classList);
            if (pieceType === 'pawn') {
                let pieceY = tile.getY(pieceElement.parentNode);
                let tileY = tile.getY(newTileElement);

                //if the pawn moves 2 tiles, then it enables en passant
                if (Math.abs(tileY - pieceY) === 2) {
                    pieceElement.classList.add('passant');
                }
            }
        }
        if (!pieceMovement.isCastlingMove(pieceElement, tile.getPieceElement(newTileElement))) {
            //starting the movement animation if it is a normal move
            pieceAnimation.start('endTurn', pieceElement, newTileElement);
        }
    },

    /**
     * Finishes a piece moving to a different tile by setting it to the tile's parent
     * and destroying any piece that was already on it
     * @param {object} pieceElement The element of the piece that is moving
     * @param {object} newTileElement The element of the tile the piece is moving to
     * @param {boolean} endTurn If the tile change will end the player's turn
     */
    changeTile: (pieceElement, newTileElement, endTurn) => {
        //checking if the tile has another piece on it, and destroying it if it does
        let otherPiece = tile.getPieceElement(newTileElement);
        if (otherPiece !== null) {
            chessPiece.destroy(otherPiece);
        } else {
            //if the move is en passant, remove the pawn that the piece just passed
            let pieceData = tile.getData(pieceElement.parentNode);
            if (pieceData.piece === 'pawn') {
                let newTileData = tile.getData(newTileElement);
                if (newTileData.x !== pieceData.x) {
                    //The passant pawn will have the finishing tile's x coordinate and the starting tile's y coordinate
                    let passantElement = chessPiece.findElement(newTileData.x, pieceData.y);
                    chessPiece.destroy(passantElement);
                }
            }
        }
        //changing the parent of the chess piece to the new tile
        newTileElement.appendChild(pieceElement);
        //removing the position style properties set during the animation
        pieceElement.style.removeProperty('left');
        pieceElement.style.removeProperty('top');

        //reviving pieces if the pawn reaches the other side of the board
        let pieceData = tile.getData(pieceElement.parentNode);
        let newYPosition = tile.getY(newTileElement);
        let pawnPromote = false;
        if (pieceData.piece === 'pawn') {
            //checking if the pawn is at the end of the board to initite the piece revive sequence
            if (chessPiece.isAtBoardEnd(pieceData.color, newYPosition)) {
                pawnPromote = true;
                //promotes the pawn depending on the 'pawnPromotion' setting
                if (localStorage.getItem('pawnPromotion') === 'any') {
                    chessPiece.promotePawn(pieceElement);
                } else {
                    graveyard.revive(pieceElement);
                }
            }
        }
        //if a pawn has moved to the other side of the board, stop the game until a piece to promote the pawn to has been selected.
        if (endTurn && !pawnPromote) {
            nextTurn();
        }
    },

    /**
     * Promotes a pawn when it reaches the other side of the board
     * @param {object} pieceElement The pawn's element
     */
    promotePawn: (pieceElement) => {
        let color = chessPiece.getColor(pieceElement);

        //if the piece belongs to a human player, enable the banner to select a piece
        if (localStorage.getItem(color) === 'player') {
            pieceElement.id = 'promoting';
            setBanner('Pawn Promoted!', 'Select one of the following to promote your pawn to:', color);
        } else {
            //changing the piece to a queen if it is the computer
            chessPiece.setPieceType(pieceElement, 'queen');
            nextTurn();
        }
    },

    /**
     * Promotes a player pawn to a specified piece
     * @param {string} piece The piece you wish to promote the pawn to
     */
    promotePlayerPawn: (piece) => {
        //getting the pawn which reached the end of the board
        let pawnElement = document.getElementById('promoting');

        //replacing it's piece type with the selected dead piece, and removing the promoting id
        chessPiece.setPieceType(pawnElement, piece);
        pawnElement.removeAttribute('id');
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

        announceElimination(pieceData);
        pieceElement.remove();
    },

    /**
     * Gets if a certain tile is at the end of the board
     * @param {string} color The color of the piece
     * @param {integer} y The y position of the piece
     * @returns {boolean} if the given tile has reached the end of the board
     */
    isAtBoardEnd: (color, y) => {
        let topColor = localStorage.getItem('topPosition');
        //if the player started on the top, then the end of the board is at the bottom. if not then the end is at the top
        let endPosition = (color === topColor) ? boardSize - 1 : 0;
        return (y === endPosition);
    },

    /**
     * Finds the piece with the lowest value in an array
     * @param {object} pieces The tile data {x, y, piece, color} of all the pieces to be checked
     * @returns An array containing the lowest value and it's position on the pieces array [lowestValue, lowestPosition]
     */
    findLowestValue: (pieces) => {
        let lowestValue = chessPiece.getValue(pieces[0]);
        let lowestPosition = 0;

        //iterating through the array, noting the element with the lowest value
        for (let i = 1; i < pieces.length; i++) {
            let currentPiece = pieces[i];
            let pieceValue = chessPiece.getValue(currentPiece);
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

        //adding all the piece data objects of the specified color to this array
        for (let element of pieceElements) {
            pieces.push(tile.getData(element.parentNode));
        }

        return pieces;
    },

    /**
     * Clears the passant class from all pawns
     */
    clearPassant: () => {
        let pawns = document.getElementsByClassName('passant');
        for (let pawn of pawns) {
            pawn.classList.remove('passant');
        }
    }
};

//stores all the functions in relation to the movement of the pieces
//will primarily work with piece data objects {x, y, piece, color}
const pieceMovement = {
    /*chess move rules:
        - 'normal' means add the following coordinates to the current tile
        - 'first' means the move is only possible on the piece's first move
        - 'attack' means the piece can only move to the tile if an enemy is on it
        - 'disarmed' means the piece cannot move to the tile if an enemy is on it
        - 'vector' means continue in that direction until an obstacle is reached
        - 'forward' means in the direction of the enemy side, followed by a number which is the number of steps*/
    pawn: [['disarmed', 0, 'forward1'], ['first-disarmed', 0, 'forward2'], ['attack', -1, 'forward1'], ['attack', 1, 'forward1']],

    //can only move to the tiles diagonal to it.
    bishop: [['vector', 1, 1], ['vector', -1, 1], ['vector', -1, -1], ['vector', 1, -1]],

    //can only move in an "L"-shaped pattern
    knight: [['normal', -1, -2], ['normal', 1, -2], ['normal', -2, -1], ['normal', 2, -1],
    ['normal', -2, 1], ['normal', 2, 1], ['normal', -1, 2], ['normal', 1, 2]],

    //moves in the four cardinal directions
    rook: [['vector', 1, 0], ['vector', 0, -1], ['vector', -1, 0], ['vector', 0, 1],
    ['first-castle', -1, 0], ['first-castle', 1, 0]], //castling moves

    //moves in the four cardinal directions and to tiles diagonal to it
    queen: [['vector', 1, 0], ['vector', 1, -1], ['vector', 0, -1], ['vector', -1, -1],
    ['vector', -1, 0], ['vector', -1, 1], ['vector', 0, 1], ['vector', 1, 1]],

    //can move one tile in any direction
    king: [['normal', 1, 0], ['normal', 1, -1], ['normal', 0, -1], ['normal', -1, -1],
    ['normal', -1, 0], ['normal', -1, 1], ['normal', 0, 1], ['normal', 1, 1],
    ['first-castle', -1, 0], ['first-castle', 1, 0]], //castling moves

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
                //only add the tile if it doesn't leave it's king in a vulnerable position and, if it is a pawn, meets the requirements to move
                if (!pieceMovement.isKingThreatened(currentTile, pieceData) && pieceMovement.canPawnMove(currentTile, pieceData)) {
                    moveTiles.push(tile.getElement(currentTile.x, currentTile.y));
                }
            }
        }
        return moveTiles;
    },

    /**
     * Gets all the tiles a piece can move to from a single move
     * @param {object} pieceData The data object {x, y, piece, color} of the piece to get the tiles
     * @param {object} move The move the piece will use to find the tiles (see top of pieceMovement object for possible moves)
     * @returns {object} An array of all tile data objects the piece can move to with this move
     */
    getTilesFromMove: (pieceData, move) => {
        //storing all the valid moves in this array
        let moveTiles = [];
        let moveRule = move[0];
        //if the move is only available on the first move, only allow it if the piece hasn't moved yet
        if (moveRule.includes('first')) {
            let pieceElement = chessPiece.findElement(pieceData.x, pieceData.y);
            if (!pieceElement.classList.contains('not-moved')) {
                return moveTiles;
            }
        }
        moveRule = moveRule.replace('first-', '');

        //declaring the variables storing the coordinates of the tiles to check
        let newX = pieceData.x + move[1]; //the x coordinate is always the second element in a moves array
        let newY = pieceMovement.getYMovement(newX, pieceData.y, pieceData, move); //the y coordinate is always the third element in a moves array

        if (!isNaN(newY) && tile.inBounds(newX, newY)) {
            //getting the piece information at the checked tile, if any
            let checkPiece = chessPiece.findData(newX, newY);

            //if the move continues in a direction until an obstacle is met
            if (moveRule === 'vector') {
                let vectorTiles = pieceMovement.getTilesFromVector(pieceData, newX, newY, move);
                for (let vectorTile of vectorTiles) {
                    moveTiles.push(vectorTile);
                }
            } else if (moveRule === 'castle') {
                if (localStorage.getItem('castling') === 'enabled') {
                    let castlePiece = pieceMovement.getCastle(pieceData, move[1]);
                    if (castlePiece !== null) {
                        moveTiles.push(castlePiece);
                    }
                }
            } else if (pieceMovement.canMoveToTile(pieceData, checkPiece, [moveRule, move[1], move[2]])) {
                moveTiles.push(checkPiece);
            }
        }
        return moveTiles;
    },

    /**
     * Gets if a piece is able to move to a certain tile, considering all rules except the 'vector' and 'castle' rule
     * @param {object} pieceData The data object {x, y, piece, color} of the piece looking to move
     * @param {object} tileData The data object {x, y, piece, color} of the tile the piece will move to
     * @param {object} move The move [rule, x, y] the piece will use to get to that tile
     * @returns {boolean} If the piece can move to the tile
     */
    canMoveToTile: (pieceData, tileData, move) => {
        //getting the enemy's color
        let enemyColor = (pieceData.color === 'white') ? 'black' : 'white';
        //checking the rule for the move set
        switch (move[0]) {
            //for moves that add the coordinates to its tile position
            case 'normal':
                //cannot move to a tile that has a friendly piece
                if (tileData.color !== pieceData.color) {
                    return true;
                }
                break;
            //for moves that are only valid if an enemy is on the tile
            case 'attack':
                if (tileData.color === enemyColor) {
                    return true;
                }
                //for en passant
                else if (pieceMovement.canPassant(pieceData, move)) {
                    return true;
                }
                break;
            //for moves that are only valid for empty tiles
            case 'disarmed':
                if (tileData.color === '') {
                    return true;
                }
                break;
            default:
                throw `Error At canMoveToTile: Invalid input ${move[0]}. Aborting..`;
        }
        return false;
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
        let moveTiles = [];
        do {
            let checkPiece = chessPiece.findData(x, y);
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

    /**
     * Gets the y coordinate after a certain move, taking forward movement into consideation
     * @param {integer} xStart The x coordinate of the tile before the move
     * @param {integer} yStart The y coordinate of the tile before the move
     * @param {object} pieceData The data object {x, y, piece, color} of the piece that is doing the evaluation
     * @param {object} move The move that is being made
     * @returns {integer} The y coordinate after the move
     */
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
                //if there is any piece in between the start and end tiles, the tile will be considered blocked
                if (tileInfo.color !== '') {
                    y = NaN;
                    break;
                }
            }
        } else {
            //simply add the vector to the starting coordinate if there is no forward movement involved
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
     * Gets how far a piece is from the start of its side of the board
     * @param {integer} y The y position of the tile
     * @param {string} color The color of the piece, used to determine which side is the start
     * @returns {integer} How far the tile is from the start
     */
    getForwardDistance: (y, color) => {
        let direction = pieceMovement.getForwardDirection(color);
        let yDistance = (direction === 1) ? y : boardSize - 1 - y;
        return yDistance;
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

                if (pieceData.piece === 'queen' || (isDiagonal && pieceData.piece === 'bishop') || (!isDiagonal && pieceData.piece === 'rook') || (isBeside && pieceData.piece === 'king')) {
                    return true;
                } else {
                    //for pawn attacks and en passant
                    if (pieceData.piece === 'pawn' && isBeside) {
                        let pawnDirection = pieceMovement.getForwardDirection(pieceData.color);
                        //for regular pawn attacks
                        if (vector1 !== 0 && vector2 === pawnDirection) {
                            return true;
                        }
                        //for en passant pawn attacks
                        else if (vector2 === 0 && tile.inBounds(pieceData.x + move[1], pawnDirection) && pieceMovement.canPassant(pieceData, ['', move[1], pawnDirection])) {
                            return true;
                        }
                    }
                }
                return false;
            default:
                return false;
        }
    },

    /**
     * Checks if a pawn can en passant another pawn
     * @param {object} pieceData The data object {x, y, piece, color} of the piece looking to move
     * @param {object} move The move [rule, x, y] the piece is using to passant
     * @returns {boolean} If the pawn can successfully en passant another pawn
     */
    canPassant: (pieceData, move) => {
        if (localStorage.getItem('passant') === 'enabled') {
            let enemyColor = (pieceData.color === 'white') ? 'black' : 'white';

            //finding the data object of the piece beside the pawn to see if it is an enemy pawn
            let besideData = chessPiece.findData(pieceData.x + move[1], pieceData.y);
            if (besideData.piece === 'pawn' && besideData.color === enemyColor) {
                //getting the element of this piece to see if it has the passant class
                let besideElement = chessPiece.findElement(besideData.x, besideData.y);
                if (besideElement.classList.contains('passant')) {
                    return true;
                }
            }
        }
        return false;
    },

    /**
     * Returns if the move will result in a check
     * @param {object} tileData The data object {x, y, piece, color} of the tile the piece is moving to
     * @param {object} pieceMovingData The data object {x, y, piece, color} of the piece that will move to the tile
     * @returns {boolean} If the king is left in a vulnerable position after the move
     */
    isKingThreatened: (tileData, pieceMovingData) => {
        let tileEval;
        let kingData;
        if (pieceMovingData.piece !== 'king') {
            //finding the king if it isn't the piece that will move
            kingData = tile.findKing(pieceMovingData.color);

            //getting the elements of the piece that will move and the tile it will move to
            let tileElement = tile.getElement(tileData.x, tileData.y);
            let pieceElement = chessPiece.findElement(pieceMovingData.x, pieceMovingData.y);
            tileEval = evaluateTileWithMove(kingData, kingData, pieceElement, tileElement);
        } else {
            //if the piece that is looking to move is the king, that means the king's position will change to currentTile's position
            kingData = pieceMovingData;
            tileEval = evaluateTile(tileData, pieceMovingData);
        }
        //if pawns can be promoted to any piece, then any threat is considered valid
        if (localStorage.getItem('pawnPromotion') === 'any' && tileEval.enemyThreat.length > 0) {
            return true;
        }
        for (let threat of tileEval.enemyThreat) {
            /*if there is a piece at the tile with a high value that will be eliminated with this move, then the
            enemy pawns will be able to move to the end of the board, possibly making the king vulnerable*/
            let pieceValue = 0;
            if (tileData.piece !== '' && (tileData.x !== pieceMovingData.x || tileData.y !== pieceMovingData.y)) {
                pieceValue = chessPiece.value[tileData.piece];
            }
            /*pawns cannot reach the end of the board without a graveyard piece to revive,
            so if the king is at the end of the board with these conditions it is safe from pawns*/
            if (!(threat.piece === 'pawn' && chessPiece.isAtBoardEnd(threat.color, kingData.y) && !graveyard.canRevive(threat.color) && pieceValue <= chessPiece.value.pawn)) {
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
     * Gets if a piece can perform a castling move, and returns the object it can castle with
     * @param {object} pieceData The data object {x, y, piece, color} of the piece checking for a castling move
     * @param {integer} xDirection The direction (1 or -1) the piece is moving in
     * @returns {object} The data object {x, y, piece, color} of the piece that can castle, or null if none
     */
    getCastle: (pieceData, xDirection) => {
        let castlePiece = null;
        //storing the current x position of the loop
        let xCurrent = pieceData.x;
        while (tile.inBounds(xCurrent, pieceData.y)) {
            let checkingTile = chessPiece.findData(xCurrent, pieceData.y);
            //if an enemy piece can attack any tile in between, then it is not a valid move
            let tileEval = evaluateTile(checkingTile, pieceData);
            if (tileEval.enemyThreat.length > 0) {
                break;
            }
            //if there is a piece at the tile that is not the starting tile
            if (xCurrent !== pieceData.x && checkingTile.piece !== '') {
                if (checkingTile.color === pieceData.color) {
                    //one piece has to be a king and the other has to be a rook
                    if ((checkingTile.piece === 'rook' && pieceData.piece === 'king') || (checkingTile.piece === 'king' && pieceData.piece === 'rook')) {
                        /*getting the elements of each piece to check if either piece has moved
                        if any of the pieces have already moved, then the castle is not valid*/
                        let pieceElement = chessPiece.findElement(pieceData.x, pieceData.y);
                        let checkElement = chessPiece.findElement(xCurrent, pieceData.y);
                        if (pieceElement.classList.contains('not-moved') && checkElement.classList.contains('not-moved')) {
                            castlePiece = checkingTile;
                        }
                    }
                }
                //stop the loop if there is any piece on the tile
                break;
            }
            //moving on to the next tile if nothing was hit
            xCurrent += xDirection;
        }
        return castlePiece;
    },

    /**
     * Checks if a move is a castling move, and performs it if it is
     * @param {object} firstPiece The element of the first piece
     * @param {object} secondPiece The element of the second piece
     * @returns {boolean} True if the castling move was successful
     */
    isCastlingMove: (firstPiece, secondPiece) => {
        //checking if both piece elements exist
        if (firstPiece !== null && secondPiece !== null) {
            //if the pieces at both tiles have the same color, then it is a castling move
            let firstData = tile.getData(firstPiece.parentNode);
            let secondData = tile.getData(secondPiece.parentNode);
            if (firstData.color === secondData.color) {
                //removing the not-moved class from the second piece as it is also making a move
                secondPiece.classList.remove('not-moved');
                //finding out which piece is the king and which is the rook
                let kingElement, rookElement, kingData, rookData;
                if (firstData.piece === 'king') {
                    kingElement = firstPiece;
                    rookElement = secondPiece;
                    kingData = firstData;
                    rookData = secondData;
                } else {
                    kingElement = secondPiece;
                    rookElement = firstPiece;
                    kingData = secondData;
                    rookData = firstData;
                }
                let kingDirection = 1;
                //reversing the king direction if the king is more to the right than the rook
                if (kingData.x > rookData.x) {
                    kingDirection = -1;
                }
                //the king always moves 2 tiles in a castling move
                let kingMoveTile = tile.getElement(kingData.x + (kingDirection * 2), kingData.y);
                //the rook will always be 1 tile beside the king's original tile, in the king's direction
                let rookMoveTile = tile.getElement(kingData.x + kingDirection, kingData.y);

                //starting both animations, with only one animation ending the turn to prevent nextTurn being called twice
                pieceAnimation.start('normal', kingElement, kingMoveTile);
                pieceAnimation.start('endTurn', rookElement, rookMoveTile);
                return true;
            }
        }
        return false;
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

//the object that stores functions related to the players' graveyards
const graveyard = {
    //used the store the reference to any flashing interval while the user is picking a piece to revive
    flashInterval: null,

    /**
     * Adds a piece to a specified graveyard
     * @param {object} graveyardElement The element of the graveyard that will get the new piece
     * @param {string} piece The type of piece to be added
     */
    add: (graveyardElement, piece) => {
        //the first graveyard always has black pieces in it, and the second always has white
        let color = (graveyardElement.id === 'player1-graveyard') ? 'black' : 'white';

        //creating the element to be put in the graveyard
        let deadPiece = document.createElement('div');
        deadPiece.className = `piece-dead dead-${piece}`;
        //creating the image url to access the particular piece
        deadPiece.style.backgroundImage = `url(assets/images/chess-pieces/${color}-${piece}.png)`;

        graveyardElement.appendChild(deadPiece);
    },

    /**
     * Gets the graveyard elements of a certain player
     * @param {string} color The color of the player
     * @returns {object} an array of graveyard piece elements
     */
    getElements: (color) => {
        let graveyardDiv = (color === 'black') ? document.getElementById('player1-graveyard') : document.getElementById('player2-graveyard');
        let graves = graveyardDiv.children;

        return graves;
    },

    /**
     * initiates the pawn revival sequence to bring one of the pieces from the graveyard back to the board
     * @param {object} pawnElement The element of the pawn that will be replaced
     */
    revive: (pawnElement) => {
        //adding the revive id to the pawn to replace it once a new piece has been picked
        pawnElement.id = 'promoting';

        //getting the information about the pawn
        let pawnData = tile.getData(pawnElement.parentNode);

        //getting the appropriate graveyard icons for the player
        let graves = graveyard.getElements(pawnData.color);

        //if the pawn that moved to the other side belongs to a player, then initiate the ui for reviving a piece
        if (localStorage.getItem(pawnData.color) === 'player') {
            //adds event listeners to all the pieces the player can revive
            graveyard.pickDeadPiece(graves);
        } else {
            //finds the best piece it can revive in the graveyard
            let bestPiece = graveyard.findBestDeadPiece(graves);
            graveyard.replaceWithDead(bestPiece);
            nextTurn();
        }
    },

    /**
     * Adds event listeners to the appropriate dead piece elements to allow piece revival
     * @param {object} graves An array of all the player's dead pieces
     */
    pickDeadPiece: (graves) => {
        //adds the banner that notifies the player to pick a piece from the graveyard
        setBanner('Pawn Promoted!', 'Select a piece from the graveyard to bring back to the battlefield!', '');
        //starts the flash animation
        graveyard.flashInterval = setInterval(graveyard.updateFlash, flashTime);
        for (let grave of graves) {
            let graveClass = grave.className;
            //the player can only revive pieces that are not pawns
            if (!graveClass.includes('dead-pawn')) {
                //adding the function to bring the selected piece back when the player clicks on the graveyard element
                grave.addEventListener('click', revivePlayer);
                grave.classList.add('clickable');
            }
        }
    },

    /**
     * Finds the best piece that can be revived in the graveyard
     * @param {object} graves An array of all the player's dead pieces
     * @returns {object} The element of the graveyard piece best suited for revival
     */
    findBestDeadPiece: (graves) => {
        let highestValue = 0;
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
                //stopping the loop if the piece is a queen because it has the highest value
                if (gravePiece === 'queen') {
                    break;
                }
            }
        }
        //picking one of the best pieces it can revive and returning it
        return highestPieces[Math.floor(Math.random() * highestPieces.length)];
    },

    /**
     * Checks if there is a piece in the graveyard that the player can revive
     * @param {string} color The color of the player that is running the function
     * @returns {boolean} If there are pieces in the graveyard the player can revive
     */
    canRevive: (color) => {
        //if pawn promotion is set to any, then it is not necessary to have a piece in the graveyard to promote
        if (localStorage.getItem('pawnPromotion') === 'any') {
            return true;
        }
        //if there is a piece in the graveyard the player can revive
        let graves = graveyard.getElements(color);
        for (let grave of graves) {
            let gravePiece = graveyard.getDeadPiece(grave);
            //pawns don't count as they cannot be revived
            if (gravePiece !== 'pawn') {
                return true;
            }
        }
        return false;
    },

    /**
     * Creates a flashing effect behind pieces that can be revived to draw the user's attention to them
     */
    updateFlash: () => {
        let flashingElements = document.getElementsByClassName('dead-highlight');
        if (flashingElements.length > 0) {
            //removing the 'dead-highlight' class from all graveyard elements
            while (flashingElements.length > 0) {
                flashingElements[0].classList.remove('dead-highlight');
            }
        } else {
            //adding the 'dead-highlight' class to any graveyard elements that can be revived
            let currentPlayer = getPlayerTurn();
            let graveyardElements = graveyard.getElements(currentPlayer.color);
            //iterating through all the grave icons to find the ones that are not pawns
            for (let grave of graveyardElements) {
                let pieceType = graveyard.getDeadPiece(grave);
                if (chessPiece.value[pieceType] > 100) {
                    grave.classList.add('dead-highlight');
                }
            }
        }
    },

    /**
     * Stops the piece revive flash animation
     */
    stopFlash: () => {
        //stopping the interval and removing it from memory
        if (graveyard.flashInterval !== null) {
            clearInterval(graveyard.flashInterval);
            graveyard.flashInterval = null;
        }
        //removing the 'dead-highlight' class from all graveyard elements
        let flashingElements = document.getElementsByClassName('dead-highlight');
        if (flashingElements.length > 0) {
            while (flashingElements.length > 0) {
                flashingElements[0].classList.remove('dead-highlight');
            }
        }
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
        let pieceName = graveyard.getDeadPiece(deadPiece);
        //promoting the pawn that has moved to the end of the board
        chessPiece.promotePlayerPawn(pieceName);
        deadPiece.remove();
    },

    /**
     * Removes all graveyard pieces from the game
     */
    clearAll: () => {
        //finds every graveyard piece on both sides
        let graveyardPieces = document.getElementsByClassName('piece-dead');
        while (graveyardPieces.length > 0) {
            graveyardPieces[0].remove();
        }
    }
};

//the object that contains the functions related to the piece movement from one tile to another
const pieceAnimation = {
    //will be used to store the animation functions in order to stop it once it's done
    activeAnimations: [],
    //will increment for every animation. this will give each animation a unique id which will be used to access it when you want an animation to stop
    animationId: 0,

    /**
     * Starts an animation
     * @param {string} animType The type of animation ('normal', 'endTurn') that will determine what happens after it finishes
     * @param {object} pieceElement The element of the piece that will move
     * @param {object} endTileElement The element the animation will end on
     */
    start: (animType, pieceElement, endTileElement) => {
        //storing when the animation started in the session storage
        sessionStorage.setItem(`anim-${pieceAnimation.animationId}`, Date.now());

        //storing the id and function of the animation in an object to be accessed when the animation ends
        let animationData = {
            interval: setTimeout(pieceAnimation.nextFrame, 1, animType, pieceAnimation.animationId, pieceElement, endTileElement),
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
     * @param {string} animType The type of animation, that will determine what happens after it finishes
     * @param {object} animId The animation id used to locate the animation interval
     * @param {object} pieceElement The element undergoing the animation
     * @param {object} endTileElement The tile the animation will finish on
     */
    nextFrame: (animType, animId, pieceElement, endTileElement) => {
        //the frame position is the current time minus the time when the animation started
        let startTime = parseInt(sessionStorage.getItem(`anim-${animId}`));
        let frame = Date.now() - startTime;
        pieceAnimation.setPosition(pieceElement, endTileElement, frame);

        if (frame >= animationTime) {
            pieceAnimation.end(animType, animId, pieceElement, endTileElement);
        } else {
            //starting another timeout to resemble an interval
            let animData = pieceAnimation.activeAnimations[pieceAnimation.getIntervalPosition(animId)];
            animData.interval = setTimeout(pieceAnimation.nextFrame, 1, animType, animId, pieceElement, endTileElement);
        }
    },

    /**
     * Gets the position of a certain interval in the pieceAnimation.activeAnimations array
     * @param {integer} animId The id of the animation
     * @returns {integer} The position of this animation in the array
     */
    getIntervalPosition: (animId) => {
        //iterates through all the elements in the activeAnimations array until the piece they are looking for is found
        if (pieceAnimation.activeAnimations.length > 0) {
            for (let i = 0; i < pieceAnimation.activeAnimations.length; i++) {
                let anim = pieceAnimation.activeAnimations[i]
                if (anim.id === animId) {
                    return i;
                }
            }
        }
        return -1;
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

        //finds the distance between the start and end position
        let xStart = startPosition.left;
        let yStart = startPosition.top;
        let xEnd = endPosition.left;
        let yEnd = endPosition.top;
        let xDistance = xEnd - xStart;
        let yDistance = yEnd - yStart;

        /*the animation speeds up until it reaches the halfway point and then slows down to a stop
            think of it like a point moving around a circle from one side to the other,
            but remove one axis so it moves in a straight line
            in this case "frame" is the angle of the point on this theoretical circle*/
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
     * @param {string} animType The type of animation, that will determine what happens after it finishes
     * @param {object} animId The animation id used to locate the animation interval
     * @param {object} pieceElement The element undergoing the animation
     * @param {object} endTileElement The tile the animation will finish on
     */
    end: (animType, animId, pieceElement, endTileElement) => {
        //removes the frame starting time from session storage
        sessionStorage.removeItem(`anim-${animId}`);

        //removing the z index style
        pieceElement.style.removeProperty('z-index');

        //finding the function of this specific animation in activeAnimations using the id
        for (let i = 0; i < pieceAnimation.activeAnimations.length; i++) {
            let animate = pieceAnimation.activeAnimations[i];
            if (animate.id === animId) {
                //stopping the interval
                clearTimeout(animate.interval);
                //removing the animation from activeAnimations
                pieceAnimation.activeAnimations.splice(i, 1);
            }
        }
        //determining the action at the end of the animation, based on animType
        switch (animType) {
            case 'normal':
                chessPiece.changeTile(pieceElement, endTileElement, false);
                break;
            case 'endTurn':
                chessPiece.changeTile(pieceElement, endTileElement, true);
                break;
            default:
                throw `Error at pieceAnimation.end: Invalid animation type ${animType}. Aborting..`;
        }
    },

    /**
     * Stops all active animations
     */
    clear: () => {
        //continue deleting the animations until there are none left
        while (pieceAnimation.activeAnimations.length > 0) {
            let animate = pieceAnimation.activeAnimations[0];
            clearTimeout(animate.interval);
            pieceAnimation.activeAnimations.shift();
        }
        //resetting the animation id
        pieceAnimation.animationId = 0;
    }
};

//the object that contains the functions related to the time limit for each player
const timer = {
    //storing the interval updating the time remaining every millisecond
    timerInterval: null,
    //the time in milliseconds since epoch that the timer started
    startingTime: 0,

    /**
     * Initialises the time limit
     */
    init: () => {
        //getting the time limit the user requested in the settings page
        let timeHours = localStorage.getItem('timeHours');
        let timeMinutes = localStorage.getItem('timeMinutes');
        let timeSeconds = localStorage.getItem('timeSeconds');
        //setting the time remaining in milliseconds in the session storage for each player
        sessionStorage.setItem('p1-time', timer.getMilliseconds(timeHours, timeMinutes, timeSeconds));
        sessionStorage.setItem('p2-time', timer.getMilliseconds(timeHours, timeMinutes, timeSeconds));
        //setting the ui displays
        timer.setDisplay(1, timeHours, timeMinutes, timeSeconds);
        timer.setDisplay(2, timeHours, timeMinutes, timeSeconds);
    },

    /**
     * Sets the display of a player's time limit
     * @param {integer} player Either 1 or 2 for the first or second player
     * @param {integer} hours How many hours remain from the time limit
     * @param {integer} minutes How many minutes remain from the time limit
     * @param {integer} seconds How many seconds remain from the time limit
     */
    setDisplay: (player, hours, minutes, seconds) => {
        let timeElement = document.getElementById(`player${player}-time`);
        let timeText = `<i class="fa-regular fa-clock"></i> `;
        //only showing the hours if there is at least 1 remaining
        if (hours > 0) {
            timeText += `${hours}h `;
        }
        //only showing the minutes if there is at least 1 minute or hour remaining
        if (minutes > 0 || hours > 0) {
            timeText += `${minutes}m `;
        }
        timeText += `${seconds}s`;
        timeElement.innerHTML = timeText;
    },

    /**
     * Converts hours, minutes and seconds into milliseconds
     * @param {integer} hours The amount of hours in the timer
     * @param {integer} minutes The amount of minutes in the timer
     * @param {integer} seconds The amount of seconds in the timer
     * @returns {integer} The total time remaining in milliseconds
     */
    getMilliseconds: (hours, minutes, seconds) => {
        return (seconds * 1000) + (minutes * 60000) + (hours * 3600000);
    },

    /**
     * Converts milliseconds into hours, minutes and seconds
     * @param {integer} milliseconds The amount of milliseconds in the timer
     * @returns {object} {hours, minutes, seconds}
     */
    getHMS: (milliseconds) => {
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        //1 hour = 3600000 milliseconds
        while (milliseconds >= 3600000) {
            hours++;
            milliseconds -= 3600000;
        }
        //1 minute = 60000 milliseconds
        while (milliseconds >= 60000) {
            minutes++;
            milliseconds -= 60000;
        }
        //1 second = 1000 milliseconds
        while (milliseconds >= 1000) {
            seconds++;
            milliseconds -= 1000;
        }
        return {
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    },

    /**
     * Starts the timer for a player
     * @param {integer} player Either 1 or 2 for the first or second player
     */
    start: (player) => {
        //saves the time when the timer started
        timer.startingTime = Date.now();
        //starts the interval to update the time
        timer.timerInterval = setInterval(timer.update, 1, player);
    },

    /**
     * Keeps track of how much time is left
     * @param {integer} player The player that is taking the turn
     */
    update: (player) => {
        //how much time has been taken since the start of the turn
        let turnTime = Date.now() - timer.startingTime;
        //the time the player had before the turn started
        let playerTime = parseInt(sessionStorage.getItem(`p${player}-time`));
        //the time that the player has left. Add 1 second for display purposes only
        let timeRemaining = playerTime - turnTime;
        let timeDisplay = timer.getHMS(timeRemaining + 1000);
        timer.setDisplay(player, timeDisplay.hours, timeDisplay.minutes, timeDisplay.seconds);

        //checking if the player ran out of time
        if (timeRemaining <= 0) {
            timer.timeout(player);
        }
    },

    /**
     * Is called when a player runs out of time
     * @param {integer} player The player that ran out of time
     */
    timeout: (player) => {
        timer.clear();
        //removes any interaction from the game
        tile.removeAllInteraction();
        pieceMovement.clearDelay();

        //getting the names of the players
        let playerName = getPlayerName(player);
        let otherPlayerName = getPlayerName(3 - player); //3 - 1 = 2 and 3 - 2 = 1, so it results in the opposite player
        addAnnouncement(`${playerName} ran out of time! ${otherPlayerName} wins!`);
        setBanner('Time is Up!', otherPlayerName + ' Wins!', '');
        //removes the checkmate banner after a certain amount of time to allow the user to see the board again
        setTimeout(removeBanner, checkmateBannerTime);
    },

    /**
     * Ends a timer and updates the time in the session storage
     * @param {integer} player The player who ended the timer
     */
    stop: (player) => {
        //getting how much time the player spent on the move
        let turnTime = Date.now() - timer.startingTime;
        let playerTime = parseInt(sessionStorage.getItem(`p${player}-time`));
        sessionStorage.setItem(`p${player}-time`, playerTime - turnTime);

        timer.clear();
    },

    /**
     * Removes any active timer interval
     */
    clear: () => {
        //stopping the interval that is updating the time
        if (timer.timerInterval !== null) {
            clearInterval(timer.timerInterval);
            timer.timerInterval = null;
        }
    }
};