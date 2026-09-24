/* ==========================================================================
   ROYAL INDIAN WEDDING (TILAK) INVITATION — BULLETPROOF LOGIC & AUDIO ENGINE
   Richa Dwivedi & Akash Shukla — Pure English Ultra-Luxury Edition
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Media & Canvas Elements
  const video = document.getElementById('doorVideo');
  const staticCanvas = document.getElementById('staticFrameCanvas');
  const canvasCtx = staticCanvas ? staticCanvas.getContext('2d') : null;

  const tapOverlay = document.getElementById('tapOverlay');
  const invitationOverlay = document.getElementById('invitationOverlay');
  const lanternsContainer = document.getElementById('lanternsContainer');
  const contentScrollable = document.getElementById('contentScrollable');
  const mediaStage = document.getElementById('mediaStage');

  // Top Controls & Buttons
  const flowerShowerBtn = document.getElementById('flowerShowerBtn');
  const replayBtn = document.getElementById('replayBtn');
  const whatsappRsvpBtn = document.getElementById('whatsappRsvpBtn');
  const addToCalendarBtn = document.getElementById('addToCalendarBtn');
  const openMapBtn = document.getElementById('openMapBtn');
  const mapModal = document.getElementById('mapModal');
  const closeMapModal = document.getElementById('closeMapModal');
  const interactiveDiya = document.getElementById('interactiveDiya');
  const diyaHintText = document.getElementById('diyaHintText');

  let isPlaying = false;
  let hasOpened = false;
  let autoRevealTimeout = null;

  // ==========================================================================
  // EVENT CONSTANTS
  // ==========================================================================
  const EVENT = {
    countdownTarget: new Date('2026-10-18T15:00:00').getTime(),
    calendarStart: '20261018T093000Z', // 3:00 PM IST
    calendarEnd: '20261018T143000Z',
  };

  // ==========================================================================
  // INTERACTIVE AUSPICIOUS DIYA LIGHTING
  // ==========================================================================
  if (interactiveDiya) {
    interactiveDiya.addEventListener('click', () => {
      interactiveDiya.classList.remove('diya-lit');
      void interactiveDiya.offsetWidth;
      interactiveDiya.classList.add('diya-lit');

      triggerPushpaVrishti();

      if (diyaHintText) {
        diyaHintText.textContent = 'Divine Light Ignited with Eternal Blessings ✦';
      }
    });

    interactiveDiya.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        interactiveDiya.click();
      }
    });
  }

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
    try {
      if (video && video.videoWidth && video.videoHeight && staticCanvas && canvasCtx) {
        staticCanvas.width = video.videoWidth;
        staticCanvas.height = video.videoHeight;
        canvasCtx.drawImage(video, 0, 0, staticCanvas.width, staticCanvas.height);
        staticCanvas.classList.add('active');
        video.pause();
      }
    } catch (e) {
      console.warn('Canvas freeze notice:', e);
    }
  }

  function revealInvitationContent() {
    if (autoRevealTimeout) {
      clearTimeout(autoRevealTimeout);
      autoRevealTimeout = null;
    }

    freezeFinalFrame();
    hasOpened = true;
    isPlaying = false;

    if (lanternsContainer) lanternsContainer.classList.add('revealed');
    if (invitationOverlay) {
      invitationOverlay.classList.remove('hidden');
      void invitationOverlay.offsetWidth;
      invitationOverlay.classList.add('revealed');
    }

    setTimeout(() => {
      initScratchCanvas();
      triggerPushpaVrishti();
    }, 150);
  }

  // ==========================================================================
  // DOOR OPENING SEQUENCE
  // ==========================================================================
  function openDoorInvitation() {
    if (isPlaying || hasOpened) return;

    isPlaying = true;

    if (tapOverlay) tapOverlay.classList.add('fade-out');
    if (staticCanvas) staticCanvas.classList.remove('active');

    // Guaranteed fallback: If video stalls or fails, reveal card within 5.5s
    autoRevealTimeout = setTimeout(() => {
      if (!hasOpened) {
        revealInvitationContent();
      }
    }, 5500);

    if (video) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          // Playing video
        }).catch((err) => {
          console.warn('Video playback fallback:', err);
          revealInvitationContent();
        });
      }
    } else {
      revealInvitationContent();
    }
  }

  if (tapOverlay) {
    tapOverlay.addEventListener('click', openDoorInvitation);
    tapOverlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDoorInvitation();
      }
    });
  }

  if (video) {
    video.addEventListener('timeupdate', () => {
      // Mid-way threshold transition (doors open fully around 4.8 - 5.5s)
      if (video.currentTime >= 4.8) {
        if (lanternsContainer) lanternsContainer.classList.add('revealed');
      }
      if (!hasOpened && (video.currentTime >= 5.2 || video.ended)) {
        revealInvitationContent();
      }
    });

    video.addEventListener('ended', () => {
      freezeFinalFrame();
      if (!hasOpened) {
        revealInvitationContent();
      }
    });

    video.addEventListener('error', () => {
      console.warn('Video element error event');
      revealInvitationContent();
    });
  }

  // Stage tap backup: If user taps media stage while video is playing, fast forward to invitation
  if (mediaStage) {
    mediaStage.addEventListener('click', () => {
      if (isPlaying && !hasOpened) {
        revealInvitationContent();
      }
    });
  }

  // Reset & Replay
  function resetDoorState() {
    if (autoRevealTimeout) {
      clearTimeout(autoRevealTimeout);
      autoRevealTimeout = null;
    }

    isPlaying = false;
    hasOpened = false;

    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    if (staticCanvas) staticCanvas.classList.remove('active');
    if (invitationOverlay) {
      invitationOverlay.classList.remove('revealed');
      invitationOverlay.classList.add('hidden');
    }

    if (lanternsContainer) lanternsContainer.classList.remove('revealed');
    if (contentScrollable) contentScrollable.scrollTop = 0;

    setTimeout(() => {
      if (tapOverlay) tapOverlay.classList.remove('fade-out');
    }, 400);
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', resetDoorState);
  }

  // ==========================================================================
  // SHIMMERING GOLD FOIL SCRATCH CARD ENGINE (RETINA HIGH-DPI SCALED)
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

    try {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.max(280, rect.width || 340);
      const h = Math.max(110, rect.height || 140);

      scratchCanvas.width = w * dpr;
      scratchCanvas.height = h * dpr;
      scratchCanvas.style.width = `${w}px`;
      scratchCanvas.style.height = `${h}px`;

      scratchCtx.scale(dpr, dpr);

      const grad = scratchCtx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#ECC868');
      grad.addColorStop(0.28, '#FFF4CE');
      grad.addColorStop(0.55, '#D4AF37');
      grad.addColorStop(1, '#996515');

      scratchCtx.fillStyle = grad;
      scratchCtx.fillRect(0, 0, w, h);

      // Golden sparkles overlay
      scratchCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 160; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 2.2 + 0.5;
        scratchCtx.beginPath();
        scratchCtx.arc(x, y, r, 0, Math.PI * 2);
        scratchCtx.fill();
      }

      scratchCtx.font = '700 12px "Cinzel", serif';
      scratchCtx.fillStyle = 'rgba(74, 14, 28, 0.9)';
      scratchCtx.textAlign = 'center';
      scratchCtx.fillText('✦ SCRATCH GOLD FOIL TO REVEAL DATE ✦', w / 2, h / 2 + 4);
    } catch (e) {
      console.warn('Scratch canvas init notice:', e);
    }
  }

  function scratchAt(x, y) {
    if (!scratchCtx || hasScratchedCleared) return;

    try {
      scratchCtx.globalCompositeOperation = 'destination-out';
      scratchCtx.beginPath();
      scratchCtx.arc(x, y, 28, 0, Math.PI * 2);
      scratchCtx.fill();

      dragCount++;
      if (dragCount % 6 === 0) {
        checkScratchPercentage();
      }
    } catch (e) {
      console.warn('Scratch draw notice:', e);
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

    try {
      const w = scratchCanvas.width;
      const h = scratchCanvas.height;
      if (!w || !h) return;

      const imgData = scratchCtx.getImageData(0, 0, w, h);
      const pixels = imgData.data;
      let transparentCount = 0;

      for (let i = 3; i < pixels.length; i += 32) {
        if (pixels[i] === 0) {
          transparentCount++;
        }
      }

      const totalSampled = pixels.length / 32;
      const ratio = transparentCount / totalSampled;

      if (ratio > 0.28) {
        revealDateFully();
      }
    } catch (e) {
      console.warn('Scratch percentage check notice:', e);
    }
  }

  function revealDateFully() {
    if (hasScratchedCleared) return;
    hasScratchedCleared = true;

    if (scratchCanvas) scratchCanvas.classList.add('fade-out');
    if (scratchHint) scratchHint.style.opacity = '0';
    if (quickRevealBtn) quickRevealBtn.style.display = 'none';

    triggerPushpaVrishti();
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
  // PUSHPA VRISHTI (ROSE & MARIGOLD PETAL SHOWER PHYSICS ENGINE)
  // ==========================================================================
  const confettiCanvas = document.getElementById('confettiCanvas');
  let confettiCtx = null;
  let petals = [];
  let petalAnimationId = null;

  function triggerPushpaVrishti() {
    if (!confettiCanvas) return;
    confettiCtx = confettiCanvas.getContext('2d');

    const container = document.getElementById('invitationOverlay');
    const w = container ? container.offsetWidth : window.innerWidth;
    const h = container ? container.offsetHeight : window.innerHeight;

    confettiCanvas.width = w;
    confettiCanvas.height = h;

    const petalColors = [
      { fill: '#D11D45', border: '#8A0E2A', type: 'rose' },
      { fill: '#FF5C77', border: '#C01A3E', type: 'rose' },
      { fill: '#FFB800', border: '#D48800', type: 'marigold' },
      { fill: '#FF8A00', border: '#C95500', type: 'marigold' },
      { fill: '#FBF2C0', border: '#D4AF37', type: 'gold-foil' },
    ];

    petals = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const pColor = petalColors[Math.floor(Math.random() * petalColors.length)];
      petals.push({
        x: Math.random() * w,
        y: Math.random() * -h * 0.4,
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2.5,
        size: Math.random() * 10 + 8,
        color: pColor.fill,
        borderColor: pColor.border,
        type: pColor.type,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4,
        swaySpeed: Math.random() * 0.05 + 0.02,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 1,
      });
    }

    if (petalAnimationId) cancelAnimationFrame(petalAnimationId);
    animatePetals();
  }

  function animatePetals() {
    if (!confettiCtx) return;
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    let activeCount = 0;

    petals.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * p.swaySpeed + p.swayOffset) * 1.5;
      p.rotation += p.rotationSpeed;

      if (p.y > confettiCanvas.height * 0.65) {
        p.opacity -= 0.012;
      }

      if (p.opacity > 0 && p.y < confettiCanvas.height + 20) {
        activeCount++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = Math.max(0, p.opacity);

        if (p.type === 'rose' || p.type === 'marigold') {
          // Curved natural petal shape
          confettiCtx.beginPath();
          confettiCtx.ellipse(0, 0, p.size * 0.5, p.size * 0.8, 0, 0, Math.PI * 2);
          confettiCtx.fillStyle = p.color;
          confettiCtx.fill();
          confettiCtx.lineWidth = 0.5;
          confettiCtx.strokeStyle = p.borderColor;
          confettiCtx.stroke();
        } else {
          // Gilded square foil
          confettiCtx.fillStyle = p.color;
          confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        confettiCtx.restore();
      }
    });

    if (activeCount > 0) {
      petalAnimationId = requestAnimationFrame(animatePetals);
    } else {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  if (flowerShowerBtn) {
    flowerShowerBtn.addEventListener('click', triggerPushpaVrishti);
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
  // FULLSCREEN PHOTO LIGHTBOX
  // ==========================================================================
  const GALLERY_PHOTOS = [
    { src: '/assets/gallery/photo-1.webp', label: 'Richa & Akash' },
    { src: '/assets/gallery/photo-2.webp', label: 'Richa' },
    { src: '/assets/gallery/photo-3.webp', label: 'Akash' },
    { src: '/assets/gallery/photo-4.webp', label: 'Together' },
    { src: '/assets/gallery/photo-5.webp', label: 'Forever' },
    { src: '/assets/gallery/photo-6.webp', label: 'Love' },
    { src: '/assets/gallery/photo-7.webp', label: 'Always' },
  ];

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxLabel = document.getElementById('lightboxLabel');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let lightboxOpen = false;
  let currentPhotoIndex = 0;

  function renderLightbox() {
    const photo = GALLERY_PHOTOS[currentPhotoIndex];
    if (photo && lightboxImg) {
      lightboxImg.src = photo.src;
      lightboxCounter.textContent = `${currentPhotoIndex + 1} / ${GALLERY_PHOTOS.length}`;
      lightboxLabel.textContent = photo.label;
    }
  }

  function openLightbox(index) {
    currentPhotoIndex = index % GALLERY_PHOTOS.length;
    lightboxOpen = true;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    renderLightbox();
  }

  function closeLightbox() {
    lightboxOpen = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    if (lightboxImg) lightboxImg.src = '';
  }

  function stepLightbox(direction) {
    currentPhotoIndex = (currentPhotoIndex + direction + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length;
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

  // ==========================================================================
  // QUICK BLESSINGS & WHATSAPP RSVP DISPATCH (PURE ENGLISH)
  // ==========================================================================
  let selectedBlessingText = 'Heartiest Congratulations to Richa & Akash! 💐 Wishing you eternal love, happiness and prosperity on your Tilak ceremony.';

  const blessingChips = document.querySelectorAll('.blessing-chip');
  blessingChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      blessingChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      if (chip.dataset.blessing) {
        selectedBlessingText = chip.dataset.blessing;
      }
    });
  });

  if (whatsappRsvpBtn) {
    whatsappRsvpBtn.addEventListener('click', () => {
      const waNumber = '919876543210';
      const message = encodeURIComponent(`💐 Royal Tilak & Engagement Wishes 💐\n\n${selectedBlessingText}\n\n— Sent from Digital Invitation for Richa Dwivedi & Akash Shukla (Sunday, 18 October 2026) ✨🪔`);
      const waUrl = `https://wa.me/${waNumber}?text=${message}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // MAP MODAL & CALENDAR INTEGRATION
  // ==========================================================================
  if (openMapBtn) {
    openMapBtn.addEventListener('click', () => {
      if (mapModal) mapModal.classList.remove('hidden');
    });
  }
  if (closeMapModal) {
    closeMapModal.addEventListener('click', () => {
      if (mapModal) mapModal.classList.add('hidden');
    });
  }
  if (mapModal) {
    mapModal.addEventListener('click', (e) => {
      if (e.target === mapModal) mapModal.classList.add('hidden');
    });
  }

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      const title = encodeURIComponent('Royal Engagement (Tilak) of Richa Dwivedi & Akash Shukla');
      const details = encodeURIComponent('With the blessings of our families — join us for the Royal Engagement (Tilak) ceremony of Richa Dwivedi and Akash Shukla.');
      const loc = encodeURIComponent('Yamuna Velly, Near Aliyapur Toll Plaza');
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=${EVENT.calendarStart}/${EVENT.calendarEnd}`;
      window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // ==========================================================================
  // PREMIUM SCHEDULE CAROUSEL — Swipe · Drag · Arrow · Dot
  // ==========================================================================
  const scheduleTrack    = document.getElementById('scheduleTrack');
  const scPrevBtn        = document.getElementById('scPrev');
  const scNextBtn        = document.getElementById('scNext');
  const scProgressFill   = document.getElementById('scProgressFill');
  const scDotBtns        = document.querySelectorAll('.sc-dot');
  const scheduleCards    = document.querySelectorAll('.schedule-card');
  const SC_TOTAL         = scheduleCards.length; // 4

  let scCurrent  = 0;
  let scDragStartX = 0;
  let scDragCurrentX = 0;
  let scIsDragging = false;
  let scHasMoved   = false;

  function scGoTo(index) {
    scCurrent = Math.max(0, Math.min(index, SC_TOTAL - 1));

    // Slide track
    if (scheduleTrack) {
      scheduleTrack.style.transform = `translateX(-${scCurrent * 100}%)`;
    }

    // Progress bar: (current+1)/total * 100
    if (scProgressFill) {
      scProgressFill.style.width = `${((scCurrent + 1) / SC_TOTAL) * 100}%`;
    }

    // Dots
    scDotBtns.forEach((dot, i) => {
      dot.classList.toggle('active', i === scCurrent);
    });

    // Arrow disabled state
    if (scPrevBtn) scPrevBtn.disabled = scCurrent === 0;
    if (scNextBtn) scNextBtn.disabled = scCurrent === SC_TOTAL - 1;
  }

  // Initialise
  scGoTo(0);

  // Arrow buttons
  if (scPrevBtn) scPrevBtn.addEventListener('click', () => scGoTo(scCurrent - 1));
  if (scNextBtn) scNextBtn.addEventListener('click', () => scGoTo(scCurrent + 1));

  // Dot buttons
  scDotBtns.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = Number(dot.dataset.goto);
      if (!isNaN(target)) scGoTo(target);
    });
  });

  // ── Touch/Swipe ──
  if (scheduleTrack) {
    scheduleTrack.addEventListener('touchstart', (e) => {
      scDragStartX = e.touches[0].clientX;
      scIsDragging = true;
      scHasMoved = false;
    }, { passive: true });

    scheduleTrack.addEventListener('touchmove', (e) => {
      if (!scIsDragging) return;
      scDragCurrentX = e.touches[0].clientX;
      const diff = scDragCurrentX - scDragStartX;
      if (Math.abs(diff) > 8) {
        scHasMoved = true;
        // Live drag feedback (clamped)
        const baseOffset = -(scCurrent * 100);
        const dragPercent = (diff / scheduleTrack.offsetWidth) * 100;
        const clampedDrag = Math.max(-30, Math.min(30, dragPercent));
        scheduleTrack.style.transition = 'none';
        scheduleTrack.style.transform = `translateX(calc(${baseOffset}% + ${clampedDrag}%))`;
      }
    }, { passive: true });

    scheduleTrack.addEventListener('touchend', () => {
      scheduleTrack.style.transition = '';
      if (!scIsDragging || !scHasMoved) { scIsDragging = false; return; }
      const diff = scDragCurrentX - scDragStartX;
      const threshold = scheduleTrack.offsetWidth * 0.22;
      if (diff < -threshold) scGoTo(scCurrent + 1);
      else if (diff > threshold) scGoTo(scCurrent - 1);
      else scGoTo(scCurrent); // snap back
      scIsDragging = false;
    });

    // ── Mouse drag ──
    scheduleTrack.addEventListener('mousedown', (e) => {
      scDragStartX = e.clientX;
      scIsDragging = true;
      scHasMoved = false;
      scheduleTrack.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
      if (!scIsDragging) return;
      scDragCurrentX = e.clientX;
      const diff = scDragCurrentX - scDragStartX;
      if (Math.abs(diff) > 6) {
        scHasMoved = true;
        const baseOffset = -(scCurrent * 100);
        const dragPercent = (diff / scheduleTrack.offsetWidth) * 100;
        const clampedDrag = Math.max(-30, Math.min(30, dragPercent));
        scheduleTrack.style.transition = 'none';
        scheduleTrack.style.transform = `translateX(calc(${baseOffset}% + ${clampedDrag}%))`;
      }
    });

    document.addEventListener('mouseup', () => {
      if (!scIsDragging) return;
      scheduleTrack.style.transition = '';
      scheduleTrack.style.cursor = '';
      if (scHasMoved) {
        const diff = scDragCurrentX - scDragStartX;
        const threshold = scheduleTrack.offsetWidth * 0.22;
        if (diff < -threshold) scGoTo(scCurrent + 1);
        else if (diff > threshold) scGoTo(scCurrent - 1);
        else scGoTo(scCurrent);
      }
      scIsDragging = false;
    });
  }

  // Keyboard arrow support within the carousel when focused
  document.addEventListener('keydown', (e) => {
    if (lightboxOpen) return; // already handled by lightbox
    const section = document.getElementById('itinerarySection');
    if (!section) return;
    if (e.key === 'ArrowLeft')  scGoTo(scCurrent - 1);
    if (e.key === 'ArrowRight') scGoTo(scCurrent + 1);
  });
});

