const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    player: {
        type: String,
        default: "white"
    },
    wPieces: {
        type: Array,
        default:  [
            [0, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [1, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [2, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [3, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [4, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [5, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [6, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [7, 1, 'pawn', 'Chess_pw.svg', 'first'],
            [1, 0, 'knight', 'Chess_nw.svg'],
            [6, 0, 'knight', 'Chess_nw.svg'],
            [2, 0, 'bishop', 'Chess_bw.svg'],
            [5, 0, 'bishop', 'Chess_bw.svg'],
            [0, 0, 'rook', 'Chess_rw.svg', 'first'],
            [7, 0, 'rook', 'Chess_rw.svg', 'first'],
            [4, 0, 'king', 'Chess_kw.svg', 'first'],
            [3, 0, 'queen', 'Chess_qw.svg'],
        ]
    },
    bPieces: {
        type: Array,
        default:  [
            [0, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [1, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [2, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [3, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [4, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [5, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [6, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [7, 6, 'pawn', 'Chess_pb.svg', 'first'],
            [1, 7, 'knight', 'Chess_nb.svg'],
            [6, 7, 'knight', 'Chess_nb.svg'],
            [2, 7, 'bishop', 'Chess_bb.svg'],
            [5, 7, 'bishop', 'Chess_bb.svg'],
            [0, 7, 'rook', 'Chess_rb.svg', 'first'],
            [7, 7, 'rook', 'Chess_rb.svg', 'first'],
            [4, 7, 'king', 'Chess_kb.svg', 'first'],
            [3, 7, 'queen', 'Chess_qb.svg'],
        ]
    },
    passant: {
        type: Object,
        default: {"pawns": []}
    },
    previousMoves: {
        type: Array,
        default: []
    }
}, {timestamps: true})

module.exports.Game = mongoose.model("Games", GameSchema);