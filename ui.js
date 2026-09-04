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
        this.setupTowerButtons();
        this.setupStartWaveButton();
    }

    // Настройка кнопок выбора башен
    setupTowerButtons() {
        const buttons = document.querySelectorAll('.tower-btn');
        
        buttons.forEach(btn => {
            // Убираем старые обработчики (если есть)
            btn.removeEventListener('click', btn._clickHandler);
            
            // Создаём новый обработчик
            btn._clickHandler = (e) => {
                e.stopPropagation();
                e.preventDefault();
                const towerId = btn.dataset.tower;
                this.selectTower(towerId, btn);
            };
            
            btn.addEventListener('click', btn._clickHandler);
        });
        
        console.log('✅ Кнопки башен настроены:', buttons.length);
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
        this.game.selectedTower = towerConfig;

        console.log(`Выбрана башня: ${towerConfig.name} (${towerConfig.cost}⚡)`);
    }

    // Настройка кнопки запуска волны
    setupStartWaveButton() {
        const btn = document.getElementById('startWaveBtn');
        
        if (!btn) {
            console.error('❌ Кнопка startWaveBtn не найдена!');
            return;
        }
        
        btn.removeEventListener('click', btn._clickHandler);
        
        btn._clickHandler = (e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Клик по кнопке запуска волны');
            
            if (this.game.state === 'prepare') {
                this.game.startWave();
            }
        };
        
        btn.addEventListener('click', btn._clickHandler);
        
        console.log('✅ Кнопка запуска волны настроена');
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
        } else if (this.game.state === 'battle') {
            btn.disabled = true;
            btn.textContent = '⚔️ ИДЁТ БОЙ...';
            btn.style.opacity = 0.5;
            btn.style.cursor = 'not-allowed';
        } else if (this.game.waveController.allWavesCompleted) {
            btn.disabled = true;
            btn.textContent = '✅ АКТ ПРОЙДЕН';
            btn.style.opacity = 0.7;
            btn.style.cursor = 'default';
        }
    }

    // Показать диалог
    showDialogue(speaker, text, onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        
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

    // Показать диалог акта
    showActDialogue(act, onComplete) {
        const speaker = act.id % 2 === 1 ? 'Виктор' : 'Лёха';
        this.showDialogue(speaker, act.description, onComplete);
    }

    // Показать кат-сцену (стори-мод)
    showCutscene(cutsceneData, onComplete) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        overlay.style.background = 'rgba(0, 0, 0, 0.95)';
        
        let html = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 36px; margin-bottom: 10px;">${cutsceneData.icon}</div>
                <div class="dialog-speaker" style="font-size: 32px; color: #ffcc00;">${cutsceneData.title}</div>
            </div>
        `;
        
        // Показываем строки диалога по очереди
        cutsceneData.lines.forEach((line, index) => {
            html += `
                <div class="cutscene-line" data-index="${index}" style="display: ${index === 0 ? 'block' : 'none'};">
                    <div class="dialog-speaker">${line.speaker}</div>
                    <div class="dialog-text">${line.text}</div>
                </div>
            `;
        });
        
        html += `<div class="dialog-hint">Кликните для продолжения...</div>`;
        
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
            } else {
                // Кат-сцена завершена
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
        
        overlay.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">💀</div>
            <div class="dialog-speaker" style="color: #ff0000; font-size: 36px;">РЕАКТОР УНИЧТОЖЕН</div>
            <div class="dialog-text">Ферроиды прорвали оборону. Башня пала.</div>
            <div class="dialog-text" style="color: #888;">Нажмите R для перезапуска</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);
    }

    // Показать экран победы
    showWinScreen(actId) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        overlay.style.zIndex = 1000;
        
        overlay.innerHTML = `
            <div style="font-size: 60px; margin-bottom: 20px;">🏆</div>
            <div class="dialog-speaker" style="color: #00ff96; font-size: 36px;">АКТ ${actId} ПРОЙДЕН</div>
            <div class="dialog-text">Отличная работа! Братья продолжают борьбу.</div>
            <div class="dialog-hint">Кликните для продолжения</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);

        overlay.addEventListener('click', () => {
            overlay.remove();
            this.game.loadNextAct();
        });
    }
}
