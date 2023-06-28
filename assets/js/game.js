document.onload = gameInit();

/**
 * Initialises the game
 */
function gameInit() {
    //Setting up the chess board tiles
    let chessBoard = document.getElementById("chess-board");
    let chessGrid = ``;

    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            chessGrid += `
            <div class="tile tile-white"></div>`;
        }
    }

    chessBoard.innerHTML = chessGrid;
}