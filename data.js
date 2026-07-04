// Pinterest Clone - Mock Data

export const CURRENT_USER = {
  username: 'creative_mind',
  password: '123',
  name: 'Алексей Иванов',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  bio: 'Дизайнер интерьеров и любитель эстетики. Путешествую, ищу вдохновение в архитектуре, природе и еде.',
  followersCount: '1.4k',
  followingCount: '892',
  savedPins: ['pin-1', 'pin-2', 'pin-4', 'pin-7', 'pin-8', 'pin-10', 'pin-11', 'pin-12', 'pin-13', 'pin-14', 'pin-15'],
  createdPins: [],
  friends: ['wanderlust_travel']
};

export const MOCK_USERS = [
  {
    username: 'creative_mind',
    password: '123',
    name: 'Алексей Иванов',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Дизайнер интерьеров и любитель эстетики. Путешествую, ищу вдохновение в архитектуре, природе и еде.',
    followersCount: '1.4k',
    followingCount: '892',
    savedPins: ['pin-1', 'pin-2', 'pin-4', 'pin-7', 'pin-8', 'pin-10', 'pin-11', 'pin-12', 'pin-13', 'pin-14', 'pin-15'],
    createdPins: [],
    friends: ['wanderlust_travel']
  },
  {
    username: 'wanderlust_travel',
    password: '123',
    name: 'Мария Смирнова',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Трэвел-блогер и фотограф. Делюсь секретными локациями со всего земного шара. Ловлю рассветы.',
    followersCount: '25.8k',
    followingCount: '412',
    savedPins: ['pin-2', 'pin-3', 'pin-8', 'pin-9', 'pin-12'],
    createdPins: ['pin-2', 'pin-8', 'pin-12'],
    friends: ['creative_mind']
  }
];

export const INITIAL_CHATS = {
  "creative_mind_wanderlust_travel": [
    { sender: 'wanderlust_travel', text: 'Привет! Мне очень понравилась твоя доска с идеями для дома.', timestamp: '15:32' },
    { sender: 'creative_mind', text: 'Привет! Большое спасибо! Я долго подбирал минималистичные интерьеры.', timestamp: '15:34' },
    { sender: 'wanderlust_travel', text: 'Особенно вилла у бассейна зацепила. Это твой проект?', timestamp: '15:35' },
    { sender: 'creative_mind', text: 'Да, один из недавних концептов.', timestamp: '15:37' }
  ]
};

export const INITIAL_BOARDS = [
  { id: 'board-1', name: 'Идеи для дома', pinIds: ['pin-1', 'pin-4', 'pin-7'] },
  { id: 'board-2', name: 'Путешествия', pinIds: ['pin-2', 'pin-8', 'pin-12'] },
  { id: 'board-3', name: 'Рецепты', pinIds: ['pin-10', 'pin-11'] },
  { id: 'board-4', name: 'Вдохновение / Арт', pinIds: ['pin-13', 'pin-14', 'pin-15'] }
];

export const INITIAL_PINS = [
  {
    id: 'pin-1',
    title: 'Минималистичный дизайн гостиной',
    description: 'Современный интерьер в светлых тонах с акцентом на дерево и натуральные материалы. Идеальное сочетание комфорта и стиля.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop&q=80',
    category: 'Интерьер',
    creator: {
      username: 'design_interior',
      name: 'Студия Уют',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    likes: 342,
    likedByMe: false,
    link: 'https://example.com/interior-design',
    date: '2026-06-28',
    comments: [
      {
        id: 'comment-1-1',
        username: 'elena_k',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        text: 'Очень тепло и уютно выглядит! Какая марка дивана?',
        date: '2026-06-29'
      },
      {
        id: 'comment-1-2',
        username: 'mikhail_arch',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        text: 'Свет поставлен великолепно. Отличная работа с пространством.',
        date: '2026-06-30'
      }
    ]
  },
  {
    id: 'pin-2',
    title: 'Секретные пляжи Бали',
    description: 'Бирюзовая вода, белый песок и величественные скалы Нуса-Пенида. Место, которое стоит посетить каждому путешественнику.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    category: 'Путешествия',
    creator: {
      username: 'wanderlust_travel',
      name: 'Мария Смирнова',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    likes: 1205,
    likedByMe: true,
    link: 'https://example.com/bali-travel-guide',
    date: '2026-07-01',
    comments: [
      {
        id: 'comment-2-1',
        username: 'alex_explorer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
        text: 'Просто невероятно! Был там в прошлом году, виды завораживают.',
        date: '2026-07-02'
      }
    ]
  },
  {
    id: 'pin-3',
    title: 'Мост в туманном лесу',
    description: 'Осенний мост, окутанный утренней дымкой. Таинственная атмосфера дикой природы.',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80',
    category: 'Природа',
    creator: {
      username: 'nature_seeker',
      name: 'Дмитрий Петров',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80'
    },
    likes: 567,
    likedByMe: false,
    link: 'https://example.com/nature-gallery',
    date: '2026-06-15',
    comments: []
  },
  {
    id: 'pin-4',
    title: 'Современная вилла мечты',
    description: 'Архитектурный шедевр с панорамными окнами и бассейном-инфинити на фоне заката. Чистые геометрические формы.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80',
    category: 'Архитектура',
    creator: {
      username: 'modern_arch',
      name: 'Arch Design',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80'
    },
    likes: 890,
    likedByMe: false,
    link: 'https://example.com/villa-project',
    date: '2026-07-02',
    comments: [
      {
        id: 'comment-4-1',
        username: 'elena_k',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        text: 'Мой идеальный дом! Выглядит потрясающе.',
        date: '2026-07-03'
      }
    ]
  },
  {
    id: 'pin-5',
    title: 'Итальянская паста с томатами и базиликом',
    description: 'Классический рецепт домашней пасты: свежие помидоры черри, ароматный базилик, оливковое масло первого отжима и много пармезана.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80',
    category: 'Еда',
    creator: {
      username: 'chef_italy',
      name: 'Шеф Луиджи',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    },
    likes: 412,
    likedByMe: false,
    link: 'https://example.com/pasta-recipe',
    date: '2026-06-20',
    comments: []
  },
  {
    id: 'pin-6',
    title: 'Абстрактный всплеск красок',
    description: 'Современное искусство на холсте. Энергичные мазки акрилом, создающие ощущение движения и хаоса.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
    category: 'Арт',
    creator: {
      username: 'art_gallery',
      name: 'Анна Власова',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    likes: 219,
    likedByMe: false,
    link: 'https://example.com/abstract-art',
    date: '2026-06-25',
    comments: [
      {
        id: 'comment-6-1',
        username: 'creative_mind',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        text: 'Очень вдохновляющая цветовая палитра!',
        date: '2026-06-26'
      }
    ]
  },
  {
    id: 'pin-7',
    title: 'Уютный уголок для чтения',
    description: 'Кресло у окна, мягкий плед, комнатные растения и стопка любимых книг. Атмосфера скандинавского хюгге.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    category: 'Интерьер',
    creator: {
      username: 'design_interior',
      name: 'Студия Уют',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
    },
    likes: 712,
    likedByMe: false,
    link: 'https://example.com/cozy-reading-corner',
    date: '2026-06-18',
    comments: []
  },
  {
    id: 'pin-8',
    title: 'Каналы Венеции на рассвете',
    description: 'Тихое утро в Венеции. Гондолы у причала и первые лучи солнца, освещающие древние фасады палаццо.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80',
    category: 'Путешествия',
    creator: {
      username: 'wanderlust_travel',
      name: 'Мария Смирнова',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    likes: 981,
    likedByMe: false,
    link: 'https://example.com/venice-sunrise',
    date: '2026-07-03',
    comments: []
  },
  {
    id: 'pin-9',
    title: 'Горное озеро в Альпах',
    description: 'Изумрудная вода озера отражает заснеженные вершины. Идеальное место для побега от городской суеты.',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop&q=80',
    category: 'Природа',
    creator: {
      username: 'nature_seeker',
      name: 'Дмитрий Петров',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80'
    },
    likes: 1354,
    likedByMe: false,
    link: 'https://example.com/alpine-lakes',
    date: '2026-06-27',
    comments: [
      {
        id: 'comment-9-1',
        username: 'wanderlust_travel',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        text: 'Где именно сделано это фото? Невероятная красота!',
        date: '2026-06-28'
      }
    ]
  },
  {
    id: 'pin-10',
    title: 'Пышные панкейки с черникой',
    description: 'Рецепт самых нежных американских блинчиков. Подаются с кленовым сиропом, свежими ягодами черники и кусочком сливочного масла.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80',
    category: 'Еда',
    creator: {
      username: 'sweet_bakery',
      name: 'Пекарня Сладость',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80'
    },
    likes: 642,
    likedByMe: false,
    link: 'https://example.com/pancake-recipe',
    date: '2026-06-11',
    comments: []
  },
  {
    id: 'pin-11',
    title: 'Неаполитанская пицца из печи',
    description: 'Настоящая пицца Маргарита с хрустящим бортиком, соусом из спелых томатов сан-марцано, моцареллой буффало и свежим базиликом.',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    category: 'Еда',
    creator: {
      username: 'chef_italy',
      name: 'Шеф Луиджи',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    },
    likes: 1109,
    likedByMe: false,
    link: 'https://example.com/pizza-neapolitan',
    date: '2026-07-02',
    comments: [
      {
        id: 'comment-11-1',
        username: 'food_lover',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
        text: 'Тесто выглядит просто идеально!',
        date: '2026-07-03'
      }
    ]
  },
  {
    id: 'pin-12',
    title: 'Вечерний Париж и Эйфелева башня',
    description: 'Классический вид на Эйфелеву башню с площади Трокадеро на закате, когда начинают зажигаться первые огни иллюминации.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80',
    category: 'Путешествия',
    creator: {
      username: 'wanderlust_travel',
      name: 'Мария Смирнова',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
    },
    likes: 2154,
    likedByMe: false,
    link: 'https://example.com/paris-guide',
    date: '2026-06-29',
    comments: []
  },
  {
    id: 'pin-13',
    title: 'Красочный постер в стиле ретро-модерн',
    description: 'Графический дизайн, сочетающий органические формы, винтажную текстуру и яркую палитру цветов. Вдохновлено стилем Mid-century.',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80',
    category: 'Арт',
    creator: {
      username: 'graphic_factory',
      name: 'Ретро Принт',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop&q=80'
    },
    likes: 478,
    likedByMe: false,
    link: 'https://example.com/retro-posters',
    date: '2026-06-14',
    comments: []
  },
  {
    id: 'pin-14',
    title: 'Жидкий мрамор - флюид арт',
    description: 'Композиция в технике Fluid Art с использованием акриловых чернил синего, золотого и белого цветов. Элегантная текстура.',
    image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    category: 'Арт',
    creator: {
      username: 'art_gallery',
      name: 'Анна Власова',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80'
    },
    likes: 830,
    likedByMe: false,
    link: 'https://example.com/fluid-art-workshop',
    date: '2026-06-22',
    comments: []
  },
  {
    id: 'pin-15',
    title: 'Современный минималистичный постер',
    description: 'Простая художественная композиция из геометрических фигур и природных мотивов. Прекрасный элемент декора.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&auto=format&fit=crop&q=80',
    category: 'Арт',
    creator: {
      username: 'graphic_factory',
      name: 'Ретро Принт',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&auto=format&fit=crop&q=80'
    },
    likes: 295,
    likedByMe: false,
    link: 'https://example.com/minimalist-posters',
    date: '2026-06-05',
    comments: []
  }
];

export const SUGGESTED_SEARCHES = [
  'Дизайн гостиной',
  'Путешествие в горы',
  'Пицца рецепт',
  'Флюид арт',
  'Минимализм в интерьере',
  'Эйфелева башня'
];

export const CATEGORIES = [
  { id: 'all', name: 'Все пины' },
  { id: 'interior', name: 'Интерьер', tag: 'Интерьер' },
  { id: 'travel', name: 'Путешествия', tag: 'Путешествия' },
  { id: 'nature', name: 'Природа', tag: 'Природа' },
  { id: 'architecture', name: 'Архитектура', tag: 'Архитектура' },
  { id: 'food', name: 'Еда', tag: 'Еда' },
  { id: 'art', name: 'Арт', tag: 'Арт' }
];
