import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

export default function Navbar() {
    const navigate = useNavigate();

    const { totalItems } = useCart();
    const { user, logout } = useAuth();

    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // =========================
    // SCROLL EFFECT
    // =========================

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 40);
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    // =========================
    // CLOSE MENU
    // =========================

    const closeMenu = () => {
        setMenuOpen(false);
    };

    // =========================
    // NAVIGATION HELPERS
    // =========================

    const goTo = (path) => {
        navigate(path);
        closeMenu();
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        logout();
        closeMenu();
        navigate("/");
    };

    // =========================
    // ADMIN CHECK
    // =========================

    const isAdmin =
        user?.role === "admin" ||
        user?.isAdmin === true;

    return (
        <nav
            className={`navbar ${
                menuOpen ? "menu-open" : ""
            } ${
                scrolled ? "navbar-scrolled" : ""
            }`}
        >

            {/* =========================
                LOGO
            ========================= */}

            <div
                className="logo"
                onClick={() => goTo("/")}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        goTo("/");
                    }
                }}
            >
                <span className="logo-icon">
                    ✦
                </span>

                <div className="logo-text">
                    <strong>
                        Swaad & Spice
                    </strong>

                    <small>
                        HOUSE OF INDIAN FLAVOURS
                    </small>
                </div>
            </div>


            {/* =========================
                DESKTOP NAVIGATION
            ========================= */}

            <ul className="nav-links">

                <li>
                    <NavLink
                        to="/"
                        onClick={closeMenu}
                    >
                        Home
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/menu"
                        onClick={closeMenu}
                    >
                        Menu
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/about"
                        onClick={closeMenu}
                    >
                        About
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/contact"
                        onClick={closeMenu}
                    >
                        Contact
                    </NavLink>
                </li>

                <li>
                    <NavLink
                        to="/reservation"
                        onClick={closeMenu}
                    >
                        Book a Table
                    </NavLink>
                </li>

            </ul>


            {/* =========================
                RIGHT ACTIONS
            ========================= */}

            <div className="navbar-actions">

                {/* =========================
                    NOT LOGGED IN
                ========================= */}

                {!user && (
                    <button
                        className="login-btn"
                        type="button"
                        onClick={() => goTo("/login")}
                    >
                        Login
                    </button>
                )}


                {/* =========================
                    LOGGED IN
                ========================= */}

                {user && (
                    <div className="user-section">

                        {/* USER */}

                        <span className="user-name">

                            <span className="user-avatar">
                                {user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || "U"}
                            </span>

                            <span>
                                Hi, {user?.name || "User"}
                            </span>

                        </span>


                        {/* MY ORDERS */}

                        <button
                            className="my-orders-btn"
                            type="button"
                            onClick={() =>
                                goTo("/my-orders")
                            }
                        >
                            My Orders
                        </button>


                        {/* MY RESERVATIONS */}

                        <button
                            className="my-reservations-btn"
                            type="button"
                            onClick={() =>
                                goTo("/my-reservations")
                            }
                        >
                            My Reservations
                        </button>


                        {/* ADMIN */}

                        {isAdmin && (
                            <button
                                className="admin-btn"
                                type="button"
                                onClick={() =>
                                    goTo("/admin")
                                }
                            >
                                Admin
                            </button>
                        )}


                        {/* LOGOUT */}

                        <button
                            className="logout-btn"
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>

                    </div>
                )}


                {/* =========================
                    CART
                ========================= */}

                <button
                    className="order-btn"
                    type="button"
                    onClick={() => goTo("/cart")}
                    aria-label="Open shopping cart"
                >
                    <span className="cart-icon">
                        🛒
                    </span>

                    <span className="cart-text">
                        Cart
                    </span>

                    {totalItems > 0 && (
                        <span className="cart-count">
                            {totalItems}
                        </span>
                    )}
                </button>

            </div>


            {/* =========================
                MOBILE MENU BUTTON
            ========================= */}

            <button
                className="menu-toggle"
                type="button"
                onClick={() =>
                    setMenuOpen((previous) => !previous)
                }
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>


            {/* =========================
                MOBILE MENU
            ========================= */}

            <div className="mobile-menu">

                <NavLink
                    to="/"
                    onClick={closeMenu}
                >
                    Home
                </NavLink>

                <NavLink
                    to="/menu"
                    onClick={closeMenu}
                >
                    Menu
                </NavLink>

                <NavLink
                    to="/about"
                    onClick={closeMenu}
                >
                    About
                </NavLink>

                <NavLink
                    to="/contact"
                    onClick={closeMenu}
                >
                    Contact
                </NavLink>

                <NavLink
                    to="/reservation"
                    onClick={closeMenu}
                >
                    Book a Table
                </NavLink>


                {/* =========================
                    MOBILE LOGIN
                ========================= */}

                {!user && (
                    <button
                        className="mobile-login"
                        type="button"
                        onClick={() =>
                            goTo("/login")
                        }
                    >
                        Login
                    </button>
                )}


                {/* =========================
                    MOBILE USER OPTIONS
                ========================= */}

                {user && (
                    <>
                        <button
                            type="button"
                            onClick={() =>
                                goTo("/my-orders")
                            }
                        >
                            My Orders
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                goTo("/my-reservations")
                            }
                        >
                            My Reservations
                        </button>

                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() =>
                                    goTo("/admin")
                                }
                            >
                                Admin Dashboard
                            </button>
                        )}

                        <button
                            className="mobile-logout"
                            type="button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </>
                )}


                {/* =========================
                    MOBILE CART
                ========================= */}

                <button
                    className="mobile-cart"
                    type="button"
                    onClick={() => goTo("/cart")}
                >
                    <span>
                        🛒 Cart
                    </span>

                    {totalItems > 0 && (
                        <span className="cart-count">
                            {totalItems}
                        </span>
                    )}
                </button>

            </div>

        </nav>
    );
}