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
  const heroSection = document.querySelector('.hero');
  const media = document.getElementById('heroMedia');
  const dotsWrap = document.getElementById('heroDots');
  if (!heroSection || !media || !dotsWrap) return;

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

  heroSection.addEventListener('mouseenter', stop);
  heroSection.addEventListener('mouseleave', start);
  heroSection.addEventListener('focusin', stop);
  heroSection.addEventListener('focusout', (event) => {
    if (!heroSection.contains(event.relatedTarget)) start();
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
