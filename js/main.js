/* ══════════════════════════════════════════════
   MAISON CHALAMBERT · main.js · v6
   — Preloader logo cinématique
   — Video reel crossfade
   — Hero text entrance (bottom-left)
   — Scroll reveals + stagger
   — Live typing messages
   — Nav solid on scroll
   — Marquee footer pause on hover
   — Parallax experiences ultra-fluide (lerp RAF)
══════════════════════════════════════════════ */

(() => {
  'use strict';

  /* ── Easing ──────────────────────────────────── */
  const ease = t => 1 - Math.pow(1 - t, 4); // ease-out-quart

  /* ══════════════════════════════════════════════
     PRELOADER — logo seul, disparaît après 2.4s
  ══════════════════════════════════════════════ */
  const preloader = document.getElementById('preloader');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    preloader.classList.add('off');
    document.body.style.overflow = '';
    setTimeout(initHeroEntrance, 300);
  }, 2400);

  /* ══════════════════════════════════════════════
     HERO ENTRANCE — bottom-left staggered
  ══════════════════════════════════════════════ */
  function initHeroEntrance() {
    const lines = document.querySelectorAll('.ht-line');
    const cta   = document.querySelector('.hero-cta');

    lines.forEach((el, i) => {
      el.style.opacity    = '0';
      el.style.transform  = 'translateY(28px)';
      el.style.transition = `opacity 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 200}ms,
                             transform 1.2s cubic-bezier(0.16,1,0.3,1) ${i * 200}ms`;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.style.opacity   = '1';
        el.style.transform = 'none';
      }));
    });

    if (cta) {
      cta.style.opacity   = '0';
      cta.style.transform = 'translateY(18px)';
      cta.style.transition = 'opacity 1s cubic-bezier(0.16,1,0.3,1) 520ms, transform 1s cubic-bezier(0.16,1,0.3,1) 520ms';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        cta.style.opacity   = '1';
        cta.style.transform = 'none';
      }));
    }

    // Scroll hint + live badge
    ['.hero-scroll-hint', '.hero-live'].forEach((sel, i) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.opacity   = '0';
      el.style.animation = 'none';
      setTimeout(() => {
        el.style.transition = 'opacity 1.2s ease';
        el.style.opacity    = '1';
        if (sel === '.hero-scroll-hint') {
          setTimeout(() => el.style.animation = '', 1200);
        }
      }, 1600 + i * 260);
    });
  }

  /* ══════════════════════════════════════════════
     VIDEO REEL — crossfade fluide et uniforme
     Toutes les vidéos se chargent en avance (loop)
     Transitions identiques : ease-in-out 1.8s
  ══════════════════════════════════════════════ */
  const videos  = Array.from(document.querySelectorAll('.reel-v'));
  let   reelIdx = 0;
  // Durées par vidéo (ms) — V1 parasols légèrement plus longue
  const REEL_DURATIONS = [8500, 6500, 6500, 6500, 6500];
  const FADE_DURATION = 1800; // 1.8s crossfade (doit correspondre au CSS)

  if (videos.length > 1) {
    // S'assurer que toutes les vidéos sont en boucle et muettes
    videos.forEach(v => { v.muted = true; v.loop = true; });

    // Slow motion sur la première vidéo (parasols) — 45% de la vitesse normale
    videos[0].playbackRate = 0.45;

    const tryPlay = v => {
      if (!v) return;
      v.muted = true;
      v.play().catch(() => { v.muted = true; v.play().catch(() => {}); });
    };

    // Précharge et lance la vidéo silencieusement (opacité 0)
    // pour qu'elle soit prête quand son tour arrive
    const preBuffer = v => {
      if (!v) return;
      if (v.readyState >= 3) { tryPlay(v); return; }
      v.preload = 'auto';
      v.load();
      const onReady = () => tryPlay(v);
      if (v.readyState >= 2) onReady();
      else v.addEventListener('canplay', onReady, { once: true });
    };

    // Démarre le préchargement de la V2 immédiatement
    preBuffer(videos[1]);

    const advanceReel = () => {
      const prev = reelIdx;
      reelIdx = (reelIdx + 1) % videos.length;

      // Précharge la vidéo d'après
      preBuffer(videos[(reelIdx + 1) % videos.length]);

      // Fade-in de la prochaine (déjà en lecture silencieuse)
      const next = videos[reelIdx];
      next.classList.add('active');

      // Fade-out de la précédente après le crossfade
      setTimeout(() => {
        videos[prev].classList.remove('active');
        // On ne pause pas — elle reste en boucle pour le prochain cycle
      }, FADE_DURATION);
    };

    // setTimeout récursif pour appliquer une durée différente par vidéo
    const scheduleNext = () => {
      setTimeout(() => {
        advanceReel();
        scheduleNext();
      }, REEL_DURATIONS[reelIdx] || 6500);
    };
    scheduleNext();
  }

  /* ══════════════════════════════════════════════
     LIVE MESSAGES — typewriter in hero
  ══════════════════════════════════════════════ */
  const liveMsgs = [
    'Accès privé validé.',
    'Table confirmée — ce soir.',
    'Villa shortlistée.',
    'Chauffeur assigné.',
    'Vol en cours de réservation.',
    'Événement orchestré.',
    'Invitation reçue.',
  ];
  const liveTxt = document.getElementById('live-msg');
  let   liveIdx = 0, liveChar = 0, liveDeleting = false, liveTimer;

  function typeLive() {
    const msg  = liveMsgs[liveIdx];
    const full  = liveChar === msg.length;
    const empty = liveChar === 0;

    if (!liveDeleting && !full) {
      liveChar++;
    } else if (!liveDeleting && full) {
      liveDeleting = true;
      liveTimer = setTimeout(typeLive, 2400);
      return;
    } else if (liveDeleting && !empty) {
      liveChar--;
    } else {
      liveDeleting = false;
      liveIdx = (liveIdx + 1) % liveMsgs.length;
    }

    if (liveTxt) liveTxt.textContent = liveMsgs[liveIdx].slice(0, liveChar);
    liveTimer = setTimeout(typeLive, liveDeleting ? 42 : 88);
  }
  setTimeout(typeLive, 3500);

  /* ══════════════════════════════════════════════
     NAV — solid on scroll
  ══════════════════════════════════════════════ */
  const nav  = document.getElementById('nav');
  const hero = document.getElementById('hero');

  window.addEventListener('scroll', () => {
    const past = hero
      ? hero.getBoundingClientRect().bottom <= 0
      : window.scrollY > 80;
    nav.classList.toggle('solid', past);
  }, { passive: true });

  /* ══════════════════════════════════════════════
     MOBILE MENU
  ══════════════════════════════════════════════ */
  const burger  = document.getElementById('burger');
  const overlay = document.getElementById('nav-overlay');
  let menuOpen  = false;

  if (burger && overlay) {
    const toggle = (force = null) => {
      menuOpen = force !== null ? force : !menuOpen;
      burger.classList.toggle('open', menuOpen);
      overlay.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    overlay.querySelectorAll('.no-link').forEach(l =>
      l.addEventListener('click', () => toggle(false))
    );
  }

  /* ══════════════════════════════════════════════
     SCROLL REVEALS — IntersectionObserver
  ══════════════════════════════════════════════ */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  // Basic reveals
  document.querySelectorAll('.reveal, .reveal-img').forEach(el => revealObs.observe(el));

  // Staggered u-panels
  document.querySelectorAll('.u-panel').forEach((el, i) => {
    el.style.setProperty('--d', `${i * 85}ms`);
    el.classList.add('reveal');
    revealObs.observe(el);
  });

  // Piliers already have inline --d; just observe
  document.querySelectorAll('.pilier').forEach(el => revealObs.observe(el));

  // Galerie images
  document.querySelectorAll('.g-a, .g-b, .g-c, .g-d').forEach((el, i) => {
    el.style.setProperty('--d', `${i * 100}ms`);
    el.classList.add('reveal-img');
    revealObs.observe(el);
  });

  // Stats
  document.querySelectorAll('.stat').forEach((el, i) => {
    el.style.setProperty('--d', `${i * 140}ms`);
    el.classList.add('reveal');
    revealObs.observe(el);
  });

  // Éditorial parallax-zoom trigger
  const editorial = document.getElementById('editorial');
  if (editorial) {
    new IntersectionObserver(entries => {
      editorial.classList.toggle('in-view', entries[0].isIntersecting);
    }, { threshold: 0.05 }).observe(editorial);
  }

  /* ══════════════════════════════════════════════
     SMOOTH SCROLL
  ══════════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 76;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ══════════════════════════════════════════════
     FORM SUBMIT — AJAX vers Formspark (sans redirection)
     Envoi en arrière-plan, le client reste sur la page.
  ══════════════════════════════════════════════ */
  const FORMSPARK = 'https://submit-form.com/form_v1_h3NaQ59z5lmbsAL2vtlnTSrv';

  const form = document.getElementById('form');
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      const btn     = form.querySelector('.f-btn');
      const btnSpan = btn ? btn.querySelector('span') : null;
      if (!btn || !btnSpan) return;

      // Validation — prénom + email requis
      const prenom = form.querySelector('[name="prenom"]')?.value.trim();
      const email  = form.querySelector('[name="email"]')?.value.trim();
      if (!prenom || !email) {
        btn.style.transition = 'opacity .25s';
        btn.style.opacity    = '.35';
        setTimeout(() => { btn.style.opacity = ''; }, 500);
        return;
      }

      btn.disabled        = true;
      btnSpan.textContent = '…';

      // URLSearchParams = requête "simple" CORS, aucun preflight bloquant
      const params = new URLSearchParams();
      new FormData(form).forEach((val, key) => params.append(key, val));

      try {
        const res = await fetch(FORMSPARK, {
          method:  'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body:    params.toString(),
        });

        if (res.ok) {
          btnSpan.textContent = currentLang === 'en' ? 'Message sent ✓' : 'Message envoyé ✓';
          btn.style.opacity   = '.55';
          form.reset();
          setTimeout(() => {
            btnSpan.textContent = currentLang === 'en' ? 'Send' : 'Envoyer';
            btn.style.opacity   = '';
            btn.disabled        = false;
          }, 5000);
        } else {
          throw new Error('HTTP ' + res.status);
        }
      } catch (err) {
        console.error('Formspark :', err);
        btnSpan.textContent = currentLang === 'en' ? 'Error — please retry' : 'Erreur — réessayez';
        btn.disabled        = false;
        setTimeout(() => {
          btnSpan.textContent = currentLang === 'en' ? 'Send' : 'Envoyer';
        }, 3500);
      }
    });
  }

  /* ══════════════════════════════════════════════
     EXPERIENCES — parallax lerp (ultra-fluide)
     Gauche monte, droite descend au scroll
     RAF + interpolation pour mouvement soyeux
  ══════════════════════════════════════════════ */
  const expSection = document.getElementById('experiences');
  const expLeft    = document.getElementById('expLeft');
  const expRight   = document.getElementById('expRight');
  const isTouch    = window.matchMedia('(pointer: coarse)').matches;

  if (expSection && expLeft && expRight && !isTouch) {
    // Valeurs cibles (mises à jour sur scroll)
    let targetL = 0, targetR = 0;
    // Valeurs courantes interpolées (mises à jour par RAF)
    let currentL = 0, currentR = 0;

    const lerp = (a, b, t) => a + (b - a) * t;

    // Calcul du progrès de scroll dans la section
    const onScroll = () => {
      const rect  = expSection.getBoundingClientRect();
      const total = Math.max(expSection.offsetHeight - window.innerHeight, 1);
      const p     = Math.max(0, Math.min(1, -rect.top / total));
      targetL = p * -13; // gauche monte de 13%
      targetR = p * 10;  // droite descend de 10%
    };

    // Boucle RAF — interpolation douce (facteur 0.055 = très soyeux)
    const animateExp = () => {
      currentL += (targetL - currentL) * 0.055;
      currentR += (targetR - currentR) * 0.055;
      expLeft.style.transform  = `translateX(-60px) translateY(${currentL.toFixed(3)}%)`;
      expRight.style.transform = `translateX(60px) translateY(${currentR.toFixed(3)}%)`;
      requestAnimationFrame(animateExp);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    animateExp(); // démarre la boucle RAF
  }

  /* ══════════════════════════════════════════════
     FOOTER MARQUEE — pause on hover
  ══════════════════════════════════════════════ */
  const marquee = document.querySelector('.ft-marquee');
  if (marquee) {
    marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
    marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
  }

  /* ══════════════════════════════════════════════
     LANGUE — FR / EN toggle
  ══════════════════════════════════════════════ */
  const i18n = {
    fr: {
      // Nav
      'nav.univers': 'Nos Univers',
      'nav.maison':  'La Maison',
      'nav.galerie': 'Galerie',
      'nav.cta':     'Demande Privée',
      // Hero
      'hero.l1':  "L'Art de",
      'hero.l2':  "l'Inaccessible",
      'hero.cta': 'En savoir plus',
      // Statement
      'st.main':  "Aucun dîner n'est trop privé, aucun lieu trop confidentiel, aucun spectacle trop rare, aucune escapade trop exclusive.",
      'st.body1': "Notre ambition : créer des expériences uniques, surprendre, émerveiller, faire vibrer vos sens et transformer chaque instant en souvenir mémorable.",
      'st.body2': "Notre promesse : éveiller vos émotions, vous offrir l'inattendu et vous donner envie de toujours revenir pour de nouvelles expériences.",
      // Univers
      'u.label':  '— Nos Univers',
      'u1.title': 'Événements<br />Privés',
      'u1.desc':  "Dîners de prestige, soirées de gala, anniversaires confidentiels. Des célébrations pensées comme des mises en scène intimes, dans des lieux que vous serez les seuls à connaître.",
      'u2.title': "Tables<br />d'Exception",
      'u2.desc':  "Des adresses confidentielles aux dîners impossibles à réserver. Notre réseau ouvre les portes des meilleures tables au monde — ce soir.",
      'u3.title': 'Lifestyle',
      'u3.desc':  "Accès Fashion Week, Grand Prix de Monaco, Festival de Cannes, vernissages privés, premières exclusives. Les coulisses du monde vous appartiennent.",
      'u4.title': 'Voyages<br />Sur-Mesure',
      'u4.desc':  "Villas privées, yachts, jets privés, safaris en lodge exclusif. Des itinéraires dessinés pour votre seule signature, dans des destinations choisies pour leur âme.",
      'u.link':   'Nous consulter →',
      // Editorial
      'ed.quote': '"Il existe des portes que d\'autres<br />n\'ont jamais su frapper."',
      // La Maison
      'm.label':  '— La Maison',
      'm.title':  "L'Art de<br /><em>l'Hospitalité</em>",
      'm.intro':  "Passionnés et entourés des meilleurs dans chaque univers. Une vision où chaque détail compte, où l'élégance rencontre l'audace — pour vous offrir bien plus qu'une expérience : une émotion.",
      'p1.title': 'Personnalisation',
      'p1.desc':  "Parce que vous êtes unique, chaque expérience est dessinée sur-mesure. Nous écoutons vos silences et anticipons vos désirs pour façonner un moment qui ne ressemble qu'à vous.",
      'p2.title': 'Inaccessible',
      'p2.desc':  "Poussez les portes qui restent closes aux autres. Tables confidentielles, lieux secrets, privatisations impossibles : notre carnet d'adresses est votre passeport pour l'exception.",
      'p3.title': 'Orchestration',
      'p3.desc':  "Laissez-vous porter. De la première inspiration à la dernière seconde, nous orchestrons tout dans l'ombre. Profitez de l'instant — nous maîtrisons le temps pour vous.",
      'p4.title': 'Émotion',
      'p4.desc':  "Qu'il s'agisse d'une évasion au bout du monde ou d'un dîner privé, nous chassons l'ordinaire pour provoquer l'émerveillement et marquer les esprits à jamais.",
      // Experiences
      'exp.label': '— Expériences',
      'exp.title': "L'art de vivre,<br /><em>en mouvement.</em>",
      'exp.sub':   "Chaque univers raconte une manière d'habiter l'exception :<br />une table, un voyage, une fête, une adresse que l'on ne trouve pas.",
      'exp.cta':   'Voir les inspirations',
      // Contact
      'c.label': '— Demande Privée',
      'c.title': 'Imaginer votre<br /><em>expérience avec nous.</em>',
      'c.sub':   "Une demande confidentielle, une envie précise ou une occasion à célébrer. Nous vous répondons avec discrétion sous 24h.",
      'f.first': 'Prénom',
      'f.last':  'Nom',
      'f.email': 'Email',
      'f.world': 'Univers',
      'f.msg':   'Votre demande',
      'f.send':  'Envoyer',
      'f.opt1':  'Événements Privés',
      'f.opt2':  "Tables d'Exception",
      'f.opt3':  'Lifestyle',
      'f.opt4':  'Voyages Sur-Mesure',
    },
    en: {
      // Nav
      'nav.univers': 'Our World',
      'nav.maison':  'The House',
      'nav.galerie': 'Gallery',
      'nav.cta':     'Private Request',
      // Hero
      'hero.l1':  'The Art of',
      'hero.l2':  'the Inaccessible',
      'hero.cta': 'Discover more',
      // Statement
      'st.main':  "No dinner is too private, no place too confidential, no show too rare, no escape too exclusive.",
      'st.body1': "Our ambition: to create unique experiences, surprise, enchant, awaken your senses and transform every moment into an unforgettable memory.",
      'st.body2': "Our promise: to awaken your emotions, offer you the unexpected and make you always want to return for new experiences.",
      // Univers
      'u.label':  '— Our World',
      'u1.title': 'Private<br />Events',
      'u1.desc':  "Prestigious dinners, gala evenings, confidential celebrations. Events conceived as intimate productions, in places only you will ever know.",
      'u2.title': 'Exceptional<br />Tables',
      'u2.desc':  "From confidential addresses to impossible reservations. Our network opens the doors of the world's finest tables — tonight.",
      'u3.title': 'Lifestyle',
      'u3.desc':  "Fashion Week access, Monaco Grand Prix, Cannes Film Festival, private openings, exclusive premieres. The world backstage belongs to you.",
      'u4.title': 'Bespoke<br />Travel',
      'u4.desc':  "Private villas, yachts, private jets, exclusive lodge safaris. Itineraries crafted for your signature alone, in destinations chosen for their soul.",
      'u.link':   'Enquire →',
      // Editorial
      'ed.quote': '"There are doors that others<br />have never known how to knock on."',
      // La Maison
      'm.label':  '— The House',
      'm.title':  "The Art of<br /><em>Hospitality</em>",
      'm.intro':  "Passionate and surrounded by the best in every field. A vision where every detail matters, where elegance meets boldness — to offer you far more than an experience: an emotion.",
      'p1.title': 'Personalisation',
      'p1.desc':  "Because you are unique, every experience is crafted to measure. We listen to your silences and anticipate your desires to shape a moment that resembles only you.",
      'p2.title': 'Inaccessible',
      'p2.desc':  "Push the doors that remain closed to others. Confidential tables, secret venues, impossible privatisations: our address book is your passport to the exceptional.",
      'p3.title': 'Orchestration',
      'p3.desc':  "Let yourself be carried. From the first inspiration to the last second, we orchestrate everything in the background. Enjoy the moment — we master time for you.",
      'p4.title': 'Emotion',
      'p4.desc':  "Whether an escape to the ends of the earth or a private dinner, we chase the ordinary to provoke wonder and leave a lasting impression.",
      // Experiences
      'exp.label': '— Experiences',
      'exp.title': "The art of living,<br /><em>in motion.</em>",
      'exp.sub':   "Each world tells a way of inhabiting the exceptional:<br />a table, a journey, a celebration, an address you cannot find.",
      'exp.cta':   'See inspirations',
      // Contact
      'c.label': '— Private Request',
      'c.title': 'Imagine your<br /><em>experience with us.</em>',
      'c.sub':   "A confidential request, a precise desire or an occasion to celebrate. We respond with discretion within 24 hours.",
      'f.first': 'First name',
      'f.last':  'Last name',
      'f.email': 'Email',
      'f.world': 'World',
      'f.msg':   'Your request',
      'f.send':  'Send',
      'f.opt1':  'Private Events',
      'f.opt2':  'Exceptional Tables',
      'f.opt3':  'Lifestyle',
      'f.opt4':  'Bespoke Travel',
    }
  };

  const liveMsgsEN = [
    'Private access granted.',
    'Table confirmed — tonight.',
    'Villa shortlisted.',
    'Chauffeur assigned.',
    'Flight being booked.',
    'Event orchestrated.',
    'Invitation received.',
  ];

  let currentLang = 'fr';

  function applyLang(lang) {
    currentLang = lang;
    const t = i18n[lang];

    // Text nodes
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (t[key] !== undefined) el.textContent = t[key];
    });

    // HTML nodes (contain <br>, <em> etc.)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (t[key] !== undefined) el.innerHTML = t[key];
    });

    // Live messages — reset typing animation
    const frMsgs = ['Accès privé validé.','Table confirmée — ce soir.','Villa shortlistée.','Chauffeur assigné.','Vol en cours de réservation.','Événement orchestré.','Invitation reçue.'];
    liveMsgs.splice(0, liveMsgs.length, ...(lang === 'en' ? liveMsgsEN : frMsgs));
    clearTimeout(liveTimer);
    liveIdx = 0; liveChar = 0; liveDeleting = false;
    if (liveTxt) { liveTxt.textContent = ''; }
    liveTimer = setTimeout(typeLive, 600);

    // Lang buttons
    document.querySelectorAll('.ls-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-lang') === lang);
    });

    // html lang attribute
    document.getElementById('html-root').lang = lang;
  }

  // Lang switch buttons
  document.querySelectorAll('.ls-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-set-lang');
      if (lang !== currentLang) applyLang(lang);
    });
  });

  /* ══════════════════════════════════════════════
     GALERIE — Slider horizontal ultra-fluide
     Lerp interpolation (RAF) + drag souris/touch
     Snap au slide le plus proche au relâcher
  ══════════════════════════════════════════════ */
  const gTrack   = document.getElementById('gTrack');
  const gOverflow = gTrack ? gTrack.closest('.g-overflow') : null;
  const gPrevBtn = document.querySelector('.gn-prev');
  const gNextBtn = document.querySelector('.gn-next');

  if (gTrack && gOverflow) {
    let targetX  = 0;   // position cible
    let liveX    = 0;   // position interpolée (rendue)
    let gIdx     = 0;   // index du slide actif
    let dragging = false;
    let dragStartX = 0, dragStartTarget = 0;
    let rafG;

    /* Positionne les flèches au centre vertical de l'image */
    const positionArrows = () => {
      const img = gTrack.querySelector('.g-img');
      if (!img || !gPrevBtn || !gNextBtn) return;
      const h = img.getBoundingClientRect().height;
      if (h <= 0) return;
      const top = Math.round(h / 2);
      gPrevBtn.style.top = top + 'px';
      gNextBtn.style.top = top + 'px';
      gPrevBtn.style.transform = 'translateY(-50%)';
      gNextBtn.style.transform = 'translateY(-50%)';
    };
    positionArrows();
    window.addEventListener('resize', positionArrows);

    const slides   = () => Array.from(gTrack.querySelectorAll('.g-slide'));
    const slideW   = () => {
      const s = gTrack.querySelector('.g-slide');
      if (!s) return 300;
      const gap = parseFloat(window.getComputedStyle(gTrack).gap) || 18;
      return s.getBoundingClientRect().width + gap;
    };
    const maxX  = () => Math.max(0, (slides().length - 1) * slideW());
    const clamp = v  => Math.max(0, Math.min(v, maxX()));

    /* Boucle lerp RAF — très soyeux (facteur 0.1) */
    const tick = () => {
      liveX += (targetX - liveX) * 0.1;
      const done = Math.abs(targetX - liveX) < 0.06;
      if (done) liveX = targetX;
      gTrack.style.transform = `translateX(${(-liveX).toFixed(2)}px)`;
      updateGNav();
      if (!done) rafG = requestAnimationFrame(tick);
    };

    const go = x => {
      targetX = clamp(x);
      cancelAnimationFrame(rafG);
      rafG = requestAnimationFrame(tick);
    };

    const snapNearest = () => {
      const sw = slideW();
      gIdx = Math.round(targetX / sw);
      gIdx = Math.max(0, Math.min(gIdx, slides().length - 1));
      go(gIdx * sw);
    };

    const updateGNav = () => {
      if (gPrevBtn) gPrevBtn.disabled = targetX <= 1;
      if (gNextBtn) gNextBtn.disabled = targetX >= maxX() - 1;
    };

    /* Boutons fléchés */
    if (gPrevBtn) gPrevBtn.addEventListener('click', () => {
      gIdx = Math.max(0, gIdx - 1);
      go(gIdx * slideW());
    });
    if (gNextBtn) gNextBtn.addEventListener('click', () => {
      gIdx = Math.min(slides().length - 1, gIdx + 1);
      go(gIdx * slideW());
    });

    /* Drag souris */
    gOverflow.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartTarget = targetX;
      gOverflow.classList.add('is-grabbing');
      cancelAnimationFrame(rafG);
    });
    window.addEventListener('mousemove', e => {
      if (!dragging) return;
      const dx = dragStartX - e.clientX;
      liveX = targetX = clamp(dragStartTarget + dx);
      gTrack.style.transform = `translateX(${(-liveX).toFixed(2)}px)`;
      updateGNav();
    });
    window.addEventListener('mouseup', () => {
      if (!dragging) return;
      dragging = false;
      gOverflow.classList.remove('is-grabbing');
      snapNearest();
    });

    /* Drag touch */
    gOverflow.addEventListener('touchstart', e => {
      dragStartX = e.touches[0].clientX;
      dragStartTarget = targetX;
      cancelAnimationFrame(rafG);
    }, { passive: true });
    gOverflow.addEventListener('touchmove', e => {
      const dx = dragStartX - e.touches[0].clientX;
      liveX = targetX = clamp(dragStartTarget + dx);
      gTrack.style.transform = `translateX(${(-liveX).toFixed(2)}px)`;
      updateGNav();
    }, { passive: true });
    gOverflow.addEventListener('touchend', () => snapNearest());

    updateGNav();
  }

})();
