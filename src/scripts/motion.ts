/**
 * src/scripts/motion.ts — Système d'animation global piloté par attributs HTML.
 *
 * Dépend de la librairie 'motion' (JS pur).
 * Re-initialisé automatiquement sur 'astro:page-load' pour la navigation ClientRouter.
 */

import { animate, inView, scroll, stagger } from "motion";

export function initMotionSystem() {
  if (typeof window === "undefined") return;

  // 1. Détection des contraintes utilisateur & appareil
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobileOrTouch = window.innerWidth < 768 || "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // ── A. Reveals au scroll (data-reveal="up|left|right|zoom|fade") ────────────
  const revealElements = document.querySelectorAll<HTMLElement>("[data-reveal]");

  revealElements.forEach((el) => {
    if (el.dataset.motionDone) return;

    const direction = el.dataset.reveal || "up";
    const delay = parseFloat(el.dataset.revealDelay || "0") / 1000;

    let initialTransform = "none";
    if (!prefersReducedMotion) {
      if (direction === "up") initialTransform = "translateY(30px)";
      else if (direction === "left") initialTransform = "translateX(-30px)";
      else if (direction === "right") initialTransform = "translateX(30px)";
      else if (direction === "zoom") initialTransform = "scale(0.92)";
    }

    // État initial
    el.style.opacity = "0";
    if (!prefersReducedMotion) el.style.transform = initialTransform;

    inView(
      el,
      () => {
        el.dataset.motionDone = "true";
        animate(
          el,
          {
            opacity: [0, 1],
            transform: prefersReducedMotion
              ? ["none", "none"]
              : [initialTransform, "none"],
          },
          {
            duration: 0.7,
            delay: delay,
            easing: [0.22, 1, 0.36, 1],
          }
        );
      },
      { amount: 0.15 }
    );
  });

  // ── B. Reveals en cascade (data-stagger sur le parent) ──────────────────────
  const staggerParents = document.querySelectorAll<HTMLElement>("[data-stagger]");

  staggerParents.forEach((parent) => {
    if (parent.dataset.motionDone) return;

    const children = Array.from(parent.children) as HTMLElement[];
    const step = parseFloat(parent.dataset.stagger || "0.08");

    children.forEach((child) => {
      child.style.opacity = "0";
      if (!prefersReducedMotion) child.style.transform = "translateY(24px)";
    });

    inView(
      parent,
      () => {
        parent.dataset.motionDone = "true";
        animate(
          children,
          {
            opacity: [0, 1],
            transform: prefersReducedMotion
              ? ["none", "none"]
              : ["translateY(24px)", "translateY(0px)"],
          },
          {
            duration: 0.6,
            delay: stagger(step),
            easing: [0.22, 1, 0.36, 1],
          }
        );
      },
      { amount: 0.1 }
    );
  });

  // ── C. Effet Parallaxe (data-parallax="0.15") ──────────────────────────────
  if (!prefersReducedMotion && !isMobileOrTouch) {
    const parallaxElements = document.querySelectorAll<HTMLElement>("[data-parallax]");

    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || "0.15");
      scroll(
        animate(el, {
          transform: [`translateY(0px)`, `translateY(${speed * 120}px)`],
        }),
        { target: el, offset: ["start end", "end start"] }
      );
    });
  }

  // ── D. Compteurs animés (data-counter="1250") ───────────────────────────────
  const counterElements = document.querySelectorAll<HTMLElement>("[data-counter]");

  counterElements.forEach((el) => {
    if (el.dataset.counterDone) return;

    const targetVal = parseInt(el.dataset.counter || "0", 10);
    const suffix = el.dataset.counterSuffix || "";

    inView(
      el,
      () => {
        el.dataset.counterDone = "true";
        if (prefersReducedMotion) {
          el.textContent = `${targetVal.toLocaleString("fr-FR")}${suffix}`;
          return;
        }

        const obj = { val: 0 };
        animate(
          (progress) => {
            const current = Math.round(progress * targetVal);
            el.textContent = `${current.toLocaleString("fr-FR")}${suffix}`;
          },
          { duration: 1.6, easing: [0.22, 1, 0.36, 1] }
        );
      },
      { amount: 0.5 }
    );
  });

  // ── E. Tilt 3D au survol (data-tilt) ────────────────────────────────────────
  if (!prefersReducedMotion && !isMobileOrTouch) {
    const tiltElements = document.querySelectorAll<HTMLElement>("[data-tilt]");

    tiltElements.forEach((card) => {
      if (card.dataset.tiltInitialized) return;
      card.dataset.tiltInitialized = "true";

      card.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const tiltX = ((y - centerY) / centerY) * -6; // max 6 deg
        const tiltY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        card.style.transition = "transform 0.1s ease-out";
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        card.style.transition = "transform 0.5s ease-out";
      });
    });
  }

  // ── F. Bouton Magnétique (data-magnetic) ────────────────────────────────────
  if (!prefersReducedMotion && !isMobileOrTouch) {
    const magneticElements = document.querySelectorAll<HTMLElement>("[data-magnetic]");

    magneticElements.forEach((btn) => {
      if (btn.dataset.magneticInitialized) return;
      btn.dataset.magneticInitialized = "true";

      btn.addEventListener("mousemove", (e: MouseEvent) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        btn.style.transition = "transform 0.1s ease-out";
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "translate(0px, 0px)";
        btn.style.transition = "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)";
      });
    });
  }

  // ── G. Tracé de ligne SVG (data-draw) ───────────────────────────────────────
  const drawElements = document.querySelectorAll<SVGPathElement>("path[data-draw]");

  drawElements.forEach((pathEl) => {
    if (pathEl.dataset.drawDone) return;

    try {
      const length = pathEl.getTotalLength();
      pathEl.style.strokeDasharray = `${length}`;
      pathEl.style.strokeDashoffset = `${length}`;

      inView(
        pathEl,
        () => {
          pathEl.dataset.drawDone = "true";
          if (prefersReducedMotion) {
            pathEl.style.strokeDashoffset = "0";
            return;
          }

          animate(
            pathEl,
            { strokeDashoffset: [length, 0] },
            { duration: 1.4, easing: [0.22, 1, 0.36, 1] }
          );
        },
        { amount: 0.2 }
      );
    } catch {
      // Ignorer si pas d'élément géométrique mesurable
    }
  });

  // ── H. Réticule suiveur de souris (Crosshair) ──────────────────────────────
  if (!prefersReducedMotion && !isMobileOrTouch) {
    const crosshair = document.getElementById("geotopo-crosshair");
    const darkSections = document.querySelectorAll<HTMLElement>("[data-crosshair]");

    if (crosshair && darkSections.length > 0) {
      let isInsideDarkSection = false;

      document.addEventListener("mousemove", (e: MouseEvent) => {
        if (isInsideDarkSection) {
          crosshair.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      });

      darkSections.forEach((section) => {
        section.addEventListener("mouseenter", () => {
          isInsideDarkSection = true;
          crosshair.classList.add("is-visible");
        });
        section.addEventListener("mouseleave", () => {
          isInsideDarkSection = false;
          crosshair.classList.remove("is-visible");
        });
      });
    }
  }
}

// Initialisation globale
if (typeof window !== "undefined") {
  // Poser la classe .js sur html
  document.documentElement.classList.add("js");

  // Initialisation initiale
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => initMotionSystem());
  } else {
    setTimeout(initMotionSystem, 100);
  }

  // Réinitialisation lors de la navigation Astro ClientRouter
  document.addEventListener("astro:page-load", () => {
    initMotionSystem();
  });
}
