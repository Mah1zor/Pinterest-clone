import React from 'react';

export default function PinCard({
  pin,
  currentUser,
  onOpenDetails,
  onLike,
  onSave,
  onViewUserProfile
}) {
  const isLiked = pin.likedBy?.includes(currentUser?.uid);

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (onLike) {
      onLike(pin.id, !isLiked);
    }
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    if (onSave) {
      onSave(pin.id);
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (onViewUserProfile && pin.creator?.uid) {
      onViewUserProfile(pin.creator.uid);
    }
  };

  return (
    <div className="pin-card" onClick={onOpenDetails}>
      <div className="pin-card-media-wrapper">
        <img
          src={pin.image}
          alt={pin.title}
          loading="lazy"
          className="pin-card-img"
        />
        
        {/* Hover Overlay */}
        <div className="pin-card-overlay">
          <div className="overlay-top">
            <div className="overlay-board-btn" title={pin.category}>
              {pin.category || 'Вдохновение'}
            </div>
            <button className="overlay-save-btn" onClick={handleSaveClick}>
              Сохранить
            </button>
          </div>
          <div className="overlay-bottom">
            {pin.link ? (
              <a
                href={pin.link}
                target="_blank"
                rel="noopener noreferrer"
                className="overlay-link-btn"
                onClick={(e) => e.stopPropagation()}
                title="Перейти на сайт"
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
                {pin.link.replace('https://', '').replace('http://', '').split('/')[0]}
              </a>
            ) : <div />}
            
            <div className="overlay-actions">
              <button
                className="overlay-action-btn"
                onClick={handleLikeClick}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: isLiked ? '#e60023' : 'rgba(255,255,255,0.9)',
                  color: isLiked ? '#fff' : '#111'
                }}
              >
                <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="pin-card-info">
        <h3 className="pin-card-title" style={{ fontSize: 14, fontWeight: 700, margin: '6px 0 4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pin.title}
        </h3>
        <div className="pin-card-author" onClick={handleAuthorClick} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <img
            src={pin.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&auto=format&fit=crop&q=80'}
            alt={pin.creator?.name}
            className="pin-author-img"
            style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span className="pin-author-name" style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>
            {pin.creator?.name || 'Автор'}
          </span>
        </div>
      </div>
    </div>
  );
}
