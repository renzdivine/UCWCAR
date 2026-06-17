import { useEffect, useRef, useState } from 'react';
import Prism from './Prism';
import './Hero.css';

function useCounter(target, active) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t0 = performance.now();
    let raf;
    const run = (now) => {
      const p = Math.min((now - t0) / 2000, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(run);
    };
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [active, target]);
  return val;
}

function StatCard({ icon, count, label, delay, active }) {
  const val = useCounter(count, active);
  return (
    <div className={`stat-card${active ? ' in' : ''}`} style={{ transitionDelay: delay }}>
      <span className="stat-icon">{icon}</span>
      <div>
        <span className="stat-val">{val.toLocaleString()}</span>
        <small>{label}</small>
      </div>
    </div>
  );
}

function smoothScrollTo(href) {
  const el = document.querySelector(href);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
}

export default function Hero({ heroReady }) {
  const [in1, setIn1] = useState(false);

  useEffect(() => {
    if (!heroReady) return;
    const timers = [setTimeout(() => setIn1(true), 100)];
    return () => timers.forEach(clearTimeout);
  }, [heroReady]);

  /* Parallax */
  useEffect(() => {
    const leftEl = document.querySelector('.hero-left');
    const rightEl = document.querySelector('.hero-right');
    const hero = document.getElementById('hero');
    const onScroll = () => {
      const r = Math.min(window.scrollY / hero.offsetHeight, 1);
      const y = `translateY(${r * 44}px)`;
      const o = Math.max(0, 1 - r * 2.2);
      if (leftEl) { leftEl.style.transform = y; leftEl.style.opacity = o; }
      if (rightEl) { rightEl.style.transform = y; rightEl.style.opacity = o; }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const statsActive = in1;

  return (
    <section id="hero" className="hero">
      {/* Prism background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}>
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
        />
      </div>

      <div className="hero-grid" style={{ position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div className="hero-left"> 
          <span className={`badge${in1 ? ' in' : ''}`}>
            <span className="badge-dot" />2026 Limited Edition
          </span>
          <h1 className="hero-title">
            <span className={`tl${in1 ? ' in' : ''}`} style={{ transitionDelay: '0.18s' }}>Drive</span>
            <span className={`tl${in1 ? ' in' : ''}`} style={{ transitionDelay: '0.29s' }}>Beyond</span>
            <span className={`tl accent${in1 ? ' in' : ''}`} style={{ transitionDelay: '0.4s' }}>Excellence</span>
          </h1>
          <p className={`hero-sub${in1 ? ' in' : ''}`}>
            The perfect fusion of luxury, performance, and innovation.
          </p>
          <div className={`hero-btns${in1 ? ' in' : ''}`}>
            <a href="#collection" className="btn-gold" onClick={e => { e.preventDefault(); smoothScrollTo('#collection'); }}>
              Explore Collection →
            </a>
            <a href="#contact" className="btn-ghost" onClick={e => { e.preventDefault(); smoothScrollTo('#contact'); }}>
              Book a Test Drive
            </a>
          </div>
        </div>

        {/* Center — car floats here */}
        <div className="hero-car-space" />

        {/* Right */}
        <div className="hero-right">
          <p className="hero-tagline">
            Crafted<br /><span>for</span><br /><strong>Legends</strong>
          </p>
          <StatCard icon="⊙" count={347} label="km/h Top Speed" delay="0.55s" active={statsActive} />
          <StatCard icon="⚡" count={780} label="Horsepower" delay="0.7s" active={statsActive} />
          <StatCard icon="▭" count={520} label="km Electric Range" delay="0.85s" active={statsActive} />
          <div className={`model-label${in1 ? ' in' : ''}`}>
            <small>Lamborghini</small>
            <strong>Ferzor</strong>
          </div>
        </div>

      </div>

      <div className="scroll-hint">
        <div className="scroll-line" />
        <span>Scroll to explore</span>
      </div>
    </section>
  );
}
