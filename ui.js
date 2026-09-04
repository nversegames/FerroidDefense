// ============================================
// FERROID DEFENSE — ИНТЕРФЕЙС
// ============================================

class UI {
    constructor(game) {
        this.game = game;
        this.setupButtons();
        console.log('✅ UI готов');
    }

    setupButtons() {
        // Кнопки шаров
        document.querySelectorAll('.ball-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const ball = CONFIG.BALLS.find(b => b.id === btn.dataset.ball);
                if (ball) {
                    this.game.selectedBallType = ball;
                    this.updateBallButtons();
                }
            });
        });

        // Кнопки модулей
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const module = CONFIG.MODULES.find(m => m.id === btn.dataset.module);
                if (module) {
                    this.game.selectedModuleType = module;
                    this.updateModuleButtons();
                }
            });
        });

        // Кнопка волны
        const waveBtn = document.getElementById('startWaveBtn');
        waveBtn.addEventListener('click', () => {
            this.game.startWave();
        });

        // Кнопки меню
        document.getElementById('menuBtn').addEventListener('click', () => {
            this.game.showMainMenu();
        });

        document.getElementById('researchBtn').addEventListener('click', () => {
            this.game.showResearch();
        });

        document.getElementById('captureBtn').addEventListener('click', () => {
            this.game.showCapture();
        });

        document.getElementById('shopBtn').addEventListener('click', () => {
            this.game.showShop();
        });
    }

    updateBallButtons() {
        document.querySelectorAll('.ball-btn').forEach(btn => {
            const isSelected = this.game.selectedBallType && btn.dataset.ball === this.game.selectedBallType.id;
            btn.classList.toggle('selected', isSelected);
        });
    }

    updateModuleButtons() {
        document.querySelectorAll('.module-btn').forEach(btn => {
            const isSelected = this.game.selectedModuleType && btn.dataset.module === this.game.selectedModuleType.id;
            btn.classList.toggle('selected', isSelected);
        });
    }

    updateHUD() {
        document.getElementById('energyDisplay').textContent = `⚡ ${Math.floor(this.game.energy)}`;
        document.getElementById('reactorHealth').textContent = `❤️ ${this.game.reactorHealth}`;
        document.getElementById('moneyDisplay').textContent = `💰 ${this.game.money}`;
        
        if (this.game.currentAct()) {
            document.getElementById('waveInfo').textContent = `Волна: ${this.game.currentWaveIndex + 1}/${this.game.currentAct().waves.length}`;
        }

        const btn = document.getElementById('startWaveBtn');
        const state = this.game.state;

        if (state === 'prepare' && !this.game.allWavesDone) {
            btn.disabled = false;
            btn.textContent = '▶ НАЧАТЬ ВОЛНУ';
        } else if (state === 'battle') {
            btn.disabled = true;
            btn.textContent = '⚔️ ИДЁТ БОЙ...';
        } else if (state === 'dialogue') {
            btn.disabled = true;
            btn.textContent = '📖 КАТ-СЦЕНА...';
        } else if (this.game.allWavesDone) {
            btn.disabled = true;
            btn.textContent = '✅ АКТ ПРОЙДЕН';
        } else if (state === 'lose') {
            btn.disabled = true;
            btn.textContent = '💀 ПОРАЖЕНИЕ';
        } else if (state === 'menu') {
            btn.disabled = true;
            btn.textContent = '🏠 МЕНЮ';
        } else if (state === 'shop' || state === 'research' || state === 'capture') {
            btn.disabled = true;
            btn.textContent = '🛒 МАГАЗИН';
        }
    }

    showNotification(text, icon = 'ℹ️') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="font-size: 24px;">${icon}</div>
            <div style="color: #fff;">${text}</div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    // ============ ГЛАВНОЕ МЕНЮ ============
    showMainMenu() {
        const container = document.getElementById('gameContainer');
        
        // Удаляем старые меню
        const oldMenu = container.querySelector('.menu-container');
        if (oldMenu) oldMenu.remove();
        const oldShop = container.querySelector('.shop-container');
        if (oldShop) oldShop.remove();
        const oldResearch = container.querySelector('.research-container');
        if (oldResearch) oldResearch.remove();
        const oldCapture = container.querySelector('.capture-container');
        if (oldCapture) oldCapture.remove();

        const menu = document.createElement('div');
        menu.className = 'menu-container';
        
        let levelCards = '';
        CONFIG.ACTS.forEach((act, index) => {
            const isUnlocked = this.game.progress.unlockedActs.includes(index);
            const isCompleted = this.game.progress.completedActs.includes(index);
            const stars = this.game.progress.stars[index] || 0;
            
            levelCards += `
                <div class="level-card ${isUnlocked ? 'unlocked' : 'locked'} ${isCompleted ? 'completed' : ''}" 
                     data-act="${index}">
                    <div class="level-number">${index + 1}</div>
                    <div class="level-icon">${CONFIG.CUTSCENES[index].icon}</div>
                    <div class="level-name">${act.title}</div>
                    ${isCompleted ? `<div class="stars">${'⭐'.repeat(stars)}</div>` : ''}
                </div>
            `;
        });

        menu.innerHTML = `
            <div class="menu-content">
                <div class="menu-title">FERROID DEFENSE</div>
                <div class="menu-subtitle">Защита Башни от Ферроидов</div>
                
                <div class="level-grid">
                    ${levelCards}
                </div>
                
                <div style="margin-top: 20px; display: flex; gap: 10px;">
                    <button class="shop-button" onclick="game.showShop()">🛒 Магазин</button>
                    <button class="research-button" onclick="game.showResearch()">🔬 Исследования</button>
                    <button class="capture-button" onclick="game.showCapture()">🔒 Пленные</button>
                </div>
                
                <div style="margin-top: 20px; color: #aaa; font-size: 14px;">
                    Убийств: ${this.game.stats.kills} | Денег: ${this.game.money} | Волн: ${this.game.stats.totalWavesCompleted}
                </div>
            </div>
        `;

        container.appendChild(menu);

        // Привязываем события
        menu.querySelectorAll('.level-card.unlocked').forEach(card => {
            card.addEventListener('click', () => {
                const actIndex = parseInt(card.dataset.act);
                this.game.selectAct(actIndex);
            });
        });
    }

    hideMainMenu() {
        const menu = document.querySelector('.menu-container');
        if (menu) menu.remove();
        this.game.state = 'prepare';
        this.updateHUD();
    }

    // ============ МАГАЗИН ============
    showShop() {
        const container = document.getElementById('gameContainer');
        const oldShop = container.querySelector('.shop-container');
        if (oldShop) oldShop.remove();

        const shop = document.createElement('div');
        shop.className = 'shop-container';
        
        let upgradesHtml = '';
        CONFIG.UPGRADES.forEach(upgrade => {
            const isBought = this.game.upgrades.includes(upgrade.id);
            const canAfford = this.game.money >= upgrade.cost;
            
            upgradesHtml += `
                <div class="upgrade-item ${isBought ? 'bought' : ''}" data-upgrade="${upgrade.id}">
                    <div class="upgrade-icon">💪</div>
                    <div class="upgrade-info">
                        <div class="upgrade-name">${upgrade.name}</div>
                        <div class="upgrade-desc">${this.getUpgradeDescription(upgrade)}</div>
                    </div>
                    <div class="upgrade-cost ${isBought ? 'owned' : canAfford ? 'affordable' : 'expensive'}">
                        ${isBought ? '✓ Куплено' : `${upgrade.cost}💰`}
                    </div>
                </div>
            `;
        });

        shop.innerHTML = `
            <div class="shop-content">
                <div class="menu-title">🛒 МАГАЗИН</div>
                <div style="color: #ffd700; font-size: 24px; margin-bottom: 20px;">💰 ${this.game.money}</div>
                
                ${upgradesHtml}
                
                <button class="back-button" onclick="game.showMainMenu()">← Назад</button>
            </div>
        `;

        container.appendChild(shop);

        // Привязываем события
        shop.querySelectorAll('.upgrade-item:not(.bought)').forEach(item => {
            item.addEventListener('click', () => {
                const upgradeId = item.dataset.upgrade;
                this.game.buyUpgrade(upgradeId);
            });
        });
    }

    getUpgradeDescription(upgrade) {
        const effects = [];
        if (upgrade.effect.ballDamageMultiplier) effects.push(`Урон шаров x${upgrade.effect.ballDamageMultiplier}`);
        if (upgrade.effect.reloadSpeedMultiplier) effects.push(`Скорость перезарядки x${upgrade.effect.reloadSpeedMultiplier}`);
        if (upgrade.effect.energyRegenMultiplier) effects.push(`Генерация энергии x${upgrade.effect.energyRegenMultiplier}`);
        if (upgrade.effect.reactorHealthBonus) effects.push(`+${upgrade.effect.reactorHealthBonus} к здоровью реактора`);
        if (upgrade.effect.moneyMultiplier) effects.push(`Деньги x${upgrade.effect.moneyMultiplier}`);
        return effects.join(', ');
    }

    // ============ ИССЛЕДОВАНИЯ ============
    showResearch() {
        const container = document.getElementById('gameContainer');
        const oldResearch = container.querySelector('.research-container');
        if (oldResearch) oldResearch.remove();

        const research = document.createElement('div');
        research.className = 'research-container';
        
        let researchHtml = '';
        CONFIG.RESEARCH.forEach(item => {
            const isResearched = this.game.research.includes(item.id);
            const canAfford = this.game.stats.researched >= item.cost;
            
            researchHtml += `
                <div class="research-item ${isResearched ? 'researched' : ''}" data-research="${item.id}">
                    <div class="research-icon">🔬</div>
                    <div class="research-info">
                        <div class="research-name">${item.name}</div>
                        <div class="research-desc">${item.description}</div>
                    </div>
                    <div class="research-cost ${isResearched ? 'owned' : canAfford ? 'affordable' : 'expensive'}">
                        ${isResearched ? '✓ Изучено' : `${item.cost}💡`}
                    </div>
                </div>
            `;
        });

        // Исследования врагов
        const enemyResearchHtml = this.getEnemyResearchHtml();

        research.innerHTML = `
            <div class="research-content">
                <div class="menu-title">🔬 ИССЛЕДОВАНИЯ</div>
                <div style="color: #00ff96; font-size: 20px; margin-bottom: 20px;">Очки знаний: ${this.game.stats.researched}💡</div>
                
                <h3 style="color: #ffcc00; margin: 20px 0;">Базовые исследования</h3>
                ${researchHtml}
                
                <h3 style="color: #ffcc00; margin: 20px 0;">Исследования врагов</h3>
                ${enemyResearchHtml}
                
                <button class="back-button" onclick="game.showMainMenu()">← Назад</button>
            </div>
        `;

        container.appendChild(research);

        // Привязываем события
        research.querySelectorAll('.research-item:not(.researched)').forEach(item => {
            item.addEventListener('click', () => {
                const researchId = item.dataset.research;
                this.game.buyResearch(researchId);
            });
        });

        research.querySelectorAll('.enemy-research-item:not(.researched)').forEach(item => {
            item.addEventListener('click', () => {
                const enemyType = item.dataset.enemy;
                this.researchEnemy(enemyType);
            });
        });
    }

    getEnemyResearchHtml() {
        let html = '';
        
        // Проверяем, какие враги изучены
        Object.keys(CONFIG.ENEMIES).forEach(enemyType => {
            const enemy = CONFIG.ENEMIES[enemyType];
            const isResearched = this.game.research.includes(`enemy_${enemyType}`);
            const cost = 20 + Math.floor(Math.random() * 30);
            
            html += `
                <div class="research-item enemy-research-item ${isResearched ? 'researched' : ''}" data-enemy="${enemyType}">
                    <div class="research-icon">${enemy.icon}</div>
                    <div class="research-info">
                        <div class="research-name">${enemy.name}</div>
                        <div class="research-desc">${enemy.description}</div>
                    </div>
                    <div class="research-cost ${isResearched ? 'owned' : ''}">
                        ${isResearched ? '✓ Изучен' : `${cost}💡`}
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    researchEnemy(enemyType) {
        const cost = 20 + Math.floor(Math.random() * 30);
        if (this.game.stats.researched >= cost && !this.game.research.includes(`enemy_${enemyType}`)) {
            this.game.stats.researched -= cost;
            this.game.research.push(`enemy_${enemyType}`);
            this.game.saveProgress();
            this.showResearch();
        }
    }

    // ============ КОМНАТА ПЛЕННЫХ ============
    showCapture() {
        const container = document.getElementById('gameContainer');
        const oldCapture = container.querySelector('.capture-container');
        if (oldCapture) oldCapture.remove();

        const capture = document.createElement('div');
        capture.className = 'capture-container';
        
        let captivesHtml = '';
        if (this.game.capturedEnemies.length === 0) {
            captivesHtml = '<div style="color: #aaa; font-size: 18px;">Нет пленных врагов</div>';
        } else {
            this.game.capturedEnemies.forEach((enemy, index) => {
                const isBeingResearched = enemy.isBeingResearched;
                const progressPercent = Math.round(enemy.researchProgress * 100);
                
                captivesHtml += `
                    <div class="captive-item" data-captive="${index}">
                        <div class="captive-icon">${enemy.icon}</div>
                        <div class="captive-info">
                            <div class="captive-name">${enemy.name}</div>
                            <div class="captive-desc">
                                ${isBeingResearched ? 
                                    `Изучение: ${progressPercent}%` : 
                                    'Готов к изучению'}
                            </div>
                            ${isBeingResearched ? `
                                <div style="width: 100%; background: #333; border-radius: 5px; margin-top: 5px;">
                                    <div style="width: ${progressPercent}%; background: #00ff96; height: 10px; border-radius: 5px;"></div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="captive-status">
                            ${isBeingResearched ? 
                                '<span style="color: #ffcc00;">⏳</span>' : 
                                '<span style="color: #00ff96;">🔬 Начать</span>'}
                        </div>
                    </div>
                `;
            });
        }

        capture.innerHTML = `
            <div class="capture-content">
                <div class="menu-title">🔒 КОМНАТА ПЛЕННЫХ</div>
                <div style="color: #aaa; margin-bottom: 20px;">
                    Пленных: ${this.game.capturedEnemies.length}/5
                </div>
                
                ${captivesHtml}
                
                <button class="back-button" onclick="game.showMainMenu()">← Назад</button>
            </div>
        `;

        container.appendChild(capture);

        // Привязываем события
        capture.querySelectorAll('.captive-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.captive);
                this.startResearching(index);
            });
        });
    }

    startResearching(index) {
        const enemy = this.game.capturedEnemies[index];
        if (enemy && !enemy.isBeingResearched) {
            enemy.isBeingResearched = true;
            enemy.researchProgress = 0;
            
            // Симулируем изучение
            const researchInterval = setInterval(() => {
                enemy.researchProgress += 0.01;
                
                if (enemy.researchProgress >= 1) {
                    clearInterval(researchInterval);
                    enemy.isBeingResearched = false;
                    this.game.stats.researched += 10;
                    this.game.research.push(`enemy_${enemy.id}`);
                    this.game.saveProgress();
                    this.showCapture();
                }
            }, 100);
            
            this.showCapture();
        }
    }

    // ============ КАТ-СЦЕНЫ ============
    showCutscene(actIndex, onComplete) {
        const cutscene = CONFIG.CUTSCENES[actIndex];
        if (!cutscene) {
            if (onComplete) onComplete();
            return;
        }

        this.game.state = 'dialogue';
        this.updateHUD();

        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="icon">${cutscene.icon}</div>
            <div class="title">${cutscene.title}</div>
            <div class="speaker" id="lineSpeaker">${cutscene.lines[0].speaker}</div>
            <div class="text" id="lineText">${cutscene.lines[0].text}</div>
            <div class="hint">Кликните для продолжения (${cutscene.lines.length} строк)</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);

        let lineIndex = 0;

        overlay.addEventListener('click', () => {
            lineIndex++;

            if (lineIndex < cutscene.lines.length) {
                document.getElementById('lineSpeaker').textContent = cutscene.lines[lineIndex].speaker;
                document.getElementById('lineText').textContent = cutscene.lines[lineIndex].text;
            } else {
                overlay.remove();
                if (onComplete) onComplete();
            }
        });
    }

    // ============ ЭКРАН ПОБЕДЫ ============
    showWinScreen(actTitle, stars, onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="icon">🏆</div>
            <div class="title" style="color: #00ff96;">${actTitle} ПРОЙДЕН</div>
            <div class="text" style="font-size: 40px; margin: 20px 0;">
                ${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}
            </div>
            <div class="text">Отличная работа! Братья продолжают борьбу.</div>
            <div class="hint">Кликните для перехода в магазин</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);
        overlay.addEventListener('click', () => {
            overlay.remove();
            if (onComplete) onComplete();
        });
    }

    // ============ ЭКРАН ПОРАЖЕНИЯ ============
    showLoseScreen(onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        overlay.innerHTML = `
            <div class="icon">💀</div>
            <div class="title" style="color: #ff0000;">РЕАКТОР УНИЧТОЖЕН</div>
            <div class="text">Ферроиды прорвали оборону.</div>
            <div class="hint">Кликните для возврата в меню</div>
        `;
        document.getElementById('gameContainer').appendChild(overlay);
        overlay.addEventListener('click', () => {
            overlay.remove();
            if (onComplete) onComplete();
        });
    }

    // ============ ДОСТИЖЕНИЯ ============
    showAchievementUnlocked(achievement) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div style="font-size: 30px;">${achievement.icon}</div>
            <div>
                <div style="color: #ffcc00; font-weight: bold;">Достижение!</div>
                <div style="color: #fff;">${achievement.name}</div>
                <div style="color: #aaa; font-size: 12px;">${achievement.description}</div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.5s ease-in';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}
