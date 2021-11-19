// BoardSquares hold information about their coordinates, neighboring square coordinates, background color, and pieces contained within.
class BoardSquare {
    constructor(coord, color){
        this.xCoord = coord[0];
        this.yCoord = coord[1];
        this.neighboringSquares = this.neighbors();
        this.content = null;
        this.color = color;
    }

    // Determines valid neighboring squares
    neighbors() {
        let neighbors = { 
            nw: [this.xCoord - 1, this.yCoord - 1],
            n:  [this.xCoord, this.yCoord - 1],
            ne: [this.xCoord + 1, this.yCoord - 1],
            e:  [this.xCoord + 1, this.yCoord],
            se: [this.xCoord + 1, this.yCoord + 1],
            s:  [this.xCoord, this.yCoord + 1],
            sw: [this.xCoord - 1, this.yCoord + 1],
            w:  [this.xCoord - 1, this.yCoord] 
        };

        // Checks each neighbor, determining if the coordinates are valid, removes them if not.
        for (let key in neighbors) {
            let badCoord = false;
            switch (true){
                case neighbors[key][0] > 7:
                    badCoord = true;
                    break;
                case neighbors[key][0] < 0:
                    badCoord = true;
                    break;
                case neighbors[key][1] > 7:
                    badCoord = true;
                    break;
                case neighbors[key][1] < 0:
                    badCoord = true;
                    break;
                default:
            }
            badCoord ? 
                delete neighbors[key] : 
                neighbors[key] = neighbors[key].join("");
        };

        return neighbors;
    }
}

export default BoardSquare;
