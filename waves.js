// waves.js — система волн и спавна врагов

class WaveController {
    constructor(grid) {
        this.grid = grid;
        this.currentAct = null;
        this.currentWaveIndex = 0;
        this.totalWaves = 0;
        this.isSpawning = false;
        this.spawnQueue = [];
        this.lastSpawnTime = 0;
        this.waveCompleted = false;
        this.allWavesCompleted = false;
    }

    // Загрузить акт
    loadAct(act) {
        this.currentAct = act;
        this.currentWaveIndex = 0;
        this.totalWaves = act.waves.length;
        this.isSpawning = false;
        this.spawnQueue = [];
        this.waveCompleted = false;
        this.allWavesCompleted = false;
    }

    // Начать следующую волну
    startNextWave() {
        if (this.currentWaveIndex >= this.totalWaves) {
            this.allWavesCompleted = true;
            console.log('Все волны акта пройдены!');
            return;
        }

        this.waveCompleted = false;
        const wave = this.currentAct.waves[this.currentWaveIndex];
        
        // Формируем очередь спавна
        this.spawnQueue = [];
        for (let i = 0; i < wave.count; i++) {
            this.spawnQueue.push({
                enemyId: wave.enemyId,
                lane: wave.lane === -1 ? Math.floor(Math.random() * CONFIG.GRID.ROWS) : wave.lane,
            });
        }

        this.isSpawning = true;
        this.lastSpawnTime = 0;
        console.log(`Волна ${this.currentWaveIndex + 1}/${this.totalWaves} началась! Врагов: ${wave.count}`);
    }

    // Обновление (вызывается каждый кадр)
    update(timestamp, game) {
        if (!this.isSpawning) return;

        // Спавним врагов с интервалом
        if (timestamp - this.lastSpawnTime >= CONFIG.WAVES.TIME_BETWEEN_SPAWNS * 1000) {
            this.lastSpawnTime = timestamp;
            this.spawnNextEnemy(game);
        }
    }

    // Спавн следующего врага из очереди
    spawnNextEnemy(game) {
        if (this.spawnQueue.length === 0) {
            this.isSpawning = false;
            this.waveCompleted = true;
            return;
        }

        const spawnData = this.spawnQueue.shift();
        const enemy = EnemyFactory.createEnemy(spawnData.enemyId, spawnData.lane);

        if (enemy) {
            game.enemies.push(enemy);
            console.log(`Спавн: ${enemy.name} на линии ${spawnData.lane}`);
        }
    }

    // Проверить, завершена ли волна
    isWaveComplete(game) {
        // Волна завершена, если все враги из очереди заспавнены и на поле нет врагов
        return this.waveCompleted && this.spawnQueue.length === 0 && game.enemies.length === 0;
    }

    // Проверить, завершены ли все волны акта
    isActComplete(game) {
        return this.allWavesCompleted && this.isWaveComplete(game);
    }

    // Перейти к следующей волне
    advanceToNextWave() {
        this.currentWaveIndex++;
        
        if (this.currentWaveIndex < this.totalWaves) {
            this.startNextWave();
        } else {
            this.allWavesCompleted = true;
            this.isSpawning = false;
            console.log('🏆 Все волны акта завершены!');
        }
    }
}
