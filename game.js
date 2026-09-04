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
        this.ui = new UIManager(this);

        // Состояние игры
        this.state = 'prepare'; // prepare, battle, win, lose, dialogue
        this.currentAct = null;
        this.currentActIndex = 0;
        this.gameTime = 0;
        this.lastTimestamp = 0;

        // Массивы объектов
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];

        // Выбранная башня для установки
        this.selectedTower = null;

        // Callback'и реактора
        this.reactor.onDestroyed = () => this.onReactorDestroyed();

        // Настройка обработчиков
        this.setupEventListeners();

        console.log('✅ Ferroid Defense — игра инициализирована');
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

        // Обновление UI
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
            this.tryPlaceTower(cell.row, cell.col);
        } else if (cell) {
            const cellData = this.grid.getCell(cell.row, cell.col);
            if (cellData.tower) {
                const tower = cellData.tower;
                console.log(`Башня: ${tower.name} | Урон: ${tower.damage}`);
            } else {
                console.log(`Клетка [${cell.row}, ${cell.col}] свободна`);
            }
        }
    }

    handleKeyPress(e) {
        switch(e.key.toLowerCase()) {
            case '1':
                this.selectTowerById('basic_gun');
                break;
            case '2':
                this.selectTowerById('slow_pad');
                break;
            case '3':
                this.selectTowerById('trap');
                break;
            case '4':
                this.selectTowerById('heavy_cannon');
                break;
            case 'r':
                if (this.state === 'lose') {
                    this.restartGame();
                }
                break;
            case ' ':
                e.preventDefault();
                if (this.state === 'prepare') {
                    this.startWave();
                }
                break;
            case 'escape':
                this.deselectTower();
                break;
        }
    }

    selectTowerById(towerId) {
        const towerConfig = CONFIG.TOWERS[towerId.toUpperCase()];
        if (towerConfig) {
            this.selectedTower = towerConfig;
            
            const btn = document.querySelector(`[data-tower="${towerId}"]`);
            if (btn) {
                this.ui.selectTower(towerId, btn);
            }
            
            console.log(`Выбрана башня: ${this.selectedTower.name} (${this.selectedTower.cost}⚡)`);
        }
    }

    deselectTower() {
        this.selectedTower = null;
        if (this.ui.selectedTowerBtn) {
            this.ui.selectedTowerBtn.classList.remove('selected');
            this.ui.selectedTowerBtn = null;
        }
        console.log('Башня не выбрана');
    }

    tryPlaceTower(row, col) {
        if (!this.selectedTower) {
            console.log('Башня не выбрана! Нажмите 1-4.');
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

        let tower;
        if (this.selectedTower.id === 'trap') {
            tower = new Trap(this.selectedTower.cost, this.selectedTower.damage);
        } else {
            tower = new Tower(
                this.selectedTower.id,
                this.selectedTower.name,
                this.selectedTower.icon,
                this.selectedTower.cost,
                this.selectedTower.damage || 0,
                this.selectedTower.range || 0,
                this.selectedTower.cooldown || 1,
                this.selectedTower.color,
                this.selectedTower.projectileSpeed || 300
            );
        }

        if (this.grid.placeTower(row, col, tower)) {
            this.energy.spend(this.selectedTower.cost);
            console.log(`✅ Башня ${tower.name} установлена на [${row}, ${col}]`);
        }
    }

    startWave() {
        if (this.state !== 'prepare') return;
        if (this.waveController.allWavesCompleted) return;

        this.state = 'battle';
        this.waveController.startNextWave();
        this.updateUI();
        console.log('⚔️ Волна началась!');
    }

    loadAct(actIndex) {
        if (actIndex >= CONFIG.ACTS.length) {
            console.log('🎉 Все акты пройдены! Игра завершена!');
            this.state = 'win';
            return;
        }

        this.currentAct = CONFIG.ACTS[actIndex];
        this.currentActIndex = actIndex;
        this.waveController.loadAct(this.currentAct);
        this.state = 'prepare';
        
        console.log(`\n=== АКТ ${this.currentAct.id}: ${this.currentAct.title} ===`);
        console.log(this.currentAct.description);
        
        // Показываем кат-сцену
        const cutscene = CONFIG.CUTSCENES[actIndex];
        if (cutscene) {
            this.state = 'dialogue';
            this.ui.showCutscene(cutscene, () => {
                this.state = 'prepare';
                this.updateUI();
                console.log('Кат-сцена завершена. Готовьтесь к бою!');
            });
        }
    }

    loadNextAct() {
        this.currentActIndex++;
        this.loadAct(this.currentActIndex);
    }

    onReactorDestroyed() {
        if (this.state === 'lose') return;
        this.state = 'lose';
        this.updateUI();
        this.ui.showLoseScreen();
        console.log('💀 ИГРА ОКОНЧЕНА!');
    }

    updateUI() {
        document.getElementById('energyDisplay').textContent = `⚡ ${Math.floor(this.energy.current)}`;
        document.getElementById('reactorHealth').textContent = `❤️ ${this.reactor.currentHealth}`;
        document.getElementById('waveInfo').textContent = `Волна: ${this.waveController.currentWaveIndex + 1}/${this.waveController.totalWaves}`;
        this.ui.updateStartWaveButton();
    }

    gameLoop(timestamp) {
        if (this.lastTimestamp === 0) {
            this.lastTimestamp = timestamp;
        }
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        this.gameTime += deltaTime;

        this.update(timestamp);
        this.renderer.draw(this);

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(timestamp) {
        // Обновляем энергию
        this.energy.update(timestamp);

        // Обновляем волны
        if (this.state === 'battle') {
            this.waveController.update(timestamp, this);

            if (this.waveController.isWaveComplete(this)) {
                if (this.waveController.isActComplete(this)) {
                    this.onActCompleted();
                } else {
                    this.waveController.advanceToNextWave();
                    this.state = 'prepare';
                    this.updateUI();
                    console.log('✅ Волна отбита! Подготовьтесь к следующей.');
                }
            }
        }

        // Обновляем врагов
        for (const enemy of this.enemies) {
            enemy.update(timestamp, this);
        }

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

        this.projectiles = this.projectiles.filter(p => p.isAlive);

        // Обновляем эффекты
        for (const effect of this.effects) {
            effect.update(timestamp);
        }

        this.effects = this.effects.filter(e => e.isAlive);
    }

    onActCompleted() {
        this.state = 'prepare';
        this.updateUI();
        console.log(`\n🏆 АКТ ${this.currentAct.id} ПРОЙДЕН!`);
        this.ui.showWinScreen(this.currentAct.id);
    }

    restartGame() {
        location.reload();
    }

    start() {
        this.loadAct(0);
        requestAnimationFrame((ts) => this.gameLoop(ts));
    }
}

// ============ ЗАПУСК ИГРЫ ============
const game = new Game();
game.start();
