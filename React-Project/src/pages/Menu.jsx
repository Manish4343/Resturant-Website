import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext";
import "../styles/menu.css";

function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const {
    addToCart,
    cartItems,
    increaseQuantity,
    decreaseQuantity,
  } = useCart();

  // =========================
  // CATEGORY ICONS
  // =========================

  const categoryIcons = {
    Starters: "🥗",
    "Main Course": "🍛",
    "Rice & Biryani": "🍚",
    "Indian Breads": "🫓",
    Sides: "🥣",
    Beverages: "🥤",
    Desserts: "🍰",
    "Spice House Specials": "🔥",
  };

  // =========================
  // FETCH MENU
  // =========================

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:5000/api/menu"
        );

        setMenuItems(response.data.data || []);
      } catch (err) {
        console.error("Menu fetch error:", err);

        setError(
          "Unable to load our menu. Please make sure the backend server is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  // =========================
  // CATEGORIES
  // =========================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(menuItems.map((item) => item.category)),
    ];

    return ["All", ...uniqueCategories];
  }, [menuItems]);

  // =========================
  // FILTER MENU
  // =========================

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === "All" ||
        item.category === activeCategory;

      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        item.name?.toLowerCase().includes(searchText) ||
        item.description?.toLowerCase().includes(searchText) ||
        item.category?.toLowerCase().includes(searchText);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, activeCategory, search]);

  // =========================
  // CART ITEM
  // =========================

  const getCartItem = (itemId) => {
    return cartItems.find(
      (cartItem) => cartItem._id === itemId
    );
  };

  // =========================
  // ADD TO CART
  // =========================

  const handleAddToCart = (item) => {
    addToCart(item);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="menu-page">

        <section className="menu-hero">
          <div className="menu-hero-content">
            <span className="menu-eyebrow">
              ✦ SWAAD & SPICE HOUSE ✦
            </span>

            <h1>
              Our
              <span>Menu</span>
            </h1>

            <p>
              Preparing something delicious for you...
            </p>
          </div>
        </section>

        <div className="menu-loading">
          <div className="loading-spinner"></div>
          <p>Loading delicious food...</p>
        </div>

      </main>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <main className="menu-page">

        <section className="menu-hero">
          <div className="menu-hero-content">

            <span className="menu-eyebrow">
              ✦ SWAAD & SPICE HOUSE ✦
            </span>

            <h1>
              Our
              <span>Menu</span>
            </h1>

            <p>
              Discover flavours crafted with passion.
            </p>

          </div>
        </section>

        <section className="menu-error">
          <div className="error-icon">🍽️</div>

          <h2>Something went wrong</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="menu-retry-btn"
          >
            Try Again
          </button>
        </section>

      </main>
    );
  }

  return (
    <main className="menu-page">

      {/* =========================
          HERO
      ========================= */}

      <section className="menu-hero">

        <div className="menu-hero-overlay"></div>

        <div className="menu-hero-content">

          <span className="menu-eyebrow">
            ✦ SWAAD & SPICE HOUSE ✦
          </span>

          <h1>
            Taste the
            <span>Extraordinary.</span>
          </h1>

          <p>
            Authentic Indian flavours, traditional recipes,
            and unforgettable dining experiences.
          </p>

        </div>

      </section>


      {/* =========================
          MENU CONTENT
      ========================= */}

      <section className="menu-content">

        {/* HEADER */}

        <div className="menu-header">

          <div>

            <span className="menu-section-label">
              FROM OUR KITCHEN
            </span>

            <h2>
              Explore Our
              <span>Menu</span>
            </h2>

            <p>
              Every dish is prepared with fresh ingredients
              and authentic Indian spices.
            </p>

          </div>

        </div>


        {/* =========================
            SEARCH
        ========================= */}

        <div className="menu-search-wrapper">

          <div className="menu-search">

            <span className="search-icon">
              🔍
            </span>

            <input
              type="text"
              placeholder="Search your favourite dish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}

          </div>

        </div>


        {/* =========================
            CATEGORY FILTER
        ========================= */}

        <div className="category-wrapper">

          <div className="category-scroll">

            {categories.map((category) => (

              <button
                type="button"
                key={category}
                className={`category-btn ${
                  activeCategory === category
                    ? "active"
                    : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >

                {category !== "All" && (
                  <span>
                    {categoryIcons[category] || "🍽️"}
                  </span>
                )}

                {category === "All" && (
                  <span>✨</span>
                )}

                {category}

              </button>

            ))}

          </div>

        </div>


        {/* =========================
            RESULTS
        ========================= */}

        <div className="menu-result-info">

          <span>
            {filteredItems.length}{" "}
            {filteredItems.length === 1
              ? "dish"
              : "dishes"}{" "}
            available
          </span>

          {search && (
            <span>
              Results for "{search}"
            </span>
          )}

        </div>


        {/* =========================
            EMPTY RESULT
        ========================= */}

        {filteredItems.length === 0 ? (

          <div className="empty-menu">

            <div className="empty-icon">
              🔎
            </div>

            <h3>
              No dishes found
            </h3>

            <p>
              Try searching for something else or
              choose another category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
              className="reset-menu-btn"
            >
              Show All Dishes
            </button>

          </div>

        ) : (

          <div className="menu-grid">

            {filteredItems.map((item) => {

              const cartItem = getCartItem(item._id);

              return (

                <article
                  className="menu-card"
                  key={item._id}
                >

                  {/* IMAGE */}

                  <div className="menu-image">

                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                    />

                    <div className="image-overlay"></div>

                    <span className="menu-category-tag">
                      {categoryIcons[item.category] || "🍽️"}{" "}
                      {item.category}
                    </span>

                  </div>


                  {/* INFO */}

                  <div className="menu-info">

                    <div className="menu-title-row">

                      <h3>
                        {item.name}
                      </h3>

                      <span className="menu-price">
                        ₹{item.price}
                      </span>

                    </div>


                    <p className="menu-description">
                      {item.description ||
                        "A delicious dish prepared with authentic Indian flavours."}
                    </p>


                    {/* BOTTOM */}

                    <div className="menu-bottom">

                      {!cartItem ? (

                        <button
                          type="button"
                          className="add-cart-btn"
                          onClick={() =>
                            handleAddToCart(item)
                          }
                        >
                          <span>
                            Add to Cart
                          </span>

                          <span>
                            +
                          </span>
                        </button>

                      ) : (

                        <div className="menu-quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item._id
                              )
                            }
                            aria-label={`Decrease ${item.name}`}
                          >
                            −
                          </button>

                          <span>
                            {cartItem.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item._id
                              )
                            }
                            aria-label={`Increase ${item.name}`}
                          >
                            +
                          </button>

                        </div>

                      )}

                    </div>

                  </div>

                </article>

              );

            })}

          </div>

        )}

      </section>


      {/* =========================
          BOTTOM CTA
      ========================= */}

      <section className="menu-cta">

        <div className="menu-cta-overlay"></div>

        <div className="menu-cta-content">

          <span className="menu-section-label">
            A TABLE FULL OF MEMORIES
          </span>

          <h2>
            Good food tastes
            <span>better together.</span>
          </h2>

          <p>
            Gather your loved ones and experience
            the flavours of Swaad & Spice House.
          </p>

        </div>

      </section>

    </main>
  );
}

export default Menu;