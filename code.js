////// Minesweeper //////
// Made by Arno Maris //
/// 28 October 2020 ////
////////////////////////

const diffuclties = {Easy: 10, Normal: 15, Hard: 20} // default amount of mines for a 10 x 10

const mineColors = { // easy way to assign colors to the numbers
    1: "rgb(0, 0, 255)",
    2: "rgb(0, 123, 0)",
    3: "rgb(255, 0, 0)",
    4: "rgb(0, 0, 123)",
    5: "rgb(123, 0, 0)",
    6: "rgb(0, 123, 123)",
    7: "rgb(0, 0, 0)",
    8: "rgb(123, 123, 123)",
}

let mineField // the play field gets stored in here
let xSize = 10 // xsize of field
let ySize = 10 // ysize of field

// Window load event //
window.onload = function () {
    newGame(xSize, ySize, "Easy")
}

// Start a new game //
function newGame(width, height, diffuclty) {
    mineField = new MineField(width, height, diffuclty)
    mineField.drawMineField()
}

// Mine field class //
class MineField {
    // game states
    // 1 --> won
    // 0 --> playing
    // -1 --> lost
    constructor(width, height, diffuclty) {
        this.field = []
        this.diffuclty = diffuclty
        this.cells = width * height // amount of cells
        this.mines = Math.ceil(diffuclties[diffuclty] * ((this.cells) / 100)) // get amount of mines based of diffuculty, sizes with field size
        this.markedCells = 0 // amount of marked cells
        this.openedCells = 0 // amount of opened cells
        this.gameState = 0
        this.moves = 0
        this.time = 0
        this.intervalEvent

        for (let i = 0; i < height; i++) { // First create an array with the desired size
            this.field[i] = []
            for (let j = 0; j < width; j++) {
                this.field[i][j] = new Mine(i, j)
            }
        }

        let amountOfMines = this.mines // amount of mines that still need to be assigned
        while (amountOfMines > 0) {
            let i = Math.floor(Math.random() * height) // assign mines to random tiles
            let j = Math.floor(Math.random() * width)
            if (!this.field[i][j].mine) { // make sure tile isnt already a mine
                this.field[i][j].mine = true
                amountOfMines -= 1
            }
        }
        document.getElementById("timer").innerHTML = "00:00:00" // reset UI
        document.getElementById("moves").innerHTML = "Moves: 0"
    }

    drawMineField() { // inital function to draw the minefield at the start of the game
        let tableHTML = ""
        for (let i = 0; i < this.field.length; i++) {
            let rowHTML = "<tr>"
            for (let j = 0; j < this.field[i].length; j++) { // loop through the table to create cells
                rowHTML += `<td id="${this.field[i][j].id}" class="unkown" onclick="handleClickEvent(this, 1)" oncontextmenu="event.preventDefault(); handleClickEvent(this, 2)"></td>`
            }
            rowHTML += "</tr>"
            tableHTML += rowHTML
        }
        document.getElementById("mine_field").innerHTML = `<table>${tableHTML}</table>`
    }

    handleClick(row, column, button) {
        let cell = this.field[row][column]
        if (this.gameState == 0) {
            if (button == 1) {
                if (!cell.marked && !cell.revealed) {
                    this.moves += 1
                    document.getElementById("moves").innerHTML = "Moves: " + this.moves
                    if (cell.mine) {
                        cell.revealed = true// set the mine to revealed mine
                        cell.setHTML()
                        this.endGame(-1) // game over
                    } else { // if cell is not revealed check surrounding cells
                        if (this.moves == 1) { // if its the players first move we start the timer
                            this.intervalEvent = setInterval(() => this.updateTimer(), 1000)
                        }
                        this.checkSurrounding(cell)
                    }
                }
            } else if (button == 2) {
                if (!cell.revealed) {
                    cell.mark() // toggle cell mark
                    this.markedCells += cell.marked && 1 || -1 // add/remove amount of marked cells
                }
            }
        }
    }

    checkSurrounding(cell) { // recursively loop through surrounding cells
        let [surrounding, mines] = this.getSurrounding(cell)
        cell.surrounding = mines
        cell.revealed = true
        this.openedCells += 1
        cell.setHTML()
        if (mines == 0) { // if we have no mines near we can check the surrounding cells
            surrounding.forEach(neighborCell => {
                if (!neighborCell.revealed) {
                    this.checkSurrounding(neighborCell)
                }
            })
        }
        this.checkIfWon()
    }

    getSurrounding(cell) { // gets all surrounding cells and checks how many mines are near
        let mines = 0
        let surrounding = []
        for (let i = cell.row - 1; i <= cell.row + 1; i++) {
            if (this.field[i]) {
                for (let j = cell.column - 1; j <= cell.column + 1; j++) {
                    if (this.field[i][j] && this.field[i][j] != cell) { // check if valid and check if cell is not itself
                        if (this.field[i][j].mine) {
                            mines += 1
                        } else if (!this.field[i][j].marked) {
                            surrounding.push(this.field[i][j])
                        }
                    }
                }
            }
        }
        return [surrounding, mines]
    }

    checkIfWon() { // efficient way to check if the player won 
        if ((this.cells - this.openedCells) == this.mines && this.gameState == 0) { // if the amount of unrevealed cells == amount of mines we win
            this.endGame(1)
        }
    }

    endGame(winStatus) {// end the game if the player lost/won
        this.gameState = winStatus
        if (this.gameState == -1) {
            for (let i = 0; i < this.field.length; i++) { // go through all cells
                for (let j = 0; j < this.field[i].length; j++) {
                    let cell = this.field[i][j]
                    if ((cell.mine && !cell.marked) || (cell.marked && !cell.mine)) { // if the cell is marked, but isnt a mine, let the player know
                        cell.forceReveal = true // if is mine but not marked let player know
                        cell.setHTML()
                    }
                }
            }
        } else if (this.gameState == 1) {
            let alertString = "Congratulations, you completed the game in "
            let [hours, minutes, seconds] = secondsToTime(this.time)
            if (hours > 0) {
                alertString += hours > 1 && hours + " hours " || hours + " hour "
            }
            if (minutes > 0) {
                alertString += minutes > 1 && minutes + " minutes " || minutes + " minute "
            }
            if (seconds > 0) {
                alertString += seconds > 1 && seconds + " seconds " || seconds + " second "
            }
            alertString += "with " + this.moves + " moves!"
            alert(alertString)
        }
        clearInterval(this.intervalEvent)
    }

    updateTimer() {
        this.time += 1
        let [hours, minutes, seconds] = secondsToTime(this.time)
        document.getElementById("timer").innerHTML = hours.padStart(2, '0') + ':' + minutes.padStart(2, '0') + ':' + seconds.padStart(2, '0')
    }
}

class Mine {
    
    constructor(row, column) {
        this.row = row
        this.column = column
        this.revealed = false
        this.mine = false
        this.surrounding = 0 // amount of surrounding mines
        this.marked = false // check if marked
        this.forceReveal = false
        this.id = this.row.toString() + '.' + this.column.toString()
    }

    mark() { // flag/unflag a cell
        this.marked = !this.marked
        this.setHTML()
    }

    setHTML() { // prevent redrawing entire board each time something changes
        let cellHTML = document.getElementById(this.id) // html of cell
        if (this.marked && !this.forceReveal) { // display flag if cell is marked
            cellHTML.innerHTML = createImageHTML("flag.png")
            cellHTML.className = "flag"
        } else if (this.revealed && !this.mine) { // display revealed cell
            cellHTML.className = "revealed"
            if (this.surrounding > 0) { // display amount of surrounding mines
                cellHTML.innerHTML = this.surrounding
                cellHTML.style.color = mineColors[this.surrounding]
            }
        } else if (this.revealed && this.mine) { // player clicked on mine
            cellHTML.innerHTML = createImageHTML("bomb.png")
            cellHTML.className = "hit"
        } else if (this.mine && this.forceReveal) { // game over, display mines
            cellHTML.innerHTML = createImageHTML("bomb.png")
            cellHTML.className = "revealed"
        } else if (this.marked && this.forceReveal) { // game over, display wrongly marked cell
            cellHTML.innerHTML = createImageHTML("notbomb.png")
            cellHTML.className = "revealed"
        } else { // cell is not revealed in all other cases
            cellHTML.innerHTML = ""
            cellHTML.className = "unkown"
        }
    }
}

function handleClickEvent(cell, button) { // On cell click handle the event
    let row = cell.parentNode.rowIndex
    let column = cell.cellIndex
    mineField.handleClick(row, column, button)
}

function displayValue(slider) { // display value if the sliders change
    if (slider.id == "xslider") {
        let display = document.getElementById("xdisplay")
        display.innerHTML = "X: " + slider.value
    } else if (slider.id == "yslider") {
        let display = document.getElementById("ydisplay")
        display.innerHTML = "Y: " + slider.value
    }
}

function handleNewGameRequest() { // player requests new game
    if (mineField) {
        clearInterval(mineField.intervalEvent)
    }
    let xSize = document.getElementById("xslider").value
    let ySize = document.getElementById("yslider").value
    let diffuclty = document.getElementById("diffuclty").value
    newGame(xSize, ySize, diffuclty)
}

function createImageHTML(image) { // convenient function to create images
    return `<img src="${image}" alt="Flag" align="center" class="image">`
}

function secondsToTime(totalSeconds) {
    dateObj = new Date(totalSeconds * 1000)
    hours = dateObj.getUTCHours().toString()
    minutes = dateObj.getUTCMinutes().toString()
    seconds = dateObj.getSeconds().toString()
    return [hours, minutes, seconds]
}