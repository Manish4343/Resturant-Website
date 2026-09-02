import "../styles/footer.css"

export default function Footer(){

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-box">
          <h2>🍽️ Swaad & Spice</h2>
          <p>
            Bringing authentic flavours, fresh ingredients,
            and unforgettable dining experiences to your table.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-box">
          <h3>Quick Links</h3>

          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/menu">Menu</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>

        {/* Opening Hours */}
        <div className="footer-box">
          <h3>Opening Hours</h3>

          <p>Monday - Friday</p>
          <p>11:00 AM - 10:00 PM</p>

          <p>Saturday - Sunday</p>
          <p>11:00 AM - 11:00 PM</p>
        </div>

        {/* Contact */}
        <div className="footer-box">
          <h3>Contact Us</h3>

          <p>📍 Pune, Maharashtra</p>
          <p>📞 +91 98765 43210</p>
          <p>📧 spicehouse@gmail.com</p>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">

        <p>
          © 2026 Swaad & Spice House. All Rights Reserved.
        </p>

        <div className="social-links">
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
        </div>

      </div>

    </footer>
  );
}