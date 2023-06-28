document.onload = gameInit();

/**
 * Initialises the game
 */
function gameInit() {
    //Setting up the chess board tiles
    let chessBoard = document.getElementById("chess-board");
    let chessGrid = ``;
    let isWhite = true;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            let tileClass;
            if (isWhite) {
                tileClass = 'tile-white';
            }
            else {
                tileClass = 'tile-black';
            }
            chessGrid += `
            <div id="tile-${j}-${i}" class="tile ${tileClass}"></div>`;

            //reverses the tile order
            isWhite = !isWhite;
        }
        //reverses the tile order after each row also
        isWhite = !isWhite;
    }

    chessBoard.innerHTML = chessGrid;
}