import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_ITEMS = [
  { href: '#hero',       label: 'Home',       section: 'hero' },
  { href: '#collection', label: 'Collection', section: 'collection' },
  { href: '#models',     label: 'Models',     section: 'models' },
  { href: '#gallery',    label: 'Gallery',    section: 'gallery' },
  { href: '#experience', label: 'Experience', section: 'experience' },
  { href: '#contact',    label: 'Contact',    section: 'contact' },
];

function smoothScrollTo(href) {
  const el = document.querySelector(href);
  if (el) {
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  }
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -70% 0px' }
    );

    document.querySelectorAll('section[id]').forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const handleLink = (href) => {
    setMenuOpen(false);
    smoothScrollTo(href);
  };

  return (
    <nav id="navbar" className={scrolled ? 'scrolled' : ''}>
      <div className="nav-inner">
        <a href="#hero" className="nav-logo" onClick={(e) => { e.preventDefault(); handleLink('#hero'); }}>
          UCW<span className="logo-dot" />
        </a>

        <ul className={`nav-links${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map(({ href, label, section }) => (
            <li key={section}>
              <a
                href={href}
                className={`nav-link${activeSection === section ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleLink(href); setActiveSection(section); }}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href="#contact" className="btn-gold" onClick={(e) => { e.preventDefault(); handleLink('#contact'); }}>
            Book Test Drive
          </a>
          <button
            className={`hamburger${menuOpen ? ' active' : ''}`}
            aria-label="Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
}
