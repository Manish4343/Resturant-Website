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
    // CLOSE MOBILE MENU
    // =========================

    const closeMenu = () => {
        setMenuOpen(false);
    };


    // =========================
    // LOGO
    // =========================

    const handleLogoClick = () => {
        navigate("/");
        closeMenu();
    };


    // =========================
    // CART
    // =========================

    const handleCartClick = () => {
        navigate("/cart");
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
                onClick={handleLogoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        handleLogoClick();
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
                        onClick={() => {
                            navigate("/login");
                            closeMenu();
                        }}
                    >
                        Login
                    </button>
                )}


                {/* =========================
                    LOGGED IN
                ========================= */}

                {user && (
                    <div className="user-section">

                        <span className="user-name">

                            <span className="user-avatar">
                                {user.name
                                    ?.charAt(0)
                                    .toUpperCase()}
                            </span>

                            <span>
                                Hi, {user.name}
                            </span>

                        </span>


                        {/* MY ORDERS */}

                        <button
                            className="my-orders-btn"
                            type="button"
                            onClick={() => {
                                navigate("/my-orders");
                                closeMenu();
                            }}
                        >
                            My Orders
                        </button>


                        {/* ADMIN */}

                        {user.role === "admin" && (
                            <button
                                className="admin-btn"
                                type="button"
                                onClick={() => {
                                    navigate("/admin");
                                    closeMenu();
                                }}
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
                    onClick={handleCartClick}
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
                onClick={() => {
                    setMenuOpen((previous) => !previous);
                }}
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


                {/* MOBILE LOGIN */}

                {!user && (
                    <button
                        className="mobile-login"
                        type="button"
                        onClick={() => {
                            navigate("/login");
                            closeMenu();
                        }}
                    >
                        Login
                    </button>
                )}


                {/* MOBILE USER OPTIONS */}

                {user && (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                navigate("/my-orders");
                                closeMenu();
                            }}
                        >
                            My Orders
                        </button>

                        {user.role === "admin" && (
                            <button
                                type="button"
                                onClick={() => {
                                    navigate("/admin");
                                    closeMenu();
                                }}
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


                {/* MOBILE CART */}

                <button
                    className="mobile-cart"
                    type="button"
                    onClick={handleCartClick}
                >
                    <span>
                        Cart
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