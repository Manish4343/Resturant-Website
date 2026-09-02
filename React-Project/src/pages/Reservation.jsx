import { useState } from "react";
import "../styles/reservation.css";

export default function Reservation() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    guests: "2",
    occasion: "",
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

    setTimeout(() => {
      setSubmitted(false);
    }, 5000);
  };

  return (
    <main className="reservation-page">

      {/* ================= HERO ================= */}

      <section className="reservation-hero">

        <div className="reservation-hero-overlay"></div>

        <div className="reservation-hero-content">

          <span className="reservation-eyebrow">
            ✦ RESERVE YOUR TABLE ✦
          </span>

          <h1>
            Your Table
            <span>Awaits.</span>
          </h1>

          <p>
            Make your next dining experience special.
            Reserve your table at Swaad & Spice House.
          </p>

        </div>

      </section>


      {/* ================= RESERVATION CONTENT ================= */}

      <section className="reservation-section">

        <div className="reservation-container">

          {/* LEFT SIDE */}

          <div className="reservation-info">

            <span className="reservation-label">
              BOOK WITH US
            </span>

            <h2>
              An unforgettable
              <span>meal starts here.</span>
            </h2>

            <p>
              Whether it's a romantic dinner, a family gathering,
              or a special celebration, we'll make sure your table
              is ready for you.
            </p>


            {/* Highlights */}

            <div className="reservation-highlights">

              <div className="reservation-highlight">

                <div className="highlight-icon">
                  🍽️
                </div>

                <div>
                  <h3>Perfect Dining</h3>
                  <p>
                    Authentic flavours and warm hospitality.
                  </p>
                </div>

              </div>


              <div className="reservation-highlight">

                <div className="highlight-icon">
                  🕐
                </div>

                <div>
                  <h3>Flexible Timing</h3>
                  <p>
                    Choose the time that works best for you.
                  </p>
                </div>

              </div>


              <div className="reservation-highlight">

                <div className="highlight-icon">
                  ❤️
                </div>

                <div>
                  <h3>Special Moments</h3>
                  <p>
                    Birthdays, dates and celebrations welcome.
                  </p>
                </div>

              </div>

            </div>


            {/* Opening Hours */}

            <div className="reservation-hours">

              <span>OPENING HOURS</span>

              <div className="reservation-hour-row">
                <strong>Monday - Friday</strong>
                <span>11:00 AM - 11:00 PM</span>
              </div>

              <div className="reservation-hour-row">
                <strong>Saturday</strong>
                <span>11:00 AM - 12:00 AM</span>
              </div>

              <div className="reservation-hour-row">
                <strong>Sunday</strong>
                <span>11:00 AM - 10:30 PM</span>
              </div>

            </div>

          </div>


          {/* RIGHT SIDE FORM */}

          <div className="reservation-card">

            <div className="reservation-card-heading">

              <span>
                TABLE RESERVATION
              </span>

              <h2>
                Book Your Table
              </h2>

              <p>
                Fill in your details and we'll take care of the rest.
              </p>

            </div>


            {submitted ? (

              <div className="reservation-success">

                <div className="success-icon">
                  ✓
                </div>

                <h2>
                  Reservation Received!
                </h2>

                <p>
                  Thank you, {formData.name || "guest"}.
                  <br />
                  We look forward to welcoming you.
                </p>

                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="reservation-reset-btn"
                >
                  Make Another Reservation
                </button>

              </div>

            ) : (

              <form
                className="reservation-form"
                onSubmit={handleSubmit}
              >

                {/* NAME */}

                <div className="form-group">

                  <label htmlFor="name">
                    Full Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />

                </div>


                {/* PHONE + EMAIL */}

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="phone">
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label htmlFor="email">
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                  </div>

                </div>


                {/* DATE + TIME */}

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="date">
                      Date
                    </label>

                    <input
                      id="date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />

                  </div>


                  <div className="form-group">

                    <label htmlFor="time">
                      Preferred Time
                    </label>

                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    >

                      <option value="">
                        Select time
                      </option>

                      <option value="11:00 AM">
                        11:00 AM
                      </option>

                      <option value="12:00 PM">
                        12:00 PM
                      </option>

                      <option value="1:00 PM">
                        1:00 PM
                      </option>

                      <option value="2:00 PM">
                        2:00 PM
                      </option>

                      <option value="7:00 PM">
                        7:00 PM
                      </option>

                      <option value="8:00 PM">
                        8:00 PM
                      </option>

                      <option value="9:00 PM">
                        9:00 PM
                      </option>

                      <option value="10:00 PM">
                        10:00 PM
                      </option>

                    </select>

                  </div>

                </div>


                {/* GUESTS + OCCASION */}

                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="guests">
                      Number of Guests
                    </label>

                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                    >

                      <option value="1">
                        1 Guest
                      </option>

                      <option value="2">
                        2 Guests
                      </option>

                      <option value="3">
                        3 Guests
                      </option>

                      <option value="4">
                        4 Guests
                      </option>

                      <option value="5">
                        5 Guests
                      </option>

                      <option value="6">
                        6 Guests
                      </option>

                      <option value="7">
                        7 Guests
                      </option>

                      <option value="8">
                        8 Guests
                      </option>

                      <option value="9+">
                        9+ Guests
                      </option>

                    </select>

                  </div>


                  <div className="form-group">

                    <label htmlFor="occasion">
                      Occasion
                    </label>

                    <select
                      id="occasion"
                      name="occasion"
                      value={formData.occasion}
                      onChange={handleChange}
                    >

                      <option value="">
                        Select occasion
                      </option>

                      <option value="Birthday">
                        Birthday
                      </option>

                      <option value="Anniversary">
                        Anniversary
                      </option>

                      <option value="Date">
                        Date Night
                      </option>

                      <option value="Family">
                        Family Gathering
                      </option>

                      <option value="Business">
                        Business Dinner
                      </option>

                      <option value="Other">
                        Other
                      </option>

                    </select>

                  </div>

                </div>


                {/* MESSAGE */}

                <div className="form-group">

                  <label htmlFor="message">
                    Special Request
                    <span>Optional</span>
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="4"
                    placeholder="Any special requests or requirements?"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>

                </div>


                {/* SUBMIT */}

                <button
                  type="submit"
                  className="reservation-submit"
                >
                  Reserve My Table
                  <span>→</span>
                </button>


                <p className="reservation-note">
                  🔒 Your information is safe with us.
                </p>

              </form>

            )}

          </div>

        </div>

      </section>


      {/* ================= BOTTOM CTA ================= */}

      <section className="reservation-bottom">

        <span>
          LOOKING FORWARD TO SEEING YOU
        </span>

        <h2>
          Good food is better
          <span>when shared.</span>
        </h2>

        <p>
          Gather your favourite people and create
          memories around the table.
        </p>

      </section>

    </main>
  );
}