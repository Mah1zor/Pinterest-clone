import React, { useState } from 'react';

export default function AdminPanel({
  pins,
  onDeletePin,
  onContactAuthor
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPins = pins.filter(pin => 
    pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pin.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pin.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid var(--gray-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--black)' }}>
              Панель администратора
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-text)', marginTop: 4 }}>
              Управление контентом платформы и обратная связь с авторами
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--gray-light)', padding: '10px 16px', borderRadius: 16, fontSize: 14, fontWeight: 600 }}>
            Всего пинов: {pins.length}
          </div>
        </div>

        {/* Search filter */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            className="auth-input"
            placeholder="Поиск по названию пина или автору..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: 0, padding: '10px 16px', borderRadius: 12 }}
          />
        </div>

        {/* Pins list table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--gray-border)', color: 'var(--gray-text)', fontSize: 13, fontWeight: 700 }}>
                <th style={{ padding: '12px 8px' }}>Превью</th>
                <th style={{ padding: '12px 8px' }}>Название</th>
                <th style={{ padding: '12px 8px' }}>Категория</th>
                <th style={{ padding: '12px 8px' }}>Автор</th>
                <th style={{ padding: '12px 8px' }}>Дата</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredPins.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '30px 8px', textAlign: 'center', color: 'var(--gray-text)', fontSize: 14 }}>
                    Пины не найдены
                  </td>
                </tr>
              ) : (
                filteredPins.map(pin => (
                  <tr key={pin.id} style={{ borderBottom: '1px solid var(--gray-border)', fontSize: 14, color: 'var(--black)' }}>
                    <td style={{ padding: '12px 8px' }}>
                      <img
                        src={pin.image}
                        alt=""
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                      />
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pin.title}
                    </td>
                    <td style={{ padding: '12px 8px' }}>{pin.category}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <img
                          src={pin.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                          alt=""
                          style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <span style={{ fontWeight: 600, display: 'block' }}>{pin.creator?.name}</span>
                          <span style={{ fontSize: 11, color: 'var(--gray-text)' }}>@{pin.creator?.username}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: 13, color: 'var(--gray-text)' }}>
                      {pin.date}
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        {/* Contact Author button */}
                        <button
                          onClick={() => onContactAuthor(pin.creator)}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            backgroundColor: 'rgba(66, 133, 244, 0.1)', color: '#4285F4',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.15)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(66, 133, 244, 0.1)'}
                        >
                          <i className="fa-solid fa-paper-plane" style={{ marginRight: 4 }}></i>
                          Связаться
                        </button>
                        
                        {/* Delete Pin button */}
                        <button
                          onClick={() => onDeletePin(pin.id, pin.creator?.uid)}
                          style={{
                            padding: '6px 12px', borderRadius: 8, border: 'none',
                            backgroundColor: 'rgba(230, 0, 35, 0.1)', color: '#e60023',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(230, 0, 35, 0.15)'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(230, 0, 35, 0.1)'}
                        >
                          <i className="fa-solid fa-trash-can" style={{ marginRight: 4 }}></i>
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
