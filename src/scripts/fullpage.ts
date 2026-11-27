import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(Observer, ScrollTrigger);

export type FullpageController = { destroy: () => void } | undefined;

/**
 * Fullpage presentasi (GSAP Observer) — HANYA DESKTOP (>=1024px).
 * Mobile (<1024px): native vertical scroll, tanpa Observer/fullpage.
 * - Panel presisi = calc(100dvh - var(--nav-h)); jarak Y GSAP = tinggi panel aktual.
 * - Panel strict: overflow hidden. [data-fullpage-scroll] (jika ada): native scroll + edge-gating.
 * - Gestur: swipe/scroll vertikal => pindah section. Swipe horizontal / gestur di atas
 *   [data-drag-gallery] tidak memicu pindah section (slider meng-handle horizontal).
 * - Reduced-motion: Observer nonaktif.
 * - Animasi GSAP hanya properti kompositor (x/y/opacity/scale/percent).
 */
const enterOnScroll = (
  targets: Element | Element[] | NodeListOf<Element>,
  trigger: Element | string,
  opts: gsap.TweenVars = {}
) => {
  gsap.set(targets, { y: 0, opacity: 1 });
  return gsap.fromTo(
    targets,
    { y: 32, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.75,
      ease: 'power2.out',
      immediateRender: false,
      scrollTrigger: { trigger, start: 'top 92%', once: true },
      ...opts,
    }
  );
};

export function initFullpage(root: HTMLElement): FullpageController {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Hanya aktifkan fullpage/Observer di desktop (>= 1024px)
  const mm = gsap.matchMedia();
  
  mm.add('(min-width: 1024px)', () => {
    const expTimeline = document.querySelector<HTMLElement>('#experience [data-exp-timeline]');
    if (expTimeline) {
      gsap.fromTo(
        expTimeline,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '#experience',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: true,
          },
        }
      );
    }

    const ctrl = initFullpageDesktop(root);
    return () => ctrl?.destroy();
  });

  // Mobile (< 1024px): ScrollTrigger Entrance Animation (Fade-up on Scroll)
  mm.add('(max-width: 1023px)', () => {
    // 0. Hero sudah berada di viewport: reveal langsung, tanpa trigger.
    const heroReveal = document.querySelectorAll<HTMLElement>('#hero .reveal-up');
    if (heroReveal.length) {
      gsap.fromTo(
        heroReveal,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1, delay: 0.2 }
      );
    }

    // 1. Judul Section & Manifesto
    document
      .querySelectorAll<HTMLElement>(
        '#about .section-heading, #about .manifesto-title, #about .manifesto-copy, #principles .section-heading, #principles .principles-title, #principles .principle-list, #contact .section-heading, #contact .contact-content, #work .work-intro, #work .work-foot, #expertise h2, #experience h2'
      )
      .forEach((el) => enterOnScroll(el, el));

    // 2. Project slider
    const workStage = document.querySelector<HTMLElement>('#work .works-stage');
    if (workStage) {
      enterOnScroll(workStage, workStage);
      const cards = document.querySelectorAll<HTMLElement>('#work .project-list [data-gallery-card]');
      if (cards.length) enterOnScroll(cards, workStage, { ease: 'power3.out' });
    }

    // 3. Bento cards
    const bento = document.querySelectorAll<HTMLElement>('#expertise article');
    if (bento.length) {
      bento.forEach((card, i) => enterOnScroll(card, card, { delay: i * 0.06 }));
    }

    // 4. Experience rows
    const expRows = document.querySelectorAll<HTMLElement>('#experience article');
    if (expRows.length) {
      expRows.forEach((card, i) => enterOnScroll(card, card, { delay: i * 0.06 }));
    }

    ScrollTrigger.refresh();
  });

  return {
    destroy() {
      mm.revert();
    },
  };
}

function initFullpageDesktop(root: HTMLElement): FullpageController {

  const panelSources = Array.from(root.querySelectorAll<HTMLElement>(':scope > section'));
  if (panelSources.length < 2) return;

  // Simpan state asli untuk restore saat destroy (navigasi Astro / cleanup).
  const rootPrev = {
    position: root.style.position,
    top: root.style.top,
    left: root.style.left,
    right: root.style.right,
    bottom: root.style.bottom,
    overflow: root.style.overflow,
    zIndex: root.style.zIndex,
  };
  const addedRootClasses = ['fixed', 'left-0', 'right-0', 'bottom-0', 'overflow-clip', 'z-[2]', 'top-[var(--nav-h)]'];
  const addedPanelClasses = [
    'h-[calc(100dvh-var(--nav-h))]',
    'max-h-[calc(100dvh-var(--nav-h))]',
    'flex',
    'flex-col',
    'will-change-transform',
    'overflow-y-auto',
    'overflow-clip',
    'overflow-x-clip',
    'overscroll-y-contain',
  ];

  document.documentElement.classList.add('is-fullpage');

  root.classList.add(...addedRootClasses);
  root.dataset.fullpage = '';
  root.innerHTML = '';

  const track = document.createElement('div');
  track.className = 'h-full w-full will-change-transform [transform:translateZ(0)]';
  track.dataset.fullpageTrack = '';
  root.appendChild(track);

  const attachPanel = (el: HTMLElement) => {
    // Strict: hanya [data-fullpage-scroll] eksplisit yang boleh native vertical scroll.
    const scrollable = el.hasAttribute('data-fullpage-scroll');
    el.dataset.fullpageSection = '';
    el.classList.add('h-[calc(100dvh-var(--nav-h))]', 'max-h-[calc(100dvh-var(--nav-h))]', 'flex', 'flex-col', 'will-change-transform');
    el.classList.add(scrollable ? 'overflow-y-auto' : 'overflow-clip');
    if (scrollable) el.classList.add('overflow-x-clip', 'overscroll-y-contain');
    el.style.minHeight = '0';
    track.appendChild(el);
  };

  panelSources.forEach(attachPanel);

  const panels = Array.from(track.querySelectorAll<HTMLElement>('[data-fullpage-section]'));
  let current = 0;
  let animating = false;
  let navigationLockedUntil = 0;

  // ── Stepped Hero (state + timeline) ────────────────────────────────
  let heroAnimated = false;
  let heroBusy = false;
  let heroTl: gsap.core.Timeline | undefined;
  const heroIndex = panels.findIndex((p) => p.id === 'hero' || p.dataset.hero === 'true');
  const heroPanel = heroIndex >= 0 ? panels[heroIndex] : undefined;

  if (heroPanel) {
    const bayu = heroPanel.querySelector<HTMLElement>('[data-hero-bayu]');
    const muta = heroPanel.querySelector<HTMLElement>('[data-hero-mutawakkil]');
    const photo = heroPanel.querySelector<HTMLElement>('[data-hero-photo]');
    const heroIndexEl = heroPanel.querySelectorAll<HTMLElement>('.hero-index');

    if (bayu && muta && photo) {
      gsap.set([bayu, muta], { xPercent: 0, autoAlpha: 1 });
      gsap.set(photo, { yPercent: 115, autoAlpha: 0 });

      heroTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power4.inOut' },
        onStart: () => {
          heroBusy = true;
          window.dispatchEvent(new CustomEvent('section:change', { detail: { sectionId: 'hero-step2' } }));
        },
        onComplete: () => { heroAnimated = true; heroBusy = false; },
        onReverseComplete: () => {
          heroAnimated = false;
          heroBusy = false;
          window.dispatchEvent(new CustomEvent('section:change', { detail: { sectionId: 'hero' } }));
        },
      });

      heroTl
        .to(bayu, { xPercent: 55, autoAlpha: 0, duration: 0.7 }, 0)
        .to(muta, { xPercent: -55, autoAlpha: 0, duration: 0.7 }, 0.08)
        .to(photo, { yPercent: 0, autoAlpha: 1, duration: 0.95, ease: 'power4.out' }, 0.38)
        .to(heroIndexEl, { autoAlpha: 0, y: -12, duration: 0.45 }, 0);
    }
  }

  const playHero = () => { if (heroTl && !heroBusy && !heroAnimated) heroTl.play(); };
  const reverseHero = (immediate = false) => {
    if (!heroTl) return;
    if (immediate) { heroTl.pause(0); heroAnimated = false; heroBusy = false; }
    else if (!heroBusy && heroAnimated) heroTl.reverse();
  };

  // ── Ukuran & navigasi section ──────────────────────────────────────
  const navH = () => {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--nav-h').trim();
    const n = parseFloat(v);
    if (Number.isFinite(n)) return v.endsWith('rem') ? n * parseFloat(getComputedStyle(document.documentElement).fontSize) : n;
    return 48;
  };

  const step = () => {
    const h = Math.round(panels[0]?.getBoundingClientRect().height ?? 0);
    if (h > 0) return h;
    return Math.round((window.visualViewport?.height ?? window.innerHeight) - navH());
  };

  const reveal = (panel: HTMLElement) => {
    panel.querySelectorAll<HTMLElement>('.reveal-up, [data-reveal-text]').forEach((el, i) => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', delay: i * 0.04, overwrite: 'auto' });
    });
    const cards = panel.querySelectorAll<HTMLElement>('.project-card');
    if (cards.length) gsap.to(cards, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06, overwrite: 'auto' });
  };

  const goto = (index: number, immediate = false) => {
    const next = Math.max(0, Math.min(panels.length - 1, index));
    if (!immediate && (animating || heroBusy || next === current)) return;
    if (next === heroIndex && current !== heroIndex && heroAnimated) reverseHero(false);

    if (root.scrollTop !== 0) root.scrollTop = 0;
    animating = !immediate;
    current = next;
    reveal(panels[current]);
    const targetSection = panels[current];
    if (targetSection) {
      window.dispatchEvent(
        new CustomEvent('section:change', {
          detail: { index: current, sectionId: targetSection.id, immediate },
        })
      );
    }
    const targetY = targetSection ? -targetSection.offsetTop : -current * step();
    gsap.to(track, {
      y: targetY,
      duration: immediate ? 0 : 0.9,
      ease: 'power4.inOut',
      overwrite: 'auto',
      force3D: true,
      onComplete: () => { animating = false; },
    });
  };

  // ── Input (Observer) ───────────────────────────────────────────────
  // Beda gestur: vertikal murni => pindah section. Horizontal => diabaikan (slider).
  // Jika gestur (touch/drag) dimulai di atas [data-drag-gallery], jangan picu pindah
  // section (cegah rambatan vertikal tak sengaja) — slider meng-handle horizontal.
  const allowTarget = (target: EventTarget | null) =>
    !(target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable="true"]');

  const atEdgeForIntent = (el: HTMLElement, intentNext: boolean) => {
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 1) return true;
    return intentNext ? el.scrollTop >= max - 1 : el.scrollTop <= 1;
  };
  const shouldConsumeInternally = (target: EventTarget | null, intentNext: boolean) => {
    const el = (target as HTMLElement | null)?.closest<HTMLElement>('[data-fullpage-scroll]');
    return !!el && !atEdgeForIntent(el, intentNext);
  };

  const isHero = () => heroIndex >= 0 && current === heroIndex;

  type IntentSelf = { axis?: string | null; event?: Event | null };

  const handleDownIntent = (target: EventTarget | null, self?: IntentSelf) => {
    if (!allowTarget(target) || animating || heroBusy || performance.now() < navigationLockedUntil) return;
    if (self?.axis === 'x') return; // swipe horizontal => bukan navigasi section
    if (shouldConsumeInternally(target, true)) return;
    navigationLockedUntil = performance.now() + 850;
    if (isHero()) {
      if (!heroAnimated) { playHero(); return; }
      goto(current + 1);
      return;
    }
    goto(current + 1);
  };

  const handleUpIntent = (target: EventTarget | null, self?: IntentSelf) => {
    if (!allowTarget(target) || animating || heroBusy || performance.now() < navigationLockedUntil) return;
    if (self?.axis === 'x') return; // swipe horizontal => bukan navigasi section
    if (shouldConsumeInternally(target, false)) return;
    navigationLockedUntil = performance.now() + 850;
    if (isHero()) {
      if (heroAnimated) { reverseHero(false); return; }
      return;
    }
    goto(current - 1);
  };

  // preventDefault:true => strict (tanpa scroll bawaan). lockAxis membedakan swipe vertikal/horizontal.
  const observer = Observer.create({
    target: window,
    type: 'touch,pointer',
    preventDefault: true,
    lockAxis: true,
    wheelSpeed: -1,
    tolerance: 14,
    dragMinimum: 10,
    onUp: (self) => handleDownIntent(self.event?.target, self),
    onDown: (self) => handleUpIntent(self.event?.target, self),
    onLeft: () => {},
    onRight: () => {},
  });

  let wheelTotal = 0;
  let wheelReset = 0;
  const onWheel = (e: WheelEvent) => {
    if (!allowTarget(e.target) || animating || heroBusy) { e.preventDefault(); return; }
    if (shouldConsumeInternally(e.target, e.deltaY > 0)) return;

    const now = performance.now();
    if (now > wheelReset) wheelTotal = 0;
    wheelReset = now + 180;
    wheelTotal += e.deltaY;
    e.preventDefault();

    if (now < navigationLockedUntil) { wheelTotal = 0; return; } // buang sisa inersia selama lock
    if (Math.abs(wheelTotal) < 36) return;                       // sedikit lebih tinggi untuk trackpad
    const intentNext = wheelTotal > 0;
    wheelTotal = 0;
    if (intentNext) handleDownIntent(e.target);
    else handleUpIntent(e.target);
  };

  const onKey = (e: KeyboardEvent) => {
    // Biarkan button dan tautan memproses Space/Enter secara native.
    if ((e.target as HTMLElement | null)?.closest('input,textarea,select,[contenteditable="true"],button,a[href]')) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); handleDownIntent(e.target); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); handleUpIntent(e.target); }
    if (e.key === 'Home') { e.preventDefault(); reverseHero(true); goto(0); }
    if (e.key === 'End') { e.preventDefault(); if (isHero() && !heroAnimated) { heroTl?.progress(1); heroAnimated = true; } goto(panels.length - 1); }
  };

  const indexForHash = (hash: string) => {
    const id = hash.replace(/^#\/?/, '');
    if (!id || id === 'top' || id === 'hero') return heroIndex >= 0 ? heroIndex : 0;
    const idx = panels.findIndex((p) => p.id === id || p.querySelector(`#${CSS.escape(id)}`));
    return idx < 0 ? 0 : idx;
  };

  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!a) return;
    const url = new URL(a.href, window.location.href);
    if ((url.pathname !== window.location.pathname && !a.getAttribute('href')?.startsWith('#')) || !url.hash) return;
    const idx = indexForHash(url.hash);
    e.preventDefault();
    history.pushState(null, '', url.hash);
    if (idx === heroIndex) reverseHero(true);
    goto(idx, false);
  };

  const onResize = () => gsap.set(track, { y: -current * step() });

  const onFullpageGoto = (e: Event) => {
    const id = (e as CustomEvent<{ id?: string }>).detail?.id;
    if (!id) return;
    const idx = indexForHash(`#${id}`);
    history.pushState(null, '', `#${id}`);
    if (idx === heroIndex) reverseHero(true);
    goto(idx, false);
  };

  const onFocusIn = (e: FocusEvent) => {
    const idx = panels.findIndex((p) => p.contains(e.target as Node));
    if (idx >= 0 && idx !== current) goto(idx, true); // koreksi cepat tanpa animasi
  };
  root.addEventListener('focusin', onFocusIn);

  window.addEventListener('keydown', onKey);
  window.addEventListener('wheel', onWheel, { passive: false });
  document.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);
  window.addEventListener('fullpage:goto', onFullpageGoto);

  const start = indexForHash(window.location.hash);
  if (start !== heroIndex) { heroTl?.progress(1); heroAnimated = true; }
  gsap.set(track, { y: -start * step() });
  current = start;
  reveal(panels[0]);
  if (current !== 0) reveal(panels[current]);
  const initialSection = panels[current];
  if (initialSection) {
    window.dispatchEvent(
      new CustomEvent('section:change', {
        detail: { index: current, sectionId: initialSection.id, immediate: true },
      })
    );
  }

  return {
    destroy() {
      root.removeEventListener('focusin', onFocusIn);
      observer.kill();
      heroTl?.kill();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('fullpage:goto', onFullpageGoto);

      // Pulihkan DOM ke struktur asli (aman untuk Astro transitions).
      try {
        panelSources.forEach((el) => {
          delete el.dataset.fullpageSection;
          el.classList.remove(...addedPanelClasses);
          el.style.minHeight = '';
          root.appendChild(el);
        });
      } catch { /* best-effort restore */ }

      if (track.parentNode === root) root.removeChild(track);
      delete root.dataset.fullpage;
      root.classList.remove(...addedRootClasses);
      root.style.position = rootPrev.position;
      root.style.top = rootPrev.top;
      root.style.left = rootPrev.left;
      root.style.right = rootPrev.right;
      root.style.bottom = rootPrev.bottom;
      root.style.overflow = rootPrev.overflow;
      root.style.zIndex = rootPrev.zIndex;
      document.documentElement.classList.remove('is-fullpage');
    },
  };
}
