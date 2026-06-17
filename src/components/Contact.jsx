import './Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="contact-block reveal">
          <div>
            <p className="tag">Get in Touch</p>
            <h2>Ready to Experience<br />the Extraordinary?</h2>
            <p className="desc">
              Schedule a private viewing at one of our exclusive showrooms worldwide.
            </p>
            <div className="contact-btns">
              <a href="#" className="btn-gold">Schedule a Visit →</a>
              <a href="#" className="btn-ghost">+1 (888) LUXE-CAR</a>
            </div>
          </div>

          <div className="contact-info">
            <div className="info-row">
              <span className="info-icon">📍</span>
              <div>
                <strong>Showroom</strong>
                <p>Monte Carlo, Monaco</p>
              </div>
            </div>
            <div className="info-row">
              <span className="info-icon">🕐</span>
              <div>
                <strong>Hours</strong>
                <p>By Appointment Only</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
