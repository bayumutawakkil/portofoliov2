import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

document.documentElement.classList.add('js-ready');
document.documentElement.dataset.motionReady = 'true';

// Navbar height must match CSS (.site-header height)
const NAV_H = () => (window.innerWidth <= 640 ? 72 : 88);

let cleanup: (() => void) | undefined;

const init = () => {
  cleanup?.();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = gsap.context(() => {

    // ── Mobile menu ───────────────────────────────────────────────────
    const menuButton = document.querySelector<HTMLElement>('[data-menu-toggle]');
    const mobileMenu = document.querySelector<HTMLElement>('[data-mobile-menu]');
    const setMenu = (open: boolean) => {
      if (!menuButton || !mobileMenu) return;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      mobileMenu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
    };
    const toggleMenu = () => setMenu(menuButton?.getAttribute('aria-expanded') !== 'true');
    const onMenuKeydown = (event: KeyboardEvent) => {
      if (!menuButton || !mobileMenu || menuButton.getAttribute('aria-expanded') !== 'true') return;
      if (event.key === 'Escape') { event.preventDefault(); setMenu(false); menuButton.focus(); return; }
      if (event.key !== 'Tab') return;
      const focusables = [menuButton, ...Array.from(mobileMenu.querySelectorAll<HTMLElement>('a[href], button'))].filter(el => el.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0]; const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    menuButton?.addEventListener('click', toggleMenu);
    document.addEventListener('keydown', onMenuKeydown);
    mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    const menuCleanup = () => document.removeEventListener('keydown', onMenuKeydown);

    // ── Drag carousel (pointer only — no wheel scroll) ────────────────
    const gallery    = document.querySelector<HTMLElement>('[data-drag-gallery]');
    const galleryTrack = gallery?.querySelector<HTMLElement>('[data-gallery-track]');
    const galleryCards = gallery ? Array.from(gallery.querySelectorAll<HTMLElement>('[data-gallery-card]')) : [];
    const galleryProgress = gallery?.querySelector<HTMLElement>('[data-gallery-progress]');
    let galleryCleanup: (() => void) | undefined;

    if (gallery && galleryTrack && galleryCards.length > 0) {
      const isMobile = () => window.matchMedia('(max-width: 640px)').matches;
      const state = { x: -Math.min(window.innerWidth * (isMobile() ? 0.48 : 0.11), 160) };
      let velocity = 0, lastX = 0, lastTime = 0;
      let pointerId: number | null = null;
      let dragging = false, stepping = false;
      let settleTween: gsap.core.Tween | undefined;
      let settleTarget = 0;
      let dragDistance = 0;

      const cardStep = () => {
        const ch = galleryTrack.children;
        const a = ch[0] as HTMLElement | undefined;
        const b = ch[1] as HTMLElement | undefined;
        return Math.abs(a && b ? b.offsetLeft - a.offsetLeft : a?.offsetWidth ?? 0);
      };

      const recycleTrack = () => {
        const step = cardStep();
        if (!Number.isFinite(step) || step <= 0) return;
        let g = 0;
        while (state.x < -step && g++ < 100) { const f = galleryTrack.firstElementChild; if (!f) break; galleryTrack.append(f); state.x += step; }
        g = 0;
        while (state.x > 0 && g++ < 100) { const l = galleryTrack.lastElementChild; if (!l) break; galleryTrack.prepend(l); state.x -= step; }
      };

      const renderPosition = () => {
        gsap.set(galleryTrack, { x: state.x });
        const nearest = galleryCards.reduce((best, card) => {
          const center = card.offsetLeft + card.offsetWidth / 2 + state.x;
          const dist   = Math.abs(center - gallery.clientWidth * 0.32);
          return dist < best.dist ? { idx: Number(card.dataset.index ?? 0), dist } : best;
        }, { idx: 0, dist: Infinity });
        if (galleryProgress) galleryProgress.textContent = `${String(nearest.idx + 1).padStart(2,'0')} / ${String(galleryCards.length).padStart(2,'0')}`;
      };

      const setPosition = (v: number) => { state.x = v; recycleTrack(); renderPosition(); };

      // 3-D cylinder + elastic drag transform
      const applyDragTransform = () => {
        const gc   = gallery.getBoundingClientRect();
        const mid  = gc.left + gallery.clientWidth * 0.5;
        const spd  = Math.max(-12, Math.min(12, velocity * 0.35));
        galleryCards.forEach(card => {
          const cr    = card.getBoundingClientRect();
          const ratio = Math.max(-1.5, Math.min(1.5, (cr.left + card.offsetWidth / 2 - mid) / (gallery.clientWidth * 0.45)));
          gsap.set(card, { rotateY: ratio * 24, rotateZ: ratio * spd * -0.4, skewY: spd * 0.25, z: -Math.abs(ratio) * 65, scale: 1, overwrite: 'auto' });
        });
      };

      const resetDragTransform = () => {
        const mid = gallery.getBoundingClientRect().left + gallery.clientWidth * 0.5;
        galleryCards.forEach(card => {
          const ratio = Math.max(-1.5, Math.min(1.5, (card.getBoundingClientRect().left + card.offsetWidth / 2 - mid) / (gallery.clientWidth * 0.45)));
          gsap.killTweensOf(card);
          gsap.to(card, { rotateY: ratio * 24, rotateZ: 0, skewY: 0, x: 0, y: 0, z: -Math.abs(ratio) * 65, scale: 1, duration: 0.8, ease: 'elastic.out(1.15,0.45)', overwrite: 'auto' });
        });
      };

      const snapToNearest = () => {
        stepping = false;
        const target = galleryCards.reduce((best, card) => {
          const desired = gallery.clientWidth * 0.32 - (card.offsetLeft + card.offsetWidth / 2);
          return Math.abs(desired - state.x) < Math.abs(best - state.x) ? desired : best;
        }, state.x);
        settleTween?.kill();
        settleTarget = target;
        settleTween = gsap.to(state, { x: target, duration: 0.65, ease: 'power3.out', onUpdate: () => setPosition(state.x), onComplete: resetDragTransform });
      };

      const animateTo = (target: number) => {
        settleTween?.kill(); settleTarget = target; stepping = true;
        settleTween = gsap.to(state, {
          x: target, duration: 0.55, ease: 'power3.out',
          onUpdate: renderPosition,
          onComplete: () => { stepping = false; setPosition(state.x); resetDragTransform(); },
        });
      };

      const stepGallery = (dir: number) => {
        if (dragging) return;
        if (stepping) { settleTween?.kill(); state.x = settleTarget; setPosition(state.x); resetDragTransform(); stepping = false; }
        const step = cardStep();
        if (!step) return;
        if (dir > 0) { const f = galleryTrack.firstElementChild; if (!f) return; galleryTrack.append(f); state.x += step; }
        else { const l = galleryTrack.lastElementChild; if (!l) return; galleryTrack.prepend(l); state.x -= step; }
        renderPosition();
        animateTo(state.x - dir * step);
      };

      // Inertia via gsap ticker
      let rafActive = false;
      const tick = () => {
        if (!rafActive || dragging) return;
        if (Math.abs(velocity) > 0.08) { setPosition(state.x + velocity); velocity *= 0.94; applyDragTransform(); }
        else { rafActive = false; gsap.ticker.remove(tick); snapToNearest(); }
      };

      // Pointer drag handlers
      const pointerDown = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if ((e.target as HTMLElement | null)?.closest('[data-gallery-prev],[data-gallery-next]')) return;
        pointerId = e.pointerId; dragging = true; stepping = false; dragDistance = 0;
        settleTween?.kill(); rafActive = false; gsap.ticker.remove(tick);
        gallery.setPointerCapture(e.pointerId);
        lastX = e.clientX; lastTime = performance.now(); velocity = 0;
        galleryCards.forEach(c => gsap.killTweensOf(c));
        gsap.killTweensOf(galleryTrack);
        gallery.classList.add('is-dragging');
      };
      const pointerMove = (e: PointerEvent) => {
        if (!dragging || e.pointerId !== pointerId) return;
        const now = performance.now();
        const delta = e.clientX - lastX;
        dragDistance += Math.abs(delta);
        velocity = delta / Math.max(8, now - lastTime) * 16;
        setPosition(state.x + delta * 1.18);
        applyDragTransform();
        lastX = e.clientX; lastTime = now;
      };
      const pointerUp = (e: PointerEvent) => {
        if (!dragging || e.pointerId !== pointerId) return;
        dragging = false; pointerId = null;
        gallery.releasePointerCapture(e.pointerId);
        gallery.classList.remove('is-dragging');
        rafActive = true; gsap.ticker.add(tick);
      };
      const onClickCapture = (e: MouseEvent) => { if (dragDistance > 6) { e.preventDefault(); e.stopPropagation(); } };
      const onKeydown = (e: KeyboardEvent) => {
        if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        if ((e.target as HTMLElement | null)?.closest('input,textarea,select,[contenteditable]')) return;
        e.preventDefault(); stepGallery(e.key === 'ArrowRight' ? 1 : -1);
      };
      const onFocusIn = (e: FocusEvent) => {
        const card = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-gallery-card]');
        if (!card || dragging) return;
        const gb = gallery.getBoundingClientRect(); const cb = card.getBoundingClientRect();
        if (cb.left >= gb.left && cb.right <= gb.right) return;
        stepGallery(cb.left < gb.left ? -1 : 1);
      };
      const onResize = () => { if (!dragging) { setPosition(state.x); resetDragTransform(); } };

      const prevBtn = gallery.querySelector<HTMLButtonElement>('[data-gallery-prev]');
      const nextBtn = gallery.querySelector<HTMLButtonElement>('[data-gallery-next]');
      gallery.addEventListener('pointerdown', pointerDown);
      gallery.addEventListener('pointermove', pointerMove);
      gallery.addEventListener('pointerup', pointerUp);
      gallery.addEventListener('pointercancel', pointerUp);
      gallery.addEventListener('click', onClickCapture, true);
      gallery.addEventListener('keydown', onKeydown);
      gallery.addEventListener('focusin', onFocusIn);
      prevBtn?.addEventListener('click', () => stepGallery(-1));
      nextBtn?.addEventListener('click', () => stepGallery(1));
      window.addEventListener('resize', onResize);
      setPosition(state.x); resetDragTransform();

      galleryCleanup = () => {
        rafActive = false; gsap.ticker.remove(tick); settleTween?.kill();
        gallery.removeEventListener('pointerdown', pointerDown);
        gallery.removeEventListener('pointermove', pointerMove);
        gallery.removeEventListener('pointerup', pointerUp);
        gallery.removeEventListener('pointercancel', pointerUp);
        gallery.removeEventListener('click', onClickCapture, true);
        gallery.removeEventListener('keydown', onKeydown);
        gallery.removeEventListener('focusin', onFocusIn);
        window.removeEventListener('resize', onResize);
      };
    }

    // ── Reduced motion ────────────────────────────────────────────────
    if (reduceMotion) {
      document.querySelectorAll<HTMLElement>('.project-card, .reveal-up, [data-reveal-text]').forEach(el => { el.style.opacity = '1'; el.style.transform = 'none'; });
      cleanup = () => { menuCleanup(); galleryCleanup?.(); ctx.revert(); };
      return;
    }

    // ── Lenis smooth scroll ───────────────────────────────────────────
    const lenis = new Lenis({ duration: 0.86, smoothWheel: true, wheelMultiplier: 0.82 });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.delayedCall(0.15, () => ScrollTrigger.refresh());

    // ── Page-level snap scroll ────────────────────────────────────────
    // ScrollTrigger owns the snap lifecycle so it waits for Lenis inertia
    // to settle and does not compete with a second ticker-based snapper.
    const snapRoot = document.querySelector<HTMLElement>('main[data-snap-scroll]');
    const snapSections = snapRoot
      ? Array.from(snapRoot.querySelectorAll<HTMLElement>(':scope > section'))
      : [];
    let snapTrigger: ScrollTrigger | undefined;

    if (snapSections.length > 1) {
      const getSnapPoints = () => {
        const maxScroll = ScrollTrigger.maxScroll(window);
        if (maxScroll <= 0) return [0];

        return snapSections.map(section => (
          Math.max(0, Math.min(maxScroll, section.offsetTop - NAV_H())) / maxScroll
        ));
      };

      snapTrigger = ScrollTrigger.create({
        trigger: snapRoot,
        start: 0,
        end: 'max',
        invalidateOnRefresh: true,
        snap: {
          snapTo: value => gsap.utils.snap(getSnapPoints(), value),
          delay: 0.06,
          duration: { min: 0.38, max: 0.95 },
          ease: 'power4.out',
          inertia: false,
          directional: true,
        },
      });
    }

    // ── Scroll reveal ─────────────────────────────────────────────────
    const splitInstances: SplitType[] = [];
    document.querySelectorAll<HTMLElement>('[data-split]').forEach(el => {
      const split = new SplitType(el, { types: 'chars', tagName: 'span' });
      splitInstances.push(split);
      gsap.from(split.chars, { yPercent: 115, opacity: 0, rotateX: -45, stagger: 0.025, duration: 1.05, ease: 'power4.out', delay: 0.25 });
    });
    gsap.utils.toArray<HTMLElement>('.reveal-up, [data-reveal-text]').forEach(el => {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    const workSection = document.querySelector<HTMLElement>('#work');
    if (workSection) {
      const cards = Array.from(workSection.querySelectorAll<HTMLElement>('.project-card'));
      ScrollTrigger.create({
        trigger: workSection, start: 'top 80%', once: true,
        onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.07 }),
      });
    }

    // ── Cursor glow ───────────────────────────────────────────────────
    if (window.matchMedia('(pointer:fine)').matches) {
      const glow = document.querySelector<HTMLElement>('[data-cursor-glow]');
      const move = (e: PointerEvent) => { if (glow) gsap.to(glow, { x: e.clientX, y: e.clientY, opacity: 1, duration: 0.65, ease: 'power2.out', overwrite: true }); };
      window.addEventListener('pointermove', move, { passive: true });
      document.querySelectorAll<HTMLElement>('.magnetic').forEach(el => {
        const enter = (e: PointerEvent) => { const b = el.getBoundingClientRect(); gsap.to(el, { x: (e.clientX - b.left - b.width / 2) * 0.12, y: (e.clientY - b.top - b.height / 2) * 0.18, duration: 0.35 }); };
        const leave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,.45)' });
        el.addEventListener('pointermove', enter);
        el.addEventListener('pointerleave', leave);
      });
      cleanup = () => { menuCleanup(); galleryCleanup?.(); snapTrigger?.kill(); window.removeEventListener('pointermove', move); ctx.revert(); splitInstances.forEach(s => s.revert()); lenis.destroy(); gsap.ticker.remove(raf); };
    } else {
      cleanup = () => { menuCleanup(); galleryCleanup?.(); snapTrigger?.kill(); ctx.revert(); splitInstances.forEach(s => s.revert()); lenis.destroy(); gsap.ticker.remove(raf); };
    }
  });
};

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => cleanup?.(), { once: false });
