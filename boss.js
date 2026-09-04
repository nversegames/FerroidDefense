// ============================================
// FERROID DEFENSE — БОСС КОЛОСС
// ============================================

class Colossus {
    constructor(game) {
        this.game = game;
        this.health = 1000;
        this.maxHealth = 1000;
        this.x = -100;
        this.y = game.laneY(2);
        this.radius = 60;
        this.color = '#8b0000';
        this.icon = '👹';
        this.isAlive = true;
        this.state = 'entering';
        this.attackPattern = 0;
        this.lastAttackTime = 0;
        this.specialAttacks = [
            'charge',
            'laser',
            'spawn',
            'shield',
        ];
    }

    update(timestamp) {
        const dt = (timestamp - (this._lastUpdate || timestamp)) / 1000;
        this._lastUpdate = timestamp;

        if (!this.isAlive) return;

        switch (this.state) {
            case 'entering':
                this.x += 2 * dt * 60;
                if (this.x >= 200) {
                    this.state = 'fighting';
                    this.game.ui.showNotification('КОЛОСС ПОЯВИЛСЯ!', '👹');
                }
                break;
            case 'fighting':
                if (timestamp - this.lastAttackTime > 5000) {
                    this.lastAttackTime = timestamp;
                    this.executeSpecialAttack();
                }
                break;
        }
    }

    executeSpecialAttack() {
        this.attackPattern = (this.attackPattern + 1) % this.specialAttacks.length;
        const attack = this.specialAttacks[this.attackPattern];

        switch (attack) {
            case 'charge':
                this.x += 100;
                this.game.ui.showNotification('Колосс атакует!', '💥');
                this.game.damageReactor(20);
                setTimeout(() => { this.x -= 100; }, 2000);
                break;
            case 'laser':
                this.game.ui.showNotification('Лазер Колосса!', '🔴');
                for (let i = 0; i < CONFIG.GRID.ROWS; i++) {
                    this.game.damageReactor(5);
                }
                break;
            case 'spawn':
                this.game.ui.showNotification('Колосс призывает подкрепление!', '👾');
                for (let i = 0; i < 3; i++) {
                    const lane = Math.floor(Math.random() * CONFIG.GRID.ROWS);
                    this.game.spawnEnemy('decoy', lane);
                }
                break;
            case 'shield':
                this.game.ui.showNotification('Колосс активирует щит!', '🛡️');
                this.shield = true;
                setTimeout(() => { this.shield = false; }, 5000);
                break;
        }
    }

    takeDamage(damage) {
        if (this.shield) {
            damage = Math.round(damage * 0.1);
        }
        this.health -= damage;
        if (this.health <= 0) {
            this.health = 0;
            this.isAlive = false;
            this.game.ui.showNotification('КОЛОСС ПОВЕРЖЕН!', '🎉');
            this.game.money += 500;
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.shield) {
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius + 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, this.x, this.y + 2);
        
        // HP бар
        const hpW = 120;
        const hpX = this.x - hpW / 2;
        const hpY = this.y - this.radius - 20;
        ctx.fillStyle = '#333';
        ctx.fillRect(hpX, hpY, hpW, 10);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(hpX, hpY, hpW * (this.health / this.maxHealth), 10);
    }
}

// Добавляем Колосса в игру
Game.prototype.spawnColossus = function() {
    if (!this.colossus) {
        this.colossus = new Colossus(this);
        this.enemies.push(this.colossus);
    }
};

// Обновляем метод spawnEnemy для поддержки Колосса
const originalSpawnEnemy = Game.prototype.spawnEnemy;
Game.prototype.spawnEnemy = function(typeId, lane) {
    if (typeId === 'colossus') {
        this.spawnColossus();
        return;
    }
    originalSpawnEnemy.call(this, typeId, lane);
};

// Обновляем отрисовку для Колосса
const originalDraw = Game.prototype.draw;
Game.prototype.draw = function() {
    originalDraw.call(this);
    
    if (this.colossus) {
        this.colossus.draw(this.ctx);
    }
};
