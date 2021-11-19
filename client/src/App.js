import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom'
import './css/bootstrap.css';
import './css/board.css'
import LoadGame from './components/LoadGame'
import HomePage from './components/HomePage'

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Switch>
          <Route path="/game/:gameId">
            <LoadGame />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>

      </BrowserRouter>
    </div>
  );
}

export default App;
