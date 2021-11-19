const GamesController = require('../controllers/game.controller') 

module.exports = app => {
    app.get('/api/games/new', GamesController.createGame);
    app.get('/api/games/:id', GamesController.getOneGame);
    app.put('/api/games/:id', GamesController.updateGame);
    app.delete('/api/games/:id', GamesController.deleteGame);
}