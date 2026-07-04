// Pinterest Clone - Core Application Logic
import { INITIAL_BOARDS, CURRENT_USER, INITIAL_PINS, SUGGESTED_SEARCHES, CATEGORIES } from './data.js';

// --- State Management ---
let state = {
  pins: [],
  boards: [],
  currentUser: {},
  followedCreators: new Set(),
  currentView: 'feed', // 'feed', 'create', 'profile'
  activeCategory: 'all',
  searchQuery: '',
  activeProfileTab: 'saved', // 'saved', 'created'
  activeBoardId: null, // If viewing a specific board's pins
  openPin: null // Currently opened pin in modal
};

// --- Local Storage Initialization ---
function initLocalStorage() {
  if (!localStorage.getItem('pinterest_pins')) {
    localStorage.setItem('pinterest_pins', JSON.stringify(INITIAL_PINS));
  }
  if (!localStorage.getItem('pinterest_boards')) {
    localStorage.setItem('pinterest_boards', JSON.stringify(INITIAL_BOARDS));
  }
  if (!localStorage.getItem('pinterest_user')) {
    localStorage.setItem('pinterest_user', JSON.stringify(CURRENT_USER));
  }
  if (!localStorage.getItem('pinterest_followed')) {
    localStorage.setItem('pinterest_followed', JSON.stringify([]));
  }

  state.pins = JSON.parse(localStorage.getItem('pinterest_pins'));
  state.boards = JSON.parse(localStorage.getItem('pinterest_boards'));
  state.currentUser = JSON.parse(localStorage.getItem('pinterest_user'));
  state.followedCreators = new Set(JSON.parse(localStorage.getItem('pinterest_followed')));
}

function saveState() {
  localStorage.setItem('pinterest_pins', JSON.stringify(state.pins));
  localStorage.setItem('pinterest_boards', JSON.stringify(state.boards));
  localStorage.setItem('pinterest_user', JSON.stringify(state.currentUser));
  localStorage.setItem('pinterest_followed', JSON.stringify(Array.from(state.followedCreators)));
}

// --- DOM Query Elements ---
const views = {
  feed: document.getElementById('feed-view'),
  create: document.getElementById('create-view'),
  profile: document.getElementById('profile-view')
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

// Popovers
const popoverTriggers = {
  notifications: document.getElementById('notifications-trigger'),
  messages: document.getElementById('messages-trigger')
};
const popovers = {
  notifications: document.getElementById('notifications-popover'),
  messages: document.getElementById('messages-popover')
};

// Feeds and grids
const pinsGridFeed = document.getElementById('pins-grid-feed');
const categoriesBar = document.getElementById('categories-bar');
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

let uploadedImageBase64 = null; // Store base64 data url for uploaded files

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

  // Update nav button active states
  navLinks.home.classList.remove('active');
  navLinks.create.classList.remove('active');
  
  if (viewName === 'feed') {
    navLinks.home.classList.add('active');
    categoriesBar.classList.remove('hidden');
    renderFeed();
  } else {
    categoriesBar.classList.add('hidden');
  }

  if (viewName === 'create') {
    navLinks.create.classList.add('active');
    setupCreatePinPage();
  }

  if (viewName === 'profile') {
    renderProfile();
  }

  // Close any open popovers when switching view
  closeAllPopovers();
}

function closeAllPopovers() {
  Object.values(popovers).forEach(popover => popover.classList.remove('active'));
}

// --- Render Categories ---
function renderCategories() {
  categoriesBar.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const button = document.createElement('button');
    button.className = `category-pill ${state.activeCategory === cat.id ? 'active' : ''}`;
    button.textContent = cat.name;
    button.addEventListener('click', () => {
      state.activeCategory = cat.id;
      state.searchQuery = '';
      searchInput.value = '';
      clearSearchBtn.classList.remove('visible');
      state.activeBoardId = null;
      
      // Update UI active category pill
      document.querySelectorAll('.category-pill').forEach(el => el.classList.remove('active'));
      button.classList.add('active');
      
      switchView('feed');
    });
    categoriesBar.appendChild(button);
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

    // Find if already saved to any board
    const isSaved = state.currentUser.savedPins.includes(pin.id);
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

    // Click handler to open Modal details (exclude clicking buttons on overlay)
    card.addEventListener('click', (e) => {
      const clickOverlayButton = e.target.closest('button') || e.target.closest('a');
      if (clickOverlayButton) {
        e.stopPropagation();
        // Handle quick save button click
        if (clickOverlayButton.classList.contains('overlay-save-btn')) {
          toggleSavePinDirect(pin.id, clickOverlayButton);
        }
        // Handle share button
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

// Quick toggle save from feed overlay
function toggleSavePinDirect(pinId, buttonEl) {
  const user = state.currentUser;
  const isSaved = user.savedPins.includes(pinId);

  if (isSaved) {
    // Remove from saved
    user.savedPins = user.savedPins.filter(id => id !== pinId);
    // Remove from boards as well
    state.boards.forEach(b => {
      b.pinIds = b.pinIds.filter(id => id !== pinId);
    });
    buttonEl.textContent = 'Сохранить';
    buttonEl.classList.remove('saved');
  } else {
    // Add to saved
    user.savedPins.push(pinId);
    // Add to default board (the first board or create one if none exist)
    if (state.boards.length > 0) {
      if (!state.boards[0].pinIds.includes(pinId)) {
        state.boards[0].pinIds.push(pinId);
      }
    }
    buttonEl.textContent = 'Сохранено';
    buttonEl.classList.add('saved');
  }
  
  saveState();
  // Sync the board title inside card top overlay
  const card = buttonEl.closest('.pin-card');
  if (card) {
    const boardBtn = card.querySelector('.overlay-board-btn');
    const savedBoard = state.boards.find(b => b.pinIds.includes(pinId));
    if (savedBoard && boardBtn) {
      boardBtn.textContent = savedBoard.name;
    }
  }
}

// --- Render Feed (Filtering by category or search) ---
function renderFeed() {
  let pinsToRender = [...state.pins];

  // 1. Filter by category
  if (state.activeCategory !== 'all') {
    const categoryObj = CATEGORIES.find(c => c.id === state.activeCategory);
    if (categoryObj && categoryObj.tag) {
      pinsToRender = pinsToRender.filter(pin => pin.category === categoryObj.tag);
    }
  }

  // 2. Filter by search query
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
  // Update category active style in HTML
  document.querySelectorAll('.category-pill').forEach(el => el.classList.remove('active'));
  const allPill = document.querySelector('.category-pill:first-child');
  if (allPill) allPill.classList.add('active');

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
  
  // Render user info
  document.getElementById('profile-avatar-img').src = user.avatar;
  document.getElementById('profile-display-name').textContent = user.name;
  document.getElementById('profile-username').textContent = `@${user.username}`;
  document.getElementById('profile-bio').textContent = user.bio;
  document.getElementById('profile-followers-count').textContent = `${user.followersCount} подписчиков`;
  document.getElementById('profile-following-count').textContent = `${user.followingCount} подписок`;

  // Handle Tab Switch Toggles
  if (state.activeProfileTab === 'saved') {
    tabSaved.classList.add('active');
    tabCreated.classList.remove('active');
    
    if (state.activeBoardId) {
      // Viewing specific board details
      savedSection.classList.add('hidden');
      createdSection.classList.add('hidden');
      boardDetailsView.classList.remove('hidden');
      renderBoardDetails(state.activeBoardId);
    } else {
      savedSection.classList.remove('hidden');
      createdSection.classList.add('hidden');
      boardDetailsView.classList.add('hidden');
      renderBoards();
    }
  } else {
    tabSaved.classList.remove('active');
    tabCreated.classList.add('active');
    savedSection.classList.add('hidden');
    createdSection.classList.remove('hidden');
    boardDetailsView.classList.add('hidden');
    renderCreatedPins();
  }
}

function renderBoards() {
  boardsGridSaved.innerHTML = '';
  
  if (state.boards.length === 0) {
    boardsGridSaved.innerHTML = '<div style="text-align:center; grid-column:1/-1; padding: 40px; color: var(--gray-muted);">Нет досок. Создайте свою первую доску!</div>';
    return;
  }

  state.boards.forEach(board => {
    // Collect images in board to show collage preview
    const boardPins = state.pins.filter(pin => board.pinIds.includes(pin.id));
    const coverImages = boardPins.slice(0, 3).map(p => p.image);
    
    // Fill up empty slots with a light gray placeholder if less than 3 images
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

  // Get pin objects inside this board
  const boardPins = state.pins.filter(pin => board.pinIds.includes(pin.id));
  
  renderPinsGrid(boardPins, pinsGridBoardPins);
}

function renderCreatedPins() {
  // Creator username of currentUser is creative_mind
  const userPins = state.pins.filter(pin => pin.creator.username === state.currentUser.username);
  renderPinsGrid(userPins, pinsGridCreated);
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

  const newId = `board-${Date.now()}`;
  const newBoard = {
    id: newId,
    name: name,
    pinIds: []
  };

  state.boards.push(newBoard);
  saveState();
  closeCreateBoardDialog();
  
  // Refresh views
  if (state.currentView === 'profile') {
    renderBoards();
  }
  if (state.openPin) {
    renderModalBoardDropdown(state.openPin);
  }
  setupCreatePinPage(); // Refresh select dropdown in creation page
}

// --- Pin Detail Modal Actions ---
function openPinDetails(pin) {
  state.openPin = pin;
  pinDetailModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // Stop background scroll

  // Set values
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

  // Author details
  modalAuthorImg.src = pin.creator.avatar;
  modalAuthorName.textContent = pin.creator.name;
  
  // Follower logic simulation
  const isFollowing = state.followedCreators.has(pin.creator.username);
  if (pin.creator.username === state.currentUser.username) {
    modalFollowBtn.classList.add('hidden');
    modalAuthorFollowers.textContent = `${state.currentUser.followersCount} подписчиков`;
  } else {
    modalFollowBtn.classList.remove('hidden');
    if (isFollowing) {
      modalFollowBtn.textContent = 'Вы подписаны';
      modalFollowBtn.classList.add('following');
      modalAuthorFollowers.textContent = '12.6k подписчиков'; // Add one extra to mock list
    } else {
      modalFollowBtn.textContent = 'Подписаться';
      modalFollowBtn.classList.remove('following');
      modalAuthorFollowers.textContent = '12.5k подписчиков';
    }
  }

  // Likes details
  modalLikesNum.textContent = pin.likes;
  if (pin.likedByMe) {
    modalLikeBtn.classList.add('liked');
    modalLikeBtn.querySelector('i').className = 'fa-solid fa-heart';
  } else {
    modalLikeBtn.classList.remove('liked');
    modalLikeBtn.querySelector('i').className = 'fa-regular fa-heart';
  }

  // Comments
  renderCommentsList(pin.comments);
  modalCommentInput.value = '';
  modalCommentSubmitBtn.classList.remove('active');

  // Boards Dropdown for Save
  renderModalBoardDropdown(pin);

  // My comment avatar
  modalMyAvatar.src = state.currentUser.avatar;
}

function closePinDetails() {
  pinDetailModal.classList.remove('active');
  modalBoardsDropdown.classList.remove('active');
  document.body.style.overflow = ''; // Restore scroll
  state.openPin = null;

  // Refresh feed to sync save buttons/likes
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

  // Update in state list
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
  
  // Scroll to bottom
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

  // Sync to state pins
  const index = state.pins.findIndex(p => p.id === pin.id);
  if (index !== -1) {
    state.pins[index].comments = pin.comments;
  }

  saveState();
  renderCommentsList(pin.comments);
  modalCommentInput.value = '';
  modalCommentSubmitBtn.classList.remove('active');
}

// Modal Board Saving dropdown
function renderModalBoardDropdown(pin) {
  modalBoardsDropdown.innerHTML = '';
  
  // Find which board contains this pin (if any)
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

  // Option to create board from dropdown
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
  
  // Remove pin from all other boards
  state.boards.forEach(board => {
    board.pinIds = board.pinIds.filter(id => id !== pinId);
  });

  // Add to target board
  const board = state.boards.find(b => b.id === boardId);
  if (board) {
    board.pinIds.push(pinId);
    modalSelectedBoardName.textContent = board.name;
  }

  // Ensure it exists in user savedPins
  if (!user.savedPins.includes(pinId)) {
    user.savedPins.push(pinId);
  }

  modalSaveBtn.textContent = 'Сохранено';
  modalSaveBtn.classList.add('saved');

  saveState();
}

function handleMainModalSaveBtn() {
  const pin = state.openPin;
  if (!pin) return;

  const isSaved = state.currentUser.savedPins.includes(pin.id);
  
  if (isSaved) {
    // Unsave (Remove from all boards and saved lists)
    state.currentUser.savedPins = state.currentUser.savedPins.filter(id => id !== pin.id);
    state.boards.forEach(b => {
      b.pinIds = b.pinIds.filter(id => id !== pin.id);
    });
    modalSaveBtn.textContent = 'Сохранить';
    modalSaveBtn.classList.remove('saved');
    modalSelectedBoardName.textContent = state.boards.length > 0 ? state.boards[0].name : 'Выберите доску';
  } else {
    // Save to the selected board or default first board
    let targetBoard = state.boards.find(b => b.name === modalSelectedBoardName.textContent);
    if (!targetBoard && state.boards.length > 0) {
      targetBoard = state.boards[0];
    }
    
    if (targetBoard) {
      savePinToBoard(pin.id, targetBoard.id);
    } else {
      // Create default board if none exist
      const defaultBoard = { id: 'board-default', name: 'Идеи для дома', pinIds: [pin.id] };
      state.boards.push(defaultBoard);
      state.currentUser.savedPins.push(pin.id);
      modalSelectedBoardName.textContent = defaultBoard.name;
      modalSaveBtn.textContent = 'Сохранено';
      modalSaveBtn.classList.add('saved');
      saveState();
    }
  }
}

// --- Create Pin Form Actions ---
function setupCreatePinPage() {
  // Populate board select dropdown options
  pinBoardSelect.innerHTML = '';
  state.boards.forEach(board => {
    const opt = document.createElement('option');
    opt.value = board.id;
    opt.textContent = board.name;
    pinBoardSelect.appendChild(opt);
  });

  // Add "Create new board" option
  const optCreate = document.createElement('option');
  optCreate.value = 'CREATE_NEW_BOARD_VAL';
  optCreate.textContent = '+ Создать новую доску...';
  pinBoardSelect.appendChild(optCreate);

  // Clear fields
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
    imageUrlInput.value = ''; // Reset direct url
  };
  reader.readAsDataURL(file);
}

function handleImageUrlChange() {
  const url = imageUrlInput.value.trim();
  if (url !== '') {
    previewImg.src = url;
    previewImg.classList.add('visible');
    previewChangeOverlay.classList.add('visible');
    uploadedImageBase64 = null; // Reset base64
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

  // Add to pins state
  state.pins.unshift(newPin);

  // Add to selected board
  if (boardId !== 'CREATE_NEW_BOARD_VAL') {
    const board = state.boards.find(b => b.id === boardId);
    if (board) {
      board.pinIds.push(newPinId);
    }
  }

  // Add to currentUser created & saved
  state.currentUser.createdPins.push(newPinId);
  state.currentUser.savedPins.push(newPinId);

  // Save state
  saveState();

  // Redirect to Profile -> Created tab
  state.activeProfileTab = 'created';
  state.activeBoardId = null;
  switchView('profile');
}

// --- Event Listeners Binding ---
function setupEventListeners() {
  // Navigation
  navLinks.home.addEventListener('click', () => {
    state.activeCategory = 'all';
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    state.activeBoardId = null;
    renderCategories();
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
    state.searchQuery = '';
    searchInput.value = '';
    clearSearchBtn.classList.remove('visible');
    state.activeBoardId = null;
    renderCategories();
    switchView('feed');
  });

  // Search input actions
  searchInput.addEventListener('focus', () => {
    renderSearchSuggestions();
    searchSuggestions.classList.add('active');
  });

  // Close suggestions when clicking outside
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

  // Popover Toggles
  popoverTriggers.notifications.addEventListener('click', (e) => {
    e.stopPropagation();
    const active = popovers.notifications.classList.contains('active');
    closeAllPopovers();
    if (!active) popovers.notifications.classList.add('active');
  });

  popoverTriggers.messages.addEventListener('click', (e) => {
    e.stopPropagation();
    const active = popovers.messages.classList.contains('active');
    closeAllPopovers();
    if (!active) popovers.messages.classList.add('active');
  });

  document.getElementById('close-notifications').addEventListener('click', (e) => {
    e.stopPropagation();
    popovers.notifications.classList.remove('active');
  });

  document.getElementById('close-messages').addEventListener('click', (e) => {
    e.stopPropagation();
    popovers.messages.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.popover') && !e.target.closest('.action-icon-btn')) {
      closeAllPopovers();
    }
  });

  // Detail Modal Actions
  modalCloseBtn.addEventListener('click', closePinDetails);
  
  pinDetailModal.addEventListener('click', (e) => {
    if (e.target === pinDetailModal) {
      closePinDetails();
    }
  });

  modalLikeBtn.addEventListener('click', toggleLike);
  modalFollowBtn.addEventListener('click', toggleFollowCreator);

  // Board Select dropdown in modal
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

  // Share and Options dummy alert in modal
  document.getElementById('modal-share-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(modalImg.src).then(() => {
      alert('Ссылка на картинку скопирована в буфер обмена!');
    });
  });

  document.getElementById('modal-options-btn').addEventListener('click', () => {
    alert('Опции пина: Нажата кнопка жалобы/скачивания.');
  });

  // Comments submit trigger
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

  boardBackBtn.addEventListener('click', () => {
    state.activeBoardId = null;
    renderProfile();
  });

  // Board Creation Dialog Trigger
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

  // Create Pin File Dropzone triggers
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

  // Mock profile share/edit buttons
  document.getElementById('profile-share-btn').addEventListener('click', () => {
    alert('Ссылка на профиль @creative_mind скопирована в буфер.');
  });
  document.getElementById('profile-edit-btn').addEventListener('click', () => {
    alert('Редактирование профиля: форма редактирования появится в следующей версии.');
  });
}

// --- App Initialization ---
function initApp() {
  initLocalStorage();
  
  // Set header profile avatar
  navLinks.profileImg.querySelector('img').src = state.currentUser.avatar;

  renderCategories();
  renderFeed();
  setupEventListeners();
  
  // Check if there is a hash route or reset view
  switchView('feed');
}

// Bootstrap application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
