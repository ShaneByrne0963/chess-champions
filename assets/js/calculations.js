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
        let currentInfo = getTileInfo(piece);
        //stores any moves that have the same score as the highest score
        currentInfo.highestMoves = [];
        let tileMoves = chessPieces.getAllMoveTiles(currentInfo.x, currentInfo.y, currentInfo.piece, currentInfo.color);

        for (let move of tileMoves) {
            let moveInfo = getTileInfo(move);
            let moveScore = 0;

            if (moveInfo.piece !== '') {
                moveScore = chessPieces[moveInfo.piece].value;
            }

            if (isFirstCheck) {
                highestScore = moveScore;
                highestScorePieces.push(currentInfo);
                currentInfo.highestMoves.push(moveInfo);
                isFirstCheck = false;
                continue;
            } else {
                if (moveScore >= highestScore) {
                    if (!added) {
                        added = true;
                        highestScorePieces.push(currentInfo);
                    }
                    if (moveScore > highestScore) {
                        highestScorePieces = [currentInfo];
                        currentInfo.highestMoves = [];
                    }
                    highestScore = moveScore;
                    currentInfo.highestMoves.push(moveInfo);
                }
            }
        }

        if (tileMoves.length > 0) {
            currentInfo.possibleMoves = tileMoves;
            moveablePieces.push(currentInfo);
        }

        pieceInfo.push(currentInfo);
    }

    //temporary logic for the ai making a move. it will pick a move at random
    //picking a piece at random out of the array that contains all the pieces that can move
    let movePiece = highestScorePieces[Math.floor(Math.random() * highestScorePieces.length)];
    //then, that piece will pick one of it's moves at random
    let tile = movePiece.highestMoves[Math.floor(Math.random() * movePiece.highestMoves.length)];

    moveTile(getTile(movePiece.x, movePiece.y), getTile(tile.x, tile.y));
    nextTurn();
}