import BoardSquare from "./BoardSquare";
import Piece from "./Pieces";

// Board holds the game creation methods and gathers all information under one umbrella object
export default class Board {
    constructor() {
        // Object of board nodes from BoardSquare Class
        this.board = {};
        this.whitePieces = [];
        this.blackPieces = [];
        this.rowSize = 8;
        this.colSize = 8;
        this.newBoard();
        this.initialPieces();
    }

    // Moves piece to target node and clears content of current node
    updatePieceLoc(currentNode, targetNode, piece){
        piece.xCoord = targetNode.xCoord;
        piece.yCoord = targetNode.yCoord;
        piece.boardNode = targetNode;
        targetNode.content = piece;
        currentNode.content = null;
    }

    // Empties board
    blankBoard(){
        for (const [_, square] of Object.entries(this.board)) {
            square.content = null;
        }
        this.whitePieces = [];
        this.blackPieces = [];
    }

    // Promotion of pawn
    promotion(node, pawn, pieces, player, type) {
        let image = "";
        // Special case for knight because of conflicting first letter
        if (type === "knight") {
            image += "n";
        } else {
            // First letter of type is used for first part of image url
            image += type[0];
        }
        // First letter of player is used for second part of image url
        image += player[0]
        image = `Chess_${image}.svg`

        // Add new piece, remove old pawn
        pieces[0].push(new Piece([node.xCoord, node.yCoord], type, player, this.board, image));
        pieces[0] = pieces[0].filter(piece => piece !== pawn);
    }

    // Creates all of the BoardSquare instances for a new board.
    newBoard() {
        for (let row = 0; row < this.rowSize; row++ ){
            for (let col = 0; col < this.colSize; col++){
                let color = ((row + col) % 2) ? "w" : "b";
                this.board[`${col}${row}`] = new BoardSquare([col,row], color);
            }
        }
    }

    // Runs piece initializers
    initialPieces() {
        this.pawns();
        this.knights();
        this.bishops();
        this.rooks();
        this.kingsQueens();
    }

    pawns() {
        let numPawns = 8;
        for (let i = 0; i < numPawns; i++) {
            this.blackPieces.push(new Piece([i,6], "pawn", "black", this.board, "Chess_pb.svg"))
            this.whitePieces.push(new Piece([i,1], "pawn", "white", this.board, "Chess_pw.svg"))
        }
    }

    knights() {
        this.blackPieces.push(new Piece([1,7], "knight", "black", this.board, "Chess_nb.svg"), new Piece([6,7], "knight", "black", this.board, "Chess_nb.svg"))
        this.whitePieces.push(new Piece([1,0], "knight", "white", this.board, "Chess_nw.svg"), new Piece([6,0], "knight", "white", this.board, "Chess_nw.svg"))
    }

    bishops() {
        this.blackPieces.push(new Piece([2,7], "bishop", "black", this.board, "Chess_bb.svg"), new Piece([5,7], "bishop", "black", this.board, "Chess_bb.svg"))
        this.whitePieces.push(new Piece([2,0], "bishop", "white", this.board, "Chess_bw.svg"), new Piece([5,0], "bishop", "white", this.board, "Chess_bw.svg"))
    }

    rooks() {
        this.blackPieces.push(new Piece([0,7], "rook", "black", this.board, "Chess_rb.svg"), new Piece([7,7], "rook", "black", this.board, "Chess_rb.svg"))
        this.whitePieces.push(new Piece([0,0], "rook", "white", this.board, "Chess_rw.svg"), new Piece([7,0], "rook", "white", this.board, "Chess_rw.svg"))
    }

    kingsQueens() {
        this.blackPieces.push(new Piece([4,7], "king", "black", this.board, "Chess_kb.svg"), new Piece([3,7], "queen", "black", this.board, "Chess_qb.svg"))
        this.whitePieces.push(new Piece([4,0], "king", "white", this.board, "Chess_kw.svg"), new Piece([3,0], "queen", "white", this.board, "Chess_qw.svg"))
    }
}
