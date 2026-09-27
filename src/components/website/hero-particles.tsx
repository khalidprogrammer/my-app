"use client";

import * as React from "react";

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  gold: boolean;
  phase: number;
  speed: number;
};

/**
 * HeroParticles — lightweight canvas particle field for the hero backdrop:
 * soft gold/white motes drifting upward with faint connecting lines.
 * Decorative only (aria-hidden), pointer-transparent, DPR-aware, and paused
 * when the tab is hidden, the hero is off-screen, or reduced motion is set.
 */
function HeroParticles({ density = 55, className }: { density?: number; className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let particles: Particle[] = [];
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(density, Math.floor((width * height) / 22000));
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const spawn = (anywhere = false): Particle => ({
      x: Math.random() * width,
      y: anywhere ? Math.random() * height : height + 8,
      r: 0.8 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.22,
      vy: -(0.12 + Math.random() * 0.38),
      gold: Math.random() < 0.35,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 1.2,
    });

    let last = performance.now();
    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(64, now - last) / 16.667;
      last = now;
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.phase += 0.02 * p.speed * dt;
        if (p.y < -10 || p.x < -10 || p.x > width + 10) Object.assign(p, spawn());
      }

      // Faint links between close neighbors (capped for performance).
      ctx.lineWidth = 1;
      const linkDist = 110;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]!;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]!;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDist * linkDist) {
            const alpha = 0.1 * (1 - Math.sqrt(d2) / linkDist);
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        const twinkle = 0.45 + 0.55 * Math.abs(Math.sin(p.phase));
        const color = p.gold ? "245, 158, 11" : "255, 255, 255";
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        glow.addColorStop(0, `rgba(${color}, ${(0.75 * twinkle).toFixed(3)})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${color}, ${(0.9 * twinkle).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      const hidden = document.hidden;
      if (hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && !entry.isIntersecting) {
          running = false;
          cancelAnimationFrame(raf);
        } else if (!document.hidden && !running) {
          running = true;
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0 },
    );

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    observer.observe(canvas);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      observer.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className ?? "pointer-events-none absolute inset-0 size-full"}
    />
  );
}

export { HeroParticles };
