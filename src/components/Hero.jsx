import { useEffect, useState } from 'react';
import Prism from './Prism';
import './Hero.css';

function useCounter(target, active) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!active) return;
    const startTime = performance.now();
    let raf;

    const tick = (now) => {
      const progress = Math.min((now - startTime) / 2000, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - progress, 4))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
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
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
}

export default function Hero({ heroReady, canvasRef }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!heroReady) return;
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, [heroReady]);

  useEffect(() => {
    const leftEl = document.querySelector('.hero-left');
    const rightEl = document.querySelector('.hero-right');
    const hero = document.getElementById('hero');

    const onScroll = () => {
      const ratio = Math.min(window.scrollY / hero.offsetHeight, 1);
      const move = `translateY(${ratio * 44}px)`;
      const opacity = Math.max(0, 1 - ratio * 2.2);

      if (leftEl) { leftEl.style.transform = move; leftEl.style.opacity = opacity; }
      if (rightEl) { rightEl.style.transform = move; rightEl.style.opacity = opacity; }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section id="hero" className="hero">
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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

      <canvas id="carCanvas" ref={canvasRef} />

      <div className="hero-grid" style={{ position: 'relative', zIndex: 6 }}>
        <div className="hero-left">
          <span className={`badge${visible ? ' in' : ''}`}>
            <span className="badge-dot" />2026 Limited Edition
          </span>
          <h1 className="hero-title">
            <span className={`tl${visible ? ' in' : ''}`} style={{ transitionDelay: '0.18s' }}>Drive</span>
            <span className={`tl${visible ? ' in' : ''}`} style={{ transitionDelay: '0.29s' }}>Beyond</span>
            <span className={`tl accent${visible ? ' in' : ''}`} style={{ transitionDelay: '0.4s' }}>Excellence</span>
          </h1>
          <p className={`hero-sub${visible ? ' in' : ''}`}>
            The perfect fusion of luxury, performance, and innovation.
          </p>
          <div className={`hero-btns${visible ? ' in' : ''}`}>
            <a href="#collection" className="btn-gold" onClick={(e) => { e.preventDefault(); smoothScrollTo('#collection'); }}>
              Explore Collection →
            </a>
            <a href="#contact" className="btn-ghost" onClick={(e) => { e.preventDefault(); smoothScrollTo('#contact'); }}>
              Book a Test Drive
            </a>
          </div>
        </div>

        <div className="hero-car-space" />

        <div className="hero-right">
          <p className="hero-tagline">
            Crafted<br /><span>for</span><br /><strong>Legends</strong>
          </p>
          <StatCard icon="⊙" count={347} label="km/h Top Speed"    delay="0.55s" active={visible} />
          <StatCard icon="⚡" count={780} label="Horsepower"        delay="0.7s"  active={visible} />
          <StatCard icon="▭" count={520} label="km Electric Range" delay="0.85s" active={visible} />
          <div className={`model-label${visible ? ' in' : ''}`}>
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
