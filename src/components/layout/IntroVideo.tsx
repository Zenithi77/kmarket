'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

const SESSION_KEY = 'kmarket-intro-seen';
// Bump this whenever the intro clip or morph behavior changes, so returning
// visitors see/get the new one instead of skipping based on a stale flag.
const INTRO_VERSION = '4';
// How long before the video ends to start morphing the wordmark into the header logo.
const MORPH_LEAD = 0.9;
const MORPH_DURATION = 700;

interface DockRect {
  top: number;
  left: number;
  width: number;
  height: number;
  fontSize: number;
  opacity: number;
}

export default function IntroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const morphStarted = useRef(false);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [morphing, setMorphing] = useState(false);
  const [docked, setDocked] = useState(false);
  const [dockRect, setDockRect] = useState<DockRect | null>(null);

  // Candidate sources in priority order; picked via JS (not <source media>,
  // which was found to fire a spurious error event in some engines when
  // paired with React's rendering of the <video> element).
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(SESSION_KEY);
      if (seen === INTRO_VERSION) return;
    } catch {
      // sessionStorage unavailable (privacy mode etc.) — just skip the intro
      return;
    }
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    setCandidates(isMobile ? ['/videos/intro-mobile.mp4', '/videos/intro.mp4'] : ['/videos/intro.mp4']);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    // Safety timeout in case playback/morph events never fire.
    const safety = setTimeout(dismiss, 8000);
    return () => clearTimeout(safety);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const dismiss = () => {
    setClosing(true);
    try {
      sessionStorage.setItem(SESSION_KEY, INTRO_VERSION);
    } catch {
      // ignore
    }
    setTimeout(() => setVisible(false), 450);
  };

  const startMorph = () => {
    if (morphStarted.current) return;
    morphStarted.current = true;

    // Prefer docking onto the real "KMarket" wordmark in the header; if it's
    // hidden (mobile, where only the icon shows), dock onto the logo icon
    // instead so the wordmark still shrinks into *something* real.
    const textEl = document.getElementById('header-logo-text');
    const textRect = textEl?.getBoundingClientRect();
    const hasText = !!textRect && textRect.width > 0 && textRect.height > 0;

    const target = hasText ? textRect! : document.getElementById('header-logo-icon')?.getBoundingClientRect();

    if (target) {
      const fontSize = hasText
        ? parseFloat(window.getComputedStyle(textEl!).fontSize)
        : target.height * 0.6;
      setDockRect({
        top: target.top,
        left: target.left,
        width: target.width,
        height: target.height,
        fontSize,
        opacity: hasText ? 1 : 0,
      });
    }

    setMorphing(true);
    // Double rAF so the browser commits the starting (centered) layout
    // before we flip the target styles — otherwise the transition has
    // nothing to animate *from*.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDocked(true));
    });
    setTimeout(dismiss, MORPH_DURATION + 60);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    if (v.duration - v.currentTime <= MORPH_LEAD) {
      startMorph();
    }
  };

  const handleError = () => {
    // If the current candidate genuinely fails (not found, bad codec, etc.),
    // try the next one before giving up entirely.
    setCandidateIndex((i) => {
      const next = i + 1;
      if (!candidates || next >= candidates.length) {
        dismiss();
        return i;
      }
      return next;
    });
  };

  if (!visible || !candidates) return null;

  return (
    <div
      className={`fixed inset-0 z-[200] bg-[#cabcae] transition-opacity duration-[450ms] ${
        closing ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        key={candidates[candidateIndex]}
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
          morphing ? 'opacity-0' : 'opacity-100'
        }`}
        src={candidates[candidateIndex]}
        autoPlay
        muted
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={startMorph}
        onError={handleError}
      />

      {morphing && (
        <span
          aria-hidden="true"
          className="fixed font-display font-extrabold tracking-tight text-primary-600 whitespace-nowrap"
          style={{
            transitionProperty: 'top, left, font-size, opacity, transform',
            transitionDuration: `${MORPH_DURATION}ms`,
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            ...(docked && dockRect
              ? {
                  top: dockRect.top,
                  left: dockRect.left,
                  fontSize: dockRect.fontSize,
                  lineHeight: `${dockRect.height}px`,
                  opacity: dockRect.opacity,
                  transform: 'none',
                }
              : {
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '4rem',
                  opacity: 1,
                }),
          }}
        >
          KMarket
        </span>
      )}

      {!morphing && (
        <button
          onClick={dismiss}
          className="absolute bottom-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white text-sm font-semibold backdrop-blur-md transition-colors"
        >
          Алгасах
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
