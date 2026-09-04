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
            range: 250,
            cooldown: 1,
            projectileSpeed: 400,
            color: '#0088ff',
            description: 'Базовая турель. Стреляет по ближайшему врагу.',
        },
        SLOW_PAD: {
            id: 'slow_pad',
            name: 'Подушка',
            icon: '🧊',
            cost: 25,
            slowPercent: 0.4,
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
            speed: 30,
            damage: 100,
            color: '#888888',
            reward: 25,
            armor: 2,
        },
        DECOY: {
            id: 'decoy',
            name: 'Обманка',
            icon: '👻',
            health: 10,
            speed: 200,
            damage: 0,
            color: '#ccffff',
            reward: 5,
        },
        SPIKER: {
            id: 'spiker',
            name: 'Гвоздемёт',
            icon: '🔩',
            health: 80,
            speed: 60,
            damage: 10,
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
            splitCount: 3,
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
            attractRadius: 200,
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
            diveTriggerDistance: 200,
        },
        BOMBER: {
            id: 'bomber',
            name: 'Будильник',
            icon: '⏰',
            health: 50,
            speed: 120,
            damage: 50,
            color: '#ff4400',
            reward: 15,
            explodeOnContact: true,
        },
    },

    // ===== ВОЛНЫ =====
    WAVES: {
        TIME_BETWEEN_WAVES: 5,
        TIME_BETWEEN_SPAWNS: 2,
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

    // ===== КАТ-СЦЕНЫ (STORY MODE) =====
    CUTSCENES: [
        {
            id: 0,
            icon: '🏰',
            title: 'Осада башни',
            lines: [
                {
                    speaker: 'Виктор',
                    text: 'Лёха, что ты натворил? Эти твари идут прямо к башне!'
                },
                {
                    speaker: 'Лёха',
                    text: 'Я не думал, что ИИ выйдет из-под контроля... Они эволюционируют слишком быстро.'
                },
                {
                    speaker: 'Виктор',
                    text: 'Потом разберёмся. Сейчас — к пушкам. Защищаем реактор!'
                }
            ]
        },
        {
            id: 1,
            icon: '🔧',
            title: 'Гибридные модули',
            lines: [
                {
                    speaker: 'Виктор',
                    text: 'Мои турели + твои биотехнологии. Может сработать.'
                },
                {
                    speaker: 'Лёха',
                    text: 'Гибридные модули. Металл и биомасса. Как они.'
                },
                {
                    speaker: 'Виктор',
                    text: 'Ирония судьбы. Мы используем их же оружие против них.'
                }
            ]
        },
        {
            id: 2,
            icon: '📔',
            title: 'Дневники и предательство',
            lines: [
                {
                    speaker: 'Виктор',
                    text: 'Я нашёл твои дневники, Лёха. Ты сливал данные врагу?'
                },
                {
                    speaker: 'Лёха',
                    text: 'Я думал, что помогаю... Они обещали мир. Но я ошибался.'
                },
                {
                    speaker: 'Виктор',
                    text: 'Ошибался? Из-за тебя погибли люди!'
                },
                {
                    speaker: 'Лёха',
                    text: 'Я знаю. Поэтому я должен всё исправить.'
                }
            ]
        },
        {
            id: 3,
            icon: '👁️',
            title: 'Открытие',
            lines: [
                {
                    speaker: 'Лёха',
                    text: 'Виктор, они строят что-то огромное. Они украли "Гном-4"!'
                },
                {
                    speaker: 'Виктор',
                    text: 'Мой реактор? Они хотят создать Колосса...'
                },
                {
                    speaker: 'Лёха',
                    text: 'Если они его активируют, нам конец.'
                }
            ]
        },
        {
            id: 4,
            icon: '🎯',
            title: 'План "Чёрный день"',
            lines: [
                {
                    speaker: 'Виктор',
                    text: 'У меня есть план. Катапульта забросит тебя внутрь Колосса.'
                },
                {
                    speaker: 'Лёха',
                    text: 'Внутрь? Ты серьёзно?'
                },
                {
                    speaker: 'Виктор',
                    text: 'Ты создал этот кошмар. Ты его и остановишь. Изнутри.'
                },
                {
                    speaker: 'Лёха',
                    text: 'Хорошо. Но если я не вернусь — знай, я сожалею.'
                }
            ]
        },
        {
            id: 5,
            icon: '⚔️',
            title: 'Битва с Колоссом',
            lines: [
                {
                    speaker: 'Виктор',
                    text: 'Я отвлеку его снаружи. Ты проберись к реактору внутри.'
                },
                {
                    speaker: 'Лёха',
                    text: 'Понял. Удачи, брат.'
                },
                {
                    speaker: 'Виктор',
                    text: 'Удачи, Лёха. Не подведи.'
                }
            ]
        },
        {
            id: 6,
            icon: '💔',
            title: 'Жертва и спасение',
            lines: [
                {
                    speaker: 'Лёха',
                    text: 'Реактор нестабилен! Я должен взорвать его вручную!'
                },
                {
                    speaker: 'Виктор',
                    text: 'Нет! Выбирайся оттуда!'
                },
                {
                    speaker: 'Лёха',
                    text: 'Слишком поздно. Это единственный способ. Прощай, брат...'
                }
            ]
        },
        {
            id: 7,
            icon: '🏅',
            title: 'Эпилог',
            lines: [
                {
                    speaker: 'Рассказчик',
                    text: 'Башня выстояла. Ферроиды остановлены.'
                },
                {
                    speaker: 'Рассказчик',
                    text: 'Виктор и Лёха стали героями. Их подвиг не забыт.'
                },
                {
                    speaker: 'Рассказчик',
                    text: 'Но это лишь начало. Биомасса всё ещё жива...'
                }
            ]
        }
    ],
};
