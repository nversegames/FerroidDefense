// enemies.js — враги (Ферроиды) и их ИИ

class Enemy {
    constructor(type, lane, spawnX, spawnY) {
        // Данные из конфига
        this.type = type;
        this.id = type.id;
        this.name = type.name;
        this.icon = type.icon;
        this.color = type.color;
        this.maxHealth = type.health;
        this.health = type.health;
        this.speed = type.speed;
        this.damage = type.damage;
        this.reward = type.reward;
        
        // Позиция
        this.x = spawnX;
        this.y = spawnY;
        this.lane = lane;
        this.radius = 25;
        
        // Состояние
        this.isAlive = true;
        this.isDiving = false;
        this.state = 'moving'; // moving, attacking, diving, dead
        this.targetReactorX = CONFIG.GRID.OFFSET_X + CONFIG.GRID.COLS * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.OFFSET_X;
        
        // Особые способности
        this.armor = type.armor || 0;
        this.splitCount = type.splitCount || 0;
        this.attractRadius = type.attractRadius || 0;
        this.diveTriggerDistance = type.diveTriggerDistance || 0;
        this.attackRange = type.range || 0;
        this.attackCooldown = type.attackCooldown || 0;
        this.lastAttackTime = 0;
        this.slowPercent = 0;
        this.slowDuration = 0;
        this.slowTimer = 0;
    }

    update(timestamp, game) {
        if (!this.isAlive) return;

        // Обновляем замедление
        if (this.slowTimer > 0) {
            this.slowTimer -= timestamp / 1000;
            if (this.slowTimer <= 0) {
                this.slowPercent = 0;
            }
        }

        // Текущая скорость с учётом замедления
        const currentSpeed = this.speed * (1 - this.slowPercent);

        switch (this.state) {
            case 'moving':
                this.move(currentSpeed, timestamp);
                break;
            case 'attacking':
                this.attackReactor(timestamp, game);
                break;
            case 'diving':
                // Ныряльщик под землёй — неуязвим
                break;
        }
    }

    move(speed, timestamp) {
        // Двигаемся к реактору
        this.x += speed * (timestamp / 1000) * 60;

        // Проверяем особые способности
        this.checkSpecialAbilities();

        // Проверяем, дошли ли до реактора
        if (this.x >= this.targetReactorX - 50) {
            this.state = 'attacking';
        }
    }

    checkSpecialAbilities() {
        // Ныряльщик — зарывается при приближении
        if (this.diveTriggerDistance > 0 && !this.isDiving) {
            const distanceToReactor = this.targetReactorX - this.x;
            if (distanceToReactor <= this.diveTriggerDistance) {
                this.startDive();
            }
        }
    }

    startDive() {
        this.isDiving = true;
        this.state = 'diving';
        console.log(`${this.name} зарылся под землю!`);
        
        // Через 1.5 секунды выныривает у реактора
        setTimeout(() => {
            if (this.isAlive) {
                this.x = this.targetReactorX - 60;
                this.isDiving = false;
                this.state = 'attacking';
                console.log(`${this.name} вынырнул у реактора!`);
            }
        }, 1500);
    }

    attackReactor(timestamp, game) {
        // Если есть дальность атаки — атакуем с расстояния
        if (this.attackRange > 0) {
            const distanceToReactor = this.targetReactorX - this.x;
            
            if (distanceToReactor <= this.attackRange) {
                if (timestamp - this.lastAttackTime >= this.attackCooldown * 1000) {
                    game.reactor.takeDamage(this.damage);
                    this.lastAttackTime = timestamp;
                    console.log(`${this.name} атакует реактор на расстоянии!`);
                }
            } else {
                // Подходим ближе
                this.x += this.speed * (timestamp / 1000) * 60;
            }
        } else {
            // Без дальности — просто наносим урон
            game.reactor.takeDamage(this.damage);
            this.die(game);
        }
    }

    takeDamage(amount, game) {
        if (!this.isAlive) return;
        if (this.isDiving) return; // Ныряльщик неуязвим под землёй

        // Проверяем броню (Броненосец)
        if (this.armor > 0) {
            // Только тяжёлые снаряды (урон >= 50) проходят
            if (amount < 50) {
                console.log(`${this.name} блокирует урон ${amount} (броня!)`);
                return;
            }
            this.armor--;
        }

        this.health -= amount;
        
        // Показываем урон
        console.log(`${this.name} получает ${amount} урона. Осталось: ${this.health}`);

        if (this.health <= 0) {
            this.die(game);
        }
    }

    die(game) {
        this.isAlive = false;
        this.state = 'dead';

        // Начисляем энергию
        game.energy.add(this.reward);
        console.log(`${this.name} уничтожен! +${this.reward}⚡`);

        // Делитель — распадается
        if (this.splitCount > 0) {
            this.split(game);
        }

        // Липучка — оставляет след
        if (this.type.id === 'sticky') {
            this.leaveStickyTrail(game);
        }

        // Эффект смерти
        game.effects.push({
            x: this.x,
            y: this.y,
            radius: 30,
            color: this.color,
            alpha: 0.8,
            isAlive: true,
            update: function(ts) {
                this.radius -= 0.5;
                this.alpha -= 0.02;
                if (this.alpha <= 0) this.isAlive = false;
            }
        });
    }

    split(game) {
        // Делитель распадается на мелких
        for (let i = 0; i < this.splitCount; i++) {
            const miniEnemy = new Enemy(
                {
                    id: 'mini_divider',
                    name: 'Осколок',
                    icon: '🔹',
                    color: '#cc88ff',
                    health: 30,
                    speed: this.speed * 1.5,
                    damage: 5,
                    reward: 5,
                },
                this.lane,
                this.x + (Math.random() - 0.5) * 40,
                this.y + (Math.random() - 0.5) * 40
            );
            miniEnemy.radius = 15;
            game.enemies.push(miniEnemy);
        }
        console.log(`${this.name} распался на ${this.splitCount} частей!`);
    }

    leaveStickyTrail(game) {
        // Замедляем всех врагов на линии
        for (const enemy of game.enemies) {
            if (enemy.isAlive && enemy.lane === this.lane) {
                enemy.applySlow(0.4, 3);
            }
        }
        console.log(`${this.name} оставил липкий след!`);
    }

    applySlow(percent, duration) {
        this.slowPercent = Math.max(this.slowPercent, percent);
        this.slowDuration = duration;
        this.slowTimer = duration;
    }
}

// Фабрика врагов
class EnemyFactory {
    static createEnemy(enemyId, lane) {
        const type = CONFIG.ENEMIES[enemyId.toUpperCase()];
        
        if (!type) {
            console.error(`Враг с id "${enemyId}" не найден!`);
            return null;
        }

        const spawnX = 0 - 50; // За левой границей
        const spawnY = CONFIG.GRID.OFFSET_Y + lane * CONFIG.GRID.CELL_SIZE + CONFIG.GRID.CELL_SIZE / 2;

        return new Enemy(type, lane, spawnX, spawnY);
    }
}
