// reactor.js — здоровье реактора "Гном-4"

class Reactor {
    constructor(maxHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.isDestroyed = false;
        this.onHealthChanged = null;  // callback для UI
        this.onDestroyed = null;      // callback при уничтожении
    }

    // Получить урон
    takeDamage(amount) {
        if (this.isDestroyed) return;

        this.currentHealth -= amount;

        // Вызываем callback обновления UI
        if (this.onHealthChanged) {
            this.onHealthChanged(this.currentHealth, this.maxHealth);
        }

        // Проверяем уничтожение
        if (this.currentHealth <= 0) {
            this.currentHealth = 0;
            this.isDestroyed = true;

            if (this.onDestroyed) {
                this.onDestroyed();
            }

            console.log('💥 РЕАКТОР УНИЧТОЖЕН! Ферроиды прорвались!');
        }
    }

    // Восстановить здоровье (для спец-модулей)
    heal(amount) {
        if (this.isDestroyed) return;

        this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);

        if (this.onHealthChanged) {
            this.onHealthChanged(this.currentHealth, this.maxHealth);
        }
    }

    // Сброс
    reset() {
        this.currentHealth = this.maxHealth;
        this.isDestroyed = false;
    }

    // Процент здоровья (для отображения)
    getHealthPercent() {
        return this.currentHealth / this.maxHealth;
    }
}
