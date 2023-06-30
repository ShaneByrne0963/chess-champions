function makeMove() {
    let pieces = document.getElementsByClassName('black');
    let pieceInfo = [];
    //this array will store all the pieces in the array that can move
    let moveablePieces = [];
    
    for (let piece of pieces) {
        let currentInfo = getTileInfo(piece);
        let tileMoves = chessPieces.getAllMoveTiles(currentInfo.x, currentInfo.y, currentInfo.piece, currentInfo.color);
        
        if (tileMoves.length > 0) {
            currentInfo.possibleMoves = tileMoves;
            moveablePieces.push(currentInfo);
        }

        pieceInfo.push(currentInfo);
    }

    //temporary logic for the ai making a move. it will pick a move at random
    //picking a piece at random out of the array that contains all the pieces that can move
    let movePiece = moveablePieces[Math.floor(Math.random() * moveablePieces.length)];
    //then, that piece will pick one of it's moves at random
    let tile = movePiece.possibleMoves[Math.floor(Math.random() * movePiece.possibleMoves.length)];

    moveTile(getTile(movePiece.x, movePiece.y), tile);
    nextTurn();
}