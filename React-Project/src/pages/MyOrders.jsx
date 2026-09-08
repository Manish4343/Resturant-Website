import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

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
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const previousStatuses = useRef({});

    // ==========================================
    // API URL
    // ==========================================

    const API_URL =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";

    // ==========================================
    // GET TOKEN
    // ==========================================

    const getToken = useCallback(() => {
        return (
            token ||
            localStorage.getItem("token") ||
            ""
        );
    }, [token]);

    // ==========================================
    // NORMALIZE ORDER STATUS
    // ==========================================

    const normalizeStatus = (order) => {
        return String(
            order?.orderStatus ||
                order?.status ||
                "PLACED"
        )
            .trim()
            .toUpperCase();
    };

    // ==========================================
    // EXTRACT ORDERS FROM API RESPONSE
    // ==========================================

    const extractOrders = (responseData) => {
        if (Array.isArray(responseData)) {
            return responseData;
        }

        if (Array.isArray(responseData?.data)) {
            return responseData.data;
        }

        if (Array.isArray(responseData?.orders)) {
            return responseData.orders;
        }

        if (Array.isArray(responseData?.data?.orders)) {
            return responseData.data.orders;
        }

        return [];
    };

    // ==========================================
    // FETCH MY ORDERS
    // ==========================================

    const fetchMyOrders = useCallback(
        async (isBackgroundRefresh = false) => {
            const savedToken = getToken();

            if (!savedToken) {
                navigate("/login", {
                    replace: true,
                    state: {
                        from: "/my-orders",
                    },
                });

                return;
            }

            try {
                if (isBackgroundRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const response = await axios.get(
                    `${API_URL}/orders/my-orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${savedToken}`,
                        },
                    }
                );

                const orderList = extractOrders(
                    response?.data
                );

                const normalizedOrders =
                    orderList.map((order) => ({
                        ...order,
                        orderStatus:
                            normalizeStatus(order),
                    }));

                // ======================================
                // DETECT STATUS CHANGES
                // ======================================

                if (
                    isBackgroundRefresh &&
                    normalizedOrders.length > 0
                ) {
                    normalizedOrders.forEach((order) => {
                        const orderId = order?._id;

                        if (!orderId) {
                            return;
                        }

                        const newStatus =
                            order.orderStatus;

                        const oldStatus =
                            previousStatuses.current[
                                orderId
                            ];

                        if (
                            oldStatus &&
                            oldStatus !== newStatus
                        ) {
                            console.log(
                                `Order ${orderId} status changed: ${oldStatus} → ${newStatus}`
                            );
                        }

                        previousStatuses.current[
                            orderId
                        ] = newStatus;
                    });
                } else {
                    normalizedOrders.forEach(
                        (order) => {
                            if (order?._id) {
                                previousStatuses.current[
                                    order._id
                                ] =
                                    order.orderStatus;
                            }
                        }
                    );
                }

                setOrders(normalizedOrders);
            } catch (err) {
                console.error(
                    "My orders error:",
                    err
                );

                const status =
                    err?.response?.status;

                if (
                    status === 401 ||
                    status === 403
                ) {
                    localStorage.removeItem(
                        "token"
                    );

                    localStorage.removeItem(
                        "userInfo"
                    );

                    navigate("/login", {
                        replace: true,
                        state: {
                            from: "/my-orders",
                        },
                    });

                    return;
                }

                if (!isBackgroundRefresh) {
                    setError(
                        err?.response?.data
                            ?.message ||
                            "Unable to load your orders."
                    );
                }
            } finally {
                if (isBackgroundRefresh) {
                    setRefreshing(false);
                } else {
                    setLoading(false);
                }
            }
        },
        [API_URL, getToken, navigate]
    );

    // ==========================================
    // INITIAL LOAD
    // ==========================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            navigate("/login", {
                replace: true,
                state: {
                    from: "/my-orders",
                },
            });

            return;
        }

        fetchMyOrders(false);
    }, [
        authLoading,
        user,
        fetchMyOrders,
        navigate,
    ]);

    // ==========================================
    // AUTO REFRESH
    // ==========================================
    // Admin changes order status
    // Customer sees updated status automatically.
    // ==========================================

    useEffect(() => {
        if (authLoading || !user) {
            return;
        }

        const interval = setInterval(() => {
            fetchMyOrders(true);
        }, 8000);

        return () => {
            clearInterval(interval);
        };
    }, [
        authLoading,
        user,
        fetchMyOrders,
    ]);

    // ==========================================
    // STATUS CLASS
    // ==========================================

    const getStatusClass = (status) => {
        switch (
            String(status || "")
                .toUpperCase()
        ) {
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

    // ==========================================
    // STATUS ICON
    // ==========================================

    const getStatusIcon = (status) => {
        switch (
            String(status || "")
                .toUpperCase()
        ) {
            case "PLACED":
                return "📝";

            case "CONFIRMED":
                return "✅";

            case "PREPARING":
                return "👨‍🍳";

            case "OUT_FOR_DELIVERY":
                return "🛵";

            case "DELIVERED":
                return "🎉";

            case "CANCELLED":
                return "❌";

            default:
                return "📦";
        }
    };

    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (status) => {
        if (!status) {
            return "Unknown";
        }

        return String(status)
            .replaceAll("_", " ")
            .toLowerCase()
            .replace(
                /\b\w/g,
                (letter) =>
                    letter.toUpperCase()
            );
    };

    // ==========================================
    // FORMAT DATE
    // ==========================================

    const formatDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }

        const parsedDate = new Date(date);

        if (
            Number.isNaN(
                parsedDate.getTime()
            )
        ) {
            return "Date unavailable";
        }

        return parsedDate.toLocaleString(
            "en-IN",
            {
                dateStyle: "medium",
                timeStyle: "short",
            }
        );
    };

    // ==========================================
    // SAFE NUMBER
    // ==========================================

    const safeNumber = (value) => {
        const number = Number(value);

        return Number.isFinite(number)
            ? number
            : 0;
    };

    // ==========================================
    // AUTH LOADING
    // ==========================================

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

    // ==========================================
    // PAGE LOADING
    // ==========================================

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

    // ==========================================
    // ERROR
    // ==========================================

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
                        type="button"
                        onClick={() =>
                            fetchMyOrders(false)
                        }
                        className="retry-btn"
                    >
                        Try Again
                    </button>
                </div>
            </section>
        );
    }

    // ==========================================
    // NO ORDERS
    // ==========================================

    if (orders.length === 0) {
        return (
            <section className="my-orders-page">
                <div className="orders-header">
                    <h1>
                        📦 My Orders
                    </h1>

                    <p>
                        Hello {user?.name},
                        your orders will
                        appear here.
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
                        You haven't placed
                        any orders.
                    </p>

                    <button
                        type="button"
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

    // ==========================================
    // ORDERS
    // ==========================================

    return (
        <section className="my-orders-page">
            {/* ==================================
                HEADER
            ================================== */}

            <div className="orders-header">
                <div>
                    <h1>
                        📦 My Orders
                    </h1>

                    <p>
                        Welcome back,{" "}
                        {user?.name}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        fetchMyOrders(true)
                    }
                    className="refresh-orders-btn"
                    disabled={refreshing}
                >
                    {refreshing
                        ? "⟳ Updating..."
                        : "↻ Refresh"}
                </button>
            </div>

            {/* ==================================
                LIVE UPDATE MESSAGE
            ================================== */}

            {refreshing && (
                <div className="orders-live-update">
                    <span className="live-dot">
                        ●
                    </span>

                    Checking latest order
                    status...
                </div>
            )}

            {/* ==================================
                ORDER LIST
            ================================== */}

            <div className="orders-container">
                {orders.map((order) => {
                    const status =
                        normalizeStatus(order);

                    return (
                        <div
                            className="order-card"
                            key={order._id}
                        >
                            {/* ==========================
                                ORDER TOP
                            ========================== */}

                            <div className="order-top">
                                <div>
                                    <h3>
                                        Order #
                                        {String(
                                            order._id ||
                                                ""
                                        )
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
                                        status
                                    )}`}
                                >
                                    {getStatusIcon(
                                        status
                                    )}{" "}
                                    {formatStatus(
                                        status
                                    )}
                                </span>
                            </div>

                            {/* ==========================
                                STATUS TRACKER
                            ========================== */}

                            <div className="order-progress">
                                <div
                                    className={`progress-step ${
                                        [
                                            "PLACED",
                                            "CONFIRMED",
                                            "PREPARING",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <span>
                                        📝
                                    </span>

                                    <small>
                                        Placed
                                    </small>
                                </div>

                                <div
                                    className={`progress-line ${
                                        [
                                            "CONFIRMED",
                                            "PREPARING",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                />

                                <div
                                    className={`progress-step ${
                                        [
                                            "CONFIRMED",
                                            "PREPARING",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <span>
                                        ✅
                                    </span>

                                    <small>
                                        Confirmed
                                    </small>
                                </div>

                                <div
                                    className={`progress-line ${
                                        [
                                            "PREPARING",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                />

                                <div
                                    className={`progress-step ${
                                        [
                                            "PREPARING",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <span>
                                        👨‍🍳
                                    </span>

                                    <small>
                                        Preparing
                                    </small>
                                </div>

                                <div
                                    className={`progress-line ${
                                        [
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                />

                                <div
                                    className={`progress-step ${
                                        [
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ].includes(
                                            status
                                        )
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <span>
                                        🛵
                                    </span>

                                    <small>
                                        Delivery
                                    </small>
                                </div>

                                <div
                                    className={`progress-line ${
                                        status ===
                                        "DELIVERED"
                                            ? "active"
                                            : ""
                                    }`}
                                />

                                <div
                                    className={`progress-step ${
                                        status ===
                                        "DELIVERED"
                                            ? "active"
                                            : ""
                                    }`}
                                >
                                    <span>
                                        🎉
                                    </span>

                                    <small>
                                        Delivered
                                    </small>
                                </div>
                            </div>

                            {/* ==========================
                                CANCELLED MESSAGE
                            ========================== */}

                            {status ===
                                "CANCELLED" && (
                                <div className="order-cancelled-message">
                                    <strong>
                                        ❌ Order
                                        Cancelled
                                    </strong>

                                    <p>
                                        This order
                                        has been
                                        cancelled by
                                        the restaurant.
                                    </p>
                                </div>
                            )}

                            {/* ==========================
                                ITEMS
                            ========================== */}

                            <div className="order-items">
                                {Array.isArray(
                                    order.items
                                ) &&
                                    order.items.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const price =
                                                safeNumber(
                                                    item?.price
                                                );

                                            const quantity =
                                                safeNumber(
                                                    item?.quantity
                                                );

                                            const itemTotal =
                                                price *
                                                quantity;

                                            return (
                                                <div
                                                    className="order-item"
                                                    key={
                                                        item?._id ||
                                                        index
                                                    }
                                                >
                                                    <img
                                                        src={
                                                            item?.image ||
                                                            "/placeholder-food.jpg"
                                                        }
                                                        alt={
                                                            item?.name ||
                                                            "Food item"
                                                        }
                                                        onError={(
                                                            event
                                                        ) => {
                                                            event.currentTarget.src =
                                                                "/placeholder-food.jpg";
                                                        }}
                                                    />

                                                    <div className="item-details">
                                                        <h4>
                                                            {item?.name ||
                                                                "Food item"}
                                                        </h4>

                                                        <p>
                                                            ₹
                                                            {price.toFixed(
                                                                2
                                                            )}{" "}
                                                            ×{" "}
                                                            {
                                                                quantity
                                                            }
                                                        </p>
                                                    </div>

                                                    <strong>
                                                        ₹
                                                        {itemTotal.toFixed(
                                                            2
                                                        )}
                                                    </strong>
                                                </div>
                                            );
                                        }
                                    )}
                            </div>

                            {/* ==========================
                                CUSTOMER DETAILS
                            ========================== */}

                            <div className="order-customer">
                                <h4>
                                    Delivery Details
                                </h4>

                                {order.customer
                                    ?.name && (
                                    <p>
                                        👤{" "}
                                        {
                                            order
                                                .customer
                                                .name
                                        }
                                    </p>
                                )}

                                {order.customer
                                    ?.phone && (
                                    <p>
                                        📞{" "}
                                        {
                                            order
                                                .customer
                                                .phone
                                        }
                                    </p>
                                )}

                                {order.customer
                                    ?.address && (
                                    <p>
                                        📍{" "}
                                        {
                                            order
                                                .customer
                                                .address
                                        }
                                    </p>
                                )}

                                {order.customer
                                    ?.instructions && (
                                    <p>
                                        📝{" "}
                                        {
                                            order
                                                .customer
                                                .instructions
                                        }
                                    </p>
                                )}
                            </div>

                            {/* ==========================
                                BOTTOM
                            ========================== */}

                            <div className="order-bottom">
                                <div>
                                    <span>
                                        Payment:{" "}
                                    </span>

                                    <strong>
                                        {order.paymentMethod ||
                                            "N/A"}
                                    </strong>
                                </div>

                                <div className="order-total">
                                    <span>
                                        Total
                                    </span>

                                    <strong>
                                        ₹
                                        {safeNumber(
                                            order.totalAmount
                                        ).toFixed(2)}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default MyOrders;