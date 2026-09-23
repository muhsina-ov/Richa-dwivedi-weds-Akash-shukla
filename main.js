/* ==========================================================================
   PREMIUM INDIAN ENGAGEMENT (TILAK) INVITATION — LOGIC & ANIMATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Element References
  const posterImg = document.getElementById('doorPoster');
  const video = document.getElementById('doorVideo');
  const videoSource = document.getElementById('videoSource');
  const staticCanvas = document.getElementById('staticFrameCanvas');
  const canvasCtx = staticCanvas.getContext('2d');

  const tapOverlay = document.getElementById('tapOverlay');
  const invitationOverlay = document.getElementById('invitationOverlay');

  // Controls & Modals
  const doorSelectBtn = document.getElementById('doorSelectBtn');
  const editDetailsBtn = document.getElementById('editDetailsBtn');
  const photoManagerBtn = document.getElementById('photoManagerBtn');
  const audioToggleBtn = document.getElementById('audioToggleBtn');
  const audioIconOn = document.getElementById('audioIconOn');
  const audioIconOff = document.getElementById('audioIconOff');
  const replayBtn = document.getElementById('replayBtn');

  // Modals
  const doorModal = document.getElementById('doorModal');
  const closeDoorModal = document.getElementById('closeDoorModal');
  const editorModal = document.getElementById('editorModal');
  const closeEditorModal = document.getElementById('closeEditorModal');
  const mapModal = document.getElementById('mapModal');
  const openMapBtn = document.getElementById('openMapBtn');
  const closeMapModal = document.getElementById('closeMapModal');
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  const photoManagerModal = document.getElementById('photoManagerModal');
  const closePhotoManager = document.getElementById('closePhotoManager');

  // Forms & Inputs
  const editorForm = document.getElementById('editorForm');

  // Application State
  let currentDoorId = '1';
  let isAudioMuted = false;
  let isPlaying = false;
  let hasOpened = false;
  let audioCtx = null;

  // ==========================================================================
  // EVENT CONSTANTS (DO NOT CHANGE NAMES / DATES / VENUE)
  // ==========================================================================
  const EVENT = {
    countdownTarget: new Date('2026-10-18T15:00:00').getTime(),
    calendarStart: '20261018T093000Z', // 3:00 PM IST
    calendarEnd: '20261018T130000Z',
  };

  // ==========================================================================
  // TEXT PERSISTENCE (localStorage)
  // ==========================================================================
  const TEXT_STORE_KEY = 'tilakInviteTextV1';

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
      syncAuxiliaryText();
    } catch (e) {
      console.warn('Saved text could not be restored:', e);
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

  // --- Audio Context Helper ---
  function initAudioContext() {
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

  // --- 3D Depth Floating Lanterns Engine ---
  function initFloatingLanterns() {
    const container = document.getElementById('lanternsContainer');
    if (!container) return;

    container.innerHTML = '';
    const lanternCount = 18;
    const depthTiers = ['depth-far', 'depth-far', 'depth-mid', 'depth-mid', 'depth-near'];

    for (let i = 0; i < lanternCount; i++) {
      const lantern = document.createElement('div');
      const depthClass = depthTiers[Math.floor(Math.random() * depthTiers.length)];
      lantern.className = `lantern-item ${depthClass}`;

      const leftPos = (Math.random() * 92 + 4).toFixed(1);
      const duration = (Math.random() * 14 + 14).toFixed(1);
      const delay = (Math.random() * 20).toFixed(1);
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

      container.appendChild(lantern);
    }
  }

  initFloatingLanterns();

  // --- Capture Final Video Frame onto Canvas for Static Hold ---
  function freezeFinalFrame() {
    if (video.videoWidth && video.videoHeight) {
      staticCanvas.width = video.videoWidth;
      staticCanvas.height = video.videoHeight;
      canvasCtx.drawImage(video, 0, 0, staticCanvas.width, staticCanvas.height);

      staticCanvas.classList.add('active');
      video.pause();
    }
  }

  // --- Helper: Reveal Invitation Content ---
  function revealInvitationContent() {
    freezeFinalFrame();
    hasOpened = true;
    isPlaying = false;

    invitationOverlay.classList.remove('hidden');
    void invitationOverlay.offsetWidth;
    invitationOverlay.classList.add('revealed');

    setTimeout(() => {
      initScratchCanvas();
    }, 150);
  }

  // --- HTML5 Scratch Card Engine ---
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

    scratchCanvas.width = container.offsetWidth || 320;
    scratchCanvas.height = container.offsetHeight || 130;

    const grad = scratchCtx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
    grad.addColorStop(0, '#D9B84C');
    grad.addColorStop(0.35, '#F6E7B0');
    grad.addColorStop(0.7, '#C9A227');
    grad.addColorStop(1, '#8A6A1F');

    scratchCtx.fillStyle = grad;
    scratchCtx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

    scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * scratchCanvas.width;
      const y = Math.random() * scratchCanvas.height;
      const r = Math.random() * 2 + 0.5;
      scratchCtx.beginPath();
      scratchCtx.arc(x, y, r, 0, Math.PI * 2);
      scratchCtx.fill();
    }

    scratchCtx.font = '600 12px "Cormorant Garamond", serif';
    scratchCtx.fillStyle = 'rgba(63, 15, 30, 0.82)';
    scratchCtx.textAlign = 'center';
    scratchCtx.fillText('✦ SCRATCH TO UNLOCK DATE ✦', scratchCanvas.width / 2, scratchCanvas.height / 2 + 4);
  }

  function scratchAt(x, y) {
    if (!scratchCtx || hasScratchedCleared) return;

    scratchCtx.globalCompositeOperation = 'destination-out';
    scratchCtx.beginPath();
    scratchCtx.arc(x, y, 22, 0, Math.PI * 2);
    scratchCtx.fill();

    dragCount++;
    if (dragCount % 10 === 0) {
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

    if (ratio > 0.35) {
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

  // --- Gold Confetti Particle Celebration Engine ---
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

    const colors = ['#E8CE7A', '#C9A227', '#F3D9C8', '#FFFFFF', '#A8842C', '#7A2233'];
    confettiParticles = [];

    for (let i = 0; i < 70; i++) {
      confettiParticles.push({
        x: confettiCanvas.width / 2 + (Math.random() * 60 - 30),
        y: confettiCanvas.height * 0.35,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() * -10) - 4,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
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
      p.vy += 0.25;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.008;

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

  // --- Live Countdown Timer Engine ---
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
  // PHOTO GALLERY — 7 SLOTS, IndexedDB PERSISTENCE, UPLOAD MANAGER, LIGHTBOX
  // ==========================================================================
  const GALLERY_META = [
    { slot: 1, name: '1 · Hero Couple Photo', label: 'Together', alt: 'Richa Dwivedi and Akash Shukla — main couple photo' },
    { slot: 2, name: '2 · Bride Photo', label: 'The Bride', alt: 'Richa Dwivedi — bride photo' },
    { slot: 3, name: '3 · Groom Photo', label: 'The Groom', alt: 'Akash Shukla — groom photo' },
    { slot: 4, name: '4 · Bride & Groom Photo', label: 'Us', alt: 'Richa Dwivedi and Akash Shukla — couple photo' },
    { slot: 5, name: '5 · Family Photo', label: 'Family', alt: 'Family photo' },
    { slot: 6, name: '6 · Family / Couple Photo', label: 'Together', alt: 'Family and couple photo' },
    { slot: 7, name: '7 · Memories Photo', label: 'Memories', alt: 'Additional cherished memory photo' },
  ];

  const DB_NAME = 'tilak-invite-gallery';
  const DB_STORE = 'photos';
  const GALLERY_STATE_KEY = 'tilakGalleryStateV1';

  const customUrls = new Array(7).fill(null); // object URLs for uploaded blobs
  const slotState = new Array(7).fill('default'); // 'default' | 'empty'

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
      console.warn('Gallery state restore failed:', e);
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
      console.warn('Gallery state save failed:', e);
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

    // Hero (slot 1)
    if (i === 0) {
      const hero = document.getElementById('heroPhoto');
      const heroBtn = document.querySelector('.hero-photo-btn');
      if (hero) {
        if (src) {
          if (hero.getAttribute('src') !== src) hero.src = src;
          hero.style.display = '';
        } else {
          hero.style.display = 'none';
        }
      }
      if (heroBtn) heroBtn.style.display = src ? '' : 'none';
    }

    // Gallery grid button
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

    // Photo manager preview
    updatePhotoSlotPreview(i);

    // Lightbox refresh if this slot is currently shown
    if (lightboxOpen && lightboxSlot === i && src) {
      lightboxImg.src = src;
      lightboxImg.alt = meta.alt;
    }
  }

  // --- Image Upload Compression ---
  function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Could not read image file.'));
      };
      img.src = url;
    });
  }

  async function compressImage(file) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose an image file.');
    }
    const img = await loadImageFromFile(file);
    const maxDim = 1600;
    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = Math.min(maxDim / width, maxDim / height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', 0.8);
    });
    if (blob) return blob;

    // Fallback for browsers without WebP encoding
    const jpegBlob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.82);
    });
    if (!jpegBlob) throw new Error('Image optimization failed.');
    return jpegBlob;
  }

  async function setSlotImage(i, file) {
    const blob = await compressImage(file);
    await idbPut(i + 1, blob);

    if (customUrls[i]) URL.revokeObjectURL(customUrls[i]);
    customUrls[i] = URL.createObjectURL(blob);
    slotState[i] = 'default'; // has custom content
    saveGalleryState();
    applySlotToDom(i);
  }

  async function removeSlotImage(i) {
    await idbDel(i + 1);
    if (customUrls[i]) {
      URL.revokeObjectURL(customUrls[i]);
      customUrls[i] = null;
      slotState[i] = 'default'; // revert to bundled default photo
    } else {
      slotState[i] = 'empty'; // no custom → hide slot
    }
    saveGalleryState();
    applySlotToDom(i);
  }

  // --- Photo Manager UI ---
  const photoSlotsGrid = document.getElementById('photoSlotsGrid');

  function buildPhotoSlots() {
    if (!photoSlotsGrid) return;
    photoSlotsGrid.innerHTML = '';

    GALLERY_META.forEach((meta, i) => {
      const card = document.createElement('div');
      card.className = 'photo-slot';
      card.dataset.slotIndex = String(i);

      card.innerHTML = `
        <div class="photo-slot-preview" data-preview="${i}">
          <span class="photo-slot-badge">Image ${i + 1}</span>
          <img alt="" hidden>
        </div>
        <div class="photo-slot-meta">
          <span class="photo-slot-name">${meta.name}</span>
          <div class="photo-slot-actions">
            <button type="button" class="photo-upload-btn" data-action="upload" data-index="${i}">Upload / Replace</button>
            <button type="button" class="photo-remove-btn" data-action="remove" data-index="${i}">Remove</button>
          </div>
        </div>
      `;

      photoSlotsGrid.appendChild(card);
    });

    // Hidden file input (single, reused)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'galleryFileInput';
    photoSlotsGrid.appendChild(fileInput);

    photoSlotsGrid.addEventListener('click', onPhotoSlotClick);
    fileInput.addEventListener('change', onPhotoFileSelected);

    GALLERY_META.forEach((_, i) => updatePhotoSlotPreview(i));
  }

  let activeUploadIndex = -1;

  function onPhotoSlotClick(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const index = Number(btn.dataset.index);
    const action = btn.dataset.action;

    if (action === 'upload') {
      const fileInput = document.getElementById('galleryFileInput');
      if (!fileInput) return;
      activeUploadIndex = index;
      fileInput.value = '';
      fileInput.click();
    } else if (action === 'remove') {
      removeSlotImage(index).catch((err) => {
        console.warn(err);
        alert('Could not remove the image. Please try again.');
      });
    }
  }

  async function onPhotoFileSelected(e) {
    const file = e.target.files && e.target.files[0];
    if (!file || activeUploadIndex < 0) return;
    const index = activeUploadIndex;
    try {
      await setSlotImage(index, file);
    } catch (err) {
      console.warn(err);
      alert(err.message || 'Could not upload the image. Please try a different photo.');
    }
  }

  function updatePhotoSlotPreview(i) {
    if (!photoSlotsGrid) return;
    const preview = photoSlotsGrid.querySelector(`[data-preview="${i}"]`);
    if (!preview) return;

    const src = getEffectiveSrc(i);
    let img = preview.querySelector('img');
    let emptyBtn = preview.querySelector('.photo-slot-empty');
    const badge = preview.querySelector('.photo-slot-badge');

    if (src) {
      if (!img) {
        img = document.createElement('img');
        img.alt = GALLERY_META[i].alt;
        preview.appendChild(img);
      }
      img.hidden = false;
      if (img.getAttribute('src') !== src) img.src = src;
      if (emptyBtn) emptyBtn.remove();
      preview.appendChild(badge);
    } else {
      if (img) img.remove();
      if (!emptyBtn) {
        emptyBtn = document.createElement('button');
        emptyBtn.type = 'button';
        emptyBtn.className = 'photo-slot-empty';
        emptyBtn.dataset.action = 'upload';
        emptyBtn.dataset.index = String(i);
        emptyBtn.innerHTML = `
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <span>Upload Photo ${i + 1}</span>
        `;
        preview.appendChild(emptyBtn);
      }
      preview.appendChild(badge);
    }

    // Remove button disabled when nothing to remove beyond default-empty
    const removeBtn = photoSlotsGrid.querySelector(`.photo-remove-btn[data-index="${i}"]`);
    if (removeBtn) {
      removeBtn.disabled = !customUrls[i] && slotState[i] !== 'default';
    }
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
      console.warn('IndexedDB unavailable, using default photos:', e);
    }
    saveGalleryState();
    for (let i = 0; i < 7; i++) applySlotToDom(i);
    buildPhotoSlots();
  }

  // --- Lightbox ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxLabel = document.getElementById('lightboxLabel');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let lightboxOpen = false;
  let lightboxSlot = 0;
  let lastFocusedElement = null;

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
      lightboxImg.classList.add('is-swapping');
      const temp = new Image();
      temp.onload = () => {
        lightboxImg.src = src;
        lightboxImg.alt = meta.alt;
        lightboxImg.classList.remove('is-swapping');
      };
      temp.onerror = () => lightboxImg.classList.remove('is-swapping');
      temp.src = src;
    }

    lightboxCounter.textContent = `${position} / ${list.length}`;
    lightboxLabel.textContent = meta.label;
  }

  function openLightbox(slotIndex) {
    if (!isSlotVisible(slotIndex)) return;
    lightboxSlot = slotIndex;
    lightboxOpen = true;
    lastFocusedElement = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    renderLightbox();
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightboxOpen = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
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

    // Swipe gestures (mobile)
    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      if (!e.changedTouches.length) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy)) {
        stepLightbox(dx < 0 ? 1 : -1);
      }
    }, { passive: true });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  // Photo manager modal controls
  if (photoManagerBtn) {
    photoManagerBtn.addEventListener('click', () => photoManagerModal.classList.remove('hidden'));
  }
  if (closePhotoManager) {
    closePhotoManager.addEventListener('click', () => photoManagerModal.classList.add('hidden'));
  }

  hydrateGallery();

  // --- Door Opening Handler ---
  function openDoorInvitation() {
    if (isPlaying || hasOpened) return;

    isPlaying = true;
    initAudioContext();

    const ytUrlInput = document.getElementById('inputYoutubeUrl');
    if (ytUrlInput && ytUrlInput.value) {
      playYouTubeBackgroundMusic(ytUrlInput.value, true);
    }

    tapOverlay.classList.add('fade-out');
    posterImg.classList.add('fade-out');
    staticCanvas.classList.remove('active');
    video.currentTime = 0;

    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Video playing to completion
      }).catch((err) => {
        console.warn('Video auto-play error fallback:', err);
        revealInvitationContent();
      });
    }
  }

  const contentScrollable = document.getElementById('contentScrollable');
  window.addEventListener('wheel', (e) => {
    if (hasOpened && contentScrollable) {
      contentScrollable.scrollTop += e.deltaY;
    }
  }, { passive: true });

  // --- Video Event Listeners ---
  video.addEventListener('timeupdate', () => {
    if (video.currentTime >= 6.0) {
      const lanternsContainer = document.getElementById('lanternsContainer');
      if (lanternsContainer) lanternsContainer.classList.add('revealed');
    }

    if (!hasOpened && (video.currentTime >= 6.0 || video.ended)) {
      revealInvitationContent();
    }
  });

  video.addEventListener('ended', () => {
    freezeFinalFrame();
    if (!hasOpened) {
      revealInvitationContent();
    }
  });

  // --- Reset & Replay ---
  function resetDoorState() {
    isPlaying = false;
    hasOpened = false;

    video.pause();
    video.currentTime = 0;

    staticCanvas.classList.remove('active');
    invitationOverlay.classList.remove('revealed');

    const lanternsContainer = document.getElementById('lanternsContainer');
    if (lanternsContainer) lanternsContainer.classList.remove('revealed');

    if (contentScrollable) contentScrollable.scrollTop = 0;

    setTimeout(() => {
      invitationOverlay.classList.add('hidden');
      posterImg.classList.remove('fade-out');
      tapOverlay.classList.remove('fade-out');
    }, 400);
  }

  // --- Door Selector Logic ---
  function switchDoorStyle(doorId) {
    if (currentDoorId === doorId) return;

    currentDoorId = doorId;
    resetDoorState();

    const posterPath = `/assets/doors/${doorId}.avif`;
    const videoPath = `/assets/doors/${doorId}.mp4`;

    posterImg.onerror = () => {
      if (!posterImg.src.endsWith('.webp')) {
        posterImg.src = `/assets/doors/${doorId}.webp`;
      }
    };
    posterImg.src = posterPath;
    videoSource.src = videoPath;
    video.load();

    document.querySelectorAll('.door-option-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.door === doorId);
    });

    doorModal.classList.add('hidden');
  }

  tapOverlay.addEventListener('click', openDoorInvitation);
  tapOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDoorInvitation();
    }
  });
  replayBtn.addEventListener('click', resetDoorState);

  // --- Door Modal Controls ---
  doorSelectBtn.addEventListener('click', () => doorModal.classList.remove('hidden'));
  closeDoorModal.addEventListener('click', () => doorModal.classList.add('hidden'));

  document.querySelectorAll('.door-option-card').forEach((card) => {
    card.addEventListener('click', () => {
      switchDoorStyle(card.dataset.door);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        switchDoorStyle(card.dataset.door);
      }
    });
  });

  // --- Details Editor Controls ---
  editDetailsBtn.addEventListener('click', () => editorModal.classList.remove('hidden'));
  closeEditorModal.addEventListener('click', () => editorModal.classList.add('hidden'));

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
    if (ytUrlInput && ytUrlInput.value) {
      playYouTubeBackgroundMusic(ytUrlInput.value, true);
    }

    editorModal.classList.add('hidden');
  });

  // --- YouTube Background Music Player Engine ---
  let currentYoutubeVideoId = '';
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
    currentYoutubeVideoId = videoId;
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
      console.warn('YouTube audio command postMessage exception:', e);
    }
  }

  // --- Audio Mute Toggle ---
  audioToggleBtn.addEventListener('click', () => {
    isAudioMuted = !isAudioMuted;
    video.muted = isAudioMuted;

    toggleYouTubeAudioMute(isAudioMuted);

    if (isAudioMuted) {
      audioIconOn.classList.add('hidden');
      audioIconOff.classList.remove('hidden');
    } else {
      audioIconOn.classList.remove('hidden');
      audioIconOff.classList.add('hidden');
      initAudioContext();
    }
  });

  // --- Map Modal Controls ---
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

  // --- Add to Google Calendar (18 October 2026, 3:00 PM IST) ---
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

  // ==========================================================================
  // IDLE PREFETCH ENGINE & SERVICE WORKER
  // ==========================================================================
  if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('Service Worker registration skipped:', err);
      });
    });
  }

  function prefetchSecondaryAssets() {
    const doorIds = ['1', '2', '3', '4', '6'];
    const prefetch = () => {
      doorIds.forEach((id) => {
        const img = new Image();
        img.src = `/assets/doors/${id}.avif`;

        const vid = document.createElement('video');
        vid.preload = 'metadata';
        vid.src = `/assets/doors/${id}.mp4`;
      });
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetch, { timeout: 3000 });
    } else {
      setTimeout(prefetch, 2000);
    }
  }

  prefetchSecondaryAssets();
});
