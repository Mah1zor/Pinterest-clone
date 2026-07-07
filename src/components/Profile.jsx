import React, { useState } from 'react';
import { updateUserProfile } from '../firebase/db';
import PinGrid from './PinGrid';

export default function Profile({
  currentUser,
  allPins,
  boards,
  onUpdateUser,
  onOpenPinDetails,
  onLikePin,
  onSavePin
}) {
  const [activeTab, setActiveTab] = useState('saved'); // 'saved', 'created', 'liked', 'boards'
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editBio, setEditBio] = useState(currentUser?.bio || '');
  const [editAvatar, setEditAvatar] = useState(currentUser?.avatar || '');
  const [selectedBoardPins, setSelectedBoardPins] = useState(null); // When viewing a specific board's pins

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile(currentUser.uid, {
        name: editName.trim(),
        bio: editBio.trim(),
        avatar: editAvatar.trim()
      });
      onUpdateUser(updated);
      setIsEditing(false);
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

        <button
          onClick={() => {
            setEditName(currentUser.name);
            setEditBio(currentUser.bio || '');
            setEditAvatar(currentUser.avatar);
            setIsEditing(true);
          }}
          style={{
            padding: '10px 18px', borderRadius: 24, border: 'none',
            backgroundColor: 'var(--gray-light)', color: 'var(--black)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'background-color 0.2s'
          }}
        >
          Редактировать профиль
        </button>
      </div>

      {/* Editing Form Overlay */}
      {isEditing && (
        <div className="modal-overlay active" onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="auth-card" onClick={(e) => e.stopPropagation()} style={{ width: '450px' }}>
            <h2 style={{ marginBottom: 20 }}>Настройки профиля</h2>
            <form onSubmit={handleEditSubmit} className="auth-form">
              <div className="auth-group">
                <label className="auth-label">Ссылка на аватар (URL)</label>
                <input
                  type="url"
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
                <label className="auth-label">О себе (Bio)</label>
                <textarea
                  className="auth-input"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  style={{ minHeight: '60px', resize: 'vertical', fontFamily: 'inherit' }}
                />
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
