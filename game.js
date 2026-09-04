// ============================================
// FERROID DEFENSE — ИГРОВАЯ ЛОГИКА
// ============================================

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1200;
        this.canvas.height = 700;

        this.state = 'menu'; // menu | prepare | battle | dialogue | win | lose | shop | research | capture
        this.energy = CONFIG.ENERGY.START;
        this.reactorHealth = CONFIG.REACTOR.MAX_HEALTH;
        this.money = CONFIG.MONEY.START;
        this.currentActIndex = 0;
        this.currentWaveIndex = 0;
        this.selectedBallType = null;
        this.selectedModuleType = null;
        this.lastRegenTime = 0;
        this.lastSpawnTime = 0;
        this.spawnQueue = [];
        this.isSpawning = false;
        this.allWavesDone = false;
        this.lastBallThrowTime = 0;
        this.ballCooldown = 0.5; // Базовая перезарядка в секундах
        this.chargedBallPower = 1;
        this.isCharging = false;
        this.chargeStartTime = 0;
        this.mouseX = 0;
        this.mouseY = 0;
        this.comboBalls = []; // Для комбинирования шаров

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.particles = [];
        this.capturedEnemies = [];
        this.researchingEnemies = [];

        // Прогресс и статистика
        this.progress = this.loadProgress();
        this.stats = this.loadStats();
        this.achievements = this.loadAchievements();
        this.upgrades = this.loadUpgrades();
        this.research = this.loadResearch();

        // Применяем улучшения
        this.applyUpgrades();
        this.applyResearch();

        this.ui = new UI(this);
        this.setupEvents();
        this.setupTooltips();

        console.log('✅ Ferroid Defense запущен');
        this.showMainMenu();
    }

    // ============ ЗАГРУЗКА/СОХРАНЕНИЕ ============
    loadProgress() {
        const saved = localStorage.getItem('ferroid_progress');
        return saved ? JSON.parse(saved) : {
            unlockedActs: [0],
            completedActs: [],
            stars: {},
        };
    }

    loadStats() {
        const saved = localStorage.getItem('ferroid_stats');
        return saved ? JSON.parse(saved) : {
            kills: 0,
            modulesBuilt: 0,
            maxEnergy: 0,
            perfectActs: 0,
            totalWavesCompleted: 0,
            captured: 0,
            researched: 0,
            totalMoney: 0,
        };
    }

    loadAchievements() {
        const saved = localStorage.getItem('ferroid_achievements');
        return saved ? JSON.parse(saved) : [];
    }

    loadUpgrades() {
        const saved = localStorage.getItem('ferroid_upgrades');
        return saved ? JSON.parse(saved) : [];
    }

    loadResearch() {
        const saved = localStorage.getItem('ferroid_research');
        return saved ? JSON.parse(saved) : [];
    }

    saveProgress() {
        localStorage.setItem('ferroid_progress', JSON.stringify(this.progress));
        localStorage.setItem('ferroid_stats', JSON.stringify(this.stats));
        localStorage.setItem('ferroid_achievements', JSON.stringify(this.achievements));
        localStorage.setItem('ferroid_upgrades', JSON.stringify(this.upgrades));
        localStorage.setItem('ferroid_research', JSON.stringify(this.research));
    }

    applyUpgrades() {
        this.ballDamageMultiplier = 1;
        this.reloadSpeedMultiplier = 1;
        this.energyRegenMultiplier = 1;
        this.reactorHealthBonus = 0;
        this.moneyMultiplier = 1;

        for (const upgradeId of this.upgrades) {
            const upgrade = CONFIG.UPGRADES.find(u => u.id === upgradeId);
            if (upgrade && upgrade.effect) {
                if (upgrade.effect.ballDamageMultiplier) {
                    this.ballDamageMultiplier = upgrade.effect.ballDamageMultiplier;
                }
                if (upgrade.effect.reloadSpeedMultiplier) {
                    this.reloadSpeedMultiplier = upgrade.effect.reloadSpeedMultiplier;
                }
                if (upgrade.effect.energyRegenMultiplier) {
                    this.energyRegenMultiplier = upgrade.effect.energyRegenMultiplier;
                }
                if (upgrade.effect.reactorHealthBonus) {
                    this.reactorHealthBonus = Math.max(this.reactorHealthBonus, upgrade.effect.reactorHealthBonus);
                }
                if (upgrade.effect.moneyMultiplier) {
                    this.moneyMultiplier = upgrade.effect.moneyMultiplier;
                }
            }
        }

        this.reactorHealth = CONFIG.REACTOR.MAX_HEALTH + this.reactorHealthBonus;
    }

    applyResearch() {
        this.researchEffects = {
            fireDamageBonus: 0,
            iceSlowBonus: 0,
            electricChainBonus: 0,
            explosiveRadiusBonus: 0,
            acidArmorPierce: 0,
            moduleCostReduction: 0,
            energyRegenBonus: 0,
            reactorHealthBonus: 0,
        };

        for (const researchId of this.research) {
            const item = CONFIG.RESEARCH.find(r => r.id === researchId);
            if (item && item.effect) {
                Object.assign(this.researchEffects, item.effect);
            }
        }

        // Применяем бонусы к реактору
        if (this.researchEffects.reactorHealthBonus > 0) {
            this.reactorHealth = CONFIG.REACTOR.MAX_HEALTH + this.reactorHealthBonus + this.researchEffects.reactorHealthBonus;
        }
    }

    unlockNextAct() {
        const nextAct = this.currentActIndex + 1;
        if (nextAct < CONFIG.ACTS.length && !this.progress.unlockedActs.includes(nextAct)) {
            this.progress.unlockedActs.push(nextAct);
            this.saveProgress();
        }
    }

    completeAct(stars = 3) {
        if (!this.progress.completedActs.includes(this.currentActIndex)) {
            this.progress.completedActs.push(this.currentActIndex);
            this.progress.stars[this.currentActIndex] = stars;
            
            if (this.reactorHealth === CONFIG.REACTOR.MAX_HEALTH + this.reactorHealthBonus) {
                this.stats.perfectActs++;
            }
            
            // Бонус за прохождение
            const bonus = 100 + this.currentActIndex * 50;
            this.money += bonus;
            this.stats.totalMoney += bonus;
            
            this.unlockNextAct();
            this.saveProgress();
        }
    }

    checkAchievements() {
        for (const achievement of CONFIG.ACHIEVEMENTS) {
            if (!this.achievements.includes(achievement.id) && achievement.condition(this.stats)) {
                this.achievements.push(achievement.id);
                this.ui.showAchievementUnlocked(achievement);
            }
        }
        this.saveProgress();
    }

    // ============ МЕНЮ ============
    showMainMenu() {
        this.state = 'menu';
        this.ui.showMainMenu();
    }

    selectAct(index) {
        if (this.progress.unlockedActs.includes(index)) {
            this.startAct(index);
        }
    }

    showShop() {
        if (this.state === 'prepare' || this.state === 'menu') {
            this.state = 'shop';
            this.ui.showShop();
        }
    }

    showResearch() {
        if (this.state === 'prepare' || this.state === 'menu') {
            this.state = 'research';
            this.ui.showResearch();
        }
    }

    showCapture() {
        if (this.state === 'prepare' || this.state === 'menu') {
            this.state = 'capture';
            this.ui.showCapture();
        }
    }

    buyUpgrade(upgradeId) {
        const upgrade = CONFIG.UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade || this.upgrades.includes(upgradeId)) return;
        
        if (this.money >= upgrade.cost) {
            this.money -= upgrade.cost;
            this.upgrades.push(upgradeId);
            this.applyUpgrades();
            this.saveProgress();
            this.ui.showShop();
        }
    }

    buyResearch(researchId) {
        const item = CONFIG.RESEARCH.find(r => r.id === researchId);
        if (!item || this.research.includes(researchId)) return;
        
        if (this.stats.researched >= item.cost) {
            this.stats.researched -= item.cost;
            this.research.push(researchId);
            this.applyResearch();
            this.saveProgress();
            this.ui.showResearch();
        }
    }

    // ============ СОБЫТИЯ ============
    setupEvents() {
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    setupTooltips() {
        // Настройка подсказок
        document.querySelectorAll('[title]').forEach(el => {
            el.addEventListener('mouseenter', (e) => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = el.title;
                tooltip.style.left = e.clientX + 10 + 'px';
                tooltip.style.top = e.clientY + 10 + 'px';
                document.body.appendChild(tooltip);
                el._tooltip = tooltip;
            });
            
            el.addEventListener('mouseleave', () => {
                if (el._tooltip) {
                    el._tooltip.remove();
                    el._tooltip = null;
                }
            });
        });
    }

    onCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cell = this.pixelToCell(x, y);

        if (this.state === 'battle' && this.selectedBallType) {
            this.throwBall(x, y);
        } else if (cell && this.selectedModuleType && this.state === 'prepare') {
            this.placeModule(cell.row, cell.col);
        }
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        if (this.state === 'battle' && this.selectedBallType) {
            this.isCharging = true;
            this.chargeStartTime = Date.now();
            this.chargedBallPower = 1;
        }
    }

    onMouseUp(e) {
        if (this.isCharging) {
            const chargeTime = (Date.now() - this.chargeStartTime) / 1000;
            this.chargedBallPower = Math.min(1 + chargeTime * 2, 3); // Максимум x3 урона
            this.isCharging = false;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.state === 'battle' && this.selectedBallType) {
                this.throwBall(x, y, this.chargedBallPower);
            }
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;
        
        // Обновляем прицел
        if (this.state === 'battle' && this.selectedBallType) {
            this.drawAim = true;
        }
    }

    onKeyDown(e) {
        if (this.state === 'menu') {
            if (e.key === 'Escape') {
                this.ui.hideMainMenu();
            }
            return;
        }

        const ball = CONFIG.BALLS.find(b => b.key === e.key);
        if (ball) {
            this.selectedBallType = ball;
            this.ui.updateBallButtons();
        }
        
        if (e.key === ' ') {
            e.preventDefault();
            this.startWave();
        }
        if (e.key === 'r' && this.state === 'lose') {
            location.reload();
        }
        if (e.key === 'Escape') {
            this.selectedBallType = null;
            this.selectedModuleType = null;
            this.ui.updateBallButtons();
            this.ui.updateModuleButtons();
        }
        if (e.key === 'm' && this.state !== 'battle') {
            this.showMainMenu();
        }
        if (e.key === 's' && (this.state === 'prepare' || this.state === 'menu')) {
            this.showShop();
        }
        if (e.key === 't' && (this.state === 'prepare' || this.state === 'menu')) {
            this.showResearch();
        }
    }

    // ============ ГЕЙМПЛЕЙ ============
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

    placeModule(row, col) {
        const moduleType = this.selectedModuleType;
        if (!moduleType) return;
        
        const actualCost = Math.round(moduleType.cost * (1 - this.researchEffects.moduleCostReduction / 100));
        if (this.energy < actualCost) return;
        if (this.towers.some(t => t.row === row && t.col === col)) return;

        this.energy -= actualCost;
        this.stats.modulesBuilt++;

        this.towers.push({
            ...moduleType,
            row,
            col,
            x: this.cellCenter(row, col).x,
            y: this.cellCenter(row, col).y,
            lastAttackTime: 0,
            triggered: false,
        });

        this.checkAchievements();
    }

    throwBall(targetX, targetY, power = 1) {
        if (this.state !== 'battle' || !this.selectedBallType) return;
        if (Date.now() - this.lastBallThrowTime < this.ballCooldown / this.reloadSpeedMultiplier * 1000) return;
        
        const ball = this.selectedBallType;
        const cost = Math.round(ball.cost * power);
        if (this.energy < cost) return;
        
        this.energy -= cost;
        this.lastBallThrowTime = Date.now();
        
        // Создаем снаряд
        const projectile = {
            x: this.mouseX,
            y: this.mouseY,
            targetX,
            targetY,
            damage: Math.round(ball.damage * this.ballDamageMultiplier * power),
            speed: ball.speed,
            color: ball.color,
            radius: ball.radius,
            ballType: ball,
            power,
            isAlive: true,
            trail: [],
        };
        
        this.projectiles.push(projectile);
        
        // Эффект запуска
        this.spawnEffect(this.mouseX, this.mouseY, ball.color, 20);
    }

    spawnEnemy(typeId, lane) {
        let type = CONFIG.ENEMIES[typeId];
        if (!type) return;
        
        // Применяем бонусы исследования к врагам
        const researchMultiplier = this.getEnemyResearchMultiplier(typeId);
        
        const enemy = {
            ...type,
            lane,
            x: -30,
            y: this.laneY(lane),
            maxHealth: Math.round(type.health * researchMultiplier),
            health: Math.round(type.health * researchMultiplier),
            isAlive: true,
            isDiving: false,
            state: 'moving',
            slowPercent: 0,
            slowTimer: 0,
            lastAttackTime: 0,
            radius: 22,
            burnTimer: 0,
            burnDamage: 0,
            corrodeTimer: 0,
            corrodeDamage: 0,
        };
        
        this.enemies.push(enemy);
    }

    getEnemyResearchMultiplier(enemyType) {
        // Если враг изучен, он слабее
        if (this.research.includes(`enemy_${enemyType}`)) {
            return 0.7; // -30% здоровья
        }
        return 1;
    }

    getEnemyDamageMultiplier(enemyType) {
        // Если враг изучен, наносим больше урона
        if (this.research.includes(`enemy_${enemyType}`)) {
            return CONFIG.ENEMIES[enemyType].researchBonus.damageMultiplier || 1.5;
        }
        return 1;
    }

    updateTowers(timestamp) {
        if (this.state !== 'battle') return;

        for (const tower of this.towers) {
            if (tower.id === 'trap') {
                const enemy = this.enemies.find(e =>
                    e.isAlive && e.lane === tower.row && Math.abs(e.x - tower.x) < 30
                );
                if (enemy) {
                    this.damageEnemy(enemy, tower.damage);
                    this.spawnEffect(tower.x, tower.y, '#ff6600', 35);
                    tower.triggered = true;
                }
                continue;
            }

            if (tower.id === 'pad') {
                for (const enemy of this.enemies) {
                    if (enemy.isAlive && enemy.lane === tower.row) {
                        enemy.slowTimer = tower.slowDuration;
                        enemy.slowPercent = tower.slowPercent + this.researchEffects.iceSlowBonus / 100;
                    }
                }
                continue;
            }

            if (tower.id === 'generator') {
                this.energy = Math.min(this.energy + tower.energyPerSecond * (this.energyRegenMultiplier + this.researchEffects.energyRegenBonus / CONFIG.ENERGY.REGEN_PER_SECOND), CONFIG.ENERGY.MAX);
                continue;
            }

            if (tower.id === 'magnet') {
                for (const enemy of this.enemies) {
                    if (enemy.isAlive && Math.abs(enemy.x - tower.x) < tower.attractRadius) {
                        enemy.x += (tower.x - enemy.x) * 0.01 * tower.attractForce / 100;
                    }
                }
                continue;
            }

            if (tower.id === 'amplifier') {
                // Усилитель увеличивает урон шаров рядом
                for (const proj of this.projectiles) {
                    if (proj.isAlive && Math.abs(proj.x - tower.x) < tower.radius) {
                        proj.damage = Math.round(proj.damage * tower.damageMultiplier);
                    }
                }
                continue;
            }
        }

        this.towers = this.towers.filter(t => !t.triggered);
    }

    updateEnemies(timestamp) {
        const dt = (timestamp - (this._lastEnemyUpdate || timestamp)) / 1000;
        this._lastEnemyUpdate = timestamp;

        for (const enemy of this.enemies) {
            if (!enemy.isAlive) continue;

            // Обработка горения
            if (enemy.burnTimer > 0) {
                enemy.burnTimer -= dt;
                enemy.health -= enemy.burnDamage * dt;
                if (enemy.health <= 0) {
                    this.killEnemy(enemy);
                    continue;
                }
            }

            // Обработка коррозии
            if (enemy.corrodeTimer > 0) {
                enemy.corrodeTimer -= dt;
                enemy.health -= enemy.corrodeDamage * dt;
                if (enemy.health <= 0) {
                    this.killEnemy(enemy);
                    continue;
                }
            }

            if (enemy.slowTimer > 0) {
                enemy.slowTimer -= dt;
                if (enemy.slowTimer <= 0) enemy.slowPercent = 0;
            }
            const speed = enemy.speed * (1 - enemy.slowPercent);

            if (enemy.state === 'moving') {
                enemy.x += speed * dt * 60;

                if (enemy.diveDistance && !enemy.isDiving && this.reactorX() - enemy.x < enemy.diveDistance) {
                    enemy.isDiving = true;
                    enemy.state = 'diving';
                    setTimeout(() => {
                        if (enemy.isAlive) {
                            enemy.x = this.reactorX() - 40;
                            enemy.isDiving = false;
                            enemy.state = 'attacking';
                        }
                    }, 1500);
                }

                if (enemy.x >= this.reactorX()) {
                    enemy.state = 'attacking';
                }
            }

            if (enemy.state === 'attacking') {
                if (enemy.attackCooldown && this.reactorX() - enemy.x > enemy.range) {
                    enemy.x += speed * dt * 60;
                } else if (enemy.attackCooldown) {
                    if (timestamp - enemy.lastAttackTime >= enemy.attackCooldown * 1000) {
                        enemy.lastAttackTime = timestamp;
                        this.damageReactor(enemy.damage);
                    }
                } else {
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

    damageEnemy(enemy, damage, ballType = null) {
        if (!enemy.isAlive || enemy.isDiving) return;

        // Применяем бонус исследования
        damage = Math.round(damage * this.getEnemyDamageMultiplier(enemy.id));

        // Проверяем броню
        if (enemy.armor > 0) {
            if (damage < 50 && !ballType?.effects?.includes('corrode')) {
                return; // Слабый удар не пробивает броню
            }
            enemy.armor--;
        }

        enemy.health -= damage;

        // Применяем эффекты
        if (ballType?.effects?.includes('burn')) {
            enemy.burnTimer = 3;
            enemy.burnDamage = 5 + this.researchEffects.fireDamageBonus / 10;
        }
        
        if (ballType?.effects?.includes('slow')) {
            enemy.slowTimer = 3;
            enemy.slowPercent = Math.min(0.8, 0.4 + this.researchEffects.iceSlowBonus / 100);
        }
        
        if (ballType?.effects?.includes('corrode')) {
            enemy.corrodeTimer = 2;
            enemy.corrodeDamage = 10;
            if (enemy.armor > 0) enemy.armor = 0; // Кислота разрушает броню
        }

        if (ballType?.effects?.includes('capture') && enemy.health <= enemy.maxHealth * 0.3) {
            this.captureEnemy(enemy);
            return;
        }

        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    captureEnemy(enemy) {
        if (this.capturedEnemies.length >= 5) {
            this.spawnEffect(enemy.x, enemy.y, '#ffffff', 30);
            this.ui.showNotification('Комната плена заполнена!', '⚠️');
            return;
        }
        
        enemy.isAlive = false;
        this.stats.captured++;
        this.capturedEnemies.push({
            ...enemy,
            isBeingResearched: false,
            researchProgress: 0,
        });
        
        this.spawnEffect(enemy.x, enemy.y, '#00ff00', 40);
        this.ui.showNotification(`${enemy.name} захвачен!`, '🕸️');
        this.checkAchievements();
    }

    killEnemy(enemy) {
        enemy.isAlive = false;
        const reward = Math.round(enemy.reward * this.moneyMultiplier);
        this.money += reward;
        this.stats.totalMoney += reward;
        this.energy = Math.min(this.energy + enemy.reward, CONFIG.ENERGY.MAX);
        this.stats.kills++;
        this.stats.maxEnergy = Math.max(this.stats.maxEnergy, this.energy);
        this.spawnEffect(enemy.x, enemy.y, enemy.color, 30);

        if (enemy.splitCount > 0) {
            for (let i = 0; i < enemy.splitCount; i++) {
                this.enemies.push({
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
                    armor: 0,
                });
            }
        }

        if (enemy.id === 'sticky') {
            for (const e of this.enemies) {
                if (e.isAlive && e.lane === enemy.lane) {
                    e.slowPercent = 0.5;
                    e.slowTimer = 3;
                }
            }
        }

        this.checkAchievements();
    }

    damageReactor(amount) {
        this.reactorHealth -= amount;
        if (this.reactorHealth <= 0) {
            this.reactorHealth = 0;
            this.onLose();
        }
    }

    updateProjectiles(timestamp) {
        const dt = (timestamp - (this._lastProjUpdate || timestamp)) / 1000;
        this._lastProjUpdate = timestamp;

        for (const proj of this.projectiles) {
            if (!proj.isAlive) continue;

            const dx = proj.targetX - proj.x;
            const dy = proj.targetY - proj.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Сохраняем след
            proj.trail.push({ x: proj.x, y: proj.y });
            if (proj.trail.length > 10) proj.trail.shift();

            if (dist < 20) {
                this.onProjectileHit(proj);
                proj.isAlive = false;
            } else {
                const move = proj.speed * dt * 60 / dist;
                proj.x += dx * move;
                proj.y += dy * move;

                // Проверка столкновения с врагами
                for (const enemy of this.enemies) {
                    if (!enemy.isAlive) continue;
                    const enemyDist = Math.sqrt((enemy.x - proj.x) ** 2 + (enemy.y - proj.y) ** 2);
                    if (enemyDist < enemy.radius + proj.radius) {
                        this.onProjectileHit(proj, enemy);
                        proj.isAlive = false;
                        break;
                    }
                }
            }
        }

        this.projectiles = this.projectiles.filter(p => p.isAlive);
    }

    onProjectileHit(proj, enemy = null) {
        const ballType = proj.ballType;
        
        if (ballType.effects.includes('explosion') || ballType.effects.includes('ice_explosion')) {
            // Взрыв наносит урон по области
            const radius = proj.radius * (1 + this.researchEffects.explosiveRadiusBonus / 100) * 3;
            for (const e of this.enemies) {
                if (!e.isAlive) continue;
                const dist = Math.sqrt((e.x - proj.x) ** 2 + (e.y - proj.y) ** 2);
                if (dist < radius) {
                    this.damageEnemy(e, Math.round(proj.damage * 0.5), ballType);
                }
            }
            this.spawnEffect(proj.x, proj.y, proj.color, radius);
        } else if (enemy) {
            this.damageEnemy(enemy, proj.damage, ballType);
            this.spawnEffect(proj.x, proj.y, proj.color, 15);
        }
    }

    spawnEffect(x, y, color, radius) {
        this.effects.push({ x, y, color, radius, alpha: 0.8, isAlive: true });
    }

    updateEffects() {
        for (const effect of this.effects) {
            effect.alpha -= 0.03;
            effect.radius -= 0.5;
            if (effect.alpha <= 0) effect.isAlive = false;
        }
        this.effects = this.effects.filter(e => e.isAlive);
    }

    currentAct() {
        return CONFIG.ACTS[this.currentActIndex];
    }

    startWave() {
        if (this.state !== 'prepare' || this.allWavesDone) return;

        const wave = this.currentAct().waves[this.currentWaveIndex];
        if (!wave) return;

        this.state = 'battle';
        this.spawnQueue = [];

        for (const group of wave.enemies) {
            for (let i = 0; i < group.count; i++) {
                const lane = group.lane === -1
                    ? Math.floor(Math.random() * CONFIG.GRID.ROWS)
                    : group.lane;
                this.spawnQueue.push({ enemy: group.type, lane });
            }
        }

        this.isSpawning = true;
        this.lastSpawnTime = 0;
        this.ui.updateHUD();
    }

    updateWaves(timestamp) {
        if (this.state !== 'battle') return;

        if (this.isSpawning && this.spawnQueue.length > 0) {
            if (timestamp - this.lastSpawnTime >= CONFIG.WAVES.SPAWN_INTERVAL * 1000) {
                this.lastSpawnTime = timestamp;
                const data = this.spawnQueue.shift();
                this.spawnEnemy(data.enemy, data.lane);
            }
        }

        if (this.isSpawning && this.spawnQueue.length === 0 && this.enemies.length === 0) {
            this.isSpawning = false;
            this.currentWaveIndex++;
            this.stats.totalWavesCompleted++;

            if (this.currentWaveIndex >= this.currentAct().waves.length) {
                this.allWavesDone = true;
                this.state = 'prepare';
                
                const stars = this.calculateStars();
                this.completeAct(stars);
                
                this.ui.showWinScreen(this.currentAct().title, stars, () => {
                    this.showShop();
                });
            } else {
                this.state = 'prepare';
                this.ui.showNotification(`Волна ${this.currentWaveIndex} пройдена!`, '✅');
            }
        }
    }

    calculateStars() {
        const healthPercent = this.reactorHealth / (CONFIG.REACTOR.MAX_HEALTH + this.reactorHealthBonus);
        if (healthPercent === 1) return 3;
        if (healthPercent >= 0.5) return 2;
        return 1;
    }

    startAct(index) {
        this.currentActIndex = index;
        this.currentWaveIndex = 0;
        this.allWavesDone = false;
        this.enemies = [];
        this.projectiles = [];
        this.effects = [];
        this.towers = [];
        this.energy = CONFIG.ENERGY.START;
        this.reactorHealth = CONFIG.REACTOR.MAX_HEALTH + this.reactorHealthBonus;
        this.state = 'prepare';
        
        this.ui.hideMainMenu();
        this.ui.showCutscene(index, () => {
            this.state = 'prepare';
            this.ui.updateHUD();
        });
    }

    updateEnergy(timestamp) {
        if (this.state === 'battle' || this.state === 'prepare') {
            if (timestamp - this.lastRegenTime >= 1000) {
                this.lastRegenTime = timestamp;
                const regenAmount = CONFIG.ENERGY.REGEN_PER_SECOND * this.energyRegenMultiplier + this.researchEffects.energyRegenBonus;
                this.energy = Math.min(this.energy + regenAmount, CONFIG.ENERGY.MAX);
                this.stats.maxEnergy = Math.max(this.stats.maxEnergy, this.energy);
            }
        }
    }

    onLose() {
        this.state = 'lose';
        this.ui.showLoseScreen(() => {
            this.showMainMenu();
        });
    }

    // ============ ОТРИСОВКА ============
    draw() {
        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, W, H);

        ctx.fillStyle = '#00ff96';
        ctx.font = 'bold 28px Courier New';
        ctx.textAlign = 'center';
        ctx.fillText('FERROID DEFENSE', W / 2, 32);

        // Спавн зона
        ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
        ctx.fillRect(0, CONFIG.GRID.OFFSET_Y, CONFIG.GRID.OFFSET_X - 20, CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE);
        ctx.fillStyle = '#ff4444';
        ctx.font = '14px Courier New';
        ctx.fillText('СПАВН', (CONFIG.GRID.OFFSET_X - 20) / 2, CONFIG.GRID.OFFSET_Y + CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE / 2);

        // Реактор зона
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

        // Модули
        for (const module of this.towers) {
            ctx.fillStyle = module.color;
            ctx.beginPath();
            ctx.arc(module.x, module.y, CONFIG.GRID.CELL_SIZE / 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.font = '28px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(module.icon, module.x, module.y + 2);
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
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(enemy.icon, enemy.x, enemy.y + 2);
            ctx.globalAlpha = 1;

            // Эффект горения
            if (enemy.burnTimer > 0) {
                ctx.fillStyle = 'rgba(255, 100, 0, 0.5)';
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius * 0.8, 0, Math.PI * 2);
                ctx.fill();
            }

            // Эффект замедления
            if (enemy.slowPercent > 0) {
                ctx.strokeStyle = '#00ccff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius + 3, 0, Math.PI * 2);
                ctx.stroke();
            }

            // HP бар
            const hpW = enemy.radius * 2;
            const hpX = enemy.x - hpW / 2;
            const hpY = enemy.y - enemy.radius - 12;
            ctx.fillStyle = '#333';
            ctx.fillRect(hpX, hpY, hpW, 5);
            ctx.fillStyle = enemy.health / enemy.maxHealth > 0.5 ? '#0f0' : enemy.health / enemy.maxHealth > 0.25 ? '#fc0' : '#f00';
            ctx.fillRect(hpX, hpY, hpW * (enemy.health / enemy.maxHealth), 5);
        }

        // Снаряды (шары)
        for (const proj of this.projectiles) {
            // След
            for (let i = 0; i < proj.trail.length; i++) {
                const alpha = (i / proj.trail.length) * 0.5;
                ctx.fillStyle = proj.color;
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(proj.trail[i].x, proj.trail[i].y, proj.radius * (i / proj.trail.length), 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            
            // Сам шар
            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Эффект свечения
            ctx.shadowColor = proj.color;
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Прицел
        if (this.state === 'battle' && this.selectedBallType && this.drawAim) {
            ctx.strokeStyle = this.selectedBallType.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.mouseX, this.mouseY, 20 + this.chargedBallPower * 10, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.fillStyle = this.selectedBallType.color;
            ctx.font = '12px Arial';
            ctx.fillText(`${Math.round(this.selectedBallType.cost * this.chargedBallPower)}⚡`, this.mouseX, this.mouseY - 25);
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

    loop(timestamp) {
        this.updateEnergy(timestamp);
        this.updateWaves(timestamp);
        this.updateEnemies(timestamp);
        this.updateTowers(timestamp);
        this.updateProjectiles(timestamp);
        this.updateEffects();
        this.draw();
        this.ui.updateHUD();

        requestAnimationFrame((ts) => this.loop(ts));
    }

    start() {
        requestAnimationFrame((ts) => this.loop(ts));
    }
}

// ============ ЗАПУСК ============
const game = new Game();
game.start();
