import React from 'react';
import PinCard from './PinCard';

export default function PinGrid({
  pins,
  currentUser,
  onOpenDetails,
  onLike,
  onSave
}) {
  if (!pins || pins.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-text)' }}>
        <i className="fa-regular fa-folder-open" style={{ fontSize: 48, marginBottom: 16, color: '#ccc' }}></i>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Ничего не найдено</h3>
        <p style={{ fontSize: 14, marginTop: 6 }}>Попробуйте изменить параметры поиска или категорию</p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="pins-grid">
        {pins.map((pin) => (
          <PinCard
            key={pin.id}
            pin={pin}
            currentUser={currentUser}
            onOpenDetails={() => onOpenDetails(pin)}
            onLike={onLike}
            onSave={onSave}
          />
        ))}
      </div>
    </div>
  );
}
