import React, {useState} from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const history = useHistory()
    const [gameId, setGameId] = useState("");
    const [warning, setWarning] = useState(false);

    const makeNewGame = () => {
        axios.get("http://localhost:8000/api/games/new")
            .then(result => {
                console.log(result.data);
                history.push(`/game/${result.data._id}`)
            })
            .catch(err => console.error(err))
    }

    const changeHandler = (e) => {
        setGameId(e.target.value);
    }

    const submitHandler = (e) => {
        e.preventDefault();
        setWarning(false);
        axios.get(`http://localhost:8000/api/games/${gameId}`)
            .then(result => {
                console.log(result.data);
                loadGame(result.data);
            })
            .catch(err => console.error(err));
    }

    const loadGame = (game) => {
        if (game) {
            history.push(`/game/${gameId}`);
        } else {
            setWarning("That game does not exist.")
        }
    }

    return (
        <div className="d-flex justify-content-center align-items-start p-5 mt-5">
            <h1 className="text-center me-5">Chess</h1>
            <button onClick={e => makeNewGame()} className="btn btn-secondary mx-5">New Game</button>
            <form onSubmit={submitHandler} className="ms-5">
                <button className="btn btn-secondary">Join Game</button>
                <div className="mt-3">
                    <input onChange={changeHandler} type="text" className="form-control" id="gameId" placeholder="Game Id"/>
                </div>
                {warning && <p className="text-danger mt-3">{warning}</p>} 
            </form>
        </div>
    );
};

export default HomePage;