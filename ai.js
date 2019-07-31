function moveAI() {
    let move = minimax(cloneBoard(board), 4, 2);
    doMove(board, move.m, move.optId);
}


function checkTerminal(gBoard, playerId) {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            // if there is a play, then this is not a terminal node
            if (gBoard[row][col].id == playerId && gBoard[row][col].options.length > 0)
                return false;
        }
    }
    return true;
}


function boardHeuristic(gBoard, playerId) {
    let score = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            // gain points for each piece the player owns
            if (gBoard[row][col].id == playerId) {
                score += 5;
                // kings are triple pts
                if (gBoard[row][col].king)
                    score += 15;
            } else if (gBoard[row][col].id != playerId && gBoard[row][col].id != 0) {
                // for aggressive playing, opponent pieces are worth more than your own
                score -= 20;
                if (gBoard[row][col].king)
                    score -= 40;
            }
        }
    }
    return score;
}


function doMove(gBoard, toMove, optId) {
    let row = toMove.r;
    let col = toMove.c;
    let endMove = toMove.options[optId].move;
    let purge = toMove.options[optId].purge;
    gBoard[endMove.r][endMove.c] = new Piece(endMove.c, endMove.r, toMove.color, toMove.id);
    gBoard[endMove.r][endMove.c].king = toMove.king;
    gBoard[toMove.r][toMove.c] = new Piece(toMove.c, toMove.r, color(0, 0, 0), 0);
    if (purge) {
        gBoard[purge.r][purge.c] = new Piece(purge.c, purge.r, color(0, 0, 0), 0);
    }
}


function minimax(gBoard, depth, maximizingPlayer) {
    let gBoardCpy = cloneBoard(gBoard);
    if (depth == 0 || checkTerminal(gBoardCpy, maximizingPlayer)) {
        // depth 0 is no moves made, it's the initial state of the board
        return {score : boardHeuristic(gBoardCpy, maximizingPlayer), m : null, optId : 0};
    }

    // collect all moves for maximizingPlayer's pieces
    let movePieces = [];
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (gBoardCpy[row][col].options.length > 0 && gBoardCpy[row][col].id == maximizingPlayer) {
                // each option for a piece is a move to check
                for (let i = 0; i < gBoardCpy[row][col].options.length; i++) {
                    movePieces.push({piece : gBoardCpy[row][col], optId : i});
                }
            }
        }
    }

    // if the player is red, maximize
    if (maximizingPlayer == 2) {
        let sValue = {score : -100000, m : null, optId : 0};
        for (let i = 0; i < movePieces.length; i++) {
            // for each move, try it on the board and evaluate the score
            doMove(gBoardCpy, movePieces[i].piece, movePieces[i].optId);
            let newValue = minimax(gBoardCpy, depth - 1, 1);
            if (sValue.score < newValue.score) {
                // keep a record of the best scoring move
                sValue = newValue;
                sValue.m = movePieces[i].piece;
                sValue.optId = movePieces[i].optId;
            }
            gBoardCpy = cloneBoard(gBoard);
        }
        return sValue;
    } else {
        // minimize for blue player
        let sValue = {score : 100000, m : null, optId : 0};
        for (let i = 0; i < movePieces.length; i++) {
            doMove(gBoardCpy, movePieces[i].piece, movePieces[i].optId);
            let newValue = minimax(gBoardCpy, depth - 1, 2);
            if (sValue.score > newValue.score) {
                sValue = newValue;
                sValue.m = movePieces[i].piece;
                sValue.optId = movePieces[i].optId;
            }
            gBoardCpy = cloneBoard(gBoard);
        }
        return sValue;
    }
}


function cloneBoard(gBoard) {
    // create a new 2D array
    let newBoard = [];
    for (let row = 0; row < 8; row++) {
        newBoard.push([]);
    }

    // create new pieces in each position of the board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            newBoard[row][col] = new Piece(col, row, gBoard[row][col].color, gBoard[row][col].id);
            newBoard[row][col].king = gBoard[row][col].king;
        }
    }

    // update neighbours of new board
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            gBoard[row][col].findNeighbours();
        }
    }

    // update possible moves for each neighbour
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            gBoard[row][col].possibleMoves();
        }
    }
    return newBoard;
}
