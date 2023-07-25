/*score evaluation ranges that will affect the ai based on the difficulty
    - if the difficulty is below the value of the first element, then this part of the evaluation will not happen
    - if the difficulty is above the value of the second element, then it will happen 100% of the time
    - if the difficulty is in between these values, then it will have a chance to happen*/
const aiDifficulty = {
    attackPiece: [0, 20],
    addSpaces: [10, 75],
    checkTileSafety: [0, 70],
    protectAllies: [20, 85],
    considerTargets: [30, 90],
    targetDilemma: [50, 100], //checks if multiple targets can be safely attacked from a single tile
    protectKing: [20, 90],
    surroundKing: [40, 100]
};

/**
 * Calculates the move made by an AI
 * @param {string} color The color of the AI making the move
 */
function makeMove(color) {
    //removing the timeout reference for making this move
    pieceMovement.moveWait = null;

    //getting all the pieces on the board that belong to the ai
    let pieces = chessPiece.getAll(color);

    //before checking all the moves, the scores of all the pieces in their current positions will be calculated and stored
    let currentScores = [];
    for (let pieceData of pieces) {
        currentScores.push(getTileScore(pieceData, pieceData));
    }
    //getting a list of all the moves that have the highest score
    let highestScorePieces = getBestMoves(pieces, currentScores);

    //picking a piece at random out of the array that has a move that matches the high score
    let movePiece = highestScorePieces[Math.floor(Math.random() * highestScorePieces.length)];
    //then, that piece will pick one of it's best moves at random
    let finalTile = movePiece.highestMoves[Math.floor(Math.random() * movePiece.highestMoves.length)];

    let movingElement = chessPiece.findElement(movePiece.x, movePiece.y);

    chessPiece.move(movingElement, finalTile);
}

/**
 * Returns a list of the best moves the ai can take on the board
 * @param {object} pieceDataList An array of data objects {x, y, piece, color} of all the pieces the AI has
 * @param {object} pieceCurrentScores An array of the scores all the pieces have at their current tiles
 * @returns {object} An array of data objects {x, y, piece, color, highestMoves[]} of all the pieces that have the best moves
 */
function getBestMoves(pieceDataList, pieceCurrentScores) {
    //all tiles will be given an individual score based on a number of parameters. the tile with the highest score will be chosen
    let highestScore = 0;
    //highestScore will be set to the first checked tile. after that any tile will have to beat the score to be set
    let isFirstCheck = true;
    //in case there are multiple pieces with the highest score, their info will all be stored in this array and chosen at random
    let highestScorePieces = [];
    for (let i = 0; i < pieceDataList.length; i++) {
        let currentPiece = pieceDataList[i];
        //only used for adding and removing the 'passant' class
        let pieceElement = null;
        //if the piece has not yet been added to the high score array
        let added = false;
        //stores any moves that have the same score as the highest score
        currentPiece.highestMoves = [];
        //gets all of the tiles the current piece can move to
        let tileMoves = pieceMovement.getAllMoveTiles(currentPiece);

        //looping through the moves
        for (let move of tileMoves) {
            let moveData = tile.getData(move);
            //temporarily adding the 'passant' class to a pawn if it is moving 2 spaces
            if (localStorage.getItem('passant') === 'enabled' && currentPiece.piece === 'pawn') {
                if (Math.abs(currentPiece.y - moveData.y) === 2) {
                    pieceElement = chessPiece.findElement(currentPiece.x, currentPiece.y);
                    pieceElement.classList.add('passant');
                }
            }
            //calculates the score of the tile based on several parameters
            let moveScore = getTileScore(currentPiece, moveData);
            //adding the extra parameters to the total score
            moveScore += getMoveOnlyScore(currentPiece, moveData);
            //finally, subtracting the current score from the new score
            moveScore -= pieceCurrentScores[i];

            //removing the 'passant' class and returning the piece element to the way it was
            if (pieceElement !== null) {
                pieceElement.classList.remove('passant');
                pieceElement = null;
            }
            //if this is the first move of the first tile, then set the highest score to the score of this move
            if (isFirstCheck) {
                highestScore = moveScore;
                highestScorePieces.push(currentPiece);
                currentPiece.highestMoves.push(move);
                isFirstCheck = false;
                continue;
            } else {
                if (moveScore >= highestScore) {
                    //if this is the first move with the same or higher score, it will be added to the pieces list
                    if (!added) {
                        added = true;
                        highestScorePieces.push(currentPiece);
                    }
                    //if this score is higher than the highest score, then remove everything
                    //from the high score lists and start over with the new high score
                    if (moveScore > highestScore) {
                        highestScorePieces = [currentPiece];
                        currentPiece.highestMoves = [];
                    }
                    highestScore = moveScore;
                    currentPiece.highestMoves.push(move);
                }
            }
        }
    }
    return highestScorePieces;
}

/**
 * Gets how good a particular move would be using a score system
 * @param {object} currentPiece The data object {x, y, piece, color} of the piece that will make the move
 * @param {object} moveTile The data object {x, y, piece, color} of the tile the piece will move to
 * @returns {integer} The total score of the move
 */
function getTileScore(pieceData, moveTileData) {
    //each move will have a score
    let moveScore = 0;
    //monitoring all the tiles around it for information
    let tileEval;
    if (!(pieceData.x === moveTileData.x && pieceData.y === moveTileData.y) && moveTileData.color === pieceData.color) {
        //for a castling move
        tileEval = evaluateTileCastle(pieceData, moveTileData);
    } else {
        //for every other move
        tileEval = evaluateTile(moveTileData, pieceData);
    }
    //adding the total number of moves the piece could make on this tile multiplied by 1% of it's value to the score
    if (difficultyAllows(aiDifficulty.addSpaces)) {
        moveScore += tileEval.availableSpaces * (chessPiece.value[pieceData.piece] / 100);
    }
    //adding the total number of spaces the king can safely move to x30 to the score
    if (difficultyAllows(aiDifficulty.protectKing)) {
        moveScore += getKingSafeTiles(pieceData.color, pieceData, moveTileData) * 30;
    }
    //increasing the score if the enemy king has less spaces to move to
    if (difficultyAllows(aiDifficulty.surroundKing)) {
        let enemyColor = (pieceData.color === 'white') ? 'black' : 'white';
        //the less tiles the enemy king has to move to, the higher the score
        moveScore += (8 - getKingSafeTiles(enemyColor, pieceData, moveTileData)) * 30;
    }

    //calculates the risk of the piece getting eliminated if it moves to this tile
    let battleScore = 0;
    let tileBattle = simulateBattle(pieceData, tileEval);
    if (difficultyAllows(aiDifficulty.checkTileSafety)) {
        battleScore = tileBattle.battleScore;
    }
    //if the outcome of the battle is negative for the current piece, then remove the piece's value from the score
    if (battleScore < 0) {
        //get the piece's value based on the tile it will move to, rather than the one it's on. used for pawn movement
        let newPieceData = {
            x: pieceData.x,
            y: moveTileData.y,
            piece: pieceData.piece,
            color: pieceData.color
        };
        moveScore -= chessPiece.getValue(newPieceData);
    } else if (difficultyAllows(aiDifficulty.considerTargets)) {
        //taking targets into consideration if the move is low risk
        moveScore += evaluateTargets(pieceData, tileEval, tileBattle.battleScore);
    }
    //adding all the values of allies this tile will protect to the total score
    if (difficultyAllows(aiDifficulty.protectAllies)) {
        //adding the values of all the pieces this piece can move to on an enemy attack
        if (tileEval.allyGuarded.length > 0) {
            moveScore += getProtectingAllies(pieceData, moveTileData, tileEval.allyGuarding, false);
        }
        //adding all the values of all the pieces where this tile will block an enemy attack.
        //only do this if there are ally pieces that can attack this tile, in order to prevent pieces
        //from moving into positions where the enemy can just attack and leave the ally piece vulnerable again
        if (tileEval.allyProtect.length > 0 && tileEval.allyGuarding.length > 0) {
            moveScore += getProtectingAllies(pieceData, moveTileData, tileEval.allyGuarding, true);
        }
    }
    return moveScore;
}

/**
 * Adds or subtracts to the total tile score using parameters only related to a piece moving
 * @param {object} pieceData The data object {x, y, piece, value} of the piece that will move
 * @param {object} moveTileData The data object {x, y, piece, value} of the tile the piece will move to
 * @returns {integer} The extra score of the tile
 */
function getMoveOnlyScore(pieceData, moveTileData) {
    let moveScore = 0;
    //if there is an enemy piece already on the tile, then add that piece's value to the score
    if (difficultyAllows(aiDifficulty.attackPiece)) {
        if (moveTileData.color !== '' && moveTileData.color !== pieceData.color) {
            moveScore += chessPiece.getValue(moveTileData);
        }
        //adding the score of any eliminated pawn from an en passant move
        if (pieceData.piece === 'pawn') {
            if (moveTileData.piece === '') {
                //finding the move the piece took to get to this tile using the differences between their coordinates
                let move = ['', moveTileData.x - pieceData.x, moveTileData.y - pieceData.y];
                if (pieceMovement.canPassant(pieceData, move)) {
                    //finding the pawn that will be eliminated from the passant, which will be to the left or right of the starting tile
                    let passantPiece = chessPiece.findData(moveTileData.x, pieceData.y);
                    moveScore += chessPiece.getValue(passantPiece);
                }
            }
        }
    }
    //add extra points for pawns to encourage movement
    if (difficultyAllows(aiDifficulty.addSpaces)) {
        if (pieceData.piece === 'pawn') {
            moveScore += findPawnScore(pieceData, moveTileData);
        }
    }
    return moveScore;
}

/**
 * Gets the extra points added to a pawn depending on how far down the board they are
 * @param {object} pieceData The data object {x, y, piece, color} of the pawn
 * @param {object} moveTileData The data object {x, y, piece, color} of the tile the pawn will move to
 * @returns {integer} The total score to be added to the tile
 */
function findPawnScore(pieceData, moveTileData) {
    //how many points per tile moved the pawn will get
    let tileScore = 0;
    //if pawns can be promoted to any piece, then set the points per tile to always be at maximum
    if (localStorage.getItem('pawnPromotion') === 'any') {
        tileScore = 24;
    }
    //if the pawn can only be promoted to pieces from the grave, then the
    //score will depend on the best piece to revive
    else {
        //finding the grave piece with the highest value, if any
        let highestValue = 0;
        let graves = graveyard.getElements(pieceData.color);
        for (let grave of graves) {
            let gravePiece = graveyard.getDeadPiece(grave);
            let graveValue = chessPiece.value[gravePiece];
            if (graveValue > 100 && graveValue > highestValue) {
                highestValue = graveValue;
            }
        }
        //adding 15 points added with 1% of the highest piece in the graveyard's value.
        //if the queen in in the graveyard this brings the score to 24
        tileScore = 15 + (highestValue / 100);
    }
    return pieceMovement.getForwardDistance(moveTileData.y, pieceData.color) * tileScore;
}

/**
 * Scans a tile's surroundings for targets, threats and allies
 * @param {object} tileData  The data object {x, y, piece, color} of the tile the piece will move to
 * @param {object} evaluatingPiece  The data object {x, y, piece, color} of the piece that will make the move
 * @returns {object} {x, y, availableSpaces, enemyTarget, enemyThreat, allyGuarded, allyGuarding, allyProtect}
 */
function evaluateTile(tileData, evaluatingPiece) {
    let tileEvaluation = {
        x: tileData.x,
        y: tileData.y,
        availableSpaces: 0,
        //the enemy pieces the evaluating piece can attack at this tile
        enemyTarget: [],
        //the enemy pieces that can attack the evaluating piece at this tile
        enemyThreat: [],
        //the allied pieces that can retaliate any enemy moves to this tile
        allyGuarded: [],
        //the allied pieces the evaluating piece can move to if an enemy attacks them
        allyGuarding: [],
        //the allied pieces that are blocked from an enemy attack from this tile
        allyProtect: []
    };

    //the tile will be evaluated using the moves of the queen and the knight, as that will cover all the possible move types
    for (let move of pieceMovement.queen) {
        //evaluating each vector and adding any piece it finds to the final evaluation
        let moveResult = evaluateTileVector(tileData, evaluatingPiece, move);
        tileEvaluation = addPieceRelationship(tileEvaluation, moveResult);
    }

    for (let move of pieceMovement.knight) {
        //evaluating each point and adding any piece it finds to the final evaluation
        let moveResult = evaluateTilePoint(tileData, evaluatingPiece, move);
        tileEvaluation = addPieceRelationship(tileEvaluation, moveResult);
    }
    return tileEvaluation;
}

/**
 * Scans a tile's surroundings for targets, threats and allies, taking a simulated move into consideration
 * @param {object} tileData  The data object {x, y, piece, color} of the piece that will make the move
 * @param {object} evaluatingPiece  The data object {x, y, piece, color} of the tile the piece will move to
 * @param {object} pieceFromElement The piece element that will simulate movement
 * @param {object} tileToElement The element of the tile the piece will simulate to
 * @returns {object} {x, y, availableSpaces, enemyTarget, enemyThreat, allyGuarded, allyGuarding}
 */
function evaluateTileWithMove(tileData, evaluatingPiece, pieceFromElement, tileToElement) {
    //storing pieceFrom's parent element so it can be returned after the evaluation
    let tileFrom = pieceFromElement.parentNode;

    //if there is already a piece on the tile, it will be moved outside of the board to simulate it being eliminated
    let pieceTo = tile.getPieceElement(tileToElement);
    if (pieceTo !== null) {
        document.getElementById("game").appendChild(pieceTo);
    }

    //temporarily set pieceFrom's parent element to tileToElement
    tileToElement.appendChild(pieceFromElement);

    //evaluating the tile now that the simulated move is set up
    let tileEvaluation = evaluateTile(tileData, evaluatingPiece);

    //returning the moved pieces back to their original tiles
    tileFrom.appendChild(pieceFromElement);
    if (pieceTo !== null) {
        tileToElement.appendChild(pieceTo);
    }
    return tileEvaluation;
}

/**
 * Finds the correct coordinates of two pieces performing a castle and evaluates the tile
 * with a simulated move
 * @param {object} pieceMoveData The data object {x, y, piece, color} of the piece that is doing the evaluation
 * @param {object} otherPieceData The data object {x, y, piece, color} of the other piece that will take part in the move
 * @returns {object} A tile evaluation {x, y, availableSpaces, enemyTarget, enemyThreat, allyGuarded, allyGuarding}
 */
function evaluateTileCastle(pieceMoveData, otherPieceData) {
    //getting if the king will be moving to the left or right
    let kingDirection = 1;
    if ((pieceMoveData.piece === 'king' && pieceMoveData.x > otherPieceData.x) || (pieceMoveData.piece === 'rook' && pieceMoveData.x < otherPieceData.x)) {
        kingDirection = -1;
    }
    //getting the coordinates of where the king and rook will end up after the castle
    let pieceX, otherX;
    if (pieceMoveData.piece === 'king') {
        //the king always moves 2 tiles
        pieceX = pieceMoveData.x + (kingDirection * 2);
        //the rook always ends up beside the king's starting tile
        otherX = pieceMoveData.x + kingDirection;
    } else {
        pieceX = otherPieceData.x + kingDirection;
        otherX = otherPieceData.x + (kingDirection * 2);
    }

    //tileData is the tile's data object of where the piece doing the evaluation will move
    //otherTileElement is the element of the tile the other piece will move to
    let tileData = {
        x: pieceX,
        y: pieceMoveData.y,
        piece: '',
        color: ''
    };
    //getting the elements of the other piece that will move with the current piece to simulate a move
    let otherPieceElement = chessPiece.findElement(otherPieceData.x, otherPieceData.y);
    let otherMoveElement = tile.getElement(otherX, otherPieceData.y);

    return evaluateTileWithMove(pieceMoveData, tileData, otherPieceElement, otherMoveElement);
}

/**
 * Scans a single vector for targets, threats, and allies
 * @param {object} tileData  The data object {x, y, piece, color} of the piece that will make the move
 * @param {object} evaluatingPiece  The data object {x, y, piece, color} of the tile the piece will move to
 * @param {object} move The specific vector the scan will move along (see pieceMovement.queen for all vectors)
 * @returns {object} {availableSpaces, enemyTarget, enemyThreat, allyGuarded, allyGuarding, allyProtect}
 */
function evaluateTileVector(tileData, evaluatingPiece, move) {
    //storing the relationships between the piece that is
    //doing the checking and any piece it hits
    let tileEval = {
        availableSpaces: 0,
        enemyTarget: null,
        enemyThreat: null,
        allyGuarded: null,
        allyGuarding: null,
        allyProtect: null
    };
    //if neither of the vectors are 0 then the piece is moving diagonally
    let isDiagonal = (Math.abs(move[1]) === Math.abs(move[2]));
    
    let foundPiece = getPieceFromVector(tileData, evaluatingPiece, move);
    if (foundPiece[0] !== null) {
        //if there is only one tile between the pieces, then they are beside each other
        let isFirstMove = (foundPiece[1] === 1);
        tileEval = getPieceRelationship(tileData, evaluatingPiece, foundPiece[0], move, isFirstMove);
    }
    if (evaluatingPiece.piece === 'queen' || (isDiagonal && evaluatingPiece.piece === 'bishop') || (!isDiagonal && evaluatingPiece.piece === 'rook')) {
        tileEval.availableSpaces += foundPiece[1];
    }
    return tileEval;
}

/**
 * Returns a piece found by moving in a vector
 * @param {object} tileData The data object {x, y, piece, color} of the tile where the vector will start
 * @param {object} evaluatingPiece The data object {x, y, piece, color} of the piece looking to move to this tile
 * @param {object} move The vector ['rule', x, y] that is used
 * @returns {object} An array with the data object {x, y, piece, color} of the piece found in this vector, and the distance from the tile
 */
function getPieceFromVector(tileData, evaluatingPiece, move) {
    //the coordinates the loop will be manipulating
    let x = tileData.x;
    let y = tileData.y;
    let vector1 = move[1]; //because move[0] is the rule 'vector'
    let vector2 = move[2];
    //the distance between the piece and the starting tile
    let tileDistance = 1;

    //taking the first step in the vector
    x += vector1;
    y += vector2;

    //keep moving in the direction of the vector until it goes out of bounds, or it hits a piece (evaluated inside the loop)
    while (tile.inBounds(x, y)) {
        //stop the vector if it comes into contact with itself
        if (!(x === evaluatingPiece.x && y === evaluatingPiece.y)) {
            let foundPiece = chessPiece.findData(x, y);
            if (foundPiece.piece !== '') {
                return [foundPiece, tileDistance];
            }
        }
        //keep adding the vector to the coordinates until an obstacle is reached
        x += vector1;
        y += vector2;
        tileDistance++;
    }
    return [null, tileDistance];
}

/**
 * Scans a single point for targets, threats, and allies
 * @param {object} tileData  The data object {x, y, piece, color} of the tile the piece will move to
 * @param {object} evaluatingPiece  The data object {x, y, piece, color} of the piece that will make the move
 * @param {object} move The specific point that will be checked (see pieceMovement.knight for the points in question)
 * @returns {object} {availableSpaces, enemyTarget, enemyThreat, allyGuarded, allyGuarding, allyProtect}
 */
function evaluateTilePoint(tileData, evaluatingPiece, move) {
    let x = tileData.x + move[1];
    let y = tileData.y + move[2];

    //storing the relationships between the piece that is
    //doing the checking and any piece it hits
    let tileEval = {
        availableSpaces: 0,
        enemyTarget: null,
        enemyThreat: null,
        allyGuarded: null,
        allyGuarding: null,
        allyProtect: null
    };

    //keep moving in the direction of the vector until it goes out of bounds, or it hits a piece (evaluated inside the loop)
    if (tile.inBounds(x, y)) {
        //getting the information of a tile if it has a piece or not
        let foundPiece = chessPiece.findData(x, y);
        //stop the vector if it comes into contact with itself
        if (!(x === evaluatingPiece.x && y === evaluatingPiece.y)) {
            if (foundPiece.piece !== '') {
                tileEval = getPieceRelationship(tileData, evaluatingPiece, foundPiece, move, false);
            }
        }
        //if the tile can be moved to in the move after this one, it will increase availableSpaces
        //we will include the the tile the piece is already on because it can always move back to it's original position
        if (evaluatingPiece.piece === 'knight' && (foundPiece.color !== evaluatingPiece.color || (x === evaluatingPiece.x && y === evaluatingPiece.y))) {
            tileEval.availableSpaces++;
        }
    }
    return tileEval;
}

/**
 * Determines whether the piece at an evaluated tile is a target, threat or
 * ally in relation to the piece doing the evaluation
 * @param {object} tileData  The data object {x, y, piece, color} of the tile the piece will move to
 * @param {object} evaluatingPiece The data object {x, y, piece, color} of the piece that is doing the evaluation
 * @param {object} foundPiece The data object {x, y, piece, color} of the piece that is being evaluated
 * @param {object} move The move that was taken to reach the found piece (see pieceMovement object for moves)
 * @param {boolean} isBeside If the found piece is only one tile away from the evaluating piece
 * @returns {object} {availableSpaces, enemyTarget, enemyThreat, allyGuarded, allyGuarding, allyProtect}
 */
function getPieceRelationship(tileData, evaluatingPiece, foundPiece, move, isBeside) {
    //storing the relationships between the piece that is
    //doing the checking and any piece it hits
    let tileEval = {
        availableSpaces: 0,
        enemyTarget: null,
        enemyThreat: null,
        allyGuarded: null,
        allyGuarding: null,
        allyProtect: null
    };
    //finds the color of the opponent
    let enemyColor = (evaluatingPiece.color === 'white') ? 'black' : 'white';
    //treating the 'castle' move rule like a vector
    let moveRule = move[0];
    if (moveRule === 'first-castle') {
        moveRule = 'vector';
    }
    //creating a new array with the updated rule to avoid changing the original rule
    let moveForward = [moveRule, move[1], move[2]];
    //reversing the move to evaluate pieces that can attack the evaluating piece at this tile
    let moveReverse = [moveRule, -move[1], -move[2]];

    if (foundPiece.color === evaluatingPiece.color) { //if the evaluation runs into a friendly piece
        //checking if the piece at this tile is blocking an enemy from attacking another piece
        let oppositePiece = getPieceFromVector(tileData, evaluatingPiece, moveReverse);
        if (oppositePiece[0] !== null && pieceMovement.canAttack(oppositePiece[0], moveForward, false)) {
            //if this piece will block an enemy from attacking another piece, it is guarding that piece
            tileEval.allyProtect = foundPiece;
        } else {
            //if the current piece can attack the friendly piece tile if an enemy moves to it
            if (pieceMovement.canAttack(evaluatingPiece, moveForward, isBeside)) {
                tileEval.allyGuarding = foundPiece;
            }
        }
        //if the friendly piece can attack the tile if an enemy moves to it
        if (pieceMovement.canAttack(foundPiece, moveReverse, isBeside)) {
            tileEval.allyGuarded = foundPiece;
        }
    } else if (foundPiece.color === enemyColor) { //if the evaluation runs into an enemy piece
        //if the enemy piece can be attacked by the piece at this tile
        if (pieceMovement.canAttack(evaluatingPiece, moveForward, isBeside)) {
            tileEval.enemyTarget = foundPiece;
        }
        //if the enemy piece can attack the piece at this tile
        if (pieceMovement.canAttack(foundPiece, moveReverse, isBeside)) {
            tileEval.enemyThreat = foundPiece;
        }
    }
    return tileEval;
}

/**
 * Adds the result of a single move evaluation to the total evaluation list
 * @param {object} tileEvaluation The array that will store the information of the entire tile evaluation
 * @param {object} moveResults The results from a single move that will be added to the evaluation
 * @returns {object} The tileEvaluation array combined with the move result
 */
function addPieceRelationship(tileEvaluation, moveResults) {
    //adding the available spaces to the total evaluation
    tileEvaluation.availableSpaces += moveResults.availableSpaces;
    //adding the allyGuarding results to the total evaluation
    if (moveResults.allyGuarding !== null) {
        tileEvaluation.allyGuarding.push(moveResults.allyGuarding);
    }
    //adding the allyGuarded results to the total evaluation
    if (moveResults.allyGuarded !== null) {
        tileEvaluation.allyGuarded.push(moveResults.allyGuarded);
    }
    //adding the allyProtect results to the total evaluation
    if (moveResults.allyProtect !== null) {
        tileEvaluation.allyProtect.push(moveResults.allyProtect);
    }
    //adding the enemyTarget results to the total evaluation
    if (moveResults.enemyTarget !== null) {
        tileEvaluation.enemyTarget.push(moveResults.enemyTarget);
    }
    //adding the enemyThreat results to the total evaluation
    if (moveResults.enemyThreat !== null) {
        tileEvaluation.enemyThreat.push(moveResults.enemyThreat);
    }
    return tileEvaluation;
}

/**
 * May prevent a part of the tile evaluation from happening depending on the difficulty
 * @param {object} rule The range of difficulty this part will take effect in (see aiDifficulty object at top of page)
 * @returns {boolean} If the part should continue or not
 */
function difficultyAllows(rule) {
    let difficulty;
    //if there is only one ai playing the game, it will use the first difficulty
    if (getHumanPlayers() > 0) {
        difficulty = localStorage.getItem('difficulty1');
    } else {
        //finding which ai is making the move
        let playerTurn = getPlayerTurn();
        difficulty = localStorage.getItem(`difficulty${playerTurn.place}`);
    }
    if (difficulty < rule[0]) {
        //if the difficulty falls below the minimum difficulty for this rule, then do not proceed with the rule
        return false;
    } else if (difficulty >= rule[1]) {
        //if the difficulty is higher than the maximum difficulty for this rule, proceed with this rule every time
        return true;
    } else {
        //if the difficulty is in between the min and the max, the higher the difficulty is, the more likely the rule will proceed
        let ruleDifference = rule[1] - rule[0];
        let difficultyPos = difficulty - rule[0];

        return (Math.random() * ruleDifference < difficultyPos);
    }
}

/**
 * Simulates a battle on a tile, assuming all the pieces that can attack
 * will attack. If the battle score is less than 0, this won't be a good move for the piece
 * @param {object} pieceData The data object {x, y, piece, color} of the piece looking to move to the tile
 * @param {object} tileEval The evaluation of the tile the piece will move to (got using evaluateTile)
 * @returns {[battleScore, remainingAllies, remainingEnemies]} The score outcome of the battle, as well as the remaining pieces
 */
function simulateBattle(pieceData, tileEval) {
    //if there is an ally (or allies) guarding this tile, then a "battle" will take place.
    // 1 - the ally with the smallest value will move to this tile and destroy the enemy piece.
    //      we will assume the enemy attacked with their lowest value piece so we will add the
    //      smallest value to the battle score
    // 2 - if there is another enemy that can attack this tile, the smallest value of allyGuarded
    //      will be taken from the battle score
    // 3 - this loop will continue until there is no more moves on this tile from either side

    //returning the final score of the battle, as well as what pieces will be left standing
    let aftermath = {
        battleScore: 0,
        remainingAllies: [],
        remainingEnemies: []
    };
    //adding all the allies to the battle
    for (let ally of tileEval.allyGuarded) {
        aftermath.remainingAllies.push(ally);
    }
    //adding all the enemies to the battle
    for (let enemy of tileEval.enemyThreat) {
        aftermath.remainingEnemies.push(enemy);
    }
    //if there are enemies that can attack this tile
    if (tileEval.enemyThreat.length > 0) {
        //finding the values of the current piece and the piece with the lowest value that is threatening it
        //stops high value pieces moving to tiles where they can be attacked by low value pieces
        let pieceValue = chessPiece.getValue(pieceData);
        let lowestEnemy = chessPiece.findLowestValue(tileEval.enemyThreat);

        //removing the current pieces value from the score
        //as the first move of the battle will be to eliminate the current piece
        aftermath.battleScore = -pieceValue;

        //if all the enemyThreat values are greater than or equal to the
        //lowest value in enemyThreat, then simulate a battle
        if (pieceValue <= lowestEnemy[0]) {
            while (aftermath.remainingEnemies.length > 0 && aftermath.remainingAllies.length > 0) {
                //finding the piece with the lowest value in each of the tiles
                //and keeping their values (stored in the first element) and
                //their positions in the array (stored in the second element)
                lowestEnemy = chessPiece.findLowestValue(aftermath.remainingEnemies);
                let lowestAlly = chessPiece.findLowestValue(aftermath.remainingAllies);

                //the first move of each loop in the battle will be the ally
                //adding the value of the enemy most likely to have attacked (the one with the lowest value) to the score
                aftermath.battleScore += lowestEnemy[0];
                //then removing that enemy from the array
                aftermath.remainingEnemies.splice(lowestEnemy[1], 1);

                //if there are still enemies that can attack, they will make the next move
                if (aftermath.remainingEnemies.length > 0) {
                    //updating the lowest enemy value as the old one was removed from the array
                    lowestEnemy = chessPiece.findLowestValue(aftermath.remainingEnemies);

                    //removing the ally with the lowest value from the score and array
                    aftermath.battleScore -= lowestAlly[0];
                    aftermath.remainingAllies.splice(lowestAlly[1], 1);
                }
            }
        }
    }
    return aftermath;
}

/**
 * Calculates how much the targets at a tile will add to the total tile score
 * @param {object} tileEval The evaluation done at this tile
 * @param {integer} battleScore The final score after a battle has taken place (see simulateBattle function)
 * @returns {integer} The extra score from the targets
 */
function evaluateTargets(pieceData, tileEval, battleScore) {
    let targetScore = 0;
    if (tileEval.enemyTarget.length > 0) {
        //checking which target tiles are safe to attack
        let safeTargets = [];
        //the total value of all targets at this tile. 10% of this will be added to the tile
        //score if there is no more than 1 target the piece can safely attack
        let totalValue = 0;

        //checks if moving to the tile will result in a net gain for the ai
        for (let target of tileEval.enemyTarget) {
            let targetValue = chessPiece.getValue(target);
            //if the target is a king, its value will depend on how many spaces it can move to. the fewer the spaces, the higher the score
            //this should reduce the chance of the ai trying to get checks that can easily be avoided
            if (targetValue.piece === 'king') {
                let enemyColor = (pieceData.color === 'white') ? 'black' : 'white';
                let tileToData = chessPiece.findData(tileEval.x, tileEval.y);
                totalValue += (8 - getKingSafeTiles(enemyColor, pieceData, tileToData) * 25);
            } else {
                //if it is any other piece
                totalValue += targetValue;
            }
            //simulating a battle at this tile to get the end result
            let targetEval = evaluateTile(target, pieceData);
            let tileBattle = simulateBattle(pieceData, targetEval);
            //adding the value of the lost piece to the battlescore
            if (difficultyAllows(aiDifficulty.targetDilemma) && tileBattle.battleScore + targetValue >= 0) {
                //if the result is positive for the ai, then the tile is considered "safe"
                safeTargets.push(target);
            }
        }
        //if there is more than one target that is safe to attack, then this tile is a real threat to
        //the enemy, so give it a high score
        if (safeTargets.length > 1) {
            //finds the target with the lowest value. The first element in the array is the value
            let lowestTarget = chessPiece.findLowestValue(safeTargets)[0];
            if (tileEval.enemyThreat.length > 0) {
                //if there are threats at this tile, the enemy may start the battle if it benifits them more
                targetScore = (lowestTarget < battleScore) ? lowestTarget : battleScore;
            } else {
                //if there are no pieces threatening this tile, then add the target with the
                //lowest score to this tile because the enemy may sacrifice it to save the higher value piece
                targetScore = lowestTarget;
            }
        } else {
            //add 10% of the target's score if there is only one of them
            targetScore = Math.floor(totalValue / 10);
        }
    }
    return targetScore;
}

/**
 * Gets the score of a tile based on how many pieces the moving piece can protect
 * @param {object} pieceData The data object {x, y, piece, color} of the piece looking to move
 * @param {object} moveTileData The data object {x, y, piece, color} of the tile the piece will move to
 * @param {object} allies A list of all the allied pieces the piece can protect
 * @param {boolean} isBlocking Wether the piece is protecting the ally by blocking an enemy move
 * @returns {integer} The total values of all pieces that will rely on this piece moving here
 */
function getProtectingAllies(pieceData, moveTileData, allies, isBlocking) {
    let totalScore = 0;
    //getting the element of the piece and the tile it is moving to to simulate the move in the evaluation
    let pieceElement = chessPiece.findElement(pieceData.x, pieceData.y);
    let tileElement = tile.getElement(moveTileData.x, moveTileData.y);
    //iterating through all of the allies the piece can protect
    for (let ally of allies) {
        //protecting the king this way is pointless as the king cannot be eliminated like other pieces
        //however, if the piece is in the way of the enemy attacking the king, then the protect is valid
        if (isBlocking || ally.piece !== 'king') {
            //checking if the allied piece is safe at its current tile before the move
            let tileEval = evaluateTileWithMove(ally, ally, pieceElement, tileElement);
            //getting the score of the battle with the piece protecting it
            let battleAfter = simulateBattle(ally, tileEval);
            //removing the moving piece from the ally's allyGuarded array
            for (let i = 0; i < tileEval.allyGuarded.length; i++) {
                let currentAlly = tileEval.allyGuarded[i];
                if (currentAlly.x === moveTileData.x && currentAlly.y === moveTileData.y) {
                    //removing the piece from the array
                    tileEval.allyGuarded.splice(i, 1);
                }
            }
            //simulating another battle but without the piece protecting it
            let battleBefore = simulateBattle(ally, tileEval);
            //if the ally is not safe without the piece but is safe with it
            if (battleBefore.battleScore < 0 && battleAfter.battleScore >= 0) {
                //adding the value of that piece to the total score
                totalScore += chessPiece.getValue(ally);
            }
        }
    }
    return totalScore;
}

/**
 * Returns how many spaces a king can safely move to
 * @param {string} color The color of the king
 * @param {object} pieceFromData The data object {x, y, piece, color} of the piece looking to move
 * @param {object} tileToData The data object {x, y, piece, color} of the tile the piece will move to
 * @returns {integer} The number of spaces that would be safe for the king to move to
 */
function getKingSafeTiles(color, pieceFromData, tileToData) {
    let safeTiles = 0;
    //getting the data object of the king
    let kingData;
    if (pieceFromData.piece === 'king') {
        kingData = pieceFromData;
    } else {
        kingData = tile.findKing(color);
    }
    //iterating through all the possible moves the king can take
    for (let move of pieceMovement.king) {
        //not taking the castling moves into consideration
        if (move[0] === 'normal') {
            let tileX, tileY;
            //adding the move coordinates to where the king will be for this evaluation
            if (pieceFromData.piece === 'king') {
                tileX = tileToData.x + move[1];
                tileY = tileToData.y + move[2];
            } else {
                tileX = kingData.x + move[1];
                tileY = kingData.y + move[2];
            }
            //if the king is in a corner, then the amount of spaces it can move to if it's under threat is smaller
            if (tile.inBounds(tileX, tileY)) {
                let moveTile = chessPiece.findData(tileX, tileY);
                //The king can move to a tile if it is empty or has an enemy piece on it
                if (moveTile.color !== color) {
                    //evaluating every tile around the king for threats
                    let tileEval;
                    if (pieceFromData.piece === 'king' || (pieceFromData.x === tileToData.x && pieceFromData.y === tileToData.y)) {
                        tileEval = evaluateTile(moveTile, kingData);
                    } else {
                        //if another piece is moving, this can affect how many safe spaces the king can
                        //move to, so we will simulate this move before the evaluation
                        let pieceFromElement = chessPiece.findElement(pieceFromData.x, pieceFromData.y);
                        let tileToElement = tile.getElement(tileToData.x, tileToData.y);
                        tileEval = evaluateTileWithMove(moveTile, kingData, pieceFromElement, tileToElement);
                    }
                    //if there is no threat at this tile, or if an ally piece can move in the way
                    //of an attack, then it is safe
                    if (tileEval.enemyThreat.length === 0 || tileEval.allyGuarded.length > 0) {
                        safeTiles++;
                    }
                }
            }
        }
    }
    return safeTiles;
}