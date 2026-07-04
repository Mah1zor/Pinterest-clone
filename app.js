// Pinterest Clone - Core Application Logic
import { CURRENT_USER, MOCK_USERS, INITIAL_BOARDS, INITIAL_PINS, INITIAL_CHATS, SUGGESTED_SEARCHES, CATEGORIES } from './data.js';

// --- State Management ---
let state = {
  isLoggedIn: false,
  currentUser: {},
  users: [],
  pins: [],
  boards: [],
  chats: {},
  followedCreators: new Set(),
  currentView: 'feed', // 'feed', 'create', 'profile', 'settings'
  activeCategory: 'all',
  searchQuery: '',
  activeProfileTab: 'saved', // 'saved', 'created', 'chats'
  activeBoardId: null, // If viewing a specific board's pins (either in feed or profile)
  openPin: null, // Currently opened pin in modal
  theme: 'light', // 'light' or 'dark'
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

  state.pins = JSON.parse(localStorage.getItem('pinterest_pins'));
  state.users = JSON.parse(localStorage.getItem('pinterest_users'));
  state.theme = localStorage.getItem('pinterest_theme');
  state.isLoggedIn = localStorage.getItem('pinterest_logged_in') === 'true';
  state.chats = JSON.parse(localStorage.getItem('pinterest_chats'));

  applyTheme(state.theme);

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

// --- DOM Query Elements ---
const views = {
  feed: document.getElementById('feed-view'),
  create: document.getElementById('create-view'),
  profile: document.getElementById('profile-view'),
  settings: document.getElementById('settings-view')
};

const navLinks = {
  home: document.getElementById('nav-home'),
  create: document.getElementById('nav-create'),
  profileImg: document.getElementById('nav-profile-img'),
  logoHome: document.getElementById('logo-home-trigger')
};

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
const tabChats = document.getElementById('tab-chats');
const savedSection = document.getElementById('profile-saved-section');
const createdSection = document.getElementById('profile-created-section');
const chatsSection = document.getElementById('profile-chats-section');
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

// SETTINGS VIEW ELEMENTS
const settingsAvatarUrl = document.getElementById('settings-avatar-url');
const settingsAvatarPreview = document.getElementById('settings-avatar-preview');
const settingsDisplayName = document.getElementById('settings-display-name');
const settingsUsername = document.getElementById('settings-username');
const settingsBio = document.getElementById('settings-bio');
const themeToggleCheck = document.getElementById('theme-toggle-check');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
const logoutBtn = document.getElementById('logout-btn');
const settingsUsernameError = document.getElementById('settings-username-error');

// PROFILE CHATS VIEW ELEMENTS
const profileFriendsList = document.getElementById('profile-friends-list');
const addFriendInput = document.getElementById('add-friend-input');
const addFriendBtn = document.getElementById('add-friend-btn');
const addFriendError = document.getElementById('add-friend-error');
const chatPlaceholder = document.getElementById('chat-placeholder');
const chatActivePanel = document.getElementById('chat-active-panel');
const chatFriendAvatar = document.getElementById('chat-friend-avatar');
const chatFriendName = document.getElementById('chat-friend-name');
const chatFriendUsername = document.getElementById('chat-friend-username');
const chatMessagesLog = document.getElementById('chat-messages-log');
const chatMessageInput = document.getElementById('chat-message-input');
const chatSendBtn = document.getElementById('chat-send-btn');

// LEFT SIDEBAR CATALOG ELEMENTS
const sideCatalog = document.getElementById('side-catalog');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const sideCategoriesList = document.getElementById('side-categories-list');
const sideBoardsList = document.getElementById('side-boards-list');

// Sidebar menu buttons
const sideNavHome = document.getElementById('side-nav-home');
const sideNavCreate = document.getElementById('side-nav-create');
const sideNavProfile = document.getElementById('side-nav-profile');
const sideNavSettings = document.getElementById('side-nav-settings');

let uploadedImageBase64 = null; 

// --- Routing & View Toggles ---
function switchView(viewName) {
  state.currentView = viewName;
  
  // Update view classes
  Object.keys(views).forEach(key => {
    if (key === viewName) {
      views[key].classList.add('active');
    } else {
      views[key].classList.remove('active');
    }
  });

  // Sync header top navigations active highlights
  navLinks.home.classList.remove('active');
  navLinks.create.classList.remove('active');
  
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

  if (viewName === 'settings') {
    setupSettingsPage();
  }

  // Close off-canvas drawer sidebar on mobile
  closeMobileSidebar();
  
  // Update sidebar active highlights
  syncSidebarNavHighlights();
}

// Mobile sidebar controls
function toggleMobileSidebar() {
  sideCatalog.classList.toggle('active');
  sidebarBackdrop.classList.toggle('active');
}

function closeMobileSidebar() {
  sideCatalog.classList.remove('active');
  sidebarBackdrop.classList.remove('active');
}

// Highlight the currently active sidebar navigation item
function syncSidebarNavHighlights() {
  // Reset all active classes
  document.querySelectorAll('.catalog-item').forEach(el => el.classList.remove('active'));

  if (state.currentView === 'feed') {
    if (state.activeBoardId !== null) {
      // Highlight board item
      const boardEl = document.querySelector(`.catalog-item[data-board-id="${state.activeBoardId}"]`);
      if (boardEl) boardEl.classList.add('active');
    } else {
      // Highlight category item or Лента
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
  } else if (state.currentView === 'settings') {
    sideNavSettings.classList.add('active');
  }
}

// --- Authentication Controllers ---
function toggleAuthForm() {
  authErrorMsg.classList.add('hidden');
  if (loginForm.classList.contains('hidden')) {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    authTitle.textContent = 'Добро пожаловать в Pinterest';
    authToggleText.textContent = 'Впервые на Pinterest?';
    authToggleBtn.textContent = 'Создать аккаунт';
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    authTitle.textContent = 'Создайте аккаунт';
    authToggleText.textContent = 'Уже есть аккаунт?';
    authToggleBtn.textContent = 'Войти';
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
    authErrorMsg.textContent = 'Неверное имя пользователя или пароль';
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
    authErrorMsg.textContent = 'Имя пользователя должно быть не менее 3 символов (латиница)';
    authErrorMsg.classList.remove('hidden');
    return;
  }

  const exists = state.users.some(u => u.username === username);
  if (exists) {
    authErrorMsg.textContent = 'Это имя пользователя уже занято';
    authErrorMsg.classList.remove('hidden');
    return;
  }

  const newUser = {
    username: username,
    password: password,
    name: name,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bio: 'Новый вдохновляющийся пользователь.',
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

  renderSidebarCategories();
  renderSidebarBoards();
  renderFeed();
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
      <span>${cat.name}</span>
    `;

    btn.addEventListener('click', () => {
      state.activeCategory = cat.id;
      state.activeBoardId = null;
      state.searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.remove('visible');

      switchView('feed');
    });

    sideCategoriesList.appendChild(btn);
  });
}

function renderSidebarBoards() {
  sideBoardsList.innerHTML = '';

  if (state.boards.length === 0) {
    sideBoardsList.innerHTML = '<div style="font-size: 13px; color: var(--gray-muted); padding-left: 12px;">Нет досок</div>';
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
        <p style="font-size: 18px; font-weight: 500;">Ничего не найдено</p>
        <p style="font-size: 14px; margin-top: 8px;">Попробуйте использовать другие ключевые слова или сбросьте категорию</p>
      </div>`;
    return;
  }

  pinsToRender.forEach(pin => {
    const card = document.createElement('div');
    card.className = 'pin-card';
    card.setAttribute('data-pin-id', pin.id);

    const isSaved = state.currentUser.savedPins ? state.currentUser.savedPins.includes(pin.id) : false;
    const savedBoard = state.boards.find(b => b.pinIds.includes(pin.id));
    const boardName = savedBoard ? savedBoard.name : 'Идеи для дома';

    card.innerHTML = `
      <div class="pin-card-media-wrapper">
        <img src="${pin.image}" alt="${pin.title}" class="pin-card-img" loading="lazy">
        <div class="pin-card-overlay">
          <div class="overlay-top">
            <button class="overlay-board-btn">${boardName}</button>
            <button class="overlay-save-btn ${isSaved ? 'saved' : ''}">${isSaved ? 'Сохранено' : 'Сохранить'}</button>
          </div>
          <div class="overlay-bottom">
            ${pin.link ? `
              <a href="${pin.link}" target="_blank" class="overlay-link-btn" title="${pin.link}">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                <span>${new URL(pin.link).hostname}</span>
              </a>
            ` : '<div></div>'}
            <div class="overlay-actions">
              <button class="overlay-action-btn share-action-btn" title="Поделиться">
                <i class="fa-solid fa-arrow-up-from-bracket"></i>
              </button>
              <button class="overlay-action-btn menu-action-btn" title="Опции">
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
            alert('Ссылка скопирована в буфер обмена!');
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
    buttonEl.textContent = 'Сохранить';
    buttonEl.classList.remove('saved');
  } else {
    user.savedPins.push(pinId);
    if (state.boards.length > 0) {
      if (!state.boards[0].pinIds.includes(pinId)) {
        state.boards[0].pinIds.push(pinId);
      }
    }
    buttonEl.textContent = 'Сохранено';
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
  // Refresh sidebar counters
  renderSidebarBoards();
}

// --- Render Feed (Filtering by category or search) ---
function renderFeed() {
  let pinsToRender = [...state.pins];

  // 1. Filter by active board link (if set)
  if (state.activeBoardId) {
    const board = state.boards.find(b => b.id === state.activeBoardId);
    if (board) {
      pinsToRender = pinsToRender.filter(pin => board.pinIds.includes(pin.id));
    }
  } else {
    // 2. Filter by sidebar categories (otherwise)
    if (state.activeCategory !== 'all') {
      const categoryObj = CATEGORIES.find(c => c.id === state.activeCategory);
      if (categoryObj && categoryObj.tag) {
        pinsToRender = pinsToRender.filter(pin => pin.category === categoryObj.tag);
      }
    }
  }

  // 3. Filter by search input
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
  document.getElementById('profile-bio').textContent = user.bio || 'Нет описания.';
  document.getElementById('profile-followers-count').textContent = `${user.followersCount || 0} подписчиков`;
  document.getElementById('profile-following-count').textContent = `${user.followingCount || 0} подписок`;

  tabSaved.classList.remove('active');
  tabCreated.classList.remove('active');
  tabChats.classList.remove('active');
  
  savedSection.classList.add('hidden');
  createdSection.classList.add('hidden');
  chatsSection.classList.add('hidden');
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
  } else if (state.activeProfileTab === 'chats') {
    tabChats.classList.add('active');
    chatsSection.classList.remove('hidden');
    renderChatsInterface();
  }
}

function renderBoards() {
  boardsGridSaved.innerHTML = '';
  
  if (state.boards.length === 0) {
    boardsGridSaved.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--gray-muted); width: 100%;">Нет досок. Создайте свою первую доску!</div>';
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
        <div class="board-card-count">${board.pinIds.length} пинов</div>
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
  currentBoardCount.textContent = `${board.pinIds.length} пинов`;

  const boardPins = state.pins.filter(pin => board.pinIds.includes(pin.id));
  renderPinsGrid(boardPins, pinsGridBoardPins);
}

function renderCreatedPins() {
  const userPins = state.pins.filter(pin => pin.creator.username === state.currentUser.username);
  renderPinsGrid(userPins, pinsGridCreated);
}

// --- Profile Chats Interface Operations ---
function renderChatsInterface() {
  profileFriendsList.innerHTML = '';
  const friends = state.currentUser.friends || [];
  
  if (friends.length === 0) {
    profileFriendsList.innerHTML = '<div style="font-size: 13px; color: var(--gray-muted); padding: 12px 0;">У вас пока нет друзей. Добавьте кого-нибудь по имени пользователя!</div>';
  } else {
    friends.forEach(fUsername => {
      const friendUserObj = state.users.find(u => u.username === fUsername);
      if (!friendUserObj) return;

      const item = document.createElement('div');
      item.className = `friend-item ${state.activeChatFriend === fUsername ? 'active' : ''}`;
      item.innerHTML = `
        <div class="friend-avatar">
          <img src="${friendUserObj.avatar}" alt="${friendUserObj.name}">
        </div>
        <div class="friend-info">
          <div class="friend-name">${friendUserObj.name}</div>
          <div class="friend-username">@${friendUserObj.username}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        state.activeChatFriend = fUsername;
        document.querySelectorAll('.friend-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        openActiveChat(friendUserObj);
      });

      profileFriendsList.appendChild(item);
    });
  }

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
    chatMessagesLog.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--gray-muted); font-size: 13px; font-style: italic;">Начало беседы. Напишите приветствие!</div>';
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
    addFriendError.textContent = 'Нельзя добавить себя в друзья';
    addFriendError.classList.remove('hidden');
    return;
  }

  const targetUserObj = state.users.find(u => u.username === fUsername);
  if (!targetUserObj) {
    addFriendError.textContent = 'Пользователь не найден';
    addFriendError.classList.remove('hidden');
    return;
  }

  if (!state.currentUser.friends) state.currentUser.friends = [];
  if (state.currentUser.friends.includes(fUsername)) {
    addFriendError.textContent = 'Этот пользователь уже в вашем списке друзей';
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
  
  // Refresh left sidebar list
  renderSidebarBoards();
}

// --- Settings Page Operations ---
function setupSettingsPage() {
  const user = state.currentUser;
  settingsAvatarUrl.value = user.avatar;
  settingsAvatarPreview.src = user.avatar;
  settingsDisplayName.value = user.name;
  settingsUsername.value = user.username;
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
    alert('Имя и имя пользователя обязательны для заполнения!');
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

  alert('Настройки профиля успешно сохранены!');
  switchView('profile');
}

// --- Pin Detail Modal Actions ---
function openPinDetails(pin) {
  state.openPin = pin;
  pinDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden'; 

  modalImg.src = pin.image;
  modalTitle.textContent = pin.title;
  modalDescription.textContent = pin.description || 'Описание отсутствует.';
  
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
    modalAuthorFollowers.textContent = `${state.currentUser.followersCount || 0} подписчиков`;
  } else {
    modalFollowBtn.classList.remove('hidden');
    if (isFollowing) {
      modalFollowBtn.textContent = 'Вы подписаны';
      modalFollowBtn.classList.add('following');
      modalAuthorFollowers.textContent = '12.6k подписчиков';
    } else {
      modalFollowBtn.textContent = 'Подписаться';
      modalFollowBtn.classList.remove('following');
      modalAuthorFollowers.textContent = '12.5k подписчиков';
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

function toggleFollowCreator() {
  const pin = state.openPin;
  if (!pin) return;

  const creatorUsername = pin.creator.username;
  if (state.followedCreators.has(creatorUsername)) {
    state.followedCreators.delete(creatorUsername);
    modalFollowBtn.textContent = 'Подписаться';
    modalFollowBtn.classList.remove('following');
    modalAuthorFollowers.textContent = '12.5k подписчиков';
  } else {
    state.followedCreators.add(creatorUsername);
    modalFollowBtn.textContent = 'Вы подписаны';
    modalFollowBtn.classList.add('following');
    modalAuthorFollowers.textContent = '12.6k подписчиков';
  }
  saveState();
}

function renderCommentsList(comments) {
  modalCommentsList.innerHTML = '';
  if (!comments || comments.length === 0) {
    modalCommentsList.innerHTML = '<div class="no-comments-msg">Комментариев пока нет. Напишите первым!</div>';
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
    modalSaveBtn.textContent = 'Сохранено';
    modalSaveBtn.classList.add('saved');
  } else {
    const defaultBoard = state.boards.length > 0 ? state.boards[0] : null;
    modalSelectedBoardName.textContent = defaultBoard ? defaultBoard.name : 'Создать доску...';
    modalSaveBtn.textContent = 'Сохранить';
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
    <span>Создать доску</span>
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

  modalSaveBtn.textContent = 'Сохранено';
  modalSaveBtn.classList.add('saved');

  saveState();
  
  // Refresh sidebar list
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
    modalSaveBtn.textContent = 'Сохранить';
    modalSaveBtn.classList.remove('saved');
    modalSelectedBoardName.textContent = state.boards.length > 0 ? state.boards[0].name : 'Выберите доску';
  } else {
    let targetBoard = state.boards.find(b => b.name === modalSelectedBoardName.textContent);
    if (!targetBoard && state.boards.length > 0) {
      targetBoard = state.boards[0];
    }
    
    if (targetBoard) {
      savePinToBoard(pin.id, targetBoard.id);
    } else {
      const defaultBoard = { id: `board-${state.currentUser.username}-default`, name: 'Идеи для дома', pinIds: [pin.id] };
      state.boards.push(defaultBoard);
      if (!state.currentUser.savedPins) state.currentUser.savedPins = [];
      state.currentUser.savedPins.push(pin.id);
      modalSelectedBoardName.textContent = defaultBoard.name;
      modalSaveBtn.textContent = 'Сохранено';
      modalSaveBtn.classList.add('saved');
      saveState();
    }
  }
  // Refresh sidebar list
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
  optCreate.textContent = '+ Создать новую доску...';
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
    alert('Пожалуйста, выберите изображение или вставьте ссылку на него.');
    return;
  }
  if (!title) {
    alert('Введите название вашего пина.');
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
  
  // Refresh sidebar board list counters
  renderSidebarBoards();

  switchView('profile');
}

// --- Event Listeners Binding ---
function setupEventListeners() {
  // Top header nav bindings (syncs with side Catalog as fallback)
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

  document.getElementById('header-settings-btn').addEventListener('click', () => {
    switchView('settings');
  });

  document.getElementById('profile-edit-btn').addEventListener('click', () => {
    switchView('settings');
  });

  // Left Sidebar Catalog menu click bindings
  sideNavHome.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.activeBoardId = null;
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    renderSidebarCategories();
    renderSidebarBoards();
    switchView('feed');
  });

  sideNavCreate.addEventListener('click', () => switchView('create'));
  
  sideNavProfile.addEventListener('click', () => {
    state.activeProfileTab = 'saved';
    state.activeBoardId = null;
    switchView('profile');
  });

  sideNavSettings.addEventListener('click', () => switchView('settings'));

  // Mobile Hamburger Toggle triggers
  mobileMenuToggle.addEventListener('click', toggleMobileSidebar);
  sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Authentication listeners
  loginForm.addEventListener('submit', handleLoginSubmit);
  registerForm.addEventListener('submit', handleRegisterSubmit);
  authToggleBtn.addEventListener('click', toggleAuthForm);

  // Settings page listeners
  settingsAvatarUrl.addEventListener('input', handleAvatarUrlChange);
  saveSettingsBtn.addEventListener('click', saveSettings);
  cancelSettingsBtn.addEventListener('click', () => switchView('profile'));
  logoutBtn.addEventListener('click', handleLogout);

  // Profile chat listeners
  addFriendBtn.addEventListener('click', addFriendByUsername);
  addFriendInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addFriendByUsername();
  });
  chatSendBtn.addEventListener('click', sendChatMessage);
  chatMessageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // Search input listeners
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
      alert('Ссылка на картинку скопирована в буфер обмена!');
    });
  });

  document.getElementById('modal-options-btn').addEventListener('click', () => {
    alert('Опции пина: Нажата кнопка жалобы/скачивания.');
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

  // Profile Tab toggles
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

  tabChats.addEventListener('click', () => {
    state.activeProfileTab = 'chats';
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
    alert(`Ссылка на профиль @${state.currentUser.username} скопирована в буфер.`);
  });
}

// --- App Initialization ---
function initApp() {
  initLocalStorage();
  setupEventListeners();

  if (state.isLoggedIn) {
    authOverlay.classList.add('hidden');
    navLinks.profileImg.querySelector('img').src = state.currentUser.avatar;
    renderSidebarCategories();
    renderSidebarBoards();
    renderFeed();
    switchView('feed');
  } else {
    authOverlay.classList.remove('hidden');
  }
}

document.addEventListener('DOMContentLoaded', initApp);
