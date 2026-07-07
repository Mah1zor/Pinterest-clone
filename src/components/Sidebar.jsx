import React from 'react';
import { CATEGORIES } from '../../data';
import { LOCALES } from '../locales';

export default function Sidebar({
  isOpen,
  onClose,
  currentView,
  setView,
  lang,
  setLang,
  theme,
  setTheme,
  density,
  setDensity,
  activeCategory,
  setActiveCategory,
  boards,
  selectedBoardId,
  setSelectedBoardId,
  onLogout,
  currentUser
}) {
  const t = LOCALES[lang] || LOCALES.ru;

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    setSelectedBoardId(null); // Clear board filter when category is clicked
    setView('feed');
    if (onClose) onClose();
  };

  const handleBoardClick = (boardId) => {
    setSelectedBoardId(boardId);
    setActiveCategory('all'); // Clear category filter when board is clicked
    setView('feed');
    if (onClose) onClose();
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
  };

  const handleResetData = () => {
    if (window.confirm(lang === 'ru' ? 'Вы уверены, что хотите сбросить все данные сайта?' : 'Are you sure you want to reset all site data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <aside className={`side-catalog left-side ${isOpen ? 'active' : ''}`} id="left-catalog-sidebar" style={isOpen ? { display: 'flex', transform: 'none', boxShadow: '0 0 20px rgba(0,0,0,0.15)' } : {}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, paddingLeft: 8 }} id="label-catalog-title">{t.catalogTitle}</h3>
        <button className="drawer-close-btn" id="left-drawer-close" title="Закрыть каталог" style={isOpen ? { display: 'flex' } : {}} onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div className="catalog-divider" style={{ margin: '8px 0' }}></div>

      {/* Menu Section */}
      <div className="catalog-section">
        <h4 className="catalog-heading" id="label-cat-menu">{t.catMenu}</h4>
        <div className="catalog-menu-items">
          <button
            className={`catalog-item ${currentView === 'feed' && !selectedBoardId ? 'active' : ''}`}
            onClick={() => {
              setSelectedBoardId(null);
              setView('feed');
              if (onClose) onClose();
            }}
          >
            <i className="fa-solid fa-house catalog-item-icon"></i>
            <span>{t.navHome}</span>
          </button>
          <button
            className={`catalog-item ${currentView === 'create' ? 'active' : ''}`}
            onClick={() => {
              setView('create');
              if (onClose) onClose();
            }}
          >
            <i className="fa-solid fa-circle-plus catalog-item-icon"></i>
            <span>{t.navCreate}</span>
          </button>
          <button
            className={`catalog-item ${currentView === 'profile' ? 'active' : ''}`}
            onClick={() => {
              setView('profile');
              if (onClose) onClose();
            }}
          >
            <i className="fa-solid fa-user catalog-item-icon"></i>
            <span>Профиль</span>
          </button>
          <button
            className={`catalog-item ${currentView === 'chat' ? 'active' : ''}`}
            onClick={() => {
              setView('chat');
              if (onClose) onClose();
            }}
          >
            <i className="fa-solid fa-comments catalog-item-icon"></i>
            <span>Чат</span>
          </button>
          {currentUser?.isAdmin && (
            <button
              className={`catalog-item ${currentView === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setView('admin');
                if (onClose) onClose();
              }}
            >
              <i className="fa-solid fa-shield-halved catalog-item-icon"></i>
              <span>Админ-панель</span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Boards Section */}
      {boards && boards.length > 0 && (
        <div className="catalog-section">
          <h4 className="catalog-heading">{t.catBoards}</h4>
          <div className="catalog-menu-items">
            {boards.map(board => (
              <button
                key={board.id}
                className={`catalog-item ${selectedBoardId === board.id ? 'active' : ''}`}
                onClick={() => handleBoardClick(board.id)}
              >
                <i className="fa-solid fa-folder catalog-item-icon"></i>
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {board.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="catalog-section">
        <h4 className="catalog-heading" id="label-cat-categories">{t.catCategories}</h4>
        <div className="catalog-menu-items">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`catalog-item ${activeCategory === cat.id && !selectedBoardId ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              <i className="fa-solid fa-tag catalog-item-icon"></i>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="catalog-divider" style={{ margin: '8px 0' }}></div>

      {/* Site Settings Section */}
      <div className="catalog-section">
        <h4 className="catalog-heading" id="label-site-settings-title">{t.siteSettingsTitle}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 8px' }}>
          
          {/* Theme switcher */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{t.siteTheme}</span>
            <label className="toggle-switch" style={{ position: 'relative', display: 'inline-block', width: 44, height: 24 }}>
              <input
                type="checkbox"
                checked={theme === 'dark'}
                onChange={toggleTheme}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span className="slider round" style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: theme === 'dark' ? '#ff3b30' : '#ccc',
                transition: '.4s', borderRadius: 24
              }}></span>
            </label>
          </div>

          {/* Language selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-text)', fontWeight: 500 }}>{t.siteLang}</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-border)',
                backgroundColor: 'var(--white)', color: 'var(--black)', fontSize: 14, cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="ru">Русский (RU)</option>
              <option value="en">English (EN)</option>
            </select>
          </div>

          {/* Grid Spacing */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-text)', fontWeight: 500 }}>{t.siteDensity}</span>
            <select
              value={density}
              onChange={(e) => setDensity(e.target.value)}
              style={{
                width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-border)',
                backgroundColor: 'var(--white)', color: 'var(--black)', fontSize: 14, cursor: 'pointer', outline: 'none'
              }}
            >
              <option value="compact">{t.siteDensityCompact}</option>
              <option value="cozy">{t.siteDensityCozy}</option>
              <option value="spacious">{t.siteDensitySpacious}</option>
            </select>
          </div>

          {/* Reset App Data */}
          <button
            onClick={handleResetData}
            style={{
              padding: '8px 12px', borderRadius: 8, border: '1px solid #e60023', background: 'transparent',
              color: '#e60023', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 8, transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(230, 0, 35, 0.05)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {t.siteReset}
          </button>

          {/* Log Out */}
          <button
            onClick={onLogout}
            style={{
              padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--gray-light)',
              color: 'var(--black)', fontWeight: 600, fontSize: 13, cursor: 'pointer', marginTop: 4, transition: 'background-color 0.2s'
            }}
          >
            {t.settingsLogout}
          </button>
        </div>
      </div>
    </aside>
  );
}
