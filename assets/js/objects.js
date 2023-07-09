//object that stores tile functions
const tile = {
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

    getX: (tileElement) => {
        return parseInt(tileElement.id[5]); //"tile-x-y": "x" is the 5th character of the id string
    },

    getY: (tileElement) => {
        return parseInt(tileElement.id[7]); //"tile-x-y": "y" is the 7th character of the id string
    },

    /**
     * Finds the tile data of the king with the specified color
     * @param {string} color The color of the king
     * @returns {object} The tile data of the king
     */
    findKing: (color) => {
        let kings = document.getElementsByClassName('king');
        let kingData;
        for (let king of kings) {
            kingData = chessPiece.getData(king);
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
     * Evaluates the surrounding tiles of a certain tile and returns other tile data
     * @param {object} tileData An object {x, y, piece, color} of the tile that is to be evaluated
     * @param {object} evaluatingTile The object {x, y, piece, color} of the tile that is evaluating the tile
     * @returns An object {availableSpaces, enemyTarget, enemyThreat, allyGuarded} containing the relationships between the surrounding pieces
     */
    evaluate: (tileData, evaluatingTile) => {
        //getting the total number of spaces the piece can move if it moves to this tile
        let availableSpaces = 0;
        //if there are any enemies that can be attacked attack the piece if it moves to that tile, it will be stored in this array
        let enemyTarget = [];
        //if there are any enemies that can attack the piece if it moves to that tile, it will be stored in this array
        let enemyThreat = [];
        //if there are any allies that can attack this tile if an enemy attacks it, it will be stored in this array
        let allyGuarded = [];

        //finds the color of the opponent
        enemyColor = (evaluatingTile.color === 'white') ? 'black' : 'white';

        //the tile will be evaluated using the moves of the queen and the knight, as that will cover all the possible move types
        for (let move of pieceMovement['queen']) {
            //the coordinates the loop will be manipulating
            let x = tileData.x;
            let y = tileData.y;
            let vector1 = move[1]; //because move[0] is the rule 'vector'
            let vector2 = move[2];
            let firstMove = true;
            //reversing the move to evaluate pieces that can attack the evaluating piece at this tile
            let moveReverse = [move[0], -move[1], -move[2]];
            //if neither of the vectors are 0 then the piece is moving diagonally
            let isDiagonal = (Math.abs(vector1) === Math.abs(vector2));

            //adding the vector to the coordinates
            x += vector1;
            y += vector2;

            //keep moving in the direction of the vector until it goes out of bounds, or it hits a piece (evaluated inside the loop)
            while (tile.inBounds(x, y)) {
                //stop the vector if it comes into contact with itself
                if (!(x === evaluatingTile.x && y === evaluatingTile.y)) {
                    let secondTile = chessPiece.findData(x, y);

                    if (secondTile.color === evaluatingTile.color) { //if the evaluation runs into a friendly piece
                        //if the friendly piece can attack the tile if an enemy moves to it
                        if (pieceMovement.canAttack(secondTile, moveReverse, firstMove)) {
                            allyGuarded.push(secondTile);
                        }
                        break;
                    } else {
                        if (secondTile.color === enemyColor) { //if the evaluation runs into an enemy piece
                            //if the enemy piece can be attacked by the piece at this tile
                            if (pieceMovement.canAttack(evaluatingTile, move, firstMove)) {
                                enemyTarget.push(secondTile);
                            }
                            //if the enemy piece can attack the piece at this tile
                            if (pieceMovement.canAttack(secondTile, moveReverse, firstMove)) {
                                enemyThreat.push(secondTile);
                            }
                            break;
                        }
                    }
                }
                //if the tile can be moved to in the move after this one, it will increase availableSpaces
                if (evaluatingTile.piece === 'queen'
                    || (isDiagonal && evaluatingTile.piece === 'bishop')
                    || (!isDiagonal && evaluatingTile.piece === 'rook')) {
                    availableSpaces++;
                }
                x += vector1;
                y += vector2;
                firstMove = false;
            }
        }
        for (let move of pieceMovement['knight']) {
            let x = tileData.x + move[1]; //because move[0] is 'normal'
            let y = tileData.y + move[2];
            if (tile.inBounds(x, y)) {
                if (!(x === evaluatingTile.x && y === evaluatingTile.y)) {
                    let secondTile = chessPiece.findData(x, y);
                    if (secondTile.color === evaluatingTile.color) { //if the evaluation runs into a friendly piece
                        if (secondTile.piece === 'knight') {
                            allyGuarded.push(secondTile);
                        }
                    } else if (secondTile.color === enemyColor) { //if the evaluation runs into an enemy piece
                        //if the current piece can attack the enemy piece at this tile, it is a target
                        if (evaluatingTile.piece === 'knight') {
                            enemyTarget.push(secondTile);
                        }
                        //if the enemy piece can attack the current piece at this tile, it is a threat
                        if (secondTile.piece === 'knight') {
                            enemyThreat.push(secondTile);
                        }
                    }
                }
                if (evaluatingTile.piece === 'knight') {
                    availableSpaces++;
                }
            }
        }
        return {
            availableSpaces: availableSpaces,
            enemyTarget: enemyTarget,
            enemyThreat: enemyThreat,
            allyGuarded: allyGuarded
        };
    },

    /**
     * Evaluates the surrounding tiles of a certain tile after a potential move and returns other tile data
     * @param {object} tileData An object {x, y, piece, color} of the tile that is to be evaluated
     * @param {object} evaluatingTile The object {x, y, piece, color} of the tile that is evaluating the tile
     * @param {object} tileFrom The data of the potentially moving piece
     * @param {*} tileTo  The data of the potential tile the piece is moving to
     * @returns An object {availableSpaces, enemyTarget, enemyThreat, allyGuarded} containing the relationships between the surrounding pieces
     */
    evaluateWithMove(tileData, evaluatingTile, tileFrom, tileTo) {
        //temporarily swap the classes of tileFrom and tileTo, evaluate the tile, and then swap them back
        let elementFrom = tile.getElement(tileFrom.x, tileFrom.y);
        let elementTo = tile.getElement(tileTo.x, tileTo.y);

        //getting the classes of the tile movement
        let classFrom = elementFrom.className;
        let classTo = elementTo.className;

        //and swapping them temporarily. elementFrom's class will be set to blank in case there are pieces on both tiles
        elementFrom.className = '';
        elementTo.className = classFrom;

        //evaluating tileData after the move has been made
        let evaluation = tile.evaluate(tileData, evaluatingTile);

        //swapping the classes back
        elementFrom.className = classFrom;
        elementTo.className = classTo;

        return evaluation;
    },

    /**
     * Returns a calculation of how good of a move it would be for a piece to move to a tile
     * @param {object} currentTile The data of the piece that wishes to move
     * @param {object} moveTile The data of the tile the piece wishes to move to
     * @returns {integer} The total score of that tile
     */
    getScore: (currentTile, moveTile) => {
        //each move will have a score
        let moveScore = 0;

        //monitoring all the tiles around it for information
        let tileEval = tile.evaluate(moveTile, currentTile);

        //adding the total number of moves the piece could make on this tile multiplied by 1% of it's value to the score
        moveScore += tileEval.availableSpaces * (chessPiece.value[currentTile.piece] / 100);

        //if there is an enemy that can attack the piece at this tile, then subtract the current piece's value from the score
        let isThreatened = false;
        if (tileEval.enemyThreat.length > 0) {
            isThreatened = true;

            //finding the values of the current piece and the piece with the lowest value that is threatening it
            //stops high value pieces moving to tiles where they can be attacked by low value pieces
            let pieceValue = chessPiece.value[currentTile.piece];
            let lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);

            //if all the enemyThreat values are greater than or equal to the lowest value in enemyThreat and
            //there are ally tiles protecting the piece, then simulate a battle
            if (pieceValue <= lowestEnemy[0] && tileEval.allyGuarded.length > 0) {
                //if there is an ally (or allies) guarding this tile, then a "battle" will take place.
                // 1 - the ally with the smallest value will move to this tile and destroy the enemy piece.
                //      we will assume the enemy attacked with their lowest value piece so we will add the
                //      smallest value to the battle score
                // 2 - if there is another enemy that can attack this tile, the smallest value of allyGuarded
                //      will be taken from the battle score
                // 3 - this loop will continue until there is no more moves on this tile from either side
                let infiniteLoopBlocker = 0;
                //because the battle starts with the enemy attacking the current piece, we will start by taking away the piece's value
                let battleScore = -chessPiece.value[currentTile.piece];
                while (tileEval.enemyThreat.length > 0 && tileEval.allyGuarded.length > 0 && infiniteLoopBlocker < 1000) {
                    infiniteLoopBlocker++;

                    //finding the piece with the lowest value in each of the tiles
                    lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);
                    let lowestAlly = chessPiece.findLowestValue(tileEval.allyGuarded);

                    let allyTile = tileEval.allyGuarded[lowestAlly[1]];
                    let enemyTile = tileEval.enemyThreat[lowestEnemy[1]];

                    battleScore += lowestEnemy[0];
                    tileEval.enemyThreat.splice(lowestEnemy[1], 1);

                    if (tileEval.enemyThreat.length > 0) {
                        lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);
                        enemyTile = tileEval.enemyThreat[lowestEnemy[1]];

                        battleScore -= lowestAlly[0];
                        tileEval.allyGuarded.splice(lowestAlly[1], 1);
                    }
                }
                if (infiniteLoopBlocker >= 1000) {
                    throw `Error: Infinite loop when simulating the battle. Aborting!`;
                }

                //if the battlescore is less than 0, then the enemy has the upper hand at this tile
                if (battleScore >= 0) {
                    isThreatened = false;
                }
            }
        }

        //if the risk of the piece being eliminated in the next move is low
        if (!isThreatened) {
            //add 10% of the values of every target on this tile
            for (let target of tileEval.enemyTarget) {
                moveScore += chessPiece.value[target.piece] / 10;
            }
        } else {
            moveScore -= chessPiece.value[currentTile.piece];
        }
        return moveScore;
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

    select: (tileElement) => {
        //getting the tile data
        let pieceElement = tile.getPieceElement(tileElement);
        let pieceData = chessPiece.getData(tileElement);

        if (localStorage.getItem(pieceData.color) === 'player') {
            //creates another div as a child of the selected tile
            let selectDiv = document.createElement('div');
            selectDiv.id = 'tile-selected';
            pieceElement.appendChild(selectDiv);

            //show all the available moves the selected piece can take
            let possibleMoves = pieceMovement.getAllMoveTiles(pieceData);
            console.log(possibleMoves);

            for (let move of possibleMoves) {
                //creating a div displaying an image on every possible move
                let moveOption = document.createElement('div');
                moveOption.className = "possible-move";
                let movePiece = tile.getPieceElement(move);
                //if there is an enemy piece on the tile to move to, add the possible move to that piece
                if (movePiece !== null) {
                    movePiece.appendChild(moveOption);
                } else {
                    move.appendChild(moveOption);
                }

                //adding the 'clickable' class to the tile
                tile.addInteraction(move);
            }
        }
    },

    /**
     * Removes the selected div from the tile that is selected and any tiles showing possible moves
     */
    deselectAll: () => {
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

            //removing the possible move div
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
        newPiece.className = `chess-piece ${color} ${pieceClass}`;

        //finding the correct image using pieceImage and color
        chessPiece.setImage(newPiece, pieceImage, color);

        //adding the newly created element to the specified tile element
        tileElement.appendChild(newPiece);
    },

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
     * Gets a chess piece element on a certain tile
     * @param {integer} x The x position of the tile on the board
     * @param {integer} y The y position of the tile on the board
     * @returns {object} The element of the piece at this tile, or null if the tile is empty
     */
    findElement: (x, y) => {
        let tileElement = tile.getElement(x, y);
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
        let pieceData = chessPiece.getData(tileElement);

        return pieceData;
    },

    getType: (pieceElement) => {
        let piece = '';
        if (pieceElement !== null) {
            tileClass = pieceElement.classList;
            piece = chessPiece.getTypeFromClass(tileClass);
        }
        return piece;
    },

    /**
     * reads a tiles class and determines what piece it has
     * @param {*} tileClass the class of the tile. should be in string or array form
     * @returns The piece in the given tile, in string format
     */
    getTypeFromClass: (tileClass) => {
        let foundPiece = '';
        if (typeof tileClass === 'string' || typeof tileClass === 'object') {
            let pieceNames = ['pawn-new', 'pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
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
     * @returns {string} The color of the piece
     */
    getColor: (pieceElement) => {
        let color = '';
        if (pieceElement !== null) {
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
        let pieceData = chessPiece.getData(pieceElement.parentNode);
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
     * Initializes a piece move from it's original tile to a new one
     * @param {*} pieceElement The element of the chess piece that will move
     * @param {*} newTileElement The tile the piece will move to
     */
    move: (pieceElement, newTileElement) => {
        //first removing the 'clickable' class from all of the pieces
        tile.removeAllInteraction();

        //getting the information about the piece
        let pieceData = chessPiece.getData(pieceElement.parentNode);

        //if the piece is "pawnNew", then it will be converted to 'pawn' after its first move
        if (pieceData.piece === 'pawnNew') {
            chessPiece.setPieceType(pieceElement, 'pawn');
        }

        //starting the movement animation
        pieceAnimation.start(pieceElement, newTileElement);
    },

    changeTile: (pieceElement, newTileElement) => {
        //checking if the tile has another piece on it
        let otherPiece = tile.getPieceElement(newTileElement);
        if (otherPiece !== null) {
            chessPiece.destroy(otherPiece, pieceElement);
        }

        //changing the parent of the chess piece to the new tile
        newTileElement.appendChild(pieceElement);
        //removing the position style properties set during the animation
        pieceElement.style.removeProperty('left');
        pieceElement.style.removeProperty('top');

        //reviving pieces if the pawn reaches the other side of the board
        let pieceData = chessPiece.getData(pieceElement.parentNode);
        let newYPosition = tile.getY(newTileElement);
        let isRevive = false;
        if (pieceData.piece === 'pawn') {
            //checking if the pawn is at the end of the board to initite to initiate the piece revive sequence
            if (chessPiece.isAtBoardEnd(pieceData.color, newYPosition)) {
                isRevive = true;
                chessPiece.revive(pieceElement);
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
     * @param {object} destroyerElement The piece that has destroyed the specified piece
     */
    destroy: (pieceElement, destroyerElement) => {
        //adding the destroyed piece to the appropriate graveyard
        let pieceData = chessPiece.getData(pieceElement.parentNode);
        let graveyardDiv = (pieceData.color === 'black') ? document.getElementById('player1-graveyard') : document.getElementById('player2-graveyard');
        console.log(pieceData);
        graveyard.add(graveyardDiv, pieceData.piece);

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
     * @returns An array containing the lowest value and the position the piece with that value on the array [lowestValue, lowestPosition]
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
     * @returns {object} An array of all the pieces
     */
    getAll: (color) => {
        let pieceElements = document.getElementsByClassName(color);
        let pieces = [];

        for (let element of pieceElements) {
            pieces.push(chessPiece.getData(element.parentNode));
        }

        return pieces;
    },

    revive: (pawnElement) => {
        //adding the revive id to the pawn to replace it once a new piece has been picked
        pawnElement.id = 'promoting';

        //getting the information about the pawn
        let pawnData = chessPiece.getData(pawnElement.parentNode);

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
                let gravePiece = chessPiece.getDeadPiece(grave);

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
            chessPiece.replaceWithDead(highestPieces[finalDecision]);

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
            let gravePiece = chessPiece.getDeadPiece(grave);
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
        let pieceName = chessPiece.getDeadPiece(deadPiece);

        //getting the pawn which reached the end of the board
        let pawnElement = document.getElementById('promoting');

        //replacing it's piece type with the selected dead piece
        chessPiece.setPieceType(pawnElement, pieceName);

        //removing the 'promoting' id from the piece
        pawnElement.removeAttribute('id');

        //removing the grave piece from the graveyard
        deadPiece.remove();
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

    /**
     * Gets all the valid moves of a piece on the board
     * @param {object} pieceData The piece that will be evaluated
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
                    do {
                        checkPiece = chessPiece.findData(newX, newY);
                        //adding the move to the array if the tile is not occupied by a friendly piece
                        if (checkPiece.color !== pieceData.color) {
                            moveTiles.push(checkPiece);
                        }
                        //stopping the loop if there is any piece on the tile
                        if (checkPiece.color !== '') {
                            break;
                        }
                        newX += move[1];
                        newY += move[2];
                    } while (tile.inBounds(newX, newY));
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

    evaluateTile: (tileData, pieceData) => {

    },

    evaluateTileWithMove: (tileData, pieceData, pieceMovingData, tileMovedData) => {

    },

    getTileScore: (tileData, pieceMovingData) => {

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
     * @param {object} tileData The data object of the tile the piece is moving to
     * @param {object} pieceMovingData The data object of the piece that will move to the tile
     * @returns {boolean} If the king is left in a vulnerable position after the move
     */
    isKingThreatened: (tileData, pieceMovingData) => {
        return false;
        //the king's y position at the end of the move
        let kingY;

        //only add the tile if moving there doesn't result in a self-check
        let tileEval;

        if (pieceMovingData.piece !== 'king') {
            //finding the king if it isn't the piece that will move
            let kingData = tile.findKing(pieceMovingData.color);
            //if the piece that is looking to move is not the king, that means the king's position won't change
            kingY = kingData.y;
            tileEval = pieceMovement.evaluateTileWithMove(kingData, kingData, pieceMovingData, tileData);
        } else {
            //if the piece that is looking to move is the king, that means the king's position will change to currentTile's position
            kingY = currentTile.y;
            tileEval = pieceMovement.evaluateTile(currentTile, tileData);
        }
        //not a valid move if the king is under threat
        for (let threat of tileEval.enemyThreat) {
            //pawns cannot reach the end of the board without a graveyard piece to revive,
            //so if the king is at the end of the board with these conditions it is safe from pawns
            if (!(threat.piece === 'pawn' && chessPiece.isAtBoardEnd(threat.color, kingY) && !chessPiece.canRevive(threat.color))) {
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
            if (chessPiece.isAtBoardEnd(pieceMovingData.color, tileData.y) && !chessPiece.canRevive(pieceMovingData.color)) {
                return false;
            }
        }
        return true;
    }
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
    }
};