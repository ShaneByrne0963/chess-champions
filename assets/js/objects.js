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
        //if the piece is "pawnNew", then it will be converted to 'pawn' after it's first move
        let tilePiece = tileDataFrom.piece;
        if (tilePiece === 'pawnNew') {
            tilePiece = 'pawn';
        }

        //if a piece is destroyed, add it to one of the graveyards
        if (tileDataTo.color !== '' && tileDataFrom.color !== tileDataTo.color) {
            chessPiece.destroy(tileDataTo);
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

    /**
     * Evaluates the surrounding tiles of a certain tile and returns other tile data
     * @param {*} tileData An object {x, y, piece, color} of the tile that is to be evaluated
     * @param {*} evaluatingTile The object {x, y, piece, color} of the tile that is evaluating the tile
     * @returns An object {enemyThreat} containing the relationships between the surrounding pieces
     */
    evaluate: (tileData, evaluatingTile) => {
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
                    } else if (secondTile.color === enemyColor) { //if the evaluation runs into an enemy piece
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
            }
        }
        return {
            enemyTarget: enemyTarget,
            enemyThreat: enemyThreat,
            allyGuarded: allyGuarded
        };
    },

    getScore: (currentTile, moveTile) => {
        //each move will have a score
        let moveScore = 0;

        //monitoring all the tiles around it for information
        let tileEval = tile.evaluate(moveTile, currentTile);

        //adding 10% of the values of every target on this tile
        for (let target of tileEval.enemyTarget) {
            moveScore += chessPiece[target.piece].value / 10;
            console.log(`Ally ${currentTile.piece} [${currentTile.x}, ${currentTile.y}] Sees ${target.piece} [${target.x}, ${target.y}], + ${chessPiece[target.piece].value / 10}`);
        }

        //if there is an enemy that can attack the piece at this tile, then subtract the current piece's value from the score
        if (tileEval.enemyThreat.length > 0) {
            let battleEvents = [];

            if (tileEval.allyGuarded.length > 0) {
                console.log('Simulating Battle!');
                let lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);
                let newEnemy = tileEval.enemyThreat[lowestEnemy[1]];
                battleEvents.push(`Enemy ${newEnemy.piece} [${newEnemy.x}, ${newEnemy.y}] attacks Ally ${currentTile.piece} [${currentTile.x}, ${currentTile.y}], -${chessPiece[currentTile.piece].value}`);
            }

            //finding the values of the current piece and the piece with the lowest value that is threatening it
            //stops high value pieces moving to tiles where they can be attacked by low value pieces
            let pieceValue = chessPiece[currentTile.piece].value;
            let lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);

            //if all the enemyThreat values are greater than or equal to the lowest value in enemyThreat and there are ally tiles protecting the piece,
            //then simulate a battle
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
                    battleEvents.push(`Ally ${allyTile.piece} [${allyTile.x}, ${allyTile.y}] attacks Enemy ${enemyTile.piece} [${enemyTile.x}, ${enemyTile.y}], +${lowestEnemy[0]}`);

                    battleScore += lowestEnemy[0];
                    tileEval.enemyThreat.splice(lowestEnemy[1], 1);

                    if (tileEval.enemyThreat.length > 0) {
                        lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);
                        enemyTile = tileEval.enemyThreat[lowestEnemy[1]];
                        battleEvents.push(`Enemy ${enemyTile.piece} [${enemyTile.x}, ${enemyTile.y}] attacks Ally ${allyTile.piece} [${allyTile.x}, ${allyTile.y}], -${lowestAlly[0]}`);

                        battleScore -= lowestAlly[0];
                        tileEval.allyGuarded.splice(lowestAlly[1], 1);
                    }
                }
                if (infiniteLoopBlocker >= 1000) {
                    throw `Error: Infinite loop when simulating the battle. Aborting!`;
                }
                battleEvents.push(`Final Score: ${battleScore}`);

                //if the battlescore is less than 0, then the enemy has the upper hand at this tile
                if (battleScore < 0) {
                    moveScore -= chessPiece[currentTile.piece].value;
                    battleEvents.push(`The Enemy Wins!`);
                } else {
                    battleEvents.push(`AI Wins!`);
                }

                console.log(battleEvents);
            } else {
                moveScore -= chessPiece[currentTile.piece].value;
            }
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

    select: (x, y) => {

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
            movesExisting[0].remove();
        }
    }
};

//object that stores piece functions and the information of different pieces
let chessPiece = {
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
     * @param {*} x The x position of the piece on the board
     * @param {*} y The y position of the piece on the board
     * @param {*} piece The piece that will be making the move
     * @param {*} color The color of the selected piece
     * @returns An array of all the tiles the piece can move to
     */
    getAllMoveTiles: (x, y, piece, color) => {
        //the array that will store all the tiles the piece can move to
        let moveTiles = [];

        let moves = chessPiece[piece].moves;

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
                let yDirection = chessPiece.getForwardDirection(color);

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

                //checking the different rules for the piece. see chessPiece object for move rules
                switch (currentMove[0]) {
                    //for moves that add the coordinates to its tile position
                    case 'normal':
                        //cannot move to a tile that has a friendly piece
                        if (checkTile.color !== color) {
                            moveTiles.push(checkTile);
                        }
                        break;
                    //for moves that loop in a certain direction until an obstacle is found
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
        //creating the url to access the particular piece
        deadPiece.style.backgroundImage = `url(assets/images/chess-pieces/${tileData.color}-${tileData.piece}.png)`;

        let graveyardDiv;
        if (tileData.color === 'black') {
            graveyardDiv = document.getElementById('player1-graveyard');
        } else {
            graveyardDiv = document.getElementById('player2-graveyard');
        }
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
        if (color === 'white') {
            return -1;
        } else if (color === 'black') {
            return 1;
        } else {
            return null;
        }
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
    }
};