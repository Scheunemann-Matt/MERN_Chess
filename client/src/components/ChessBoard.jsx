import React from 'react';
const COORD_CONVERSION = ["A", "B", "C", "D", "E", "F", "G", "H"];

const ChessBoard = (props) => {
    const {board, handleClick, nodeSelected} = props;

    const importAll = (r) => {
        let images = {};
        r.keys().map((item) => { return images[item.replace('./', '')] = r(item); });
        return images;
    }

    const images = importAll(require.context('../assets', false, /\.(png|jpe?g|svg)$/));

    const drawTopBotRow = (classes) => {
        let row = []
        row.push(<div className={classes}></div>)
        for (let i = 0; i < board.colSize; i++){
            row.push((
                <div className={classes}>
                    <h2 className="position-absolute top-50 start-50 translate-middle">{COORD_CONVERSION[i]}</h2>
                </div>
            ))
        }
        row.push(<div className={classes}></div>)
        return row
    }

    const drawBoard = () => {
        let newBoard = []
        let squareClasses = "board-square bg-edge"
        let letteringClasses = "position-absolute top-50 start-50 translate-middle"
        newBoard = newBoard.concat(drawTopBotRow(squareClasses))

        for (let row = 0; row < board.rowSize; row++){
            let sideLetterSquare = (
                <div className={squareClasses}>
                    <h2 className={letteringClasses}>{row + 1}</h2>
                </div>)

            newBoard.push(sideLetterSquare)

            for (let col = 0; col < board.colSize; col++){
                let boardSquare = board.board[`${col}${row}`]
                let piece = boardSquare.content? boardSquare.content : ""

                newBoard.push((
                    <div 
                        onClick={handleClick} 
                        className={`board-square bg-${boardSquare.color} ${boardSquare === nodeSelected ? "selectedPiece" : ""}`} 
                        key={`${col}${row}`} coord={`${col}${row}`}>
                            {piece ? 
                            <img 
                                src={images[piece.image]?.default} 
                                alt={piece.type} 
                                coord={`${col}${row}`}
                                className={`${letteringClasses} piece`} /> 
                        : ""}
                    </div>))
            }
            newBoard.push(sideLetterSquare)
        }
        newBoard = newBoard.concat(drawTopBotRow(squareClasses))

        return newBoard
    }

    return (
        <div className="d-flex flex-wrap bg-edge w-100 me-5">
            {drawBoard()}
        </div>
    );
};

export default ChessBoard;