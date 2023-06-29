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
            <div id="tile-${j}-${i}" class="tile ${tileClass}" onclick="tileClick(${j}, ${i});"></div>`;

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
            let piece = '';
            let color = '';

            //creating the back row of chess pieces for each side
            if (j === 0 || j === boardSize - 1) {
                //setting the piece type
                if (i === 0 || i === boardSize - 1) {
                    piece = 'rook';
                } else if (i === 1 || i === boardSize - 2) {
                    piece = 'knight';
                } else if (i === 2 || i === boardSize - 3) {
                    piece = 'bishop';
                } else if (i === 3) {
                    piece = 'queen';
                } else {
                    piece = 'king';
                }

                //setting the color
                if (j === 0) {
                    color = 'black';
                } else {
                    color = 'white';
                }
                setTile(i, j, piece, color);
            }
            //setting up the pawns for both sides
            else if (j === 1 || j === boardSize - 2) {
                piece = 'pawn';
                if (j === 1) {
                    color = 'black';
                } else {
                    color = 'white';
                }
                setTile(i, j, piece, color);
            }
            //Clearing any tiles set from the previous game
            else {
                clearTile(i, j);
            }
        }
    }
}

/**
 * Sets a chess piece at a given tile
 * @param {*The x position of the tile (from 0 to boardSize - 1)*} x 
 * @param {*The y position of the tile (from 0 to boardSize - 1)*} y 
 * @param {*The type of piece you wish to set the tile to*} piece 
 * @param {*The color of the piece you wish to set the tile to*} color 
 */
function setTile(x, y, piece, color) {
    let currentTile = document.getElementById(`tile-${x}-${y}`);
    let tileClass = currentTile.className;
    tileClass = tileClass.slice(0, 15); //removes any classes added in the previous game (ends up with "tile tile-white" or "tile tile-black")

    tileClass += ` ${piece} ${color}`;
    currentTile.className = tileClass;
    currentTile.style.backgroundImage = `url(assets/images/chess-pieces/${color}-${piece}.png)`;
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

/**
 * Is called when a player clicks on a tile containing a click event listener, ie. if
 * the tile has a player piece or if a selected piece can move to that tile
 */
function tileClick(x, y) {
    //first, clear all selected tiles
    deselectTiles();

    //getting the tile that was clicked on
    let selectedTile = document.getElementById(`tile-${x}-${y}`);

    //creates another div as a child of the selected tile
    let selectDiv = document.createElement('div');
    selectDiv.id = 'tile-selected';
    selectedTile.appendChild(selectDiv);
}

/**
 * Removes the selected div from the tile that is selected
 */
function deselectTiles() {
    let selectExisting = document.getElementById('tile-selected');
    if (selectExisting) {
        selectExisting.remove();
    }
}