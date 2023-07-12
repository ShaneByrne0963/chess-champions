function makeMove(color) {
    console.clear();
    //all tiles will be given an individual score based on a number of parameters. the tile with the highest score will be chosen
    let highestScore = 0;
    //highestScore will be set to the first checked tile. after that any tile will have to beat the score to be set
    let isFirstCheck = true;
    //in case there are multiple pieces with the highest score, their info will all be stored in this array and chosen at random
    let highestScorePieces = [];

    //getting all the pieces on the board that belong to the ai
    let pieces = chessPiece.getAll(color);

    //before checking all the moves, the scores of all the pieces in their current positions will be calculated and stored
    let currentScores = [];
    for (let pieceData of pieces) {
        currentScores.push(getTileScore(pieceData, pieceData));
    }

    for (let i = 0; i < pieces.length; i++) {
        let currentPiece = pieces[i];
        //if the piece has not yet been added to the high score array
        let added = false;
        //stores any moves that have the same score as the highest score
        currentPiece.highestMoves = [];
        //gets all of the tiles the current piece can move to
        let tileMoves = pieceMovement.getAllMoveTiles(currentPiece);

        //looping through the moves
        for (let move of tileMoves) {
            let moveData = chessPiece.getData(move);
            //calculates the score of the tile based on several parameters
            let moveScore = getTileScore(currentPiece, moveData);

            //add 15 points for pawns to encourage movement
            if (currentPiece.piece === 'pawn' || currentPiece.piece === 'pawnNew') {
                moveScore += 15;
            }

            //finally, subtracting the current score from the new score
            moveScore -= currentScores[i];

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

    //picking a piece at random out of the array that has a move that matches the high score
    let movePiece = highestScorePieces[Math.floor(Math.random() * highestScorePieces.length)];
    //then, that piece will pick one of it's best moves at random
    let finalTile = movePiece.highestMoves[Math.floor(Math.random() * movePiece.highestMoves.length)];

    let movingElement = chessPiece.findElement(movePiece.x, movePiece.y);

    chessPiece.move(movingElement, finalTile);
}

/**
 * Gets how good a particular move would be using a score system
 * @param {object} currentPiece The data object {x, y, piece, color} of the piece that will make the move
 * @param {object} moveTile The data object {x, y, piece, color} of the tile the piece will move to
 * @returns {integer} The total score of the move
 */
function getTileScore(currentPiece, moveTile) {
    //each move will have a score
    let moveScore = 0;

    //monitoring all the tiles around it for information
    let tileEval = evaluateTile(moveTile, currentPiece);

    //adding the total number of moves the piece could make on this tile multiplied by 1% of it's value to the score
    moveScore += tileEval.availableSpaces * (chessPiece.value[currentPiece.piece] / 100);

    //calculates the risk of the piece getting eliminated if it moves to this tile
    let isThreatened = false;
    if (tileEval.enemyThreat.length > 0) {
        isThreatened = true;
    }

    return moveScore;
}

/**
 * Scans a tile's surroundings for targets, threats and allies
 * @param {object} tileData  The data object {x, y, piece, color} of the piece that will make the move
 * @param {object} evaluatingPiece  The data object {x, y, piece, color} of the tile the piece will move to
 * @returns {object} {availableSpaces, enemyTarget, enemyThreat, allyGuarded}
 */
function evaluateTile(tileData, evaluatingPiece) {
    let tileEvaluation = {
        availableSpaces: 0,
        enemyTarget: [],
        enemyThreat: [],
        allyGuarded: []
    };

    //the tile will be evaluated using the moves of the queen and the knight, as that will cover all the possible move types
    for (let move of pieceMovement.queen) {
        let moveResult = evaluateTileVector(tileData, evaluatingPiece, move);

        tileEvaluation = addPieceRelationship(tileEvaluation, moveResult);
    }

    for (let move of pieceMovement.knight) {
        let moveResult = evaluateTilePoint(tileData, evaluatingPiece, move);

        tileEvaluation = addPieceRelationship(tileEvaluation, moveResult);
    }
    return tileEvaluation;
}

function evaluateTileWithMove(tileData, evaluatingPiece, pieceFrom, tileTo) {
    //storing pieceFrom's parent element so it can be returned after the evaluation
    let tileFrom = pieceFrom.parentNode;

    //if there is already a piece on the tile, it will be moved outside of the board to simulate it being eliminated
    let pieceTo = tile.getPieceElement(tileTo);
    if (pieceTo !== null) {
        pieceTo.parentNode = document.getElementById("game");
    }

    //temporarily set pieceFrom's parent element to tileTo
    pieceFrom.parentNode = tileTo;

    //evaluating the tile now that the simulated move is set up
    let tileEvaluation = evaluateTile(tileData, evaluatingPiece);

    //returning the moved pieces back to their original tiles
    pieceFrom.parentNode = tileFrom;
    pieceTo.parentNode = tileTo;

    return tileEvaluation;
}

function evaluateTileVector(tileData, evaluatingPiece, move) {
    //the coordinates the loop will be manipulating
    let x = tileData.x;
    let y = tileData.y;
    let vector1 = move[1]; //because move[0] is the rule 'vector'
    let vector2 = move[2];
    let isFirstMove = true;

    //storing the relationships between the piece that is
    //doing the checking and any piece it hits
    let tileEval = {
        availableSpaces: 0,
        enemyTarget: null,
        enemyThreat: null,
        allyGuarded: null
    };
    //if neither of the vectors are 0 then the piece is moving diagonally
    let isDiagonal = (Math.abs(vector1) === Math.abs(vector2));

    //taking the first step in the vector
    x += vector1;
    y += vector2;

    //keep moving in the direction of the vector until it goes out of bounds, or it hits a piece (evaluated inside the loop)
    while (tile.inBounds(x, y)) {
        //stop the vector if it comes into contact with itself
        if (!(x === evaluatingPiece.x && y === evaluatingPiece.y)) {
            let foundPiece = chessPiece.findData(x, y);
            if (foundPiece.piece !== '') {
                tileEval = getPieceRelationship(evaluatingPiece, foundPiece, move, isFirstMove);
                //console.log(tileEval);
                break;
            }
        }
        //if the tile can be moved to in the move after this one, it will increase availableSpaces
        if (evaluatingPiece.piece === 'queen'
            || (isDiagonal && evaluatingPiece.piece === 'bishop')
            || (!isDiagonal && evaluatingPiece.piece === 'rook')) {
            tileEval.availableSpaces++;
        }
        //keep adding the vector to the coordinates until an obstacle is reached
        x += vector1;
        y += vector2;
        isFirstMove = false;
    }
    return tileEval;
}

function evaluateTilePoint(tileData, evaluatingPiece, move) {
    let x = tileData.x + move[1];
    let y = tileData.y + move[2];

    //storing the relationships between the piece that is
    //doing the checking and any piece it hits
    let tileEval = {
        availableSpaces: 0,
        enemyTarget: null,
        enemyThreat: null,
        allyGuarded: null
    };

    //keep moving in the direction of the vector until it goes out of bounds, or it hits a piece (evaluated inside the loop)
    if (tile.inBounds(x, y)) {
        //getting the information of a tile if it has a piece or not
        let foundPiece = chessPiece.findData(x, y);
        //stop the vector if it comes into contact with itself
        if (!(x === evaluatingPiece.x && y === evaluatingPiece.y)) {
            if (foundPiece.piece !== '') {
                tileEval = getPieceRelationship(evaluatingPiece, foundPiece, move, false);
            }
        }
        //if the tile can be moved to in the move after this one, it will increase availableSpaces
        //we will include the the tile the piece is already on because it can always move back to it's original position
        if (evaluatingPiece.piece === 'knight'
            && (foundPiece.color !== evaluatingPiece.color || (x === evaluatingPiece.x && y === evaluatingPiece.y))) {
            tileEval.availableSpaces++;
        }
    }
    return tileEval;
}

function getPieceRelationship(evaluatingPiece, foundPiece, move, isFirstMove) {
    //storing the relationships between the piece that is
    //doing the checking and any piece it hits
    let tileEval = {
        availableSpaces: 0,
        enemyTarget: null,
        enemyThreat: null,
        allyGuarded: null
    };

    //finds the color of the opponent
    enemyColor = (evaluatingPiece.color === 'white') ? 'black' : 'white';

    //reversing the move to evaluate pieces that can attack the evaluating piece at this tile
    let moveReverse = [move[0], -move[1], -move[2]];

    if (foundPiece.color === evaluatingPiece.color) { //if the evaluation runs into a friendly piece
        //if the friendly piece can attack the tile if an enemy moves to it
        if (pieceMovement.canAttack(foundPiece, moveReverse, isFirstMove)) {
            tileEval.allyGuarded = foundPiece;
        }
    } else if (foundPiece.color === enemyColor) { //if the evaluation runs into an enemy piece
        //if the enemy piece can be attacked by the piece at this tile
        if (pieceMovement.canAttack(evaluatingPiece, move, isFirstMove)) {
            tileEval.enemyTarget = foundPiece;
        }
        //if the enemy piece can attack the piece at this tile
        if (pieceMovement.canAttack(foundPiece, moveReverse, isFirstMove)) {
            tileEval.enemyThreat = foundPiece;
        }
    }
    return tileEval;
}

function addPieceRelationship(tileEvaluation, moveResults) {
    tileEvaluation.availableSpaces += moveResults.availableSpaces;
    if (moveResults.allyGuarded !== null) {
        tileEvaluation.allyGuarded.push(moveResults.allyGuarded);
    }
    if (moveResults.enemyTarget !== null) {
        tileEvaluation.enemyTarget.push(moveResults.enemyTarget);
    }
    if (moveResults.enemyThreat !== null) {
        tileEvaluation.enemyThreat.push(moveResults.enemyThreat);
    }
    return tileEvaluation;
}

/**
 * Simulates a battle on a tile, assuming all the pieces that can attack
 * will attack. If the battle score is less than 0, this won't be a good move for the piece
 * @param {object} pieceData The data object {x, y, piece, color} of the piece looking to move to the tile
 * @param {object} tileEval The evaluation of the tile the piece will move to (got using evaluateTile)
 * @returns {object} The score outcome of the battle, as well as the remaining pieces
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
        remainingAllies: tileEval.allyGuarded,
        remainingEnemies: tileEval.enemyThreat
    };
    //if there are enemies that can attack this tile
    if (tileEval.enemyThreat.length > 0) {
        //finding the values of the current piece and the piece with the lowest value that is threatening it
        //stops high value pieces moving to tiles where they can be attacked by low value pieces
        let pieceValue = chessPiece.value[pieceData.piece];
        let lowestEnemyVal = chessPiece.findLowestValue(tileEval.enemyThreat);

        //removing the current pieces value from the score
        //as the first move of the battle will be to eliminate the current piece
        aftermath.battleScore = -pieceValue;

        //if all the enemyThreat values are greater than or equal to the
        //lowest value in enemyThreat, then simulate a battle
        if (pieceValue <= lowestEnemyVal[0]) {
            while (aftermath.remainingEnemies.length > 0 && aftermath.remainingAllies.length > 0) {
                //finding the piece with the lowest value in each of the tiles
                //and keeping their values (stored in the first element) and
                //their positions in the array (stored in the second element)
                lowestEnemy = chessPiece.findLowestValue(aftermath.remainingEnemies);
                let lowestAlly = chessPiece.findLowestValue(aftermath.remainingAllies);

                //the first move of each loop in the battle will be the ally
                //adding the value of the enemy most likely to have attacked (the one with the lowest value) to the score
                battleScore += lowestEnemy[0];
                //then removing that enemy from the array
                aftermath.remainingEnemies.splice(lowestEnemy[1], 1);

                //if there are still enemies that can attack, they will make the next move
                if (aftermath.remainingEnemies.length > 0) {
                    //updating the lowest enemy value as the old one was removed from the array
                    lowestEnemy = chessPiece.findLowestValue(aftermath.remainingEnemies);

                    //removing the ally with the lowest value from the score and array
                    battleScore -= lowestAlly[0];
                    aftermath.remainingAllies.splice(lowestAlly[1], 1);
                }
            }
        }
    }

    return aftermath;
}