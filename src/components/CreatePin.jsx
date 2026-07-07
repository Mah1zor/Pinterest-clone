import React, { useState } from 'react';
import { CATEGORIES } from '../../data';
import { createPin, createBoard } from '../firebase/db';

export default function CreatePin({
  currentUser,
  boards,
  onRefreshBoards,
  onNavigateHome
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('Интерьер');
  const [boardId, setBoardId] = useState(boards?.[0]?.id || '');
  const [websiteLink, setWebsiteLink] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      alert('Пожалуйста, укажите ссылку на изображение!');
      return;
    }
    setLoading(true);

    try {
      const pinData = {
        title: title.trim(),
        description: description.trim(),
        image: imageUrl.trim(),
        category,
        link: websiteLink.trim(),
        boardId: boardId // Note: we can associate with board if needed
      };

      await createPin(pinData, currentUser);
      alert('Пин успешно опубликован!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setCategory('Интерьер');
      setWebsiteLink('');

      // Navigate back to home feed
      if (onNavigateHome) onNavigateHome();
    } catch (err) {
      console.error(err);
      alert('Ошибка при создании пина: ' + err.message);
    } finally {
      setLoading(false);
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
      setBoardId(newBoard.id);
      setShowCreateBoard(false);
      setNewBoardName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUrlBlur = () => {
    let val = imageUrl.trim();
    if (!val) return;
    if (val.startsWith('//')) {
      val = 'https:' + val;
    } else if (!/^https?:\/\//i.test(val)) {
      val = 'https://' + val;
    }
    setImageUrl(val);
  };

  return (
    <div style={{ maxWidth: '850px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ backgroundColor: 'var(--white)', borderRadius: '32px', padding: '40px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 30, color: 'var(--black)' }}>Создание пина</h2>
        
        <div style={{ display: 'flex', gap: 40 }}>
          {/* Left: Image input / preview */}
          <div style={{ width: '45%' }}>
            <div style={{
              border: '2px dashed var(--gray-border)', borderRadius: '20px', height: '360px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'var(--gray-light)', cursor: 'pointer', overflow: 'hidden', padding: 10, position: 'relative'
            }}>
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Превью"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                />
              ) : (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: 40, color: 'var(--gray-text)', marginBottom: 12 }}></i>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--black)' }}>
                    Укажите прямую ссылку на изображение справа
                  </p>
                  <span style={{ fontSize: 12, color: 'var(--gray-text)', marginTop: 6, display: 'block' }}>
                    Рекомендуются файлы высокого разрешения JPG/PNG
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Form inputs */}
          <form onSubmit={handleSubmit} style={{ width: '55%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="auth-group">
              <label className="auth-label">Ссылка на изображение (URL)*</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Вставьте ссылку на картинку (например, с Unsplash)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onBlur={handleImageUrlBlur}
                style={{ margin: 0 }}
                required
              />
            </div>

            <div className="auth-group">
              <label className="auth-label">Название пина*</label>
              <input
                type="text"
                className="auth-input"
                placeholder="Добавьте заголовок"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ margin: 0 }}
                required
              />
            </div>

            <div className="auth-group">
              <label className="auth-label">Описание</label>
              <textarea
                className="auth-input"
                placeholder="Расскажите всем, о чем ваш пин"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ margin: 0, minHeight: '80px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <div className="auth-group">
              <label className="auth-label">Ссылка на сайт источника</label>
              <input
                type="url"
                className="auth-input"
                placeholder="Добавьте ссылку на сайт (опционально)"
                value={websiteLink}
                onChange={(e) => setWebsiteLink(e.target.value)}
                style={{ margin: 0 }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16 }}>
              {/* Category selector */}
              <div className="auth-group" style={{ flex: 1 }}>
                <label className="auth-label">Категория</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--gray-border)',
                    fontSize: 14, backgroundColor: 'var(--white)', color: 'var(--black)', cursor: 'pointer', outline: 'none'
                  }}
                >
                  {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Board Selector */}
              <div className="auth-group" style={{ flex: 1 }}>
                <label className="auth-label">Выберите доску</label>
                {showCreateBoard ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input
                      type="text"
                      className="auth-input"
                      placeholder="Имя доски"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      style={{ margin: 0, padding: '8px 10px', fontSize: 13 }}
                      required
                    />
                    <button type="button" onClick={handleCreateBoard} className="auth-submit-btn" style={{ padding: '8px 10px', margin: 0, fontSize: 12 }}>
                      +
                    </button>
                    <button type="button" onClick={() => setShowCreateBoard(false)} className="nav-btn" style={{ padding: '8px 10px', fontSize: 12 }}>
                      X
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <select
                      value={boardId}
                      onChange={(e) => setBoardId(e.target.value)}
                      style={{
                        flex: 1, padding: '10px 14px', borderRadius: 12, border: '1px solid var(--gray-border)',
                        fontSize: 14, backgroundColor: 'var(--white)', color: 'var(--black)', cursor: 'pointer', outline: 'none'
                      }}
                    >
                      {boards?.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowCreateBoard(true)}
                      style={{
                        padding: '10px 12px', borderRadius: 12, border: 'none',
                        backgroundColor: 'var(--gray-light)', cursor: 'pointer', fontSize: 13, fontWeight: 600
                      }}
                      title="Создать новую доску"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading || showCreateBoard}
              style={{ marginTop: 10, width: '100%', height: 48, borderRadius: 24, fontSize: 15 }}
            >
              {loading ? 'Публикация...' : 'Опубликовать'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
