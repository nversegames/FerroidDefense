// config.js — все константы и баланс игры

const CONFIG = {
    // ===== СЕТКА =====
    GRID: {
        ROWS: 5,                      // 5 линий (рядов)
        COLS: 9,                      // 9 колонок
        CELL_SIZE: 100,               // размер клетки в пикселях
        OFFSET_X: 150,                // отступ слева (зона спавна)
        OFFSET_Y: 50,                 // отступ сверху
    },

    // ===== ЭНЕРГИЯ =====
    ENERGY: {
        START_AMOUNT: 100,            // стартовая энергия
        MAX_AMOUNT: 999,              // максимум
        REGEN_RATE: 2,                // сколько энергии в секунду
        REGEN_INTERVAL: 1,            // раз в секунду
    },

    // ===== РЕАКТОР =====
    REACTOR: {
        MAX_HEALTH: 100,
    },

    // ===== БАШНИ =====
    TOWERS: {
        BASIC_GUN: {
            id: 'basic_gun',
            name: 'Пушка',
            icon: '🔫',
            cost: 50,
            damage: 10,
            range: 250,               // дальность в пикселях
            cooldown: 1,              // перезарядка в секундах
            projectileSpeed: 400,
            color: '#0088ff',
            description: 'Базовая турель. Стреляет по ближайшему врагу.',
        },
        SLOW_PAD: {
            id: 'slow_pad',
            name: 'Подушка',
            icon: '🧊',
            cost: 25,
            slowPercent: 0.4,         // замедление врага
            color: '#00ccff',
            description: 'Замедляет всех врагов на своей линии.',
        },
        TRAP: {
            id: 'trap',
            name: 'Ловушка',
            icon: '💥',
            cost: 75,
            damage: 50,
            color: '#ff6600',
            description: 'Взрывается при контакте, наносит урон одному врагу.',
        },
        HEAVY_CANNON: {
            id: 'heavy_cannon',
            name: 'Тяжёлая пушка',
            icon: '🚀',
            cost: 150,
            damage: 50,
            range: 200,
            cooldown: 3,
            projectileSpeed: 200,
            color: '#ff0000',
            description: 'Мощный выстрел. Нужен против Броненосцев.',
        },
    },

    // ===== ВРАГИ =====
    ENEMIES: {
        ARMORED: {
            id: 'armored',
            name: 'Броненосец',
            icon: '🛡️',
            health: 200,
            speed: 30,                // пикселей в секунду
            damage: 100,              // урон по реактору (ваншот)
            color: '#888888',
            reward: 25,               // энергия за убийство
            armor: 2,                 // тяжёлых снарядов нужно
        },
        DECOY: {
            id: 'decoy',
            name: 'Обманка',
            icon: '👻',
            health: 10,
            speed: 200,
            damage: 0,                // безвредный
            color: '#ccffff',
            reward: 5,
        },
        SPIKER: {
            id: 'spiker',
            name: 'Гвоздемёт',
            icon: '🔩',
            health: 80,
            speed: 60,
            damage: 10,               // атакует на расстоянии
            range: 150,
            attackCooldown: 2,
            color: '#ffaa00',
            reward: 15,
        },
        STICKY: {
            id: 'sticky',
            name: 'Липучка',
            icon: '🟢',
            health: 120,
            speed: 40,
            damage: 20,
            color: '#00ff00',
            reward: 15,
            slowOnDeath: true,        // оставляет липкий след
        },
        DIVIDER: {
            id: 'divider',
            name: 'Делитель',
            icon: '🔱',
            health: 100,
            speed: 50,
            damage: 15,
            color: '#aa00ff',
            reward: 20,
            splitCount: 3,            // на сколько делится
        },
        MAGNET: {
            id: 'magnet',
            name: 'Магнит',
            icon: '🧲',
            health: 150,
            speed: 45,
            damage: 10,
            color: '#ff00ff',
            reward: 20,
            attractRadius: 200,       // притягивает снаряды
        },
        DIVER: {
            id: 'diver',
            name: 'Ныряльщик',
            icon: '🌊',
            health: 100,
            speed: 80,
            damage: 30,
            color: '#0044ff',
            reward: 20,
            diveTriggerDistance: 200, // за сколько до реактора ныряет
        },
        BOMBER: {
            id: 'bomber',
            name: 'Будильник',
            icon: '⏰',
            health: 50,
            speed: 120,
            damage: 50,               // взрыв у реактора
            color: '#ff4400',
            reward: 15,
            explodeOnContact: true,
        },
    },

    // ===== ВОЛНЫ =====
    WAVES: {
        TIME_BETWEEN_WAVES: 5,        // секунд между волнами
        TIME_BETWEEN_SPAWNS: 2,       // секунд между врагами в волне
    },

    // ===== АКТЫ (сюжет) =====
    ACTS: [
        {
            id: 1,
            title: 'Осада башни',
            description: 'Первая атака Ферроидов. Братья ещё не знают, что их ждёт.',
            waves: [
                { enemyId: 'decoy', count: 5, lane: -1 },
                { enemyId: 'decoy', count: 3, lane: 0 },
                { enemyId: 'spiker', count: 3, lane: 2 },
            ],
        },
        {
            id: 2,
            title: 'Гибридные модули',
            description: 'Виктор и Лёха объединяют усилия. Новое оружие готово.',
            waves: [
                { enemyId: 'sticky', count: 4, lane: 1 },
                { enemyId: 'spiker', count: 5, lane: -1 },
                { enemyId: 'decoy', count: 8, lane: -1 },
            ],
        },
        {
            id: 3,
            title: 'Дневники и предательство',
            description: 'Виктор находит дневники. Лёха сливал данные врагу.',
            waves: [
                { enemyId: 'divider', count: 4, lane: 0 },
                { enemyId: 'magnet', count: 3, lane: 3 },
                { enemyId: 'sticky', count: 5, lane: -1 },
            ],
        },
        {
            id: 4,
            title: 'Открытие',
            description: 'Ферроиды строят Колосса с украденным реактором "Гном-4".',
            waves: [
                { enemyId: 'diver', count: 4, lane: 2 },
                { enemyId: 'bomber', count: 6, lane: -1 },
                { enemyId: 'armored', count: 2, lane: 4 },
            ],
        },
        {
            id: 5,
            title: 'План "Чёрный день"',
            description: 'Подготовка катапульты для заброски Лёхи внутрь босса.',
            waves: [
                { enemyId: 'magnet', count: 5, lane: -1 },
                { enemyId: 'divider', count: 6, lane: -1 },
                { enemyId: 'spiker', count: 8, lane: -1 },
                { enemyId: 'armored', count: 3, lane: 1 },
            ],
        },
        {
            id: 6,
            title: 'Битва с Колоссом',
            description: 'Финальная битва. Виктор снаружи, Лёха внутри.',
            waves: [
                { enemyId: 'armored', count: 5, lane: -1 },
                { enemyId: 'bomber', count: 10, lane: -1 },
                { enemyId: 'diver', count: 6, lane: -1 },
                { enemyId: 'magnet', count: 4, lane: -1 },
                { enemyId: 'divider', count: 8, lane: -1 },
            ],
        },
        {
            id: 7,
            title: 'Жертва и спасение',
            description: 'Лёха взрывает реактор. Виктор спасает его гарпуном.',
            waves: [
                { enemyId: 'bomber', count: 15, lane: -1 },
                { enemyId: 'armored', count: 5, lane: -1 },
                { enemyId: 'sticky', count: 10, lane: -1 },
            ],
        },
        {
            id: 8,
            title: 'Эпилог',
            description: 'Новости, памятник братьям. Конец?',
            waves: [
                { enemyId: 'armored', count: 10, lane: -1 },
                { enemyId: 'magnet', count: 10, lane: -1 },
                { enemyId: 'diver', count: 10, lane: -1 },
            ],
        },
    ],
};
