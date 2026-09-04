// towers.js — башни, стрельба, снаряды

class Tower {
    constructor(id, name, icon, cost, damage, range, cooldown, color, projectileSpeed) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.cost = cost;
        this.damage = damage;
        this.range = range;
        this.cooldown = cooldown;
        this.color = color;
        this.projectileSpeed = projectileSpeed || 300;
        this.row = -1;
        this.col = -1;
        this.lastAttackTime = 0;
        this.target = null;
    }

    // Обновление башни (вызывается каждый кадр)
    update(timestamp, game) {
        // Башня стреляет только во время битвы
        if (game.state !== 'battle') return;

        // Проверяем перезарядку
        if (timestamp - this.lastAttackTime < this.cooldown * 1000) return;

        // Ищем цель
        const target = this.findTarget(game);

        if (target) {
            this.attack(target, game);
            this.lastAttackTime = timestamp;
        }
    }

    // Поиск ближайшего врага на своей линии
    findTarget(game) {
        let closestEnemy = null;
        let closestDistance = Infinity;

        for (const enemy of game.enemies) {
            if (!enemy.isAlive) continue;
            if (enemy.lane !== this.row) continue;  // только своя линия

            // Проверяем дальность
            const dx = enemy.x - this.getX();
            const dy = enemy.y - this.getY();
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= this.range && distance < closestDistance) {
                closestEnemy = enemy;
                closestDistance = distance;
            }
        }

        return closestEnemy;
    }

    // Атака
    attack(target, game) {
        // Создаём снаряд
        const projectile = new Projectile(
            this.getX(),
            this.getY(),
            target,
            this.damage,
            this.projectileSpeed,
            this.color || '#ffff00'
        );

        game.projectiles.push(projectile);
    }

    // Получить X-координату башни
    getX() {
        return CONFIG.GRID.OFFSET_X + this.col * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
    }

    // Получить Y-координату башни
    getY() {
        return CONFIG.GRID.OFFSET_Y + this.row * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;
    }
}

// Снаряд
class Projectile {
    constructor(x, y, target, damage, speed, color) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.radius = 5;
        this.isAlive = true;
    }

    update(timestamp, game) {
        // Если цель мертва — снаряд летит дальше или исчезает
        if (!this.target || !this.target.isAlive) {
            this.isAlive = false;
            return;
        }

        // Двигаемся к цели
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Если долетели
        if (distance < 10) {
            this.hit(game);
            return;
        }

        // Двигаемся
        const moveX = (dx / distance) * this.speed * (timestamp / 1000) * 60;
        const moveY = (dy / distance) * this.speed * (timestamp / 1000) * 60;

        this.x += moveX;
        this.y += moveY;
    }

    hit(game) {
        // Наносим урон цели
        if (this.target && this.target.isAlive) {
            this.target.takeDamage(this.damage, game);
        }
        this.isAlive = false;
    }
}

// Ловушка — особая башня
class Trap extends Tower {
    constructor(cost, damage) {
        super('trap', 'Ловушка', '💥', cost, damage, 0, 0, '#ff6600', 0);
        this.isTriggered = false;
    }

    update(timestamp, game) {
        if (this.isTriggered) return;

        // Проверяем, есть ли враг на клетке
        const cell = game.grid.getCell(this.row, this.col);
        if (cell && cell.enemy) {
            this.trigger(cell.enemy, game);
        }
    }

    trigger(enemy, game) {
        this.isTriggered = true;
        enemy.takeDamage(this.damage, game);

        // Эффект взрыва
        game.effects.push({
            x: this.getX(),
            y: this.getY(),
            radius: 40,
            color: '#ff6600',
            alpha: 0.8,
            isAlive: true,
            update: function(ts) {
                this.radius -= 0.5;
                this.alpha -= 0.02;
                if (this.alpha <= 0) this.isAlive = false;
            }
        });

        console.log('💥 Ловушка сработала!');
        
        // Убираем ловушку
        game.grid.removeTower(this.row, this.col);
    }
}
