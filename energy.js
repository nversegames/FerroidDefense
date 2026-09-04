// energy.js — система энергии (очки действий)

class EnergySystem {
    constructor(startAmount, maxAmount) {
        this.current = startAmount;
        this.max = maxAmount;
        this.regenRate = CONFIG.ENERGY.REGEN_RATE;
        this.regenInterval = CONFIG.ENERGY.REGEN_INTERVAL;
        this.lastRegenTime = 0;
    }

    // Обновление (вызывается каждый кадр)
    update(timestamp) {
        // Проверяем, прошёл ли интервал регенерации
        if (timestamp - this.lastRegenTime >= this.regenInterval * 1000) {
            this.lastRegenTime = timestamp;
            this.regenerate();
        }
    }

    // Регенерация энергии
    regenerate() {
        if (this.current < this.max) {
            this.current = Math.min(this.current + this.regenRate, this.max);
        }
    }

    // Проверка, хватает ли энергии
    canAfford(amount) {
        return this.current >= amount;
    }

    // Трата энергии
    spend(amount) {
        if (this.canAfford(amount)) {
            this.current -= amount;
            return true;
        }
        return false;
    }

    // Добавление энергии (за убийство врагов)
    add(amount) {
        this.current = Math.min(this.current + amount, this.max);
    }

    // Сброс до стартового значения
    reset() {
        this.current = CONFIG.ENERGY.START_AMOUNT;
        this.lastRegenTime = 0;
    }
}
