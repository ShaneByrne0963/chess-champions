function makeMove() {
    console.clear();
    //all tiles will be given an individual score based on a number of parameters. the tile with the highest score will be chosen
    let highestScore = 0;
    //highestScore will be set to the first checked tile. after that any tile will have to beat the score to be set
    let isFirstCheck = true;
    //in case there are multiple pieces with the highest score, their info will all be stored in this array and chosen at random
    let highestScorePieces = [];

    //getting all the pieces on the board that belong to the ai
    let pieces = document.getElementsByClassName('black');

    //before checking all the moves, the scores of all the pieces in their current positions will be calculated and stored
    let currentScores = [];
    for (let currentPiece of pieces) {
        let pieceData = tile.getData(currentPiece);
        currentScores.push(tile.getScore(pieceData, pieceData));
    }

    for (let i = 0; i < pieces.length; i++) {
        let currentPiece = pieces[i];
        //if the piece has not yet been added to the high score array
        let added = false;
        let currentInfo = tile.getData(currentPiece);
        //stores any moves that have the same score as the highest score
        currentInfo.highestMoves = [];
        //gets all of the tiles the current piece can move to
        let tileMoves = chessPiece.getAllMoveTiles(currentInfo);

        //looping through the moves
        for (let move of tileMoves) {
            //calculates the score of the tile based on several parameters
            let moveScore = tile.getScore(currentInfo, move);

            //add 15 points for pawns to encourage movement
            if (currentInfo.piece === 'pawn' || currentInfo.piece === 'pawnNew') {
                moveScore += 15;
            }

            //if there is an enemy on the tile the piece can destroy, then the value of that piece will be added to the score
            //the color of the piece doesn't have to be checked 
            if (move.piece !== '') {
                moveScore += chessPiece[move.piece].value;
            }

            //finally, subtracting the current score from the new score
            moveScore -= currentScores[i];

            //if this is the first move of the first tile, then set the highest score to the score of this move
            if (isFirstCheck) {
                highestScore = moveScore;
                highestScorePieces.push(currentInfo);
                currentInfo.highestMoves.push(move);
                isFirstCheck = false;
                continue;
            } else {
                if (moveScore >= highestScore) {
                    //if this is the first move with the same or higher score, it will be added to the pieces list
                    if (!added) {
                        added = true;
                        highestScorePieces.push(currentInfo);
                    }
                    //if this score is higher than the highest score, then remove everything
                    //from the high score lists and start over with the new high score
                    if (moveScore > highestScore) {
                        highestScorePieces = [currentInfo];
                        currentInfo.highestMoves = [];
                    }
                    highestScore = moveScore;
                    currentInfo.highestMoves.push(move);
                }
            }

            console.log(`${currentInfo.piece} [${currentInfo.x}, ${currentInfo.y}] => [${move.x}, ${move.y}] final score: ${moveScore}`);
        }
    }

    //picking a piece at random out of the array that has a move that matches the high score
    let movePiece = highestScorePieces[Math.floor(Math.random() * highestScorePieces.length)];
    //then, that piece will pick one of it's best moves at random
    let finalTile = movePiece.highestMoves[Math.floor(Math.random() * movePiece.highestMoves.length)];

    console.log(`Final Move: ${movePiece.piece} [${movePiece.x}, ${movePiece.y}] => [${finalTile.x}, ${finalTile.y}] Score: ${highestScore}`);

    tile.move(movePiece, finalTile);
    nextTurn();
}