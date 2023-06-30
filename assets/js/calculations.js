function makeMove() {
    //all tiles will be given an individual score based on a number of parameters. the tile with the highest score will be chosen
    let highestScore = 0;
    //highestScore will be set to the first checked tile. after that any tile will have to beat the score to be set
    let isFirstCheck = true;
    //in case there are multiple pieces with the highest score, their info will all be stored in this array and chosen at random
    let highestScorePieces = [];

    let pieces = document.getElementsByClassName('black');
    let pieceInfo = [];
    //this array will store all the pieces in the array that can move
    let moveablePieces = [];

    for (let piece of pieces) {
        //if the piece has not yet been added to the high score array
        let added = false;
        let currentInfo = tile.getData(piece);
        //stores any moves that have the same score as the highest score
        currentInfo.highestMoves = [];
        //gets all of the tiles the current piece can move to
        let tileMoves = chessPieces.getAllMoveTiles(currentInfo.x, currentInfo.y, currentInfo.piece, currentInfo.color);

        //looping through the moves
        for (let move of tileMoves) {
            //each move will have a score
            let moveScore = 0;

            //score evaluation begins here

            //if there is an enemy on the tile the piece can destroy, then the value of that piece will be added to the score
            if (move.piece !== '') {
                moveScore = chessPieces[move.piece].value;
            }

            //score evaluation ends here

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
        }
    }

    //picking a piece at random out of the array that has a move that matches the high score
    let movePiece = highestScorePieces[Math.floor(Math.random() * highestScorePieces.length)];
    //then, that piece will pick one of it's best moves at random
    let finalTile = movePiece.highestMoves[Math.floor(Math.random() * movePiece.highestMoves.length)];

    tile.move(movePiece, finalTile);
    nextTurn();
}