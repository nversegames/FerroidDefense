// renderer.js — отрисовка всего игрового мира

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    // Главный метод отрисовки
    draw(gameState) {
        this.clearCanvas();
        this.drawBackground();
        this.drawSpawnZone();
        this.drawReactorZone();
        this.drawGrid(gameState.grid);
        this.drawTowers(gameState.grid);
        this.drawEnemies(gameState.enemies);
        this.drawProjectiles(gameState.projectiles);
        this.drawEffects(gameState.effects);
        this.drawGameOverlay(gameState);
    }

    clearCanvas() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackground() {
        // Заголовок
        this.ctx.fillStyle = '#00ff96';
        this.ctx.font = 'bold 28px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('FERROID DEFENSE', this.canvas.width / 2, 32);
        
        // Подзаголовок — текущий акт
        if (gameState.currentAct) {
            this.ctx.fillStyle = '#888';
            this.ctx.font = '14px Courier New';
            this.ctx.fillText(
                `Акт ${gameState.currentAct.id}: ${gameState.currentAct.title}`,
                this.canvas.width / 2,
                52
            );
        }
    }

    drawSpawnZone() {
        const x = 0;
        const y = CONFIG.GRID.OFFSET_Y;
        const w = CONFIG.GRID.OFFSET_X - 20;
        const h = CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;

        // Полупрозрачный фон
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
        this.ctx.fillRect(x, y, w, h);

        // Рамка
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.setLineDash([]);

        // Текст
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('СПАВН', x + w / 2, y + h / 2);
        this.ctx.font = '12px Courier New';
        this.ctx.fillText('Ферроиды', x + w / 2, y + h / 2 + 20);
    }

    drawReactorZone() {
        const x = CONFIG.GRID.OFFSET_X + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE + 10;
        const y = CONFIG.GRID.OFFSET_Y;
        const w = CONFIG.GRID.OFFSET_X - 20;
        const h = CONFIG.GRID.ROWS * CONFIG.GRID.CELL_SIZE;

        // Полупрозрачный фон
        this.ctx.fillStyle = 'rgba(0, 255, 150, 0.08)';
        this.ctx.fillRect(x, y, w, h);

        // Рамка
        this.ctx.strokeStyle = 'rgba(0, 255, 150, 0.3)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.setLineDash([]);

        // Текст
        this.ctx.fillStyle = '#00ff96';
        this.ctx.font = 'bold 16px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('РЕАКТОР', x + w / 2, y + h / 2);
        this.ctx.font = '12px Courier New';
        this.ctx.fillText('"Гном-4"', x + w / 2, y + h / 2 + 20);
    }

    drawGrid(grid) {
        for (let row = 0; row < grid.rows; row++) {
            for (let col = 0; col < grid.cols; col++) {
                const x = CONFIG.GRID.OFFSET_X + col * CONFIG.GRID.CELL_SIZE;
                const y = CONFIG.GRID.OFFSET_Y + row * CONFIG.GRID.CELL_SIZE;
                const size = CONFIG.GRID.CELL_SIZE;

                // Клетка
                const isDark = (row + col) % 2 === 0;
                this.ctx.fillStyle = isDark ? '#2d2d2d' : '#282828';
                this.ctx.fillRect(x, y, size - 2, size - 2);

                // Граница клетки
                this.ctx.strokeStyle = '#3a3a3a';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, size - 2, size - 2);
            }
        }
    }

    drawTowers(grid) {
        const towers = grid.getAllTowers();
        
        for (const tower of towers) {
            const center = grid.getCellCenter(tower.row, tower.col);
            const x = center.x;
            const y = center.y;

            // Башня
            this.ctx.fillStyle = tower.color || '#0088ff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, CONFIG.GRID.CELL_SIZE / 3, 0, Math.PI * 2);
            this.ctx.fill();

            // Обводка
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Иконка
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(tower.icon, x, y + 2);
        }
    }

    drawEnemies(enemies) {
        for (const enemy of enemies) {
            if (!enemy.isAlive) continue;

            const x = enemy.x;
            const y = enemy.y;

            // Если нырнул — рисуем подземным
            if (enemy.isDiving) {
                this.ctx.globalAlpha = 0.3;
            }

            // Тело врага
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, enemy.radius || 25, 0, Math.PI * 2);
            this.ctx.fill();

            // Обводка
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Иконка
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(enemy.icon, x, y + 2);

            // Полоска здоровья
            const healthBarWidth = enemy.radius ? enemy.radius * 2 : 50;
            const healthBarHeight = 6;
            const healthBarX = x - healthBarWidth / 2;
            const healthBarY = y - (enemy.radius || 25) - 15;

            // Фон полоски
            this.ctx.fillStyle = '#333';
            this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

            // Здоровье
            const healthPercent = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : healthPercent > 0.25 ? '#ffcc00' : '#ff0000';
            this.ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);

            this.ctx.globalAlpha = 1;
        }
    }

    drawProjectiles(projectiles) {
        for (const proj of projectiles) {
            this.ctx.fillStyle = proj.color || '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, proj.radius || 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Светящийся след
            this.ctx.fillStyle = proj.color || '#ffff00';
            this.ctx.globalAlpha = 0.3;
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, (proj.radius || 5) * 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    drawEffects(effects) {
        for (const effect of effects) {
            this.ctx.fillStyle = effect.color || '#fff';
            this.ctx.globalAlpha = effect.alpha || 1;
            this.ctx.beginPath();
            this.ctx.arc(effect.x, effect.y, effect.radius || 10, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }

    drawGameOverlay(gameState) {
        // Если игра проиграна
        if (gameState.state === 'lose') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 48px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('РЕАКТОР УНИЧТОЖЕН', this.canvas.width / 2, this.canvas.height / 2 - 20);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Courier New';
            this.ctx.fillText('Нажмите R для перезапуска', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }

        // Если победа
        if (gameState.state === 'win') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#00ff96';
            this.ctx.font = 'bold 48px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('АКТ ПРОЙДЕН!', this.canvas.width / 2, this.canvas.height / 2 - 20);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '20px Courier New';
            this.ctx.fillText('Следующий акт начнётся...', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
    }
}
