(function () {
  'use strict';

  var CONTACT_EMAIL = 'info@samilplus.vn';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.querySelector('.menu-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  function closeMenu() {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', function () {
    var open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  mobileMenu.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeMenu);
  });
  window.matchMedia('(max-width: 760px)').addEventListener('change', closeMenu);

  /* ---------- Contact modal ---------- */
  var contactModal = document.getElementById('contact-modal');
  var copyBtn = contactModal.querySelector('.btn-copy');
  var copyTimer = null;

  function openContact(e) {
    e.preventDefault();
    copyBtn.textContent = 'Copy';
    contactModal.hidden = false;
  }
  function closeContact() { contactModal.hidden = true; }

  document.querySelectorAll('[data-open-contact]').forEach(function (el) {
    el.addEventListener('click', openContact);
  });
  contactModal.querySelector('.contact-close').addEventListener('click', closeContact);
  contactModal.addEventListener('click', function (e) {
    if (e.target === contactModal) closeContact();
  });

  copyBtn.addEventListener('click', function () {
    var done = function () {
      copyBtn.textContent = 'Copied!';
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(function () { copyBtn.textContent = 'Copy'; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(done, done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = CONTACT_EMAIL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  });

  /* ---------- Video modal ---------- */
  var videoModal = document.getElementById('video-modal');
  var videoTitle = videoModal.querySelector('.video-title');
  var videoIframe = videoModal.querySelector('iframe');
  var videoDriveLink = videoModal.querySelector('.video-drive-link');

  function closeVideo() {
    videoModal.hidden = true;
    videoIframe.src = '';
  }

  document.querySelectorAll('.btn-tour').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-video');
      videoTitle.textContent = btn.getAttribute('data-name') + ' · Factory Tour';
      videoIframe.src = 'https://drive.google.com/file/d/' + id + '/preview';
      videoDriveLink.href = 'https://drive.google.com/file/d/' + id + '/view';
      videoModal.hidden = false;
    });
  });
  videoModal.querySelector('.video-close').addEventListener('click', closeVideo);
  videoModal.addEventListener('click', function (e) {
    if (e.target === videoModal) closeVideo();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeContact();
      closeVideo();
    }
  });

  /* ---------- Catalog request form ---------- */
  var reqCompany = document.getElementById('req-company');
  var reqEmail = document.getElementById('req-email');
  var reqNote = document.querySelector('.catalog-form-note');

  function setNote(text, isError) {
    reqNote.textContent = text;
    reqNote.classList.toggle('is-error', Boolean(isError));
  }

  function requestCatalog() {
    var company = reqCompany.value.trim();
    var email = reqEmail.value.trim();
    if (!company) {
      setNote('Please enter your company name.', true);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNote('Please enter a valid email address.', true);
      return;
    }
    var subject = encodeURIComponent('Catalog Request - ' + company);
    var body = encodeURIComponent(
      'Hello SAMIL PLUS,\n\nI would like to request your apparel catalog.\n\nCompany: ' + company +
      '\nEmail: ' + email + '\n\nThank you.'
    );
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
    setNote("Your mail app should open — just hit send. Or email us directly at " + CONTACT_EMAIL, false);
  }

  document.querySelector('.btn-request').addEventListener('click', requestCatalog);
  [reqCompany, reqEmail].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') requestCatalog();
    });
    input.addEventListener('input', function () { setNote('', false); });
  });

  /* ---------- Hero background video ---------- */
  var heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    heroVideo.muted = true;
    var p = heroVideo.play();
    if (p && p.catch) p.catch(function () {});
  }

  /* ---------- Scroll reveal, donut fill, hero word entrance ---------- */
  if (reducedMotion) return;

  setTimeout(function () {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('sp-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('section, footer').forEach(function (el) {
      el.classList.add('sp-reveal');
      io.observe(el);
    });

    var accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    var track = getComputedStyle(document.documentElement).getPropertyValue('--section-track-25').trim();
    var ioDonut = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        ioDonut.unobserve(en.target);
        var el = en.target;
        var target = parseFloat(el.getAttribute('data-deg')) || 0;
        var t0 = performance.now();
        var dur = 1100;
        var step = function (now) {
          var p = Math.min(1, (now - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          var d = target * e;
          el.style.background = 'conic-gradient(' + accent + ' 0deg ' + d + 'deg, ' + track + ' ' + d + 'deg 360deg)';
          if (p < 1) requestAnimationFrame(step);
        };
        el.style.background = 'conic-gradient(' + accent + ' 0deg 0deg, ' + track + ' 0deg 360deg)';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.donut').forEach(function (el) { ioDonut.observe(el); });

    var certGrid = document.querySelector('.cert-grid');
    if (certGrid) {
      var badges = certGrid.querySelectorAll('.cert-badge');
      badges.forEach(function (el) { el.classList.add('cert-pending'); });
      var ioCerts = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            badges.forEach(function (el) { el.classList.remove('cert-pending'); });
            ioCerts.unobserve(en.target);
          }
        });
      }, { threshold: 0.15 });
      ioCerts.observe(certGrid);
    }

    var wordIdx = 0;
    var wrapWords = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (tok) {
            if (!tok) return;
            if (/^\s+$/.test(tok)) {
              frag.appendChild(document.createTextNode(tok));
              return;
            }
            var s = document.createElement('span');
            s.textContent = tok;
            s.style.display = 'inline-block';
            s.style.opacity = '0';
            s.style.animation = 'sp-word 0.6s cubic-bezier(0.2,0.7,0.2,1) forwards';
            s.style.animationDelay = (0.09 * wordIdx++) + 's';
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          wrapWords(child);
        }
      });
    };
    document.querySelectorAll('h1').forEach(function (h) {
      if (!h.getAttribute('data-sp-words')) {
        h.setAttribute('data-sp-words', '1');
        wrapWords(h);
      }
    });
  }, 300);
})();
