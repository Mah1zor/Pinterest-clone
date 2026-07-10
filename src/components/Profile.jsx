import React, { useState } from 'react';
import PinGrid from './PinGrid';

export default function Profile({
  currentUser,
  allPins,
  boards,
  onUpdateUser,
  onOpenPinDetails,
  onLikePin,
  onSavePin,
  appSettings,
  setAppSettings,
  theme,
  setTheme,
  lang,
  setLang
}) {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'created', 'liked', 'boards'
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [selectedBoardPins, setSelectedBoardPins] = useState(null); // When viewing a specific board's pins

  // Form states for profile settings
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editUsername, setEditUsername] = useState(currentUser?.username || '');

  // Form states for general settings
  const [editGridColumns, setEditGridColumns] = useState(appSettings?.gridColumns || 5);
  const [editPrivateProfile, setEditPrivateProfile] = useState(appSettings?.privateProfile || false);
  const [editOnlineStatus, setEditOnlineStatus] = useState(appSettings?.onlineStatus || false);
  const [editSafeSearch, setEditSafeSearch] = useState(appSettings?.safeSearch || false);
  const [editSoundEffects, setEditSoundEffects] = useState(appSettings?.soundEffects || false);
  const [editTheme, setEditTheme] = useState(theme || 'light');
  const [editLang, setEditLang] = useState(lang || 'ru');
  const [editFontStyle, setEditFontStyle] = useState(appSettings?.fontStyle || 'standard');

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setAppSettings({
      gridColumns: parseInt(editGridColumns, 10),
      privateProfile: editPrivateProfile,
      onlineStatus: editOnlineStatus,
      safeSearch: editSafeSearch,
      soundEffects: editSoundEffects,
      fontStyle: editFontStyle
    });
    setTheme(editTheme);
    setLang(editLang);
    setIsEditing(false);
    alert('Настройки приложения успешно сохранены!');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const { updateUserProfile } = await import('../firebase/db');
      const updatedUser = await updateUserProfile(currentUser.uid, {
        name: editName.trim(),
        avatar: editAvatar.trim(),
        bio: editBio.trim(),
        username: editUsername.trim().toLowerCase()
      });
      onUpdateUser(updatedUser);
      setIsEditingProfile(false);
      alert('Профиль успешно обновлен!');
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении профиля: ' + err.message);
    }
  };

  // Filter pins based on active tab
  let filteredPins = [];
  if (activeTab === 'saved') {
    filteredPins = allPins.filter(pin => currentUser.savedPins?.includes(pin.id));
  } else if (activeTab === 'created') {
    filteredPins = allPins.filter(pin => currentUser.createdPins?.includes(pin.id) || pin.creator?.uid === currentUser.uid);
  } else if (activeTab === 'liked') {
    filteredPins = allPins.filter(pin => currentUser.likedPins?.includes(pin.id) || pin.likedBy?.includes(currentUser.uid));
  }

  const handleBoardClick = (board) => {
    const pinsInBoard = allPins.filter(pin => board.pinIds?.includes(pin.id));
    setSelectedBoardPins({ name: board.name, pins: pinsInBoard });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 40 }}>
        <img
          src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
          alt={currentUser?.name}
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '1px solid var(--gray-border)' }}
        />
        <h1 style={{ fontSize: 32, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--black)' }}>
          {currentUser?.name || 'Пользователь'}
        </h1>
        <div style={{ fontSize: 14, color: 'var(--gray-text)', fontWeight: 600, marginBottom: 12 }}>
          @{currentUser?.username || 'username'}
        </div>
        <p style={{ fontSize: 15, color: 'var(--black)', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
          {currentUser?.bio || 'Нет описания профиля. Нажмите редактировать, чтобы добавить информацию о себе!'}
        </p>

        <div style={{ display: 'flex', gap: 16, fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
          <span>{currentUser?.followersCount || 0} подписчиков</span>
          <span>•</span>
          <span>{currentUser?.followingCount || 0} подписок</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              setEditName(currentUser?.name || '');
              setEditAvatar(currentUser?.avatar || '');
              setEditBio(currentUser?.bio || '');
              setEditUsername(currentUser?.username || '');
              setIsEditingProfile(true);
            }}
            style={{
              padding: '10px 18px', borderRadius: 24, border: 'none',
              backgroundColor: 'rgba(230, 0, 35, 0.1)', color: '#e60023',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background-color 0.2s'
            }}
          >
            Редактировать профиль
          </button>
          
          <button
            onClick={() => {
              setEditGridColumns(appSettings?.gridColumns || 5);
              setEditPrivateProfile(appSettings?.privateProfile || false);
              setEditOnlineStatus(appSettings?.onlineStatus || false);
              setEditSafeSearch(appSettings?.safeSearch || false);
              setEditSoundEffects(appSettings?.soundEffects || false);
              setEditTheme(theme || 'light');
              setEditLang(lang || 'ru');
              setEditFontStyle(appSettings?.fontStyle || 'standard');
              setIsEditing(true);
            }}
            style={{
              padding: '10px 18px', borderRadius: 24, border: 'none',
              backgroundColor: 'var(--gray-light)', color: 'var(--black)',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background-color 0.2s'
            }}
          >
            Настройки приложения
          </button>
        </div>
      </div>

      {/* Editing Form Overlay */}
      {isEditing && (
        <div className="modal-overlay active" onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 20 }}>Настройки приложения</h2>
            <form onSubmit={handleEditSubmit} className="auth-form">
              <div className="auth-group">
                <label className="auth-label">Плотность сетки пинов</label>
                <select
                  className="auth-input"
                  value={editGridColumns}
                  onChange={(e) => setEditGridColumns(parseInt(e.target.value, 10))}
                  style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: 'var(--white)', color: 'var(--black)', border: '1px solid var(--gray-border)' }}
                >
                  <option value={3}>Крупная (3 колонки)</option>
                  <option value={5}>Стандартная (5 колонок)</option>
                  <option value={7}>Компактная (7 колонок)</option>
                </select>
              </div>

              <div className="auth-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '14px 0' }}>
                <label className="auth-label" style={{ margin: 0 }}>Приватный профиль</label>
                <input
                  type="checkbox"
                  checked={editPrivateProfile}
                  onChange={(e) => setEditPrivateProfile(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div className="auth-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '14px 0' }}>
                <label className="auth-label" style={{ margin: 0 }}>Статус "В сети"</label>
                <input
                  type="checkbox"
                  checked={editOnlineStatus}
                  onChange={(e) => setEditOnlineStatus(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div className="auth-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '14px 0' }}>
                <label className="auth-label" style={{ margin: 0 }}>Безопасный поиск</label>
                <input
                  type="checkbox"
                  checked={editSafeSearch}
                  onChange={(e) => setEditSafeSearch(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div className="auth-group" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '14px 0' }}>
                <label className="auth-label" style={{ margin: 0 }}>Звуки сообщений</label>
                <input
                  type="checkbox"
                  checked={editSoundEffects}
                  onChange={(e) => setEditSoundEffects(e.target.checked)}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              <div className="auth-group">
                <label className="auth-label">Тема оформления</label>
                <select
                  className="auth-input"
                  value={editTheme}
                  onChange={(e) => setEditTheme(e.target.value)}
                  style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: 'var(--white)', color: 'var(--black)', border: '1px solid var(--gray-border)' }}
                >
                  <option value="light">Светлая</option>
                  <option value="dark">Темная</option>
                </select>
              </div>

              <div className="auth-group">
                <label className="auth-label">Стиль текста (Шрифт)</label>
                <select
                  className="auth-input"
                  value={editFontStyle}
                  onChange={(e) => setEditFontStyle(e.target.value)}
                  style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: 'var(--white)', color: 'var(--black)', border: '1px solid var(--gray-border)' }}
                >
                  <option value="standard">Стандартный (Outfit / Inter)</option>
                  <option value="handwritten">Рукописный (Caveat / Neucha)</option>
                </select>
              </div>

              <div className="auth-group" style={{ marginBottom: '20px' }}>
                <label className="auth-label">Язык интерфейса</label>
                <select
                  className="auth-input"
                  value={editLang}
                  onChange={(e) => setEditLang(e.target.value)}
                  style={{ width: '100%', height: '40px', borderRadius: '10px', backgroundColor: 'var(--white)', color: 'var(--black)', border: '1px solid var(--gray-border)' }}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" className="auth-submit-btn" style={{ flex: 1, margin: 0 }}>
                  Сохранить
                </button>
                <button type="button" className="nav-btn" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditingProfile && (
        <div className="modal-overlay active" onClick={() => setIsEditingProfile(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ width: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: 20 }}>Настройки профиля</h2>
            <form onSubmit={handleProfileSubmit} className="auth-form">
              <div className="auth-group">
                <label className="auth-label">Ссылка на аватар (URL)</label>
                <input
                  type="text"
                  className="auth-input"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  required
                />
              </div>
              
              <div className="auth-group">
                <label className="auth-label">Публичное имя</label>
                <input
                  type="text"
                  className="auth-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="auth-group">
                <label className="auth-label">Имя пользователя (Ник @)</label>
                <input
                  type="text"
                  className="auth-input"
                  value={editUsername}
                  onChange={(e) => {
                    const cleanValue = e.target.value.replace(/@/g, '').replace(/\s+/g, '');
                    setEditUsername(cleanValue);
                  }}
                  required
                />
              </div>

              <div className="auth-group">
                <label className="auth-label">О себе (Bio)</label>
                <textarea
                  className="auth-input"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ height: '80px', resize: 'vertical', padding: '10px', width: '100%', borderRadius: '10px', border: '1px solid var(--gray-border)', backgroundColor: 'var(--white)', color: 'var(--black)' }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="submit" className="auth-submit-btn" style={{ flex: 1, margin: 0 }}>
                  Сохранить
                </button>
                <button type="button" className="nav-btn" onClick={() => setIsEditingProfile(false)} style={{ flex: 1 }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      {!selectedBoardPins && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, borderBottom: '1px solid var(--gray-border)', marginBottom: 30 }}>
          <button
            onClick={() => setActiveTab('saved')}
            style={{
              padding: '12px 16px', fontSize: 15, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === 'saved' ? 'var(--black)' : 'var(--gray-text)',
              borderBottom: activeTab === 'saved' ? '3px solid var(--black)' : '3px solid transparent'
            }}
          >
            Сохраненные
          </button>
          <button
            onClick={() => setActiveTab('created')}
            style={{
              padding: '12px 16px', fontSize: 15, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === 'created' ? 'var(--black)' : 'var(--gray-text)',
              borderBottom: activeTab === 'created' ? '3px solid var(--black)' : '3px solid transparent'
            }}
          >
            Созданные
          </button>
          <button
            onClick={() => setActiveTab('liked')}
            style={{
              padding: '12px 16px', fontSize: 15, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === 'liked' ? 'var(--black)' : 'var(--gray-text)',
              borderBottom: activeTab === 'liked' ? '3px solid var(--black)' : '3px solid transparent'
            }}
          >
            Понравившиеся
          </button>
          <button
            onClick={() => setActiveTab('boards')}
            style={{
              padding: '12px 16px', fontSize: 15, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === 'boards' ? 'var(--black)' : 'var(--gray-text)',
              borderBottom: activeTab === 'boards' ? '3px solid var(--black)' : '3px solid transparent'
            }}
          >
            Мои доски
          </button>
        </div>
      )}

      {/* Tab Contents */}
      {selectedBoardPins ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <button onClick={() => setSelectedBoardPins(null)} style={{ border: 'none', background: 'var(--gray-light)', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>Доска: {selectedBoardPins.name}</h2>
          </div>
          <PinGrid
            pins={selectedBoardPins.pins}
            currentUser={currentUser}
            onOpenDetails={onOpenPinDetails}
            onLike={onLikePin}
            onSave={onSavePin}
          />
        </div>
      ) : activeTab === 'boards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {boards?.map(board => (
            <div
              key={board.id}
              onClick={() => handleBoardClick(board)}
              style={{
                backgroundColor: 'var(--gray-light)', borderRadius: 20, padding: 24, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 140,
                border: '1px solid var(--gray-border)', transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <i className="fa-solid fa-folder" style={{ fontSize: 36, color: 'var(--black)', marginBottom: 12 }}></i>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px 0', textAlign: 'center', color: 'var(--black)' }}>
                {board.name}
              </h3>
              <span style={{ fontSize: 13, color: 'var(--gray-text)', fontWeight: 600 }}>
                {board.pinIds?.length || 0} пинов
              </span>
            </div>
          ))}
        </div>
      ) : (
        <PinGrid
          pins={filteredPins}
          currentUser={currentUser}
          onOpenDetails={onOpenPinDetails}
          onLike={onLikePin}
          onSave={onSavePin}
        />
      )}

    </div>
  );
}
