

function makeMove() {
    let highestScore = 0;
    let pieces = document.getElementsByClassName('black');
    let pieceInfo = [];
    
    for (let piece of pieces) {
        pieceInfo.push(getTileInfo(piece));
    }

    console.log(pieceInfo);
}