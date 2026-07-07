import React, { useState, useEffect } from 'react';
import { fetchUsersList, blockUser, deleteUser } from '../firebase/db';

export default function AdminPanel({
  pins,
  onDeletePin,
  onContactAuthor
}) {
  const [activeTab, setActiveTab] = useState('pins'); // 'pins', 'users'
  const [searchTerm, setSearchTerm] = useState('');
  
  // Users tab states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const loadUsersList = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchUsersList();
      // Exclude admin itself from management
      setUsers(data.filter(u => u.username !== 'admin'));
    } catch (err) {
      console.error("Error loading users list", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsersList();
    }
  }, [activeTab]);

  const handleBlockToggle = async (user) => {
    const nextBlockedState = !user.isBlocked;
    const confirmMessage = nextBlockedState
      ? `Вы действительно хотите ЗАБЛОКИРОВАТЬ пользователя @${user.username}? Он будет немедленно разлогинен.`
      : `Разблокировать пользователя @${user.username}?`;

    if (window.confirm(confirmMessage)) {
      try {
        await blockUser(user.uid, nextBlockedState);
        setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isBlocked: nextBlockedState } : u));
        alert(nextBlockedState ? 'Пользователь успешно заблокирован.' : 'Пользователь успешно разблокирован.');
      } catch (err) {
        console.error(err);
        alert('Ошибка при изменении статуса блокировки.');
      }
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmMessage = `ВНИМАНИЕ: Вы действительно хотите навсегда УДАЛИТЬ аккаунт пользователя @${user.username} и ВСЕ его пины? Это действие необратимо!`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await deleteUser(user.uid);
        setUsers(prev => prev.filter(u => u.uid !== user.uid));
        alert('Пользователь и все его пины успешно удалены.');
      } catch (err) {
        console.error(err);
        alert('Ошибка при удалении пользователя.');
      }
    }
  };

  // Filters
  const filteredPins = pins.filter(pin => 
    pin.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pin.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pin.creator?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px' }}>
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 30px rgba(0,0,0,0.05)', border: '1px solid var(--gray-border)' }}>
        
        {/* Dashboard Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--black)' }}>
              Панель администратора
            </h2>
            <p style={{ fontSize: 13, color: 'var(--gray-text)', marginTop: 4 }}>
              Управление контентом платформы, пользователями и обратная связь
            </p>
          </div>
          <div style={{ backgroundColor: 'var(--gray-light)', padding: '10px 16px', borderRadius: 16, fontSize: 14, fontWeight: 600 }}>
            {activeTab === 'pins' ? `Всего пинов: ${pins.length}` : `Пользователей: ${users.length}`}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', gap: 16, borderBottom: '1px solid var(--gray-border)', marginBottom: 24 }}>
          <button
            onClick={() => { setActiveTab('pins'); setSearchTerm(''); }}
            style={{
              padding: '12px 16px', fontSize: 15, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === 'pins' ? 'var(--black)' : 'var(--gray-text)',
              borderBottom: activeTab === 'pins' ? '3px solid var(--black)' : '3px solid transparent'
            }}
          >
            Управление пинами
          </button>
          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            style={{
              padding: '12px 16px', fontSize: 15, fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer',
              color: activeTab === 'users' ? 'var(--black)' : 'var(--gray-text)',
              borderBottom: activeTab === 'users' ? '3px solid var(--black)' : '3px solid transparent'
            }}
          >
            Управление пользователями
          </button>
        </div>

        {/* Search bar */}
        <div style={{ marginBottom: 20 }}>
          <input
            type="text"
            className="auth-input"
            placeholder={activeTab === 'pins' ? 'Поиск по названию пина или автору...' : 'Поиск по имени, никнейму или email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ margin: 0, padding: '10px 16px', borderRadius: 12 }}
          />
        </div>

        {/* Tab content rendering */}
        {activeTab === 'pins' ? (
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
                          <button
                            onClick={() => onContactAuthor(pin.creator)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: 'none',
                              backgroundColor: 'rgba(66, 133, 244, 0.1)', color: '#4285F4',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer'
                            }}
                          >
                            <i className="fa-solid fa-paper-plane" style={{ marginRight: 4 }}></i>
                            Связаться
                          </button>
                          
                          <button
                            onClick={() => onDeletePin(pin.id, pin.creator?.uid)}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: 'none',
                              backgroundColor: 'rgba(230, 0, 35, 0.1)', color: '#e60023',
                              fontSize: 12, fontWeight: 700, cursor: 'pointer'
                            }}
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
        ) : (
          /* Users Management Tab */
          <div style={{ overflowX: 'auto' }}>
            {loadingUsers ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '30px 0' }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: '#e60023' }}></i>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--gray-border)', color: 'var(--gray-text)', fontSize: 13, fontWeight: 700 }}>
                    <th style={{ padding: '12px 8px' }}>Аватар</th>
                    <th style={{ padding: '12px 8px' }}>Имя</th>
                    <th style={{ padding: '12px 8px' }}>Никнейм</th>
                    <th style={{ padding: '12px 8px' }}>Эл. Почта</th>
                    <th style={{ padding: '12px 8px' }}>Статус</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '30px 8px', textAlign: 'center', color: 'var(--gray-text)', fontSize: 14 }}>
                        Пользователи не найдены
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.uid} style={{ borderBottom: '1px solid var(--gray-border)', fontSize: 14, color: 'var(--black)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <img
                            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'}
                            alt=""
                            style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        </td>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{user.name}</td>
                        <td style={{ padding: '12px 8px' }}>@{user.username}</td>
                        <td style={{ padding: '12px 8px', color: 'var(--gray-text)' }}>{user.email || '—'}</td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                            backgroundColor: user.isBlocked ? 'rgba(230, 0, 35, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                            color: user.isBlocked ? '#e60023' : '#4CAF50'
                          }}>
                            {user.isBlocked ? 'Заблокирован' : 'Активен'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 8 }}>
                            {/* Contact User */}
                            <button
                              onClick={() => onContactAuthor(user)}
                              style={{
                                padding: '6px 12px', borderRadius: 8, border: 'none',
                                backgroundColor: 'rgba(66, 133, 244, 0.1)', color: '#4285F4',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              <i className="fa-solid fa-comments" style={{ marginRight: 4 }}></i>
                              Чат
                            </button>

                            {/* Block Toggle */}
                            <button
                              onClick={() => handleBlockToggle(user)}
                              style={{
                                padding: '6px 12px', borderRadius: 8, border: 'none',
                                backgroundColor: user.isBlocked ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                color: user.isBlocked ? '#4CAF50' : '#FF9800',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              <i className={user.isBlocked ? "fa-solid fa-unlock" : "fa-solid fa-ban"} style={{ marginRight: 4 }}></i>
                              {user.isBlocked ? 'Разблокировать' : 'Блокировать'}
                            </button>

                            {/* Delete User */}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              style={{
                                padding: '6px 12px', borderRadius: 8, border: 'none',
                                backgroundColor: 'rgba(230, 0, 35, 0.1)', color: '#e60023',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer'
                              }}
                            >
                              <i className="fa-solid fa-user-xmark" style={{ marginRight: 4 }}></i>
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
