import React, { useState, useEffect } from 'react';
import { subscribeToAuth, logoutUser, fetchPins, fetchBoards } from './firebase/db';
import Auth from './components/Auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PinGrid from './components/PinGrid';
import PinDetailModal from './components/PinDetailModal';
import CreatePin from './components/CreatePin';
import Profile from './components/Profile';
import Chat from './components/Chat';

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Layout states
  const [view, setView] = useState('feed'); // 'feed', 'create', 'profile', 'chat'
  const [theme, setTheme] = useState(() => localStorage.getItem('pinterest_theme') || 'light');
  const [lang, setLang] = useState(() => localStorage.getItem('pinterest_lang') || 'ru');
  const [density, setDensity] = useState(() => localStorage.getItem('pinterest_density') || 'cozy');
  const [appSettings, setAppSettings] = useState(() => {
    const saved = localStorage.getItem('pinterest_app_settings');
    return saved ? JSON.parse(saved) : {
      gridColumns: 5,
      privateProfile: false,
      onlineStatus: true,
      safeSearch: false,
      soundEffects: true
    };
  });
  
  // Navigation & filtering states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBoardId, setSelectedBoardId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Content states
  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [boards, setBoards] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);

  // 1. Listen to Firebase auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setLoadingUser(false);
      
      // If user logs out, go back to feed
      if (!user) {
        setView('feed');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch User's boards when logged in
  const loadBoardsList = async () => {
    if (!currentUser) return;
    try {
      const userBoards = await fetchBoards(currentUser.uid);
      setBoards(userBoards);
    } catch (err) {
      console.error("Error loading user boards:", err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadBoardsList();
    } else {
      setBoards([]);
    }
  }, [currentUser]);

  // 3. Apply site options (theme, density)
  useEffect(() => {
    // Theme setup
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('pinterest_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Grid density setup
    document.body.classList.remove('density-compact', 'density-spacious');
    if (density === 'compact') {
      document.body.classList.add('density-compact');
    } else if (density === 'spacious') {
      document.body.classList.add('density-spacious');
    }
    localStorage.setItem('pinterest_density', density);
  }, [density]);

  useEffect(() => {
    localStorage.setItem('pinterest_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.style.setProperty('--grid-columns', appSettings.gridColumns);
    localStorage.setItem('pinterest_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // 4. Fetch pins based on categories, boards, or search
  const loadPinsList = async () => {
    setLoadingPins(true);
    try {
      // If filtering by a specific board, filter pins that belong to it
      if (selectedBoardId) {
        const activeBoard = boards.find(b => b.id === selectedBoardId);
        if (activeBoard) {
          const dbPins = await fetchPins('all', searchQuery);
          const boardPins = dbPins.filter(p => activeBoard.pinIds?.includes(p.id));
          setPins(boardPins);
          setLoadingPins(false);
          return;
        }
      }

      // Try fetching from serverless Netlify function if search is active (demonstrates real API)
      if (searchQuery) {
        try {
          const res = await fetch(`/.netlify/functions/unsplash?q=${encodeURIComponent(searchQuery)}&category=${activeCategory}`);
          if (res.ok) {
            const data = await res.json();
            setPins(data);
            setLoadingPins(false);
            return;
          }
        } catch (e) {
          console.log("Netlify serverless function offline. Querying database directly.");
        }
      }

      // Query from database/mock list
      const dbPins = await fetchPins(activeCategory, searchQuery);
      setPins(dbPins);
    } catch (err) {
      console.error("Error loading pins:", err);
    } finally {
      setLoadingPins(false);
    }
  };

  useEffect(() => {
    loadPinsList();
  }, [activeCategory, searchQuery, selectedBoardId, boards]);

  const handleLogout = async () => {
    if (window.confirm(lang === 'ru' ? 'Вы уверены, что хотите выйти?' : 'Are you sure you want to log out?')) {
      await logoutUser();
      setCurrentUser(null);
    }
  };

  const handleUpdatePinInFeed = (updatedPin) => {
    setPins(prev => prev.map(p => p.id === updatedPin.id ? updatedPin : p));
    if (selectedPin && selectedPin.id === updatedPin.id) {
      setSelectedPin(updatedPin);
    }
  };

  if (loadingUser) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--white)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-brands fa-pinterest" style={{ fontSize: '48px', color: '#e60023', animation: 'pulse 1.5s infinite' }}></i>
          <p style={{ marginTop: '12px', fontWeight: 600, color: 'var(--black)' }}>Загрузка Pinterest...</p>
        </div>
      </div>
    );
  }

  // Display authentication overlay if no user is signed in
  if (!currentUser) {
    return <Auth lang={lang} onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Header Bar */}
      <Header
        lang={lang}
        currentView={view}
        setView={setView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main workspace (Sidebar + Screen Content) */}
      <div style={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        
        {/* Backdrop for mobile drawer */}
        <div
          className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`}
          onClick={() => setSidebarOpen(false)}
          style={sidebarOpen ? { display: 'block', opacity: 1, pointerEvents: 'auto' } : {}}
        ></div>

        {/* Sidebar Panel */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={view}
          setView={setView}
          lang={lang}
          setLang={setLang}
          theme={theme}
          setTheme={setTheme}
          density={density}
          setDensity={setDensity}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          boards={boards}
          selectedBoardId={selectedBoardId}
          setSelectedBoardId={setSelectedBoardId}
          onLogout={handleLogout}
        />

        {/* Main Content Pane */}
        <main style={{ flexGrow: 1, paddingLeft: 280, paddingTop: 100, width: '100%' }} className="main-content-pane">
          {loadingPins && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#e60023' }}></i>
            </div>
          )}

          {!loadingPins && (
            <>
              {view === 'feed' && (
                <div style={{ padding: '0 24px' }}>
                  {selectedBoardId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <button
                        onClick={() => setSelectedBoardId(null)}
                        style={{ border: 'none', background: 'var(--gray-light)', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <i className="fa-solid fa-arrow-left"></i>
                      </button>
                      <h2 style={{ fontSize: 20, fontWeight: 700 }}>
                        Просмотр доски: {boards.find(b => b.id === selectedBoardId)?.name}
                      </h2>
                    </div>
                  )}
                  <PinGrid
                    pins={pins}
                    currentUser={currentUser}
                    onOpenDetails={(pin) => setSelectedPin(pin)}
                    onLike={async (pinId, isLiked) => {
                      const updatedPins = pins.map(p => {
                        if (p.id === pinId) {
                          const likedBy = isLiked ? [...(p.likedBy || []), currentUser.uid] : (p.likedBy || []).filter(uid => uid !== currentUser.uid);
                          return { ...p, likedBy, likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1) };
                        }
                        return p;
                      });
                      setPins(updatedPins);
                      const { likePin } = await import('./firebase/db');
                      await likePin(pinId, currentUser.uid, isLiked);
                      // Update currentUser profile locally
                      const updatedSaved = { ...currentUser };
                      updatedSaved.likedPins = isLiked ? [...(currentUser.likedPins || []), pinId] : (currentUser.likedPins || []).filter(id => id !== pinId);
                      setCurrentUser(updatedSaved);
                    }}
                    onSave={async (pinId) => {
                      if (boards.length === 0) {
                        alert("Сначала создайте доску в профиле!");
                        return;
                      }
                      const { addPinToBoard } = await import('./firebase/db');
                      await addPinToBoard(boards[0].id, pinId, currentUser.uid);
                      alert(`Пин сохранен в доску "${boards[0].name}"!`);
                      await loadBoardsList(); // reload board pins count
                    }}
                  />
                </div>
              )}

              {view === 'create' && (
                <CreatePin
                  currentUser={currentUser}
                  boards={boards}
                  onRefreshBoards={loadBoardsList}
                  onNavigateHome={() => setView('feed')}
                />
              )}

              {view === 'profile' && (
                <Profile
                  currentUser={currentUser}
                  allPins={pins}
                  boards={boards}
                  onUpdateUser={(updated) => setCurrentUser(updated)}
                  onOpenPinDetails={(pin) => setSelectedPin(pin)}
                  appSettings={appSettings}
                  setAppSettings={setAppSettings}
                  theme={theme}
                  setTheme={setTheme}
                  lang={lang}
                  setLang={setLang}
                  onLikePin={async (pinId, isLiked) => {
                    const { likePin } = await import('./firebase/db');
                    await likePin(pinId, currentUser.uid, isLiked);
                    const updatedUser = { ...currentUser };
                    updatedUser.likedPins = isLiked ? [...(currentUser.likedPins || []), pinId] : (currentUser.likedPins || []).filter(id => id !== pinId);
                    setCurrentUser(updatedUser);
                    loadPinsList();
                  }}
                  onSavePin={async (pinId) => {
                    if (boards.length === 0) return;
                    const { addPinToBoard } = await import('./firebase/db');
                    await addPinToBoard(boards[0].id, pinId, currentUser.uid);
                    await loadBoardsList();
                  }}
                />
              )}

              {view === 'chat' && (
                <Chat currentUser={currentUser} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Pin Detail Overlay Modal */}
      {selectedPin && (
        <PinDetailModal
          pin={selectedPin}
          currentUser={currentUser}
          boards={boards}
          onClose={() => setSelectedPin(null)}
          onUpdatePin={handleUpdatePinInFeed}
          onRefreshBoards={loadBoardsList}
          onUpdateUser={(updated) => setCurrentUser(updated)}
        />
      )}
    </div>
  );
}
