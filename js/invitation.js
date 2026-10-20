/**
 * Re:Connect - The 48th Alumni Reunion Mobile Invitation Script
 * Features: Photo Slider, Real-time Countdown, Canvas Sakura Effect, Web Audio BGM, RSVP
 */

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. [사진 섹션] Smooth Photo Carousel Slider with Touch Swipe & Auto-play
  // =========================================================================
  const sliderTrack = document.getElementById('sliderTrack');
  const slides = document.querySelectorAll('.slider-slide');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const dotBtns = document.querySelectorAll('.dot-btn');
  const slideCounter = document.getElementById('slideCounter');
  const sliderContainer = document.getElementById('photoSlider');

  let currentSlide = 0;
  const totalSlides = slides.length;
  let autoPlayTimer = null;

  function updateSlider(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    sliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update Dots
    dotBtns.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });

    // Update Counter
    if (slideCounter) {
      slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;
    }
  }

  function nextSlide() {
    updateSlider(currentSlide + 1);
  }

  function prevSlide() {
    updateSlider(currentSlide - 1);
  }

  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoPlay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoPlay();
  });

  dotBtns.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = parseInt(dot.getAttribute('data-slide'), 10);
      updateSlider(target);
      resetAutoPlay();
    });
  });

  // Touch Swipe Support (Essential for Smartphone usage)
  let touchStartX = 0;
  let touchEndX = 0;

  sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoPlay();
    }
  }

  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, 3800);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  // Pause on hover
  sliderContainer.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
  sliderContainer.addEventListener('mouseleave', () => startAutoPlay());

  startAutoPlay();

  // =========================================================================
  // 2. [카운트다운 섹션] Real-Time Countdown to 2032.10.1 17:00:00 (창경궁)
  // =========================================================================
  // Target: 2032-10-01 17:00:00 KST (Korea Standard Time)
  const targetDate = new Date('2032-10-01T17:00:00+09:00').getTime();

  const cdDays = document.getElementById('cdDays');
  const cdHours = document.getElementById('cdHours');
  const cdMinutes = document.getElementById('cdMinutes');
  const cdSeconds = document.getElementById('cdSeconds');
  const dDayBadge = document.getElementById('dDayBadge');

  let lastValues = { days: '', hours: '', minutes: '', seconds: '' };

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      if (dDayBadge) dDayBadge.textContent = 'D-DAY (행사 당일입니다!)';
      cdDays.textContent = '00';
      cdHours.textContent = '00';
      cdMinutes.textContent = '00';
      cdSeconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const strDays = String(days);
    const strHours = String(hours).padStart(2, '0');
    const strMinutes = String(minutes).padStart(2, '0');
    const strSeconds = String(seconds).padStart(2, '0');

    // D-Day Badge Text
    if (dDayBadge) {
      dDayBadge.textContent = `D - ${days.toLocaleString()}일`;
    }

    // Apply smooth pulse on change
    setCountdownValue(cdDays, strDays, 'days');
    setCountdownValue(cdHours, strHours, 'hours');
    setCountdownValue(cdMinutes, strMinutes, 'minutes');
    setCountdownValue(cdSeconds, strSeconds, 'seconds');
  }

  function setCountdownValue(element, newVal, key) {
    if (element && lastValues[key] !== newVal) {
      element.textContent = newVal;
      element.classList.remove('pulse');
      void element.offsetWidth; // Reflow
      element.classList.add('pulse');
      lastValues[key] = newVal;
    }
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // =========================================================================
  // 3. [지도 섹션] Copy Address & Actions
  // =========================================================================
  const btnCopyAddress = document.getElementById('btnCopyAddress');
  const placeAddress = '서울특별시 종로구 창경궁로 185';

  if (btnCopyAddress) {
    btnCopyAddress.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(placeAddress)
          .then(() => showToast('창경궁 주소가 복사되었습니다! 📋'))
          .catch(() => fallbackCopy(placeAddress));
      } else {
        fallbackCopy(placeAddress);
      }
    });
  }

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('창경궁 주소가 복사되었습니다! 📋');
  }

  // =========================================================================
  // 4. Background Falling Sakura Petals (Canvas Particle System)
  // =========================================================================
  const canvas = document.getElementById('petalCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const petalCount = 32;
    const petals = [];

    class Petal {
      constructor() {
        this.reset(true);
      }
      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : -20;
        this.isGold = Math.random() > 0.45; // 55% champagne gold, 45% soft sakura
        this.size = this.isGold ? Math.random() * 6 + 4 : Math.random() * 8 + 6;
        this.speedY = Math.random() * 0.85 + 0.55;
        this.speedX = Math.random() * 0.5 - 0.15;
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = Math.random() * 0.02 - 0.01;
        this.opacity = Math.random() * 0.45 + 0.35;
        this.flip = Math.random();
        this.flipSpeed = Math.random() * 0.03 + 0.01;
      }
      update() {
        this.y += this.speedY;
        this.x += Math.sin(this.angle) * 0.8 + this.speedX;
        this.angle += this.angularSpeed;
        this.flip += this.flipSpeed;

        if (this.y > height + 20 || this.x > width + 20 || this.x < -20) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.scale(Math.cos(this.flip), 1);
        ctx.beginPath();
        if (this.isGold) {
          ctx.fillStyle = `rgba(223, 194, 153, ${this.opacity})`;
          ctx.shadowColor = 'rgba(197, 168, 128, 0.4)';
          ctx.shadowBlur = 4;
        } else {
          ctx.fillStyle = `rgba(255, 192, 203, ${this.opacity * 0.85})`;
        }
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < petalCount; i++) {
      petals.push(new Petal());
    }

    function animatePetals() {
      ctx.clearRect(0, 0, width, height);
      for (let p of petals) {
        p.update();
        p.draw();
      }
      requestAnimationFrame(animatePetals);
    }
    animatePetals();
  }

  // =========================================================================
  // 5. Emotional Acoustic Web Audio BGM Synthesizer (Zero External File Dep)
  // =========================================================================
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  let audioCtx = null;
  let isPlayingBgm = false;
  let bgmLoopTimer = null;

  // Gentle pentatonic harp / acoustic piano arpeggio notes (C major scale)
  const melodyNotes = [
    261.63, 329.63, 392.00, 523.25, // C4, E4, G4, C5
    440.00, 392.00, 329.63, 261.63, // A4, G4, E4, C4
    293.66, 349.23, 440.00, 523.25, // D4, F4, A4, C5
    392.00, 329.63, 293.66, 261.63  // G4, E4, D4, C4
  ];
  let noteIndex = 0;

  function playGentleNote(freq, time) {
    if (!audioCtx || !isPlayingBgm) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Warm envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.06, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 1.25);
  }

  function startBgmPlayback() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isPlayingBgm = true;
    bgmToggleBtn.classList.add('playing');

    const interval = 480; // ms between gentle notes
    bgmLoopTimer = setInterval(() => {
      if (!isPlayingBgm) return;
      const freq = melodyNotes[noteIndex % melodyNotes.length];
      playGentleNote(freq, audioCtx.currentTime);
      noteIndex++;
    }, interval);

    showToast('배경음악이 재생됩니다 🎵');
  }

  function stopBgmPlayback() {
    isPlayingBgm = false;
    bgmToggleBtn.classList.remove('playing');
    if (bgmLoopTimer) clearInterval(bgmLoopTimer);
    showToast('배경음악이 정지되었습니다.');
  }

  bgmToggleBtn.addEventListener('click', () => {
    if (isPlayingBgm) {
      stopBgmPlayback();
    } else {
      startBgmPlayback();
    }
  });

  // =========================================================================
  // 6. RSVP Form Submission
  // =========================================================================
  const rsvpForm = document.getElementById('rsvpForm');
  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rsvpName').value.trim();
      const attendance = document.querySelector('input[name="attendance"]:checked').value;

      if (!name) {
        showToast('이름을 입력해주세요.');
        return;
      }

      showToast(`${name}님의 소중한 응답(${attendance})이 접수되었습니다! ✨`);
      document.getElementById('rsvpName').value = '';
      const noteInput = document.getElementById('rsvpNote');
      if (noteInput) noteInput.value = '';
    });
  }

  // =========================================================================
  // 7. Share Invitation Link
  // =========================================================================
  const btnShareLink = document.getElementById('btnShareLink');
  if (btnShareLink) {
    btnShareLink.addEventListener('click', () => {
      const shareData = {
        title: 'Re:Connect - 제48회 동창회 초대장',
        text: '세월이 흘러도 변하지 않는 우리들의 이야기, Re:Connect에 초대합니다.',
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData).catch(() => {});
      } else {
        fallbackCopy(window.location.href);
        showToast('초대장 링크가 복사되었습니다! 친구들에게 공유해보세요.');
      }
    });
  }

  // =========================================================================
  // Toast Popup Helper
  // =========================================================================
  const toastPopup = document.getElementById('toastPopup');
  const toastText = document.getElementById('toastText');
  let toastTimer = null;

  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastText.textContent = msg;
    toastPopup.classList.add('active');

    toastTimer = setTimeout(() => {
      toastPopup.classList.remove('active');
    }, 2800);
  }

});
