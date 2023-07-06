//object that stores tile functions
const tile = {
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
        let piece = chessPiece.getPieceFromClass(tileClass);
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
     * Finds the tile data of the king with the specified color
     * @param {string} color The color of the king
     * @returns {object} The tile data of the king
     */
    findKing: (color) => {
        let kings = document.getElementsByClassName('king');
        let kingData;
        for (let king of kings) {
            kingData = tile.getData(king);
            if (kingData.color === color) {
                break;
            }
        }
        return kingData;
    },

    /**
     * Sets a chess piece at a certain position
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

    /**
     * Sets a chess piece at a certain position to a given tile object
     * @param {*} x The x position of the tile (from 0 to boardSize - 1)
     * @param {*} y The y position of the tile (from 0 to boardSize - 1) 
     * @param {*} tileData The object {x, y, piece, color} to set the tile to
     */
    setData: (x, y, tileData) => {
        tile.set(x, y, tileData.piece, tileData.color);
    },

    /**
     * Moves a chess piece from one tile to another
     * @param {*} tileDataFrom The data {x, y, piece, color} of the tile you are looking to move
     * @param {*} tileDataTo The data {x, y, piece, color} of the tile you are looking to move tileDataFrom to
     */
    move: (tileDataFrom, tileDataTo) => {
        //first removing the 'clickable' class from all of the pieces
        tile.removeAllInteraction();

        //if the piece is "pawnNew", then it will be converted to 'pawn' after it's first move
        if (tileDataFrom.piece === 'pawnNew') {
            tileDataFrom.piece = 'pawn';
        }

        //if a piece is destroyed, add it to one of the graveyards
        if (tileDataTo.color !== '' && tileDataFrom.color !== tileDataTo.color) {
            chessPiece.destroy(tileDataTo);
        }

        tile.set(tileDataTo.x, tileDataTo.y, tileDataFrom.piece, tileDataFrom.color);
        tile.clear(tileDataFrom.x, tileDataFrom.y);

        chessPiece.setAnimation(tileDataFrom, tileDataTo);

        // //reviving pieces if the pawn reaches the other side of the board
        // let isRevive = false;
        // if (tileDataFrom.piece === 'pawn') {
        //     //checking if the pawn is at the end of the board to initite to initiate the piece revive sequence
        //     if (chessPiece.isAtBoardEnd(tileDataFrom.color, tileDataTo.y)) {
        //         isRevive = true;
        //         chessPiece.revive({
        //             x: tileDataTo.x,
        //             y: tileDataTo.y,
        //             piece: tileDataFrom.piece,
        //             color: tileDataFrom.color
        //         });
        //     }
        // }
        // //if a pawn has moved to the other side of the board, stop the game until a piece to revive has been selected
        // if (!isRevive) {
        //     nextTurn();
        // }
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
        for (let move of chessPiece['queen'].moves) {
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
                    let secondTile = tile.get(x, y);

                    if (secondTile.color === evaluatingTile.color) { //if the evaluation runs into a friendly piece
                        //if the friendly piece can attack the tile if an enemy moves to it
                        if (chessPiece.canAttack(secondTile, moveReverse, firstMove)) {
                            allyGuarded.push(secondTile);
                        }
                        break;
                    } else {
                        if (secondTile.color === enemyColor) { //if the evaluation runs into an enemy piece
                            //if the enemy piece can be attacked by the piece at this tile
                            if (chessPiece.canAttack(evaluatingTile, move, firstMove)) {
                                enemyTarget.push(secondTile);
                            }
                            //if the enemy piece can attack the piece at this tile
                            if (chessPiece.canAttack(secondTile, moveReverse, firstMove)) {
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
        for (let move of chessPiece['knight'].moves) {
            let x = tileData.x + move[1]; //because move[0] is 'normal'
            let y = tileData.y + move[2];
            if (tile.inBounds(x, y)) {
                if (!(x === evaluatingTile.x && y === evaluatingTile.y)) {
                    let secondTile = tile.get(x, y);
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
        moveScore += tileEval.availableSpaces * (chessPiece[currentTile.piece].value / 100);

        //if there is an enemy that can attack the piece at this tile, then subtract the current piece's value from the score
        let isThreatened = false;
        if (tileEval.enemyThreat.length > 0) {
            isThreatened = true;

            //finding the values of the current piece and the piece with the lowest value that is threatening it
            //stops high value pieces moving to tiles where they can be attacked by low value pieces
            let pieceValue = chessPiece[currentTile.piece].value;
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
                let battleScore = -chessPiece[currentTile.piece].value;
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
                moveScore += chessPiece[target.piece].value / 10;
            }
        } else {
            moveScore -= chessPiece[currentTile.piece].value;
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

    select: (selectTile) => {
        //getting the tile data
        let selectData = tile.getData(selectTile);

        if (localStorage.getItem(selectData.color) === 'player') {
            //creates another div as a child of the selected tile
            let selectDiv = document.createElement('div');
            selectDiv.id = 'tile-selected';
            selectTile.appendChild(selectDiv);

            //show all the available moves the selected piece can take
            let possibleMoves = chessPiece.getAllMoveTiles(selectData);

            for (let move of possibleMoves) {
                //creating a div displaying an image on every possible move
                let moveOption = document.createElement('div');
                moveOption.className = "possible-move";
                let moveElement = tile.getElement(move.x, move.y);
                moveElement.appendChild(moveOption);

                //adding the 'clickable' class to the tile
                tile.addInteraction(moveElement);
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
    //chess move rules:
    // 'normal' means add the following coordinates to the current tile
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
        moves: [['normal', -1, -2], ['normal', 1, -2], ['normal', -2, -1], ['normal', 2, -1],
        ['normal', -2, 1], ['normal', 2, 1], ['normal', -1, 2], ['normal', 1, 2]],
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
        moves: [['vector', 1, 0], ['vector', 1, -1], ['vector', 0, -1], ['vector', -1, -1],
        ['vector', -1, 0], ['vector', -1, 1], ['vector', 0, 1], ['vector', 1, 1]],
        value: 900
    },
    king: {
        moves: [['normal', 1, 0], ['normal', 1, -1], ['normal', 0, -1], ['normal', -1, -1],
        ['normal', -1, 0], ['normal', -1, 1], ['normal', 0, 1], ['normal', 1, 1]],
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
     * @param {object} tileData The data in object form {x, y, piece, color} of the piece
     * @returns An array of all the tiles the piece can move to
     */
    getAllMoveTiles: (tileData) => {
        //the array that will store all the tiles the piece can move to
        let moveTiles = [];

        //for preventing moves that can cause self check
        let kingData = tile.findKing(tileData.color);

        //getting the move set of the piece
        let moves = chessPiece[tileData.piece].moves;

        for (let currentMove of moves) {
            let availableTiles = chessPiece.getTilesFromMove(tileData, currentMove);
            for (let currentTile of availableTiles) {
                //the move is not valid if it results in a self-check or if a pawn reaches the end of the board
                //without a revivable piece in the graveyard
                let isValidMove = true;

                //only add the tile if moving there doesn't result in a self-check
                let tileEval;
                //the king's y position at the end of the move
                let kingY;

                if (tileData.piece !== 'king') {
                    //if the piece that is looking to move is not the king, that means the king's position won't change
                    kingY = kingData.y;
                    tileEval = tile.evaluateWithMove(kingData, kingData, tileData, currentTile);
                    //not a valid move if it is a pawn moving to the end of the board with no pieces to revive
                    if (tileData.piece === 'pawn') {
                        if (chessPiece.isAtBoardEnd(tileData.color, currentTile.y) && !chessPiece.canRevive(tileData.color)) {
                            isValidMove = false;
                        }
                    }

                } else {
                    //if the piece that is looking to move is the king, that means the king's position will change to currentTile's position
                    kingY = currentTile.y;
                    tileEval = tile.evaluate(currentTile, tileData);
                }
                //not a valid move if the king is under threat
                for (let threat of tileEval.enemyThreat) {
                    //pawns cannot reach the end of the board without a graveyard piece to revive,
                    //so if the king is at the end of the board with these conditions it is safe from pawns
                    if (!(threat.piece === 'pawn' && chessPiece.isAtBoardEnd(threat.color, kingY) && !chessPiece.canRevive(threat.color))) {
                        isValidMove = false;
                        break;
                    }
                }
                if (isValidMove) {
                    moveTiles.push(currentTile);
                }
            }
        }

        return moveTiles;
    },

    getTilesFromMove: (tileData, move) => {
        //storing all the valid moves in this array
        let moveTiles = [];
        //declaring the variables storing the coordinates of the tiles to check
        let newX = tileData.x + move[1]; //the x coordinate is always the second element in a moves array
        let newY;
        //getting the enemy's color
        let enemyColor = (tileData.color === 'white') ? 'black' : 'white';

        //adding forward movement only support for pawns
        let moveY = move[2]; //the y coordinate is always the third element in a moves array
        if (typeof moveY === 'string' && moveY.includes('forward')) {
            //getting the last character of the forward move, which specifies the number of moves forward it can take
            let forwardAmount = parseInt(moveY[moveY.length - 1]);

            //determines which direction is forward
            let yDirection = chessPiece.getForwardDirection(tileData.color);

            //if the forward value is greater than 1, then all tiles in between will be checked to see if they are blank
            let blockMove = false;
            for (let i = 1; i < forwardAmount && !blockMove; i++) {
                let tileInfo = tile.get(newX, tileData.y + (i * yDirection));
                //if there is a friendly piece, or any piece at all if the rule 'disarmed' applies, the tile will be considered blocked
                if (tileInfo.color === tileData.color || (move[0] === 'disarmed' && tileInfo.color !== '')) {
                    blockMove = true;
                    break;
                }
            }
            //continue onto the next move if this move is blocked by a tile
            if (blockMove) {
                //return an empty array if the move is blocked
                return [];
            }
            newY = tileData.y + (forwardAmount * yDirection);
        } else {
            newY = tileData.y + moveY;
        }

        //checking if the move is within the bounding box of the chess board
        if (tile.inBounds(newX, newY)) {
            //the tile element that is being checked
            let checkTile = tile.get(newX, newY);

            //checking the different rules for the piece. see chessPiece object for move rules
            switch (move[0]) {
                //for moves that add the coordinates to its tile position
                case 'normal':
                    //cannot move to a tile that has a friendly piece
                    if (checkTile.color !== tileData.color) {
                        moveTiles.push(checkTile);
                    }
                    break;
                //for moves that loop in a certain direction until an obstacle is found
                case 'vector':
                    do {
                        checkTile = tile.get(newX, newY);
                        //adding the move to the array if the tile is not occupied by a friendly piece
                        if (checkTile.color !== tileData.color) {
                            moveTiles.push(checkTile);
                        }
                        //stopping the loop if there is any piece on the tile
                        if (checkTile.color !== '') {
                            break;
                        }
                        newX += move[1];
                        newY += move[2];
                    } while (tile.inBounds(newX, newY));
                    break;
                //for moves that are only valid if there is an enemy on the tile
                case 'attack':
                    if (checkTile.color === enemyColor) {
                        moveTiles.push(checkTile);
                    }
                    break;
                //for moves that are only valid if the tile is clear
                case 'disarmed':
                    if (checkTile.color === '') {
                        moveTiles.push(checkTile);
                    }
                    break;
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

        //making pawns and new pawns the same for the image address
        if (tileData.piece === 'pawnNew') {
            tileData.piece = 'pawn';
        }

        //creating the classes to style and access the piece
        deadPiece.className = `piece-dead dead-${tileData.piece}`;
        //creating the url to access the particular piece
        deadPiece.style.backgroundImage = `url(assets/images/chess-pieces/${tileData.color}-${tileData.piece}.png)`;

        let graveyardDiv = (tileData.color === 'black') ? document.getElementById('player1-graveyard') : document.getElementById('player2-graveyard');
        graveyardDiv.appendChild(deadPiece);

        //announcing the piece elimination in the ui
        let enemyColor = (tileData.color === 'white') ? 'black' : 'white';

        //converting the first letter of the destroyed piece to uppercase
        let destroyedPiece = tileData.piece[0].toUpperCase() + tileData.piece.slice(1);

        addAnnouncement(`${getPlayerName(enemyColor)} eliminated ${getPlayerName(tileData.color)}'s ${destroyedPiece}`);
    },

    /**
     * Gets the forward direction of a tile based on the color of the piece
     * @param {*} color The color of the piece
     * @returns The forward direction
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
     * Checks if a piece can move to a certain tile
     * @param {object} attackingTile The tile information that is checking if it can move
     * @param {['rule', x, y]} move The direction the piece has to take to move to the new tile
     * @param {boolean} isBeside If there is only one space between the piece and the tile it wants to move to
     * @returns {boolean} If the attacking tile can attack using its move set
     */
    canAttack: (attackingTile, move, isBeside) => {
        //checking the rule of the move
        switch (move[0]) {
            //checks if the attacker is a knight
            case 'normal':
                return (attackingTile.piece === 'knight');
                break;
            //checks for all the other pieces
            case 'vector':
                let vector1 = move[1];
                let vector2 = move[2];
                let isDiagonal = (Math.abs(vector1) === Math.abs(vector2));

                return (attackingTile.piece === 'queen'
                    || (isDiagonal && attackingTile.piece === 'bishop')
                    || (!isDiagonal && attackingTile.piece === 'rook')
                    || (isBeside && (attackingTile.piece === 'king'
                        || (vector1 !== 0 && vector2 === chessPiece.getForwardDirection(attackingTile.color)
                            && attackingTile.piece.includes('pawn')))));
                break;
        }
    },

    /**
     * Finds the piece with the lowest value in an array
     * @param {object} pieces The tile data of all the pieces to be checked
     * @returns An array containing the lowest value and the position the piece with that value on the array [lowestValue, lowestPosition]
     */
    findLowestValue: (pieces) => {
        let lowestValue = chessPiece[pieces[0].piece].value;
        let lowestPosition = 0;

        for (let i = 1; i < pieces.length; i++) {
            let currentPiece = pieces[i];
            let pieceValue = chessPiece[currentPiece.piece].value;
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
            pieces.push(tile.getData(element));
        }

        return pieces;
    },

    /**
     * Initialises the revival of another chess piece when a player's pawn reaches the
     * other side of the chess board
     * @param {object} pawnData The data of the pawn that has reached the end of the board
     */
    revive: (pawnData) => {
        //setting the pawn position and color in the session storage to be accessed again when the player clicks on a graveyard icon
        sessionStorage.setItem('pawnPosition', `${pawnData.x}-${pawnData.y}`);
        sessionStorage.setItem('pawnColor', pawnData.color);

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

                if (gravePiece !== 'pawn' && chessPiece[gravePiece].value >= highestValue) {
                    if (chessPiece[gravePiece].value > highestValue) {
                        //resetting the pieces to select from if there is a piece with a higher value
                        highestPieces = [];
                        highestValue = chessPiece[gravePiece].value;
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
        deadPiece.remove();
    },

    //will be used to store the animation function in order to stop it once it's done
    animationId: undefined,

    setAnimation: (tileDataFrom, tileDataTo) => {
        let animatePiece = document.getElementById('piece-moving');

        //changing the 'piece-moving' element to match the moving piece
        animatePiece.style.visibility = 'visible';
        animatePiece.style.backgroundImage = `url(./assets/images//chess-pieces/${tileDataFrom.color}-${tileDataFrom.piece}.png)`;

        //storing the animation position in the session storage
        sessionStorage.setItem('animFrame', '0');

        //getting the elements of the start and end tiles
        let startElement = tile.getElement(tileDataFrom.x, tileDataFrom.y);
        let endElement = tile.getElement(tileDataFrom.x, tileDataFrom.y);

        chessPiece.animationId = setInterval(chessPiece.animateFrame, 1, startElement, endElement);        
    },

    animateFrame: (tileFrom, tileTo) => {
        let animatePiece = document.getElementById('piece-moving');
        let frame = sessionStorage.getItem('animFrame');

        //changing the size of the moving element every frame in case the screen size changes
        animatePiece.style.width = `${tileFrom.offsetWidth}px`;
        animatePiece.style.height = `${tileFrom.offsetHeight}px`;

        frame++;
        if (frame >= animationTime) {
            animatePiece.style.visibility = 'hidden';
            clearInterval(chessPiece.animationId);
            sessionStorage.removeItem('animFrame');

            //moving on to the next turn once the animation is done
            nextTurn();
        } else {
            sessionStorage.setItem('animFrame', frame);
        }
    }
};