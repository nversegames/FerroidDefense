// ui.js — интерфейс: кнопки, панели, диалоги

class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedTowerBtn = null;
        
        // Ждём загрузку DOM перед настройкой
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupAll();
            });
        } else {
            this.setupAll();
        }
    }

    setupAll() {
        console.log('🔧 Настройка UI...');
        this.setupTowerButtons();
        this.setupStartWaveButton();
        console.log('✅ UI настроен');
    }

    // Настройка кнопок выбора башен
    setupTowerButtons() {
        const buttons = document.querySelectorAll('.tower-btn');
        
        console.log(`Найдено кнопок башен: ${buttons.length}`);
        
        buttons.forEach(btn => {
            // Убираем старые обработчики
            const oldHandler = btn._clickHandler;
            if (oldHandler) {
                btn.removeEventListener('click', oldHandler);
            }
            
            // Создаём новый обработчик
            btn._clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const towerId = btn.dataset.tower;
                console.log(`Клик по башне: ${towerId}`);
                this.selectTower(towerId, btn);
            };
            
            btn.addEventListener('click', btn._clickHandler);
        });
    }

    // Выбор башни
    selectTower(towerId, btn) {
        // Снимаем выделение с предыдущей
        if (this.selectedTowerBtn) {
            this.selectedTowerBtn.classList.remove('selected');
        }

        // Выделяем новую
        btn.classList.add('selected');
        this.selectedTowerBtn = btn;

        // Передаём в игру
        const towerConfig = CONFIG.TOWERS[towerId.toUpperCase()];
        if (towerConfig) {
            this.game.selectedTower = towerConfig;
            console.log(`Выбрана башня: ${towerConfig.name} (${towerConfig.cost}⚡)`);
        }
    }

    // Настройка кнопки запуска волны
    setupStartWaveButton() {
        const btn = document.getElementById('startWaveBtn');
        
        if (!btn) {
            console.error('❌ Кнопка startWaveBtn не найдена!');
            return;
        }
        
        console.log('✅ Кнопка startWaveBtn найдена');
        
        // Убираем старый обработчик
        const oldHandler = btn._clickHandler;
        if (oldHandler) {
            btn.removeEventListener('click', oldHandler);
        }
        
        // Новый обработчик
        btn._clickHandler = (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('🖱️ Клик по кнопке запуска волны');
            
            if (this.game.state === 'prepare') {
                console.log('▶️ Запускаем волну...');
                this.game.startWave();
            } else {
                console.log(`Нельзя запустить волну. Состояние: ${this.game.state}`);
            }
        };
        
        btn.addEventListener('click', btn._clickHandler);
    }

    // Обновление состояния кнопки волны
    updateStartWaveButton() {
        const btn = document.getElementById('startWaveBtn');
        if (!btn) return;
        
        if (this.game.state === 'prepare' && !this.game.waveController.allWavesCompleted) {
            btn.disabled = false;
            btn.textContent = '▶ НАЧАТЬ ВОЛНУ';
            btn.style.opacity = 1;
            btn.style.cursor = 'pointer';
            btn.style.pointerEvents = 'auto';
        } else if (this.game.state === 'battle') {
            btn.disabled = true;
            btn.textContent = '⚔️ ИДЁТ БОЙ...';
            btn.style.opacity = 0.5;
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        } else if (this.game.state === 'dialogue') {
            btn.disabled = true;
            btn.textContent = '📖 КАТ-СЦЕНА...';
            btn.style.opacity = 0.5;
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        } else if (this.game.waveController.allWavesCompleted) {
            btn.disabled = true;
            btn.textContent = '✅ АКТ ПРОЙДЕН';
            btn.style.opacity = 0.7;
            btn.style.cursor = 'default';
            btn.style.pointerEvents = 'none';
        } else if (this.game.state === 'lose') {
            btn.disabled = true;
            btn.textContent = '💀 ПОРАЖЕНИЕ';
            btn.style.opacity = 0.5;
            btn.style.cursor = 'not-allowed';
            btn.style.pointerEvents = 'none';
        }
    }

    // Показать диалог
    showDialogue(speaker, text, onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        overlay.style.pointerEvents = 'auto';
        overlay.style.cursor = 'pointer';
        
        overlay.innerHTML = `
            <div class="dialog-speaker">${speaker}</div>
            <div class="dialog-text">${text}</div>
            <div class="dialog-hint">Кликните, чтобы продолжить...</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.remove();
            if (onComplete) onComplete();
        });
    }

    // Показать кат-сцену (стори-мод)
    showCutscene(cutsceneData, onComplete) {
        console.log(`🎬 Показываем кат-сцену: ${cutsceneData.title}`);
        
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        overlay.style.background = 'rgba(0, 0, 0, 0.95)';
        overlay.style.pointerEvents = 'auto';
        overlay.style.cursor = 'pointer';
        
        let html = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; margin-bottom: 15px;">${cutsceneData.icon}</div>
                <div style="font-size: 36px; color: #ffcc00; font-weight: bold; text-shadow: 0 0 20px #ffcc00;">
                    ${cutsceneData.title}
                </div>
            </div>
        `;
        
        // Строки диалога
        cutsceneData.lines.forEach((line, index) => {
            html += `
                <div class="cutscene-line" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'}; text-align: center;">
                    <div class="dialog-speaker" style="font-size: 22px;">${line.speaker}</div>
                    <div class="dialog-text" style="font-size: 18px;">${line.text}</div>
                </div>
            `;
        });
        
        html += `
            <div class="dialog-hint" style="margin-top: 40px;">
                Кликните для продолжения (${cutsceneData.lines.length} строк)
            </div>
        `;
        
        overlay.innerHTML = html;
        document.getElementById('gameContainer').appendChild(overlay);

        let currentLine = 0;
        
        overlay.addEventListener('click', () => {
            currentLine++;
            
            if (currentLine < cutsceneData.lines.length) {
                // Показываем следующую строку
                const allLines = overlay.querySelectorAll('.cutscene-line');
                allLines.forEach(line => line.style.display = 'none');
                allLines[currentLine].style.display = 'block';
                console.log(`📖 Строка ${currentLine + 1}/${cutsceneData.lines.length}`);
            } else {
                // Кат-сцена завершена
                console.log('✅ Кат-сцена завершена');
                overlay.remove();
                if (onComplete) onComplete();
            }
        });
    }

    // Показать экран проигрыша
    showLoseScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        overlay.style.pointerEvents = 'auto';
        overlay.style.cursor = 'pointer';
        
        overlay.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">💀</div>
            <div class="dialog-speaker" style="color: #ff0000; font-size: 36px;">РЕАКТОР УНИЧТОЖЕН</div>
            <div class="dialog-text">Ферроиды прорвали оборону. Башня пала.</div>
            <div class="dialog-text" style="color: #888; margin-top: 20px;">Нажмите R для перезапуска</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);
    }

    // Показать экран победы
    showWinScreen(actId) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        overlay.style.pointerEvents = 'auto';
        overlay.style.cursor = 'pointer';
        
        overlay.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🏆</div>
            <div class="dialog-speaker" style="color: #00ff96; font-size: 36px;">АКТ ${actId} ПРОЙДЕН</div>
            <div class="dialog-text">Отличная работа! Братья продолжают борьбу.</div>
            <div class="dialog-hint" style="margin-top: 30px;">Кликните для продолжения</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.remove();
            this.game.loadNextAct();
        });
    }
}
