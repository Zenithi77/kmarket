'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  life: number;
  maxLife: number;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  pulseSpeed: number;
  pulseOffset: number;
}

export default function ComingSoonPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const timeRef = useRef(0);

  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Initialize stars
  const initStars = useCallback((width: number, height: number) => {
    const stars: Star[] = [];
    const count = Math.floor((width * height) / 2000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        speed: Math.random() * 0.15 + 0.02,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }
    starsRef.current = stars;
  }, []);

  // Initialize nebulae
  const initNebulae = useCallback((width: number, height: number) => {
    const colors = [
      '255, 120, 50',   // orange
      '130, 80, 220',   // purple
      '50, 140, 255',   // blue
      '255, 60, 120',   // pink
      '80, 200, 255',   // cyan
    ];
    const nebulae: Nebula[] = [];
    for (let i = 0; i < 5; i++) {
      nebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 250 + 150,
        color: colors[i % colors.length],
        opacity: Math.random() * 0.06 + 0.02,
        pulseSpeed: Math.random() * 0.003 + 0.001,
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
    nebulaeRef.current = nebulae;
  }, []);

  // Spawn shooting star
  const spawnShootingStar = useCallback((width: number, height: number) => {
    const angle = Math.random() * 0.5 + 0.3;
    shootingStarsRef.current.push({
      x: Math.random() * width * 0.8,
      y: Math.random() * height * 0.4,
      length: Math.random() * 120 + 60,
      speed: Math.random() * 8 + 6,
      angle,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    });
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
      initNebulae(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      timeRef.current += 1;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient background
      const bgGrad = ctx.createRadialGradient(
        width * 0.5, height * 0.4, 0,
        width * 0.5, height * 0.4, Math.max(width, height)
      );
      bgGrad.addColorStop(0, '#0d0d1a');
      bgGrad.addColorStop(0.3, '#070714');
      bgGrad.addColorStop(0.7, '#04040e');
      bgGrad.addColorStop(1, '#010108');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Nebulae
      nebulaeRef.current.forEach((n) => {
        const pulse = Math.sin(timeRef.current * n.pulseSpeed + n.pulseOffset) * 0.3 + 0.7;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius);
        grad.addColorStop(0, `rgba(${n.color}, ${n.opacity * pulse})`);
        grad.addColorStop(0.5, `rgba(${n.color}, ${n.opacity * pulse * 0.3})`);
        grad.addColorStop(1, `rgba(${n.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(n.x - n.radius, n.y - n.radius, n.radius * 2, n.radius * 2);
      });

      // Stars
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.twinkleOffset) * 0.4 + 0.6;
        const alpha = star.opacity * twinkle;

        // Glow
        if (star.size > 1.5) {
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4);
          glow.addColorStop(0, `rgba(200, 220, 255, ${alpha * 0.3})`);
          glow.addColorStop(1, 'rgba(200, 220, 255, 0)');
          ctx.fillStyle = glow;
          ctx.fillRect(star.x - star.size * 4, star.y - star.size * 4, star.size * 8, star.size * 8);
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
        ctx.fill();

        // Slow drift
        star.y += star.speed * 0.3;
        if (star.y > height + 5) {
          star.y = -5;
          star.x = Math.random() * width;
        }
      });

      // Shooting stars
      if (Math.random() < 0.012) {
        spawnShootingStar(width, height);
      }

      shootingStarsRef.current = shootingStarsRef.current.filter((s) => {
        s.life += 1;
        const progress = s.life / s.maxLife;
        s.opacity = progress < 0.1 ? progress * 10 : progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;

        // Draw tail
        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(0.7, `rgba(200, 220, 255, ${s.opacity * 0.4})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${s.opacity})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(s.x, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Head glow
        const headGlow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
        headGlow.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        headGlow.addColorStop(1, `rgba(255, 255, 255, 0)`);
        ctx.fillStyle = headGlow;
        ctx.fillRect(s.x - 6, s.y - 6, 12, 12);

        return s.life < s.maxLife;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initStars, initNebulae, spawnShootingStar]);

  // Countdown timer
  useEffect(() => {
    setMounted(true);
    const launchDate = new Date('2026-03-26T00:00:00');

    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference > 0) {
        setDays(Math.floor(difference / (1000 * 60 * 60 * 24)));
        setHours(Math.floor((difference / (1000 * 60 * 60)) % 24));
        setMinutes(Math.floor((difference / 1000 / 60) % 60));
        setSeconds(Math.floor((difference / 1000) % 60));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#010108]">
      {/* Space Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">

        {/* Logo */}
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 mb-8 shadow-2xl shadow-orange-500/30 ring-1 ring-orange-400/20">
            <span className="text-white text-4xl font-black drop-shadow-lg">K</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight drop-shadow-[0_0_40px_rgba(255,140,50,0.15)]">
            K<span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Market</span>
          </h1>
          <p className="mt-3 text-gray-400/80 text-base md:text-lg font-light tracking-widest uppercase">
            Online Shop
          </p>
        </div>

        {/* Main heading */}
        <div className="text-center max-w-3xl mb-14">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-orange-500/60" />
            <span className="text-orange-400/90 text-xs md:text-sm font-semibold uppercase tracking-[0.4em]">Coming Soon</span>
            <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-orange-500/60" />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Something amazing is<br />
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">on its way</span>
          </h2>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 md:gap-5 mb-16 w-full max-w-xl">
          {[
            { value: days, label: 'Days' },
            { value: hours, label: 'Hours' },
            { value: minutes, label: 'Minutes' },
            { value: seconds, label: 'Seconds' },
          ].map((item, i) => (
            <div key={i} className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-b from-orange-500/30 via-purple-500/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
              <div className="relative bg-white/[0.04] backdrop-blur-md border border-white/[0.08] rounded-2xl p-4 md:p-7 text-center hover:bg-white/[0.06] transition-all duration-500">
                <div className="text-4xl md:text-6xl font-black text-white mb-2 tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  {mounted ? String(item.value).padStart(2, '0') : '--'}
                </div>
                <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.25em] font-medium">
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="flex items-center gap-5">
          <a
            href="https://www.facebook.com/KMarket0711"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/10 hover:shadow-[0_0_20px_rgba(255,140,50,0.15)] transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/kmarketmongolia/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-11 h-11 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-gray-400 hover:text-orange-400 hover:border-orange-500/40 hover:bg-orange-500/10 hover:shadow-[0_0_20px_rgba(255,140,50,0.15)] transition-all duration-300"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
          </a>
        </div>

        {/* Footer */}
        <p className="mt-12 text-gray-700 text-xs tracking-wider">
          &copy; 2026 KMarket. All rights reserved.
        </p>
      </div>

    </div>
  );
}
