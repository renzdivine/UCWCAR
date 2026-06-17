import './Footer.css';

export default function Footer() {
  return (
    <footer id="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="nav-logo">UCW<span className="logo-dot" /></div>
          <p>Redefining automotive excellence since 1987.</p>
        </div>
        <div className="footer-links">
          <div>
            <h5>Explore</h5>
            <a href="#">Models</a>
            <a href="#">Gallery</a>
            <a href="#">Innovation</a>
          </div>
          <div>
            <h5>Company</h5>
            <a href="#">About</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div>
            <h5>Connect</h5>
            <a href="#">Instagram</a>
            <a href="#">YouTube</a>
            <a href="#">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>© 2026 LUXE Motors. All rights reserved.</p>
        <div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
