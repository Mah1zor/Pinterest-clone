import { auth, db, isConfigured } from './config';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  limit,
  orderBy,
  deleteDoc
} from 'firebase/firestore';

// --- MOCK FALLBACK DATA (Used ONLY if Firebase keys are not provided) ---
import { INITIAL_PINS, INITIAL_BOARDS, INITIAL_CHATS, CURRENT_USER, MOCK_USERS } from '../../data.js';

// --- AUTH FUNCTIONS ---

export const signUpUser = async (email, password, name, username) => {
  if (!isConfigured) {
    // Mock Signup
    const lowerUsername = username.toLowerCase();
    const newUser = {
      uid: 'mock-' + Date.now(),
      email,
      name,
      username: lowerUsername,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?w=150&auto=format&fit=crop&q=80`,
      bio: 'Новый вдохновленный пиннер!',
      followersCount: 0,
      followingCount: 0,
      savedPins: [],
      createdPins: [],
      friends: [],
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('pinterest_mock_user', JSON.stringify(newUser));
    return newUser;
  }

  // Real Firebase Auth Signup
  const lowerUsername = username.toLowerCase().trim();
  
  // 1. Check unique username in Firestore
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', lowerUsername));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    throw new Error('This username is already taken.');
  }

  // 2. Create Auth User
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 3. Update Auth Profile
  await updateProfile(user, {
    displayName: name,
    photoURL: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
  });

  // 4. Create Firestore Document
  const userProfile = {
    uid: user.uid,
    email: user.email,
    name: name,
    username: lowerUsername,
    avatar: user.photoURL,
    bio: '',
    followersCount: 0,
    followingCount: 0,
    savedPins: [],
    createdPins: [],
    friends: [],
    createdAt: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', user.uid), userProfile);
  return userProfile;
};

export const signInUser = async (emailOrUsername, password) => {
  // --- Admin credentials override ---
  if (emailOrUsername.trim().toLowerCase() === 'admin') {
    if (password.toLowerCase() === 'и нет друзей на закате') {
      const existingMock = localStorage.getItem('pinterest_mock_user');
      let adminUser;
      if (existingMock) {
        try {
          const parsed = JSON.parse(existingMock);
          if (parsed && parsed.uid === 'admin-pinterest-uid') {
            adminUser = parsed;
          }
        } catch (e) {
          console.error("Error parsing admin profile", e);
        }
      }
      if (!adminUser) {
        adminUser = {
          uid: 'admin-pinterest-uid',
          email: 'admin@pinterest.com',
          name: 'Администратор',
          username: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Панель администратора Pinterest',
          followersCount: 0,
          followingCount: 0,
          savedPins: [],
          createdPins: [],
          friends: [],
          isAdmin: true
        };
      }
      localStorage.setItem('pinterest_mock_user', JSON.stringify(adminUser));
      return adminUser;
    } else {
      throw new Error('Ты не один из наших');
    }
  }

  if (!isConfigured) {
    // Mock Signin (only allows registered local mock accounts)
    const mockUser = JSON.parse(localStorage.getItem('pinterest_mock_user'));
    if (mockUser && mockUser.username === emailOrUsername && (password === '123' || mockUser.password === password)) {
      return mockUser;
    }
    throw new Error('Неверное имя пользователя или пароль.');
  }

  // Real Firebase Signin
  let targetEmail = emailOrUsername.trim();
  
  // If the user entered a username instead of an email, search in Firestore
  if (!targetEmail.includes('@')) {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', targetEmail.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Пользователь с таким именем не найден.');
    }
    
    // Resolve username to registered email
    targetEmail = querySnapshot.docs[0].data().email;
  }

  const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
  const user = userCredential.user;
  return await fetchUserProfile(user.uid);
};

export const signInWithGoogle = async () => {
  if (!isConfigured) {
    // Mock Google Sign-in
    const mockUser = {
      uid: 'mock-google-' + Date.now(),
      email: 'google_user@example.com',
      name: 'Google User',
      username: 'google_user',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Я вошел через Google!',
      followersCount: 0,
      followingCount: 0,
      savedPins: [],
      createdPins: [],
      friends: []
    };
    localStorage.setItem('pinterest_mock_user', JSON.stringify(mockUser));
    return mockUser;
  }

  // Real Firebase Google Sign-in
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check if profile document exists in Firestore
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    // Generate a unique username based on the email prefix
    let baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!baseUsername) baseUsername = 'user';
    
    // Check uniqueness
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', baseUsername));
    const querySnapshot = await getDocs(q);
    
    let finalUsername = baseUsername;
    if (!querySnapshot.empty) {
      // Append random number to make it unique
      finalUsername = baseUsername + Math.floor(Math.random() * 10000);
    }

    const newUserProfile = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || 'Google User',
      username: finalUsername,
      avatar: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: '',
      followersCount: 0,
      followingCount: 0,
      savedPins: [],
      createdPins: [],
      friends: [],
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, newUserProfile);
    return newUserProfile;
  }
};

export const logoutUser = async () => {
  localStorage.removeItem('pinterest_mock_user');
  if (!isConfigured) {
    return;
  }
  await signOut(auth);
};

export const subscribeToAuth = (callback) => {
  if (!isConfigured) {
    // Handle mock auth change check
    const check = () => {
      const mockUser = localStorage.getItem('pinterest_mock_user');
      callback(mockUser ? JSON.parse(mockUser) : null);
    };
    check();
    window.addEventListener('storage', check);
    return () => window.removeEventListener('storage', check);
  }

  // --- Real Firebase Auth with Admin local session support ---
  // If there is an active local admin session, return it immediately to prevent logout
  const mockUserStr = localStorage.getItem('pinterest_mock_user');
  if (mockUserStr) {
    try {
      const mockUser = JSON.parse(mockUserStr);
      if (mockUser && mockUser.uid === 'admin-pinterest-uid') {
        callback(mockUser);
        return () => {}; // Dummy unsubscribe
      }
    } catch (e) {
      console.error("Error reading admin local session", e);
    }
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const profile = await fetchUserProfile(firebaseUser.uid);
        callback(profile);
      } catch (err) {
        console.error("Error fetching profile, logging out:", err);
        await logoutUser();
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};

// --- USER PROFILE FUNCTIONS ---

export const fetchUserProfile = async (uid) => {
  if (!isConfigured) {
    const mockUser = JSON.parse(localStorage.getItem('pinterest_mock_user'));
    if (mockUser && mockUser.uid === uid) {
      if (localStorage.getItem(`pinterest_mock_blocked_${uid}`) === 'true') {
        throw new Error('Ваш аккаунт заблокирован администратором.');
      }
      return mockUser;
    }
    return {
      uid: 'mock-creative_mind',
      name: CURRENT_USER.name,
      username: CURRENT_USER.username,
      avatar: CURRENT_USER.avatar,
      bio: CURRENT_USER.bio,
      followersCount: CURRENT_USER.followersCount,
      followingCount: CURRENT_USER.followingCount,
      savedPins: CURRENT_USER.savedPins,
      createdPins: CURRENT_USER.createdPins,
      friends: CURRENT_USER.friends
    };
  }

  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.isBlocked) {
      throw new Error('Ваш аккаунт заблокирован администратором.');
    }
    return data;
  } else {
    throw new Error("Ваш аккаунт удален администратором.");
  }
};

export const fetchUsersList = async () => {
  if (!isConfigured) {
    return MOCK_USERS.map(u => {
      const uid = u.uid || 'mock-' + u.username;
      const isBlocked = localStorage.getItem(`pinterest_mock_blocked_${uid}`) === 'true';
      return {
        uid,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        isBlocked
      };
    });
  }

  const querySnapshot = await getDocs(collection(db, 'users'));
  const list = [];
  querySnapshot.forEach((doc) => {
    list.push(doc.data());
  });
  return list;
};

export const blockUser = async (uid, isBlocked) => {
  if (!isConfigured) {
    localStorage.setItem(`pinterest_mock_blocked_${uid}`, isBlocked ? 'true' : 'false');
    return;
  }
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { isBlocked });
};

export const deleteUser = async (uid) => {
  if (!isConfigured) {
    return;
  }

  // 1. Delete user Firestore document
  await deleteDoc(doc(db, 'users', uid));

  // 2. Delete all pins created by this user
  const pinsRef = collection(db, 'pins');
  const q = query(pinsRef, where('creator.uid', '==', uid));
  const querySnapshot = await getDocs(q);
  
  for (const pinDoc of querySnapshot.docs) {
    await deleteDoc(doc(db, 'pins', pinDoc.id));
  }
};

export const updateUserProfile = async (uid, data) => {
  if (!isConfigured || uid === 'admin-pinterest-uid') {
    const current = JSON.parse(localStorage.getItem('pinterest_mock_user')) || CURRENT_USER;
    const updated = { ...current, ...data };
    localStorage.setItem('pinterest_mock_user', JSON.stringify(updated));
    return updated;
  }

  // Check username uniqueness if they are changing it
  if (data.username) {
    const lowerUsername = data.username.toLowerCase().trim();
    const currentProfile = await fetchUserProfile(uid);
    if (currentProfile && currentProfile.username !== lowerUsername) {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', lowerUsername));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        throw new Error('Этот никнейм уже занят другим пользователем.');
      }
    }
  }

  const docRef = doc(db, 'users', uid);
  await updateDoc(docRef, data);
  if (data.avatar && auth.currentUser) {
    await updateProfile(auth.currentUser, { photoURL: data.avatar });
  }
  if (data.name && auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: data.name });
  }
  return await fetchUserProfile(uid);
};

// --- PINS FUNCTIONS ---

export const fetchPins = async (category = 'all', searchQuery = '') => {
  if (!isConfigured) {
    // Mock local filter
    let pins = [...INITIAL_PINS];
    if (category && category !== 'all') {
      const catMapping = {
        'interior': 'Интерьер',
        'travel': 'Путешествия',
        'nature': 'Природа',
        'architecture': 'Архитектура',
        'food': 'Еда',
        'art': 'Арт'
      };
      const RussianCatName = catMapping[category] || category;
      pins = pins.filter(p => p.category === RussianCatName);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      pins = pins.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    return pins;
  }

  // Real Firebase Pins fetch
  const pinsRef = collection(db, 'pins');
  let q = query(pinsRef, orderBy('date', 'desc'));
  
  if (category && category !== 'all') {
    const catMapping = {
      'interior': 'Интерьер',
      'travel': 'Путешествия',
      'nature': 'Природа',
      'architecture': 'Архитектура',
      'food': 'Еда',
      'art': 'Арт'
    };
    const RussianCatName = catMapping[category] || category;
    q = query(pinsRef, where('category', '==', RussianCatName), orderBy('date', 'desc'));
  }

  const querySnapshot = await getDocs(q);
  let pins = [];
  querySnapshot.forEach((doc) => {
    pins.push({ id: doc.id, ...doc.data() });
  });

  // Perform search query filtering client-side for simple Firebase search
  if (searchQuery) {
    const s = searchQuery.toLowerCase();
    pins = pins.filter(p => 
      p.title.toLowerCase().includes(s) || 
      p.description.toLowerCase().includes(s) || 
      (p.category && p.category.toLowerCase().includes(s))
    );
  }

  return pins;
};

export const createPin = async (pinData, creatorProfile) => {
  const pin = {
    title: pinData.title,
    description: pinData.description,
    image: pinData.image,
    category: pinData.category,
    creator: {
      uid: creatorProfile.uid,
      username: creatorProfile.username,
      name: creatorProfile.name,
      avatar: creatorProfile.avatar
    },
    likes: 0,
    likedBy: [],
    link: pinData.link || '',
    date: new Date().toISOString().split('T')[0],
    comments: []
  };

  if (!isConfigured) {
    const mockId = 'pin-' + Date.now();
    const newPin = { id: mockId, ...pin };
    INITIAL_PINS.unshift(newPin);
    
    // Add to current user's created pins
    const curUser = JSON.parse(localStorage.getItem('pinterest_mock_user'));
    if (curUser) {
      curUser.createdPins = curUser.createdPins || [];
      curUser.createdPins.push(mockId);
      localStorage.setItem('pinterest_mock_user', JSON.stringify(curUser));
    }
    return newPin;
  }

  // Save to Firestore
  const docRef = await addDoc(collection(db, 'pins'), pin);
  
  // Update creator's createdPins list in Firestore
  const userRef = doc(db, 'users', creatorProfile.uid);
  await updateDoc(userRef, {
    createdPins: arrayUnion(docRef.id)
  });

  return { id: docRef.id, ...pin };
};

export const deletePin = async (pinId, creatorUid) => {
  if (!isConfigured) {
    // Delete from INITIAL_PINS
    const index = INITIAL_PINS.findIndex(p => p.id === pinId);
    if (index !== -1) {
      INITIAL_PINS.splice(index, 1);
    }
    return;
  }

  // Delete document from Firestore pins collection
  const pinRef = doc(db, 'pins', pinId);
  await deleteDoc(pinRef);

  // Remove pin from creator's lists (if creatorUid is provided)
  if (creatorUid) {
    const userRef = doc(db, 'users', creatorUid);
    await updateDoc(userRef, {
      createdPins: arrayRemove(pinId),
      savedPins: arrayRemove(pinId)
    });
  }
};

export const likePin = async (pinId, userId, isLiked) => {
  if (!isConfigured) {
    const pin = INITIAL_PINS.find(p => p.id === pinId);
    if (pin) {
      pin.likedBy = pin.likedBy || [];
      if (isLiked) {
        if (!pin.likedBy.includes(userId)) pin.likedBy.push(userId);
      } else {
        pin.likedBy = pin.likedBy.filter(id => id !== userId);
      }
      pin.likes = pin.likedBy.length;
      
      // Update locally liked pins of the user
      const curUser = JSON.parse(localStorage.getItem('pinterest_mock_user'));
      if (curUser) {
        curUser.likedPins = curUser.likedPins || [];
        if (isLiked) {
          if (!curUser.likedPins.includes(pinId)) curUser.likedPins.push(pinId);
        } else {
          curUser.likedPins = curUser.likedPins.filter(id => id !== pinId);
        }
        localStorage.setItem('pinterest_mock_user', JSON.stringify(curUser));
      }
    }
    return pin;
  }

  const pinRef = doc(db, 'pins', pinId);
  if (isLiked) {
    await updateDoc(pinRef, {
      likedBy: arrayUnion(userId),
      likes: increment(1)
    });
  } else {
    await updateDoc(pinRef, {
      likedBy: arrayRemove(userId),
      likes: increment(-1)
    });
  }

  // Update in user document as well
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    likedPins: isLiked ? arrayUnion(pinId) : arrayRemove(pinId)
  });
};

export const commentOnPin = async (pinId, commentData) => {
  const newComment = {
    id: 'comment-' + Date.now(),
    username: commentData.username,
    avatar: commentData.avatar,
    text: commentData.text,
    date: new Date().toLocaleDateString('ru-RU', { year: 'numeric', month: 'numeric', day: 'numeric' })
  };

  if (!isConfigured) {
    const pin = INITIAL_PINS.find(p => p.id === pinId);
    if (pin) {
      pin.comments = pin.comments || [];
      pin.comments.push(newComment);
    }
    return newComment;
  }

  const pinRef = doc(db, 'pins', pinId);
  await updateDoc(pinRef, {
    comments: arrayUnion(newComment)
  });

  return newComment;
};

// --- BOARDS FUNCTIONS ---

export const fetchBoards = async (userId) => {
  if (!isConfigured) {
    const userBoards = JSON.parse(localStorage.getItem(`pinterest_boards_${userId}`)) || INITIAL_BOARDS;
    return userBoards;
  }

  const q = query(collection(db, 'boards'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  const boards = [];
  querySnapshot.forEach((doc) => {
    boards.push({ id: doc.id, ...doc.data() });
  });

  if (boards.length === 0) {
    // Create default board for user
    const defaultBoard = await createBoard('Вдохновение', userId);
    return [defaultBoard];
  }

  return boards;
};

export const createBoard = async (name, userId) => {
  const board = {
    name,
    userId,
    pinIds: [],
    createdAt: new Date().toISOString()
  };

  if (!isConfigured) {
    const boardId = 'board-' + Date.now();
    const newBoard = { id: boardId, ...board };
    const curBoards = JSON.parse(localStorage.getItem(`pinterest_boards_${userId}`)) || [...INITIAL_BOARDS];
    curBoards.push(newBoard);
    localStorage.setItem(`pinterest_boards_${userId}`, JSON.stringify(curBoards));
    return newBoard;
  }

  const docRef = await addDoc(collection(db, 'boards'), board);
  return { id: docRef.id, ...board };
};

export const addPinToBoard = async (boardId, pinId, userId) => {
  if (!isConfigured) {
    const curBoards = JSON.parse(localStorage.getItem(`pinterest_boards_${userId}`)) || [...INITIAL_BOARDS];
    const board = curBoards.find(b => b.id === boardId);
    if (board) {
      board.pinIds = board.pinIds || [];
      if (!board.pinIds.includes(pinId)) {
        board.pinIds.push(pinId);
      }
      localStorage.setItem(`pinterest_boards_${userId}`, JSON.stringify(curBoards));
    }

    // Add to user saved pins list
    const curUser = JSON.parse(localStorage.getItem('pinterest_mock_user'));
    if (curUser) {
      curUser.savedPins = curUser.savedPins || [];
      if (!curUser.savedPins.includes(pinId)) {
        curUser.savedPins.push(pinId);
        localStorage.setItem('pinterest_mock_user', JSON.stringify(curUser));
      }
    }
    return;
  }

  const boardRef = doc(db, 'boards', boardId);
  await updateDoc(boardRef, {
    pinIds: arrayUnion(pinId)
  });

  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    savedPins: arrayUnion(pinId)
  });
};

// --- CHATS FUNCTIONS ---

export const getOrCreateChat = async (userId1, userId2) => {
  if (!isConfigured) {
    const chatId = [userId1, userId2].sort().join('_');
    return chatId;
  }

  const chatsRef = collection(db, 'chats');
  const q = query(chatsRef, where('participants', 'array-contains', userId1));
  const querySnapshot = await getDocs(q);

  let existingChat = null;
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.participants.includes(userId2)) {
      existingChat = { id: doc.id, ...data };
    }
  });

  if (existingChat) {
    return existingChat.id;
  }

  const newChat = {
    participants: [userId1, userId2].sort(),
    messages: [],
    lastUpdated: new Date().toISOString()
  };

  const docRef = await addDoc(chatsRef, newChat);
  return docRef.id;
};

export const subscribeToChat = (chatId, callback) => {
  if (!isConfigured) {
    // Mock local updates using polling or interval
    const check = () => {
      const chats = JSON.parse(localStorage.getItem('pinterest_chats')) || INITIAL_CHATS;
      const msgs = chats[chatId] || [];
      callback(msgs);
    };
    check();
    const interval = setInterval(check, 1000);
    return () => clearInterval(interval);
  }

  const chatRef = doc(db, 'chats', chatId);
  return onSnapshot(chatRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().messages || []);
    } else {
      callback([]);
    }
  });
};

export const sendMessage = async (chatId, senderId, text) => {
  const msg = {
    sender: senderId,
    text,
    timestamp: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  };

  if (!isConfigured) {
    const chats = JSON.parse(localStorage.getItem('pinterest_chats')) || INITIAL_CHATS;
    chats[chatId] = chats[chatId] || [];
    chats[chatId].push(msg);
    localStorage.setItem('pinterest_chats', JSON.stringify(chats));
    return msg;
  }

  const chatRef = doc(db, 'chats', chatId);
  await updateDoc(chatRef, {
    messages: arrayUnion(msg),
    lastUpdated: new Date().toISOString()
  });
  return msg;
};

export const toggleFriend = async (currentUserUid, friendUid, isFriend) => {
  if (!isConfigured) {
    const curUser = JSON.parse(localStorage.getItem('pinterest_mock_user')) || { uid: currentUserUid, friends: [] };
    curUser.friends = curUser.friends || [];
    if (isFriend) {
      if (!curUser.friends.includes(friendUid)) curUser.friends.push(friendUid);
    } else {
      curUser.friends = curUser.friends.filter(uid => uid !== friendUid);
    }
    localStorage.setItem('pinterest_mock_user', JSON.stringify(curUser));
    return curUser;
  }

  const userRef = doc(db, 'users', currentUserUid);
  await updateDoc(userRef, {
    friends: isFriend ? arrayUnion(friendUid) : arrayRemove(friendUid)
  });
  return await fetchUserProfile(currentUserUid);
};
