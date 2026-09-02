import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Hero() {
  const navigate = useNavigate();

  const handleMenuClick = () => {
    navigate("/menu");
  };

  const handleBookClick = () => {
    navigate("/reservation");
  };

  const handleAboutClick = () => {
    navigate("/about");
  };

  return (
    <main className="home-container">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="hero-section">

        <div className="hero-overlay"></div>

        <div className="hero-content">

          <span className="hero-eyebrow">
            ✦ SWAAD & SPICE HOUSE ✦
          </span>

          <h1>
            Authentic Indian
            <span>Cuisine</span>
          </h1>

          <p className="hero-subtitle">
            Where traditional recipes meet unforgettable flavours.
          </p>

          <div className="hero-features">
            <span>✦ Fresh Ingredients</span>
            <span>✦ Traditional Recipes</span>
            <span>✦ Made With Love</span>
          </div>

          <div className="hero-buttons">

            <button
              onClick={handleMenuClick}
              className="primary-btn"
            >
              Explore Menu
              <span>→</span>
            </button>

            <button
              onClick={handleBookClick}
              className="outline-btn"
            >
              Book a Table
            </button>

          </div>

          <div className="hero-rating">

            <span className="stars">
              ★★★★★
            </span>

            <div>
              <strong>4.9/5</strong>
              <small>Loved by our guests</small>
            </div>

          </div>

        </div>

        <div className="hero-scroll">
          <span>SCROLL TO EXPLORE</span>

          <div className="scroll-line"></div>
        </div>

      </section>


      {/* =====================================================
          INTRODUCTION / STORY
      ===================================================== */}

      <section className="intro-section">

        <div className="intro-image">

          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQg9sehDuG-Ogg9e7s7AvJOhiSNHUotFXcygeF0ZsSozA&s=10"
            alt="Swaad and Spice restaurant"
          />

          <div className="experience-badge">

            <strong>15+</strong>

            <span>
              Years of
              <br />
              Experience
            </span>

          </div>

        </div>


        <div className="intro-content">

          <span className="section-label">
            OUR STORY
          </span>

          <h2>
            A taste of India,
            <span>served with heart.</span>
          </h2>

          <p>
            At Swaad & Spice House, we believe that great food is more
            than just a meal. It is a celebration of culture, family
            and unforgettable moments.
          </p>

          <p>
            Our chefs combine traditional Indian recipes with fresh
            ingredients and carefully selected spices to create dishes
            that feel both familiar and extraordinary.
          </p>

          <button
            onClick={handleAboutClick}
            className="text-btn"
          >
            Discover Our Story
            <span>→</span>
          </button>

        </div>

      </section>


      {/* =====================================================
          SIGNATURE DISHES
      ===================================================== */}

      <section className="signature-section">

        <div className="section-heading">

          <span className="section-label">
            FROM OUR KITCHEN
          </span>

          <h2>
            Signature
            <span>Dishes</span>
          </h2>

          <p>
            Crafted with authentic spices, fresh ingredients
            and a whole lot of love.
          </p>

        </div>


        <div className="dish-grid">

          {/* DISH 1 */}

          <article className="dish-card">

            <div className="dish-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGCujFbr2eOekgvedURKJtQSQMZE2KW6MLzJv4GMskLg&s=10"
                alt="Butter Chicken"
              />

              <span className="dish-tag">
                CHEF'S CHOICE
              </span>

            </div>

            <div className="dish-info">

              <div>
                <h3>
                  Butter Chicken
                </h3>

                <p>
                  Creamy tomato gravy with aromatic spices.
                </p>
              </div>

              <strong>
                ₹349
              </strong>

            </div>

          </article>


          {/* DISH 2 */}

          <article className="dish-card">

            <div className="dish-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0rAgbb_mqxgRSSkZcAEQnqFV5yS6Cp57rkCMy64-RLg&s=10"
                alt="Royal Biryani"
              />

              <span className="dish-tag">
                BEST SELLER
              </span>

            </div>

            <div className="dish-info">

              <div>
                <h3>
                  Royal Biryani
                </h3>

                <p>
                  Fragrant basmati rice with rich Indian spices.
                </p>
              </div>

              <strong>
                ₹299
              </strong>

            </div>

          </article>


          {/* DISH 3 */}

          <article className="dish-card">

            <div className="dish-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKkRYk7Ec0vU8IMp_raf0h_5Q-MXc9OvVRvMuWpD9ENw&s=10"
                alt="Paneer Tikka"
              />

              <span className="dish-tag">
                VEGETARIAN
              </span>

            </div>

            <div className="dish-info">

              <div>
                <h3>
                  Paneer Tikka
                </h3>

                <p>
                  Char-grilled paneer marinated in Indian spices.
                </p>
              </div>

              <strong>
                ₹269
              </strong>

            </div>

          </article>

        </div>


        <button
          onClick={handleMenuClick}
          className="menu-link"
        >
          View Full Menu
          <span>→</span>
        </button>

      </section>


      {/* =====================================================
          FEATURED MENU PREVIEW
      ===================================================== */}

      <section className="featured-section">

        <div className="featured-heading">

          <div>

            <span className="section-label">
              A LITTLE MORE TO LOVE
            </span>

            <h2>
              Favourites from
              <span>our kitchen.</span>
            </h2>

          </div>

          <button
            onClick={handleMenuClick}
            className="small-menu-btn"
          >
            See Full Menu →
          </button>

        </div>


        <div className="featured-grid">

          {/* ITEM 1 */}

          <article className="featured-card">

            <div className="featured-card-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSe7ClZDp4ZuuIAIB3ifGwwRXd8W3ESbw2SLWxpgpmZsw&s=10"
                alt="Indian starter"
              />

              <span className="featured-number">
                01
              </span>

            </div>

            <div className="featured-card-content">

              <div>
                <h3>
                  Tandoori Platter
                </h3>

                <p>
                  Smoky, charred and packed with authentic
                  tandoori flavours.
                </p>
              </div>

              <strong>
                ₹389
              </strong>

            </div>

          </article>


          {/* ITEM 2 */}

          <article className="featured-card">

            <div className="featured-card-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGCujFbr2eOekgvedURKJtQSQMZE2KW6MLzJv4GMskLg&s=10"
                alt="Indian curry"
              />

              <span className="featured-number">
                02
              </span>

            </div>

            <div className="featured-card-content">

              <div>
                <h3>
                  Royal Curry
                </h3>

                <p>
                  Slow-cooked gravy finished with fragrant
                  Indian spices.
                </p>
              </div>

              <strong>
                ₹319
              </strong>

            </div>

          </article>


          {/* ITEM 3 */}

          <article className="featured-card">

            <div className="featured-card-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0rAgbb_mqxgRSSkZcAEQnqFV5yS6Cp57rkCMy64-RLg&s=10"
                alt="Biryani"
              />

              <span className="featured-number">
                03
              </span>

            </div>

            <div className="featured-card-content">

              <div>
                <h3>
                  House Special Biryani
                </h3>

                <p>
                  Aromatic basmati rice layered with herbs,
                  spices and rich flavours.
                </p>
              </div>

              <strong>
                ₹329
              </strong>

            </div>

          </article>


          {/* ITEM 4 */}

          <article className="featured-card">

            <div className="featured-card-image">

              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKkRYk7Ec0vU8IMp_raf0h_5Q-MXc9OvVRvMuWpD9ENw&s=10"
                alt="Paneer dish"
              />

              <span className="featured-number">
                04
              </span>

            </div>

            <div className="featured-card-content">

              <div>
                <h3>
                  Paneer Special
                </h3>

                <p>
                  Soft paneer with smoky spices and
                  rich creamy texture.
                </p>
              </div>

              <strong>
                ₹289
              </strong>

            </div>

          </article>

        </div>

      </section>


      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="why-section">

        <div className="section-heading">

          <span className="section-label">
            WHY SWAAD & SPICE
          </span>

          <h2>
            Made for people
            <span>who love good food.</span>
          </h2>

          <p>
            From the first bite to the last smile,
            every detail is made to make your experience special.
          </p>

        </div>


        <div className="why-grid">

          <div className="why-card">

            <span className="why-icon">
              🍛
            </span>

            <h3>
              Authentic Flavours
            </h3>

            <p>
              Traditional recipes prepared with rich,
              authentic spices.
            </p>

          </div>


          <div className="why-card">

            <span className="why-icon">
              🥬
            </span>

            <h3>
              Fresh Ingredients
            </h3>

            <p>
              Carefully selected fresh ingredients
              in every dish.
            </p>

          </div>


          <div className="why-card">

            <span className="why-icon">
              ❤️
            </span>

            <h3>
              Made With Love
            </h3>

            <p>
              Every plate is prepared with passion,
              care and attention.
            </p>

          </div>


          <div className="why-card">

            <span className="why-icon">
              ✨
            </span>

            <h3>
              Beautiful Experience
            </h3>

            <p>
              Great food, warm ambience and
              memorable moments.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          EXPERIENCE BANNER
      ===================================================== */}

      <section className="experience-section">

        <div className="experience-overlay"></div>

        <div className="experience-content">

          <span className="section-label">
            THE SWAAD & SPICE EXPERIENCE
          </span>

          <h2>
            More than food.
            <span>It's a feeling.</span>
          </h2>

          <p>
            Warm hospitality, authentic flavours and an ambience
            designed to make every visit memorable.
          </p>

          <div className="experience-stats">

            <div>
              <strong>
                15+
              </strong>

              <span>
                Years
              </span>
            </div>

            <div>
              <strong>
                50+
              </strong>

              <span>
                Dishes
              </span>
            </div>

            <div>
              <strong>
                4.9
              </strong>

              <span>
                Rating
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="home-cta">

        <div className="cta-content">

          <span className="section-label">
            YOUR TABLE AWAITS
          </span>

          <h2>
            Come hungry.
            <span>Leave happy.</span>
          </h2>

          <p>
            Join us for an unforgettable dining experience.
          </p>

          <div className="cta-buttons">

            <button
              onClick={handleBookClick}
              className="primary-btn"
            >
              Reserve Your Table
              <span>→</span>
            </button>

            <button
              onClick={handleMenuClick}
              className="outline-btn"
            >
              Explore Menu
            </button>

          </div>

        </div>

      </section>

    </main>
  );
}