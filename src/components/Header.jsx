import React, { useState, useEffect, useRef } from 'react';
import { SUGGESTED_SEARCHES } from '../../data';
import { LOCALES } from '../locales';

export default function Header({
  lang,
  currentView,
  setView,
  searchQuery,
  setSearchQuery,
  currentUser,
  onToggleSidebar
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef(null);
  const t = LOCALES[lang] || LOCALES.ru;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (query) => {
    setSearchQuery(query);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setShowSuggestions(false);
  };

  return (
    <header className="app-header">
      {/* Mobile Catalog Trigger */}
      <button
        className="action-icon-btn mobile-menu-toggle"
        id="mobile-menu-toggle"
        title="Каталог"
        style={{ marginRight: 8 }}
        onClick={onToggleSidebar}
      >
        <i className="fa-solid fa-bars"></i>
      </button>

      {/* Pinterest Logo */}
      <div
        className="logo-container"
        id="logo-home-trigger"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          setView('feed');
          setSearchQuery('');
        }}
      >
        <div className="logo-icon">
          <i className="fa-brands fa-pinterest"></i>
        </div>
      </div>

      {/* Desktop navigation */}
      <div className="header-nav-links-desktop">
        <button
          className={`nav-btn ${currentView === 'feed' ? 'active' : ''}`}
          id="nav-home"
          onClick={() => {
            setView('feed');
            setSearchQuery('');
          }}
        >
          {t.navHome}
        </button>
        <button
          className={`nav-btn ${currentView === 'create' ? 'active' : ''}`}
          id="nav-create"
          onClick={() => setView('create')}
        >
          {t.navCreate}
        </button>
      </div>

      {/* Search Input Container */}
      <div className="search-container" ref={dropdownRef}>
        <i className="fa-solid fa-magnifying-glass search-icon"></i>
        <input
          type="text"
          className="search-bar"
          id="search-input"
          placeholder="Поиск вдохновения..."
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setShowSuggestions(true)}
          autoComplete="off"
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            id="clear-search-btn"
            style={{ display: 'block' }}
            onClick={handleClear}
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
        )}

        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="search-suggestions" id="search-suggestions" style={{ display: 'block' }}>
            <h4 id="label-popular-searches">{t.popularSearches}</h4>
            <div className="suggestions-grid" id="suggestions-list">
              {SUGGESTED_SEARCHES.map((queryText, index) => (
                <button
                  key={index}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(queryText)}
                >
                  {queryText}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="header-actions">
        {/* Chat Button Shortcut */}
        <button
          className={`action-icon-btn ${currentView === 'chat' ? 'active' : ''}`}
          id="header-chat-btn"
          title="Сообщения / Чат"
          style={{ marginRight: 8 }}
          onClick={() => setView('chat')}
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>

        {/* User Profile Avatar */}
        <button
          className={`profile-avatar-btn ${currentView === 'profile' ? 'active-border' : ''}`}
          id="nav-profile-img"
          title="Профиль"
          onClick={() => setView('profile')}
        >
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            id="header-avatar-img"
            alt="Мой профиль"
          />
        </button>
      </div>
    </header>
  );
}
