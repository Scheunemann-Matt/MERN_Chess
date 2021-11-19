const {Game} = require('../models/game.model');

module.exports.getOneGame = (req, res) => {
    Game.findOne({_id: req.params.id})
        .then(game => res.json(game))
        .catch(err => {
            console.error(err);
            res.status(400).json(err);});
};

module.exports.createGame = (req, res) => {
    Game.create({})
        .then(game => res.json(game))
        .catch(err => {
            console.error(err);
            res.status(400).json(err);});
};

module.exports.updateGame = (req, res) => {
    Game.findOne({_id: req.params.id})
        .then(game => updateGame(game, req.body))
        .then(game => {
            console.log(game)
            Game.updateOne(
                {_id: req.params.id},
                game,
                {new: true, runValidators: true}
                )
                .then(updatedGame => res.json(updatedGame))
        })
        .catch(err => {
            console.error(err);
            res.status(400).json(err);});
};

module.exports.deleteGame = (req, res) => {
    Game.deleteOne({_id: req.params.id})
        .then(result => res.json(result))
        .catch(err => {
            console.error(err);
            res.status(400).json(err);});
};


const updateGame = (game, move) => {
    let startingCoords = move[0];
    let enPassant = move[3];
    let targetCoords = enPassant.used ? enPassant.removedPiece : move[1]
    
    game.wPieces = game.wPieces.filter(piece => {
        return (piece[0] !== targetCoords[0] || piece[1] !== targetCoords[1])
    })
    game.bPieces = game.bPieces.filter(piece => {
        return (piece[0] !== targetCoords[0] || piece[1] !== targetCoords[1])
    })

    targetCoords = move[1];
    let movingPiece;
    movingPiece = findPiece(game.wPieces, startingCoords);
    if (!movingPiece){
        movingPiece = findPiece(game.bPieces, startingCoords);
    }
    console.log(targetCoords)
    movingPiece[0] = targetCoords[0];
    movingPiece[1] = targetCoords[1];
    if (movingPiece.length > 4) movingPiece.pop()

    game.player = game.player === "white" ? "black": "white" 
    game.previousMoves.push(move[2])
    game.passant = enPassant
    return game;
}

const findPiece = (pieces, startingCoords) => {
    for (let piece of pieces) {
        if (piece[0] === startingCoords[0] && piece[1] === startingCoords[1]){
            return piece;
        }
    };
    return null
}