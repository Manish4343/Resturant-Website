import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/contact.css";

export default function Contact() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Enquiry",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmitted(true);

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "General Enquiry",
      message: "",
    });

    setTimeout(() => {
      setSubmitted(false);
    }, 4000);
  };

  const handleDirections = () => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=Swaad+%26+Spice+Pune",
      "_blank"
    );
  };

  const handleReservation = () => {
    navigate("/reservation");
  };

  return (
    <main className="contact-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="contact-hero">

        <div className="contact-hero-overlay"></div>

        <div className="contact-hero-content">

          <span className="contact-eyebrow">
            ✦ GET IN TOUCH ✦
          </span>

          <h1>
            We'd Love To
            <span>Hear From You</span>
          </h1>

          <p>
            Have a question, planning a special dinner, or simply
            want to say hello? Our team would love to hear from you.
          </p>

          <div className="hero-contact-actions">

            <a href="tel:+919876543210" className="hero-contact-btn">
              📞 Call Us
            </a>

            <a
              href="mailto:hello@swaadandspice.com"
              className="hero-contact-btn secondary"
            >
              ✉️ Email Us
            </a>

          </div>

        </div>

        <div className="hero-bottom-line">
          <span>GOOD FOOD</span>
          <i></i>
          <span>GOOD PEOPLE</span>
          <i></i>
          <span>GREAT MEMORIES</span>
        </div>

      </section>


      {/* =====================================================
          CONTACT INTRO
      ===================================================== */}

      <section className="contact-main">

        <div className="contact-intro">

          <div className="intro-copy">

            <span className="section-tag">
              CONTACT US
            </span>

            <h2>
              Let's start a
              <span>conversation.</span>
            </h2>

            <p>
              Whether you have a question about our menu, need help
              planning your visit, or want to share your dining
              experience, we're always happy to help.
            </p>

          </div>


          <div className="contact-mini-cards">

            <a
              href="tel:+919876543210"
              className="mini-contact-card"
            >
              <div className="mini-icon">
                📞
              </div>

              <div>
                <small>CALL US</small>
                <strong>+91 98765 43210</strong>
              </div>

              <span className="mini-arrow">↗</span>
            </a>


            <a
              href="mailto:hello@swaadandspice.com"
              className="mini-contact-card"
            >
              <div className="mini-icon">
                ✉️
              </div>

              <div>
                <small>EMAIL US</small>
                <strong>hello@swaadandspice.com</strong>
              </div>

              <span className="mini-arrow">↗</span>
            </a>


            <button
              className="mini-contact-card"
              onClick={handleDirections}
            >
              <div className="mini-icon">
                📍
              </div>

              <div>
                <small>VISIT US</small>
                <strong>Pune, Maharashtra</strong>
              </div>

              <span className="mini-arrow">↗</span>
            </button>

          </div>

        </div>


        {/* =====================================================
            FORM + OPENING HOURS
        ===================================================== */}

        <div className="contact-grid">

          {/* ================= FORM ================= */}

          <div className="contact-form-box">

            <div className="form-heading">

              <span>
                SEND A MESSAGE
              </span>

              <h2>
                How can we
                <span>help?</span>
              </h2>

              <p>
                Fill in the details below and our team will get
                back to you as soon as possible.
              </p>

            </div>


            {submitted && (
              <div className="success-message">
                <span>✓</span>

                <div>
                  <strong>Message sent successfully!</strong>
                  <p>
                    Thank you for reaching out to Swaad & Spice.
                  </p>
                </div>
              </div>
            )}


            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="form-row">

                <div className="input-group">

                  <label htmlFor="name">
                    Your Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>


                <div className="input-group">

                  <label htmlFor="email">
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>


              <div className="form-row">

                <div className="input-group">

                  <label htmlFor="phone">
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                </div>


                <div className="input-group">

                  <label htmlFor="subject">
                    Subject
                  </label>

                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                  >
                    <option>General Enquiry</option>
                    <option>Reservation</option>
                    <option>Private Event</option>
                    <option>Feedback</option>
                    <option>Other</option>
                  </select>

                </div>

              </div>


              <div className="input-group full-input">

                <label htmlFor="message">
                  Your Message
                </label>

                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell us how we can help..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                ></textarea>

              </div>


              <button
                type="submit"
                className="send-message-btn"
              >
                <span>Send Message</span>
                <strong>→</strong>
              </button>

            </form>

          </div>


          {/* ================= RIGHT SIDE ================= */}

          <aside className="contact-sidebar">

            {/* OPENING HOURS */}

            <div className="hours-card">

              <div className="card-top">

                <span className="section-tag">
                  WHEN TO VISIT
                </span>

                <span className="clock-icon">
                  🕐
                </span>

              </div>

              <h3>
                Opening
                <span>Hours</span>
              </h3>

              <div className="hours-list">

                <div className="hours-row">

                  <div>
                    <strong>Monday - Friday</strong>
                    <small>Weekdays</small>
                  </div>

                  <span>
                    11:00 AM
                    <b>—</b>
                    11:00 PM
                  </span>

                </div>


                <div className="hours-row">

                  <div>
                    <strong>Saturday</strong>
                    <small>Weekend</small>
                  </div>

                  <span>
                    11:00 AM
                    <b>—</b>
                    12:00 AM
                  </span>

                </div>


                <div className="hours-row">

                  <div>
                    <strong>Sunday</strong>
                    <small>Weekend</small>
                  </div>

                  <span>
                    11:00 AM
                    <b>—</b>
                    10:30 PM
                  </span>

                </div>

              </div>

              <div className="open-status">
                <span></span>
                Open for reservations
              </div>

            </div>


            {/* QUICK HELP */}

            <div className="quick-help-card">

              <div className="quick-help-icon">
                💬
              </div>

              <div>

                <span>
                  NEED A QUICK ANSWER?
                </span>

                <h3>
                  We're just a call away.
                </h3>

                <p>
                  Our friendly team is ready to help you
                  with your questions.
                </p>

                <a href="tel:+919876543210">
                  Call +91 98765 43210
                  <span>↗</span>
                </a>

              </div>

            </div>


            {/* RESERVATION CTA */}

            <div className="sidebar-reservation">

              <span>
                PLANNING A SPECIAL EVENING?
              </span>

              <h3>
                Your table
                <span>awaits.</span>
              </h3>

              <button onClick={handleReservation}>
                Reserve a Table
                <span>→</span>
              </button>

            </div>

          </aside>

        </div>

      </section>


      {/* =====================================================
          LOCATION
      ===================================================== */}

      <section className="location-section">

        <div className="location-content">

          <span className="section-tag">
            FIND US
          </span>

          <h2>
            Come visit
            <span>Swaad & Spice.</span>
          </h2>

          <p>
            Step inside, take a seat, and let the aroma of
            freshly prepared Indian food welcome you.
          </p>

          <div className="address-box">

            <div className="address-icon">
              📍
            </div>

            <div>
              <strong>
                Swaad & Spice House
              </strong>

              <p>
                123 Spice Street,
                <br />
                Pune, Maharashtra 411001
              </p>
            </div>

          </div>

          <button
            className="directions-btn"
            onClick={handleDirections}
          >
            Get Directions
            <span>↗</span>
          </button>

        </div>


        <div className="map-area">

          <div className="map-overlay"></div>

          <div className="map-content">

            <div className="map-pin">
              📍
            </div>

            <div className="map-label">

              <strong>
                Swaad & Spice
              </strong>

              <span>
                Pune, Maharashtra
              </span>

            </div>

          </div>

          <div className="map-decoration one"></div>
          <div className="map-decoration two"></div>
          <div className="map-decoration three"></div>

        </div>

      </section>


      {/* =====================================================
          SOCIAL SECTION
      ===================================================== */}

      <section className="social-section">

        <div className="social-inner">

          <div className="social-copy">

            <span className="section-tag">
              STAY CONNECTED
            </span>

            <h2>
              Good Food.
              <br />
              Good People.
              <br />
              <span>Great Memories.</span> ❤️
            </h2>

            <p>
              Follow us for delicious food, special offers,
              behind-the-scenes moments and everything
              happening at Swaad & Spice.
            </p>

          </div>


          <div className="social-links">

            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              className="social-card"
            >
              <span className="social-symbol">
                ◎
              </span>

              <div>
                <small>FOLLOW US</small>
                <strong>Instagram</strong>
              </div>

              <span className="social-arrow">
                ↗
              </span>
            </a>


            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              className="social-card"
            >
              <span className="social-symbol">
                f
              </span>

              <div>
                <small>CONNECT WITH US</small>
                <strong>Facebook</strong>
              </div>

              <span className="social-arrow">
                ↗
              </span>
            </a>


            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="social-card"
            >
              <span className="social-symbol">
                ◉
              </span>

              <div>
                <small>CHAT WITH US</small>
                <strong>WhatsApp</strong>
              </div>

              <span className="social-arrow">
                ↗
              </span>
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="contact-final-cta">

        <div>

          <span>
            YOUR TABLE AWAITS
          </span>

          <h2>
            Come hungry.
            <br />
            <em>Leave happy.</em>
          </h2>

          <p>
            An unforgettable Indian dining experience is
            just a reservation away.
          </p>

          <button onClick={handleReservation}>
            Reserve Your Table
            <span>→</span>
          </button>

        </div>

      </section>

    </main>
  );
}