// ============ КОНСТАНТЫ ============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const ROWS = 5;
const COLS = 9;
const CELL_SIZE = 100;
const GRID_OFFSET_X = 150;
const GRID_OFFSET_Y = 50;

canvas.width = GRID_OFFSET_X * 2 + COLS * CELL_SIZE;
canvas.height = GRID_OFFSET_Y * 2 + ROWS * CELL_SIZE;

// ============ СОСТОЯНИЕ ИГРЫ ============
const game = {
    energy: 100,
    reactorHealth: 100,
    wave: 0,
    state: 'prepare', // prepare, battle, win, lose
    towers: [],       // [{row, col, type}]
    enemies: [],
    selectedTower: null, // тип башни для установки
};

// ============ СЕТКА ============
function createGrid() {
    const grid = [];
    for (let row = 0; row < ROWS; row++) {
        grid[row] = [];
        for (let col = 0; col < COLS; col++) {
            grid[row][col] = { tower: null };
        }
    }
    return grid;
}

let grid = createGrid();

// ============ ОТРИСОВКА ============
function draw() {
    // Фон
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Заголовок
    ctx.fillStyle = '#00ff96';
    ctx.font = 'bold 32px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('FERROID DEFENSE', canvas.width / 2, 30);

    // Сетка
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const x = GRID_OFFSET_X + col * CELL_SIZE;
            const y = GRID_OFFSET_Y + row * CELL_SIZE;

            // Клетка
            ctx.fillStyle = (row + col) % 2 === 0 ? '#3a3a3a' : '#353535';
            ctx.fillRect(x, y, CELL_SIZE - 2, CELL_SIZE - 2);

            // Башня на клетке
            if (grid[row][col].tower) {
                ctx.fillStyle = '#0088ff';
                ctx.beginPath();
                ctx.arc(x + CELL_SIZE / 2, y + CELL_SIZE / 2, CELL_SIZE / 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 24px Courier New';
                ctx.textAlign = 'center';
                ctx.fillText('🔫', x + CELL_SIZE / 2, y + CELL_SIZE / 2 + 8);
            }
        }
    }

    // Зона спавна (слева)
    ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
    ctx.fillRect(0, GRID_OFFSET_Y, GRID_OFFSET_X - 10, ROWS * CELL_SIZE);
    ctx.fillStyle = '#ff4444';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('СПАВН', GRID_OFFSET_X / 2, GRID_OFFSET_Y + ROWS * CELL_SIZE / 2);

    // Зона реактора (справа)
    ctx.fillStyle = 'rgba(0, 255, 150, 0.15)';
    ctx.fillRect(GRID_OFFSET_X + COLS * CELL_SIZE + 10, GRID_OFFSET_Y, GRID_OFFSET_X - 10, ROWS * CELL_SIZE);
    ctx.fillStyle = '#00ff96';
    ctx.font = '16px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText('РЕАКТОР', GRID_OFFSET_X + COLS * CELL_SIZE + GRID_OFFSET_X / 2, GRID_OFFSET_Y + ROWS * CELL_SIZE / 2);

    // Обновление UI
    document.getElementById('energyDisplay').textContent = `⚡ ${game.energy}`;
    document.getElementById('reactorHealth').textContent = `❤️ ${game.reactorHealth}`;
    document.getElementById('waveInfo').textContent = `Волна: ${game.wave}`;
}

// ============ УСТАНОВКА БАШНИ ============
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Проверяем, попали ли в сетку
    const col = Math.floor((mouseX - GRID_OFFSET_X) / CELL_SIZE);
    const row = Math.floor((mouseY - GRID_OFFSET_Y) / CELL_SIZE);

    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        // Проверяем, свободна ли клетка
        if (!grid[row][col].tower) {
            // Проверяем энергию
            if (game.energy >= 50) {
                grid[row][col].tower = { type: 'basic', damage: 10, cooldown: 1 };
                game.energy -= 50;
                console.log(`Башня установлена на [${row}, ${col}]`);
            } else {
                console.log('Недостаточно энергии!');
            }
        }
    }
});

// ============ ИГРОВОЙ ЦИКЛ ============
function gameLoop() {
    draw();
    requestAnimationFrame(gameLoop);
}

// ============ ЗАПУСК ============
console.log('Ferroid Defense запущен!');
gameLoop();
