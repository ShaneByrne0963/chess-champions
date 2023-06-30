

function makeMove() {
    let highestScore = 0;
    let pieces = document.getElementsByClassName('black');
    let pieceInfo = [];
    
    for (let piece of pieces) {
        let currentInfo = getTileInfo(piece);
        let tileMoves = chessPieces.getAllMoveTiles(currentInfo.x, currentInfo.y, currentInfo.piece, currentInfo.color);
        console.log(tileMoves);
        currentInfo.possibleMoves = tileMoves;
        pieceInfo.push(getTileInfo(piece));
    }

    console.log(pieceInfo);
}

makeMove();