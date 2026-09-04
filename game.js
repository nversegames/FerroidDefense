// ============================================
// FERROID DEFENSE — ИГРОВАЯ ЛОГИКА
// ============================================

class Game {
    constructor() {
        // Canvas
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = CONFIG.GRID.OFFSET_X * 2 + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE;
        this.canvas.height = CONFIG.GRID.OFFSET_Y * 2 + CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;

        // Состояние
        this.state = 'prepare'; // prepare | battle | dialogue | win | lose
        this.energy = CONFIG.ENERGY.START;
        this.reactorHealth = CONFIG.REACTOR.MAX_HEALTH;
        this.currentActIndex = 0;
        this.currentWaveIndex = 0;
        this.selectedTowerType = null;
        this.lastRegenTime = 0;
        this.lastSpawnTime = 0;
        this.spawnQueue = [];
        this.isSpawning = false;
        this.allWavesDone = false;

        // Объекты
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];

        // Привязки
        this.setupEvents();
        this.setupUI();

        console.log('✅ Ferroid Defense запущен');
    }

    // ============ СОБЫТИЯ ============
    setupEvents() {
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cell = this.pixelToCell(x, y);

        if (cell && this.selectedTowerType) {
            this.placeTower(cell.row, cell.col);
        }
    }

    onKeyDown(e) {
        const tower = CONFIG.TOWERS.find(t => t.key === e.key);
        if (tower) {
            this.selectedTowerType = tower;
            this.updateTowerButtons();
            console.log(`Выбрана: ${tower.name}`);
        }
        if (e.key === ' ') {
            e.preventDefault();
            this.startWave();
        }
        if (e.key === 'r' && this.state === 'lose') {
            location.reload();
        }
        if (e.key === 'Escape') {
            this.selectedTowerType = null;
            this.updateTowerButtons();
        }
    }

    // ============ UI ============
    setupUI() {
        // Кнопки башен
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tower = CONFIG.TOWERS.find(t => t.id === btn.dataset.tower);
                if (tower) {
                    this.selectedTowerType = tower;
                    this.updateTowerButtons();
                    console.log(`Выбрана: ${tower.name}`);
                }
            });
        });

        // Кнопка запуска волны
        const waveBtn = document.getElementById('startWaveBtn');
        waveBtn.addEventListener('click', () => this.startWave());
    }

    updateTowerButtons() {
        document.querySelectorAll('.tower-btn').forEach(btn => {
            if (this.selectedTowerType && btn.dataset.tower === this.selectedTowerType.id) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    updateHUD() {
        document.getElementById('energyDisplay').textContent = `⚡ ${Math.floor(this.energy)}`;
        document.getElementById('reactorHealth').textContent = `❤️ ${this.reactorHealth}`;
        document.getElementById('waveInfo').textContent = `Волна: ${this.currentWaveIndex + 1}/${this.currentAct().waves.length}`;

        const btn = document.getElementById('startWaveBtn');
        if (this.state === 'prepare' && !this.allWavesDone) {
            btn.disabled = false;
            btn.textContent = '▶ НАЧАТЬ ВОЛНУ';
        } else if (this.state === 'battle') {
            btn.disabled = true;
            btn.textContent = '⚔️ ИДЁТ БОЙ...';
        } else if (this.state === 'dialogue') {
            btn.disabled = true;
            btn.textContent = '📖 КАТ-СЦЕНА...';
        } else if (this.allWavesDone) {
            btn.disabled = true;
            btn.textContent = '✅ АКТ ПРОЙДЕН';
        }
    }

    // ============ СЕТКА ============
    pixelToCell(x, y) {
        const col = Math.floor((x - CONFIG.GRID.OFFSET_X) / CONFIG.GRID.CELL_SIZE);
        const row = Math.floor((y - CONFIG.GRID.OFFSET_Y) / CONFIG.GRID.CELL_SIZE);
        if (row >= 0 && row < CONFIG.GRID.ROWS && col >= 0 && col < CONFIG.GRID.COLS) {
            return { row, col };
        }
        return null;
    }

    cellCenter(row, col) {
        return {
            x: CONFIG.GRID.OFFSET_X + col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
            y: CONFIG.GRID.OFFSET_Y + row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2,
        };
    }

    laneY(lane) {
        return CONFIG.GRID.OFFSET_Y + lane * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
    }

    reactorX() {
        return CONFIG.GRID.OFFSET_X + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.OFFSET_X - 30;
    }

    // ============ БАШНИ ============
    placeTower(row, col) {
        const towerType = this.selectedTowerType;
        if (!towerType) return;
        if (this.energy < towerType.cost) {
            console.log('Недостаточно энергии!');
            return;
        }
        if (this.towers.some(t => t.row === row && t.col === col)) {
            console.log('Клетка занята!');
            return;
        }

        this.energy -= towerType.cost;

        const tower = {
            ...towerType,
            row,
            col,
            x: this.cellCenter(row, col).x,
            y: this.cellCenter(row, col).y,
            lastAttackTime: 0,
            triggered: false,
        };

        this.towers.push(tower);
        console.log(`${tower.name} установлена на [${row}, ${col}]`);
    }

    updateTowers(timestamp) {
        if (this.state !== 'battle') return;

        for (const tower of this.towers) {
            // Ловушка
            if (tower.id === 'trap') {
                const enemy = this.enemies.find(e =>
                    e.isAlive &&
                    e.lane === tower.row &&
                    Math.abs(e.x - tower.x) < 30
                );
                if (enemy) {
                    this.damageEnemy(enemy, tower.damage);
                    this.spawnEffect(tower.x, tower.y, '#ff6600', 35);
                    tower.triggered = true;
                }
                continue;
            }

            // Подушка — пассивно замедляет
            if (tower.id === 'slow_pad') {
                for (const enemy of this.enemies) {
                    if (enemy.isAlive && enemy.lane === tower.row) {
                        enemy.slowTimer = tower.slowDuration;
                        enemy.slowPercent = tower.slowPercent;
                    }
                }
                continue;
            }

            // Стреляющие башни
            if (timestamp - tower.lastAttackTime < tower.cooldown * 1000) continue;

            const target = this.findTarget(tower);
            if (target) {
                tower.lastAttackTime = timestamp;
                this.projectiles.push({
                    x: tower.x,
                    y: tower.y,
                    target: target,
                    damage: tower.damage,
                    speed: tower.projectileSpeed,
                    color: tower.color,
                    isAlive: true,
                });
            }
        }

        // Убираем сработавшие ловушки
        this.towers = this.towers.filter(t => !t.triggered);
    }

    findTarget(tower) {
        let closest = null;
        let closestDist = Infinity;
        for (const enemy of this.enemies) {
            if (!enemy.isAlive || enemy.lane !== tower.row) continue;
            if (enemy.isDiving) continue;
            const dist = enemy.x - tower.x;
            if (dist > 0 && dist < tower.range && dist < closestDist) {
                closest = enemy;
                closestDist = dist;
            }
        }
        return closest;
    }

    // ============ ВРАГИ ============
    spawnEnemy(typeId, lane) {
        const type = CONFIG.ENEMIES[typeId];
        if (!type) return;

        this.enemies.push({
            ...type,
            lane,
            x: -30,
            y: this.laneY(lane),
            maxHealth: type.health,
            health: type.health,
            isAlive: true,
            isDiving: false,
            state: 'moving',
            slowPercent: 0,
            slowTimer: 0,
            lastAttackTime: 0,
            radius: type.id === 'divider' ? 25 : 22,
        });
    }

    updateEnemies(timestamp) {
        const dt = (timestamp - (this._lastEnemyUpdate || timestamp)) / 1000;
        this._lastEnemyUpdate = timestamp;

        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            // Замедление
            if (enemy.slowTimer > 0) {
                enemy.slowTimer -= dt;
                if (enemy.slowTimer <= 0) enemy.slowPercent = 0;
            }
            const speed = enemy.speed * (1 - enemy.slowPercent);

            // Движение
            if (enemy.state === 'moving') {
                enemy.x += speed * dt * 60;

                // Ныряльщик
                if (enemy.diveDistance && !enemy.isDiving && this.reactorX() - enemy.x < enemy.diveDistance) {
                    enemy.isDiving = true;
                    enemy.state = 'diving';
                    console.log(`${enemy.name} зарылся!`);
                    setTimeout(() => {
                        if (enemy.isAlive) {
                            enemy.x = this.reactorX() - 40;
                            enemy.isDiving = false;
                            enemy.state = 'attacking';
                            console.log(`${enemy.name} вынырнул!`);
                        }
                    }, 1500);
                }

                // Дошёл до реактора
                if (enemy.x >= this.reactorX()) {
                    enemy.state = 'attacking';
                }
            }

            // Атака реактора
            if (enemy.state === 'attacking') {
                // Гвоздемёт — атакует на расстоянии
                if (enemy.attackCooldown && this.reactorX() - enemy.x > enemy.range) {
                    enemy.x += speed * dt * 60;
                } else if (enemy.attackCooldown) {
                    if (timestamp - enemy.lastAttackTime >= enemy.attackCooldown * 1000) {
                        enemy.lastAttackTime = timestamp;
                        this.damageReactor(enemy.damage);
                        console.log(`${enemy.name} атакует реактор на расстоянии!`);
                    }
                } else {
                    // Обычная атака в упор
                    this.damageReactor(enemy.damage);
                    enemy.isAlive = false;
                    if (enemy.id === 'bomber') {
                        this.spawnEffect(enemy.x, enemy.y, '#ff4400', 45);
                    }
                }
            }
        }

        this.enemies = this.enemies.filter(e => e.isAlive);
    }

    damageEnemy(enemy, damage) {
        if (!enemy.isAlive || enemy.isDiving) return;

        // Броня
        if (enemy.armor > 0) {
            if (damage < 50) {
                console.log(`${enemy.name} блокирует урон!`);
                return;
            }
            enemy.armor--;
        }

        enemy.health -= damage;
        console.log(`${enemy.name}: -${damage} HP (${enemy.health}/${enemy.maxHealth})`);

        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        enemy.isAlive = false;
        this.energy = Math.min(this.energy + enemy.reward, CONFIG.ENERGY.MAX);
        this.spawnEffect(enemy.x, enemy.y, enemy.color, 30);

        // Делитель
        if (enemy.splitCount > 0) {
            for (let i = 0; i < enemy.splitCount; i++) {
                const mini = {
                    name: 'Осколок',
                    icon: '🔹',
                    health: 30,
                    maxHealth: 30,
                    speed: enemy.speed * 1.5,
                    damage: 5,
                    color: '#cc88ff',
                    reward: 5,
                    lane: enemy.lane,
                    x: enemy.x + (Math.random() - 0.5) * 40,
                    y: enemy.y + (Math.random() - 0.5) * 40,
                    isAlive: true,
                    isDiving: false,
                    state: 'moving',
                    slowPercent: 0,
                    slowTimer: 0,
                    lastAttackTime: 0,
                    radius: 14,
                };
                this.enemies.push(mini);
            }
            console.log(`${enemy.name} распался!`);
        }

        // Липучка
        if (enemy.id === 'sticky') {
            for (const e of this.enemies) {
                if (e.isAlive && e.lane === enemy.lane) {
                    e.slowPercent = 0.5;
                    e.slowTimer = 3;
                }
            }
            console.log('Липкий след!');
        }
    }

    damageReactor(amount) {
        this.reactorHealth -= amount;
        if (this.reactorHealth <= 0) {
            this.reactorHealth = 0;
            this.onLose();
        }
    }

    // ============ СНАРЯДЫ ============
    updateProjectiles(timestamp) {
        const dt = (timestamp - (this._lastProjUpdate || timestamp)) / 1000;
        this._lastProjUpdate = timestamp;

        for (const proj of this.projectiles) {
            if (!proj.target.isAlive) {
                proj.isAlive = false;
                continue;
            }

            const dx = proj.target.x - proj.x;
            const dy = proj.target.y - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 12) {
                this.damageEnemy(proj.target, proj.damage);
                proj.isAlive = false;
            } else {
                const move = proj.speed * dt * 60 / dist;
                proj.x += dx * move;
                proj.y += dy * move;
            }
        }

        this.projectiles = this.projectiles.filter(p => p.isAlive);
    }

    // ============ ЭФФЕКТЫ ============
    spawnEffect(x, y, color, radius) {
        this.effects.push({
            x, y, color, radius,
            alpha: 0.8,
            isAlive: true,
        });
    }

    updateEffects() {
        for (const effect of this.effects) {
            effect.alpha -= 0.03;
            effect.radius -= 0.5;
            if (effect.alpha <= 0) effect.isAlive = false;
        }
        this.effects = this.effects.filter(e => e.isAlive);
    }

    // ============ ВОЛНЫ ============
    currentAct() {
        return CONFIG.ACTS[this.currentActIndex];
    }

    startWave() {
        if (this.state !== 'prepare') return;
        if (this.allWavesDone) return;

        const wave = this.currentAct().waves[this.currentWaveIndex];
        if (!wave) return;

        this.state = 'battle';
        this.spawnQueue = [];

        for (let i = 0; i < wave.count; i++) {
            const lane = wave.lane === -1
                ? Math.floor(Math.random() * CONFIG.GRID.ROWS)
                : wave.lane;
            this.spawnQueue.push({ enemy: wave.enemy, lane });
        }

        this.isSpawning = true;
        this.lastSpawnTime = 0;
        console.log(`Волна ${this.currentWaveIndex + 1} началась! Врагов: ${wave.count}`);
        this.updateHUD();
    }

    updateWaves(timestamp) {
        if (this.state !== 'battle') return;

        // Спавн
        if (this.isSpawning && this.spawnQueue.length > 0) {
            if (timestamp - this.lastSpawnTime >= CONFIG.WAVES.SPAWN_INTERVAL * 1000) {
                this.lastSpawnTime = timestamp;
                const data = this.spawnQueue.shift();
                this.spawnEnemy(data.enemy, data.lane);
            }
        }

        // Проверка завершения волны
        if (this.isSpawning && this.spawnQueue.length === 0 && this.enemies.length === 0) {
            this.isSpawning = false;
            this.currentWaveIndex++;

            if (this.currentWaveIndex >= this.currentAct().waves.length) {
                this.allWavesDone = true;
                this.state = 'prepare';
                this.updateHUD();
                this.showWinScreen();
            } else {
                this.state = 'prepare';
                this.updateHUD();
                console.log('Волна отбита!');
            }
        }
    }

    // ============ АКТЫ ============
    startAct(index) {
        this.currentActIndex = index;
        this.currentWaveIndex = 0;
        this.allWavesDone = false;
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.state = 'prepare';
        this.updateHUD();
        this.showCutscene(index);
    }

    nextAct() {
        if (this.currentActIndex + 1 < CONFIG.ACTS.length) {
            this.startAct(this.currentActIndex + 1);
        } else {
            console.log('Все акты пройдены!');
        }
    }

    // ============ ОВЕРЛЕИ ============
    showCutscene(actIndex) {
        const cutscene = CONFIG.CUTSCENES[actIndex];
        if (!cutscene) return;

        this.state = 'dialogue';
        this.updateHUD();

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="icon">${cutscene.icon}</div>
            <div class="title">${cutscene.title}</div>
            <div id="cutsceneLine" class="speaker">${cutscene.lines[0].speaker}</div>
            <div id="cutsceneText" class="text">${cutscene.lines[0].text}</div>
            <div class="hint">Кликните для продолжения (${cutscene.lines.length} строк)</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);

        let lineIndex = 0;
        overlay.addEventListener('click', () => {
            lineIndex++;
            if (lineIndex < cutscene.lines.length) {
                document.getElementById('cutsceneLine').textContent = cutscene.lines[lineIndex].speaker;
                document.getElementById('cutsceneText').textContent = cutscene.lines[lineIndex].text;
            } else {
                overlay.remove();
                this.state = 'prepare';
                this.updateHUD();
            }
        });
    }

    showWinScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="icon">🏆</div>
            <div class="title" style="color: #00ff96;">АКТ ${this.currentAct().id} ПРОЙДЕН</div>
            <div class="text">Отличная работа! Братья продолжают борьбу.</div>
            <div class="hint">Кликните для следующего акта</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);
        overlay.addEventListener('click', () => {
            overlay.remove();
            this.nextAct();
        });
    }

    showLoseScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="icon">💀</div>
            <div class="title" style="color: #ff0000;">РЕАКТОР УНИЧТОЖЕН</div>
            <div class="text">Ферроиды прорвали оборону.</div>
            <div class="hint">Нажмите R для перезапуска</div>
        `;
        document.getElementById('gameContainer').appendChild(overlay);
    }

    onLose() {
        this.state = 'lose';
        this.updateHUD();
        this.showLoseScreen();
    }

    // ============ РЕГЕНЕРАЦИЯ ЭНЕРГИИ ============
    updateEnergy(timestamp) {
        if (timestamp - this.lastRegenTime >= 1000) {
            this.lastRegenTime = timestamp;
            this.energy = Math.min(this.energy + CONFIG.ENERGY.REGEN_PER_SECOND, CONFIG.ENERGY.MAX);
        }
    }

    // ============ ОТРИСОВКА ============
    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        // Фон
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, W, H);

        // Заголовок
        ctx.fillStyle = '#00ff96';
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('FERROID DEFENSE', W / 2, 32);

        // Зона спавна
        ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
        ctx.fillRect(0, CONFIG.GRID.OFFSET_Y, CONFIG.GRID.OFFSET_X - 20, CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE);
        ctx.fillStyle = '#ff4444';
        ctx.font = '14px Courier New';
        ctx.fillText('СПАВН', (CONFIG.GRID.OFFSET_X - 20) / 2, CONFIG.GRID.OFFSET_Y + CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE / 2);

        // Зона реактора
        const rx = CONFIG.GRID.OFFSET_X + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE + 10;
        const rw = CONFIG.GRID.OFFSET_X - 20;
        ctx.fillStyle = 'rgba(0, 255, 150, 0.08)';
        ctx.fillRect(rx, CONFIG.GRID.OFFSET_Y, rw, CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE);
        ctx.fillStyle = '#00ff96';
        ctx.fillText('РЕАКТОР', rx + rw / 2, CONFIG.GRID.OFFSET_Y + CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE / 2);

        // Сетка
        for (let row = 0; row < CONFIG.GRID.ROWS; row++) {
            for (let col = 0; col < CONFIG.GRID.COLS; col++) {
                const x = CONFIG.GRID.OFFSET_X + col * CONFIG.GRID.CELL_SIZE;
                const y = CONFIG.GRID.OFFSET_Y + row * CONFIG.GRID.CELL_SIZE;
                ctx.fillStyle = (row + col) % 2 === 0 ? '#2d2d2d' : '#282828';
                ctx.fillRect(x, y, CONFIG.GRID.CELL_SIZE - 2, CONFIG.GRID.CELL_SIZE - 2);
            }
        }

        // Башни
        for (const tower of this.towers) {
            ctx.fillStyle = tower.color;
            ctx.beginPath();
            ctx.arc(tower.x, tower.y, CONFIG.GRID.CELL_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tower.icon, tower.x, tower.y + 2);
        }

        // Враги
        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;
            ctx.globalAlpha = enemy.isDiving ? 0.3 : 1;
            ctx.fillStyle = enemy.color;
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = `${enemy.radius}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(enemy.icon, enemy.x, enemy.y + 2);
            ctx.globalAlpha = 1;

            // HP бар
            const hpW = enemy.radius * 2;
            const hpX = enemy.x - hpW / 2;
            const hpY = enemy.y - enemy.radius - 12;
            ctx.fillStyle = '#333';
            ctx.fillRect(hpX, hpY, hpW, 5);
            ctx.fillStyle = enemy.health / enemy.maxHealth > 0.5 ? '#0f0' : enemy.health / enemy.maxHealth > 0.25 ? '#fc0' : '#f00';
            ctx.fillRect(hpX, hpY, hpW * (enemy.health / enemy.maxHealth), 5);
        }

        // Снаряды
        for (const proj of this.projectiles) {
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Эффекты
        for (const effect of this.effects) {
            ctx.globalAlpha = effect.alpha;
            ctx.fillStyle = effect.color;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }

    // ============ ГЛАВНЫЙ ЦИКЛ ============
    loop(timestamp) {
        this.updateEnergy(timestamp);
        this.updateWaves(timestamp);
        this.updateEnemies(timestamp);
        this.updateTowers(timestamp);
        this.updateProjectiles(timestamp);
        this.updateEffects();
        this.draw();
        this.updateHUD();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    start() {
        this.startAct(0);
        requestAnimationFrame((ts) => this.loop(ts));
    }
}

// ============ ЗАПУСК ============
const game = new Game();
game.start();
