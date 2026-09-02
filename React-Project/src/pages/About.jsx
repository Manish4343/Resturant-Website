import { Navigate, useNavigate } from "react-router-dom";
import "../styles/about.css";

export default function About() {
  const navigate = useNavigate();

  const handlemenuClick = () => {
    navigate("/menu");
  };
  return (
    <section className="about">
      {/* Hero */}
      <div className="about-hero">
        <span>OUR STORY</span>

        <h1>
          Welcome to 🍽️ <span>Swaad & Spice</span> 🌶️
        </h1>

        <p>
          Where traditional Indian flavours meet passion, freshness, and the
          warmth of a memorable dining experience.
        </p>
      </div>

      {/* Story */}
      <div className="about-story">
        <div className="story-content">
          <span className="section-tag">OUR JOURNEY</span>

          <h2>
            A Taste of Tradition,
            <br />
            Served With Love
          </h2>

          <p>
            Swaad & Spice was founded in <strong>2018</strong> with a simple
            dream — to bring authentic Indian flavours to every table. What
            started as a small family-inspired kitchen has grown into a place
            where people come together to enjoy delicious food, meaningful
            conversations, and unforgettable moments.
          </p>

          <p>
            Our recipes are inspired by traditional Indian cooking techniques
            passed down through generations. From carefully selected spices to
            freshly prepared ingredients, every dish is created with attention
            to detail and a lot of passion.
          </p>

          <p>
            We believe great food is not just about taste. It is about
            freshness, hospitality, tradition, and the memories created around
            the table.
          </p>
        </div>

        <div className="story-highlight">
          <h3>Since 2018</h3>
          <p>Serving authentic flavours with passion.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="about-stats">
        <div className="stat-card">
          <h2>2018</h2>
          <p>Established</p>
        </div>

        <div className="stat-card">
          <h2>25+</h2>
          <p>Signature Dishes</p>
        </div>

        <div className="stat-card">
          <h2>15K+</h2>
          <p>Happy Guests</p>
        </div>

        <div className="stat-card">
          <h2>4.8/5</h2>
          <p>Guest Rating</p>
        </div>
      </div>

      {/* Why Us */}
      <div className="about-values">
        <div className="section-heading">
          <span>WHY CHOOSE US</span>

          <h2>
            More Than Just
            <br />
            <span>A Meal</span>
          </h2>

          <p>Every plate tells a story of quality, tradition, and passion.</p>
        </div>

        <div className="value-container">
          <div className="value-card">
            <div className="value-icon">🌶️</div>
            <h3>Authentic Flavours</h3>
            <p>
              Traditional recipes and carefully balanced spices bring authentic
              Indian flavours to every dish.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">🥬</div>
            <h3>Fresh Ingredients</h3>
            <p>
              We believe quality starts with fresh ingredients sourced carefully
              for every preparation.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">👨‍🍳</div>
            <h3>Made With Passion</h3>
            <p>
              Our kitchen team puts care and creativity into every plate that
              reaches your table.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">❤️</div>
            <h3>Warm Hospitality</h3>
            <p>
              We want every guest to feel comfortable, welcomed, and part of the
              Swaad & Spice family.
            </p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="reviews-section">
        <div className="section-heading">
          <span>GUEST REVIEWS</span>

          <h2>
            Loved By Our
            <br />
            <span>Guests</span>
          </h2>
        </div>

        <div className="review-container">
          <div className="review-card">
            <div className="stars">★★★★★</div>

            <p>
              “The flavours were absolutely amazing. Everything tasted fresh,
              authentic, and beautifully prepared.”
            </p>

            <h4>— Rahul Sharma</h4>
            <span>Regular Guest</span>
          </div>

          <div className="review-card">
            <div className="stars">★★★★★</div>

            <p>
              “A perfect place for family dinners. The food, atmosphere, and
              service were all excellent.”
            </p>

            <h4>— Priya Verma</h4>
            <span>Happy Guest</span>
          </div>

          <div className="review-card">
            <div className="stars">★★★★★</div>

            <p>
              “The signature dishes are full of flavour. Definitely a place I
              would recommend to anyone who loves Indian food.”
            </p>

            <h4>— Arjun Mehta</h4>
            <span>Food Lover</span>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="about-cta">
        <h2>
          Come Hungry.
          <br />
          Leave Happy. ❤️
        </h2>

        <p>
          Discover our signature dishes and experience the real taste of Swaad &
          Spice.
        </p>

        <div className="btn-container">
        <button onClick={handlemenuClick} className="btn">
          Explore Our Menu
        </button>
      </div>
      </div>
    </section>
  );
}
