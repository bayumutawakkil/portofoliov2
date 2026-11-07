import { gsap } from 'gsap';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(Observer);

export type FullpageController = { destroy: () => void } | undefined;

/**
 * Fullpage presentasi (GSAP Observer) + stepped Hero.
 * - Tinggi panel presisi = calc(100dvh - var(--nav-h)) (navbar fixed). Jarak Y GSAP = tinggi panel aktual.
 * - Panel strict: overflow hidden. Panel [data-fullpage-scroll] eksplisit (jika ada): native scroll + edge-gating.
 * - Wheel vertikal di atas [data-drag-gallery]/slider tetap ditangkap Observer (tidak ada stopPropagation) => pindah section.
 * - Animasi GSAP hanya properti kompositor (x/y/opacity/scale/percent).
 */
export function initFullpage(root: HTMLElement): FullpageController {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const footer = document.querySelector<HTMLElement>('footer.footer-wrap');
  const panelSources = Array.from(root.querySelectorAll<HTMLElement>(':scope > section'));
  if (panelSources.length < 2) return;

  document.documentElement.classList.add('is-fullpage');

  root.classList.add('fixed', 'left-0', 'right-0', 'bottom-0', 'overflow-hidden', 'z-[1]', 'top-[var(--nav-h)]');
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
    el.classList.add(scrollable ? 'overflow-y-auto' : 'overflow-hidden');
    if (scrollable) el.classList.add('overflow-x-clip', 'overscroll-y-contain');
    el.style.minHeight = '0';
    track.appendChild(el);
  };

  panelSources.forEach(attachPanel);
  if (footer && !track.contains(footer)) attachPanel(footer);

  const panels = Array.from(track.querySelectorAll<HTMLElement>('[data-fullpage-section]'));
  let current = 0;
  let animating = false;

  // ── Stepped Hero (state + timeline) ────────────────────────────────
  let heroAnimated = false;
  let heroBusy = false;
  let heroTl: gsap.core.Timeline | undefined;
  const heroIndex = panels.findIndex(p => p.id === 'hero' || p.dataset.hero === 'true');
  const heroPanel = heroIndex >= 0 ? panels[heroIndex] : undefined;

  if (heroPanel) {
    const bayu = heroPanel.querySelector<HTMLElement>('[data-hero-bayu]');
    const muta = heroPanel.querySelector<HTMLElement>('[data-hero-mutawakkil]');
    const photo = heroPanel.querySelector<HTMLElement>('[data-hero-photo]');
    const heroMeta = heroPanel.querySelectorAll<HTMLElement>('[data-hero-meta]');

    if (bayu && muta && photo) {
      gsap.set([bayu, muta], { xPercent: 0, autoAlpha: 1 });
      gsap.set(photo, { yPercent: 115, autoAlpha: 0 });

      heroTl = gsap.timeline({
        paused: true,
        defaults: { ease: 'power4.inOut' },
        onStart: () => { heroBusy = true; },
        onComplete: () => { heroAnimated = true; heroBusy = false; },
        onReverseComplete: () => { heroAnimated = false; heroBusy = false; },
      });

      heroTl
        .to(bayu, { xPercent: 55, autoAlpha: 0, duration: 0.7 }, 0)
        .to(muta, { xPercent: -55, autoAlpha: 0, duration: 0.7 }, 0.08)
        .to(photo, { yPercent: 0, autoAlpha: 1, duration: 0.95, ease: 'power4.out' }, 0.38)
        .to(heroMeta, { autoAlpha: 0, y: -12, duration: 0.45, stagger: 0.03 }, 0);
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

    animating = !immediate;
    current = next;
    reveal(panels[current]);
    gsap.to(track, {
      y: -current * step(),
      duration: immediate ? 0 : 0.9,
      ease: 'power4.inOut',
      overwrite: 'auto',
      force3D: true,
      onComplete: () => { animating = false; },
    });
  };

  // ── Input (Observer) ───────────────────────────────────────────────
  // PENTING: tidak ada stopPropagation pada wheel. Event wheel vertikal di atas
  // slider [data-drag-gallery] harus tetap "tembus" dan ditangkap Observer.
  const allowObserver = (target: EventTarget | null) =>
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

  const handleDownIntent = (target: EventTarget | null) => { // intent ke BAWAH => next
    if (!allowObserver(target) || animating || heroBusy) return;
    if (shouldConsumeInternally(target, true)) return;
    if (isHero()) {
      if (!heroAnimated) { playHero(); return; }
      goto(current + 1);
      return;
    }
    goto(current + 1);
  };

  const handleUpIntent = (target: EventTarget | null) => { // intent ke ATAS => prev
    if (!allowObserver(target) || animating || heroBusy) return;
    if (shouldConsumeInternally(target, false)) return;
    if (isHero()) {
      if (heroAnimated) { reverseHero(false); return; }
      return;
    }
    goto(current - 1);
  };

  // preventDefault:true mengunci scroll strict; wheel di atas slider tetap diproses (no stopPropagation).
  const observer = Observer.create({
    target: window,
    type: 'wheel,touch',
    preventDefault: true,
    wheelSpeed: -1,
    tolerance: 14,
    dragMinimum: 10,
    onUp: (self) => handleDownIntent(self.event?.target),   // scroll/swipe down => next
    onDown: (self) => handleUpIntent(self.event?.target),   // scroll/swipe up   => prev
  });

  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement | null)?.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); handleDownIntent(e.target); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); handleUpIntent(e.target); }
    if (e.key === 'Home') { e.preventDefault(); reverseHero(true); goto(0); }
    if (e.key === 'End') { e.preventDefault(); if (isHero() && !heroAnimated) { heroTl?.progress(1); heroAnimated = true; } goto(panels.length - 1); }
  };

  const indexForHash = (hash: string) => {
    const id = hash.replace(/^#\/?/, '');
    if (!id || id === 'top' || id === 'hero') return heroIndex >= 0 ? heroIndex : 0;
    const idx = panels.findIndex(p => p.id === id || p.querySelector(`#${CSS.escape(id)}`));
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

  window.addEventListener('keydown', onKey);
  document.addEventListener('click', onClick);
  window.addEventListener('resize', onResize);

  const start = indexForHash(window.location.hash);
  if (start !== heroIndex) { heroTl?.progress(1); heroAnimated = true; }
  gsap.set(track, { y: -start * step() });
  current = start;
  reveal(panels[0]);
  if (current !== 0) reveal(panels[current]);

  return {
    destroy() {
      observer.kill();
      heroTl?.kill();
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      document.documentElement.classList.remove('is-fullpage');
    },
  };
}
