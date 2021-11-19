import Piece from "./Pieces";

// Serializer for encoding and decoding board state for entry/retrieval from backend.
export default class Serializer {
    // Serialize board state
    saveGame = (whitePieces, blackPieces, enPassant, player) => {
        let wPieces = this.pieceSerialize(whitePieces);
        let bPieces = this.pieceSerialize(blackPieces);

        let passant = this.savePassant(enPassant)

        let boardState = [player, wPieces, bPieces, passant]
        return boardState
    }

    // Loads the pieces from boardstate returned from database
    loadGame = (boardState, board) => {
        const {wPieces, bPieces} = boardState;

        // Recreate all pieces from info from DB
        wPieces.forEach(piece => {
            // Each piece looks like this [xCoord, yCoord, pieceType, image, "first"]
            board.whitePieces.push(new Piece([piece[0],piece[1]], piece[2], "white", board.board, piece[3]));
            if (piece[4] !== "first") {
                board.board[`${piece[0]}${piece[1]}`].content.moves.filter(move => move !== "first");
            }
        })
        // Same as above
        bPieces.forEach(piece => {
            board.blackPieces.push(new Piece([piece[0],piece[1]], piece[2], "black", board.board, piece[3]));
            if (piece[4] !== "first") {
                board.board[`${piece[0]}${piece[1]}`].content.moves.filter(move => move !== "first");
            }
        })
    }

    // Converts pieces into array of identifying data
    pieceSerialize = (pieces) => {
        let pieceSet = [];
        // Each piece has it's coordinates, type, image, and whether it still has the "first" marker in its moves saved into an array
        pieces.forEach(piece => {
            let serializedInfo = [piece.xCoord, piece.yCoord, piece.pieceType, piece.image];
            if (piece.moves.includes("first")) serializedInfo.push("first");
            pieceSet.push(serializedInfo);
        });

        return pieceSet;
    }

    // Recreates enPassant status from db data
    loadPassant = (passant, board) => {
        let result = {pawns: []}

        for (let [key, value] of Object.entries(passant)) {
            // Multiple pawns possible
            if (key === "pawns" && value) {
                value.forEach(piece => {
                    // Each pawn is found and pushed into the passant result
                    result.pawns.push(board.board[`${piece[0]}${piece[1]}`].content)
                })
            } else if (key === "target" && value){
                // Target pawn is located and assigned
                result[key] = board.board[`${value[0]}${value[1]}`].content
            }
        }
        return result
    }

    // Serializes enPassant status so it can be put into the database
    savePassant = (passant) => {
        let result = {pawns: []}
        for (let [key, value] of Object.entries(passant)) {

            if (key === "pawns" && value) {
                value.forEach(piece => {
                    result[key].push([piece.xCoord, piece.yCoord]);
                })
            } else if (key === "target" && value) {
                result[key] = [value.xCoord, value.yCoord];
            } else {
                result[key] = value;
            }
        }
        return result;
    }

    savePromotion = (piece, type, previousNode) => {
        let innerImage = ""
        console.log(previousNode,"blah")

        if (type === "knight") {
            innerImage += "n"
        } else {
            innerImage += type[0];
        }
        innerImage += piece.player[0]

        let image = `Chess_${innerImage}.svg`
        let serializedInfo = [previousNode.xCoord, previousNode.yCoord, type, image, piece.player]

        return serializedInfo
    }
}
