// ============================================
// FERROID DEFENSE — КОНФИГУРАЦИЯ ИГРЫ
// ============================================

const CONFIG = {
    // ===== ИГРОВОЕ ПОЛЕ =====
    GRID: {
        ROWS: 5,
        COLS: 9,
        CELL_SIZE: 100,
        OFFSET_X: 150,
        OFFSET_Y: 50,
    },

    // ===== ЭНЕРГИЯ =====
    ENERGY: {
        START: 100,
        MAX: 999,
        REGEN_PER_SECOND: 2,
    },

    // ===== РЕАКТОР =====
    REACTOR: {
        MAX_HEALTH: 100,
    },

    // ===== ВОЛНЫ =====
    WAVES: {
        SPAWN_INTERVAL: 2,
    },

    // ===== БАШНИ =====
    TOWERS: [
        {
            id: 'basic_gun',
            name: 'Пушка',
            icon: '🔫',
            cost: 50,
            damage: 10,
            range: 250,
            cooldown: 1,
            projectileSpeed: 400,
            color: '#0088ff',
            key: '1',
        },
        {
            id: 'slow_pad',
            name: 'Подушка',
            icon: '🧊',
            cost: 25,
            slowPercent: 0.4,
            slowDuration: 2,
            color: '#00ccff',
            key: '2',
        },
        {
            id: 'trap',
            name: 'Ловушка',
            icon: '💥',
            cost: 75,
            damage: 50,
            color: '#ff6600',
            key: '3',
        },
        {
            id: 'heavy_cannon',
            name: 'Тяжёлая пушка',
            icon: '🚀',
            cost: 150,
            damage: 50,
            range: 200,
            cooldown: 3,
            projectileSpeed: 200,
            color: '#ff0000',
            key: '4',
        },
    ],

    // ===== ВРАГИ =====
    ENEMIES: {
        armored: {
            name: 'Броненосец',
            icon: '🛡️',
            health: 200,
            speed: 30,
            damage: 100,
            color: '#888888',
            reward: 25,
            armor: 2,
        },
        decoy: {
            name: 'Обманка',
            icon: '👻',
            health: 10,
            speed: 200,
            damage: 0,
            color: '#ccffff',
            reward: 5,
        },
        spiker: {
            name: 'Гвоздемёт',
            icon: '🔩',
            health: 80,
            speed: 60,
            damage: 10,
            color: '#ffaa00',
            reward: 15,
            range: 150,
            attackCooldown: 2,
        },
        sticky: {
            name: 'Липучка',
            icon: '🟢',
            health: 120,
            speed: 40,
            damage: 20,
            color: '#00ff00',
            reward: 15,
        },
        divider: {
            name: 'Делитель',
            icon: '🔱',
            health: 100,
            speed: 50,
            damage: 15,
            color: '#aa00ff',
            reward: 20,
            splitCount: 3,
        },
        magnet: {
            name: 'Магнит',
            icon: '🧲',
            health: 150,
            speed: 45,
            damage: 10,
            color: '#ff00ff',
            reward: 20,
            attractRadius: 200,
        },
        diver: {
            name: 'Ныряльщик',
            icon: '🌊',
            health: 100,
            speed: 80,
            damage: 30,
            color: '#0044ff',
            reward: 20,
            diveDistance: 200,
        },
        bomber: {
            name: 'Будильник',
            icon: '⏰',
            health: 50,
            speed: 120,
            damage: 50,
            color: '#ff4400',
            reward: 15,
        },
    },

    // ===== АКТЫ И ВОЛНЫ =====
    ACTS: [
        {
            id: 1,
            title: 'Осада башни',
            waves: [
                { enemy: 'decoy', count: 5, lane: -1 },
                { enemy: 'decoy', count: 3, lane: 0 },
                { enemy: 'spiker', count: 3, lane: 2 },
            ],
        },
        {
            id: 2,
            title: 'Гибридные модули',
            waves: [
                { enemy: 'sticky', count: 4, lane: 1 },
                { enemy: 'spiker', count: 5, lane: -1 },
                { enemy: 'decoy', count: 8, lane: -1 },
            ],
        },
        {
            id: 3,
            title: 'Дневники и предательство',
            waves: [
                { enemy: 'divider', count: 4, lane: 0 },
                { enemy: 'magnet', count: 3, lane: 3 },
                { enemy: 'sticky', count: 5, lane: -1 },
            ],
        },
        {
            id: 4,
            title: 'Открытие',
            waves: [
                { enemy: 'diver', count: 4, lane: 2 },
                { enemy: 'bomber', count: 6, lane: -1 },
                { enemy: 'armored', count: 2, lane: 4 },
            ],
        },
        {
            id: 5,
            title: 'План "Чёрный день"',
            waves: [
                { enemy: 'magnet', count: 5, lane: -1 },
                { enemy: 'divider', count: 6, lane: -1 },
                { enemy: 'spiker', count: 8, lane: -1 },
                { enemy: 'armored', count: 3, lane: 1 },
            ],
        },
        {
            id: 6,
            title: 'Битва с Колоссом',
            waves: [
                { enemy: 'armored', count: 5, lane: -1 },
                { enemy: 'bomber', count: 10, lane: -1 },
                { enemy: 'diver', count: 6, lane: -1 },
                { enemy: 'magnet', count: 4, lane: -1 },
                { enemy: 'divider', count: 8, lane: -1 },
            ],
        },
        {
            id: 7,
            title: 'Жертва и спасение',
            waves: [
                { enemy: 'bomber', count: 15, lane: -1 },
                { enemy: 'armored', count: 5, lane: -1 },
                { enemy: 'sticky', count: 10, lane: -1 },
            ],
        },
        {
            id: 8,
            title: 'Эпилог',
            waves: [
                { enemy: 'armored', count: 10, lane: -1 },
                { enemy: 'magnet', count: 10, lane: -1 },
                { enemy: 'diver', count: 10, lane: -1 },
            ],
        },
    ],

    // ===== КАТ-СЦЕНЫ =====
    CUTSCENES: [
        {
            icon: '🏰',
            title: 'Осада башни',
            lines: [
                { speaker: 'Виктор', text: 'Лёха, что ты натворил? Эти твари идут прямо к башне!' },
                { speaker: 'Лёха', text: 'Я не думал, что ИИ выйдет из-под контроля... Они эволюционируют слишком быстро.' },
                { speaker: 'Виктор', text: 'Потом разберёмся. Сейчас — к пушкам. Защищаем реактор!' },
            ],
        },
        {
            icon: '🔧',
            title: 'Гибридные модули',
            lines: [
                { speaker: 'Виктор', text: 'Мои турели + твои биотехнологии. Может сработать.' },
                { speaker: 'Лёха', text: 'Гибридные модули. Металл и биомасса. Как они.' },
                { speaker: 'Виктор', text: 'Ирония судьбы. Мы используем их же оружие против них.' },
            ],
        },
        {
            icon: '📔',
            title: 'Дневники и предательство',
            lines: [
                { speaker: 'Виктор', text: 'Я нашёл твои дневники, Лёха. Ты сливал данные врагу?' },
                { speaker: 'Лёха', text: 'Я думал, что помогаю... Они обещали мир. Но я ошибался.' },
                { speaker: 'Виктор', text: 'Ошибался? Из-за тебя погибли люди!' },
                { speaker: 'Лёха', text: 'Я знаю. Поэтому я должен всё исправить.' },
            ],
        },
        {
            icon: '👁️',
            title: 'Открытие',
            lines: [
                { speaker: 'Лёха', text: 'Виктор, они строят что-то огромное. Они украли "Гном-4"!' },
                { speaker: 'Виктор', text: 'Мой реактор? Они хотят создать Колосса...' },
                { speaker: 'Лёха', text: 'Если они его активируют, нам конец.' },
            ],
        },
        {
            icon: '🎯',
            title: 'План "Чёрный день"',
            lines: [
                { speaker: 'Виктор', text: 'У меня есть план. Катапульта забросит тебя внутрь Колосса.' },
                { speaker: 'Лёха', text: 'Внутрь? Ты серьёзно?' },
                { speaker: 'Виктор', text: 'Ты создал этот кошмар. Ты его и остановишь. Изнутри.' },
                { speaker: 'Лёха', text: 'Хорошо. Но если я не вернусь — знай, я сожалею.' },
            ],
        },
        {
            icon: '⚔️',
            title: 'Битва с Колоссом',
            lines: [
                { speaker: 'Виктор', text: 'Я отвлеку его снаружи. Ты проберись к реактору внутри.' },
                { speaker: 'Лёха', text: 'Понял. Удачи, брат.' },
                { speaker: 'Виктор', text: 'Удачи, Лёха. Не подведи.' },
            ],
        },
        {
            icon: '💔',
            title: 'Жертва и спасение',
            lines: [
                { speaker: 'Лёха', text: 'Реактор нестабилен! Я должен взорвать его вручную!' },
                { speaker: 'Виктор', text: 'Нет! Выбирайся оттуда!' },
                { speaker: 'Лёха', text: 'Слишком поздно. Это единственный способ. Прощай, брат...' },
            ],
        },
        {
            icon: '🏅',
            title: 'Эпилог',
            lines: [
                { speaker: 'Рассказчик', text: 'Башня выстояла. Ферроиды остановлены.' },
                { speaker: 'Рассказчик', text: 'Виктор и Лёха стали героями. Их подвиг не забыт.' },
                { speaker: 'Рассказчик', text: 'Но это лишь начало. Биомасса всё ещё жива...' },
            ],
        },
    ],

    // ===== ДОСТИЖЕНИЯ =====
    ACHIEVEMENTS: [
        {
            id: 'first_blood',
            name: 'Первая кровь',
            description: 'Убить первого врага',
            icon: '🎯',
            condition: (stats) => stats.kills >= 1,
        },
        {
            id: 'rich',
            name: 'Богач',
            description: 'Накопить 500 энергии',
            icon: '💰',
            condition: (stats) => stats.maxEnergy >= 500,
        },
        {
            id: 'perfect_act',
            name: 'Идеальный акт',
            description: 'Пройти акт без потерь здоровья',
            icon: '💎',
            condition: (stats) => stats.perfectActs >= 1,
        },
        {
            id: 'killer',
            name: 'Машина смерти',
            description: 'Убить 100 врагов',
            icon: '⚔️',
            condition: (stats) => stats.kills >= 100,
        },
        {
            id: 'strategist',
            name: 'Стратег',
            description: 'Построить 10 башен за один акт',
            icon: '🧠',
            condition: (stats) => stats.towersBuilt >= 10,
        },
    ],
};
