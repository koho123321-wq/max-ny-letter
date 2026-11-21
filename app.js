/**
 * Новогоднее письмо для МАКС Мессенджера ✉️🎄
 * Включает:
 * - Интерактивную 3D-анимацию конверта с печатью
 * - Падающий снег и праздничные конфетти (HTML5 Canvas)
 * - Звуковые эффекты через Web Audio API (без внешних файлов)
 * - Интеграцию с MAX Bridge (window.WebApp)
 */

(function () {
  'use strict';

  // DOM Elements
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const waxSeal = document.getElementById('wax-seal');
  const instructionText = document.getElementById('instruction-text');
  const wishForm = document.getElementById('wish-form');
  const wishInput = document.getElementById('wish-input');
  const btnConfirm = document.getElementById('btn-confirm');
  const letterResult = document.getElementById('letter-result');
  const resultWishPreview = document.getElementById('result-wish-preview');
  const btnShare = document.getElementById('btn-share');
  const btnRestart = document.getElementById('btn-restart');
  const audioToggle = document.getElementById('audio-toggle');

  let soundEnabled = true;
  let isOpen = false;

  // ==========================================================================
  // 1. Web Audio API — Синтез новогодних колокольчиков и фанфар
  // ==========================================================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Звук волшебного открытия конверта (перелив колокольчиков)
  function playOpenChime() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const now = audioCtx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  // Праздничный аккорд при нажатии "Понял"
  function playCelebrateChime() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    const now = audioCtx.currentTime;

    notes.forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    });
  }

  // Кнопка включения/выключения звука
  audioToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    audioToggle.textContent = soundEnabled ? '🔔' : '🔕';
    audioToggle.style.opacity = soundEnabled ? '1' : '0.6';
  });

  // ==========================================================================
  // 2. Открытие и закрытие конверта
  // ==========================================================================
  function openEnvelope() {
    if (isOpen) return;
    isOpen = true;
    envelopeWrapper.classList.add('is-open');
    instructionText.textContent = 'Письмо открыто! Пожелай что-нибудь ✨';
    playOpenChime();

    setTimeout(() => {
      if (wishInput) {
        wishInput.focus();
      }
    }, 800);
  }

  function closeEnvelope() {
    if (!isOpen) return;
    isOpen = false;
    envelopeWrapper.classList.remove('is-open');
    instructionText.textContent = 'Нажми на конверт, чтобы распечатать его';

    // Сброс формы через задержку закрытия
    setTimeout(() => {
      letterResult.classList.add('hidden');
      wishForm.classList.remove('hidden');
      wishInput.value = '';
    }, 600);
  }

  envelopeWrapper.addEventListener('click', (e) => {
    // Не закрывать при клике на форму ввода внутри открытого письма
    if (isOpen) return;
    openEnvelope();
  });

  envelopeWrapper.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (!isOpen) {
        e.preventDefault();
        openEnvelope();
      }
    }
  });

  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  // ==========================================================================
  // 3. Обработка кнопки "Понял"
  // ==========================================================================
  btnConfirm.addEventListener('click', (e) => {
    e.stopPropagation();
    initAudio();

    const rawWish = wishInput.value.trim();
    const wishText = rawWish.length > 0 ? `«${rawWish}»` : '«Чудес, радости и исполнения всех желаний! 🎄»';

    resultWishPreview.textContent = wishText;
    wishForm.classList.add('hidden');
    letterResult.classList.remove('hidden');

    playCelebrateChime();
    launchConfetti();

    // Если приложение запущено в МАКСе, сохраним или включим закрытие
    if (window.WebApp && typeof window.WebApp.disableClosingConfirmation === 'function') {
      window.WebApp.disableClosingConfirmation();
    }
  });

  btnRestart.addEventListener('click', (e) => {
    e.stopPropagation();
    closeEnvelope();
  });

  // ==========================================================================
  // 4. Кнопка "Поделиться в МАКСе"
  // ==========================================================================
  btnShare.addEventListener('click', (e) => {
    e.stopPropagation();
    const wish = resultWishPreview.textContent;
    const shareText = `✉️ Моё новогоднее желание: ${wish} ✨🎄 С наступающим!`;

    // 1. Проверяем MAX Bridge
    if (window.WebApp && typeof window.WebApp.shareMaxContent === 'function') {
      try {
        window.WebApp.shareMaxContent({ text: shareText });
        return;
      } catch (err) {
        console.warn('MAX share error:', err);
      }
    }

    // 2. Стандартный Web Share API (мобильные браузеры)
    if (navigator.share) {
      navigator.share({
        title: 'Новогоднее письмо ✉️',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
      return;
    }

    // 3. Копирование в буфер обмена как fallback
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        const origText = btnShare.innerHTML;
        btnShare.innerHTML = '<span>Скопировано! ✅</span>';
        setTimeout(() => {
          btnShare.innerHTML = origText;
        }, 2000);
      });
    }
  });

  // ==========================================================================
  // 5. Холст падающего снега (Snow Canvas)
  // ==========================================================================
  const snowCanvas = document.getElementById('snow-canvas');
  const snowCtx = snowCanvas.getContext('2d');
  let snowWidth = 0;
  let snowHeight = 0;
  let flakes = [];

  function resizeSnowCanvas() {
    snowWidth = snowCanvas.width = window.innerWidth;
    snowHeight = snowCanvas.height = window.innerHeight;
    createFlakes();
  }

  function createFlakes() {
    const flakeCount = Math.floor(Math.min(snowWidth, 800) / 10);
    flakes = [];
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * snowWidth,
        y: Math.random() * snowHeight,
        radius: Math.random() * 2.5 + 0.8,
        density: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.7 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2,
      });
    }
  }

  function updateAndDrawSnow() {
    snowCtx.clearRect(0, 0, snowWidth, snowHeight);
    snowCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';

    for (let i = 0; i < flakes.length; i++) {
      const f = flakes[i];
      f.angle += f.swaySpeed;
      f.x += Math.sin(f.angle) * 0.8;
      f.y += f.density * 1.2;

      if (f.y > snowHeight) {
        f.y = -5;
        f.x = Math.random() * snowWidth;
      }
      if (f.x > snowWidth) f.x = 0;
      if (f.x < 0) f.x = snowWidth;

      snowCtx.beginPath();
      snowCtx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
      snowCtx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
      snowCtx.fill();
    }

    requestAnimationFrame(updateAndDrawSnow);
  }

  window.addEventListener('resize', resizeSnowCanvas);
  resizeSnowCanvas();
  requestAnimationFrame(updateAndDrawSnow);

  // ==========================================================================
  // 6. Холст праздничных конфетти (Confetti Cannon)
  // ==========================================================================
  const confettiCanvas = document.getElementById('confetti-canvas');
  const confettiCtx = confettiCanvas.getContext('2d');
  let confettiParticles = [];
  let isConfettiActive = false;

  function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeConfettiCanvas);
  resizeConfettiCanvas();

  const CONFETTI_COLORS = [
    '#f59e0b', '#ef4444', '#10b981', '#3b82f6', 
    '#ec4899', '#8b5cf6', '#ffd700', '#ffffff'
  ];

  function launchConfetti() {
    resizeConfettiCanvas();
    const count = 90;
    const originX = confettiCanvas.width / 2;
    const originY = confettiCanvas.height * 0.55;

    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI * 1.6) - (Math.PI * 0.8); // вверх веером
      const velocity = Math.random() * 12 + 6;

      confettiParticles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 4,
        size: Math.random() * 8 + 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.35,
        drag: 0.96,
        life: 1,
        decay: Math.random() * 0.015 + 0.01,
      });
    }

    if (!isConfettiActive) {
      isConfettiActive = true;
      requestAnimationFrame(animateConfetti);
    }
  }

  function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.life -= p.decay;

      if (p.life <= 0) {
        confettiParticles.splice(i, 1);
        continue;
      }

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate((p.rotation * Math.PI) / 180);
      confettiCtx.fillStyle = p.color;
      confettiCtx.globalAlpha = p.life;
      confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      confettiCtx.restore();
    }

    if (confettiParticles.length > 0) {
      requestAnimationFrame(animateConfetti);
    } else {
      isConfettiActive = false;
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ==========================================================================
  // 7. Поддержка MAX Mini-App SDK
  // ==========================================================================
  if (window.WebApp) {
    console.log('🎉 MAX Mini-App SDK detected:', window.WebApp.platform, window.WebApp.version);
    
    // Предупреждение о несохраненном вводе при попытке закрыть
    if (wishInput && typeof window.WebApp.enableClosingConfirmation === 'function') {
      wishInput.addEventListener('input', () => {
        if (wishInput.value.length > 0) {
          window.WebApp.enableClosingConfirmation();
        } else {
          window.WebApp.disableClosingConfirmation();
        }
      });
    }
  }

})();
