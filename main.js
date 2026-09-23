/* ==========================================================================
   ROYAL INDIAN WEDDING (TILAK) INVITATION — LOGIC & AUDIO ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Media & Canvas Elements
  const video = document.getElementById('doorVideo');
  const videoSource = document.getElementById('videoSource');
  const staticCanvas = document.getElementById('staticFrameCanvas');
  const canvasCtx = staticCanvas.getContext('2d');

  const tapOverlay = document.getElementById('tapOverlay');
  const invitationOverlay = document.getElementById('invitationOverlay');
  const lanternsContainer = document.getElementById('lanternsContainer');
  const contentScrollable = document.getElementById('contentScrollable');

  // Controls & Buttons
  const doorSelectBtn = document.getElementById('doorSelectBtn');
  const editDetailsBtn = document.getElementById('editDetailsBtn');
  const photoManagerBtn = document.getElementById('photoManagerBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const equalizerBars = document.getElementById('equalizerBars');
  const audioStatusText = document.getElementById('audioStatusText');
  const replayBtn = document.getElementById('replayBtn');
  const whatsappRsvpBtn = document.getElementById('whatsappRsvpBtn');
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  const venueInlineMapBtn = document.getElementById('venueInlineMapBtn');
  const openMapBtn = document.getElementById('openMapBtn');

  // Modals
  const doorModal = document.getElementById('doorModal');
  const closeDoorModal = document.getElementById('closeDoorModal');
  const editorModal = document.getElementById('editorModal');
  const closeEditorModal = document.getElementById('closeEditorModal');
  const mapModal = document.getElementById('mapModal');
  const closeMapModal = document.getElementById('closeMapModal');
  const photoManagerModal = document.getElementById('photoManagerModal');
  const closePhotoManager = document.getElementById('closePhotoManager');
  const editorForm = document.getElementById('editorForm');

  // Audio Elements & State
  const weddingAudio = document.getElementById('weddingAudio');
  let audioCtx = null;
  let synthGainNode = null;
  let synthOscillators = [];
  let isAudioMuted = false;
  let isPlaying = false;
  let hasOpened = false;
  let currentDoorId = '1';

  // ==========================================================================
  // EVENT CONSTANTS
  // ==========================================================================
  const EVENT = {
    countdownTarget: new Date('2026-10-18T15:00:00').getTime(),
    calendarStart: '20261018T093000Z', // 3:00 PM IST
    calendarEnd: '20261018T130000Z',
  };

  // ==========================================================================
  // AUDIO ENGINE (HTML5 AUDIO + WEB AUDIO RAAG SYNTHESIZER + YOUTUBE)
  // ==========================================================================
  function initAudioEngine() {
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

  // Web Audio Synth Fallback (Classical Indian Tanpura & Shehnai Harmony)
  function startIndianSynthRaga() {
    if (!audioCtx || isAudioMuted || synthGainNode) return;

    try {
      synthGainNode = audioCtx.createGain();
      synthGainNode.gain.setValueAtTime(0.01, audioCtx.currentTime);
      synthGainNode.gain.exponentialRampToValueAtTime(0.18, audioCtx.currentTime + 3);
      synthGainNode.connect(audioCtx.destination);

      const droneNotes = [130.81, 196.0, 261.63, 329.63]; // C3, G3, C4, E4
      droneNotes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // LFO for subtle Tanpura shimmer
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 0.2 + idx * 0.05;
        lfoGain.gain.value = 1.2;
        lfo.connect(osc.frequency);
        lfo.start();

        oscGain.gain.value = 0.25 / droneNotes.length;
        osc.connect(oscGain);
        oscGain.connect(synthGainNode);
        osc.start();

        synthOscillators.push(osc, lfo);
      });
    } catch (e) {
      console.warn('Web Audio synth notice:', e);
    }
  }

  function stopIndianSynthRaga() {
    if (synthGainNode && audioCtx) {
      try {
        synthGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        setTimeout(() => {
          synthOscillators.forEach((o) => {
            try { o.stop(); } catch (e) {}
          });
          synthOscillators = [];
          synthGainNode = null;
        }, 850);
      } catch (e) {
        synthGainNode = null;
      }
    }
  }

  function playWeddingMusic() {
    initAudioEngine();
    if (isAudioMuted) return;

    const ytInput = document.getElementById('inputYoutubeUrl');
    if (ytInput && ytInput.value.trim()) {
      playYouTubeBackgroundMusic(ytInput.value.trim(), true);
      updateEqualizerUI(true);
      return;
    }

    if (weddingAudio) {
      weddingAudio.volume = 0;
      const playPromise = weddingAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Fade in audio gently
          let vol = 0;
          const fadeInterval = setInterval(() => {
            vol += 0.05;
            if (vol >= 0.75) {
              weddingAudio.volume = 0.75;
              clearInterval(fadeInterval);
            } else {
              weddingAudio.volume = vol;
            }
          }, 80);
          updateEqualizerUI(true);
        }).catch((err) => {
          console.log('HTML5 audio play blocked, falling back to Web Audio synth:', err);
          startIndianSynthRaga();
          updateEqualizerUI(true);
        });
      }
    }
  }

  function pauseWeddingMusic() {
    if (weddingAudio) {
      weddingAudio.pause();
    }
    stopIndianSynthRaga();
    toggleYouTubeAudioMute(true);
    updateEqualizerUI(false);
  }

  function updateEqualizerUI(isPlayingAudio) {
    if (isPlayingAudio && !isAudioMuted) {
      equalizerBars.classList.add('playing');
      equalizerBars.classList.remove('muted');
      audioStatusText.textContent = 'Music';
    } else {
      equalizerBars.classList.remove('playing');
      equalizerBars.classList.add('muted');
      audioStatusText.textContent = 'Muted';
    }
  }

  audioToggleBtn.addEventListener('click', () => {
    isAudioMuted = !isAudioMuted;
    if (isAudioMuted) {
      pauseWeddingMusic();
    } else {
      playWeddingMusic();
    }
  });

  // ==========================================================================
  // TEXT & DETAILS PERSISTENCE
  // ==========================================================================
  const TEXT_STORE_KEY = 'royalTilakInviteV2';
  const TEXT_FIELDS = [
    { input: 'inputBride', display: 'displayBride' },
    { input: 'inputGroom', display: 'displayGroom' },
    { input: 'inputBrideParents', display: 'displayBrideParents' },
    { input: 'inputGroomParents', display: 'displayGroomParents' },
    { input: 'inputInvocation', display: 'displayInvocation' },
    { input: 'inputBlessing', display: 'displayBlessing' },
    { input: 'inputCeremonyEyebrow', display: 'displayCeremonyEyebrow' },
    { input: 'inputCeremonyTitle', display: 'displayCeremonyTitle' },
    { input: 'inputDateNum', display: 'displayDateNum' },
    { input: 'inputMonth', display: 'displayMonth' },
    { input: 'inputYear', display: 'displayYear' },
    { input: 'inputDay', display: 'displayDay' },
    { input: 'inputTime', display: 'displayTime' },
    { input: 'inputVenue', display: 'displayVenue' },
    { input: 'inputLocation', display: 'displayLocation' },
    { input: 'inputFamilies', display: 'displayFamilies' },
  ];

  function loadSavedText() {
    try {
      const raw = localStorage.getItem(TEXT_STORE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      TEXT_FIELDS.forEach(({ input, display }) => {
        if (typeof saved[input] === 'string' && saved[input] !== '') {
          const inputEl = document.getElementById(input);
          const displayEl = document.getElementById(display);
          if (inputEl) inputEl.value = saved[input];
          if (displayEl) displayEl.textContent = saved[input];
        }
      });
      if (typeof saved.inputYoutubeUrl === 'string') {
        const yt = document.getElementById('inputYoutubeUrl');
        if (yt) yt.value = saved.inputYoutubeUrl;
      }
      if (typeof saved.inputWhatsappNumber === 'string') {
        const wa = document.getElementById('inputWhatsappNumber');
        if (wa) wa.value = saved.inputWhatsappNumber;
      }
      syncAuxiliaryText();
    } catch (e) {
      console.warn('Saved text restore notice:', e);
    }
  }

  function saveCurrentText() {
    try {
      const payload = {};
      TEXT_FIELDS.forEach(({ input }) => {
        const el = document.getElementById(input);
        if (el) payload[input] = el.value;
      });
      const yt = document.getElementById('inputYoutubeUrl');
      if (yt) payload.inputYoutubeUrl = yt.value;
      const wa = document.getElementById('inputWhatsappNumber');
      if (wa) payload.inputWhatsappNumber = wa.value;
      localStorage.setItem(TEXT_STORE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Could not persist invitation text:', e);
    }
  }

  function syncAuxiliaryText() {
    const venue = document.getElementById('displayVenue');
    const location = document.getElementById('displayLocation');
    const mapTitle = document.getElementById('mapVenueTitle');
    const mapAddress = document.getElementById('mapVenueAddress');
    const mapLabel = document.getElementById('mapMockLabel');
    const mapsLink = document.getElementById('openMapsLink');

    if (venue && mapTitle) mapTitle.textContent = venue.textContent;
    if (location && mapAddress) mapAddress.textContent = location.textContent;
    if (venue && mapLabel) mapLabel.textContent = venue.textContent;

    if (mapsLink && venue && location) {
      const query = `${venue.textContent.trim()}, ${location.textContent.trim()}`;
      mapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    }
  }

  loadSavedText();

  // ==========================================================================
  // 3D FLOATING LANTERNS ENGINE
  // ==========================================================================
  function initFloatingLanterns() {
    if (!lanternsContainer) return;
    lanternsContainer.innerHTML = '';
    const lanternCount = 20;
    const depthTiers = ['depth-far', 'depth-far', 'depth-mid', 'depth-mid', 'depth-near'];

    for (let i = 0; i < lanternCount; i++) {
      const lantern = document.createElement('div');
      const depthClass = depthTiers[Math.floor(Math.random() * depthTiers.length)];
      lantern.className = `lantern-item ${depthClass}`;

      const leftPos = (Math.random() * 92 + 4).toFixed(1);
      const duration = (Math.random() * 14 + 14).toFixed(1);
      const delay = (Math.random() * 18).toFixed(1);
      const swayX = (Math.random() * 24 + 10).toFixed(0);
      const rotDeg = (Math.random() * 6 - 3).toFixed(1);

      lantern.style.left = `${leftPos}%`;
      lantern.style.animationDuration = `${duration}s`;
      lantern.style.animationDelay = `${delay}s`;
      lantern.style.setProperty('--sway-x', `${swayX}px`);
      lantern.style.setProperty('--rot-deg', `${rotDeg}deg`);

      lantern.innerHTML = `
        <div class="lantern-paper">
          <div class="lantern-core-flame"></div>
        </div>
        <div class="lantern-tassel"></div>
      `;

      lanternsContainer.appendChild(lantern);
    }
  }

  initFloatingLanterns();

  // ==========================================================================
  // FREEZE FINAL FRAME & REVEAL INVITATION
  // ==========================================================================
  function freezeFinalFrame() {
    if (video.videoWidth && video.videoHeight) {
      staticCanvas.width = video.videoWidth;
      staticCanvas.height = video.videoHeight;
      canvasCtx.drawImage(video, 0, 0, staticCanvas.width, staticCanvas.height);
      staticCanvas.classList.add('active');
      video.pause();
    }
  }

  function revealInvitationContent() {
    freezeFinalFrame();
    hasOpened = true;
    isPlaying = false;

    if (lanternsContainer) lanternsContainer.classList.add('revealed');
    invitationOverlay.classList.remove('hidden');
    void invitationOverlay.offsetWidth;
    invitationOverlay.classList.add('revealed');

    setTimeout(() => {
      initScratchCanvas();
    }, 150);
  }

  // ==========================================================================
  // DOOR OPENING SEQUENCE
  // ==========================================================================
  function openDoorInvitation() {
    if (isPlaying || hasOpened) return;

    isPlaying = true;
    playWeddingMusic();

    tapOverlay.classList.add('fade-out');
    staticCanvas.classList.remove('active');
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Video playing smoothly to completion
      }).catch((err) => {
        console.warn('Video play fallback:', err);
        revealInvitationContent();
      });
    }
  }

  tapOverlay.addEventListener('click', openDoorInvitation);
  tapOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDoorInvitation();
    }
  });

  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= 5.8) {
      if (lanternsContainer) lanternsContainer.classList.add('revealed');
    }
    if (!hasOpened && (video.currentTime >= 5.8 || video.ended)) {
      revealInvitationContent();
    }
  });

  video.addEventListener('ended', () => {
    freezeFinalFrame();
    if (!hasOpened) {
      revealInvitationContent();
    }
  });

  // Reset & Replay
  function resetDoorState() {
    isPlaying = false;
    hasOpened = false;

    video.pause();
    video.currentTime = 0;
    staticCanvas.classList.remove('active');
    invitationOverlay.classList.remove('revealed');

    if (lanternsContainer) lanternsContainer.classList.remove('revealed');
    if (contentScrollable) contentScrollable.scrollTop = 0;

    setTimeout(() => {
      invitationOverlay.classList.add('hidden');
      tapOverlay.classList.remove('fade-out');
    }, 400);
  }

  replayBtn.addEventListener('click', resetDoorState);

  // ==========================================================================
  // SHIMMERING GOLD FOIL SCRATCH CARD ENGINE
  // ==========================================================================
  const scratchCanvas = document.getElementById('scratchCanvas');
  const scratchHint = document.getElementById('scratchHint');
  const quickRevealBtn = document.getElementById('quickRevealBtn');
  let scratchCtx = null;
  let isScratching = false;
  let hasScratchedCleared = false;
  let dragCount = 0;

  function initScratchCanvas() {
    if (!scratchCanvas) return;
    scratchCtx = scratchCanvas.getContext('2d');

    const container = document.getElementById('scratchContainer');
    if (!container) return;

    scratchCanvas.width = container.offsetWidth || 340;
    scratchCanvas.height = container.offsetHeight || 140;

    const grad = scratchCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    grad.addColorStop(0, '#E8C86A');
    grad.addColorStop(0.3, '#FFF2C6');
    grad.addColorStop(0.6, '#D4AF37');
    grad.addColorStop(1, '#996515');

    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    // Golden sparkles overlay
    scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 160; i++) {
      const x = Math.random() * scratchCanvas.width;
      const y = Math.random() * scratchCanvas.height;
      const r = Math.random() * 2.2 + 0.5;
      scratchCtx.beginPath();
      scratchCtx.arc(x, y, r, 0, Math.PI * 2);
      scratchCtx.fill();
    }

    scratchCtx.font = '700 12px "Cinzel", serif';
    scratchCtx.fillStyle = 'rgba(74, 14, 28, 0.9)';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('✦ SCRATCH GOLD FOIL TO REVEAL DATE ✦', scratchCanvas.width / 2, scratchCanvas.height / 2 + 4);
  }

  function scratchAt(x, y) {
    if (!scratchCtx || hasScratchedCleared) return;

    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 24, 0, Math.PI * 2);
    scratchCtx.fill();

    dragCount++;
    if (dragCount % 8 === 0) {
      checkScratchPercentage();
    }
  }

  function getScratchCoords(e) {
    const rect = scratchCanvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function checkScratchPercentage() {
    if (hasScratchedCleared || !scratchCtx) return;

    const imgData = scratchCtx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
    const pixels = imgData.data;
    let transparentCount = 0;

    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] === 0) {
        transparentCount++;
      }
    }

    const totalSampled = pixels.length / 16;
    const ratio = transparentCount / totalSampled;

    if (ratio > 0.32) {
      revealDateFully();
    }
  }

  function revealDateFully() {
    if (hasScratchedCleared) return;
    hasScratchedCleared = true;

    if (scratchCanvas) scratchCanvas.classList.add('fade-out');
    if (scratchHint) scratchHint.style.opacity = '0';
    if (quickRevealBtn) quickRevealBtn.style.display = 'none';

    triggerConfetti();
  }

  if (scratchCanvas) {
    ['mousedown', 'touchstart'].forEach((evt) => {
      scratchCanvas.addEventListener(evt, (e) => {
        isScratching = true;
        const coords = getScratchCoords(e);
        scratchAt(coords.x, coords.y);
      }, { passive: true });
    });

    ['mousemove', 'touchmove'].forEach((evt) => {
      scratchCanvas.addEventListener(evt, (e) => {
        if (!isScratching) return;
        const coords = getScratchCoords(e);
        scratchAt(coords.x, coords.y);
      }, { passive: true });
    });

    ['mouseup', 'mouseleave', 'touchend'].forEach((evt) => {
      scratchCanvas.addEventListener(evt, () => {
        isScratching = false;
      });
    });
  }

  if (quickRevealBtn) {
    quickRevealBtn.addEventListener('click', revealDateFully);
  }

  // ==========================================================================
  // GOLD & ROSE CONFETTI CELEBRATION ENGINE
  // ==========================================================================
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiCtx = null;
  let confettiParticles = [];
  let confettiAnimationId = null;

  function triggerConfetti() {
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');

    const container = document.getElementById('invitationOverlay');
    confettiCanvas.width = container ? container.offsetWidth : window.innerWidth;
    confettiCanvas.height = container ? container.offsetHeight : window.innerHeight;

    const colors = ['#FBF2C0', '#D4AF37', '#ECC868', '#FFFFFF', '#80182E', '#996515'];
    confettiParticles = [];

    for (let i = 0; i < 85; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() * 80 - 40),
        y: confettiCanvas.height * 0.3,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() * -11) - 4,
        size: Math.random() * 7 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 9,
        opacity: 1,
      });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let activeParticles = 0;

    confettiParticles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.28;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.007;

      if (p.opacity > 0) {
        activeParticles++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        confettiCtx.restore();
      }
    });

    if (activeParticles > 0) {
      confettiAnimationId = requestAnimationFrame(animateConfetti);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  // ==========================================================================
  // LIVE COUNTDOWN TIMER ENGINE
  // ==========================================================================
  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMins = document.getElementById('cdMins');
  const cdSecs = document.getElementById('cdSecs');

  function updateCountdown() {
    if (!cdDays || !cdHours || !cdMins || !cdSecs) return;

    const now = new Date().getTime();
    const distance = EVENT.countdownTarget - now;

    if (distance < 0) {
      cdDays.innerText = '00';
      cdHours.innerText = '00';
      cdMins.innerText = '00';
      cdSecs.innerText = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    cdDays.innerText = days < 10 ? '0' + days : days;
    cdHours.innerText = hours < 10 ? '0' + hours : hours;
    cdMins.innerText = minutes < 10 ? '0' + minutes : minutes;
    cdSecs.innerText = seconds < 10 ? '0' + seconds : seconds;
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================================================
  // PHOTO GALLERY (7 SLOTS, INDEXEDDB, LIGHTBOX)
  // ==========================================================================
  const GALLERY_META = [
    { slot: 1, name: '1 · Hero Couple Photo', label: 'Together', alt: 'Richa Dwivedi and Akash Shukla — main couple photo' },
    { slot: 2, name: '2 · Bride Photo', label: 'The Bride', alt: 'Richa Dwivedi — bride photo' },
    { slot: 3, name: '3 · Groom Photo', label: 'The Groom', alt: 'Akash Shukla — groom photo' },
    { slot: 4, name: '4 · Couple Portrait', label: 'Cherished', alt: 'Richa Dwivedi and Akash Shukla — couple photo' },
    { slot: 5, name: '5 · Family Blessing', label: 'Family Blessings', alt: 'Family photo' },
    { slot: 6, name: '6 · Celebration Moment', label: 'Celebration', alt: 'Family and couple photo' },
    { slot: 7, name: '7 · Cherished Memories', label: 'Memories', alt: 'Additional cherished memory photo' },
  ];

  const DB_NAME = 'tilak-invite-gallery';
  const DB_STORE = 'photos';
  const GALLERY_STATE_KEY = 'tilakGalleryStateV2';

  const customUrls = new Array(7).fill(null);
  const slotState = new Array(7).fill('default');

  function defaultSrc(i) {
    return `/assets/gallery/photo-${i + 1}.webp`;
  }

  function getEffectiveSrc(i) {
    if (customUrls[i]) return customUrls[i];
    if (slotState[i] === 'empty') return null;
    return defaultSrc(i);
  }

  function isSlotVisible(i) {
    return getEffectiveSrc(i) !== null;
  }

  function loadGalleryState() {
    try {
      const raw = localStorage.getItem(GALLERY_STATE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      for (let i = 0; i < 7; i++) {
        if (saved[i + 1] === 'empty' && !customUrls[i]) slotState[i] = 'empty';
      }
    } catch (e) {
      console.warn('Gallery state restore notice:', e);
    }
  }

  function saveGalleryState() {
    try {
      const payload = {};
      for (let i = 0; i < 7; i++) {
        payload[i + 1] = slotState[i];
      }
      localStorage.setItem(GALLERY_STATE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Gallery state save notice:', e);
    }
  }

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(DB_STORE)) {
          req.result.createObjectStore(DB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbPut(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbDel(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function applySlotToDom(i) {
    const src = getEffectiveSrc(i);
    const meta = GALLERY_META[i];

    const item = document.querySelector(`.gallery-item[data-gallery-index="${i}"]`);
    if (item) {
      const img = item.querySelector('.gallery-img');
      if (src) {
        item.classList.remove('is-empty');
        item.style.display = '';
        if (img && img.getAttribute('src') !== src) {
          img.src = src;
          img.alt = meta.alt;
        }
      } else {
        item.classList.add('is-empty');
        item.style.display = 'none';
      }
    }

    updatePhotoSlotPreview(i);
  }

  function updatePhotoSlotPreview(i) {
    const photoSlotsGrid = document.getElementById('photoSlotsGrid');
    if (!photoSlotsGrid) return;
    const preview = photoSlotsGrid.querySelector(`[data-preview="${i}"]`);
    if (!preview) return;

    const src = getEffectiveSrc(i);
    let img = preview.querySelector('img');
    if (src) {
      if (!img) {
        img = document.createElement('img');
        img.alt = GALLERY_META[i].alt;
        preview.appendChild(img);
      }
      img.src = src;
    } else if (img) {
      img.remove();
    }
  }

  function buildPhotoSlots() {
    const photoSlotsGrid = document.getElementById('photoSlotsGrid');
    if (!photoSlotsGrid) return;
    photoSlotsGrid.innerHTML = '';

    GALLERY_META.forEach((meta, idx) => {
      const card = document.createElement('div');
      card.className = 'photo-slot-card';

      const src = getEffectiveSrc(idx);
      card.innerHTML = `
        <div class="photo-slot-preview" data-preview="${idx}">
          ${src ? `<img src="${src}" alt="${meta.alt}">` : `<button type="button" class="photo-slot-empty" data-action="upload" data-index="${idx}">+ Photo ${idx + 1}</button>`}
        </div>
        <div class="photo-slot-meta">
          <div class="photo-slot-title">${meta.name}</div>
          <div class="photo-slot-actions">
            <label class="photo-upload-btn">
              Upload
              <input type="file" accept="image/*" style="display:none" data-upload-index="${idx}">
            </label>
            <button type="button" class="photo-remove-btn" data-remove-index="${idx}">Reset</button>
          </div>
        </div>
      `;

      photoSlotsGrid.appendChild(card);
    });

    // Wire upload listeners
    photoSlotsGrid.querySelectorAll('[data-upload-index]').forEach((input) => {
      input.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files[0]) {
          const index = Number(e.target.dataset.uploadIndex);
          const file = e.target.files[0];
          const blobUrl = URL.createObjectURL(file);
          customUrls[index] = blobUrl;
          slotState[index] = 'default';
          await idbPut(index + 1, file);
          saveGalleryState();
          applySlotToDom(index);
        }
      });
    });

    photoSlotsGrid.querySelectorAll('[data-remove-index]').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const index = Number(e.target.dataset.removeIndex);
        customUrls[index] = null;
        slotState[index] = 'default';
        await idbDel(index + 1);
        saveGalleryState();
        applySlotToDom(index);
      });
    });
  }

  async function hydrateGallery() {
    loadGalleryState();
    try {
      for (let i = 0; i < 7; i++) {
        const blob = await idbGet(i + 1);
        if (blob) {
          customUrls[i] = URL.createObjectURL(blob);
          slotState[i] = 'default';
        }
      }
    } catch (e) {
      console.warn('IndexedDB gallery notice:', e);
    }
    saveGalleryState();
    for (let i = 0; i < 7; i++) applySlotToDom(i);
    buildPhotoSlots();
  }

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxLabel = document.getElementById('lightboxLabel');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let lightboxOpen = false;
  let lightboxSlot = 0;

  function visibleSlots() {
    const list = [];
    for (let i = 0; i < 7; i++) {
      if (isSlotVisible(i)) list.push(i);
    }
    return list;
  }

  function renderLightbox() {
    const src = getEffectiveSrc(lightboxSlot);
    const meta = GALLERY_META[lightboxSlot];
    const list = visibleSlots();
    const position = list.indexOf(lightboxSlot) + 1;

    if (src) {
      lightboxImg.src = src;
      lightboxImg.alt = meta.alt;
    }

    lightboxCounter.textContent = `${position} / ${list.length}`;
    lightboxLabel.textContent = meta.label;
  }

  function openLightbox(slotIndex) {
    if (!isSlotVisible(slotIndex)) return;
    lightboxSlot = slotIndex;
    lightboxOpen = true;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    renderLightbox();
  }

  function closeLightbox() {
    lightboxOpen = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
  }

  function stepLightbox(direction) {
    const list = visibleSlots();
    if (!list.length) return;
    let pos = list.indexOf(lightboxSlot);
    if (pos < 0) pos = 0;
    pos = (pos + direction + list.length) % list.length;
    lightboxSlot = list[pos];
    renderLightbox();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-gallery-index]');
    if (trigger) {
      const index = Number(trigger.dataset.galleryIndex);
      if (!Number.isNaN(index)) openLightbox(index);
    }
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => stepLightbox(-1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => stepLightbox(1));

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  hydrateGallery();

  // ==========================================================================
  // DOOR STYLE SWITCHER
  // ==========================================================================
  function switchDoorStyle(doorId) {
    if (currentDoorId === doorId) return;

    currentDoorId = doorId;
    resetDoorState();

    const videoPath = `/assets/doors/${doorId}.mp4`;
    videoSource.src = videoPath;
    video.load();

    document.querySelectorAll('.door-option-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.door === doorId);
    });

    doorModal.classList.add('hidden');
  }

  doorSelectBtn.addEventListener('click', () => doorModal.classList.remove('hidden'));
  closeDoorModal.addEventListener('click', () => doorModal.classList.add('hidden'));

  document.querySelectorAll('.door-option-card').forEach((card) => {
    card.addEventListener('click', () => {
      switchDoorStyle(card.dataset.door);
    });
  });

  // ==========================================================================
  // DETAILS EDITOR
  // ==========================================================================
  editDetailsBtn.addEventListener('click', () => editorModal.classList.remove('hidden'));
  closeEditorModal.addEventListener('click', () => editorModal.classList.add('hidden'));
  photoManagerBtn.addEventListener('click', () => photoManagerModal.classList.remove('hidden'));
  closePhotoManager.addEventListener('click', () => photoManagerModal.classList.add('hidden'));

  editorForm.addEventListener('submit', (e) => {
    e.preventDefault();

    TEXT_FIELDS.forEach(({ input, display }) => {
      const inputEl = document.getElementById(input);
      const displayEl = document.getElementById(display);
      if (inputEl && displayEl) {
        displayEl.textContent = inputEl.value;
      }
    });

    syncAuxiliaryText();
    saveCurrentText();

    const ytUrlInput = document.getElementById('inputYoutubeUrl');
    if (ytUrlInput && ytUrlInput.value.trim()) {
      playWeddingMusic();
    }

    editorModal.classList.add('hidden');
  });

  // ==========================================================================
  // YOUTUBE MUSIC ENGINE
  // ==========================================================================
  let ytPlayerIframe = null;

  function extractYouTubeId(url) {
    if (!url) return '';
    url = url.trim();
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return match[2];
    }
    if (url.length === 11) return url;
    return '';
  }

  function playYouTubeBackgroundMusic(url, autoPlay = true) {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;
    const container = document.getElementById('youtubePlayerContainer');
    if (!container) return;

    const mute = isAudioMuted ? 1 : 0;
    const playParam = autoPlay ? 1 : 0;
    container.innerHTML = `<iframe id="ytIframe" width="200" height="200"
      src="https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=${playParam}&loop=1&playlist=${videoId}&controls=0&mute=${mute}"
      frameborder="0" allow="autoplay"></iframe>`;

    ytPlayerIframe = document.getElementById('ytIframe');
  }

  function toggleYouTubeAudioMute(isMuted) {
    if (!ytPlayerIframe || !ytPlayerIframe.contentWindow) return;
    const command = isMuted ? 'mute' : 'unMute';
    try {
      ytPlayerIframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: command,
        args: [],
      }), '*');
    } catch (e) {
      console.warn('YouTube command notice:', e);
    }
  }

  // ==========================================================================
  // MAP MODAL & ACTIONS
  // ==========================================================================
  if (venueInlineMapBtn) {
    venueInlineMapBtn.addEventListener('click', () => {
      syncAuxiliaryText();
      mapModal.classList.remove('hidden');
    });
  }

  openMapBtn.addEventListener('click', () => {
    syncAuxiliaryText();
    mapModal.classList.remove('hidden');
  });
  closeMapModal.addEventListener('click', () => mapModal.classList.add('hidden'));

  [doorModal, editorModal, mapModal, photoManagerModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // ==========================================================================
  // WHATSAPP RSVP & BLESSINGS
  // ==========================================================================
  if (whatsappRsvpBtn) {
    whatsappRsvpBtn.addEventListener('click', () => {
      const bride = document.getElementById('displayBride').innerText.trim();
      const groom = document.getElementById('displayGroom').innerText.trim();
      const waInput = document.getElementById('inputWhatsappNumber');
      const waNumber = (waInput && waInput.value.trim()) ? waInput.value.trim().replace(/[^0-9]/g, '') : '919876543210';

      const message = encodeURIComponent(`Heartiest Congratulations to ${bride} & ${groom}! 💐✨\n\nWe are delighted to receive your Tilak & Engagement invitation for 18 October 2026. Sending our warmest blessings and best wishes for your beautiful journey together! 🎉🪔`);
      const waUrl = `https://wa.me/${waNumber}?text=${message}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // ADD TO GOOGLE / APPLE CALENDAR
  // ==========================================================================
  addToCalendarBtn.addEventListener('click', () => {
    const bride = document.getElementById('displayBride').innerText.trim();
    const groom = document.getElementById('displayGroom').innerText.trim();
    const venue = document.getElementById('displayVenue').innerText.trim();
    const location = document.getElementById('displayLocation').innerText.trim();

    const title = encodeURIComponent(`Engagement (Tilak) of ${bride} & ${groom}`);
    const details = encodeURIComponent(`With the blessings of our families — join us for the Engagement (Tilak) ceremony of ${bride} and ${groom}.`);
    const loc = encodeURIComponent(`${venue}, ${location}`);

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=${EVENT.calendarStart}/${EVENT.calendarEnd}`;
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  });
});
