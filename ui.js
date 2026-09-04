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
        // Кнопки башен
        document.querySelectorAll('.tower-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tower = CONFIG.TOWERS.find(t => t.id === btn.dataset.tower);
                if (tower) {
                    this.game.selectedTowerType = tower;
                    this.updateTowerButtons();
                }
            });
        });

        // Кнопка волны
        const waveBtn = document.getElementById('startWaveBtn');
        waveBtn.addEventListener('click', () => {
            this.game.startWave();
        });
    }

    updateTowerButtons() {
        document.querySelectorAll('.tower-btn').forEach(btn => {
            const isSelected = this.game.selectedTowerType && btn.dataset.tower === this.game.selectedTowerType.id;
            btn.classList.toggle('selected', isSelected);
        });
    }

    updateHUD() {
        document.getElementById('energyDisplay').textContent = `⚡ ${Math.floor(this.game.energy)}`;
        document.getElementById('reactorHealth').textContent = `❤️ ${this.game.reactorHealth}`;
        
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
        }
    }

    // ============ ГЛАВНОЕ МЕНЮ ============
    showMainMenu() {
        const container = document.getElementById('gameContainer');
        
        // Удаляем старое меню
        const oldMenu = container.querySelector('.menu-container');
        if (oldMenu) oldMenu.remove();

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
                
                <div style="margin-top: 20px;">
                    <div style="color: #aaa; font-size: 14px; margin-bottom: 10px;">
                        Убийств: ${this.game.stats.kills} | Башен: ${this.game.stats.towersBuilt} | Волн: ${this.game.stats.totalWavesCompleted}
                    </div>
                    <button class="back-button" onclick="game.showMainMenu()">Обновить меню</button>
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
            <div class="hint">Кликните для возврата в меню</div>
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
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2a2a2a;
            border: 3px solid #ffcc00;
            border-radius: 10px;
            padding: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.5s ease-out;
            box-shadow: 0 0 20px rgba(255, 204, 0, 0.5);
        `;

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
