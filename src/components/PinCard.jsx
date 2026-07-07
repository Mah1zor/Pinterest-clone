import React from 'react';

export default function PinCard({
  pin,
  currentUser,
  onOpenDetails,
  onLike,
  onSave
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

  return (
    <div className="pin-card" onClick={onOpenDetails}>
      <div className="pin-card-media-wrapper">
        <img
          src={pin.image}
          alt={pin.title}
          loading="lazy"
          style={{ width: '100%', display: 'block', borderRadius: 'var(--border-radius-card)' }}
        />
        
        {/* Hover Overlay */}
        <div className="pin-card-hover-overlay">
          <div className="hover-top">
            <button className="pin-card-save-btn" onClick={handleSaveClick}>
              Сохранить
            </button>
          </div>
          <div className="hover-bottom" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 8px' }}>
            {pin.link ? (
              <a
                href={pin.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-action-btn link-btn"
                onClick={(e) => e.stopPropagation()}
                title="Перейти на сайт"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)',
                  color: '#000', fontSize: 13
                }}
              >
                <i className="fa-solid fa-arrow-up-right-from-square"></i>
              </a>
            ) : <div />}
            
            <button
              className={`hover-action-btn like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeClick}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                backgroundColor: isLiked ? '#e60023' : 'rgba(255,255,255,0.9)',
                color: isLiked ? '#fff' : '#000', border: 'none', cursor: 'pointer', fontSize: 13
              }}
            >
              <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
            </button>
          </div>
        </div>
      </div>

      <div className="pin-card-info" style={{ padding: '8px 4px' }}>
        <h3 className="pin-card-title" style={{ fontSize: 14, fontWeight: 700, margin: '4px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {pin.title}
        </h3>
        <div className="pin-card-author" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <img
            src={pin.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&auto=format&fit=crop&q=80'}
            alt={pin.creator?.name}
            className="pin-author-img"
            style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span className="pin-author-name" style={{ fontSize: 12, fontWeight: 600, color: 'var(--black)' }}>
            {pin.creator?.name || 'Автор'}
          </span>
        </div>
      </div>
    </div>
  );
}
