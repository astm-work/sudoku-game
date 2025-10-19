class SudokuGame {
    constructor() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fixedCells = new Set();
        this.selectedCell = null;
        this.mistakes = 0;
        this.difficulty = 'medium';
        this.timer = 0;
        this.timerInterval = null;

        this.init();
    }

    init() {
        this.renderBoard();
        this.attachEventListeners();
        this.generateNewGame();
    }

    renderBoard() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                boardElement.appendChild(cell);
            }
        }
    }

    attachEventListeners() {
        const boardElement = document.getElementById('board');
        boardElement.addEventListener('click', (e) => {
            if (e.target.classList.contains('cell')) {
                this.selectCell(e.target);
            }
        });

        document.querySelectorAll('.number-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const number = parseInt(e.target.dataset.number);
                this.placeNumber(number);
            });
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearCell();
        });

        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.generateNewGame();
        });

        document.getElementById('hint-btn').addEventListener('click', () => {
            this.giveHint();
        });

        document.getElementById('check-btn').addEventListener('click', () => {
            this.checkSolution();
        });

        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.difficulty = e.target.dataset.difficulty;
                document.getElementById('difficulty-display').textContent = e.target.textContent;
                this.generateNewGame();
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.placeNumber(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clearCell();
            }
        });
    }

    selectCell(cellElement) {
        if (this.selectedCell) {
            this.selectedCell.classList.remove('selected');
        }

        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('highlighted');
        });

        this.selectedCell = cellElement;
        cellElement.classList.add('selected');

        const row = parseInt(cellElement.dataset.row);
        const col = parseInt(cellElement.dataset.col);
        const value = this.board[row][col];

        if (value !== 0) {
            document.querySelectorAll('.cell').forEach(cell => {
                const r = parseInt(cell.dataset.row);
                const c = parseInt(cell.dataset.col);
                if (this.board[r][c] === value) {
                    cell.classList.add('highlighted');
                }
            });
        }
    }

    placeNumber(number) {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        const cellKey = `${row}-${col}`;

        if (this.fixedCells.has(cellKey)) return;

        this.board[row][col] = number;
        this.updateCell(this.selectedCell, number);

        if (number !== this.solution[row][col]) {
            this.selectedCell.classList.add('error');
            this.mistakes++;
            document.getElementById('mistakes').textContent = this.mistakes;
        } else {
            this.selectedCell.classList.remove('error');
        }

        if (this.isBoardComplete() && this.isBoardCorrect()) {
            this.gameWon();
        }
    }

    clearCell() {
        if (!this.selectedCell) return;

        const row = parseInt(this.selectedCell.dataset.row);
        const col = parseInt(this.selectedCell.dataset.col);
        const cellKey = `${row}-${col}`;

        if (this.fixedCells.has(cellKey)) return;

        this.board[row][col] = 0;
        this.updateCell(this.selectedCell, 0);
        this.selectedCell.classList.remove('error');
    }

    updateCell(cellElement, value) {
        cellElement.textContent = value === 0 ? '' : value;
    }

    generateNewGame() {
        this.resetGame();
        this.generateSolution();
        this.createPuzzle();
        this.displayBoard();
        this.startTimer();
    }

    resetGame() {
        this.board = Array(9).fill(null).map(() => Array(9).fill(0));
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fixedCells.clear();
        this.selectedCell = null;
        this.mistakes = 0;
        this.timer = 0;
        document.getElementById('mistakes').textContent = '0';
        document.getElementById('message').style.display = 'none';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    generateSolution() {
        this.fillDiagonalBoxes();
        this.solveSudoku(this.solution);
    }

    fillDiagonalBoxes() {
        for (let box = 0; box < 9; box += 3) {
            this.fillBox(box, box);
        }
    }

    fillBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);

        let index = 0;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                this.solution[row + i][col + j] = numbers[index++];
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    solveSudoku(board) {
        const emptyCell = this.findEmptyCell(board);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.shuffleArray(numbers);

        for (let num of numbers) {
            if (this.isValidMove(board, row, col, num)) {
                board[row][col] = num;

                if (this.solveSudoku(board)) {
                    return true;
                }

                board[row][col] = 0;
            }
        }

        return false;
    }

    findEmptyCell(board) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null;
    }

    isValidMove(board, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) {
                return false;
            }
        }

        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[boxRow + i][boxCol + j] === num) {
                    return false;
                }
            }
        }

        return true;
    }

    createPuzzle() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                this.board[row][col] = this.solution[row][col];
            }
        }

        const cellsToRemove = this.getCellsToRemove();
        const cells = [];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                cells.push([row, col]);
            }
        }

        this.shuffleArray(cells);

        for (let i = 0; i < cellsToRemove; i++) {
            const [row, col] = cells[i];
            this.board[row][col] = 0;
        }

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== 0) {
                    this.fixedCells.add(`${row}-${col}`);
                }
            }
        }
    }

    getCellsToRemove() {
        switch (this.difficulty) {
            case 'easy':
                return 30;
            case 'medium':
                return 45;
            case 'hard':
                return 55;
            default:
                return 45;
        }
    }

    displayBoard() {
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellKey = `${row}-${col}`;
            const value = this.board[row][col];

            cell.textContent = value === 0 ? '' : value;
            cell.classList.remove('fixed', 'error', 'selected', 'highlighted');

            if (this.fixedCells.has(cellKey)) {
                cell.classList.add('fixed');
            }
        });
    }

    giveHint() {
        const emptyCells = [];

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellKey = `${row}-${col}`;
                if (!this.fixedCells.has(cellKey) && this.board[row][col] === 0) {
                    emptyCells.push([row, col]);
                }
            }
        }

        if (emptyCells.length === 0) {
            this.showMessage('これ以上ヒントはありません！', 'error');
            return;
        }

        const [row, col] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const cellKey = `${row}-${col}`;

        this.board[row][col] = this.solution[row][col];
        this.fixedCells.add(cellKey);

        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            if (parseInt(cell.dataset.row) === row && parseInt(cell.dataset.col) === col) {
                cell.textContent = this.solution[row][col];
                cell.classList.add('fixed');
                cell.classList.remove('error');
            }
        });

        this.showMessage('ヒントを表示しました！', 'success');
    }

    checkSolution() {
        let hasErrors = false;

        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const cellKey = `${row}-${col}`;

            if (!this.fixedCells.has(cellKey) && this.board[row][col] !== 0) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    cell.classList.add('error');
                    hasErrors = true;
                } else {
                    cell.classList.remove('error');
                }
            }
        });

        if (hasErrors) {
            this.showMessage('エラーが見つかりました！赤いセルを確認してください。', 'error');
        } else if (this.isBoardComplete()) {
            this.gameWon();
        } else {
            this.showMessage('今のところ正解です！続けてください。', 'success');
        }
    }

    isBoardComplete() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

    isBoardCorrect() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.board[row][col] !== this.solution[row][col]) {
                    return false;
                }
            }
        }
        return true;
    }

    gameWon() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        this.showMessage(`おめでとうございます！クリアしました！\n時間: ${timeStr} | ミス: ${this.mistakes}回`, 'success');
    }

    showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = `message ${type}`;
        messageElement.style.display = 'block';

        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }

    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        this.timer = 0;
        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.timer++;
            this.updateTimerDisplay();
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer').textContent = display;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SudokuGame();
});
