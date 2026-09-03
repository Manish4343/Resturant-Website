import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
    useAuth,
} from "../context/AuthContext";

import "../styles/myReservations.css";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// STATUS CONFIG
// =====================================================

const STATUS_CONFIG = {
    PENDING: {
        label: "Pending Review",
        icon: "🟡",
        description:
            "Your reservation request has been received and is waiting for restaurant approval.",
        className: "pending",
    },

    CONFIRMED: {
        label: "Confirmed",
        icon: "✅",
        description:
            "Great! Your table has been confirmed by the restaurant.",
        className: "confirmed",
    },

    REJECTED: {
        label: "Rejected",
        icon: "❌",
        description:
            "Unfortunately, this reservation could not be confirmed.",
        className: "rejected",
    },

    CANCELLED: {
        label: "Cancelled",
        icon: "🚫",
        description:
            "This reservation has been cancelled.",
        className: "cancelled",
    },
};


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }
    )}`;
};


const formatDate = (date) => {

    if (!date) {
        return "—";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        "en-IN",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


const formatTime = (time) => {

    if (!time) {
        return "—";
    }

    // Backend normally stores HH:mm.
    // Convert to readable 12-hour format.

    const parts =
        String(time).split(":");

    if (
        parts.length < 2
    ) {
        return time;
    }

    const hours =
        Number(parts[0]);

    const minutes =
        parts[1];

    if (
        Number.isNaN(hours)
    ) {
        return time;
    }

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    const displayHour =
        hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
};


const formatCreatedAt = (date) => {

    if (!date) {
        return "";
    }

    const parsedDate =
        new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }

    return parsedDate.toLocaleString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }
    );
};


const getStatusConfig = (
    status
) => {

    return (
        STATUS_CONFIG[status] ||
        {
            label: status || "Unknown",
            icon: "ℹ️",
            description:
                "Reservation status updated.",
            className: "unknown",
        }
    );
};


// =====================================================
// COMPONENT
// =====================================================

export default function MyReservations() {

    const navigate =
        useNavigate();

    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();


    // =================================================
    // STATE
    // =================================================

    const [
        reservations,
        setReservations,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState("");

    const [
        cancellingId,
        setCancellingId,
    ] = useState(null);

    const [
        filter,
        setFilter,
    ] = useState("ALL");


    // =================================================
    // TOKEN
    // =================================================

    const getToken = useCallback(() => {

        return (
            token ||
            localStorage.getItem(
                "token"
            )
        );

    }, [token]);


    // =================================================
    // FETCH RESERVATIONS
    // =================================================

    const fetchReservations =
        useCallback(
            async (
                showRefresh = false
            ) => {

                try {

                    if (
                        showRefresh
                    ) {

                        setRefreshing(
                            true
                        );

                    } else {

                        setLoading(
                            true
                        );

                    }

                    setError("");


                    const savedToken =
                        getToken();


                    if (
                        !savedToken
                    ) {

                        navigate(
                            "/login"
                        );

                        return;
                    }


                    const response =
                        await axios.get(

                            `${API_URL}/reservations/my`,

                            {
                                headers: {
                                    Authorization:
                                        `Bearer ${savedToken}`,
                                },
                            }

                        );


                    if (
                        response.data?.success
                    ) {

                        setReservations(
                            response.data?.data ||
                            []
                        );

                    } else {

                        setReservations([]);

                        setError(
                            response.data?.message ||
                            "Unable to load your reservations."
                        );

                    }

                } catch (err) {

                    console.error(
                        "Fetch reservations error:",
                        err
                    );


                    if (
                        err.response?.status ===
                        401
                    ) {

                        localStorage.removeItem(
                            "token"
                        );

                        localStorage.removeItem(
                            "user"
                        );

                        navigate(
                            "/login"
                        );

                        return;
                    }


                    setError(
                        err.response?.data?.message ||
                        "Unable to load your reservations."
                    );

                } finally {

                    setLoading(
                        false
                    );

                    setRefreshing(
                        false
                    );

                }

            },
            [
                getToken,
                navigate,
            ]
        );


    // =================================================
    // INITIAL LOAD
    // =================================================

    useEffect(() => {

        if (
            authLoading
        ) {
            return;
        }


        if (!user) {

            navigate(
                "/login"
            );

            return;
        }


        fetchReservations();

    }, [
        authLoading,
        user,
        fetchReservations,
        navigate,
    ]);


    // =================================================
    // CANCEL RESERVATION
    // =================================================

    const handleCancel =
        async (
            reservationId
        ) => {

            if (
                !reservationId
            ) {
                return;
            }


            const confirmed =
                window.confirm(
                    "Are you sure you want to cancel this reservation?"
                );


            if (
                !confirmed
            ) {
                return;
            }


            try {

                setCancellingId(
                    reservationId
                );


                const savedToken =
                    getToken();


                if (
                    !savedToken
                ) {

                    navigate(
                        "/login"
                    );

                    return;
                }


                const response =
                    await axios.patch(

                        `${API_URL}/reservations/${reservationId}/cancel`,

                        {},

                        {
                            headers: {
                                Authorization:
                                    `Bearer ${savedToken}`,
                            },
                        }

                    );


                if (
                    response.data?.success
                ) {

                    // Update immediately without
                    // waiting for another request.

                    setReservations(
                        (current) =>
                            current.map(
                                (reservation) =>
                                    reservation._id ===
                                    reservationId
                                        ? {
                                            ...reservation,
                                            status:
                                                "CANCELLED",
                                        }
                                        : reservation
                            )
                    );

                } else {

                    throw new Error(
                        response.data?.message ||
                        "Unable to cancel reservation."
                    );

                }

            } catch (err) {

                console.error(
                    "Cancel reservation error:",
                    err
                );


                alert(
                    err.response?.data?.message ||
                    err.message ||
                    "Unable to cancel reservation."
                );

            } finally {

                setCancellingId(
                    null
                );

            }

        };


    // =================================================
    // FILTER
    // =================================================

    const filteredReservations =
        useMemo(() => {

            if (
                filter === "ALL"
            ) {

                return reservations;

            }


            return reservations.filter(
                (reservation) =>
                    reservation.status ===
                    filter
            );

        }, [
            reservations,
            filter,
        ]);


    // =================================================
    // STATS
    // =================================================

    const stats =
        useMemo(() => {

            return {

                total:
                    reservations.length,

                pending:
                    reservations.filter(
                        (item) =>
                            item.status ===
                            "PENDING"
                    ).length,

                confirmed:
                    reservations.filter(
                        (item) =>
                            item.status ===
                            "CONFIRMED"
                    ).length,

                cancelled:
                    reservations.filter(
                        (item) =>
                            item.status ===
                            "CANCELLED"
                    ).length,

            };

        }, [
            reservations,
        ]);


    // =================================================
    // LOADING
    // =================================================

    if (
        authLoading
    ) {

        return (

            <main className="my-reservations-page">

                <div className="reservation-loading">

                    <div className="loading-icon">
                        🍽️
                    </div>

                    <h2>
                        Checking your account...
                    </h2>

                    <p>
                        Please wait.
                    </p>

                </div>

            </main>

        );

    }


    // =================================================
    // NOT LOGGED IN
    // =================================================

    if (
        !user
    ) {

        return (

            <main className="my-reservations-page">

                <div className="reservation-empty-card">

                    <div className="empty-icon">
                        🔐
                    </div>

                    <h1>
                        Login Required
                    </h1>

                    <p>
                        Please login to view your
                        reservations.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/login"
                            )
                        }
                        className="primary-reservation-btn"
                    >
                        Login to Continue →
                    </button>

                </div>

            </main>

        );

    }


    // =================================================
    // MAIN UI
    // =================================================

    return (

        <main className="my-reservations-page">

            <div className="my-reservations-container">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="my-reservations-header">

                    <div>

                        <span className="reservation-eyebrow">
                            SWAAD & SPICE HOUSE
                        </span>

                        <h1>
                            My Reservations
                        </h1>

                        <p>
                            Track your table bookings,
                            dining experiences and
                            reservation status in one place.
                        </p>

                    </div>


                    <div className="reservation-header-actions">

                        <button
                            type="button"
                            className="secondary-reservation-btn"
                            onClick={() =>
                                navigate(
                                    "/reservation"
                                )
                            }
                        >
                            + Book a Table
                        </button>


                        <button
                            type="button"
                            className="refresh-reservation-btn"
                            onClick={() =>
                                fetchReservations(
                                    true
                                )
                            }
                            disabled={
                                refreshing
                            }
                        >
                            {refreshing
                                ? "⏳ Refreshing..."
                                : "🔄 Refresh"}
                        </button>

                    </div>

                </header>


                {/* =================================================
                    STATS
                ================================================= */}

                <section className="reservation-stats">

                    <div className="reservation-stat-card">

                        <span className="stat-icon">
                            📋
                        </span>

                        <div>

                            <small>
                                Total
                            </small>

                            <strong>
                                {stats.total}
                            </strong>

                        </div>

                    </div>


                    <div className="reservation-stat-card">

                        <span className="stat-icon">
                            🟡
                        </span>

                        <div>

                            <small>
                                Pending
                            </small>

                            <strong>
                                {stats.pending}
                            </strong>

                        </div>

                    </div>


                    <div className="reservation-stat-card">

                        <span className="stat-icon">
                            ✅
                        </span>

                        <div>

                            <small>
                                Confirmed
                            </small>

                            <strong>
                                {stats.confirmed}
                            </strong>

                        </div>

                    </div>


                    <div className="reservation-stat-card">

                        <span className="stat-icon">
                            🚫
                        </span>

                        <div>

                            <small>
                                Cancelled
                            </small>

                            <strong>
                                {stats.cancelled}
                            </strong>

                        </div>

                    </div>

                </section>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="reservation-error">

                        <span>
                            ⚠️
                        </span>

                        <p>
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                fetchReservations()
                            }
                        >
                            Try Again
                        </button>

                    </div>

                )}


                {/* =================================================
                    FILTER
                ================================================= */}

                {!loading &&
                    reservations.length > 0 && (

                        <section className="reservation-filters">

                            <button
                                type="button"
                                className={
                                    filter === "ALL"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(
                                        "ALL"
                                    )
                                }
                            >
                                All
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "PENDING"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(
                                        "PENDING"
                                    )
                                }
                            >
                                🟡 Pending
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "CONFIRMED"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(
                                        "CONFIRMED"
                                    )
                                }
                            >
                                ✅ Confirmed
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "REJECTED"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(
                                        "REJECTED"
                                    )
                                }
                            >
                                ❌ Rejected
                            </button>


                            <button
                                type="button"
                                className={
                                    filter === "CANCELLED"
                                        ? "active"
                                        : ""
                                }
                                onClick={() =>
                                    setFilter(
                                        "CANCELLED"
                                    )
                                }
                            >
                                🚫 Cancelled
                            </button>

                        </section>

                    )}


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (

                    <div className="reservation-loading">

                        <div className="loading-icon">
                            🍽️
                        </div>

                        <h2>
                            Loading your reservations...
                        </h2>

                        <p>
                            Fetching your latest
                            table bookings.
                        </p>

                    </div>

                )}


                {/* =================================================
                    EMPTY
                ================================================= */}

                {!loading &&
                    !error &&
                    reservations.length === 0 && (

                        <div className="reservation-empty-card">

                            <div className="empty-icon">
                                🍽️
                            </div>

                            <span className="empty-eyebrow">
                                YOUR DINING JOURNEY
                            </span>

                            <h2>
                                No Reservations Yet
                            </h2>

                            <p>
                                You haven't booked a table
                                with us yet. Choose your
                                perfect dining experience
                                and make your first
                                reservation.
                            </p>

                            <button
                                type="button"
                                className="primary-reservation-btn"
                                onClick={() =>
                                    navigate(
                                        "/reservation"
                                    )
                                }
                            >
                                Book Your First Table →
                            </button>

                        </div>

                    )}


                {/* =================================================
                    FILTER EMPTY
                ================================================= */}

                {!loading &&
                    reservations.length > 0 &&
                    filteredReservations.length === 0 && (

                        <div className="reservation-empty-card compact">

                            <div className="empty-icon">
                                🔎
                            </div>

                            <h2>
                                No Reservations Found
                            </h2>

                            <p>
                                There are no reservations
                                under the selected filter.
                            </p>

                            <button
                                type="button"
                                className="secondary-reservation-btn"
                                onClick={() =>
                                    setFilter(
                                        "ALL"
                                    )
                                }
                            >
                                Show All Reservations
                            </button>

                        </div>

                    )}


                {/* =================================================
                    RESERVATIONS
                ================================================= */}

                {!loading &&
                    filteredReservations.length > 0 && (

                        <section className="reservations-list">

                            {filteredReservations.map(
                                (
                                    reservation,
                                    index
                                ) => {

                                    const status =
                                        String(
                                            reservation.status ||
                                            "PENDING"
                                        ).toUpperCase();


                                    const statusConfig =
                                        getStatusConfig(
                                            status
                                        );


                                    const canCancel =
                                        [
                                            "PENDING",
                                            "CONFIRMED",
                                        ].includes(
                                            status
                                        );


                                    const reservationId =
                                        reservation._id;


                                    return (

                                        <article
                                            className={`reservation-card ${statusConfig.className}`}
                                            key={
                                                reservationId ||
                                                index
                                            }
                                        >


                                            {/* =====================================
                                                CARD HEADER
                                            ===================================== */}

                                            <div className="reservation-card-header">

                                                <div>

                                                    <span className="reservation-number">
                                                        RESERVATION
                                                    </span>

                                                    <h2>
                                                        #
                                                        {String(
                                                            reservationId ||
                                                            ""
                                                        )
                                                            .slice(
                                                                -8
                                                            )
                                                            .toUpperCase()}
                                                    </h2>

                                                    {reservation.createdAt && (

                                                        <small>
                                                            Requested{" "}
                                                            {formatCreatedAt(
                                                                reservation.createdAt
                                                            )}
                                                        </small>

                                                    )}

                                                </div>


                                                <div
                                                    className={`reservation-status ${statusConfig.className}`}
                                                >

                                                    <span>
                                                        {
                                                            statusConfig.icon
                                                        }
                                                    </span>

                                                    <div>

                                                        <strong>
                                                            {
                                                                statusConfig.label
                                                            }
                                                        </strong>

                                                        <small>
                                                            {status}
                                                        </small>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* =====================================
                                                STATUS MESSAGE
                                            ===================================== */}

                                            <div className="reservation-status-message">

                                                <span>
                                                    {
                                                        statusConfig.icon
                                                    }
                                                </span>

                                                <p>
                                                    {
                                                        statusConfig.description
                                                    }
                                                </p>

                                            </div>


                                            {/* =====================================
                                                PROGRESS
                                            ===================================== */}

                                            <div className="reservation-progress">

                                                <div
                                                    className={`progress-step completed`}
                                                >
                                                    <span>
                                                        ✓
                                                    </span>

                                                    <small>
                                                        Request Sent
                                                    </small>
                                                </div>


                                                <div
                                                    className={
                                                        status ===
                                                        "PENDING"
                                                            ? "progress-line"
                                                            : "progress-line completed"
                                                    }
                                                />


                                                <div
                                                    className={
                                                        status ===
                                                        "PENDING"
                                                            ? "progress-step current"
                                                            : status ===
                                                                "CONFIRMED"
                                                                ? "progress-step completed"
                                                                : "progress-step"
                                                    }
                                                >

                                                    <span>
                                                        {status ===
                                                        "CONFIRMED"
                                                            ? "✓"
                                                            : "2"}
                                                    </span>

                                                    <small>
                                                        Review
                                                    </small>

                                                </div>


                                                <div
                                                    className={
                                                        status ===
                                                        "CONFIRMED"
                                                            ? "progress-line completed"
                                                            : "progress-line"
                                                    }
                                                />


                                                <div
                                                    className={
                                                        status ===
                                                        "CONFIRMED"
                                                            ? "progress-step completed"
                                                            : "progress-step"
                                                    }
                                                >

                                                    <span>
                                                        {status ===
                                                        "CONFIRMED"
                                                            ? "✓"
                                                            : "3"}
                                                    </span>

                                                    <small>
                                                        Confirmed
                                                    </small>

                                                </div>

                                            </div>


                                            {/* =====================================
                                                EXPERIENCE
                                            ===================================== */}

                                            <div className="reservation-experience">

                                                <div className="experience-icon">
                                                    {reservation.tableType ===
                                                    "Candle Light Dinner"
                                                        ? "🕯️"
                                                        : reservation.tableType ===
                                                            "Birthday Celebration"
                                                            ? "🎂"
                                                            : reservation.tableType ===
                                                                "Family Table"
                                                                ? "👨‍👩‍👧‍👦"
                                                                : reservation.tableType ===
                                                                    "Premium / Private"
                                                                    ? "✨"
                                                                    : "🍽️"}
                                                </div>


                                                <div className="experience-details">

                                                    <span>
                                                        DINING EXPERIENCE
                                                    </span>

                                                    <h3>
                                                        {
                                                            reservation.tableType ||
                                                            "Table Reservation"
                                                        }
                                                    </h3>

                                                </div>


                                                <div className="experience-price">

                                                    <small>
                                                        TABLE PRICE
                                                    </small>

                                                    <strong>
                                                        {formatCurrency(
                                                            reservation.tablePrice
                                                        )}
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* =====================================
                                                DETAILS GRID
                                            ===================================== */}

                                            <div className="reservation-details-grid">


                                                <div className="reservation-detail">

                                                    <span>
                                                        📅
                                                    </span>

                                                    <div>

                                                        <small>
                                                            DATE
                                                        </small>

                                                        <strong>
                                                            {formatDate(
                                                                reservation.date
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="reservation-detail">

                                                    <span>
                                                        🕐
                                                    </span>

                                                    <div>

                                                        <small>
                                                            TIME
                                                        </small>

                                                        <strong>
                                                            {formatTime(
                                                                reservation.time
                                                            )}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="reservation-detail">

                                                    <span>
                                                        👥
                                                    </span>

                                                    <div>

                                                        <small>
                                                            GUESTS
                                                        </small>

                                                        <strong>
                                                            {
                                                                reservation.guests
                                                            }{" "}
                                                            {Number(
                                                                reservation.guests
                                                            ) === 1
                                                                ? "Guest"
                                                                : "Guests"}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div className="reservation-detail">

                                                    <span>
                                                        🎉
                                                    </span>

                                                    <div>

                                                        <small>
                                                            OCCASION
                                                        </small>

                                                        <strong>
                                                            {
                                                                reservation.occasion ||
                                                                "Casual Dining"
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            </div>


                                            {/* =====================================
                                                CUSTOMER
                                            ===================================== */}

                                            <div className="reservation-customer">

                                                <div>

                                                    <span>
                                                        CUSTOMER
                                                    </span>

                                                    <strong>
                                                        {
                                                            reservation.customer?.name ||
                                                            reservation.name ||
                                                            user.name
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        PHONE
                                                    </span>

                                                    <strong>
                                                        {
                                                            reservation.customer?.phone ||
                                                            reservation.phone ||
                                                            "—"
                                                        }
                                                    </strong>

                                                </div>


                                                <div>

                                                    <span>
                                                        EMAIL
                                                    </span>

                                                    <strong>
                                                        {
                                                            reservation.customer?.email ||
                                                            reservation.email ||
                                                            user.email ||
                                                            "—"
                                                        }
                                                    </strong>

                                                </div>

                                            </div>


                                            {/* =====================================
                                                ADMIN TABLE
                                            ===================================== */}

                                            {reservation.assignedTable && (

                                                <div className="assigned-table">

                                                    <span>
                                                        🪑
                                                    </span>

                                                    <div>

                                                        <small>
                                                            TABLE ASSIGNED
                                                        </small>

                                                        <strong>
                                                            {
                                                                reservation.assignedTable
                                                            }
                                                        </strong>

                                                    </div>

                                                </div>

                                            )}


                                            {/* =====================================
                                                ADMIN NOTE
                                            ===================================== */}

                                            {reservation.adminNote && (

                                                <div className="admin-note">

                                                    <span>
                                                        💬
                                                    </span>

                                                    <div>

                                                        <small>
                                                            RESTAURANT NOTE
                                                        </small>

                                                        <p>
                                                            {
                                                                reservation.adminNote
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            )}


                                            {/* =====================================
                                                SPECIAL MESSAGE
                                            ===================================== */}

                                            {reservation.message && (

                                                <div className="customer-message">

                                                    <span>
                                                        📝
                                                    </span>

                                                    <div>

                                                        <small>
                                                            YOUR REQUEST
                                                        </small>

                                                        <p>
                                                            {
                                                                reservation.message
                                                            }
                                                        </p>

                                                    </div>

                                                </div>

                                            )}


                                            {/* =====================================
                                                ACTIONS
                                            ===================================== */}

                                            <div className="reservation-card-actions">

                                                <button
                                                    type="button"
                                                    className="view-menu-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            "/menu"
                                                        )
                                                    }
                                                >
                                                    🍽️ Browse Menu
                                                </button>


                                                {canCancel && (

                                                    <button
                                                        type="button"
                                                        className="cancel-reservation-btn"
                                                        onClick={() =>
                                                            handleCancel(
                                                                reservationId
                                                            )
                                                        }
                                                        disabled={
                                                            cancellingId ===
                                                            reservationId
                                                        }
                                                    >
                                                        {cancellingId ===
                                                        reservationId
                                                            ? "⏳ Cancelling..."
                                                            : "Cancel Reservation"}
                                                    </button>

                                                )}

                                            </div>

                                        </article>

                                    );

                                }
                            )}

                        </section>

                    )}


                {/* =================================================
                    FOOTER NOTE
                ================================================= */}

                {!loading &&
                    reservations.length > 0 && (

                        <div className="reservation-bottom-note">

                            <span>
                                🍴
                            </span>

                            <p>
                                Your table reservation is
                                separate from your food order.
                                Any food bill will be calculated
                                independently.
                            </p>

                        </div>

                    )}

            </div>

        </main>

    );

}