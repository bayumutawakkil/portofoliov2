import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

// Tell the inline head fallback that the motion bundle actually booted.
document.documentElement.classList.add('js-ready');
document.documentElement.dataset.motionReady = 'true';

let cleanup: (() => void) | undefined;

const init = () => {
  cleanup?.();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = gsap.context(() => {
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
      if (event.key === 'Escape') {
        event.preventDefault();
        setMenu(false);
        menuButton.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = [menuButton, ...Array.from(mobileMenu.querySelectorAll<HTMLElement>('a[href], button'))]
        .filter((element) => element.offsetParent !== null);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    menuButton?.addEventListener('click', toggleMenu);
    document.addEventListener('keydown', onMenuKeydown);
    mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
    const menuCleanup = () => document.removeEventListener('keydown', onMenuKeydown);

    const gallery = document.querySelector<HTMLElement>('[data-drag-gallery]');
    const galleryTrack = gallery?.querySelector<HTMLElement>('[data-gallery-track]');
    const galleryCards = gallery ? Array.from(gallery.querySelectorAll<HTMLElement>('[data-gallery-card]')) : [];
    const galleryProgress = gallery?.querySelector<HTMLElement>('[data-gallery-progress]');
    let galleryCleanup: (() => void) | undefined;

    if (gallery && galleryTrack && galleryCards.length > 0) {
      const state = { x: -Math.min(window.innerWidth * (window.matchMedia('(max-width: 640px)').matches ? 0.48 : 0.1), 150) };
      let velocity = 0;
      let lastX = 0;
      let lastTime = 0;
      let pointerId: number | null = null;
      let dragging = false;
      let settleTween: gsap.core.Tween | undefined;
      let settleTarget = 0;
      let stepping = false;
      let snapCall: gsap.core.Tween | undefined;
      let rafActive = false;

      const cardStep = () => {
        // Read the live DOM order: recycling moves cards around, so the cached
        // galleryCards array can no longer describe first/second position.
        const children = galleryTrack.children;
        const first = children[0] as HTMLElement | undefined;
        const second = children[1] as HTMLElement | undefined;
        const step = first && second ? second.offsetLeft - first.offsetLeft : first?.offsetWidth ?? 0;
        return Math.abs(step);
      };
      const recycleTrack = () => {
        const step = cardStep();
        if (!Number.isFinite(step) || step <= 0) return;
        let guard = 0;
        while (state.x < -step && guard++ < 100) {
          const first = galleryTrack.firstElementChild;
          if (!first) break;
          galleryTrack.append(first);
          state.x += step;
        }
        guard = 0;
        while (state.x > 0 && guard++ < 100) {
          const last = galleryTrack.lastElementChild;
          if (!last) break;
          galleryTrack.prepend(last);
          state.x -= step;
        }
      };
      const renderPosition = () => {
        gsap.set(galleryTrack, { x: state.x });
        const nearest = galleryCards.reduce((closest, card) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2 + state.x;
          const distance = Math.abs(cardCenter - gallery.clientWidth * 0.32);
          return distance < closest.distance ? { index: Number(card.dataset.index ?? 0), distance } : closest;
        }, { index: 0, distance: Number.POSITIVE_INFINITY });
        if (galleryProgress) {
          const total = String(galleryCards.length).padStart(2, '0');
          galleryProgress.textContent = `${String(nearest.index + 1).padStart(2, '0')} / ${total}`;
        }
      };
      const setPosition = (value: number) => {
        state.x = value;
        recycleTrack();
        renderPosition();
      };
      const refreshBounds = () => {
        if (!dragging) setPosition(state.x);
      };
      const applyDragTransform = () => {
        const tilt = Math.max(-2.5, Math.min(2.5, velocity * 0.08));
        gsap.set(galleryTrack, { skewX: tilt, rotate: tilt * 0.06 });
        const galleryBounds = gallery.getBoundingClientRect();
        const galleryCenter = galleryBounds.left + gallery.clientWidth * 0.5;

        galleryCards.forEach((card) => {
          const cardBounds = card.getBoundingClientRect();
          const distance = cardBounds.left + card.offsetWidth / 2 - galleryCenter;
          const influence = Math.max(-1, Math.min(1, distance / (gallery.clientWidth * 0.65)));
          gsap.set(card, {
            rotate: influence * velocity * -0.05,
            scale: 1 - Math.min(0.025, Math.abs(influence * velocity) * 0.0012),
            y: Math.sin(influence * Math.PI) * Math.min(10, Math.abs(velocity) * 0.3),
          });
        });
      };
      const resetDragTransform = () => {
        gsap.to(galleryTrack, { skewX: 0, rotate: 0, duration: 0.6, ease: 'power2.out', overwrite: true });
        galleryCards.forEach((card) => {
          gsap.killTweensOf(card);
          gsap.to(card, { rotate: 0, scale: 1, y: 0, duration: 0.75, ease: 'elastic.out(1.1, 0.4)', overwrite: true });
        });
      };
      const snapToNearest = () => {
        stepping = false;
        const target = galleryCards.reduce((closest, card) => {
          const desired = gallery.clientWidth * 0.32 - (card.offsetLeft + card.offsetWidth / 2);
          return Math.abs(desired - state.x) < Math.abs(closest - state.x) ? desired : closest;
        }, state.x);
        settleTween?.kill();
        settleTarget = target;
        settleTween = gsap.to(state, {
          x: target,
          duration: 0.72,
          ease: 'power3.out',
          onUpdate: () => setPosition(state.x),
          onComplete: resetDragTransform,
        });
      };
      const animateTo = (target: number) => {
        settleTween?.kill();
        settleTarget = target;
        stepping = true;
        settleTween = gsap.to(state, {
          x: target,
          duration: 0.55,
          ease: 'power3.out',
          onUpdate: renderPosition,
          onComplete: () => {
            stepping = false;
            setPosition(state.x);
            resetDragTransform();
          },
        });
      };
      const stepGallery = (direction: number) => {
        if (dragging) return;
        stopInertia();
        snapCall?.kill();
        // Snap any in-flight step to its destination first so rapid clicks
        // always advance from a normalised position instead of a mid-tween one.
        if (stepping) {
          settleTween?.kill();
          state.x = settleTarget;
          setPosition(state.x);
          resetDragTransform();
          stepping = false;
        }
        const step = cardStep();
        if (!step) return;
        // Rotate one card before the tween so the track stays seamless and the
        // post-tween normalisation cannot cancel out the movement.
        if (direction > 0) {
          const first = galleryTrack.firstElementChild;
          if (!first) return;
          galleryTrack.append(first);
          state.x += step;
        } else {
          const last = galleryTrack.lastElementChild;
          if (!last) return;
          galleryTrack.prepend(last);
          state.x -= step;
        }
        renderPosition();
        animateTo(state.x - direction * step);
      };
      const tick = () => {
        if (!rafActive || dragging) return;
        if (Math.abs(velocity) > 0.08) {
          const next = state.x + velocity;
          setPosition(next);
          velocity *= 0.94;
          applyDragTransform();
        } else {
          rafActive = false;
          snapToNearest();
        }
      };
      const startInertia = () => {
        rafActive = true;
        gsap.ticker.add(tick);
      };
      const stopInertia = () => {
        rafActive = false;
        gsap.ticker.remove(tick);
      };
      let dragDistance = 0;

      const pointerDown = (event: PointerEvent) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        if ((event.target as HTMLElement | null)?.closest('[data-gallery-prev], [data-gallery-next]')) return;
        pointerId = event.pointerId;
        dragging = true;
        stepping = false;
        dragDistance = 0;
        settleTween?.kill();
        stopInertia();
        gallery.setPointerCapture(pointerId);
        lastX = event.clientX;
        lastTime = performance.now();
        velocity = 0;
        galleryCards.forEach((card) => gsap.killTweensOf(card));
        gsap.killTweensOf(galleryTrack);
        gallery.classList.add('is-dragging');
      };
      const pointerMove = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        const now = performance.now();
        const delta = event.clientX - lastX;
        dragDistance += Math.abs(delta);
        const elapsed = Math.max(8, now - lastTime);
        velocity = delta / elapsed * 16;
        setPosition(state.x + delta * 1.18);
        applyDragTransform();
        lastX = event.clientX;
        lastTime = now;
      };
      const pointerUp = (event: PointerEvent) => {
        if (!dragging || event.pointerId !== pointerId) return;
        dragging = false;
        pointerId = null;
        gallery.releasePointerCapture(event.pointerId);
        gallery.classList.remove('is-dragging');
        startInertia();
      };
      const onClickCapture = (event: MouseEvent) => {
        if (dragDistance > 6) {
          event.preventDefault();
          event.stopPropagation();
        }
      };
      const wheel = (event: WheelEvent) => {
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
        event.preventDefault();
        setPosition(state.x - event.deltaX * 1.12);
        velocity = -event.deltaX * 0.18;
        applyDragTransform();
        stopInertia();
        snapCall?.kill();
        snapCall = gsap.delayedCall(0.18, snapToNearest);
      };
      const prevButton = gallery.querySelector<HTMLButtonElement>('[data-gallery-prev]');
      const nextButton = gallery.querySelector<HTMLButtonElement>('[data-gallery-next]');
      const prevClick = () => stepGallery(-1);
      const nextClick = () => stepGallery(1);
      const keydown = (event: KeyboardEvent) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        if ((event.target as HTMLElement | null)?.closest('input, textarea, select, [contenteditable]')) return;
        event.preventDefault();
        stepGallery(event.key === 'ArrowRight' ? 1 : -1);
      };
      const focusIn = (event: FocusEvent) => {
        const card = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-gallery-card]');
        if (!card || dragging) return;
        const bounds = gallery.getBoundingClientRect();
        const rect = card.getBoundingClientRect();
        if (rect.left >= bounds.left && rect.right <= bounds.right) return;
        stepGallery(rect.left < bounds.left ? -1 : 1);
      };
      const resize = () => refreshBounds();
      gallery.addEventListener('pointerdown', pointerDown);
      gallery.addEventListener('pointermove', pointerMove);
      gallery.addEventListener('pointerup', pointerUp);
      gallery.addEventListener('pointercancel', pointerUp);
      gallery.addEventListener('click', onClickCapture, true);
      gallery.addEventListener('wheel', wheel, { passive: false });
      gallery.addEventListener('keydown', keydown);
      gallery.addEventListener('focusin', focusIn);
      prevButton?.addEventListener('click', prevClick);
      nextButton?.addEventListener('click', nextClick);
      window.addEventListener('resize', resize);
      refreshBounds();
      galleryCleanup = () => {
        stopInertia();
        settleTween?.kill();
        snapCall?.kill();
        gallery.removeEventListener('pointerdown', pointerDown);
        gallery.removeEventListener('pointermove', pointerMove);
        gallery.removeEventListener('pointerup', pointerUp);
        gallery.removeEventListener('pointercancel', pointerUp);
        gallery.removeEventListener('click', onClickCapture, true);
        gallery.removeEventListener('wheel', wheel);
        gallery.removeEventListener('keydown', keydown);
        gallery.removeEventListener('focusin', focusIn);
        prevButton?.removeEventListener('click', prevClick);
        nextButton?.removeEventListener('click', nextClick);
        window.removeEventListener('resize', resize);
      };
    }

    if (reduceMotion) {
      document.querySelectorAll<HTMLElement>('.project-card, .reveal-up, [data-reveal-text]').forEach((element) => {
        element.style.opacity = '1';
        element.style.transform = 'none';
      });
      cleanup = () => {
        menuCleanup();
        galleryCleanup?.();
        ctx.revert();
      };
      return;
    }

    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
    const splitInstances: SplitType[] = [];
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((element) => {
      const split = new SplitType(element, { types: 'chars', tagName: 'span' });
      splitInstances.push(split);
      gsap.from(split.chars, { yPercent: 115, opacity: 0, rotateX: -45, stagger: 0.025, duration: 1.05, ease: 'power4.out', delay: 0.25 });
    });
    gsap.utils.toArray<HTMLElement>('.reveal-up, .project-card, [data-reveal-text]').forEach((element) => {
      gsap.to(element, { opacity: 1, y: 0, duration: 0.85, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 88%', once: true } });
    });
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);


    if (window.matchMedia('(pointer:fine)').matches) {
      const glow = document.querySelector<HTMLElement>('[data-cursor-glow]');
      const move = (event: PointerEvent) => {
        if (glow) gsap.to(glow, { x: event.clientX, y: event.clientY, opacity: 1, duration: 0.65, ease: 'power2.out', overwrite: true });
      };
      window.addEventListener('pointermove', move, { passive: true });
      document.querySelectorAll<HTMLElement>('.magnetic').forEach((element) => {
        const enter = (event: PointerEvent) => {
          const bounds = element.getBoundingClientRect();
          gsap.to(element, { x: (event.clientX - bounds.left - bounds.width / 2) * 0.12, y: (event.clientY - bounds.top - bounds.height / 2) * 0.18, duration: 0.35 });
        };
        const leave = () => gsap.to(element, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1,.45)' });
        element.addEventListener('pointermove', enter);
        element.addEventListener('pointerleave', leave);
      });
      cleanup = () => {
        menuCleanup();
        galleryCleanup?.();
        window.removeEventListener('pointermove', move);
        ctx.revert();
        splitInstances.forEach((split) => split.revert());
        lenis.destroy();
        gsap.ticker.remove(raf);
      };
    } else {
      cleanup = () => {
        menuCleanup();
        galleryCleanup?.();
        ctx.revert();
        splitInstances.forEach((split) => split.revert());
        lenis.destroy();
        gsap.ticker.remove(raf);
      };
    }
  });
};

document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => cleanup?.(), { once: false });
