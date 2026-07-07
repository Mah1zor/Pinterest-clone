import React, { useState } from 'react';
import { commentOnPin, likePin, addPinToBoard, createBoard } from '../firebase/db';

export default function PinDetailModal({
  pin,
  currentUser,
  boards,
  onClose,
  onUpdatePin,
  onRefreshBoards
}) {
  const [commentText, setCommentText] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState(boards?.[0]?.id || '');
  const [newBoardName, setNewBoardName] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const isLiked = pin.likedBy?.includes(currentUser?.uid);
  const totalLikes = pin.likes || 0;

  const handleLikeToggle = async () => {
    try {
      const nextLikedState = !isLiked;
      await likePin(pin.id, currentUser.uid, nextLikedState);
      
      // Update local state copy of the pin
      let updatedLikedBy = [...(pin.likedBy || [])];
      if (nextLikedState) {
        updatedLikedBy.push(currentUser.uid);
      } else {
        updatedLikedBy = updatedLikedBy.filter(uid => uid !== currentUser.uid);
      }
      
      onUpdatePin({
        ...pin,
        likedBy: updatedLikedBy,
        likes: nextLikedState ? totalLikes + 1 : Math.max(0, totalLikes - 1)
      });
    } catch (err) {
      console.error("Error liking pin", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const commentData = {
        username: currentUser.username || currentUser.name,
        avatar: currentUser.avatar,
        text: commentText.trim()
      };
      
      const newComment = await commentOnPin(pin.id, commentData);
      
      // Update local state copy
      const updatedComments = [...(pin.comments || []), newComment];
      onUpdatePin({
        ...pin,
        comments: updatedComments
      });
      
      setCommentText('');
    } catch (err) {
      console.error("Error adding comment", err);
    }
  };

  const handleSaveToBoard = async () => {
    if (!selectedBoardId) return;
    setSaving(true);
    try {
      await addPinToBoard(selectedBoardId, pin.id, currentUser.uid);
      alert('Пин успешно сохранен в доску!');
    } catch (err) {
      console.error("Error saving pin to board", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const newBoard = await createBoard(newBoardName.trim(), currentUser.uid);
      if (onRefreshBoards) {
        await onRefreshBoards();
      }
      setSelectedBoardId(newBoard.id);
      setShowCreateBoard(false);
      setNewBoardName('');
    } catch (err) {
      console.error("Error creating board", err);
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', width: '900px', maxWidth: '95%', maxHeight: '90vh', backgroundColor: 'var(--white)', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
        
        {/* Close Button */}
        <button
          className="modal-close-btn"
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, left: 20, zIndex: 100,
            width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--white)',
            border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--black)'
          }}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Left Side: Media */}
        <div className="modal-media" style={{ width: '50%', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <img
            src={pin.image}
            alt={pin.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right Side: Details & Interactivity */}
        <div className="modal-info" style={{ width: '50%', padding: '32px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          
          {/* Top Bar: Saving Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
              {showCreateBoard ? (
                <form onSubmit={handleCreateBoard} style={{ display: 'flex', gap: 6, width: '100%' }}>
                  <input
                    type="text"
                    placeholder="Название доски"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--gray-border)', flex: 1, fontSize: 13 }}
                    required
                  />
                  <button type="submit" className="auth-submit-btn" style={{ padding: '6px 12px', fontSize: 12, margin: 0 }}>
                    +
                  </button>
                  <button type="button" className="nav-btn" onClick={() => setShowCreateBoard(false)} style={{ padding: '6px 12px', fontSize: 12 }}>
                    X
                  </button>
                </form>
              ) : (
                <>
                  <select
                    value={selectedBoardId}
                    onChange={(e) => setSelectedBoardId(e.target.value)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: '1px solid var(--gray-border)',
                      fontSize: 14, backgroundColor: 'var(--white)', color: 'var(--black)', flex: 1, cursor: 'pointer'
                    }}
                  >
                    {boards?.map(board => (
                      <option key={board.id} value={board.id}>{board.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateBoard(true)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, border: 'none',
                      backgroundColor: 'var(--gray-light)', cursor: 'pointer', fontSize: 13, fontWeight: 600
                    }}
                    title="Создать новую доску"
                  >
                    + Новая
                  </button>
                </>
              )}
            </div>

            <button
              onClick={handleSaveToBoard}
              disabled={saving || !selectedBoardId || showCreateBoard}
              style={{
                marginLeft: 12, padding: '10px 18px', borderRadius: 24, border: 'none',
                backgroundColor: '#e60023', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer'
              }}
            >
              {saving ? '...' : 'Сохранить'}
            </button>
          </div>

          {/* Source Link */}
          {pin.link && (
            <a
              href={pin.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14,
                color: 'var(--black)', fontWeight: 600, textDecoration: 'underline', marginBottom: 12
              }}
            >
              <span>{new URL(pin.link).hostname}</span>
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 12 }}></i>
            </a>
          )}

          {/* Title & Desc */}
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12, color: 'var(--black)' }}>
            {pin.title}
          </h1>
          <p style={{ fontSize: 15, color: 'var(--gray-text)', lineHeight: 1.5, marginBottom: 24 }}>
            {pin.description}
          </p>

          {/* Creator Profile */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img
                src={pin.creator?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={pin.creator?.name}
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--black)' }}>
                  {pin.creator?.name}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-text)' }}>
                  @{pin.creator?.username || 'user'}
                </div>
              </div>
            </div>
            
            {/* Direct Likes interaction in modal */}
            <button
              onClick={handleLikeToggle}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                borderRadius: 24, border: '1px solid var(--gray-border)',
                backgroundColor: isLiked ? '#e60023' : 'var(--white)',
                color: isLiked ? '#fff' : 'var(--black)',
                fontWeight: 600, fontSize: 14, cursor: 'pointer'
              }}
            >
              <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
              <span>{totalLikes}</span>
            </button>
          </div>

          <div className="catalog-divider" style={{ margin: '12px 0' }}></div>

          {/* Comments List */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>
              Комментарии ({pin.comments?.length || 0})
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16, maxHeight: '200px' }}>
              {!pin.comments || pin.comments.length === 0 ? (
                <p style={{ fontSize: 14, color: 'var(--gray-text)', fontStyle: 'italic' }}>
                  Нет комментариев. Будьте первыми!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {pin.comments.map((comment) => (
                    <div key={comment.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <img
                        src={comment.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                        alt={comment.username}
                        style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div style={{ backgroundColor: 'var(--gray-light)', padding: '8px 12px', borderRadius: 16, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--black)' }}>
                            {comment.username}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--gray-text)' }}>
                            {comment.date}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--black)', lineHeight: 1.4 }}>
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="auth-input"
                placeholder="Добавить комментарий..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{ borderRadius: 24, padding: '10px 16px', margin: 0 }}
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

        </div>
      </div>
    </div>
  );
}
