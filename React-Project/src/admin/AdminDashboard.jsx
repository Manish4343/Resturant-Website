import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/admin.css";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const STATUS_OPTIONS = [
    {
        value: "PLACED",
        label: "Placed",
        icon: "🟡",
    },
    {
        value: "CONFIRMED",
        label: "Confirmed",
        icon: "✅",
    },
    {
        value: "PREPARING",
        label: "Preparing",
        icon: "🔥",
    },
    {
        value: "OUT_FOR_DELIVERY",
        label: "Out for Delivery",
        icon: "🚴",
    },
    {
        value: "DELIVERED",
        label: "Delivered",
        icon: "🎉",
    },
    {
        value: "CANCELLED",
        label: "Cancelled",
        icon: "❌",
    },
];

const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;

const formatStatus = (status) =>
    String(status || "")
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );

const getStatusClass = (status) =>
    String(status || "")
        .toLowerCase()
        .replaceAll("_", "-");

const getCustomerName = (order) =>
    order?.customer?.name ||
    order?.user?.name ||
    "Customer";

const getCustomerPhone = (order) =>
    order?.customer?.phone ||
    order?.user?.phone ||
    "—";

const getCustomerEmail = (order) =>
    order?.customer?.email ||
    order?.user?.email ||
    "—";

const getCustomerAddress = (order) =>
    order?.customer?.address ||
    order?.deliveryAddress ||
    order?.address ||
    "—";

const getSpecialInstructions = (order) =>
    order?.customer?.instructions ||
    order?.instructions ||
    "";

const getOrderStatus = (order) =>
    String(
        order?.orderStatus ||
            order?.status ||
            "PLACED"
    ).toUpperCase();

const getApiError = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

function AdminDashboard() {
    const {
        user,
        loading: authLoading,
    } = useAuth();

    const navigate = useNavigate();

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [updatingOrder, setUpdatingOrder] =
        useState(null);

    const [search, setSearch] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [successMessage, setSuccessMessage] =
        useState("");

    /* =========================================================
       TOKEN
    ========================================================= */

    const getToken = useCallback(() => {
        return localStorage.getItem("token");
    }, []);

    /* =========================================================
       FETCH ORDERS
    ========================================================= */

    const fetchOrders = useCallback(
        async (showRefresh = false) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const token = getToken();

                if (!token) {
                    setError(
                        "Please login as admin."
                    );

                    setOrders([]);

                    return;
                }

                const response =
                    await axios.get(
                        `${API_URL}/orders`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                console.log(
                    "========================================"
                );

                console.log(
                    "ADMIN ORDERS API RESPONSE:",
                    response?.data
                );

                console.log(
                    "========================================"
                );

                const responseData =
                    response?.data;

                /*
                 * Supported backend responses:
                 *
                 * 1.
                 * {
                 *   success: true,
                 *   data: [...]
                 * }
                 *
                 * 2.
                 * {
                 *   success: true,
                 *   orders: [...]
                 * }
                 *
                 * 3.
                 * [...]
                 */

                let orderList = [];

                if (
                    Array.isArray(
                        responseData
                    )
                ) {
                    orderList =
                        responseData;
                } else if (
                    Array.isArray(
                        responseData?.data
                    )
                ) {
                    orderList =
                        responseData.data;
                } else if (
                    Array.isArray(
                        responseData?.orders
                    )
                ) {
                    orderList =
                        responseData.orders;
                }

                /*
                 * Normalize status so frontend
                 * always works with orderStatus.
                 */

                const normalizedOrders =
                    orderList.map(
                        (order) => ({
                            ...order,

                            orderStatus:
                                getOrderStatus(
                                    order
                                ),
                        })
                    );

                console.log(
                    "ADMIN ORDERS LIST:",
                    normalizedOrders
                );

                console.log(
                    "TOTAL ORDERS:",
                    normalizedOrders.length
                );

                setOrders(
                    normalizedOrders
                );
            } catch (err) {
                console.error(
                    "Fetch orders error:",
                    err
                );

                if (
                    err?.response?.status ===
                    401
                ) {
                    setError(
                        "Your admin session has expired. Please login again."
                    );
                } else if (
                    err?.response?.status ===
                    403
                ) {
                    setError(
                        "You do not have administrator access."
                    );
                } else {
                    setError(
                        getApiError(
                            err,
                            "Failed to load orders."
                        )
                    );
                }

                setOrders([]);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [getToken]
    );

    /* =========================================================
       AUTH + INITIAL LOAD
    ========================================================= */

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

        if (user.role !== "admin") {
            return;
        }

        fetchOrders();
    }, [
        authLoading,
        user,
        navigate,
        fetchOrders,
    ]);

    /* =========================================================
       SUCCESS MESSAGE
    ========================================================= */

    useEffect(() => {
        if (!successMessage) {
            return;
        }

        const timer =
            setTimeout(() => {
                setSuccessMessage("");
            }, 3500);

        return () => {
            clearTimeout(timer);
        };
    }, [successMessage]);

    /* =========================================================
       UPDATE ORDER STATUS
    ========================================================= */

    const updateStatus = async (
        orderId,
        status
    ) => {
        if (!orderId || !status) {
            return;
        }

        const currentOrder =
            orders.find(
                (order) =>
                    order._id === orderId
            );

        const currentStatus =
            getOrderStatus(
                currentOrder
            );

        if (
            currentStatus === status
        ) {
            return;
        }

        if (status === "CANCELLED") {
            const confirmed =
                window.confirm(
                    "Are you sure you want to cancel this order?"
                );

            if (!confirmed) {
                return;
            }
        }

        try {
            setUpdatingOrder(orderId);

            setError("");

            const token =
                getToken();

            if (!token) {
                throw new Error(
                    "Authentication token not found."
                );
            }

            const response =
                await axios.patch(
                    `${API_URL}/orders/${orderId}/status`,
                    {
                        status,
                    },
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            console.log(
                "UPDATE ORDER RESPONSE:",
                response?.data
            );

            /*
             * Optimistic local update.
             */

            setOrders(
                (currentOrders) =>
                    currentOrders.map(
                        (order) =>
                            order._id ===
                            orderId
                                ? {
                                      ...order,
                                      orderStatus:
                                          status,
                                  }
                                : order
                    )
            );

            const statusLabel =
                STATUS_OPTIONS.find(
                    (item) =>
                        item.value ===
                        status
                )?.label ||
                formatStatus(status);

            setSuccessMessage(
                `Order #${String(
                    orderId
                )
                    .slice(-8)
                    .toUpperCase()} updated to ${statusLabel}.`
            );

            /*
             * Fetch again from database
             * so frontend stays synchronized.
             */

            await fetchOrders();
        } catch (err) {
            console.error(
                "Update status error:",
                err
            );

            if (
                err?.response?.status ===
                401
            ) {
                setError(
                    "Your admin session has expired. Please login again."
                );

                return;
            }

            if (
                err?.response?.status ===
                403
            ) {
                setError(
                    "You do not have administrator access."
                );

                return;
            }

            setError(
                getApiError(
                    err,
                    "Failed to update order status."
                )
            );
        } finally {
            setUpdatingOrder(null);
        }
    };

    /* =========================================================
       STATS
    ========================================================= */

    const stats = useMemo(() => {
        const normalizedOrders =
            orders.map((order) => ({
                ...order,
                orderStatus:
                    getOrderStatus(
                        order
                    ),
            }));

        const deliveredOrders =
            normalizedOrders.filter(
                (order) =>
                    order.orderStatus ===
                    "DELIVERED"
            );

        const activeOrders =
            normalizedOrders.filter(
                (order) =>
                    [
                        "CONFIRMED",
                        "PREPARING",
                        "OUT_FOR_DELIVERY",
                    ].includes(
                        order.orderStatus
                    )
            );

        const cancelledOrders =
            normalizedOrders.filter(
                (order) =>
                    order.orderStatus ===
                    "CANCELLED"
            );

        const pendingOrders =
            normalizedOrders.filter(
                (order) =>
                    order.orderStatus ===
                    "PLACED"
            );

        const revenue =
            deliveredOrders.reduce(
                (
                    total,
                    order
                ) =>
                    total +
                    Number(
                        order.totalAmount ||
                            0
                    ),
                0
            );

        return {
            total:
                normalizedOrders.length,

            pending:
                pendingOrders.length,

            active:
                activeOrders.length,

            delivered:
                deliveredOrders.length,

            cancelled:
                cancelledOrders.length,

            revenue,
        };
    }, [orders]);

    /* =========================================================
       FILTER ORDERS
    ========================================================= */

    const filteredOrders =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            return orders.filter(
                (order) => {
                    const status =
                        getOrderStatus(
                            order
                        );

                    const matchesStatus =
                        statusFilter ===
                            "ALL" ||
                        status ===
                            statusFilter;

                    if (
                        !matchesStatus
                    ) {
                        return false;
                    }

                    if (!query) {
                        return true;
                    }

                    const orderId =
                        String(
                            order._id ||
                                ""
                        ).toLowerCase();

                    const customerName =
                        String(
                            getCustomerName(
                                order
                            )
                        ).toLowerCase();

                    const phone =
                        String(
                            getCustomerPhone(
                                order
                            )
                        ).toLowerCase();

                    const email =
                        String(
                            getCustomerEmail(
                                order
                            )
                        ).toLowerCase();

                    const address =
                        String(
                            getCustomerAddress(
                                order
                            )
                        ).toLowerCase();

                    return (
                        orderId.includes(
                            query
                        ) ||
                        customerName.includes(
                            query
                        ) ||
                        phone.includes(
                            query
                        ) ||
                        email.includes(
                            query
                        ) ||
                        address.includes(
                            query
                        )
                    );
                }
            );
        }, [
            orders,
            search,
            statusFilter,
        ]);

    /* =========================================================
       ACCESS
    ========================================================= */

    if (authLoading) {
        return (
            <div className="admin-page">
                <div className="admin-message">
                    <div className="admin-loader">
                        ⏳
                    </div>

                    <h2>
                        Checking Admin Access...
                    </h2>

                    <p>
                        Please wait.
                    </p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="admin-page">
                <div className="admin-message">
                    <div className="admin-message-icon">
                        🔐
                    </div>

                    <h2>
                        Login Required
                    </h2>

                    <p>
                        Please login with
                        your admin account
                        to access the
                        dashboard.
                    </p>

                    <button
                        type="button"
                        className="browse-menu-btn"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (user.role !== "admin") {
        return (
            <div className="admin-page">
                <div className="admin-message">
                    <div className="admin-message-icon">
                        🚫
                    </div>

                    <h2>
                        Access Denied
                    </h2>

                    <p>
                        Only administrators
                        can access this
                        dashboard.
                    </p>

                    <button
                        type="button"
                        className="browse-menu-btn"
                        onClick={() =>
                            navigate(
                                "/"
                            )
                        }
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-page">
                <div className="admin-message">
                    <div className="admin-loader">
                        ⏳
                    </div>

                    <h2>
                        Loading Admin Dashboard...
                    </h2>

                    <p>
                        Fetching your
                        latest orders.
                    </p>
                </div>
            </div>
        );
    }

    /* =========================================================
       UI
    ========================================================= */

    return (
        <main className="admin-page">

            {/* =================================================
                HEADER
            ================================================= */}

            <section className="admin-header">

                <div>

                    <span className="admin-eyebrow">
                        SWAAD & SPICE • ADMIN
                    </span>

                    <h1>
                        Restaurant Dashboard
                    </h1>

                    <p>
                        Welcome back,{" "}
                        <strong>
                            {user.name}
                        </strong>
                        . Manage orders
                        and track your
                        restaurant
                        performance.
                    </p>

                </div>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={() =>
                            navigate(
                                "/admin/reservations"
                            )
                        }
                    >
                        📅 Reservations
                    </button>

                    <button
                        type="button"
                        className="refresh-btn"
                        onClick={() =>
                            fetchOrders(
                                true
                            )
                        }
                        disabled={
                            refreshing
                        }
                    >
                        {refreshing
                            ? "⏳ Refreshing..."
                            : "🔄 Refresh Orders"}
                    </button>

                </div>

            </section>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {successMessage && (
                <div
                    className="admin-success"
                    style={{
                        marginBottom:
                            "20px",
                    }}
                >
                    <span>
                        ✓
                    </span>

                    <p>
                        {
                            successMessage
                        }
                    </p>
                </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div className="admin-error">

                    <span>
                        ⚠️
                    </span>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            fetchOrders()
                        }
                    >
                        Retry
                    </button>

                </div>
            )}

            {/* =================================================
                STATS
            ================================================= */}

            <section className="admin-stats">

                <div className="stat-card">

                    <div className="stat-icon">
                        📦
                    </div>

                    <div>
                        <span>
                            Total Orders
                        </span>

                        <h3>
                            {stats.total}
                        </h3>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        🟡
                    </div>

                    <div>
                        <span>
                            New Orders
                        </span>

                        <h3>
                            {stats.pending}
                        </h3>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        🔥
                    </div>

                    <div>
                        <span>
                            Active Orders
                        </span>

                        <h3>
                            {stats.active}
                        </h3>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        🎉
                    </div>

                    <div>
                        <span>
                            Delivered
                        </span>

                        <h3>
                            {stats.delivered}
                        </h3>
                    </div>

                </div>

                <div className="stat-card revenue-card">

                    <div className="stat-icon">
                        💰
                    </div>

                    <div>
                        <span>
                            Delivered Revenue
                        </span>

                        <h3>
                            {formatCurrency(
                                stats.revenue
                            )}
                        </h3>
                    </div>

                </div>

                <div className="stat-card">

                    <div className="stat-icon">
                        ❌
                    </div>

                    <div>
                        <span>
                            Cancelled
                        </span>

                        <h3>
                            {stats.cancelled}
                        </h3>
                    </div>

                </div>

            </section>

            {/* =================================================
                ORDERS SECTION
            ================================================= */}

            <section className="orders-section">

                <div className="section-title">

                    <div>

                        <span>
                            ORDER MANAGEMENT
                        </span>

                        <h2>
                            Customer Orders
                        </h2>

                    </div>

                    <strong>
                        {
                            filteredOrders.length
                        }{" "}
                        visible
                    </strong>

                </div>

                {/* =================================================
                    SEARCH / FILTER
                ================================================= */}

                <div className="admin-toolbar">

                    <div className="admin-search">

                        <span>
                            🔎
                        </span>

                        <input
                            type="text"
                            placeholder="Search order, customer, phone or email..."
                            value={
                                search
                            }
                            onChange={(
                                event
                            ) =>
                                setSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() =>
                                    setSearch(
                                        ""
                                    )
                                }
                            >
                                ✕
                            </button>
                        )}

                    </div>

                    <select
                        className="status-filter"
                        value={
                            statusFilter
                        }
                        onChange={(
                            event
                        ) =>
                            setStatusFilter(
                                event
                                    .target
                                    .value
                            )
                        }
                    >

                        <option value="ALL">
                            All Status
                        </option>

                        {STATUS_OPTIONS.map(
                            (
                                status
                            ) => (
                                <option
                                    key={
                                        status.value
                                    }
                                    value={
                                        status.value
                                    }
                                >
                                    {
                                        status.label
                                    }
                                </option>
                            )
                        )}

                    </select>

                </div>

                {/* =================================================
                    EMPTY
                ================================================= */}

                {filteredOrders.length ===
                0 ? (
                    <div className="no-orders">

                        <div className="no-orders-icon">
                            🍽️
                        </div>

                        <h2>
                            No Orders Found
                        </h2>

                        <p>
                            {orders.length ===
                            0
                                ? "Customer orders will appear here once someone places an order."
                                : "Try changing your search or status filter."}
                        </p>

                        {(search ||
                            statusFilter !==
                                "ALL") && (
                            <button
                                type="button"
                                className="browse-menu-btn"
                                onClick={() => {
                                    setSearch(
                                        ""
                                    );

                                    setStatusFilter(
                                        "ALL"
                                    );
                                }}
                            >
                                Clear Filters
                            </button>
                        )}

                    </div>
                ) : (

                    /* =================================================
                       ORDER LIST
                    ================================================= */

                    <div className="orders-list">

                        {filteredOrders.map(
                            (order) => {

                                const totalQuantity =
                                    order.items?.reduce(
                                        (
                                            sum,
                                            item
                                        ) =>
                                            sum +
                                            Number(
                                                item.quantity ||
                                                    0
                                            ),
                                        0
                                    ) || 0;

                                const orderStatus =
                                    getOrderStatus(
                                        order
                                    );

                                return (
                                    <article
                                        className="order-card"
                                        key={
                                            order._id
                                        }
                                    >

                                        {/* =================================
                                            ORDER HEADER
                                        ================================= */}

                                        <div className="order-header">

                                            <div>

                                                <span className="order-label">
                                                    ORDER
                                                </span>

                                                <h3>
                                                    #
                                                    {String(
                                                        order._id ||
                                                            ""
                                                    )
                                                        .slice(
                                                            -8
                                                        )
                                                        .toUpperCase()}
                                                </h3>

                                                <p>
                                                    {order.createdAt
                                                        ? new Date(
                                                              order.createdAt
                                                          ).toLocaleString(
                                                              "en-IN",
                                                              {
                                                                  dateStyle:
                                                                      "medium",
                                                                  timeStyle:
                                                                      "short",
                                                              }
                                                          )
                                                        : "Date unavailable"}
                                                </p>

                                            </div>

                                            <span
                                                className={`status ${getStatusClass(
                                                    orderStatus
                                                )}`}
                                            >
                                                {formatStatus(
                                                    orderStatus
                                                )}
                                            </span>

                                        </div>

                                        {/* =================================
                                            CUSTOMER
                                        ================================= */}

                                        <div className="customer-info">

                                            <div className="subsection-heading">

                                                <h4>
                                                    👤 Customer Details
                                                </h4>

                                            </div>

                                            <div className="customer-grid">

                                                <p>

                                                    <span>
                                                        Name
                                                    </span>

                                                    <strong>
                                                        {
                                                            getCustomerName(
                                                                order
                                                            )
                                                        }
                                                    </strong>

                                                </p>

                                                <p>

                                                    <span>
                                                        Phone
                                                    </span>

                                                    <strong>
                                                        {
                                                            getCustomerPhone(
                                                                order
                                                            )
                                                        }
                                                    </strong>

                                                </p>

                                                <p>

                                                    <span>
                                                        Email
                                                    </span>

                                                    <strong>
                                                        {
                                                            getCustomerEmail(
                                                                order
                                                            )
                                                        }
                                                    </strong>

                                                </p>

                                                <p className="customer-address">

                                                    <span>
                                                        Delivery Address
                                                    </span>

                                                    <strong>
                                                        {
                                                            getCustomerAddress(
                                                                order
                                                            )
                                                        }
                                                    </strong>

                                                </p>

                                            </div>

                                            {getSpecialInstructions(
                                                order
                                            ) && (
                                                <div className="instructions">

                                                    <strong>
                                                        📝 Special Instructions
                                                    </strong>

                                                    <p>
                                                        {
                                                            getSpecialInstructions(
                                                                order
                                                            )
                                                        }
                                                    </p>

                                                </div>
                                            )}

                                        </div>

                                        {/* =================================
                                            ITEMS
                                        ================================= */}

                                        <div className="order-items">

                                            <div className="subsection-heading">

                                                <h4>
                                                    🍛 Ordered Items
                                                </h4>

                                                <span>
                                                    {
                                                        totalQuantity
                                                    }{" "}
                                                    item
                                                    {totalQuantity !==
                                                    1
                                                        ? "s"
                                                        : ""}
                                                </span>

                                            </div>

                                            {order.items?.length >
                                            0 ? (
                                                order.items.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <div
                                                            className="order-item"
                                                            key={`${order._id}-${index}`}
                                                        >

                                                            <div className="order-item-image">

                                                                {item.image ? (
                                                                    <img
                                                                        src={
                                                                            item.image
                                                                        }
                                                                        alt={
                                                                            item.name ||
                                                                            "Food item"
                                                                        }
                                                                    />
                                                                ) : (
                                                                    <span>
                                                                        🍛
                                                                    </span>
                                                                )}

                                                            </div>

                                                            <div className="item-details">

                                                                <h5>
                                                                    {
                                                                        item.name
                                                                    }
                                                                </h5>

                                                                <p>
                                                                    {formatCurrency(
                                                                        item.price
                                                                    )}{" "}
                                                                    ×{" "}
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </p>

                                                            </div>

                                                            <strong>
                                                                {formatCurrency(
                                                                    Number(
                                                                        item.price ||
                                                                            0
                                                                    ) *
                                                                        Number(
                                                                            item.quantity ||
                                                                                0
                                                                        )
                                                                )}
                                                            </strong>

                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <p
                                                    style={{
                                                        padding:
                                                            "15px",
                                                        opacity:
                                                            0.7,
                                                    }}
                                                >
                                                    No item
                                                    details
                                                    available.
                                                </p>
                                            )}

                                        </div>

                                        {/* =================================
                                            PRICE BREAKDOWN
                                        ================================= */}

                                        <div className="admin-price-breakdown">

                                            <h4>
                                                💳 Price Breakdown
                                            </h4>

                                            <div className="price-row">

                                                <span>
                                                    Subtotal
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        order.subtotal
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="price-row">

                                                <span>
                                                    GST (
                                                    {
                                                        order.gstRate ??
                                                        18
                                                    }
                                                    %)
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        order.gstAmount
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="price-row">

                                                <span>
                                                    Packaging (
                                                    ₹
                                                    {
                                                        order.packagingPerItem ??
                                                        10
                                                    }{" "}
                                                    ×{" "}
                                                    {
                                                        totalQuantity
                                                    }
                                                    )
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        order.packagingAmount
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="price-row">

                                                <span>
                                                    Handling Charge
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        order.handlingCharge ??
                                                            5
                                                    )}
                                                </strong>

                                            </div>

                                            <div className="price-divider" />

                                            <div className="price-total">

                                                <span>
                                                    Grand Total
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        order.totalAmount
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* =================================
                                            PAYMENT
                                        ================================= */}

                                        <div className="order-footer">

                                            <div className="payment-info">

                                                <span>
                                                    PAYMENT
                                                </span>

                                                <p>

                                                    <strong>
                                                        {order.paymentMethod ===
                                                        "ONLINE"
                                                            ? "💳 Online Payment"
                                                            : "💵 Cash on Delivery"}
                                                    </strong>

                                                </p>

                                                <p>
                                                    Payment Status:{" "}
                                                    <strong>
                                                        {
                                                            order.paymentStatus ||
                                                            "PENDING"
                                                        }
                                                    </strong>
                                                </p>

                                            </div>

                                            <div className="order-total">

                                                <span>
                                                    ORDER TOTAL
                                                </span>

                                                <strong>
                                                    {formatCurrency(
                                                        order.totalAmount
                                                    )}
                                                </strong>

                                            </div>

                                        </div>

                                        {/* =================================
                                            STATUS ACTIONS
                                        ================================= */}

                                        <div className="status-actions">

                                            <div className="subsection-heading">

                                                <h4>
                                                    Update Order Status
                                                </h4>

                                            </div>

                                            <div className="status-buttons">

                                                {STATUS_OPTIONS.map(
                                                    (
                                                        status
                                                    ) => (
                                                        <button
                                                            key={
                                                                status.value
                                                            }
                                                            type="button"
                                                            className={
                                                                orderStatus ===
                                                                status.value
                                                                    ? "active"
                                                                    : ""
                                                            }
                                                            onClick={() =>
                                                                updateStatus(
                                                                    order._id,
                                                                    status.value
                                                                )
                                                            }
                                                            disabled={
                                                                updatingOrder ===
                                                                order._id
                                                            }
                                                        >

                                                            {
                                                                status.icon
                                                            }{" "}
                                                            {
                                                                status.label
                                                            }

                                                        </button>
                                                    )
                                                )}

                                            </div>

                                            {updatingOrder ===
                                                order._id && (
                                                <p className="updating-text">
                                                    ⏳ Updating
                                                    order...
                                                </p>
                                            )}

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>
                )}

            </section>

        </main>
    );
}

export default AdminDashboard;