import React, { useState } from 'react';
import { signInUser, signUpUser, signInWithGoogle } from '../firebase/db';
import { LOCALES } from '../locales';

export default function Auth({ lang, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = LOCALES[lang] || LOCALES.ru;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Log in using email or username
        const user = await signInUser(email.trim(), password);
        onAuthSuccess(user);
      } else {
        // Register using email, username, name, password
        if (username.trim().includes('@') || username.trim().includes(' ')) {
          throw new Error('Username must not contain @ symbols or spaces.');
        }
        const user = await signUpUser(
          email.trim(),
          password,
          name.trim(),
          username.trim().toLowerCase()
        );
        onAuthSuccess(user);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await signInWithGoogle();
      onAuthSuccess(user);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay active" id="auth-overlay">
      <div className="auth-card">
        <div className="auth-logo">
          <i className="fa-brands fa-pinterest"></i>
        </div>
        <h2>{isLogin ? t.loginSubmit : t.regSubmit}</h2>
        <p className="auth-subtitle">Находите новые идеи для вдохновения</p>

        {error && (
          <div className="auth-error" style={{ display: 'block' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="auth-group">
                <label className="auth-label">{t.regName}</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="auth-group">
                <label className="auth-label">{t.regUsername}</label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="ivan_design"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="auth-group">
            <label className="auth-label">
              {isLogin ? 'Имя пользователя или Email' : 'Электронная почта (Email)'}
            </label>
            <input
              type="text"
              className="auth-input"
              placeholder={isLogin ? 'Введите email или username' : 'ivan@example.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-group">
            <label className="auth-label">{t.loginPassword}</label>
            <input
              type="password"
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Загрузка...' : isLogin ? t.loginSubmit : t.regSubmit}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', width: '100%' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-border)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', color: 'var(--gray-text)', fontWeight: 600 }}>ИЛИ</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--gray-border)' }}></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignIn} 
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            width: '100%', height: 44, borderRadius: 24, border: '1px solid var(--gray-border)',
            backgroundColor: 'var(--white)', color: 'var(--black)', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', transition: 'background-color 0.2s', margin: '0 auto 16px auto'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--gray-light)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--white)'}
        >
          <i className="fa-brands fa-google" style={{ color: '#4285F4', fontSize: 16 }}></i>
          Войти через Google
        </button>

        <div className="auth-toggle">
          <span>{isLogin ? 'Впервые на Pinterest?' : 'Уже есть аккаунт?'}</span>
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? 'Создать аккаунт' : 'Войти'}
          </button>
        </div>

        <div className="auth-hints">
          <div className="hints-title">
            <i className="fa-solid fa-circle-info"></i> Быстрый вход для тестов (без Firebase API):
          </div>
          <div className="hint-item">
            Логин: <code>creative_mind</code> / Пароль: <code>123</code>
          </div>
          <div className="hint-item">
            Логин: <code>wanderlust_travel</code> / Пароль: <code>123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
