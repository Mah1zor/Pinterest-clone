import React, { useState, useEffect } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState({ x: 0, y: 0 });
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = (e) => {
      setClicked(true);
      
      // Spawn cartoon star/sparkle particles
      const newParticles = Array.from({ length: 8 }).map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const speed = 2 + Math.random() * 4;
        return {
          id: Date.now() + i + Math.random(),
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 8 + Math.random() * 8,
          color: ['#ff3b30', '#ffcc00', '#4cd964', '#5ac8fa', '#5856d6', '#ff2d55'][Math.floor(Math.random() * 6)]
        };
      });
      setParticles((prev) => [...prev, ...newParticles]);
    };

    const handleMouseUp = () => {
      setClicked(false);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isClickable =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'SELECT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('[role="button"]') ||
        target.closest('.pin-card') ||
        target.closest('.catalog-item') ||
        target.closest('.nav-btn') ||
        target.closest('.sort-tab');
      
      setHovered(!!isClickable);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  // Smooth trail effect
  useEffect(() => {
    let animFrame;
    const updateTrail = () => {
      setTrail((prev) => {
        const dx = position.x - prev.x;
        const dy = position.y - prev.y;
        return {
          x: prev.x + dx * 0.25,
          y: prev.y + dy * 0.25
        };
      });
      animFrame = requestAnimationFrame(updateTrail);
    };
    animFrame = requestAnimationFrame(updateTrail);
    return () => cancelAnimationFrame(animFrame);
  }, [position]);

  // Update particles position
  useEffect(() => {
    if (particles.length === 0) return;
    let animFrame;
    const updateParticles = () => {
      setParticles((prev) =>
        prev
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.15, // gravity
            size: p.size * 0.90 // shrink
          }))
          .filter((p) => p.size > 0.8)
      );
      animFrame = requestAnimationFrame(updateParticles);
    };
    animFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animFrame);
  }, [particles]);

  const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  if (isTouchDevice) return null;

  return (
    <>
      {/* Sparkle Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'fixed',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            border: '2px solid #000',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'translate(-50%, -50%)',
            boxShadow: '1px 2px 0 #000'
          }}
        />
      ))}

      {/* Outer trailing cursor */}
      <div
        className="custom-cursor-trail"
        style={{
          left: trail.x,
          top: trail.y
        }}
      />

      {/* Main cursor */}
      <div
        className={`custom-cursor ${hovered ? 'hovered' : ''} ${clicked ? 'clicked' : ''}`}
        style={{
          left: position.x,
          top: position.y
        }}
      />
    </>
  );
}
