import React, {useState} from 'react';
import { useHistory } from 'react-router';
import ChessBoard from './ChessBoard';
import axios from 'axios';
// Coord conversion for previous move list.
const COORD_CONVERSION = ["A", "B", "C", "D", "E", "F", "G", "H"];

const Game = (props) => {
    // Stuff from loaded game
    const {board, validator, player, setPlayer, playerPieces, setPlayerPieces, previousMoves, setPreviousMoves, pushMoveToDB} = props;
    const history = useHistory();
    // Holds selected node, false when nothing selected
    const [nodeSelected, setNodeSelected] = useState(false);
    // Promotion Boolean for showing promotion popup.
    const [promotion, setPromotion] = useState(false);
    const [warning, setWarning] = useState(false);
    // Game over for checkmate popup
    const [gameOver, setGameOver] = useState(false);
    // Necessary to send the last move to the database.
    let lastMove;

    const handleClick = (e) => {
        // Empty warning in case the move is valid
        setWarning(false)
        let targetCoords = e.target.attributes.coord.value;
        let targetNode = board.board[targetCoords];
        // Don't allow moves while promotion or gameover popup is active
        if (promotion || gameOver) return;

        // If there isn't a node selected, ignore any clicks onto empty squares or squares with the opponents pieces.
        if ((!nodeSelected && (targetNode.content === null || targetNode.content.player !== player))) {
            return;
        }

        // If there is something in the target node AND their either isnt something already selected or the target piece is one of the current player's pieces. The !nodeSelected is in place to prevent accessing a property that doesn't exist (piece.player)
        let piece = nodeSelected.content;
        if (targetNode.content && (!nodeSelected || targetNode.content.player === piece.player)) {
            setNodeSelected(targetNode);
            return;
        }

        validateMove(targetCoords, targetNode, piece);
    }

    const validateMove = (targetCoords, targetNode, piece) => {
        // Reset en passant properties
        validator.enPassant.used = false;
        validator.enPassant.removedPiece = false;

        let currentCoords = `${nodeSelected.xCoord}${nodeSelected.yCoord}`;
        if (!validator.isValidMove([currentCoords, targetCoords])) {
            setWarning("That move is invalid, try another");
            setNodeSelected(false);
            return;
        }

        let heldTarget = targetNode.content;
        board.updatePieceLoc(nodeSelected, targetNode, piece);

        if (heldTarget) {
            playerPieces[1] = playerPieces[1].filter((piece => piece !== heldTarget));
        }

        let castleSafe;
        if (validator.castle.used) castleSafe = castling(targetNode);

        if (castleSafe === false) {
            board.updatePieceLoc(targetNode, nodeSelected, piece)
            setWarning("Castling here leaves the rook or king in a threatened square. Please try another move.");
            setNodeSelected(false);
            return;
        }

        if (validator.enPassant.used) {
            var heldNode = validator.enPassant.target.boardNode;
            heldNode.content = null;
            playerPieces[1] = playerPieces[1].filter((piece => piece !== validator.enPassant.target));
        }

        if (validator.checkForThreat(playerPieces[1], playerPieces[0])){
            invalidMoveCheckedSelf(heldNode, heldTarget, targetNode, piece)
            return;
        }

        addToPrevious(targetNode);
        
        if (piece.pieceType === "pawn" && (
            (player === "white" && piece.yCoord === 7) ||
            piece.yCoord === 0))
        {
            setPromotion([targetNode, piece]);
            setNodeSelected(false)
        } else {
            cleanUp(targetNode, piece);
        }
    }

    const addToPrevious = (targetNode) => {
        let pieceCoord = [`${COORD_CONVERSION[nodeSelected.xCoord]}${nodeSelected.yCoord + 1}`]
        let targetCoord = [`${COORD_CONVERSION[targetNode.xCoord]}${targetNode.yCoord + 1}`]
        lastMove = [player, pieceCoord, targetCoord]
        setPreviousMoves([...previousMoves, lastMove])
    }

    const invalidMoveCheckedSelf = (heldNode, heldTarget, targetNode, piece) => {
        setWarning("That move leaves you in check, try another.")
        board.updatePieceLoc(targetNode, nodeSelected, piece);
        targetNode.content = heldTarget;
        if (heldTarget) playerPieces[1].push(heldTarget);
        
        if (validator.enPassant.used) {
            playerPieces[1].push(validator.enPassant.target);
            heldNode.content = validator.enPassant.target
        }
        setNodeSelected(false);
    }

    const promotionHandler = (e) => {
        let type = e.target.name
        let [targetNode, piece] = promotion
        board.promotion(targetNode, piece, playerPieces, player, type)
        setPromotion(false)
        cleanUp(targetNode, piece)
    }

    const cleanUp = (targetNode, piece) => {
        checkTest()

        setPlayerPieces(playerPieces.reverse());
        setPlayer(player === "white" ? "black" : "white");

        piece.moves = piece.moves.filter(move => move !== "first");

        validator.enPassant.pawns = [];
        if (piece.pieceType === "pawn" && Math.abs(nodeSelected.yCoord - targetNode.yCoord) > 1) {
            validator.setEnPassant(targetNode)
        }
        
        let formattedMove = [
            [nodeSelected.xCoord, nodeSelected.yCoord],
            [targetNode.xCoord, targetNode.yCoord],
            lastMove,
            ];
        pushMoveToDB(formattedMove);

        setNodeSelected(false);
    }

    const checkTest = () => {
        let checkPiece = validator.checkForThreat(playerPieces[0], playerPieces[1]);

        if (checkPiece) {
            let checkmate = validator.checkmate(playerPieces[1], checkPiece);
            if (checkmate){
                console.log(`Checkmate ${player} wins.`);
                setGameOver(player[0].toUpperCase() + player.slice(1));
                console.log("test")
            } else {
                let checkedPlayer = player === "white" ? "Black " : "White"
                console.log("someone is in check");
                setWarning(`${checkedPlayer} is in check`);
            }
        }
    }

    const castling = kingNode => {
        let startingNode = validator.castle.rook.boardNode;
        validator.castle.used = false;

        let targetNode;
        if (startingNode.xCoord < kingNode.xCoord) {
            targetNode = board.board[kingNode.neighboringSquares["e"]];
        } else {
            targetNode = board.board[kingNode.neighboringSquares["w"]];
        }

        board.updatePieceLoc(startingNode, targetNode, validator.castle.rook);

        if (validator.checkForThreat(playerPieces[1], playerPieces[0], targetNode) ||
            validator.checkForThreat(playerPieces[1], playerPieces[0])) 
        {
            board.updatePieceLoc(targetNode, startingNode, validator.castle.rook);
            return false;
        }

        return true
    }

    const newGame = () => {
        axios.get("http://localhost:8000/api/games/new")
        .then(result => {
            console.log(result.data);
            history.push(`/game/${result.data._id}`)
        })
        .catch(err => console.error(err))
    }



    return (
        <div className="w-75 mx-auto mt-5">
            <div className="d-flex justify-content-between">
                <ChessBoard board={board} handleClick={handleClick} nodeSelected={nodeSelected}/>
                <div className="p-3 bg-dark move-box rounded">
                    <div className="bg-light border rounded h-100 overflow-scroll">
                        <p className="text-center fs-3 fw-bold">Previous Moves:</p>
                        {previousMoves.map((move) => {
                            return (
                                <p className="text-center">{move[0][0].toUpperCase()}: {move[1]} to {move[2]}</p>
                            )
                        })}
                    </div>
                </div>
            </div>
            <h2 className="mt-5 text-center">{player[0].toUpperCase() + player.slice(1)}'s turn.</h2>
            { warning && <h3 className="text-danger text-center">{warning}</h3>}
            { promotion &&
                    <div className="bg-light border border-secondary border-5 rounded fixed-bottom w-75 mx-auto p-5 d-flex justify-content-between align-items-center mb-5">
                        <h3 className="col-6 ms-5">What kind of piece would you like?</h3>
                        <button onClick={promotionHandler} className="btn btn-secondary p-2 col-1" name="queen">Queen</button>
                        <button onClick={promotionHandler} className="btn btn-secondary p-2 col-1" name="rook">Rook</button>
                        <button onClick={promotionHandler} className="btn btn-secondary p-2 col-1" name="bishop">Bishop</button>
                        <button onClick={promotionHandler} className="btn btn-secondary p-2 col-1" name="knight">Knight</button>
                    </div>
            }
            { gameOver &&
                    <div className="bg-light border border-secondary border-5 rounded fixed-bottom w-50 mx-auto p-5 d-flex justify-content-between align-items-center mb-5">
                        <h3 className="mx-3">Checkmate! {gameOver} Wins!</h3>
                        <button onClick={newGame} className="btn btn-secondary p-2 col-4">New Game</button>
                    </div>
            }
        </div>
    );
};

export default Game;