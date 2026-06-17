import './Gallery.css';
import coastalImg from '../assets/coastal.png';
import dayImg from '../assets/day.png';
import nightImg from '../assets/night.png';
import sunsetImg from '../assets/sunset.png';
import studioImg from '../assets/studio.png';

const ITEMS = [
  { label: 'Night Session',    cls: 'g-item g-big',   bg: nightImg,   delay: '0.1s' },
  { label: 'Track Day',        cls: 'g-item',         bg: dayImg,     delay: '0.2s' },
  { label: 'Studio Shoot',     cls: 'g-item',         bg: studioImg,  delay: '0.25s' },
  { label: 'Sunset Drive',     cls: 'g-item',         bg: sunsetImg,  delay: '0.3s' },
  { label: 'Coastal Highway',  cls: 'g-item g-wide',  bg: coastalImg, delay: '0.35s' },
];

export default function Gallery() {
  return (
    <section id="gallery" className="section">
      <div className="container">
        <div className="section-header reveal">
          <p className="tag">Visual Stories</p>
          <h2>The Gallery</h2>
          <p className="desc">Every angle tells a story of passion, precision, and performance.</p>
        </div>

        <div className="split">
          <div className="split-content">
            <div className="gallery-grid">
              {ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={`${item.cls} reveal`}
                  style={{ '--d': item.delay, backgroundImage: `url(${item.bg})` }}
                >
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="split-car" />
        </div>
      </div>
    </section>
  );
}
