import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/myOrders.css";

function MyOrders() {
    const navigate = useNavigate();

    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // FETCH MY ORDERS
    // =========================

    const fetchMyOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const savedToken =
                token || localStorage.getItem("token");

            if (!savedToken) {
                navigate("/login");
                return;
            }

            const response = await axios.get(
                "http://localhost:5000/api/orders/my-orders",
                {
                    headers: {
                        Authorization: `Bearer ${savedToken}`,
                    },
                }
            );

            if (response.data.success) {
                setOrders(
                    response.data.data || []
                );
            }

        } catch (err) {
            console.error(
                "My orders error:",
                err
            );

            if (err.response?.status === 401) {
                alert(
                    "Your login session has expired. Please login again."
                );

                navigate("/login");
                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to load your orders."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD ORDERS
    // =========================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            navigate("/login");
            return;
        }

        fetchMyOrders();
    }, [user, token, authLoading]);

    // =========================
    // STATUS CLASS
    // =========================

    const getStatusClass = (status) => {
        switch (status) {
            case "PLACED":
                return "status-placed";

            case "CONFIRMED":
                return "status-confirmed";

            case "PREPARING":
                return "status-preparing";

            case "OUT_FOR_DELIVERY":
                return "status-delivery";

            case "DELIVERED":
                return "status-delivered";

            case "CANCELLED":
                return "status-cancelled";

            default:
                return "";
        }
    };

    // =========================
    // FORMAT STATUS
    // =========================

    const formatStatus = (status) => {
        if (!status) {
            return "";
        }

        return status
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );
    };

    // =========================
    // FORMAT DATE
    // =========================

    const formatDate = (date) => {
        return new Date(date).toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    };

    // =========================
    // AUTH LOADING
    // =========================

    if (authLoading) {
        return (
            <section className="my-orders-page">
                <div className="orders-loading">
                    <h2>
                        🔐 Checking login...
                    </h2>

                    <p>
                        Please wait.
                    </p>
                </div>
            </section>
        );
    }

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <section className="my-orders-page">
                <div className="orders-loading">
                    <h2>
                        📦 Loading your orders...
                    </h2>

                    <p>
                        Please wait.
                    </p>
                </div>
            </section>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <section className="my-orders-page">
                <div className="orders-error">
                    <h2>
                        ❌ Something went wrong
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchMyOrders}
                        className="retry-btn"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    // =========================
    // NO ORDERS
    // =========================

    if (orders.length === 0) {
        return (
            <section className="my-orders-page">

                <div className="orders-header">
                    <h1>
                        📦 My Orders
                    </h1>

                    <p>
                        Hello {user?.name}, your orders
                        will appear here.
                    </p>
                </div>

                <div className="no-orders">

                    <div className="no-orders-icon">
                        🍽️
                    </div>

                    <h2>
                        No orders yet
                    </h2>

                    <p>
                        You haven't placed any orders.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/menu")
                        }
                        className="browse-menu-btn"
                    >
                        Browse Menu
                    </button>

                </div>

            </section>
        );
    }

    // =========================
    // ORDERS
    // =========================

    return (
        <section className="my-orders-page">

            {/* HEADER */}

            <div className="orders-header">

                <h1>
                    📦 My Orders
                </h1>

                <p>
                    Welcome back, {user?.name}
                </p>

            </div>

            {/* ORDER LIST */}

            <div className="orders-container">

                {orders.map((order) => (

                    <div
                        className="order-card"
                        key={order._id}
                    >

                        {/* ORDER TOP */}

                        <div className="order-top">

                            <div>

                                <h3>
                                    Order #
                                    {order._id
                                        .slice(-8)
                                        .toUpperCase()}
                                </h3>

                                <p>
                                    {formatDate(
                                        order.createdAt
                                    )}
                                </p>

                            </div>

                            <span
                                className={`order-status ${getStatusClass(
                                    order.orderStatus
                                )}`}
                            >
                                {formatStatus(
                                    order.orderStatus
                                )}
                            </span>

                        </div>

                        {/* ITEMS */}

                        <div className="order-items">

                            {order.items.map(
                                (item, index) => (

                                    <div
                                        className="order-item"
                                        key={index}
                                    >

                                        <img
                                            src={item.image}
                                            alt={item.name}
                                        />

                                        <div className="item-details">

                                            <h4>
                                                {item.name}
                                            </h4>

                                            <p>
                                                ₹
                                                {item.price}
                                                {" × "}
                                                {item.quantity}
                                            </p>

                                        </div>

                                        <strong>
                                            ₹
                                            {(
                                                item.price *
                                                item.quantity
                                            ).toFixed(2)}
                                        </strong>

                                    </div>
                                )
                            )}

                        </div>

                        {/* CUSTOMER DETAILS */}

                        <div className="order-customer">

                            <h4>
                                Delivery Details
                            </h4>

                            <p>
                                📞{" "}
                                {order.customer.phone}
                            </p>

                            <p>
                                📍{" "}
                                {order.customer.address}
                            </p>

                            {order.customer.instructions && (
                                <p>
                                    📝{" "}
                                    {order.customer.instructions}
                                </p>
                            )}

                        </div>

                        {/* BOTTOM */}

                        <div className="order-bottom">

                            <div>
                                <span>
                                    Payment:{" "}
                                </span>

                                <strong>
                                    {order.paymentMethod}
                                </strong>
                            </div>

                            <div className="order-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        order.totalAmount
                                    ).toFixed(2)}
                                </strong>

                            </div>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}

export default MyOrders;