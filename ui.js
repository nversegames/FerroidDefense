// ui.js — интерфейс: кнопки, панели, диалоги

class UIManager {
    constructor(game) {
        this.game = game;
        this.selectedTowerBtn = null;
        
        this.setupTowerButtons();
        this.setupStartWaveButton();
        this.setupDialogueSystem();
    }

    // Настройка кнопок выбора башен
    setupTowerButtons() {
        const buttons = document.querySelectorAll('.tower-btn');
        
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                const towerId = btn.dataset.tower;
                this.selectTower(towerId, btn);
            });
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
        this.game.selectedTower = towerConfig;

        console.log(`Выбрана башня: ${towerConfig.name} (${towerConfig.cost}⚡)`);
    }

    // Настройка кнопки запуска волны
    setupStartWaveButton() {
        const btn = document.getElementById('startWaveBtn');
        
        btn.addEventListener('click', () => {
            if (this.game.state === 'prepare') {
                this.game.startWave();
                btn.disabled = true;
                btn.textContent = '⚔️ ИДЁТ БОЙ...';
            }
        });
    }

    // Обновление состояния кнопки волны
    updateStartWaveButton() {
        const btn = document.getElementById('startWaveBtn');
        
        if (this.game.state === 'prepare' && !this.game.waveController.allWavesCompleted) {
            btn.disabled = false;
            btn.textContent = '▶ НАЧАТЬ ВОЛНУ';
        } else if (this.game.state === 'battle') {
            btn.disabled = true;
            btn.textContent = '⚔️ ИДЁТ БОЙ...';
        } else if (this.game.waveController.allWavesCompleted) {
            btn.disabled = true;
            btn.textContent = '✅ АКТ ПРОЙДЕН';
        }
    }

    // Настройка системы диалогов
    setupDialogueSystem() {
        // Диалоги будут показываться через оверлей
    }

    // Показать диалог
    showDialogue(speaker, text, onComplete) {
        // Создаём оверлей
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        overlay.innerHTML = `
            <div class="dialog-speaker">${speaker}</div>
            <div class="dialog-text">${text}</div>
            <div class="dialog-hint">Кликните, чтобы продолжить...</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);

        // Клик — закрыть диалог
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

    // Показать экран проигрыша
    showLoseScreen() {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        overlay.innerHTML = `
            <div class="dialog-speaker" style="color: #ff0000;">РЕАКТОР УНИЧТОЖЕН</div>
            <div class="dialog-text">Ферроиды прорвали оборону. Башня пала.</div>
            <div class="dialog-hint">Нажмите R для перезапуска</div>
        `;

        document.getElementById('gameContainer').appendChild(overlay);
    }

    // Показать экран победы
    showWinScreen(actId) {
        const overlay = document.createElement('div');
        overlay.className = 'dialog-overlay';
        
        overlay.innerHTML = `
            <div class="dialog-speaker" style="color: #00ff96;">АКТ ${actId} ПРОЙДЕН</div>
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
