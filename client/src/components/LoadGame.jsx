import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import Game from './Game';
import Serializer from '../modules/Serializer';
import Board from "../modules/Board";
import Validator from '../modules/Validator';


const LoadGame = () => {
    const {gameId} = useParams()
    const [board, setBoard] = useState(new Board());
    const [player, setPlayer] = useState("white");
    const [playerPieces, setPlayerPieces] = useState([board.whitePieces, board.blackPieces]);
    const [validator, setValidator] = useState();
    const [previousMoves, setPreviousMoves] = useState([]);
    const [loaded, setLoaded] = useState(false)
    const serializer = new Serializer()

    useEffect(() => {
        setLoaded(false);
        axios.get(`http://localhost:8000/api/games/${gameId}`)
            .then(result => {
                load(result.data);
            })
            .catch(err => console.error(err));
    }, [gameId]);

    const load = (boardState) => {
        board.blankBoard();
        serializer.loadGame(boardState, board);
        setPlayer(boardState.player);
        let pieces = boardState.player === "white" ? [board.whitePieces, board.blackPieces] : [board.blackPieces, board.whitePieces];
        setPlayerPieces(pieces);
        let passant = serializer.loadPassant(boardState.passant, board)
        setValidator(new Validator(board, pieces, passant))
        
        setPreviousMoves(boardState.previousMoves);
        setLoaded(true);
    }

    const pushMoveToDB = (move) => {
        let passant = serializer.savePassant(validator.enPassant);
        move.push(passant)
        axios.put(`http://localhost:8000/api/games/${gameId}`, move)
            .then(result => console.log(result))
            .catch(err => console.error(err))
    }


    return (
        <div>
            {loaded && (
                <Game 
                    board={board} 
                    validator={validator} 
                    player={player} setPlayer={setPlayer}
                    playerPieces={playerPieces} setPlayerPieces={setPlayerPieces}
                    previousMoves={previousMoves} setPreviousMoves={setPreviousMoves}
                    pushMoveToDB={pushMoveToDB}
                />
            )}
        </div>
    );
};

export default LoadGame;