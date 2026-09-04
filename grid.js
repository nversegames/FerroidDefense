// grid.js — сетка игрового поля

class Grid {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.cells = [];
        this.init();
    }

    init() {
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = {
                    row: row,
                    col: col,
                    tower: null,      // ссылка на объект башни
                    enemy: null,      // враг, стоящий на клетке (для ловушек)
                };
            }
        }
    }

    // Получить клетку
    getCell(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.cells[row][col];
        }
        return null;
    }

    // Проверить, свободна ли клетка
    isCellFree(row, col) {
        const cell = this.getCell(row, col);
        return cell && cell.tower === null;
    }

    // Установить башню на клетку
    placeTower(row, col, tower) {
        const cell = this.getCell(row, col);
        if (cell && cell.tower === null) {
            cell.tower = tower;
            tower.row = row;
            tower.col = col;
            return true;
        }
        return false;
    }

    // Убрать башню с клетки
    removeTower(row, col) {
        const cell = this.getCell(row, col);
        if (cell && cell.tower) {
            cell.tower = null;
            return true;
        }
        return false;
    }

    // Получить все башни
    getAllTowers() {
        const towers = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.cells[row][col].tower) {
                    towers.push(this.cells[row][col].tower);
                }
            }
        }
        return towers;
    }

    // Получить все башни на конкретной линии
    getTowersOnLane(row) {
        const towers = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.cells[row][col].tower) {
                towers.push(this.cells[row][col].tower);
            }
        }
        return towers;
    }

    // Получить pixel координаты центра клетки
    getCellCenter(row, col) {
        return {
            x: CONFIG.GRID.OFFSET_X + col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
            y: CONFIG.GRID.OFFSET_Y + row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
        };
    }

    // Конвертировать pixel координаты в клетку
    pixelToCell(px, py) {
        const col = Math.floor((px - CONFIG.GRID.OFFSET_X) / CONFIG.GRID.CELL_SIZE);
        const row = Math.floor((py - CONFIG.GRID.OFFSET_Y) / CONFIG.GRID.CELL_SIZE);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return { row, col };
        }
        return null;
    }

    // Получить Y-координату линии (для движения врагов)
    getLaneY(row) {
        return CONFIG.GRID.OFFSET_Y + row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
    }

    // Получить X-координату спавна (левая граница)
    getSpawnX() {
        return 0;
    }

    // Получить X-координату реактора (правая граница)
    getReactorX() {
        return CONFIG.GRID.OFFSET_X + this.cols * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.OFFSET_X;
    }
}
