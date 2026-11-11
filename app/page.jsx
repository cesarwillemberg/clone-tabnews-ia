'use client';

import { useEffect, useRef, useState } from 'react';

const FLOATERS = Array.from({ length: 18 }, (_, index) => ({
  emoji: ['❤️', '💖', '💕', '💗', '💓', '💘', '💞', '💝', '🥰'][index % 9],
  style: {
    left: `${(index * 37) % 100}%`,
    fontSize: `${16 + ((index * 7) % 19)}px`,
    animationDuration: `${12 + ((index * 5) % 13)}s`,
    animationDelay: `${-((index * 3) % 22)}s`,
    '--drift': `${index % 2 ? 1 : -1}${20 + ((index * 11) % 31)}px`,
    '--o': (0.28 + (index % 5) * 0.08).toFixed(2),
  },
}));

const CONFETTI_COLORS = [
  '#ff4d6d', '#ff85a8', '#f43f72', '#e11d48', '#be123c',
  '#ffb3c9', '#ffe3ec', '#ffd60a', '#ffffff', '#9b5de5',
];
const CONFETTI_EMOJIS = ['💖', '💕', '💗', '💞', '💘', '💝', '✨', '😍'];
const FIREWORK_HUES = [335, 350, 320, 285, 45, 195, 265];
const EMOJI_FONT = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", serif';

const random = (min, max) => min + Math.random() * (max - min);
const pick = (items) => items[Math.floor(Math.random() * items.length)];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef(null);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const celebrateRef = useRef(() => {});
  const calmDownRef = useRef(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const particles = [];
    const maxParticles = 900;
    let width = 0;
    let height = 0;
    let frameId = null;
    let lastFrame = 0;
    let running = false;
    let fireworksUntil = 0;
    let confettiUntil = 0;
    let nextRocketAt = 0;
    let nextRainAt = 0;

    function resizeCanvas() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeConfetti(x, y, vx, vy, { life = random(2.8, 4.6), emojiChance = 0.24 } = {}) {
      const emoji = Math.random() < emojiChance;
      return {
        kind: 'confetti', x, y, vx, vy,
        w: random(7, 12), h: random(9, 16),
        color: pick(CONFETTI_COLORS),
        emoji: emoji ? pick(CONFETTI_EMOJIS) : null,
        size: random(15, 26),
        rot: random(0, Math.PI * 2),
        vr: random(-7, 7),
        phase: random(0, Math.PI * 2),
        life, t: 0, dead: false,
      };
    }

    function spawnRain(amount) {
      for (let i = 0; i < amount && particles.length < maxParticles; i++) {
        particles.push(makeConfetti(
          random(-20, width + 20), random(-70, -10),
          random(-40, 40), random(60, 150),
          { emojiChance: 0.3 },
        ));
      }
    }

    function confettiCannon(xRatio, direction) {
      const x = width * xRatio;
      const y = height * 0.94;
      for (let i = 0; i < 46 && particles.length < maxParticles; i++) {
        particles.push(makeConfetti(x, y, direction * random(180, 720), random(-1020, -560), {
          emojiChance: 0.34,
          life: random(3, 4.8),
        }));
      }
    }

    function launchRocket() {
      if (particles.length >= maxParticles) return;
      const x = random(width * 0.12, width * 0.88);
      const targetY = random(height * 0.08, height * 0.38);
      const flyTime = random(0.6, 0.95);
      particles.push({
        kind: 'rocket', x, y: height + 20,
        vx: random(-30, 30),
        vy: -((height + 20 - targetY) / flyTime),
        targetY, hue: pick(FIREWORK_HUES) + random(-8, 8), dead: false,
      });
    }

    function explode(x, y, hue) {
      const count = Math.round(random(58, 88));
      for (let i = 0; i < count && particles.length < maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = random(40, 330) * (Math.random() < 0.2 ? 1.25 : 1);
        particles.push({
          kind: 'spark', x, y, px: x, py: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          hue: hue + random(-28, 28),
          light: random(58, 78),
          size: random(1.2, 2.6),
          life: random(0.9, 1.8), t: 0, dead: false,
        });
      }
      if (particles.length < maxParticles) {
        particles.push({ kind: 'flash', x, y, hue, life: 0.4, t: 0, dead: false });
      }
    }

    function updateParticles(dt) {
      for (const particle of particles) {
        if (particle.kind === 'confetti') {
          particle.t += dt;
          particle.vy += 210 * dt;
          particle.vx += Math.sin(particle.t * 3 + particle.phase) * 26 * dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.rot += particle.vr * dt;
          if (particle.t >= particle.life || particle.y > height + 60
            || particle.x < -90 || particle.x > width + 90) particle.dead = true;
        } else if (particle.kind === 'rocket') {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          if (particle.y <= particle.targetY) {
            explode(particle.x, particle.y, particle.hue);
            particle.dead = true;
          }
        } else if (particle.kind === 'spark') {
          particle.t += dt;
          particle.px = particle.x;
          particle.py = particle.y;
          const drag = Math.pow(0.32, dt);
          particle.vx *= drag;
          particle.vy = particle.vy * drag + 200 * dt;
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          if (particle.t >= particle.life) particle.dead = true;
        } else if (particle.kind === 'flash') {
          particle.t += dt;
          if (particle.t >= particle.life) particle.dead = true;
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].dead) particles.splice(i, 1);
      }
    }

    function drawParticles() {
      for (const particle of particles) {
        if (particle.kind === 'confetti') {
          context.globalAlpha = Math.max(0, Math.min(1, (particle.life - particle.t) / 0.6));
          context.save();
          context.translate(particle.x, particle.y);
          context.rotate(particle.rot);
          if (particle.emoji) {
            context.font = `${particle.size}px ${EMOJI_FONT}`;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(particle.emoji, 0, 0);
          } else {
            context.scale(1, Math.max(0.25, Math.abs(Math.cos(particle.rot * 1.4))));
            context.fillStyle = particle.color;
            context.fillRect(-particle.w / 2, -particle.h / 2, particle.w, particle.h);
          }
          context.restore();
        }
      }

      context.globalAlpha = 1;
      context.globalCompositeOperation = 'lighter';
      context.lineCap = 'round';
      for (const particle of particles) {
        if (particle.kind === 'rocket') {
          const tailX = particle.x - particle.vx * 0.03;
          const tailY = particle.y - particle.vy * 0.03;
          context.strokeStyle = `hsla(${particle.hue}, 100%, 80%, 0.35)`;
          context.lineWidth = 7;
          context.beginPath();
          context.moveTo(tailX, tailY);
          context.lineTo(particle.x, particle.y);
          context.stroke();
          context.strokeStyle = `hsla(${particle.hue}, 100%, 88%, 0.95)`;
          context.lineWidth = 2.6;
          context.stroke();
        } else if (particle.kind === 'spark') {
          const opacity = 1 - particle.t / particle.life;
          context.strokeStyle = `hsla(${particle.hue}, 100%, ${particle.light}%, ${0.22 * opacity})`;
          context.lineWidth = particle.size * 3.6;
          context.beginPath();
          context.moveTo(particle.px, particle.py);
          context.lineTo(particle.x, particle.y);
          context.stroke();
          context.strokeStyle = `hsla(${particle.hue}, 100%, ${particle.light}%, ${0.92 * opacity})`;
          context.lineWidth = particle.size * (0.6 + opacity);
          context.stroke();
        } else if (particle.kind === 'flash') {
          const opacity = 1 - particle.t / particle.life;
          const radius = 8 + 36 * (1 - opacity);
          const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, radius);
          glow.addColorStop(0, `hsla(${particle.hue}, 100%, 94%, ${0.9 * opacity})`);
          glow.addColorStop(0.45, `hsla(${particle.hue}, 100%, 72%, ${0.35 * opacity})`);
          glow.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
          context.fillStyle = glow;
          context.beginPath();
          context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }
      context.globalCompositeOperation = 'source-over';
    }

    function frame(now) {
      frameId = requestAnimationFrame(frame);
      const dt = Math.min((now - lastFrame) / 1000, 0.05);
      lastFrame = now;
      if (now < fireworksUntil && now >= nextRocketAt) {
        launchRocket();
        if (Math.random() < 0.55) launchRocket();
        nextRocketAt = now + random(160, 380);
      }
      if (now < confettiUntil && now >= nextRainAt) {
        spawnRain(3);
        nextRainAt = now + 100;
      }
      updateParticles(dt);
      context.clearRect(0, 0, width, height);
      drawParticles();
      if (!particles.length && now > fireworksUntil && now > confettiUntil) {
        cancelAnimationFrame(frameId);
        frameId = null;
        running = false;
      }
    }

    function startLoop() {
      if (running || prefersReducedMotion) return;
      running = true;
      lastFrame = performance.now();
      frameId = requestAnimationFrame(frame);
    }

    function celebrate(duration = 6500) {
      if (prefersReducedMotion) return;
      const now = performance.now();
      fireworksUntil = Math.max(fireworksUntil, now + duration);
      confettiUntil = Math.max(confettiUntil, now + duration + 1400);
      nextRocketAt = 0;
      nextRainAt = 0;
      confettiCannon(0.02, 1);
      confettiCannon(0.98, -1);
      startLoop();
    }

    function calmDown() {
      if (prefersReducedMotion) return;
      const now = performance.now();
      fireworksUntil = Math.min(fireworksUntil, now + 700);
      confettiUntil = now;
      for (const particle of particles) {
        if (particle.kind === 'confetti') {
          particle.life = Math.min(particle.life, particle.t + 0.45);
        }
      }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    celebrateRef.current = celebrate;
    calmDownRef.current = calmDown;
    window.celebrateLove = () => celebrate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (frameId !== null) cancelAnimationFrame(frameId);
      celebrateRef.current = () => {};
      calmDownRef.current = () => {};
      delete window.celebrateLove;
    };
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
      closeButtonRef.current?.focus({ preventScroll: true });

      function handleKeyDown(event) {
        if (event.key === 'Escape') {
          setIsModalOpen(false);
          return;
        }
        if (event.key !== 'Tab') return;

        const focusable = modalRef.current?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.classList.remove('modal-open');
        document.removeEventListener('keydown', handleKeyDown);
        calmDownRef.current();
        lastFocusedRef.current?.focus({ preventScroll: true });
        lastFocusedRef.current = null;
      };
    }
    document.body.classList.remove('modal-open');
    return undefined;
  }, [isModalOpen]);

  function openModal() {
    lastFocusedRef.current = document.activeElement;
    setIsModalOpen(true);
    celebrateRef.current(7000);
  }

  return (
    <>
      <div className="floaters" aria-hidden="true">
        {FLOATERS.map((floater, index) => (
          <span className="floater" style={floater.style} key={index}>{floater.emoji}</span>
        ))}
      </div>
      <canvas id="fx" ref={canvasRef} aria-hidden="true" />

      <main className="card">
        <span className="sticker sticker--corner sticker--tl" aria-hidden="true">😍</span>
        <span className="sticker sticker--corner sticker--tr" aria-hidden="true">💖</span>
        <span className="sticker sticker--corner sticker--bl" aria-hidden="true">💕</span>
        <span className="sticker sticker--corner sticker--br" aria-hidden="true">🥰</span>
        <p className="eyebrow">uma mensagem especial pra você 💌</p>
        <h1 className="title">
          <span className="title__text">Te amo meu amor</span>
          <span className="title__sticker" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        </h1>
        <p className="subtitle">Você chegou e deixou tudo mais bonito… 💞</p>
        <div className="sticker-strip" aria-hidden="true">
          <span className="sticker sticker--sm" style={{ '--rot': '-10deg', '--delay': '0s' }}>💖</span>
          <span className="sticker sticker--md" style={{ '--rot': '6deg', '--delay': '0.35s' }}>😍</span>
          <span className="sticker sticker--lg" style={{ '--rot': '-4deg', '--delay': '0.7s' }}>💘</span>
          <span className="sticker sticker--md" style={{ '--rot': '9deg', '--delay': '1.05s' }}>🥰</span>
          <span className="sticker sticker--sm" style={{ '--rot': '-8deg', '--delay': '1.4s' }}>💕</span>
        </div>
        <button className="love-btn" onClick={openModal} type="button">
          <span className="love-btn__icon" aria-hidden="true">💌</span>
          <span>Abrir minha mensagem</span>
        </button>
        <p className="hint">clique no botão 💝</p>
      </main>

      <div className={`modal${isModalOpen ? ' is-open' : ''}`} ref={modalRef} aria-hidden={!isModalOpen}>
        <div className="modal__backdrop" onClick={() => setIsModalOpen(false)} />
        <div className="modal__card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <span className="sticker modal__sticker modal__sticker--1" aria-hidden="true">😍</span>
          <span className="sticker modal__sticker modal__sticker--2" aria-hidden="true">💖</span>
          <span className="sticker modal__sticker modal__sticker--3" aria-hidden="true">💕</span>
          <button
            className="modal__close"
            ref={closeButtonRef}
            onClick={() => setIsModalOpen(false)}
            type="button"
            aria-label="Fechar mensagem"
          >
            ✕
          </button>
          <div className="modal__big-heart" aria-hidden="true">💖</div>
          <h2 className="modal__message" id="modalTitle">te amo meu amor ❤️</h2>
          <p className="modal__sub">
            Obrigado(a) por existir e por deixar meus dias muito mais felizes. 💞
          </p>
          <button className="again-btn" onClick={() => celebrateRef.current(5000)} type="button">
            Mais fogos 🎆
          </button>
        </div>
      </div>
    </>
  );
}
