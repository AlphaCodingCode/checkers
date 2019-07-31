// Any global variables can be defined up here
let board = [
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 2, 0, 2, 0, 2, 0, 2],

];
let player1Turn = true;
let selectedSquare = null;

/*
    Code in the setup function will only be run once at the start of the animation
*/
function setup() {
    createCanvas(window.innerWidth, window.innerHeight);
    // init pieces
    for (let rows = 0; rows < 8; rows++) {
        for (let cols = 0; cols < 8; cols++) {
            if (board[rows][cols] == 1)
                board[rows][cols] = new Piece(cols, rows, color(100, 200, 100), 1);
            else if (board[rows][cols] == 2)
                board[rows][cols] = new Piece(cols, rows, color(200, 100, 100), 2);
            else
                board[rows][cols] = new Piece(cols, rows, color(0, 0, 0), 0);
        }
    }

    // init neighbours
    boardFindNeighbours();
}

/*
    The draw function is executed once per frame.
*/
function draw() {
    // Update
    for (let rows = 0; rows < 8; rows++) {
        for (let cols = 0; cols < 8; cols++) {
            board[rows][cols].update();
        }
    }
    // Render
    drawBoard();

    // highlighting square
    if (!player1Turn) {
        moveAI();
        player1Turn = true;
        selectedSquare = null;
    }
    if (selectedSquare != null) {
        let size = width > height ? round(height / 8) : round(width / 8);
        noFill();
        strokeWeight(3);
        stroke(255, 0, 0);
        selectedSquare.findNeighbours();
        for (let i = 0; i < selectedSquare.options.length; i++) {
            rect(selectedSquare.options[i].move.c * size, selectedSquare.options[i].move.r * size, size, size);
        }
        strokeWeight(1);
        stroke(0);
    }
}

function mouseClicked() {
    let size = width > height ? round(height / 8) : round(width / 8);
    let row = Math.floor(mouseY / size);
    let col = Math.floor(mouseX / size);
    boardFindNeighbours();

    if (selectedSquare == null) {
        // pick a valid square
        if (board[row][col].id != 0) {
            selectedSquare = board[row][col];
            selectedSquare.possibleMoves();
            if (selectedSquare.options.length == 0) {
                selectedSquare = null;
            }
        } else {
            // invalid selection.
            selectedSquare = null;
            return;
        }
    } else {
        // pick a square to move selected piece to
        for (let i = 0; i < selectedSquare.options.length; i++) {
            if (selectedSquare.options[i].move == board[row][col]) {
                // check if the projected square is valid
                board[row][col] = new Piece(col, row, selectedSquare.color, selectedSquare.id);
                board[row][col].king = selectedSquare.king;
                board[selectedSquare.r][selectedSquare.c] = new Piece(selectedSquare.c, selectedSquare.r, color(0, 0, 0), 0);
                if (selectedSquare.options[i].purge) {
                    let r = selectedSquare.options[i].purge.r;
                    let c = selectedSquare.options[i].purge.c;
                    board[r][c] = new Piece(c, r, color(0, 0, 0), 0);
                    // piece just jumped
                    boardFindNeighbours();
                    selectedSquare = board[row][col];
                    selectedSquare.possibleMoves();
                    // check if the piece can make a jump
                    let doubleJump = false;
                    for (let i = selectedSquare.options.length - 1; i >= 0; i--) {
                        if (selectedSquare.options[i].purge == null) {
                            selectedSquare.options.splice(i, 1);
                        } else {
                            doubleJump = true;
                        }
                    }
                    if (doubleJump)
                        break;
                }
                selectedSquare = null;
                player1Turn = !player1Turn;
                break;
            }
        }

    }
}


function drawBoard() {
    background(255, 255, 255);
    let white = color(255, 255,255);
    let black = color(0, 0, 0);
    let size = width > height ? round(height / 8) : round(width / 8);
    for (let row = 0; row < 8; row++) {
        for (let cols = 0; cols < 8; cols++) {
            if (row % 2) {
                 fill(cols % 2 ? black : white);
            } else {
                 fill((cols + 1) % 2 ? black : white);
            }
            rect(cols * size, row * size, size, size);
            board[row][cols].render();
        }
    }
}
