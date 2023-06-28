const boardSize = 8;

document.onload = gameInit();

/**
 * Creates the chess tiles and then starts the game
 */
function gameInit() {
    //Setting up the chess board tiles
    let chessBoard = document.getElementById("chess-board");
    let chessGrid = ``;
    let isWhite = true;

    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
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
        //reverses the tile order again after each row
        isWhite = !isWhite;
    }

    chessBoard.innerHTML = chessGrid;
    startGame();
}

/**
 * Places the chess pieces in their starting positions on the board
 */
function startGame() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
        }
    }
}

/**
 * Sets a chess piece at a given tile
 * @param {The x position of the tile (from 0 to boardSize - 1)} x 
 * @param {The y position of the tile (from 0 to boardSize - 1)} y 
 * @param {The type of piece you wish to set the tile to} piece 
 * @param {The color of the piece you wish to set the tile to} color 
 */
function setTile(x, y, piece, color) {
    let currentTile = document.getElementById(`tile-${y}-${x}`);
    let tileClass = currentTile.className;
    tileClass = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")

    tileClass += ` ${piece} ${color}`;
    currentTile.className = tileClass;
}

/**
 * Clears a given tile of any pieces
 * @param {The x position of the tile (from 0 to boardSize - 1)} x 
 * @param {The y position of the tile (from 0 to boardSize - 1)} y 
 */
function clearTile(x, y) {
    let currentTile = document.getElementById(`tile-${y}-${x}`);
    let tileClass = currentTile.className;
    tileClass = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")
}