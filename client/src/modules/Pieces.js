// Pieces hold information about their coordinates on the board, what board square they are in, the kind of piece they are, who they belong to, and the kind of moves they can make.
class Piece {
    constructor(coord, pieceType, player, board, image) {
        this.xCoord = coord[0];
        this.yCoord = coord[1];
        this.player = player;
        this.pieceType = pieceType;
        this.image = image;
        this.boardNode = board[`${this.xCoord}${this.yCoord}`];
        this.boardNode.content = this;
        this.moves = this.moves(this.pieceType);
    }

    // Determines move types base on piece type.
    moves(pieceType) {
        let moves = []
        switch (pieceType) {
            case "pawn":
                // North or south movements depending on player. First marker for double moves.
                if (this.player === "black") {
                    moves = ["n", "ne", "nw", "first"];
                } else {
                    moves = ["s", "se", "sw", "first"];
                }
                break;
            case "bishop":
                moves = ["ne", "nw", "se", "sw"];
                break;
            case "rook":
                // First marker for castling
                moves = ["w", "e", "n", "s", "first"];
                break;
            case "queen":
                moves = ["ne", "nw", "se", "sw", "w", "e", "n", "s"];
                break;
            case "knight":
                // Knights need their own movement check.
                moves = ["knight"]
                break;
            case "king":
                // First marker for castling
                // Kings can move in any direction and are tested before direction is used.
                moves = ["first"]
                break;
            default:
                console.error("something wrong in moves generator", pieceType)
        }
        return moves
    }
}

export default Piece;