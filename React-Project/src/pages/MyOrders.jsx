import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/myOrders.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

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
    const [statusMessage, setStatusMessage] = useState("");

    // =====================================================
    // GET TOKEN
    // =====================================================

    const getToken = useCallback(() => {
        return (
            token ||
            localStorage.getItem("token") ||
            ""
        );
    }, [token]);

    // =====================================================
    // FETCH MY ORDERS
    // silent = true means background refresh
    // =====================================================

    const fetchMyOrders = useCallback(
        async (silent = false) => {
            try {
                const savedToken = getToken();

                if (!savedToken) {
                    navigate("/login", {
                        replace: true,
                    });
                    return;
                }

                if (!silent) {
                    setLoading(true);
                } else {
                    setRefreshing(true);
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

                if (
                    response.data?.success
                ) {
                    const newOrders =
                        response.data?.data || [];

                    // =================================================
                    // CHECK WHETHER ADMIN CHANGED ANY STATUS
                    // =================================================

                    if (orders.length > 0) {
                        const previousStatusMap =
                            new Map(
                                orders.map((order) => [
                                    order._id,
                                    order.orderStatus,
                                ])
                            );

                        const changedOrder =
                            newOrders.find((order) => {
                                const previousStatus =
                                    previousStatusMap.get(
                                        order._id
                                    );

                                return (
                                    previousStatus &&
                                    previousStatus !==
                                        order.orderStatus
                                );
                            });

                        if (changedOrder) {
                            setStatusMessage(
                                `Order #${changedOrder._id
                                    .slice(-8)
                                    .toUpperCase()} is now ${formatStatus(
                                    changedOrder.orderStatus
                                )}.`
                            );
                        }
                    }

                    setOrders(newOrders);
                }
            } catch (err) {
                console.error(
                    "My orders error:",
                    err?.response?.data || err
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
                    });

                    return;
                }

                // Don't show temporary network errors
                // during background refresh over the UI.
                if (!silent) {
                    setError(
                        err?.response?.data?.message ||
                            "Unable to load your orders."
                    );
                }
            } finally {
                if (!silent) {
                    setLoading(false);
                }

                if (silent) {
                    setRefreshing(false);
                }
            }
        },
        [
            getToken,
            navigate,
            orders,
        ]
    );

    // =====================================================
    // AUTH + INITIAL LOAD
    // =====================================================

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!user) {
            navigate("/login", {
                replace: true,
            });

            return;
        }

        fetchMyOrders(false);
    }, [
        authLoading,
        user,
        navigate,
        fetchMyOrders,
    ]);

    // =====================================================
    // AUTO REFRESH
    //
    // Admin status update customer ko automatically
    // 8 seconds ke andar dikhega.
    // =====================================================

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

    // =====================================================
    // STATUS MESSAGE AUTO CLEAR
    // =====================================================

    useEffect(() => {
        if (!statusMessage) {
            return;
        }

        const timer = setTimeout(() => {
            setStatusMessage("");
        }, 5000);

        return () => {
            clearTimeout(timer);
        };
    }, [statusMessage]);

    // =====================================================
    // STATUS CLASS
    // =====================================================

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

    // =====================================================
    // FORMAT STATUS
    // =====================================================

    const formatStatus = (status) => {
        if (!status) {
            return "";
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

    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {
        if (!date) {
            return "Date unavailable";
        }

        const parsedDate =
            new Date(date);

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

    // =====================================================
    // AUTH LOADING
    // =====================================================

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

    // =====================================================
    // LOADING
    // =====================================================

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

    // =====================================================
    // ERROR
    // =====================================================

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

    // =====================================================
    // NO ORDERS
    // =====================================================

    if (orders.length === 0) {
        return (
            <section className="my-orders-page">
                <div className="orders-header">
                    <div>
                        <h1>
                            📦 My Orders
                        </h1>

                        <p>
                            Hello{" "}
                            {user?.name},
                            your orders
                            will appear
                            here.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="retry-btn"
                        onClick={() =>
                            fetchMyOrders(false)
                        }
                    >
                        🔄 Refresh
                    </button>
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

    // =====================================================
    // ORDERS
    // =====================================================

    return (
        <section className="my-orders-page">

            {/* =================================================
                HEADER
            ================================================= */}

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
                    className="retry-btn"
                    onClick={() =>
                        fetchMyOrders(false)
                    }
                    disabled={refreshing}
                >
                    {refreshing
                        ? "⏳ Updating..."
                        : "🔄 Refresh Orders"}
                </button>

            </div>

            {/* =================================================
                LIVE UPDATE MESSAGE
            ================================================= */}

            {statusMessage && (
                <div
                    style={{
                        marginBottom: "18px",
                        padding: "14px 18px",
                        borderRadius: "14px",
                        background:
                            "#ecfdf5",
                        border:
                            "1px solid #a7f3d0",
                        color:
                            "#047857",
                        fontWeight: 700,
                        display: "flex",
                        alignItems:
                            "center",
                        gap: "10px",
                    }}
                >
                    <span>
                        🔔
                    </span>

                    <span>
                        {statusMessage}
                    </span>
                </div>
            )}

            {/* =================================================
                LIVE TRACKING INFO
            ================================================= */}

            <div
                style={{
                    marginBottom: "22px",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    background:
                        "#f8fafc",
                    border:
                        "1px solid #e2e8f0",
                    color:
                        "#64748b",
                    fontSize: "13px",
                    display: "flex",
                    alignItems:
                        "center",
                    gap: "8px",
                }}
            >
                <span
                    style={{
                        width: "8px",
                        height: "8px",
                        borderRadius:
                            "50%",
                        background:
                            "#22c55e",
                        display:
                            "inline-block",
                    }}
                />

                Order status is updated
                automatically.
            </div>

            {/* =================================================
                ORDER LIST
            ================================================= */}

            <div className="orders-container">

                {orders.map((order) => (

                    <div
                        className="order-card"
                        key={order._id}
                    >

                        {/* =====================================
                            ORDER TOP
                        ===================================== */}

                        <div className="order-top">

                            <div>

                                <h3>
                                    Order #
                                    {order._id
                                        ?.slice(
                                            -8
                                        )
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

                        {/* =====================================
                            STATUS TRACKING
                        ===================================== */}

                        <div
                            style={{
                                margin:
                                    "18px 0",
                                padding:
                                    "16px",
                                borderRadius:
                                    "14px",
                                background:
                                    "#f8fafc",
                                border:
                                    "1px solid #e2e8f0",
                            }}
                        >
                            <div
                                style={{
                                    display:
                                        "flex",
                                    justifyContent:
                                        "space-between",
                                    gap: "6px",
                                    fontSize:
                                        "11px",
                                    fontWeight:
                                        700,
                                    color:
                                        "#64748b",
                                }}
                            >
                                {[
                                    [
                                        "PLACED",
                                        "Placed",
                                        "🟡",
                                    ],
                                    [
                                        "CONFIRMED",
                                        "Confirmed",
                                        "✅",
                                    ],
                                    [
                                        "PREPARING",
                                        "Preparing",
                                        "🔥",
                                    ],
                                    [
                                        "OUT_FOR_DELIVERY",
                                        "On the way",
                                        "🚴",
                                    ],
                                    [
                                        "DELIVERED",
                                        "Delivered",
                                        "🎉",
                                    ],
                                ].map(
                                    (step) => {

                                        const [
                                            value,
                                            label,
                                            icon,
                                        ] = step;

                                        const statusOrder = [
                                            "PLACED",
                                            "CONFIRMED",
                                            "PREPARING",
                                            "OUT_FOR_DELIVERY",
                                            "DELIVERED",
                                        ];

                                        const currentIndex =
                                            statusOrder.indexOf(
                                                order.orderStatus
                                            );

                                        const stepIndex =
                                            statusOrder.indexOf(
                                                value
                                            );

                                        const completed =
                                            currentIndex >=
                                            stepIndex;

                                        return (
                                            <div
                                                key={
                                                    value
                                                }
                                                style={{
                                                    flex:
                                                        1,
                                                    textAlign:
                                                        "center",
                                                    opacity:
                                                        completed
                                                            ? 1
                                                            : 0.45,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize:
                                                            "18px",
                                                        marginBottom:
                                                            "4px",
                                                    }}
                                                >
                                                    {
                                                        icon
                                                    }
                                                </div>

                                                <div>
                                                    {
                                                        label
                                                    }
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* =====================================
                            CANCELLED MESSAGE
                        ===================================== */}

                        {order.orderStatus ===
                            "CANCELLED" && (
                            <div
                                style={{
                                    marginBottom:
                                        "18px",
                                    padding:
                                        "14px",
                                    borderRadius:
                                        "12px",
                                    background:
                                        "#fef2f2",
                                    border:
                                        "1px solid #fecaca",
                                    color:
                                        "#b91c1c",
                                    fontWeight:
                                        600,
                                }}
                            >
                                ❌ This order has
                                been cancelled.
                            </div>
                        )}

                        {/* =====================================
                            ITEMS
                        ===================================== */}

                        <div className="order-items">

                            {Array.isArray(
                                order.items
                            ) &&
                                order.items.map(
                                    (
                                        item,
                                        index
                                    ) => (

                                        <div
                                            className="order-item"
                                            key={
                                                `${order._id}-${index}`
                                            }
                                        >

                                            <img
                                                src={
                                                    item.image
                                                }
                                                alt={
                                                    item.name
                                                }
                                            />

                                            <div className="item-details">

                                                <h4>
                                                    {
                                                        item.name
                                                    }
                                                </h4>

                                                <p>
                                                    ₹
                                                    {Number(
                                                        item.price ||
                                                            0
                                                    ).toFixed(
                                                        2
                                                    )}
                                                    {" × "}
                                                    {
                                                        item.quantity
                                                    }
                                                </p>

                                            </div>

                                            <strong>
                                                ₹
                                                {(
                                                    Number(
                                                        item.price ||
                                                            0
                                                    ) *
                                                    Number(
                                                        item.quantity ||
                                                            0
                                                    )
                                                ).toFixed(
                                                    2
                                                )}
                                            </strong>

                                        </div>
                                    )
                                )}

                        </div>

                        {/* =====================================
                            CUSTOMER DETAILS
                        ===================================== */}

                        <div className="order-customer">

                            <h4>
                                Delivery Details
                            </h4>

                            <p>
                                📞{" "}
                                {
                                    order
                                        .customer
                                        ?.phone ||
                                    "—"
                                }
                            </p>

                            <p>
                                📍{" "}
                                {
                                    order
                                        .customer
                                        ?.address ||
                                    "—"
                                }
                            </p>

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

                        {/* =====================================
                            BOTTOM
                        ===================================== */}

                        <div className="order-bottom">

                            <div>
                                <span>
                                    Payment:{" "}
                                </span>

                                <strong>
                                    {
                                        order.paymentMethod ||
                                        "COD"
                                    }
                                </strong>
                            </div>

                            <div className="order-total">

                                <span>
                                    Total
                                </span>

                                <strong>
                                    ₹
                                    {Number(
                                        order.totalAmount ||
                                            0
                                    ).toFixed(
                                        2
                                    )}
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