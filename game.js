// game.js — главный игровой цикл и управление состоянием

class Game {
    constructor() {
        // Получаем canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Устанавливаем размер canvas
        this.canvas.width = CONFIG.GRID.OFFSET_X * 2 + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE;
        this.canvas.height = CONFIG.GRID.OFFSET_Y * 2 + CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;

        // Инициализация модулей
        this.grid = new Grid(CONFIG.GRID.ROWS, CONFIG.GRID.COLS);
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.energy = new EnergySystem(CONFIG.ENERGY.START_AMOUNT, CONFIG.ENERGY.MAX_AMOUNT);
        this.reactor = new Reactor(CONFIG.REACTOR.MAX_HEALTH);
        this.waveController = new WaveController(this.grid);

        // Состояние игры
        this.state = 'prepare'; // prepare, battle, win, lose, dialogue
        this.currentAct = null;
        this.currentActIndex = 0;

        // Массивы объектов
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];

        // Выбранная башня для установки
        this.selectedTower = null;

        // Настройка обработчиков
        this.setupEventListeners();

        console.log('Ferroid Defense — игра инициализирована');
    }

    setupEventListeners() {
        // Клик по canvas — установка башни
        this.canvas.addEventListener('click', (e) => {
            this.handleCanvasClick(e);
        });

        // Клавиши
        window.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });

        // Обновление UI каждую секунду
        setInterval(() => {
            this.updateUI();
        }, 100);
    }

    handleCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Конвертируем в клетку
        const cell = this.grid.pixelToCell(mouseX, mouseY);

        if (cell && this.selectedTower) {
            // Пытаемся установить башню
            this.tryPlaceTower(cell.row, cell.col);
        } else if (cell && this.grid.getCell(cell.row, cell.col).tower) {
            // Показываем информацию о башне
            const tower = this.grid.getCell(cell.row, cell.col).tower;
            console.log(`Башня: ${tower.name} | Урон: ${tower.damage} | Перезарядка: ${tower.cooldown}с`);
        }
    }

    handleKeyPress(e) {
        switch(e.key.toLowerCase()) {
            case '1':
                this.selectTower('basic_gun');
                break;
            case '2':
                this.selectTower('slow_pad');
                break;
            case '3':
                this.selectTower('trap');
                break;
            case '4':
                this.selectTower('heavy_cannon');
                break;
            case 'r':
                if (this.state === 'lose') {
                    this.restartGame();
                }
                break;
            case ' ':
                if (this.state === 'prepare') {
                    this.startWave();
                }
                break;
        }
    }

    selectTower(towerId) {
        if (CONFIG.TOWERS[towerId.toUpperCase()]) {
            this.selectedTower = CONFIG.TOWERS[towerId.toUpperCase()];
            console.log(`Выбрана башня: ${this.selectedTower.name} (стоимость: ${this.selectedTower.cost})`);
        }
    }

    tryPlaceTower(row, col) {
        if (!this.selectedTower) {
            console.log('Башня не выбрана! Нажмите 1-4 для выбора.');
            return;
        }

        if (!this.grid.isCellFree(row, col)) {
            console.log('Клетка занята!');
            return;
        }

        if (!this.energy.canAfford(this.selectedTower.cost)) {
            console.log('Недостаточно энергии!');
            return;
        }

        // Создаём башню
        const tower = new Tower(
            this.selectedTower.id,
            this.selectedTower.name,
            this.selectedTower.icon,
            this.selectedTower.cost,
            this.selectedTower.damage || 0,
            this.selectedTower.range || 0,
            this.selectedTower.cooldown || 1,
            this.selectedTower.color,
            this.selectedTower.projectileSpeed || 0
        );

        // Устанавливаем на сетку
        if (this.grid.placeTower(row, col, tower)) {
            this.energy.spend(this.selectedTower.cost);
            console.log(`Башня ${tower.name} установлена на [${row}, ${col}]`);
        }
    }

    startWave() {
        if (this.state !== 'prepare') return;

        if (!this.currentAct) {
            this.loadAct(0);
        }

        this.state = 'battle';
        this.waveController.startNextWave();
        console.log('Волна началась!');
    }

    loadAct(actIndex) {
        if (actIndex >= CONFIG.ACTS.length) {
            console.log('Все акты пройдены!');
            this.state = 'win';
            return;
        }

        this.currentAct = CONFIG.ACTS[actIndex];
        this.currentActIndex = actIndex;
        this.waveController.loadAct(this.currentAct);
        console.log(`Акт ${this.currentAct.id}: ${this.currentAct.title}`);
        console.log(this.currentAct.description);
    }

    updateUI() {
        document.getElementById('energyDisplay').textContent = `⚡ ${Math.floor(this.energy.current)}`;
        document.getElementById('reactorHealth').textContent = `❤️ ${this.reactor.currentHealth}`;
        document.getElementById('waveInfo').textContent = `Волна: ${this.waveController.currentWaveIndex + 1}/${this.waveController.totalWaves}`;
    }

    gameLoop(timestamp) {
        // Обновление логики
        this.update(timestamp);

        // Отрисовка
        this.renderer.draw(this);

        // Следующий кадр
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(timestamp) {
        // Обновляем энергию
        this.energy.update(timestamp);

        // Обновляем волны
        if (this.state === 'battle') {
            this.waveController.update(timestamp, this);
        }

        // Обновляем врагов
        for (const enemy of this.enemies) {
            enemy.update(timestamp, this);
        }

        // Убираем мёртвых врагов
        this.enemies = this.enemies.filter(e => e.isAlive);

        // Обновляем башни
        const towers = this.grid.getAllTowers();
        for (const tower of towers) {
            tower.update(timestamp, this);
        }

        // Обновляем снаряды
        for (const proj of this.projectiles) {
            proj.update(timestamp, this);
        }

        // Убираем отработанные снаряды
        this.projectiles = this.projectiles.filter(p => p.isAlive);

        // Обновляем эффекты
        for (const effect of this.effects) {
            effect.update(timestamp);
        }

        // Убираем отработанные эффекты
        this.effects = this.effects.filter(e => e.isAlive);
    }

    restartGame() {
        // Полная перезагрузка
        location.reload();
    }

    start() {
        // Загружаем первый акт
        this.loadAct(0);

        // Запускаем игровой цикл
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}

// ============ ЗАПУСК ИГРЫ ============
const game = new Game();
game.start();
