import React, { useState, useEffect, useRef } from 'react';
import { getOrCreateChat, subscribeToChat, sendMessage, fetchUserProfile } from '../firebase/db';
import { MOCK_USERS } from '../../data';
import { isConfigured } from '../firebase/config';
import { collection, getDocs, doc, getDoc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

const ADMIN_INFO = {
  uid: 'admin-pinterest-uid',
  username: 'admin',
  name: 'Администратор',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Панель администратора Pinterest',
  isAdmin: true
};

export default function Chat({ currentUser, initialActiveFriend }) {
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  const [chatId, setChatId] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('chats'); // 'chats' or 'friends'
  const [activeChats, setActiveChats] = useState([]);

  // Auto-select friend when redirected from Admin Panel
  useEffect(() => {
    if (initialActiveFriend) {
      setFriends(prev => {
        const exists = prev.some(f => f.uid === initialActiveFriend.uid);
        if (!exists) {
          return [initialActiveFriend, ...prev];
        }
        return prev;
      });
      setActiveFriend(initialActiveFriend);
      setSidebarTab('chats');
    }
  }, [initialActiveFriend]);

  // Load active chats dynamically from messages database
  useEffect(() => {
    if (!isConfigured) {
      return;
    }
    
    const q = query(collection(db, 'chats'), where('participants', 'array-contains', currentUser.uid));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatUsers = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.messages && data.messages.length > 0) {
          const otherUid = data.participants.find(uid => uid !== currentUser.uid);
          if (otherUid) {
            try {
              let uProfile;
              if (otherUid === 'admin-pinterest-uid') {
                const adminDoc = await getDoc(doc(db, 'users', 'admin-pinterest-uid'));
                uProfile = adminDoc.exists() ? adminDoc.data() : ADMIN_INFO;
              } else {
                uProfile = await fetchUserProfile(otherUid);
              }
              if (uProfile) {
                chatUsers.push({ ...uProfile, chatId: docSnap.id });
              }
            } catch (e) {
              console.error("Error loading chat participant", e);
            }
          }
        }
      }
      setActiveChats(chatUsers);
    });
    
    return () => unsubscribe();
  }, [currentUser, friends]);

  const messagesEndRef = useRef(null);



  // Load friends/users list
  useEffect(() => {
    async function loadUsers() {
      let adminInfo = { ...ADMIN_INFO };
      
      if (isConfigured) {
        try {
          const adminDoc = await getDoc(doc(db, 'users', 'admin-pinterest-uid'));
          if (adminDoc.exists()) {
            adminInfo = adminDoc.data();
          }
        } catch (e) {
          console.error("Error fetching admin info from Firestore:", e);
        }
      }
      
      setResolvedAdminInfo(adminInfo);

      if (!isConfigured) {
        // Fallback: list other mock users
        const others = MOCK_USERS.filter(u => u.username !== currentUser.username);
        const mappedOthers = others.map(u => ({
          uid: u.uid || 'mock-' + u.username,
          username: u.username,
          name: u.name,
          avatar: u.avatar,
          bio: u.bio
        }));
        
        if (currentUser.username !== 'admin') {
          // Prepend admin to the list of friends for normal users
          setFriends([adminInfo, ...mappedOthers]);
        } else {
          setFriends(mappedOthers);
        }
        return;
      }

      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const list = [];
        usersSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.uid !== currentUser.uid && data.username !== 'admin' && doc.id !== 'admin-pinterest-uid') {
            list.push(data);
          }
        });
        
        if (currentUser.username !== 'admin') {
          setFriends([adminInfo, ...list]);
        } else {
          setFriends(list);
        }
      } catch (err) {
        console.error("Error loading users for chat", err);
      }
    }
    loadUsers();
  }, [currentUser]);

  // Subscribe to messages when activeFriend changes
  useEffect(() => {
    if (!activeFriend) {
      setMessages([]);
      setChatId(null);
      return;
    }

    let unsubscribe = () => {};

    async function initChat() {
      try {
        const cId = await getOrCreateChat(currentUser.uid, activeFriend.uid);
        setChatId(cId);

        unsubscribe = subscribeToChat(cId, (msgs) => {
          setMessages(msgs || []);
        });
      } catch (err) {
        console.error("Error initializing chat", err);
      }
    }

    initChat();
    return () => unsubscribe();
  }, [activeFriend, currentUser]);

  // Scroll to bottom of message log when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !chatId) return;

    try {
      await sendMessage(chatId, currentUser.uid, inputText.trim());
      setInputText('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchFriend.trim()) return;

    const queryUsername = searchFriend.trim().toLowerCase().replace('@', '');
    
    // Check if they are already in the list
    const existing = friends.find(f => f.username === queryUsername);
    if (existing) {
      setActiveFriend(existing);
      setSearchFriend('');
      return;
    }

    if (queryUsername === 'admin') {
      if (currentUser.username === 'admin') {
        alert("Вы не можете добавить себя в друзья.");
      } else {
        setFriends(prev => {
          const exists = prev.some(f => f.uid === resolvedAdminInfo.uid);
          if (!exists) return [resolvedAdminInfo, ...prev];
          return prev;
        });
        setActiveFriend(resolvedAdminInfo);
        setSearchFriend('');
      }
      return;
    }

    try {
      if (!isConfigured) {
        const found = MOCK_USERS.find(u => u.username.toLowerCase() === queryUsername);
        if (found) {
          const formatted = {
            uid: found.uid || 'mock-' + found.username,
            username: found.username,
            name: found.name,
            avatar: found.avatar,
            bio: found.bio
          };
          setFriends(prev => {
            const exists = prev.some(f => f.uid === formatted.uid);
            if (!exists) return [formatted, ...prev];
            return prev;
          });
          setActiveFriend(formatted);
          setSearchFriend('');
        } else {
          alert("Пользователь с таким именем не найден.");
        }
        return;
      }

      // Query database for this username
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'users'), where('username', '==', queryUsername));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        alert("Пользователь с таким именем не найден.");
        return;
      }
      
      const foundUser = querySnapshot.docs[0].data();
      setFriends(prev => {
        const exists = prev.some(f => f.uid === foundUser.uid);
        if (!exists) return [foundUser, ...prev];
        return prev;
      });
      setActiveFriend(foundUser);
      setSearchFriend('');
    } catch (err) {
      console.error(err);
      alert("Ошибка при поиске пользователя");
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '0 16px', height: 'calc(100vh - 140px)' }}>
      <div style={{
        display: 'flex', backgroundColor: 'var(--white)', borderRadius: '24px',
        border: '1px solid var(--gray-border)', overflow: 'hidden', height: '100%'
      }}>
        
        {/* Left Side: Friends Panel */}
        <div className="chat-sidebar" style={{ display: 'flex', flexDirection: 'column', width: 280, borderRight: '1px solid var(--gray-border)', padding: 16 }}>
          {/* Tabs header */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-border)', marginBottom: 12 }}>
            <button
              onClick={() => setSidebarTab('chats')}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                color: sidebarTab === 'chats' ? '#e60023' : 'var(--gray-text)',
                borderBottom: sidebarTab === 'chats' ? '2px solid #e60023' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Диалоги
            </button>
            <button
              onClick={() => setSidebarTab('friends')}
              style={{
                flex: 1, padding: '10px 0', border: 'none', background: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                color: sidebarTab === 'friends' ? '#e60023' : 'var(--gray-text)',
                borderBottom: sidebarTab === 'friends' ? '2px solid #e60023' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              Друзья ({isConfigured ? friends.length : MOCK_USERS.length - 1})
            </button>
          </div>

          {/* Add Friend form (only visible on Friends tab) */}
          {sidebarTab === 'friends' && (
            <form onSubmit={handleAddFriend} className="add-friend-box" style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Поиск по @username..."
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-border)',
                  fontSize: 13, backgroundColor: 'var(--white)', color: 'var(--black)', outline: 'none'
                }}
              />
              <button type="submit" className="auth-submit-btn" style={{ padding: '8px 12px', fontSize: 13, margin: 0 }}>
                +
              </button>
            </form>
          )}

          <div className="friends-list" style={{ flexGrow: 1, overflowY: 'auto' }}>
            {sidebarTab === 'chats' ? (
              /* Dialogs Tab List */
              (!isConfigured ? friends : activeChats).length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--gray-text)', textAlign: 'center', marginTop: 20 }}>
                  Нет активных диалогов.<br/>Напишите другу во вкладке «Друзья»!
                </p>
              ) : (
                (!isConfigured ? friends : activeChats).map(friend => (
                  <div
                    key={friend.uid}
                    className={`friend-item ${activeFriend?.uid === friend.uid ? 'active' : ''}`}
                    onClick={() => setActiveFriend(friend)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      borderRadius: 12, cursor: 'pointer', marginBottom: 4,
                      backgroundColor: activeFriend?.uid === friend.uid ? 'var(--gray-hover)' : 'transparent'
                    }}
                  >
                    <img
                      src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={friend.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {friend.name}
                        {friend.isAdmin && (
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, backgroundColor: '#e60023', color: '#fff', fontWeight: 600 }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-text)' }}>
                        @{friend.username}
                      </div>
                    </div>
                  </div>
                ))
              )
            ) : (
              /* Friends (All registered users) Tab List */
              friends.length === 0 ? (
                <p style={{ fontSize: 12, color: 'var(--gray-text)', textAlign: 'center', marginTop: 20 }}>
                  Список пользователей пуст
                </p>
              ) : (
                friends.map(friend => (
                  <div
                    key={friend.uid}
                    className={`friend-item ${activeFriend?.uid === friend.uid ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFriend(friend);
                      setSidebarTab('chats'); // Switch to dialogs view
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                      borderRadius: 12, cursor: 'pointer', marginBottom: 4,
                      backgroundColor: activeFriend?.uid === friend.uid ? 'var(--gray-hover)' : 'transparent'
                    }}
                  >
                    <img
                      src={friend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={friend.name}
                      style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {friend.name}
                        {friend.isAdmin && (
                          <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, backgroundColor: '#e60023', color: '#fff', fontWeight: 600 }}>
                            Admin
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--gray-text)' }}>
                        @{friend.username}
                      </div>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right Side: Conversation Log */}
        <div className="chat-window" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {activeFriend ? (
            <div className="chat-active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* Active Conversation Header */}
              <div className="chat-active-header" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--gray-border)', gap: 12 }}>
                <img
                  src={activeFriend.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={activeFriend.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="chat-active-meta">
                  <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--black)' }}>{activeFriend.name}</h4>
                  <span style={{ fontSize: 11, color: 'var(--gray-text)' }}>@{activeFriend.username}</span>
                </div>
              </div>

              {/* Message History */}
              <div className="chat-messages-log" style={{ flexGrow: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--gray-text)' }}>
                    <i className="fa-regular fa-comment-dots" style={{ fontSize: 32, marginBottom: 8 }}></i>
                    <p style={{ fontSize: 13 }}>Отправьте сообщение, чтобы начать диалог</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.sender === currentUser.uid;
                    return (
                      <div key={index} className={`chat-msg-row ${isMe ? 'sent' : 'received'}`} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                        <div className="chat-msg-bubble" style={{
                          maxWidth: '70%', padding: '10px 16px', borderRadius: 18, fontSize: 14, lineHeight: 1.4,
                          backgroundColor: isMe ? '#e60023' : 'var(--gray-light)',
                          color: isMe ? '#fff' : 'var(--black)',
                          borderBottomRightRadius: isMe ? 4 : 18,
                          borderBottomLeftRadius: isMe ? 18 : 4
                        }}>
                          <div>{msg.text}</div>
                          <span style={{
                            display: 'block', fontSize: 9, marginTop: 4, textAlign: 'right',
                            color: isMe ? 'rgba(255, 255, 255, 0.7)' : 'var(--gray-text)'
                          }}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Panel */}
              <form onSubmit={handleSendMessage} className="chat-input-panel" style={{ padding: 16, borderTop: '1px solid var(--gray-border)', display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  placeholder="Напишите сообщение..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 24,
                    border: '1px solid var(--gray-border)', outline: 'none',
                    backgroundColor: 'var(--white)', color: 'var(--black)'
                  }}
                  required
                />
                <button
                  type="submit"
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: 'none',
                    backgroundColor: '#e60023', color: '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
                  }}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>

            </div>
          ) : (
            <div className="chat-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: 40, textAlign: 'center' }}>
              <i className="fa-solid fa-comments" style={{ fontSize: 48, color: '#ccc', marginBottom: 16 }}></i>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--black)' }}>Ваши сообщения</h3>
              <p style={{ fontSize: 14, color: 'var(--gray-text)', maxWidth: 360, marginTop: 6 }}>
                Выберите друга в левой колонке или найдите его по @username, чтобы начать общение.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
