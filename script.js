// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Mock enquiry form submission (no backend on this mockup)
const enquiryForm = document.getElementById('enquiryForm');
const formStatus = document.getElementById('formStatus');

if (enquiryForm && formStatus) {
  enquiryForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!enquiryForm.checkValidity()) {
      enquiryForm.reportValidity();
      return;
    }

    formStatus.textContent = "Thanks — your enquiry has been received. Josh or Lee will be in touch shortly.";
    formStatus.classList.add('visible', 'success');
    enquiryForm.reset();
  });
}

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Hero image carousel — cross-fades every ~5.5s, pauses on hover/focus,
// and stays on a single static slide when the visitor prefers reduced motion.
(function heroCarousel() {
  const mediaPanel = document.querySelector('.hero-media-panel');
  const media = document.getElementById('heroMedia');
  const dotsWrap = document.getElementById('heroDots');
  if (!mediaPanel || !media || !dotsWrap) return;

  const slides = Array.from(media.querySelectorAll('.hero-slide'));
  const dots = Array.from(dotsWrap.querySelectorAll('.hero-dot'));
  if (slides.length < 2) return;

  const INTERVAL_MS = 5500;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0;
  let timerId = null;

  function goTo(nextIndex) {
    slides[index].classList.remove('is-active');
    dots[index].classList.remove('is-active');
    dots[index].setAttribute('aria-selected', 'false');

    index = (nextIndex + slides.length) % slides.length;

    slides[index].classList.add('is-active');
    dots[index].classList.add('is-active');
    dots[index].setAttribute('aria-selected', 'true');
  }

  function start() {
    if (reducedMotion.matches || timerId) return;
    timerId = window.setInterval(() => goTo(index + 1), INTERVAL_MS);
  }

  function stop() {
    if (timerId) {
      window.clearInterval(timerId);
      timerId = null;
    }
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goTo(i);
      stop();
      start();
    });
  });

  mediaPanel.addEventListener('mouseenter', stop);
  mediaPanel.addEventListener('mouseleave', start);
  mediaPanel.addEventListener('focusin', stop);
  mediaPanel.addEventListener('focusout', (event) => {
    if (!mediaPanel.contains(event.relatedTarget)) start();
  });

  if (reducedMotion.matches) {
    dotsWrap.style.display = 'none';
  } else {
    start();
  }

  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) {
      stop();
      dotsWrap.style.display = 'none';
    } else {
      dotsWrap.style.display = '';
      start();
    }
  });
})();

// Gallery lightbox — click a Featured Work photo to open it full-size with
// its caption, arrow/swipe navigation between all 6, Escape/backdrop/close
// to dismiss, and focus trapped inside while open.
(function galleryLightbox() {
  const workItems = Array.from(document.querySelectorAll('.work-item'));
  const lightbox = document.getElementById('lightbox');
  if (!workItems.length || !lightbox) return;

  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  const items = workItems.map((btn) => {
    const img = btn.querySelector('img');
    const caption = btn.querySelector('.work-caption');
    return { src: img.src, alt: img.alt, caption: caption ? caption.textContent : '' };
  });

  let currentIndex = 0;
  let lastFocused = null;

  function render() {
    const item = items[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.caption;
  }

  function getFocusable() {
    return [closeBtn, prevBtn, nextBtn];
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === 'ArrowRight') {
      show(currentIndex + 1);
      return;
    }
    if (event.key === 'ArrowLeft') {
      show(currentIndex - 1);
      return;
    }
    if (event.key === 'Tab') {
      const focusable = getFocusable();
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
  }

  function open(index) {
    currentIndex = index;
    lastFocused = document.activeElement;
    render();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    closeBtn.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function show(index) {
    currentIndex = (index + items.length) % items.length;
    render();
  }

  workItems.forEach((btn, i) => {
    btn.addEventListener('click', () => open(i));
  });

  closeBtn.addEventListener('click', close);
  nextBtn.addEventListener('click', () => show(currentIndex + 1));
  prevBtn.addEventListener('click', () => show(currentIndex - 1));

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) close();
  });

  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  lightbox.addEventListener('touchend', (event) => {
    const dx = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      show(dx < 0 ? currentIndex + 1 : currentIndex - 1);
    }
  }, { passive: true });
})();

// Active nav state — highlights Home/About/Gallery/Contact as each section
// scrolls through the middle of the viewport, via IntersectionObserver
// (no scroll-listener) so it stays cheap.
(function activeNavState() {
  const navLinks = Array.from(document.querySelectorAll('.main-nav a'));
  if (!navLinks.length) return;

  const sectionIds = navLinks
    .map((link) => link.getAttribute('href'))
    .filter((href) => href && href.startsWith('#'))
    .map((href) => href.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  if (!sections.length) return;

  function setActive(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
    });
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach((section) => sectionObserver.observe(section));
})();

// Restrained scroll-reveal — a soft rise + fade for the About rows,
// testimonial cards and featured-work items as they enter view, staggered
// slightly within each group, once only. Skipped under reduced motion.
(function scrollReveal() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  const groups = [
    document.querySelectorAll('.editorial-row.reveal'),
    document.querySelectorAll('.testimonial.reveal'),
    document.querySelectorAll('.work-item.reveal'),
  ];

  // threshold:0 fires as soon as any part enters — a percentage threshold
  // (e.g. 0.15) never fires for elements taller than the viewport, which
  // the editorial rows can be. rootMargin holds it back slightly so it
  // doesn't trigger the instant a single pixel appears at the bottom edge.
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

  groups.forEach((group) => {
    group.forEach((el, i) => {
      el.style.transitionDelay = (i * 90) + 'ms';
      observer.observe(el);
    });
  });
})();
