import './Gallery.css';
import coastalImg from '../assets/coastal.png';
import dayImg from '../assets/day.png';
import nightImg from '../assets/night.png';
import sunsetImg from '../assets/sunset.png';
import studioImg from '../assets/studio.png';

export default function Gallery() {
  return (
    <section id="gallery" className="section">
      <div className="gallery-section-head reveal">
        <p className="tag">Visual Stories</p>
        <h2>The Gallery</h2>
        <p className="desc">Every angle tells a story of passion, precision, and performance.</p>
      </div>

      <div className="gallery-layout">
        <div className="gl-feature reveal" style={{ '--d': '0.1s', backgroundImage: `url(${nightImg})` }}>
          <div className="gl-label">
            <span className="gl-num">01</span>
            <span className="gl-title">Night Session</span>
          </div>
        </div>

        <div className="gl-stack">
          <div className="gl-stack-item reveal" style={{ '--d': '0.2s', backgroundImage: `url(${dayImg})` }}>
            <div className="gl-label">
              <span className="gl-num">02</span>
              <span className="gl-title">Track Day</span>
            </div>
          </div>
          <div className="gl-stack-item reveal" style={{ '--d': '0.25s', backgroundImage: `url(${studioImg})` }}>
            <div className="gl-label">
              <span className="gl-num">03</span>
              <span className="gl-title">Studio Shoot</span>
            </div>
          </div>
        </div>

        <div className="gl-panoramic reveal" style={{ '--d': '0.3s', backgroundImage: `url(${sunsetImg})` }}>
          <div className="gl-label">
            <span className="gl-num">04</span>
            <span className="gl-title">Sunset Drive</span>
          </div>
        </div>

        <div className="gl-wide reveal" style={{ '--d': '0.35s', backgroundImage: `url(${coastalImg})` }}>
          <div className="gl-label">
            <span className="gl-num">05</span>
            <span className="gl-title">Coastal Highway</span>
          </div>
        </div>
      </div>
    </section>
  );
}
