// Validator contains all of the methods necessary for making sure a move is valid
class Validator {
    // Board is the board instance, pieces is the playerPieces array, castle is initialized as an object for ease of use.
    constructor(board, pieces, enPassant) {
        this.board = board;
        this.playerPieces = pieces;
        this.enPassant = enPassant;
        this.castle = {};
    }

    // Base move checker. Returns whether the piece can move in the manner attempted but does not check to see if the move leaves the player in check which would invalidate the move.
    // Move is an array with the current position, represented in string format "xy", at index 0 and target position at index 1
    isValidMove(move) {
        let currentNode = this.board.board[move[0]];
        let targetNode = this.board.board[move[1]];
        let piece = currentNode.content;

        // Can't move a piece onto a piece with the same player.
        if (targetNode.content !== null && targetNode.content.player === currentNode.content.player) return false 

        // Knights don't need the direction checked so they are handled first.
        if (piece.pieceType === "knight") return this.knightMove(currentNode, targetNode);

        // Retrieve direction
        let direction = this.moveDirection(move);
        // moveDirection will return false if current node and target node are the same. This is an invalid move.
        // Also will return false if the move is not a straight line.
        if (!direction) return false;

        // King can move in any direction so we test it before finding out if the direction is valid for the piece
        if (piece.pieceType === "king") return this.kingMove(currentNode, targetNode, piece, direction);

        // If the direction isn't one in which the piece is allowed to move, it is invalid.
        if (!piece.moves.includes(direction)) return false;

        // Pawns are the last special case we handle.
        if (piece.pieceType === "pawn") return this.pawnMove(currentNode, targetNode, piece, direction);

        // this leaves the queen bishops and rooks. Their movements are straightforward. We just need to make sure there is nothing in the way.
        return this.pathCheck(currentNode, targetNode, piece, direction);
    }

    // Determines if any of the pieces passed in in playerPieces can take the target node. If no target node is given, the enemy king is used.
    checkForThreat(playerPieces, enemyPieces, targetNode = " ") {
        // If no target node is given, the enemy king is used.
        if (targetNode === " ") targetNode = this.findKing(enemyPieces).boardNode;
        let threat = null

        playerPieces.forEach(piece => {
            // Tests every piece as if they were trying to move to the target node. If they can, they are assigned to the threat variable
            if (this.isValidMove([`${piece.xCoord}${piece.yCoord}`, `${targetNode.xCoord}${targetNode.yCoord}`])) threat = piece;
        }); 

        return threat
    }
    
    // Tests for checkmate by testing the checked player's pieces to see if any of them can intercede or if the king can move out of the way.
    checkmate(enemyPieces, checkPiece) {
        // Get threatened king.
        let targetNode = this.findKing(enemyPieces).boardNode;

        // Look for safe node for king to move into, this is the least intensive check so we start here.
        if (this.kingMoveSafe(targetNode)) return false;

        // If the checking piece is a knight and the king cannot move safely, the only way to avoid checkmate is to take the threatening knight
        if (checkPiece.pieceType === "knight") {
            return !enemyPieces.some((piece) => {
                return this.isValidMove([`${piece.xCoord}${piece.yCoord}`, `${checkPiece.xCoord}${checkPiece.yCoord}`])
            });
        }

        // Get direction of threatening move.
        let direction = this.moveDirection([[checkPiece.xCoord, checkPiece.yCoord], [targetNode.xCoord, targetNode.yCoord]]);
        let currentNode = checkPiece.boardNode;
        let targetSquares = [];
        // Push all nodes starting with the node the threatening piece is on all the way up to the node just before the king.
        while (currentNode !== targetNode) {
            targetSquares.push(currentNode);
            // Next node
            currentNode = this.board.board[currentNode.neighboringSquares[direction]];
        }

        for (let piece of enemyPieces) {
            // test each of the pieces to see if they are able to move to any of the nodes in our list. If any of them can, it is not checkmate
            if (this.moveInSetValid(targetSquares, piece)) return false;
        }

        return true;
    }

    // Finds and returns the king in pieces provided.
    findKing(pieces) {
        let king;
        for (let piece of pieces) {
            if (piece.pieceType === "king") {
                king = piece;
                break;
            }
        }
        return king;
    }

    // Tests if there is a move the king can make that will not leave it in check
    kingMoveSafe(kingNode) {
        let kingMoves = [];
        // Grabs every square around the king
        for (let key in kingNode.neighboringSquares) {
            let nodeCoord = kingNode.neighboringSquares[key]
            kingMoves.push(this.board.board[nodeCoord]);
        };
        // Test if the king can move to any of them safely
        return this.moveInSetValid(kingMoves, kingNode.content);
    }

    // Checks if a piece can move to any of the provided squares.
    moveInSetValid(targetSquares, piece) {
        let valid = false;

        targetSquares.some( square => {
            // Test if it passes basic check
            if (this.isValidMove([`${piece.xCoord}${piece.yCoord}`, `${square.xCoord}${square.yCoord}`])) {
                // If so perform move
                let heldTarget = square.content;
                let startingNode = piece.boardNode;
                this.board.updatePieceLoc(startingNode, square, piece)
                
                // HeldTargetSet is used to correctly pick which set of pieces we removed the target from
                let heldTargetSet;
                if (heldTarget) {
                    heldTargetSet = this.playerPieces[0].includes(heldTarget) ? 0 : 1
                    this.playerPieces[heldTargetSet] = this.playerPieces[heldTargetSet].filter((piece => piece !== heldTarget))
                }

                // Test to see if the move will leave you in check.
                if (this.checkForThreat(this.playerPieces[0], this.playerPieces[1]) === null) {
                    valid = true;
                }

                // Undo the move
                this.board.updatePieceLoc(square, startingNode, piece);
                // Return held target if there is one
                if (heldTarget) {
                    this.playerPieces[heldTargetSet].push(heldTarget)
                }
                square.content = heldTarget;
            }
            return valid
        })
        return valid
    }

    // Determines move direction by concatenating letters
    moveDirection(move) {
        let direction = "";
        // North/South
        if (move[0][1] < move[1][1]){
            direction += "s";
        } else if (move[0][1] > move[1][1]) {
            direction += "n";
        }

        // East/West
        if (move[0][0] < move[1][0]) {
            direction += "e";
        } else if (move[0][0] > move[1][0]) {
            direction += "w";
        }

        // If both squares were the same square we do not have a direction. Return false.
        if (direction === "") return false;

        // Test diagonals to make sure they are in a straight line. Return false if not.
        if (["se", "sw", "ne", "nw"].includes(direction) && 
            Math.abs(move[0][0] - move[1][0]) !== Math.abs(move[0][1] - move[1][1])) 
        {
            return false;
        }

        return direction;
    }

    // Test for king's moves including testing if castling is valid.
    kingMove(currentNode, targetNode, piece, direction) {
        // Reset castle in case of a previously invalid move
        this.castle = {};

        // King can move at max 2 squares, if it tries to move greater than two squares--
        if (Math.abs(currentNode.xCoord - targetNode.xCoord) > 2 || Math.abs(currentNode.yCoord - targetNode.yCoord) > 2) {
            // Return false
            return false;
        // If it tries to move exactly 2--
        } else if (Math.abs(currentNode.xCoord - targetNode.xCoord) === 2 || Math.abs(currentNode.yCoord - targetNode.yCoord) === 2) {
            // Determine the set of pieces the king is in as well as the set the enemy pieces are in.
            let kingPieceSet;
            let enemyPieces;
            if (this.playerPieces[0].includes(piece)) {
                kingPieceSet = this.playerPieces[0];
                enemyPieces = this.playerPieces[1];
            } else {
                kingPieceSet = this.playerPieces[1];
                enemyPieces = this.playerPieces[0];
            }
    
            // Make sure the king still has its first move marker, that the direction the king is moving is east or west and that the move does not leave the king in check.
            if (!piece.moves.includes("first") || !["e", "w"].includes(direction) || this.checkForThreat(enemyPieces, kingPieceSet, piece)){
                return false;
            }
            // Pick the corner node that the rook should reside in.
            let cornerNode = this.board.board[direction === "w" ? `0${piece.yCoord}` : `7${piece.yCoord}`]
    
            // Return false if the corner is empty or is not a rook or --
            if (cornerNode.content == null || cornerNode.content.pieceType !== "rook") {
                return false;
            }
            // -- if the rook has moved.
            if (!cornerNode.content.moves.includes("first")) return false;
    
            // Make sure there is nothing in the way of the movement.
            if (!this.pathCheck(currentNode, cornerNode, piece, direction)) return false;
            // Save the rook that will move and note that a castling has been used.
            this.castle.rook = cornerNode.content;
            this.castle.used = true;
    
            return true;
        }
        
        // Otherwise the move is valid so return true
        return true;
    }

    // Knight move is just checking if the target node is one of the 8 possible nodes the knight can move to.
    knightMove(currentNode, targetNode) {
        let possibleMoves = [
            `${currentNode.xCoord + 2}${currentNode.yCoord + 1}`,
            `${currentNode.xCoord + 2}${currentNode.yCoord - 1}`,
            `${currentNode.xCoord + 1}${currentNode.yCoord + 2}`,
            `${currentNode.xCoord - 1}${currentNode.yCoord + 2}`,
            `${currentNode.xCoord - 2}${currentNode.yCoord + 1}`,
            `${currentNode.xCoord - 2}${currentNode.yCoord - 1}`,
            `${currentNode.xCoord - 1}${currentNode.yCoord - 2}`,
            `${currentNode.xCoord + 1}${currentNode.yCoord - 2}`]
        if (possibleMoves.includes(`${targetNode.xCoord}${targetNode.yCoord}`)){
            return true;
        }

        return false;
    }

    // Validates that the pawn is moving correctly, includes checks for enPassants.
    pawnMove(currentNode, targetNode, piece, direction) {
        // Pawn can move a maximum of 2 squares, if the pawn is moving more than that return false.
        if (Math.abs(currentNode.yCoord - targetNode.yCoord) > 2) {
            return false;
        }

        // Determine if the move is north or south
        let northOrSouth = ["n", "s"].includes(direction)
        // Then if the move is a double move--
        if (Math.abs(currentNode.yCoord - targetNode.yCoord) === 2) {
            // -- but not north or south, or the target node has a piece, return false,
            if (!northOrSouth || targetNode.content !== null) {
                return false;
            }
            // If the piece has already moved once return false.
            if (!piece.moves.includes("first")) return false;
            // Finally test to make sure there is nothing in the space in the middle of the move.
            return this.pathCheck(currentNode, targetNode, piece, direction);
        }
        // If it is a single move, north or south, and the target node is empty the move is valid.
        if (northOrSouth && targetNode.content === null) return true;

        // For diagonal moves
        if (["nw", "ne", "sw", "se"].includes(direction)){
            // If the target node has a piece, the move is valid
            if (targetNode.content !== null) return true;
            
            // Otherwise, the player is attempting an en passant. So we check to make sure the pawn that is moving is in our list of capable pawns, and that the target is the pawn that double moved last turn.
            if (this.enPassant["pawns"].includes(piece) && targetNode.xCoord === this.enPassant["target"].xCoord) {
                // Set used to true to show we are making an en passant.
                this.enPassant["used"] = true;
                // Set removedPiece so that we can serialize it for the database.
                this.enPassant["removedPiece"] = [this.enPassant["target"].xCoord, this.enPassant["target"].yCoord];
                return true;
            }
        }

        // Otherwise the move is invalid.
        return false;
    }

    // Tests if the path to target node is clear.
    pathCheck(currentNode, targetNode, piece, direction) {
        
        while (currentNode !== targetNode) {
            // If we somehow make it off the board or if there is a piece in the way --
            if (currentNode === undefined || (currentNode.content !== piece && currentNode.content !== null)) {
                // Return false
                return false;
            }
            // Next node
            currentNode = this.board.board[currentNode.neighboringSquares[direction]];
        }

        // If we make it to the target node the path is clear.
        return true;
    }

    // Sets up info for en passants next turn.
    setEnPassant(pawnNode) {
        // Target is the pawn that moved.
        this.enPassant.target = pawnNode.content;
        // Neighbors are the east and west nodes from the target pawn
        let neighbors = [this.board.board[pawnNode.neighboringSquares["e"]], this.board.board[pawnNode.neighboringSquares["w"]]];
        // Remove any squares that do not contain pawns. Order of conditionals is to prevent accessing a property that doesn't exist.
        neighbors = neighbors.filter(neighbor => (neighbor && neighbor.content && neighbor.content.pieceType === "pawn"));
        // Change neighbors from the squares to the pieces in the squares
        neighbors = neighbors.map(neighbor => neighbor.content)
        // Assign the neighbors to the pawns property.
        this.enPassant.pawns = neighbors;
    }
}

export default Validator;