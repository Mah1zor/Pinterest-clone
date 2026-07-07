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
  onToggleSidebar,
  notificationsList = [],
  unreadCount = 0,
  onClearUnread,
  onClearAllNotifications
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);
  const t = LOCALES[lang] || LOCALES.ru;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
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

        {/* Notifications Bell Dropdown */}
        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
          <button
            className={`action-icon-btn ${showNotifDropdown ? 'active' : ''}`}
            title="Уведомления"
            style={{ marginRight: 8, position: 'relative' }}
            onClick={() => {
              setShowNotifDropdown(!showNotifDropdown);
              if (onClearUnread) onClearUnread();
            }}
          >
            <i className="fa-solid fa-bell"></i>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2, backgroundColor: '#e60023',
                color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px',
                borderRadius: '50%', border: '2px solid var(--white)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div style={{
              position: 'absolute', right: 0, top: '48px', width: '320px',
              backgroundColor: 'var(--white)', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              border: '1px solid var(--gray-border)', zIndex: 1000, padding: '16px', maxHeight: '380px', overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--black)' }}>Уведомления</h4>
                {notificationsList.length > 0 && (
                  <button
                    onClick={() => {
                      if (onClearAllNotifications) onClearAllNotifications();
                    }}
                    style={{ border: 'none', background: 'none', color: 'var(--gray-text)', fontSize: 11, cursor: 'pointer' }}
                  >
                    Очистить все
                  </button>
                )}
              </div>

              {notificationsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--gray-text)', fontSize: 13 }}>
                  Нет новых уведомлений
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notificationsList.map(n => (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '8px',
                        borderRadius: '8px', cursor: 'pointer', transition: 'background-color 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-light)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => {
                        setShowNotifDropdown(false);
                        setView(n.type === 'message' ? 'chat' : 'profile');
                      }}
                    >
                      <img src={n.avatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--black)' }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--gray-text)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{n.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
