// Pinterest Clone - Core Application Logic
import { CURRENT_USER, MOCK_USERS, INITIAL_BOARDS, INITIAL_PINS, INITIAL_CHATS, SUGGESTED_SEARCHES, CATEGORIES } from './data.js';

// --- Localizations Map ---
const LOCALES = {
  ru: {
    navHome: 'Главная',
    navCreate: 'Создать',
    popularSearches: 'Популярные поисковые запросы',
    settingsTitle: 'Настройки профиля',
    settingsAvatar: 'Ссылка на фото',
    settingsName: 'Публичное имя',
    settingsUsername: 'Имя пользователя',
    settingsBio: 'О себе',
    settingsSave: 'Сохранить',
    settingsLogout: 'Выйти',
    friendsTitle: 'Мои друзья',
    friendsAddPlaceholder: 'Добавить по @username...',
    recFriendsTitle: 'Рекомендации',
    catalogTitle: 'Каталог',
    catMenu: 'Меню',
    catCategories: 'Категории',
    catBoards: 'Мои доски',
    siteSettingsTitle: 'Настройки сайта',
    siteTheme: 'Тёмная тема',
    siteLang: 'Язык',
    siteDensity: 'Разметка сетки',
    siteDensityCompact: 'Компакт',
    siteDensityCozy: 'Стандарт',
    siteDensitySpacious: 'Широкая',
    siteReset: 'Сбросить данные',
    createDragtext: 'Перетащите сюда изображение или кликните',
    createSubtext: 'Рекомендуется использовать файлы JPG/PNG менее 20 МБ',
    createUrl: 'Или укажите прямую ссылку на изображение:',
    createBoardSelect: 'Выбрать доску',
    createCatSelect: 'Категория',
    chatTopTitle: 'Ваши сообщения',
    chatTopSubtitle: 'Общайтесь с друзьями и делитесь идеями',
    chatPlaceholder: 'Выберите друга в левой колонке, чтобы начать общение',
    loginUsername: 'Имя пользователя (username)',
    loginPassword: 'Пароль',
    loginSubmit: 'Войти',
    regName: 'Ваше имя (для отображения)',
    regUsername: 'Имя пользователя (уникальный @username)',
    regPassword: 'Пароль',
    regSubmit: 'Зарегистрироваться',
    savedTab: 'Сохраненные',
    createdTab: 'Созданные',
    shareProfile: 'Поделиться профилем',
    editProfile: 'Редактировать профиль',
    cancel: 'Отмена'
  },
  en: {
    navHome: 'Home',
    navCreate: 'Create',
    popularSearches: 'Popular Search Queries',
    settingsTitle: 'Profile Settings',
    settingsAvatar: 'Avatar URL',
    settingsName: 'Display Name',
    settingsUsername: 'Username',
    settingsBio: 'Bio',
    settingsSave: 'Save',
    settingsLogout: 'Log Out',
    friendsTitle: 'My Friends',
    friendsAddPlaceholder: 'Add by @username...',
    recFriendsTitle: 'Recommendations',
    catalogTitle: 'Catalog',
    catMenu: 'Menu',
    catCategories: 'Categories',
    catBoards: 'My Boards',
    siteSettingsTitle: 'Site Settings',
    siteTheme: 'Dark Theme',
    siteLang: 'Language',
    siteDensity: 'Grid Spacing',
    siteDensityCompact: 'Compact',
    siteDensityCozy: 'Standard',
    siteDensitySpacious: 'Spacious',
    siteReset: 'Reset App Data',
    createDragtext: 'Drag and drop an image or click to upload',
    createSubtext: 'High quality JPG/PNG files under 20 MB recommended',
    createUrl: 'Or enter direct image link address URL:',
    createBoardSelect: 'Select Board',
    createCatSelect: 'Category',
    chatTopTitle: 'Your Messages',
    chatTopSubtitle: 'Chat with friends and share inspiration',
    chatPlaceholder: 'Select a friend from the left sidebar to start chatting',
    loginUsername: 'Username',
    loginPassword: 'Password',
    loginSubmit: 'Log In',
    regName: 'Display Name',
    regUsername: 'Username (unique @username)',
    regPassword: 'Password',
    regSubmit: 'Register',
    savedTab: 'Saved',
    createdTab: 'Created',
    shareProfile: 'Share Profile',
    editProfile: 'Edit Profile',
    cancel: 'Cancel'
  }
};

// --- State Management ---
let state = {
  isLoggedIn: false,
  currentUser: {},
  users: [],
  pins: [],
  boards: [],
  chats: {},
  followedCreators: new Set(),
  currentView: 'feed', // 'feed', 'create', 'profile', 'chat'
  activeCategory: 'all',
  searchQuery: '',
  activeProfileTab: 'saved', // 'saved', 'created'
  activeBoardId: null, // If viewing a specific board's pins (either in feed or profile)
  openPin: null, // Currently opened pin in modal
  theme: 'light', // 'light' or 'dark'
  lang: 'ru', // 'ru' or 'en'
  density: 'cozy', // 'compact', 'cozy', 'spacious'
  activeChatFriend: null
};

// Helper: unique key for conversation thread (alphabetical sort order)
function getChatKey(u1, u2) {
  return [u1, u2].sort().join('_');
}

// --- Local Storage Initialization ---
function initLocalStorage() {
  if (!localStorage.getItem('pinterest_pins')) {
    localStorage.setItem('pinterest_pins', JSON.stringify(INITIAL_PINS));
  }
  if (!localStorage.getItem('pinterest_users')) {
    localStorage.setItem('pinterest_users', JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem('pinterest_theme')) {
    localStorage.setItem('pinterest_theme', 'light');
  }
  if (!localStorage.getItem('pinterest_logged_in')) {
    localStorage.setItem('pinterest_logged_in', 'false');
  }
  if (!localStorage.getItem('pinterest_chats')) {
    localStorage.setItem('pinterest_chats', JSON.stringify(INITIAL_CHATS));
  }
  if (!localStorage.getItem('pinterest_lang')) {
    localStorage.setItem('pinterest_lang', 'ru');
  }
  if (!localStorage.getItem('pinterest_density')) {
    localStorage.setItem('pinterest_density', 'cozy');
  }

  state.pins = JSON.parse(localStorage.getItem('pinterest_pins'));
  state.users = JSON.parse(localStorage.getItem('pinterest_users'));
  state.theme = localStorage.getItem('pinterest_theme');
  state.isLoggedIn = localStorage.getItem('pinterest_logged_in') === 'true';
  state.chats = JSON.parse(localStorage.getItem('pinterest_chats'));
  state.lang = localStorage.getItem('pinterest_lang');
  state.density = localStorage.getItem('pinterest_density');

  applyTheme(state.theme);
  setGridDensity(state.density);
  applyLocale(state.lang);

  if (state.isLoggedIn) {
    const savedUser = localStorage.getItem('pinterest_current_user');
    if (savedUser) {
      state.currentUser = JSON.parse(savedUser);
      loadUserSpecificData(state.currentUser.username);
    } else {
      state.isLoggedIn = false;
      localStorage.setItem('pinterest_logged_in', 'false');
    }
  }
}

function loadUserSpecificData(username) {
  const followedKey = `pinterest_followed_${username}`;
  if (!localStorage.getItem(followedKey)) {
    localStorage.setItem(followedKey, JSON.stringify([]));
  }
  state.followedCreators = new Set(JSON.parse(localStorage.getItem(followedKey)));

  const boardsKey = `pinterest_boards_${username}`;
  if (!localStorage.getItem(boardsKey)) {
    if (username === 'creative_mind') {
      localStorage.setItem(boardsKey, JSON.stringify(INITIAL_BOARDS));
    } else if (username === 'wanderlust_travel') {
      const mariaBoards = [
        { id: 'board-maria-1', name: 'Мои путешествия', pinIds: ['pin-2', 'pin-8', 'pin-12'] },
        { id: 'board-maria-2', name: 'Природа Альп', pinIds: ['pin-9', 'pin-3'] }
      ];
      localStorage.setItem(boardsKey, JSON.stringify(mariaBoards));
    } else {
      const defaultBoards = [
        { id: `board-${username}-1`, name: 'Моя доска', pinIds: [] }
      ];
      localStorage.setItem(boardsKey, JSON.stringify(defaultBoards));
    }
  }
  state.boards = JSON.parse(localStorage.getItem(boardsKey));
}

function saveState() {
  localStorage.setItem('pinterest_pins', JSON.stringify(state.pins));
  localStorage.setItem('pinterest_users', JSON.stringify(state.users));
  localStorage.setItem('pinterest_logged_in', state.isLoggedIn ? 'true' : 'false');
  localStorage.setItem('pinterest_theme', state.theme);
  localStorage.setItem('pinterest_chats', JSON.stringify(state.chats));
  localStorage.setItem('pinterest_lang', state.lang);
  localStorage.setItem('pinterest_density', state.density);

  if (state.isLoggedIn && state.currentUser.username) {
    localStorage.setItem('pinterest_current_user', JSON.stringify(state.currentUser));
    localStorage.setItem(`pinterest_followed_${state.currentUser.username}`, JSON.stringify(Array.from(state.followedCreators)));
    localStorage.setItem(`pinterest_boards_${state.currentUser.username}`, JSON.stringify(state.boards));

    const uIdx = state.users.findIndex(u => u.username === state.currentUser.username);
    if (uIdx !== -1) {
      state.users[uIdx] = { ...state.users[uIdx], ...state.currentUser };
      localStorage.setItem('pinterest_users', JSON.stringify(state.users));
    }
  } else {
    localStorage.removeItem('pinterest_current_user');
  }
}

// --- Theme Switcher ---
function applyTheme(theme) {
  state.theme = theme;
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// --- Grid Density Switcher ---
function setGridDensity(density) {
  state.density = density;
  document.body.classList.remove('density-compact', 'density-spacious');
  
  if (density === 'compact') {
    document.body.classList.add('density-compact');
  } else if (density === 'spacious') {
    document.body.classList.add('density-spacious');
  }

  // Highlight active button indicator on density controls
  const btnCompact = document.getElementById('density-compact-btn');
  const btnCozy = document.getElementById('density-cozy-btn');
  const btnSpacious = document.getElementById('density-spacious-btn');
  
  if (btnCompact && btnCozy && btnSpacious) {
    btnCompact.classList.remove('active');
    btnCozy.classList.remove('active');
    btnSpacious.classList.remove('active');

    if (density === 'compact') btnCompact.classList.add('active');
    if (density === 'cozy') btnCozy.classList.add('active');
    if (density === 'spacious') btnSpacious.classList.add('active');
  }
}

// --- Localizations Apply Logic ---
function applyLocale(lang) {
  state.lang = lang;
  const dict = LOCALES[lang] || LOCALES.ru;

  // Header Navs
  const navHomeBtn = document.getElementById('nav-home');
  const navCreateBtn = document.getElementById('nav-create');
  const sideNavHomeBtn = document.getElementById('side-nav-home');
  const sideNavCreateBtn = document.getElementById('side-nav-create');
  const sideNavProfileBtn = document.getElementById('side-nav-profile');
  const sideNavChatBtn = document.getElementById('side-nav-chat');

  if (navHomeBtn) navHomeBtn.textContent = dict.navHome;
  if (navCreateBtn) navCreateBtn.textContent = dict.navCreate;
  if (sideNavHomeBtn) sideNavHomeBtn.querySelector('span').textContent = dict.navHome;
  if (sideNavCreateBtn) sideNavCreateBtn.querySelector('span').textContent = dict.navCreate;
  if (sideNavProfileBtn) sideNavProfileBtn.querySelector('span').textContent = dict.savedTab;
  if (sideNavChatBtn) sideNavChatBtn.querySelector('span').textContent = dict.navHome === 'Home' ? 'Chat' : 'Чат';

  // Popular searches
  const popularSearches = document.getElementById('label-popular-searches');
  if (popularSearches) popularSearches.textContent = dict.popularSearches;

  // Profile Settings form labels (inside sliding drawer)
  const settingsTitle = document.getElementById('label-settings-title');
  const labelAvatar = document.getElementById('label-settings-avatar');
  const labelName = document.getElementById('label-settings-name');
  const labelUsername = document.getElementById('label-settings-username');
  const labelBio = document.getElementById('label-settings-bio');
  const saveBtn = document.getElementById('save-settings-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const profileEditCancelBtn = document.getElementById('profile-edit-cancel');

  if (settingsTitle) settingsTitle.textContent = dict.settingsTitle;
  if (labelAvatar) labelAvatar.textContent = dict.settingsAvatar;
  if (labelName) labelName.textContent = dict.settingsName;
  if (labelUsername) labelUsername.textContent = dict.settingsUsername;
  if (labelBio) labelBio.textContent = dict.settingsBio;
  if (saveBtn) saveBtn.textContent = dict.settingsSave;
  if (logoutBtn) logoutBtn.textContent = dict.settingsLogout;
  if (profileEditCancelBtn) profileEditCancelBtn.textContent = dict.cancel;

  // Edit profile button label
  const labelProfileEdit = document.getElementById('label-profile-edit');
  if (labelProfileEdit) labelProfileEdit.textContent = dict.editProfile;

  // Chat View Friends
  const friendsTitle = document.getElementById('label-friends-title');
  const recFriendsTitle = document.getElementById('label-rec-friends-title');
  const addFriendInputEl = document.getElementById('add-friend-input');

  if (friendsTitle) friendsTitle.textContent = dict.friendsTitle;
  if (recFriendsTitle) recFriendsTitle.textContent = dict.recFriendsTitle;
  if (addFriendInputEl) addFriendInputEl.placeholder = dict.friendsAddPlaceholder;

  // Left sidebar headings
  const catalogTitle = document.getElementById('label-catalog-title');
  const catMenu = document.getElementById('label-cat-menu');
  const catCategories = document.getElementById('label-cat-categories');
  const catBoards = document.getElementById('label-cat-boards');

  if (catalogTitle) catalogTitle.textContent = dict.catalogTitle;
  if (catMenu) catMenu.textContent = dict.catMenu;
  if (catCategories) catCategories.textContent = dict.catCategories;
  if (catBoards) catBoards.textContent = dict.catBoards;

  // Site settings panel
  const siteSettingsTitle = document.getElementById('label-site-settings-title');
  const siteTheme = document.getElementById('label-site-theme');
  const siteLang = document.getElementById('label-site-lang');
  const siteDensity = document.getElementById('label-site-density');
  const siteReset = document.getElementById('label-site-reset');
  const compactBtn = document.getElementById('density-compact-btn');
  const cozyBtn = document.getElementById('density-cozy-btn');
  const spaciousBtn = document.getElementById('density-spacious-btn');

  if (siteSettingsTitle) siteSettingsTitle.textContent = dict.siteSettingsTitle;
  if (siteTheme) siteTheme.textContent = dict.siteTheme;
  if (siteLang) siteLang.textContent = dict.siteLang;
  if (siteDensity) siteDensity.textContent = dict.siteDensity;
  if (siteReset) siteReset.textContent = dict.siteReset;
  if (compactBtn) compactBtn.textContent = dict.siteDensityCompact;
  if (cozyBtn) cozyBtn.textContent = dict.siteDensityCozy;
  if (spaciousBtn) spaciousBtn.textContent = dict.siteDensitySpacious;

  // Create page
  const createDragtext = document.getElementById('label-create-dragtext');
  const createSubtext = document.getElementById('label-create-subtext');
  const createUrl = document.getElementById('label-create-url');
  const createBoardSelect = document.getElementById('label-create-board-select');
  const createCatSelect = document.getElementById('label-create-cat-select');

  if (createDragtext) createDragtext.textContent = dict.createDragtext;
  if (createSubtext) createSubtext.textContent = dict.createSubtext;
  if (createUrl) createUrl.textContent = dict.createUrl;
  if (createBoardSelect) createBoardSelect.textContent = dict.createBoardSelect;
  if (createCatSelect) createCatSelect.textContent = dict.createCatSelect;

  // Chat window labels
  const chatTopTitle = document.getElementById('label-chat-top-title');
  const chatTopSubtitle = document.getElementById('label-chat-top-subtitle');
  const chatPlaceholderText = document.getElementById('label-chat-placeholder');

  if (chatTopTitle) chatTopTitle.textContent = dict.chatTopTitle;
  if (chatTopSubtitle) chatTopSubtitle.textContent = dict.chatTopSubtitle;
  if (chatPlaceholderText) chatPlaceholderText.textContent = dict.chatPlaceholder;

  // Auth Card
  const labelLoginUsername = document.getElementById('label-login-username');
  const labelLoginPassword = document.getElementById('label-login-password');
  const btnLoginSubmit = document.getElementById('btn-login-submit');
  const labelRegName = document.getElementById('label-reg-name');
  const labelRegUsername = document.getElementById('label-reg-username');
  const labelRegPassword = document.getElementById('label-reg-password');
  const btnRegSubmit = document.getElementById('btn-reg-submit');

  if (labelLoginUsername) labelLoginUsername.textContent = dict.loginUsername;
  if (labelLoginPassword) labelLoginPassword.textContent = dict.loginPassword;
  if (btnLoginSubmit) btnLoginSubmit.textContent = dict.loginSubmit;
  if (labelRegName) labelRegName.textContent = dict.regName;
  if (labelRegUsername) labelRegUsername.textContent = dict.regUsername;
  if (labelRegPassword) labelRegPassword.textContent = dict.regPassword;
  if (btnRegSubmit) btnRegSubmit.textContent = dict.regSubmit;

  // Profile tabs
  const profileTabSaved = document.getElementById('tab-saved');
  const profileTabCreated = document.getElementById('tab-created');
  const profileShareBtn = document.getElementById('profile-share-btn');

  if (profileTabSaved) profileTabSaved.textContent = dict.savedTab;
  if (profileTabCreated) profileTabCreated.textContent = dict.createdTab;
  if (profileShareBtn) profileShareBtn.textContent = dict.shareProfile;

  // Language dropdown select state
  const langSelect = document.getElementById('site-lang-select');
  if (langSelect) langSelect.value = lang;
}

// --- DOM Query Elements ---
const views = {
  feed: document.getElementById('feed-view'),
  create: document.getElementById('create-view'),
  profile: document.getElementById('profile-view'),
  chat: document.getElementById('chat-view')
};

const navLinks = {
  home: document.getElementById('nav-home'),
  create: document.getElementById('nav-create'),
  profileImg: document.getElementById('nav-profile-img'),
  logoHome: document.getElementById('logo-home-trigger')
};

const headerChatBtn = document.getElementById('header-chat-btn');

// Search elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const searchSuggestions = document.getElementById('search-suggestions');
const suggestionsList = document.getElementById('suggestions-list');

// Feeds and grids
const pinsGridFeed = document.getElementById('pins-grid-feed');
const pinsGridCreated = document.getElementById('pins-grid-created');
const boardsGridSaved = document.getElementById('boards-grid-saved');
const pinsGridBoardPins = document.getElementById('pins-grid-board-pins');

// Profile tabs and section toggles
const tabSaved = document.getElementById('tab-saved');
const tabCreated = document.getElementById('tab-created');
const savedSection = document.getElementById('profile-saved-section');
const createdSection = document.getElementById('profile-created-section');
const boardDetailsView = document.getElementById('board-details-view');
const boardBackBtn = document.getElementById('board-back-btn');
const currentBoardTitle = document.getElementById('current-board-title');
const currentBoardCount = document.getElementById('current-board-count');

// Detail Modal elements
const pinDetailModal = document.getElementById('pin-detail-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalImg = document.getElementById('modal-img');
const modalWebsiteLink = document.getElementById('modal-website-link');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalAuthorImg = document.getElementById('modal-author-img');
const modalAuthorName = document.getElementById('modal-author-name');
const modalAuthorFollowers = document.getElementById('modal-author-followers');
const modalFollowBtn = document.getElementById('modal-follow-btn');
const modalLikesNum = document.getElementById('modal-likes-num');
const modalLikeBtn = document.getElementById('modal-like-btn');
const modalCommentsList = document.getElementById('modal-comments-list');
const modalCommentInput = document.getElementById('modal-comment-input');
const modalCommentSubmitBtn = document.getElementById('modal-comment-submit');
const modalMyAvatar = document.getElementById('modal-my-avatar');

// Modal Board selection dropdown
const modalBoardSelectTrigger = document.getElementById('modal-board-select-trigger');
const modalSelectedBoardName = document.getElementById('modal-selected-board-name');
const modalBoardsDropdown = document.getElementById('modal-boards-dropdown');
const modalSaveBtn = document.getElementById('modal-save-btn');

// Create Board Dialog
const createBoardModalDialog = document.getElementById('create-board-modal-dialog');
const triggerCreateBoardBtn = document.getElementById('trigger-create-board');
const cancelCreateBoardBtn = document.getElementById('cancel-create-board');
const confirmCreateBoardBtn = document.getElementById('confirm-create-board');
const newBoardNameInput = document.getElementById('new-board-name');

// Create Pin View elements
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const previewImg = document.getElementById('preview-img');
const previewChangeOverlay = document.getElementById('preview-change-overlay');
const imageUrlInput = document.getElementById('image-url-input');
const pinTitleInput = document.getElementById('pin-title');
const pinDescInput = document.getElementById('pin-desc');
const pinLinkInput = document.getElementById('pin-link');
const pinBoardSelect = document.getElementById('pin-board-select');
const pinCategorySelect = document.getElementById('pin-category-select');
const submitPinBtn = document.getElementById('submit-pin-btn');

// AUTHENTICATION OVERLAY ELEMENTS
const authOverlay = document.getElementById('auth-overlay');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authToggleBtn = document.getElementById('auth-toggle-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authTitle = document.getElementById('auth-title');
const authErrorMsg = document.getElementById('auth-error-msg');

// CHAT VIEW FRIENDS LIST ELEMENTS
const profileFriendsList = document.getElementById('profile-friends-list');
const profileRecommendationsList = document.getElementById('profile-recommendations-list');
const addFriendInput = document.getElementById('add-friend-input');
const addFriendBtn = document.getElementById('add-friend-btn');
const addFriendError = document.getElementById('add-friend-error');

// ACTIVE CHAT PANEL (INSIDE CENTER COLUMN)
const chatPlaceholder = document.getElementById('chat-placeholder');
const chatActivePanel = document.getElementById('chat-active-panel');
const chatFriendAvatar = document.getElementById('chat-friend-avatar');
const chatFriendName = document.getElementById('chat-friend-name');
const chatFriendUsername = document.getElementById('chat-friend-username');
const chatMessagesLog = document.getElementById('chat-messages-log');
const chatMessageInput = document.getElementById('chat-message-input');
const chatSendBtn = document.getElementById('chat-send-btn');

// LEFT SIDEBAR: CATALOG ELEMENTS
const leftCatalogSidebar = document.getElementById('left-catalog-sidebar');
const leftSidebarBackdrop = document.getElementById('left-sidebar-backdrop');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const leftDrawerCloseBtn = document.getElementById('left-drawer-close');
const sideCategoriesList = document.getElementById('side-categories-list');
const sideBoardsList = document.getElementById('side-boards-list');

// Sidebar shortcuts
const sideNavHome = document.getElementById('side-nav-home');
const sideNavCreate = document.getElementById('side-nav-create');
const sideNavProfile = document.getElementById('side-nav-profile');
const sideNavChat = document.getElementById('side-nav-chat');

// PROFILE EDIT SLIDING DRAWER ELEMENTS
const profileEditBtn = document.getElementById('profile-edit-btn');
const profileEditDrawer = document.getElementById('profile-edit-drawer');
const profileEditBackdrop = document.getElementById('profile-edit-backdrop');
const profileEditClose = document.getElementById('profile-edit-close');
const profileEditCancel = document.getElementById('profile-edit-cancel');

// PROFILE EDIT FORM FIELDS
const settingsAvatarUrl = document.getElementById('settings-avatar-url');
const settingsAvatarPreview = document.getElementById('settings-avatar-preview');
const settingsDisplayName = document.getElementById('settings-display-name');
const settingsUsername = document.getElementById('settings-username');
const settingsBio = document.getElementById('settings-bio');
const themeToggleCheck = document.getElementById('theme-toggle-check');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const logoutBtn = document.getElementById('logout-btn');
const settingsUsernameError = document.getElementById('settings-username-error');

let uploadedImageBase64 = null; 

// --- Routing & View Toggles ---
function switchView(viewName) {
  state.currentView = viewName;
  
  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.add('active');
    } else {
      views[key].classList.remove('active');
    }
  });

  navLinks.home.classList.remove('active');
  navLinks.create.classList.remove('active');
  headerChatBtn.classList.remove('active');
  
  if (viewName === 'feed') {
    navLinks.home.classList.add('active');
    renderFeed();
  }

  if (viewName === 'create') {
    navLinks.create.classList.add('active');
    setupCreatePinPage();
  }

  if (viewName === 'profile') {
    renderProfile();
  }

  if (viewName === 'chat') {
    headerChatBtn.classList.add('active');
    renderChatsInterface();
  }

  // Close slide drawers if under 1024px
  closeLeftSidebar();
  closeProfileEditDrawer();
  
  // Highlight active side navigation lists
  syncSidebarCatalogHighlights();
}

// Left Catalog Sidebar Mobile toggles
function toggleLeftSidebar() {
  leftCatalogSidebar.classList.toggle('active');
  leftSidebarBackdrop.classList.toggle('active');
}

function openLeftSidebar() {
  leftCatalogSidebar.classList.add('active');
  leftSidebarBackdrop.classList.add('active');
}

function closeLeftSidebar() {
  leftCatalogSidebar.classList.remove('active');
  leftSidebarBackdrop.classList.remove('active');
}

// PROFILE EDIT SLIDING DRAWER CONTROLLER HELPERS
function openProfileEditDrawer() {
  profileEditDrawer.classList.add('active');
  profileEditBackdrop.classList.add('active');
  setupSettingsPage();
}

function closeProfileEditDrawer() {
  profileEditDrawer.classList.remove('active');
  profileEditBackdrop.classList.remove('active');
}

// Highlight the currently active sidebar navigation item
function syncSidebarCatalogHighlights() {
  document.querySelectorAll('.catalog-item').forEach(el => el.classList.remove('active'));

  if (state.currentView === 'feed') {
    if (state.activeBoardId !== null) {
      const boardEl = document.querySelector(`.catalog-item[data-board-id="${state.activeBoardId}"]`);
      if (boardEl) boardEl.classList.add('active');
    } else {
      if (state.activeCategory === 'all') {
        sideNavHome.classList.add('active');
      } else {
        const catEl = document.querySelector(`.catalog-item[data-cat-id="${state.activeCategory}"]`);
        if (catEl) catEl.classList.add('active');
      }
    }
  } else if (state.currentView === 'create') {
    sideNavCreate.classList.add('active');
  } else if (state.currentView === 'profile') {
    sideNavProfile.classList.add('active');
  } else if (state.currentView === 'chat') {
    sideNavChat.classList.add('active');
  }
}

// UX Settings Action Helper (routes user to Profile page, opens edit drawer)
function triggerSettingsAction() {
  switchView('profile');
  setTimeout(() => {
    openProfileEditDrawer();
    settingsDisplayName.focus();
  }, 350);
}

// --- Authentication Controllers ---
function toggleAuthForm() {
  authErrorMsg.classList.add('hidden');
  if (loginForm.classList.contains('hidden')) {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authTitle.textContent = state.lang === 'ru' ? 'Добро пожаловать в Pinterest' : 'Welcome to Pinterest';
    authToggleText.textContent = state.lang === 'ru' ? 'Впервые на Pinterest?' : 'New to Pinterest?';
    authToggleBtn.textContent = state.lang === 'ru' ? 'Создать аккаунт' : 'Create account';
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    authTitle.textContent = state.lang === 'ru' ? 'Создайте аккаунт' : 'Create account';
    authToggleText.textContent = state.lang === 'ru' ? 'Уже есть аккаунт?' : 'Already have account?';
    authToggleBtn.textContent = state.lang === 'ru' ? 'Войти' : 'Log In';
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  authErrorMsg.classList.add('hidden');
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const matchedUser = state.users.find(u => u.username === username && u.password === password);

  if (matchedUser) {
    state.isLoggedIn = true;
    state.currentUser = matchedUser;
    loadUserSpecificData(username);
    saveState();
    loginUserSuccess();
  } else {
    authErrorMsg.textContent = state.lang === 'ru' ? 'Неверное имя пользователя или пароль' : 'Invalid username or password';
    authErrorMsg.classList.remove('hidden');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();
  authErrorMsg.classList.add('hidden');
  const name = document.getElementById('reg-name').value.trim();
  const username = document.getElementById('reg-username').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const password = document.getElementById('reg-password').value;

  if (username.length < 3) {
    authErrorMsg.textContent = state.lang === 'ru' ? 'Имя пользователя должно быть не менее 3 символов (латиница)' : 'Username must be at least 3 chars long';
    authErrorMsg.classList.remove('hidden');
    return;
  }

  const exists = state.users.some(u => u.username === username);
  if (exists) {
    authErrorMsg.textContent = state.lang === 'ru' ? 'Это имя пользователя уже занято' : 'Username already taken';
    authErrorMsg.classList.remove('hidden');
    return;
  }

  const newUser = {
    username: username,
    password: password,
    name: name,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: state.lang === 'ru' ? 'Новый вдохновляющийся пользователь.' : 'New inspiration user.',
    followersCount: '0',
    followingCount: '0',
    savedPins: [],
    createdPins: [],
    friends: []
  };

  state.users.push(newUser);
  state.isLoggedIn = true;
  state.currentUser = newUser;
  loadUserSpecificData(username);
  saveState();
  loginUserSuccess();
}

function loginUserSuccess() {
  authOverlay.classList.add('hidden');
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('reg-name').value = '';
  document.getElementById('reg-username').value = '';
  document.getElementById('reg-password').value = '';
  
  navLinks.profileImg.querySelector('img').src = state.currentUser.avatar;

  setupSettingsPage(); // Initialize settings inputs
  renderSidebarCategories();
  renderSidebarBoards();
  renderFeed();
  renderChatsInterface(); 
  switchView('feed');
}

function handleLogout() {
  state.isLoggedIn = false;
  state.currentUser = {};
  state.boards = [];
  state.followedCreators = new Set();
  state.activeChatFriend = null;
  saveState();
  
  authOverlay.classList.remove('hidden');
  closeLeftSidebar();
  closeProfileEditDrawer();
}

// --- Render Sidebar Categories & Boards ---
function renderSidebarCategories() {
  sideCategoriesList.innerHTML = '';
  
  const categoryIcons = {
    all: 'fa-circle-nodes',
    interior: 'fa-couch',
    travel: 'fa-plane-departure',
    nature: 'fa-tree',
    architecture: 'fa-building',
    food: 'fa-utensils',
    art: 'fa-palette'
  };

  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `catalog-item ${state.activeCategory === cat.id && state.activeBoardId === null ? 'active' : ''}`;
    btn.setAttribute('data-cat-id', cat.id);
    btn.innerHTML = `
      <i class="fa-solid ${categoryIcons[cat.id] || 'fa-tag'} catalog-item-icon"></i>
      <span>${state.lang === 'ru' ? cat.name : (cat.id === 'all' ? 'All' : cat.tag)}</span>
    `;

    btn.addEventListener('click', () => {
      state.activeCategory = cat.id;
      state.activeBoardId = null;
      state.searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.remove('visible');

      switchView('feed');
      closeLeftSidebar();
    });

    sideCategoriesList.appendChild(btn);
  });
}

function renderSidebarBoards() {
  sideBoardsList.innerHTML = '';

  if (state.boards.length === 0) {
    sideBoardsList.innerHTML = `<div style="font-size: 13px; color: var(--gray-muted); padding-left: 12px;">${state.lang === 'ru' ? 'Нет досок' : 'No boards'}</div>`;
    return;
  }

  state.boards.forEach(board => {
    const btn = document.createElement('button');
    btn.className = `catalog-item ${state.activeBoardId === board.id ? 'active' : ''}`;
    btn.setAttribute('data-board-id', board.id);
    btn.innerHTML = `
      <i class="fa-solid fa-folder catalog-item-icon"></i>
      <span>${board.name}</span>
    `;

    btn.addEventListener('click', () => {
      state.activeBoardId = board.id;
      state.activeCategory = 'all';
      state.searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.remove('visible');

      switchView('feed');
      closeLeftSidebar();
    });

    sideBoardsList.appendChild(btn);
  });
}

// --- Render Pins Grid ---
function renderPinsGrid(pinsToRender, gridElement) {
  gridElement.innerHTML = '';
  if (pinsToRender.length === 0) {
    gridElement.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 0; color: var(--gray-muted); width: 100%;">
        <i class="fa-solid fa-compass" style="font-size: 40px; margin-bottom: 16px;"></i>
        <p style="font-size: 18px; font-weight: 500;">${state.lang === 'ru' ? 'Ничего не найдено' : 'Nothing found'}</p>
        <p style="font-size: 14px; margin-top: 8px;">${state.lang === 'ru' ? 'Попробуйте сбросить фильтры' : 'Try searching another keywords'}</p>
      </div>`;
    return;
  }

  pinsToRender.forEach(pin => {
    const card = document.createElement('div');
    card.className = 'pin-card';
    card.setAttribute('data-pin-id', pin.id);

    const isSaved = state.currentUser.savedPins ? state.currentUser.savedPins.includes(pin.id) : false;
    const savedBoard = state.boards.find(b => b.pinIds.includes(pin.id));
    const boardName = savedBoard ? savedBoard.name : (state.lang === 'ru' ? 'Идеи для дома' : 'Home ideas');

    card.innerHTML = `
      <div class="pin-card-media-wrapper">
        <img src="${pin.image}" alt="${pin.title}" class="pin-card-img" loading="lazy">
        <div class="pin-card-overlay">
          <div class="overlay-top">
            <button class="overlay-board-btn">${boardName}</button>
            <button class="overlay-save-btn ${isSaved ? 'saved' : ''}">${isSaved ? (state.lang === 'ru' ? 'Сохранено' : 'Saved') : (state.lang === 'ru' ? 'Сохранить' : 'Save')}</button>
          </div>
          <div class="overlay-bottom">
            ${pin.link ? `
              <a href="${pin.link}" target="_blank" class="overlay-link-btn" title="${pin.link}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <span>${new URL(pin.link).hostname}</span>
              </a>
            ` : '<div></div>'}
            <div class="overlay-actions">
              <button class="overlay-action-btn share-action-btn" title="${state.lang === 'ru' ? 'Поделиться' : 'Share'}">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
              </button>
              <button class="overlay-action-btn menu-action-btn" title="${state.lang === 'ru' ? 'Опции' : 'Options'}">
                <i class="fa-solid fa-ellipsis"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="pin-card-info">
        <div class="pin-card-title">${pin.title}</div>
        <div class="pin-card-creator">
          <div class="pin-card-creator-avatar">
            <img src="${pin.creator.avatar}" alt="${pin.creator.name}">
          </div>
          <div class="pin-card-creator-name">${pin.creator.name}</div>
        </div>
      </div>
    `;

    card.addEventListener('click', (e) => {
      const clickOverlayButton = e.target.closest('button') || e.target.closest('a');
      if (clickOverlayButton) {
        e.stopPropagation();
        if (clickOverlayButton.classList.contains('overlay-save-btn')) {
          toggleSavePinDirect(pin.id, clickOverlayButton);
        }
        if (clickOverlayButton.classList.contains('share-action-btn')) {
          navigator.clipboard.writeText(window.location.href).then(() => {
            alert(state.lang === 'ru' ? 'Ссылка скопирована в буфер обмена!' : 'Link copied to clipboard!');
          });
        }
        return;
      }
      openPinDetails(pin);
    });

    gridElement.appendChild(card);
  });
}

function toggleSavePinDirect(pinId, buttonEl) {
  const user = state.currentUser;
  if (!user.savedPins) user.savedPins = [];
  const isSaved = user.savedPins.includes(pinId);

  if (isSaved) {
    user.savedPins = user.savedPins.filter(id => id !== pinId);
    state.boards.forEach(b => {
      b.pinIds = b.pinIds.filter(id => id !== pinId);
    });
    buttonEl.textContent = state.lang === 'ru' ? 'Сохранить' : 'Save';
    buttonEl.classList.remove('saved');
  } else {
    user.savedPins.push(pinId);
    if (state.boards.length > 0) {
      if (!state.boards[0].pinIds.includes(pinId)) {
        state.boards[0].pinIds.push(pinId);
      }
    }
    buttonEl.textContent = state.lang === 'ru' ? 'Сохранено' : 'Saved';
    buttonEl.classList.add('saved');
  }
  
  saveState();
  const card = buttonEl.closest('.pin-card');
  if (card) {
    const boardBtn = card.querySelector('.overlay-board-btn');
    const savedBoard = state.boards.find(b => b.pinIds.includes(pinId));
    if (savedBoard && boardBtn) {
      boardBtn.textContent = savedBoard.name;
    }
  }
  renderSidebarBoards();
}

// --- Render Feed (Filtering by category, board or search) ---
function renderFeed() {
  let pinsToRender = [...state.pins];

  if (state.activeBoardId) {
    const board = state.boards.find(b => b.id === state.activeBoardId);
    if (board) {
      pinsToRender = pinsToRender.filter(pin => board.pinIds.includes(pin.id));
    }
  } else {
    if (state.activeCategory !== 'all') {
      const categoryObj = CATEGORIES.find(c => c.id === state.activeCategory);
      if (categoryObj && categoryObj.tag) {
        pinsToRender = pinsToRender.filter(pin => pin.category === categoryObj.tag);
      }
    }
  }

  if (state.searchQuery.trim() !== '') {
    const query = state.searchQuery.toLowerCase().trim();
    pinsToRender = pinsToRender.filter(pin => 
      pin.title.toLowerCase().includes(query) || 
      pin.description.toLowerCase().includes(query) ||
      pin.category.toLowerCase().includes(query)
    );
  }

  renderPinsGrid(pinsToRender, pinsGridFeed);
}

// --- Render Suggestions ---
function renderSearchSuggestions() {
  suggestionsList.innerHTML = '';
  SUGGESTED_SEARCHES.forEach(term => {
    const pill = document.createElement('div');
    pill.className = 'suggestion-pill';
    pill.textContent = term;
    pill.addEventListener('click', () => {
      searchInput.value = term;
      performSearch(term);
    });
    suggestionsList.appendChild(pill);
  });
}

function performSearch(query) {
  state.searchQuery = query;
  state.activeCategory = 'all';
  state.activeBoardId = null;

  renderSidebarCategories();
  renderSidebarBoards();

  searchSuggestions.classList.remove('active');
  
  if (query.trim() !== '') {
    clearSearchBtn.classList.add('visible');
  } else {
    clearSearchBtn.classList.remove('visible');
  }
  
  switchView('feed');
}

// --- Profile Page Handling ---
function renderProfile() {
  const user = state.currentUser;
  
  document.getElementById('profile-avatar-img').src = user.avatar;
  document.getElementById('profile-display-name').textContent = user.name;
  document.getElementById('profile-username').textContent = `@${user.username}`;
  document.getElementById('profile-bio').textContent = user.bio || (state.lang === 'ru' ? 'Нет описания.' : 'No bio.');
  document.getElementById('profile-followers-count').textContent = state.lang === 'ru' ? `${user.followersCount || 0} подписчиков` : `${user.followersCount || 0} followers`;
  document.getElementById('profile-following-count').textContent = state.lang === 'ru' ? `${user.followingCount || 0} подписок` : `${user.followingCount || 0} following`;

  tabSaved.classList.remove('active');
  tabCreated.classList.remove('active');
  
  savedSection.classList.add('hidden');
  createdSection.classList.add('hidden');
  boardDetailsView.classList.add('hidden');

  if (state.activeProfileTab === 'saved') {
    tabSaved.classList.add('active');
    if (state.activeBoardId && state.currentView === 'profile') {
      boardDetailsView.classList.remove('hidden');
      renderBoardDetails(state.activeBoardId);
    } else {
      savedSection.classList.remove('hidden');
      renderBoards();
    }
  } else if (state.activeProfileTab === 'created') {
    tabCreated.classList.add('active');
    createdSection.classList.remove('hidden');
    renderCreatedPins();
  }
}

function renderBoards() {
  boardsGridSaved.innerHTML = '';
  
  if (state.boards.length === 0) {
    boardsGridSaved.innerHTML = `<div style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--gray-muted); width: 100%;">${state.lang === 'ru' ? 'Нет досок. Создайте свою первую доску!' : 'No boards. Create your first board!'}</div>`;
    return;
  }

  state.boards.forEach(board => {
    const boardPins = state.pins.filter(pin => board.pinIds.includes(pin.id));
    const coverImages = boardPins.slice(0, 3).map(p => p.image);
    
    while (coverImages.length < 3) {
      coverImages.push('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23efefef"/></svg>');
    }

    const card = document.createElement('div');
    card.className = 'board-card';
    card.innerHTML = `
      <div class="board-collage">
        <div class="board-collage-main">
          <img src="${coverImages[0]}" alt="Cover">
        </div>
        <div class="board-collage-side">
          <div class="board-collage-thumb">
            <img src="${coverImages[1]}" alt="Thumb 1">
          </div>
          <div class="board-collage-thumb">
            <img src="${coverImages[2]}" alt="Thumb 2">
          </div>
        </div>
      </div>
      <div class="board-card-info">
        <div class="board-card-title">${board.name}</div>
        <div class="board-card-count">${board.pinIds.length} ${state.lang === 'ru' ? 'пинов' : 'pins'}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      state.activeBoardId = board.id;
      renderProfile();
    });

    boardsGridSaved.appendChild(card);
  });
}

function renderBoardDetails(boardId) {
  const board = state.boards.find(b => b.id === boardId);
  if (!board) return;

  currentBoardTitle.textContent = board.name;
  currentBoardCount.textContent = `${board.pinIds.length} ${state.lang === 'ru' ? 'пинов' : 'pins'}`;

  const boardPins = state.pins.filter(pin => board.pinIds.includes(pin.id));
  renderPinsGrid(boardPins, pinsGridBoardPins);
}

function renderCreatedPins() {
  const userPins = state.pins.filter(pin => pin.creator.username === state.currentUser.username);
  renderPinsGrid(userPins, pinsGridCreated);
}

// --- Chats Interface Operations (Left Sidebar inside dedicated View & Chat log) ---
function renderChatsInterface() {
  profileFriendsList.innerHTML = '';
  const friends = state.currentUser.friends || [];
  
  if (friends.length === 0) {
    profileFriendsList.innerHTML = `<div style="font-size: 12px; color: var(--gray-muted); padding: 8px 0; text-align: center;">${state.lang === 'ru' ? 'Друзей пока нет' : 'No friends yet'}</div>`;
  } else {
    friends.forEach(fUsername => {
      const friendUserObj = state.users.find(u => u.username === fUsername);
      if (!friendUserObj) return;

      const item = document.createElement('div');
      item.className = `friend-item ${state.activeChatFriend === fUsername ? 'active' : ''}`;
      item.innerHTML = `
        <div class="friend-avatar" style="width: 32px; height: 32px;">
          <img src="${friendUserObj.avatar}" alt="${friendUserObj.name}">
        </div>
        <div class="friend-info">
          <div class="friend-name" style="font-size: 13px;">${friendUserObj.name}</div>
          <div class="friend-username" style="font-size: 11px;">@${friendUserObj.username}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        state.activeChatFriend = fUsername;
        document.querySelectorAll('.friend-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        
        if (state.currentView !== 'chat') {
          switchView('chat');
        } else {
          openActiveChat(friendUserObj);
        }
      });

      profileFriendsList.appendChild(item);
    });
  }

  // Render recommendations list
  profileRecommendationsList.innerHTML = '';
  const friendsSet = new Set(friends);
  const recUsers = state.users.filter(u => 
    u.username !== state.currentUser.username && 
    !friendsSet.has(u.username)
  );

  if (recUsers.length === 0) {
    profileRecommendationsList.innerHTML = `<div style="font-size: 11px; color: var(--gray-muted); padding: 4px 0; text-align: center;">${state.lang === 'ru' ? 'Рекомендаций нет' : 'No recommendations'}</div>`;
  } else {
    recUsers.forEach(u => {
      const item = document.createElement('div');
      item.className = 'friend-item';
      item.style.cursor = 'default';
      item.innerHTML = `
        <div class="friend-avatar" style="width: 30px; height: 30px;">
          <img src="${u.avatar}" alt="${u.name}">
        </div>
        <div class="friend-info" style="flex-grow: 1; overflow: hidden;">
          <div class="friend-name" style="font-size: 12px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${u.name}</div>
          <div class="friend-username" style="font-size: 10px;">@${u.username}</div>
        </div>
        <button class="profile-btn primary add-rec-friend-btn" style="padding: 4px 8px; font-size: 10px; border-radius: 8px; height: auto; flex-shrink: 0; min-width: unset; width: auto; margin-left: 8px;" title="${state.lang === 'ru' ? 'Добавить друга' : 'Add friend'}">
          <i class="fa-solid fa-plus"></i>
        </button>
      `;

      const addBtn = item.querySelector('.add-rec-friend-btn');
      addBtn.addEventListener('click', () => {
        addFriendDirectly(u.username);
      });

      profileRecommendationsList.appendChild(item);
    });
  }

  if (state.currentView === 'chat') {
    if (state.activeChatFriend) {
      const friendObj = state.users.find(u => u.username === state.activeChatFriend);
      if (friendObj) {
        openActiveChat(friendObj);
      } else {
        state.activeChatFriend = null;
        showChatPlaceholder();
      }
    } else {
      showChatPlaceholder();
    }
  }
}

function showChatPlaceholder() {
  chatPlaceholder.classList.remove('hidden');
  chatActivePanel.classList.add('hidden');
}

// Open active chat log
function openActiveChat(friend) {
  chatPlaceholder.classList.add('hidden');
  chatActivePanel.classList.remove('hidden');

  chatFriendAvatar.src = friend.avatar;
  chatFriendName.textContent = friend.name;
  chatFriendUsername.textContent = `@${friend.username}`;

  renderChatHistory(friend.username);
}

function renderChatHistory(friendUsername) {
  chatMessagesLog.innerHTML = '';
  const key = getChatKey(state.currentUser.username, friendUsername);
  const thread = state.chats[key] || [];

  if (thread.length === 0) {
    chatMessagesLog.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--gray-muted); font-size: 12px; font-style: italic;">${state.lang === 'ru' ? 'Начало беседы. Напишите приветствие!' : 'Conversation start. Type hello!'}</div>`;
    return;
  }

  thread.forEach(msg => {
    const isSent = msg.sender === state.currentUser.username;
    const msgRow = document.createElement('div');
    msgRow.className = `chat-msg-row ${isSent ? 'sent' : 'received'}`;
    msgRow.innerHTML = `
      <div class="chat-msg-bubble">
        <div class="chat-msg-text">${msg.text}</div>
        <span class="chat-msg-meta">${msg.timestamp}</span>
      </div>
    `;
    chatMessagesLog.appendChild(msgRow);
  });

  chatMessagesLog.scrollTop = chatMessagesLog.scrollHeight;
}

function sendChatMessage() {
  const text = chatMessageInput.value.trim();
  if (text === '' || !state.activeChatFriend) return;

  const key = getChatKey(state.currentUser.username, state.activeChatFriend);
  if (!state.chats[key]) {
    state.chats[key] = [];
  }

  const timeStr = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  const newMsg = {
    sender: state.currentUser.username,
    text: text,
    timestamp: timeStr
  };

  state.chats[key].push(newMsg);
  saveState();
  renderChatHistory(state.activeChatFriend);
  chatMessageInput.value = '';
}

function addFriendByUsername() {
  addFriendError.classList.add('hidden');
  let fUsername = addFriendInput.value.trim().toLowerCase();
  
  if (fUsername.startsWith('@')) {
    fUsername = fUsername.substring(1);
  }

  if (fUsername === '') return;

  if (fUsername === state.currentUser.username) {
    addFriendError.textContent = state.lang === 'ru' ? 'Нельзя добавить себя в друзья' : 'Cannot add yourself';
    addFriendError.classList.remove('hidden');
    return;
  }

  const targetUserObj = state.users.find(u => u.username === fUsername);
  if (!targetUserObj) {
    addFriendError.textContent = state.lang === 'ru' ? 'Пользователь не найден' : 'User not found';
    addFriendError.classList.remove('hidden');
    return;
  }

  if (!state.currentUser.friends) state.currentUser.friends = [];
  if (state.currentUser.friends.includes(fUsername)) {
    addFriendError.textContent = state.lang === 'ru' ? 'Этот пользователь уже в вашем списке друзей' : 'Already in friends list';
    addFriendError.classList.remove('hidden');
    return;
  }

  state.currentUser.friends.push(fUsername);
  
  const targetIdx = state.users.findIndex(u => u.username === fUsername);
  if (targetIdx !== -1) {
    if (!state.users[targetIdx].friends) state.users[targetIdx].friends = [];
    if (!state.users[targetIdx].friends.includes(state.currentUser.username)) {
      state.users[targetIdx].friends.push(state.currentUser.username);
    }
  }

  saveState();
  addFriendInput.value = '';
  renderChatsInterface();
}

function addFriendDirectly(username) {
  if (!state.currentUser.friends) state.currentUser.friends = [];
  if (!state.currentUser.friends.includes(username)) {
    state.currentUser.friends.push(username);
  }

  const targetIdx = state.users.findIndex(u => u.username === username);
  if (targetIdx !== -1) {
    if (!state.users[targetIdx].friends) state.users[targetIdx].friends = [];
    if (!state.users[targetIdx].friends.includes(state.currentUser.username)) {
      state.users[targetIdx].friends.push(state.currentUser.username);
    }
  }

  saveState();
  renderChatsInterface();
}

// --- Create Board Actions ---
function openCreateBoardDialog() {
  createBoardModalDialog.classList.add('active');
  newBoardNameInput.value = '';
  newBoardNameInput.focus();
}

function closeCreateBoardDialog() {
  createBoardModalDialog.classList.remove('active');
}

function createNewBoard() {
  const name = newBoardNameInput.value.trim();
  if (name === '') return;

  const newId = `board-${state.currentUser.username}-${Date.now()}`;
  const newBoard = {
    id: newId,
    name: name,
    pinIds: []
  };

  state.boards.push(newBoard);
  saveState();
  closeCreateBoardDialog();
  
  if (state.currentView === 'profile') {
    renderBoards();
  }
  if (state.openPin) {
    renderModalBoardDropdown(state.openPin);
  }
  setupCreatePinPage(); 
  
  renderSidebarBoards();
}

// --- Settings Form Loading ---
function setupSettingsPage() {
  const user = state.currentUser;
  settingsAvatarUrl.value = user.avatar || '';
  settingsAvatarPreview.src = user.avatar || '';
  settingsDisplayName.value = user.name || '';
  settingsUsername.value = user.username || '';
  settingsBio.value = user.bio || '';
  themeToggleCheck.checked = state.theme === 'dark';
  settingsUsernameError.style.display = 'none';
}

function handleAvatarUrlChange() {
  const val = settingsAvatarUrl.value.trim();
  if (val !== '') {
    settingsAvatarPreview.src = val;
  }
}

function saveSettings() {
  const name = settingsDisplayName.value.trim();
  const username = settingsUsername.value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  const bio = settingsBio.value.trim();
  const avatar = settingsAvatarUrl.value.trim();
  const isDark = themeToggleCheck.checked;

  if (name === '' || username === '') {
    alert(state.lang === 'ru' ? 'Имя и имя пользователя обязательны!' : 'Name and username are required!');
    return;
  }

  if (username !== state.currentUser.username) {
    const exists = state.users.some(u => u.username === username);
    if (exists) {
      settingsUsernameError.style.display = 'block';
      return;
    }
  }

  const targetTheme = isDark ? 'dark' : 'light';
  applyTheme(targetTheme);

  const oldUsername = state.currentUser.username;
  if (username !== oldUsername) {
    const oldBoards = localStorage.getItem(`pinterest_boards_${oldUsername}`);
    if (oldBoards) {
      localStorage.setItem(`pinterest_boards_${username}`, oldBoards);
      localStorage.removeItem(`pinterest_boards_${oldUsername}`);
    }
    const oldFollowed = localStorage.getItem(`pinterest_followed_${oldUsername}`);
    if (oldFollowed) {
      localStorage.setItem(`pinterest_followed_${username}`, oldFollowed);
      localStorage.removeItem(`pinterest_followed_${oldUsername}`);
    }

    Object.keys(state.chats).forEach(oldKey => {
      if (oldKey.includes(oldUsername)) {
        const parts = oldKey.split('_');
        const otherUser = parts.find(p => p !== oldUsername);
        const newKey = getChatKey(username, otherUser);
        
        const updatedMsgs = state.chats[oldKey].map(msg => {
          if (msg.sender === oldUsername) {
            return { ...msg, sender: username };
          }
          return msg;
        });

        state.chats[newKey] = updatedMsgs;
        delete state.chats[oldKey];
      }
    });

    state.users.forEach(u => {
      if (u.friends) {
        u.friends = u.friends.map(f => f === oldUsername ? username : f);
      }
    });

    state.pins.forEach(pin => {
      if (pin.creator.username === oldUsername) {
        pin.creator.username = username;
        pin.creator.name = name;
        pin.creator.avatar = avatar;
      }
      if (pin.comments) {
        pin.comments.forEach(c => {
          if (c.username === oldUsername) {
            c.username = username;
            c.avatar = avatar;
          }
        });
      }
    });
  } else {
    state.pins.forEach(pin => {
      if (pin.creator.username === username) {
        pin.creator.name = name;
        pin.creator.avatar = avatar;
      }
      if (pin.comments) {
        pin.comments.forEach(c => {
          if (c.username === username) {
            c.avatar = avatar;
          }
        });
      }
    });
  }

  state.currentUser.name = name;
  state.currentUser.username = username;
  state.currentUser.bio = bio;
  state.currentUser.avatar = avatar;

  saveState();

  if (username !== oldUsername) {
    loadUserSpecificData(username);
    if (state.activeChatFriend) {
      state.activeChatFriend = null;
    }
  }

  navLinks.profileImg.querySelector('img').src = avatar;

  renderSidebarCategories();
  renderSidebarBoards();

  closeProfileEditDrawer();

  if (state.currentView === 'profile') {
    renderProfile();
  }

  alert(state.lang === 'ru' ? 'Настройки профиля успешно сохранены!' : 'Profile settings saved successfully!');
}

// --- Pin Detail Modal Actions ---
function openPinDetails(pin) {
  state.openPin = pin;
  pinDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden'; 

  modalImg.src = pin.image;
  modalTitle.textContent = pin.title;
  modalDescription.textContent = pin.description || (state.lang === 'ru' ? 'Описание отсутствует.' : 'No description.');
  
  if (pin.link) {
    modalWebsiteLink.href = pin.link;
    modalWebsiteLink.textContent = new URL(pin.link).hostname;
    modalWebsiteLink.classList.remove('hidden');
  } else {
    modalWebsiteLink.classList.add('hidden');
  }

  modalAuthorImg.src = pin.creator.avatar;
  modalAuthorName.textContent = pin.creator.name;
  
  const isFollowing = state.followedCreators.has(pin.creator.username);
  if (pin.creator.username === state.currentUser.username) {
    modalFollowBtn.classList.add('hidden');
    modalAuthorFollowers.textContent = state.lang === 'ru' ? `${state.currentUser.followersCount || 0} подписчиков` : `${state.currentUser.followersCount || 0} followers`;
  } else {
    modalFollowBtn.classList.remove('hidden');
    if (isFollowing) {
      modalFollowBtn.textContent = state.lang === 'ru' ? 'Вы подписаны' : 'Following';
      modalFollowBtn.classList.add('following');
      modalAuthorFollowers.textContent = state.lang === 'ru' ? '12.6k подписчиков' : '12.6k followers';
    } else {
      modalFollowBtn.textContent = state.lang === 'ru' ? 'Подписаться' : 'Follow';
      modalFollowBtn.classList.remove('following');
      modalAuthorFollowers.textContent = state.lang === 'ru' ? '12.5k подписчиков' : '12.5k followers';
    }
  }

  modalLikesNum.textContent = pin.likes;
  if (pin.likedByMe) {
    modalLikeBtn.classList.add('liked');
    modalLikeBtn.querySelector('i').className = 'fa-solid fa-heart';
  } else {
    modalLikeBtn.classList.remove('liked');
    modalLikeBtn.querySelector('i').className = 'fa-regular fa-heart';
  }

  renderCommentsList(pin.comments);
  modalCommentInput.value = '';
  modalCommentSubmitBtn.classList.remove('active');

  renderModalBoardDropdown(pin);

  modalMyAvatar.src = state.currentUser.avatar;
}

function closePinDetails() {
  pinDetailModal.classList.remove('active');
  modalBoardsDropdown.classList.remove('active');
  document.body.style.overflow = ''; 
  state.openPin = null;

  if (state.currentView === 'feed') {
    renderFeed();
  } else if (state.currentView === 'profile') {
    renderProfile();
  }
}

// Like Pin
function toggleLike() {
  const pin = state.openPin;
  if (!pin) return;

  if (pin.likedByMe) {
    pin.likedByMe = false;
    pin.likes = Math.max(0, pin.likes - 1);
    modalLikeBtn.classList.remove('liked');
    modalLikeBtn.querySelector('i').className = 'fa-regular fa-heart';
  } else {
    pin.likedByMe = true;
    pin.likes += 1;
    modalLikeBtn.classList.add('liked');
    modalLikeBtn.querySelector('i').className = 'fa-solid fa-heart';
  }

  modalLikesNum.textContent = pin.likes;

  const index = state.pins.findIndex(p => p.id === pin.id);
  if (index !== -1) {
    state.pins[index] = pin;
  }
  saveState();
}

// Follow creator
function toggleFollowCreator() {
  const pin = state.openPin;
  if (!pin) return;

  const creatorUsername = pin.creator.username;
  if (state.followedCreators.has(creatorUsername)) {
    state.followedCreators.delete(creatorUsername);
    modalFollowBtn.textContent = state.lang === 'ru' ? 'Подписаться' : 'Follow';
    modalFollowBtn.classList.remove('following');
    modalAuthorFollowers.textContent = state.lang === 'ru' ? '12.5k подписчиков' : '12.5k followers';
  } else {
    state.followedCreators.add(creatorUsername);
    modalFollowBtn.textContent = state.lang === 'ru' ? 'Вы подписаны' : 'Following';
    modalFollowBtn.classList.add('following');
    modalAuthorFollowers.textContent = state.lang === 'ru' ? '12.6k подписчиков' : '12.6k followers';
  }
  saveState();
}

function renderCommentsList(comments) {
  modalCommentsList.innerHTML = '';
  if (!comments || comments.length === 0) {
    modalCommentsList.innerHTML = `<div class="no-comments-msg">${state.lang === 'ru' ? 'Комментариев пока нет. Напишите первым!' : 'No comments yet. Be first to comment!'}</div>`;
    return;
  }

  comments.forEach(c => {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `
      <div class="comment-avatar">
        <img src="${c.avatar}" alt="${c.username}">
      </div>
      <div class="comment-body">
        <div class="comment-user">${c.username}</div>
        <div class="comment-text">${c.text}</div>
        <div class="comment-date">${c.date}</div>
      </div>
    `;
    modalCommentsList.appendChild(item);
  });
  
  modalCommentsList.scrollTop = modalCommentsList.scrollHeight;
}

function submitComment() {
  const pin = state.openPin;
  if (!pin) return;

  const text = modalCommentInput.value.trim();
  if (text === '') return;

  const newComment = {
    id: `comment-${pin.id}-${Date.now()}`,
    username: state.currentUser.username,
    avatar: state.currentUser.avatar,
    text: text,
    date: new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric' })
  };

  if (!pin.comments) pin.comments = [];
  pin.comments.push(newComment);

  const index = state.pins.findIndex(p => p.id === pin.id);
  if (index !== -1) {
    state.pins[index].comments = pin.comments;
  }

  saveState();
  renderCommentsList(pin.comments);
  modalCommentInput.value = '';
  modalCommentSubmitBtn.classList.remove('active');
}

function renderModalBoardDropdown(pin) {
  modalBoardsDropdown.innerHTML = '';
  const containingBoard = state.boards.find(b => b.pinIds.includes(pin.id));
  
  if (containingBoard) {
    modalSelectedBoardName.textContent = containingBoard.name;
    modalSaveBtn.textContent = state.lang === 'ru' ? 'Сохранено' : 'Saved';
    modalSaveBtn.classList.add('saved');
  } else {
    const defaultBoard = state.boards.length > 0 ? state.boards[0] : null;
    modalSelectedBoardName.textContent = defaultBoard ? defaultBoard.name : (state.lang === 'ru' ? 'Создать доску...' : 'Create board...');
    modalSaveBtn.textContent = state.lang === 'ru' ? 'Сохранить' : 'Save';
    modalSaveBtn.classList.remove('saved');
  }

  state.boards.forEach(board => {
    const isSelected = board.pinIds.includes(pin.id);
    const item = document.createElement('div');
    item.className = `board-dropdown-item ${isSelected ? 'active' : ''}`;
    item.innerHTML = `
      <span>${board.name}</span>
      ${isSelected ? '<i class="fa-solid fa-check"></i>' : ''}
    `;
    
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      savePinToBoard(pin.id, board.id);
      modalBoardsDropdown.classList.remove('active');
    });

    modalBoardsDropdown.appendChild(item);
  });

  const createOption = document.createElement('div');
  createOption.className = 'board-dropdown-item create-board-option';
  createOption.innerHTML = `
    <i class="fa-solid fa-plus"></i>
    <span>${state.lang === 'ru' ? 'Создать доску' : 'Create board'}</span>
  `;
  createOption.addEventListener('click', (e) => {
    e.stopPropagation();
    modalBoardsDropdown.classList.remove('active');
    openCreateBoardDialog();
  });
  modalBoardsDropdown.appendChild(createOption);
}

function savePinToBoard(pinId, boardId) {
  const user = state.currentUser;
  
  state.boards.forEach(board => {
    board.pinIds = board.pinIds.filter(id => id !== pinId);
  });

  const board = state.boards.find(b => b.id === boardId);
  if (board) {
    board.pinIds.push(pinId);
    modalSelectedBoardName.textContent = board.name;
  }

  if (!user.savedPins) user.savedPins = [];
  if (!user.savedPins.includes(pinId)) {
    user.savedPins.push(pinId);
  }

  modalSaveBtn.textContent = state.lang === 'ru' ? 'Сохранено' : 'Saved';
  modalSaveBtn.classList.add('saved');

  saveState();
  renderSidebarBoards();
}

function handleMainModalSaveBtn() {
  const pin = state.openPin;
  if (!pin) return;

  const isSaved = state.currentUser.savedPins ? state.currentUser.savedPins.includes(pin.id) : false;
  
  if (isSaved) {
    state.currentUser.savedPins = state.currentUser.savedPins.filter(id => id !== pin.id);
    state.boards.forEach(b => {
      b.pinIds = b.pinIds.filter(id => id !== pin.id);
    });
    modalSaveBtn.textContent = state.lang === 'ru' ? 'Сохранить' : 'Save';
    modalSaveBtn.classList.remove('saved');
    modalSelectedBoardName.textContent = state.boards.length > 0 ? state.boards[0].name : (state.lang === 'ru' ? 'Выберите доску' : 'Select board');
  } else {
    let targetBoard = state.boards.find(b => b.name === modalSelectedBoardName.textContent);
    if (!targetBoard && state.boards.length > 0) {
      targetBoard = state.boards[0];
    }
    
    if (targetBoard) {
      savePinToBoard(pin.id, targetBoard.id);
    } else {
      const defaultBoard = { id: `board-${state.currentUser.username}-default`, name: state.lang === 'ru' ? 'Идеи для дома' : 'Home ideas', pinIds: [pin.id] };
      state.boards.push(defaultBoard);
      if (!state.currentUser.savedPins) state.currentUser.savedPins = [];
      state.currentUser.savedPins.push(pin.id);
      modalSelectedBoardName.textContent = defaultBoard.name;
      modalSaveBtn.textContent = state.lang === 'ru' ? 'Сохранено' : 'Saved';
      modalSaveBtn.classList.add('saved');
      saveState();
    }
  }
  renderSidebarBoards();
}

// --- Create Pin Form Actions ---
function setupCreatePinPage() {
  pinBoardSelect.innerHTML = '';
  state.boards.forEach(board => {
    const opt = document.createElement('option');
    opt.value = board.id;
    opt.textContent = board.name;
    pinBoardSelect.appendChild(opt);
  });

  const optCreate = document.createElement('option');
  optCreate.value = 'CREATE_NEW_BOARD_VAL';
  optCreate.textContent = state.lang === 'ru' ? '+ Создать новую доску...' : '+ Create new board...';
  pinBoardSelect.appendChild(optCreate);

  pinTitleInput.value = '';
  pinDescInput.value = '';
  pinLinkInput.value = '';
  imageUrlInput.value = '';
  fileInput.value = '';
  previewImg.src = '';
  previewImg.classList.remove('visible');
  previewChangeOverlay.classList.remove('visible');
  uploadedImageBase64 = null;

  pinTitleInput.placeholder = state.lang === 'ru' ? 'Добавьте название' : 'Add title';
  pinDescInput.placeholder = state.lang === 'ru' ? 'Расскажите всем, о чем ваш пин...' : 'Tell everyone about your pin...';
  pinLinkInput.placeholder = state.lang === 'ru' ? 'Добавьте ссылку на сайт' : 'Add destination link';
}

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    uploadedImageBase64 = event.target.result;
    previewImg.src = uploadedImageBase64;
    previewImg.classList.add('visible');
    previewChangeOverlay.classList.add('visible');
    imageUrlInput.value = ''; 
  };
  reader.readAsDataURL(file);
}

function handleImageUrlChange() {
  const url = imageUrlInput.value.trim();
  if (url !== '') {
    previewImg.src = url;
    previewImg.classList.add('visible');
    previewChangeOverlay.classList.add('visible');
    uploadedImageBase64 = null; 
  } else {
    previewImg.src = '';
    previewImg.classList.remove('visible');
    previewChangeOverlay.classList.remove('visible');
  }
}

function publishPin() {
  const title = pinTitleInput.value.trim();
  const description = pinDescInput.value.trim();
  const link = pinLinkInput.value.trim();
  const boardId = pinBoardSelect.value;
  const category = pinCategorySelect.value;

  const image = uploadedImageBase64 || imageUrlInput.value.trim();

  if (!image) {
    alert(state.lang === 'ru' ? 'Выберите изображение!' : 'Select image first!');
    return;
  }
  if (!title) {
    alert(state.lang === 'ru' ? 'Введите название!' : 'Title required!');
    return;
  }

  const newPinId = `pin-${Date.now()}`;
  const newPin = {
    id: newPinId,
    title: title,
    description: description,
    image: image,
    category: category,
    creator: {
      username: state.currentUser.username,
      name: state.currentUser.name,
      avatar: state.currentUser.avatar
    },
    likes: 0,
    likedByMe: false,
    link: link || null,
    date: new Date().toISOString().split('T')[0],
    comments: []
  };

  state.pins.unshift(newPin);

  if (boardId !== 'CREATE_NEW_BOARD_VAL') {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
      board.pinIds.push(newPinId);
    }
  }

  if (!state.currentUser.createdPins) state.currentUser.createdPins = [];
  if (!state.currentUser.savedPins) state.currentUser.savedPins = [];
  state.currentUser.createdPins.push(newPinId);
  state.currentUser.savedPins.push(newPinId);

  saveState();

  state.activeProfileTab = 'created';
  state.activeBoardId = null;
  
  renderSidebarBoards();
  switchView('profile');
}

function resetCache() {
  const conf = confirm(state.lang === 'ru' ? 'Вы уверены, что хотите сбросить все данные? Это вернет приложение к первоначальному состоянию.' : 'Are you sure you want to reset all app data?');
  if (conf) {
    localStorage.clear();
    location.reload();
  }
}

// --- Event Listeners Binding ---
function setupEventListeners() {
  // Top header nav bindings
  navLinks.home.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.activeBoardId = null;
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    renderSidebarCategories();
    renderSidebarBoards();
    switchView('feed');
  });

  navLinks.create.addEventListener('click', () => switchView('create'));
  
  navLinks.profileImg.addEventListener('click', () => {
    state.activeProfileTab = 'saved';
    state.activeBoardId = null;
    switchView('profile');
  });

  navLinks.logoHome.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.activeBoardId = null;
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    renderSidebarCategories();
    renderSidebarBoards();
    switchView('feed');
  });

  headerChatBtn.addEventListener('click', () => switchView('chat'));

  // Left catalog sidebar mobile drawer toggles
  mobileMenuToggle.addEventListener('click', toggleLeftSidebar);
  leftSidebarBackdrop.addEventListener('click', closeLeftSidebar);
  leftDrawerCloseBtn.addEventListener('click', closeLeftSidebar);

  // Profile Edit Overlay Drawer toggles
  profileEditBtn.addEventListener('click', openProfileEditDrawer);
  profileEditBackdrop.addEventListener('click', closeProfileEditDrawer);
  profileEditClose.addEventListener('click', closeProfileEditDrawer);
  profileEditCancel.addEventListener('click', closeProfileEditDrawer);

  // Settings inputs listeners
  settingsAvatarUrl.addEventListener('input', handleAvatarUrlChange);
  saveSettingsBtn.addEventListener('click', saveSettings);
  logoutBtn.addEventListener('click', handleLogout);

  // Left sidebar catalog menu shortcuts
  sideNavHome.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.activeBoardId = null;
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    renderSidebarCategories();
    renderSidebarBoards();
    switchView('feed');
    closeLeftSidebar();
  });

  sideNavCreate.addEventListener('click', () => {
    switchView('create');
    closeLeftSidebar();
  });
  
  sideNavProfile.addEventListener('click', () => {
    state.activeProfileTab = 'saved';
    state.activeBoardId = null;
    switchView('profile');
    closeLeftSidebar();
  });

  sideNavChat.addEventListener('click', () => {
    switchView('chat');
    closeLeftSidebar();
  });

  // Site Settings Event Listeners (on Left Sidebar)
  const langSelect = document.getElementById('site-lang-select');
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      state.lang = langSelect.value;
      saveState();
      applyLocale(state.lang);
      
      renderSidebarCategories();
      renderSidebarBoards();
      if (state.currentView === 'feed') renderFeed();
      if (state.currentView === 'profile') renderProfile();
      if (state.currentView === 'chat') renderChatsInterface();
    });
  }

  const btnCompact = document.getElementById('density-compact-btn');
  const btnCozy = document.getElementById('density-cozy-btn');
  const btnSpacious = document.getElementById('density-spacious-btn');
  
  if (btnCompact) btnCompact.addEventListener('click', () => { setGridDensity('compact'); saveState(); });
  if (btnCozy) btnCozy.addEventListener('click', () => { setGridDensity('cozy'); saveState(); });
  if (btnSpacious) btnSpacious.addEventListener('click', () => { setGridDensity('spacious'); saveState(); });

  const resetCacheBtn = document.getElementById('reset-cache-btn');
  if (resetCacheBtn) resetCacheBtn.addEventListener('click', resetCache);

  // Authentication overlays
  loginForm.addEventListener('submit', handleLoginSubmit);
  registerForm.addEventListener('submit', handleRegisterSubmit);
  authToggleBtn.addEventListener('click', toggleAuthForm);

  // Friends list & chat logs
  addFriendBtn.addEventListener('click', addFriendByUsername);
  addFriendInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addFriendByUsername();
  });
  chatSendBtn.addEventListener('click', sendChatMessage);
  chatMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Search suggestions
  searchInput.addEventListener('focus', () => {
    renderSearchSuggestions();
    searchSuggestions.classList.add('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
      searchSuggestions.classList.remove('active');
    }
  });

  searchInput.addEventListener('input', () => {
    const val = searchInput.value;
    if (val.trim() !== '') {
      clearSearchBtn.classList.add('visible');
    } else {
      clearSearchBtn.classList.remove('visible');
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      performSearch(searchInput.value);
    }
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    performSearch('');
  });

  // Modal actions
  modalCloseBtn.addEventListener('click', closePinDetails);
  
  pinDetailModal.addEventListener('click', (e) => {
    if (e.target === pinDetailModal) {
      closePinDetails();
    }
  });

  modalLikeBtn.addEventListener('click', toggleLike);
  modalFollowBtn.addEventListener('click', toggleFollowCreator);

  modalBoardSelectTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    modalBoardsDropdown.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.board-select-wrapper')) {
      modalBoardsDropdown.classList.remove('active');
    }
  });

  modalSaveBtn.addEventListener('click', handleMainModalSaveBtn);

  document.getElementById('modal-share-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(modalImg.src).then(() => {
      alert(state.lang === 'ru' ? 'Ссылка на картинку скопирована!' : 'Image URL copied!');
    });
  });

  document.getElementById('modal-options-btn').addEventListener('click', () => {
    alert(state.lang === 'ru' ? 'Жалоба/скачивание отправлено.' : 'Options clicked.');
  });

  modalCommentInput.addEventListener('input', () => {
    if (modalCommentInput.value.trim() !== '') {
      modalCommentSubmitBtn.classList.add('active');
    } else {
      modalCommentSubmitBtn.classList.remove('active');
    }
  });

  modalCommentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitComment();
    }
  });

  modalCommentSubmitBtn.addEventListener('click', submitComment);

  // Profile tabs
  tabSaved.addEventListener('click', () => {
    state.activeProfileTab = 'saved';
    state.activeBoardId = null;
    renderProfile();
  });

  tabCreated.addEventListener('click', () => {
    state.activeProfileTab = 'created';
    state.activeBoardId = null;
    renderProfile();
  });

  boardBackBtn.addEventListener('click', () => {
    state.activeBoardId = null;
    renderProfile();
  });

  triggerCreateBoardBtn.addEventListener('click', openCreateBoardDialog);
  cancelCreateBoardBtn.addEventListener('click', closeCreateBoardDialog);
  confirmCreateBoardBtn.addEventListener('click', createNewBoard);
  
  createBoardModalDialog.addEventListener('click', (e) => {
    if (e.target === createBoardModalDialog) {
      closeCreateBoardDialog();
    }
  });

  newBoardNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      createNewBoard();
    }
  });

  uploadZone.addEventListener('click', () => fileInput.click());
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.style.backgroundColor = 'var(--gray-hover)';
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.style.backgroundColor = '';
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.style.backgroundColor = '';
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      fileInput.files = e.dataTransfer.files;
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  });

  fileInput.addEventListener('change', handleFileSelect);
  imageUrlInput.addEventListener('input', handleImageUrlChange);

  pinBoardSelect.addEventListener('change', () => {
    if (pinBoardSelect.value === 'CREATE_NEW_BOARD_VAL') {
      openCreateBoardDialog();
      pinBoardSelect.value = state.boards.length > 0 ? state.boards[0].id : '';
    }
  });

  submitPinBtn.addEventListener('click', publishPin);

  document.getElementById('profile-share-btn').addEventListener('click', () => {
    alert(state.lang === 'ru' ? `Ссылка на профиль @${state.currentUser.username} скопирована.` : `Profile link for @${state.currentUser.username} copied.`);
  });
}

// --- App Initialization ---
function initApp() {
  initLocalStorage();
  setupEventListeners();

  if (state.isLoggedIn) {
    authOverlay.classList.add('hidden');
    navLinks.profileImg.querySelector('img').src = state.currentUser.avatar;
    setupSettingsPage(); // Initialize overlay profile settings form fields
    renderSidebarCategories();
    renderSidebarBoards();
    renderFeed();
    renderChatsInterface(); // Preload chat sidebar listings
    switchView('feed');
  } else {
    authOverlay.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', initApp);
