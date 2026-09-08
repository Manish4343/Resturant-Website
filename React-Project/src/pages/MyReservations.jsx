import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/myReservations.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/* =========================================================
   STATUS CONFIG
========================================================= */

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Review",
    icon: "⏳",
    className: "pending",
    description:
      "Your reservation is waiting for confirmation from our restaurant team.",
  },

  CONFIRMED: {
    label: "Confirmed",
    icon: "✓",
    className: "confirmed",
    description:
      "Great news! Your reservation has been confirmed.",
  },

  REJECTED: {
    label: "Rejected",
    icon: "×",
    className: "rejected",
    description:
      "Unfortunately, this reservation could not be confirmed.",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: "−",
    className: "cancelled",
    description:
      "This reservation has been cancelled.",
  },
};

/* =========================================================
   TABLE ICONS
========================================================= */

const TABLE_ICONS = {
  "Simple Table": "🍽️",
  "Family Table": "👨‍👩‍👧‍👦",
  "Birthday Celebration": "🎂",
  "Candle Light Dinner": "🕯️",
  "Premium / Private": "✨",
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeStatus = (status) => {
  if (!status) return "PENDING";

  return String(status)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(date);
  }
};

const formatTime = (time) => {
  if (!time) return "—";

  const value = String(time);

  const parts = value.split(":");

  if (parts.length < 2) {
    return value;
  }

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return value;
  }

  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${suffix}`;
};

const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getTableIcon = (tableType) => {
  return TABLE_ICONS[tableType] || "🍽️";
};

const getStatusConfig = (status) => {
  const normalizedStatus = normalizeStatus(status);

  return (
    STATUS_CONFIG[normalizedStatus] || {
      label: "Unknown",
      icon: "•",
      className: "unknown",
      description:
        "Reservation status is currently unavailable.",
    }
  );
};

const getReservationId = (reservation) => {
  return reservation?._id || reservation?.id;
};

const getReservationDateTime = (reservation) => {
  if (!reservation?.date) {
    return null;
  }

  try {
    const parsedDate = new Date(reservation.date);

    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    const dateString = parsedDate
      .toISOString()
      .split("T")[0];

    if (!reservation.time) {
      return new Date(`${dateString}T23:59:00`);
    }

    return new Date(
      `${dateString}T${reservation.time}:00`
    );
  } catch {
    return null;
  }
};

const isUpcoming = (reservation) => {
  const status = normalizeStatus(reservation?.status);

  if (
    status === "CANCELLED" ||
    status === "REJECTED"
  ) {
    return false;
  }

  const reservationDate =
    getReservationDateTime(reservation);

  if (!reservationDate) {
    return false;
  }

  return reservationDate >= new Date();
};

/* =========================================================
   COMPONENT
========================================================= */

function MyReservations() {
  const navigate = useNavigate();

  const {
    user,
    token,
    loading: authLoading,
  } = useAuth();

  const [reservations, setReservations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const [selectedReservation, setSelectedReservation] =
    useState(null);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  const previousReservationsRef =
    useRef(new Map());

  const firstFetchRef =
    useRef(true);

  /* =========================================================
     FETCH MY RESERVATIONS
  ========================================================= */

  const fetchReservations = useCallback(
    async (showLoader = true) => {
      const savedToken =
        token ||
        localStorage.getItem("token");

      if (!savedToken) {
        setLoading(false);

        navigate("/login", {
          replace: true,
          state: {
            from: "/my-reservations",
          },
        });

        return;
      }

      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await axios.get(
          `${API_URL}/reservations/my`,
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },

            timeout: 15000,
          }
        );

        console.log(
          "MY RESERVATIONS RESPONSE:",
          response.data
        );

        const responseData =
          response.data;

        let reservationList = [];

        /* -----------------------------------------------------
           HANDLE DIFFERENT API RESPONSE SHAPES
        ----------------------------------------------------- */

        if (Array.isArray(responseData)) {
          reservationList = responseData;
        } else if (
          Array.isArray(
            responseData?.reservations
          )
        ) {
          reservationList =
            responseData.reservations;
        } else if (
          Array.isArray(responseData?.data)
        ) {
          reservationList =
            responseData.data;
        } else if (
          Array.isArray(
            responseData?.data?.reservations
          )
        ) {
          reservationList =
            responseData.data.reservations;
        }

        /* -----------------------------------------------------
           NORMALIZE RESERVATION DATA
        ----------------------------------------------------- */

        reservationList =
          reservationList.map(
            (reservation) => ({
              ...reservation,

              status:
                normalizeStatus(
                  reservation?.status
                ),

              assignedTable:
                reservation?.assignedTable ||
                reservation?.tableNumber ||
                "",

              adminNote:
                reservation?.adminNote ||
                reservation?.note ||
                "",
            })
          );

        /* -----------------------------------------------------
           DETECT STATUS CHANGES
        ----------------------------------------------------- */

        if (!firstFetchRef.current) {
          const changedReservation =
            reservationList.find(
              (reservation) => {
                const id =
                  getReservationId(
                    reservation
                  );

                if (!id) {
                  return false;
                }

                const previous =
                  previousReservationsRef.current.get(
                    String(id)
                  );

                if (!previous) {
                  return false;
                }

                return (
                  previous.status !==
                    reservation.status ||
                  previous.assignedTable !==
                    (reservation.assignedTable ||
                      "") ||
                  previous.adminNote !==
                    (reservation.adminNote ||
                      "")
                );
              }
            );

          /* ---------------------------------------------------
             STATUS CHANGE NOTIFICATION
          --------------------------------------------------- */

          if (changedReservation) {
            const statusConfig =
              getStatusConfig(
                changedReservation.status
              );

            let message = "";

            if (
              changedReservation.status ===
              "CONFIRMED"
            ) {
              message =
                "🎉 Your reservation has been confirmed!";

              if (
                changedReservation.assignedTable
              ) {
                message += ` Your assigned table is Table ${changedReservation.assignedTable}.`;
              }
            } else if (
              changedReservation.status ===
              "REJECTED"
            ) {
              message =
                "Unfortunately, your reservation was rejected.";

              if (
                changedReservation.adminNote
              ) {
                message += ` Reason: ${changedReservation.adminNote}`;
              }
            } else if (
              changedReservation.status ===
              "CANCELLED"
            ) {
              message =
                "Your reservation has been cancelled.";
            } else {
              message =
                `Your reservation status is now ${statusConfig.label}.`;
            }

            setSuccess(message);

            /* -----------------------------------------------
               UPDATE OPEN DETAILS MODAL
            ----------------------------------------------- */

            setSelectedReservation(
              (currentReservation) => {
                if (
                  !currentReservation
                ) {
                  return currentReservation;
                }

                const currentId =
                  getReservationId(
                    currentReservation
                  );

                const changedId =
                  getReservationId(
                    changedReservation
                  );

                if (
                  String(currentId) ===
                  String(changedId)
                ) {
                  return changedReservation;
                }

                return currentReservation;
              }
            );
          }
        }

        /* -----------------------------------------------------
           SAVE CURRENT SNAPSHOT
        ----------------------------------------------------- */

        const reservationMap =
          new Map();

        reservationList.forEach(
          (reservation) => {
            const id =
              getReservationId(
                reservation
              );

            if (!id) {
              return;
            }

            reservationMap.set(
              String(id),
              {
                status:
                  normalizeStatus(
                    reservation.status
                  ),

                assignedTable:
                  reservation.assignedTable ||
                  "",

                adminNote:
                  reservation.adminNote ||
                  "",
              }
            );
          }
        );

        previousReservationsRef.current =
          reservationMap;

        firstFetchRef.current = false;

        setReservations(
          reservationList
        );
      } catch (err) {
        console.error(
          "MY RESERVATIONS ERROR:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login", {
            replace: true,
            state: {
              from: "/my-reservations",
            },
          });

          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to load your reservations. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, navigate]
  );

  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate("/login", {
        replace: true,
        state: {
          from: "/my-reservations",
        },
      });

      return;
    }

    fetchReservations(true);
  }, [
    user,
    authLoading,
    navigate,
    fetchReservations,
  ]);

  /* =========================================================
     LIVE STATUS UPDATES
  ========================================================= */

  useEffect(() => {
    if (
      authLoading ||
      !user ||
      !token
    ) {
      return;
    }

    const intervalId =
      window.setInterval(() => {
        fetchReservations(false);
      }, 8000);

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [
    authLoading,
    user,
    token,
    fetchReservations,
  ]);

  /* =========================================================
     FILTERED RESERVATIONS
  ========================================================= */

  const filteredReservations =
    useMemo(() => {
      if (activeFilter === "ALL") {
        return reservations;
      }

      if (
        activeFilter === "UPCOMING"
      ) {
        return reservations.filter(
          isUpcoming
        );
      }

      return reservations.filter(
        (reservation) =>
          normalizeStatus(
            reservation.status
          ) === activeFilter
      );
    }, [
      reservations,
      activeFilter,
    ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    const total =
      reservations.length;

    const upcoming =
      reservations.filter(
        isUpcoming
      ).length;

    const confirmed =
      reservations.filter(
        (reservation) =>
          normalizeStatus(
            reservation.status
          ) === "CONFIRMED"
      ).length;

    const pending =
      reservations.filter(
        (reservation) =>
          normalizeStatus(
            reservation.status
          ) === "PENDING"
      ).length;

    const rejected =
      reservations.filter(
        (reservation) =>
          normalizeStatus(
            reservation.status
          ) === "REJECTED"
      ).length;

    const cancelled =
      reservations.filter(
        (reservation) =>
          normalizeStatus(
            reservation.status
          ) === "CANCELLED"
      ).length;

    const completed =
      reservations.filter(
        (reservation) =>
          normalizeStatus(
            reservation.status
          ) === "CONFIRMED" &&
          !isUpcoming(reservation)
      ).length;

    return {
      total,
      upcoming,
      confirmed,
      pending,
      rejected,
      cancelled,
      completed,
    };
  }, [reservations]);

  /* =========================================================
     CANCEL MODAL
  ========================================================= */

  const openCancelModal = (
    reservation
  ) => {
    setSelectedReservation(
      reservation
    );

    setShowCancelModal(true);

    setError("");
    setSuccess("");
  };

  const closeCancelModal = () => {
    if (cancelLoading) {
      return;
    }

    setShowCancelModal(false);

    setSelectedReservation(null);
  };

  /* =========================================================
     CANCEL RESERVATION
  ========================================================= */

  const handleCancelReservation =
    async () => {
      if (!selectedReservation) {
        return;
      }

      const reservationId =
        getReservationId(
          selectedReservation
        );

      if (!reservationId) {
        setError(
          "Reservation ID could not be found."
        );

        return;
      }

      const savedToken =
        token ||
        localStorage.getItem("token");

      if (!savedToken) {
        navigate("/login");
        return;
      }

      try {
        setCancelLoading(true);

        setError("");
        setSuccess("");

        const response =
          await axios.patch(
            `${API_URL}/reservations/${reservationId}/cancel`,
            {},
            {
              headers: {
                Authorization: `Bearer ${savedToken}`,
              },

              timeout: 15000,
            }
          );

        console.log(
          "CANCEL RESERVATION RESPONSE:",
          response.data
        );

        setShowCancelModal(false);

        setSelectedReservation(
          null
        );

        setSuccess(
          response.data?.message ||
            "Your reservation has been cancelled successfully."
        );

        await fetchReservations(
          false
        );
      } catch (err) {
        console.error(
          "CANCEL RESERVATION ERROR:",
          err
        );

        if (
          err.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");

          return;
        }

        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "Unable to cancel this reservation. Please try again."
        );
      } finally {
        setCancelLoading(false);
      }
    };

  /* =========================================================
     AUTO CLEAR SUCCESS MESSAGE
  ========================================================= */

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setSuccess("");
      }, 5000);

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [success]);

  /* =========================================================
     FILTER BUTTONS
  ========================================================= */

  const filters = [
    {
      id: "ALL",
      label: "All Reservations",
      count: stats.total,
    },

    {
      id: "UPCOMING",
      label: "Upcoming",
      count: stats.upcoming,
    },

    {
      id: "CONFIRMED",
      label: "Confirmed",
      count: stats.confirmed,
    },

    {
      id: "PENDING",
      label: "Pending",
      count: stats.pending,
    },

    {
      id: "REJECTED",
      label: "Rejected",
      count: stats.rejected,
    },
  ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (
    authLoading ||
    loading
  ) {
    return (
      <main className="my-reservations-page">
        <div className="my-reservations-loading">
          <div className="reservation-loading-orbit">
            <span />
            <span />
            <span />
          </div>

          <h2>
            Loading your reservations
          </h2>

          <p>
            We're preparing your
            dining details...
          </p>
        </div>
      </main>
    );
  }

  /* =========================================================
     MAIN PAGE
  ========================================================= */

  return (
    <main className="my-reservations-page">
      <div className="my-reservations-container">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="my-reservations-hero">
          <div className="hero-decoration hero-decoration-one" />

          <div className="hero-decoration hero-decoration-two" />

          <div className="my-reservations-hero-content">

            <span className="my-reservations-eyebrow">
              ✦ SWAAD & SPICE HOUSE ✦
            </span>

            <h1>
              Your Dining
              <br />
              <span>
                Reservations
              </span>
            </h1>

            <p>
              Keep track of your table
              bookings, upcoming dining
              experiences and reservation
              status — all in one place.
            </p>
          </div>

          <div className="hero-user-card">
            <div className="hero-user-avatar">
              {user?.name
                ?.charAt(0)
                ?.toUpperCase() ||
                "U"}
            </div>

            <div>
              <span>
                Welcome back
              </span>

              <strong>
                {user?.name ||
                  "Guest"}
              </strong>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR ALERT
        ================================================= */}

        {error && (
          <div
            className="my-reservations-alert error"
            role="alert"
          >
            <span className="alert-icon">
              !
            </span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            SUCCESS / STATUS UPDATE ALERT
        ================================================= */}

        {success && (
          <div
            className="my-reservations-alert success"
            role="status"
          >
            <span className="alert-icon">
              ✓
            </span>

            <div>
              <strong>
                Reservation Updated
              </strong>

              <p>
                {success}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section className="reservation-stats">

          <div className="reservation-stat-card">
            <div className="stat-icon">
              📅
            </div>

            <div>
              <span>
                Total Bookings
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>
          </div>

          <div className="reservation-stat-card">
            <div className="stat-icon">
              ✨
            </div>

            <div>
              <span>
                Upcoming
              </span>

              <strong>
                {stats.upcoming}
              </strong>
            </div>
          </div>

          <div className="reservation-stat-card">
            <div className="stat-icon">
              ✓
            </div>

            <div>
              <span>
                Confirmed
              </span>

              <strong>
                {stats.confirmed}
              </strong>
            </div>
          </div>

          <div className="reservation-stat-card">
            <div className="stat-icon">
              ⏳
            </div>

            <div>
              <span>
                Pending
              </span>

              <strong>
                {stats.pending}
              </strong>
            </div>
          </div>

        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="reservations-toolbar">

          <div className="reservation-filters">

            {filters.map(
              (filter) => (
                <button
                  key={filter.id}
                  type="button"
                  className={
                    activeFilter ===
                    filter.id
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveFilter(
                      filter.id
                    )
                  }
                >
                  <span>
                    {filter.label}
                  </span>

                  <b>
                    {filter.count}
                  </b>
                </button>
              )
            )}

          </div>

          <button
            type="button"
            className="refresh-reservations-btn"
            onClick={() =>
              fetchReservations(false)
            }
            disabled={refreshing}
          >
            <span
              className={
                refreshing
                  ? "refresh-icon spinning"
                  : "refresh-icon"
              }
            >
              ↻
            </span>

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <span
            className="reservation-live-indicator"
            title="Reservation status checks automatically every 8 seconds"
          >
            <span className="live-dot" />

            Live updates
          </span>

        </section>

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {filteredReservations.length ===
        0 ? (
          <section className="reservations-empty">

            <div className="empty-illustration">
              <span>
                🍽️
              </span>
            </div>

            <span className="empty-label">
              NO RESERVATIONS FOUND
            </span>

            <h2>
              {activeFilter ===
              "ALL"
                ? "Your table is waiting."
                : "Nothing here yet."}
            </h2>

            <p>
              {activeFilter ===
              "ALL"
                ? "Plan your next memorable dining experience at Swaad & Spice."
                : "Try another filter or make a new reservation."}
            </p>

            <button
              type="button"
              className="book-new-table-btn"
              onClick={() =>
                navigate(
                  "/reservation"
                )
              }
            >
              Book a Table

              <span>
                →
              </span>
            </button>

          </section>
        ) : (

          /* =================================================
             RESERVATION LIST
          ================================================= */

          <section className="reservation-list">

            <div className="reservation-list-heading">

              <div>
                <span>
                  YOUR BOOKINGS
                </span>

                <h2>
                  Reservation History
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/reservation"
                  )
                }
                className="new-reservation-btn"
              >
                <span>
                  +
                </span>

                New Reservation
              </button>

            </div>

            <div className="reservation-cards">

              {filteredReservations.map(
                (reservation) => {
                  const reservationId =
                    getReservationId(
                      reservation
                    );

                  const status =
                    normalizeStatus(
                      reservation.status
                    );

                  const statusConfig =
                    getStatusConfig(
                      status
                    );

                  const upcoming =
                    isUpcoming(
                      reservation
                    );

                  const isConfirmed =
                    status ===
                    "CONFIRMED";

                  const isRejected =
                    status ===
                    "REJECTED";

                  const isCancelled =
                    status ===
                    "CANCELLED";

                  return (
                    <article
                      key={
                        reservationId ||
                        `${reservation.date}-${reservation.time}`
                      }
                      className={`reservation-card ${statusConfig.className}`}
                    >

                      {/* =====================================
                          CARD TOP
                      ===================================== */}

                      <div className="reservation-card-top">

                        <div className="reservation-card-brand">

                          <div className="reservation-experience-icon">
                            {getTableIcon(
                              reservation.tableType
                            )}
                          </div>

                          <div>
                            <span className="reservation-card-label">
                              DINING EXPERIENCE
                            </span>

                            <h3>
                              {reservation.tableType ||
                                "Table Reservation"}
                            </h3>
                          </div>

                        </div>

                        <div
                          className={`reservation-status ${statusConfig.className}`}
                        >
                          <span>
                            {statusConfig.icon}
                          </span>

                          {statusConfig.label}
                        </div>

                      </div>

                      {/* =====================================
                          DATE / TIME / GUESTS / OCCASION
                      ===================================== */}

                      <div className="reservation-main-info">

                        <div className="reservation-info-block">

                          <span className="info-icon">
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

                        <div className="reservation-info-block">

                          <span className="info-icon">
                            ⏰
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

                        <div className="reservation-info-block">

                          <span className="info-icon">
                            👥
                          </span>

                          <div>
                            <small>
                              GUESTS
                            </small>

                            <strong>
                              {reservation.guests ||
                                "—"}
                            </strong>
                          </div>

                        </div>

                        <div className="reservation-info-block">

                          <span className="info-icon">
                            🎉
                          </span>

                          <div>
                            <small>
                              OCCASION
                            </small>

                            <strong>
                              {reservation.occasion ||
                                "Dining"}
                            </strong>
                          </div>

                        </div>

                      </div>

                      {/* =====================================
                          CONFIRMED MESSAGE
                      ===================================== */}

                      {isConfirmed && (
                        <div className="reservation-confirmed-box">

                          <div className="reservation-confirmed-icon">
                            ✓
                          </div>

                          <div>

                            <strong>
                              Reservation Confirmed
                            </strong>

                            <p>
                              Your table has
                              been confirmed
                              by Swaad & Spice.
                            </p>

                            {reservation.assignedTable && (
                              <p>
                                <strong>
                                  Assigned Table:
                                </strong>{" "}
                                Table{" "}
                                {
                                  reservation.assignedTable
                                }
                              </p>
                            )}

                          </div>

                        </div>
                      )}

                      {/* =====================================
                          REJECTED MESSAGE
                      ===================================== */}

                      {isRejected && (
                        <div className="reservation-rejected-box">

                          <div className="reservation-rejected-icon">
                            ×
                          </div>

                          <div>

                            <strong>
                              Reservation Not Confirmed
                            </strong>

                            <p>
                              We couldn't confirm
                              this reservation.
                            </p>

                            {reservation.adminNote && (
                              <p>
                                <strong>
                                  Restaurant note:
                                </strong>{" "}
                                {
                                  reservation.adminNote
                                }
                              </p>
                            )}

                          </div>

                        </div>
                      )}

                      {/* =====================================
                          CANCELLED MESSAGE
                      ===================================== */}

                      {isCancelled && (
                        <div className="reservation-cancelled-box">

                          <div className="reservation-cancelled-icon">
                            −
                          </div>

                          <div>

                            <strong>
                              Reservation Cancelled
                            </strong>

                            <p>
                              This reservation
                              is no longer active.
                            </p>

                          </div>

                        </div>
                      )}

                      {/* =====================================
                          ASSIGNED TABLE
                      ===================================== */}

                      {reservation.assignedTable &&
                        !isRejected &&
                        !isCancelled && (
                          <div className="assigned-table-box">

                            <div className="assigned-table-icon">
                              ✓
                            </div>

                            <div>

                              <span>
                                TABLE ASSIGNED
                              </span>

                              <strong>
                                Table{" "}
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

                      {reservation.adminNote &&
                        !isRejected && (
                          <div className="admin-note-box">

                            <span>
                              💬
                            </span>

                            <div>

                              <small>
                                NOTE FROM SWAAD & SPICE
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
                          FOOTER
                      ===================================== */}

                      <div className="reservation-card-footer">

                        <div className="reservation-price">

                          <small>
                            TABLE FEE
                          </small>

                          <strong>
                            {formatCurrency(
                              reservation.tablePrice
                            )}
                          </strong>

                        </div>

                        <div className="reservation-actions">

                          {upcoming &&
                            !isCancelled &&
                            !isRejected && (
                              <button
                                type="button"
                                className="cancel-reservation-btn"
                                onClick={() =>
                                  openCancelModal(
                                    reservation
                                  )
                                }
                              >
                                Cancel
                              </button>
                            )}

                          <button
                            type="button"
                            className="view-reservation-btn"
                            onClick={() =>
                              setSelectedReservation(
                                reservation
                              )
                            }
                          >
                            View Details

                            <span>
                              →
                            </span>
                          </button>

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

                        {upcoming && (
                          <span className="upcoming-badge">
                            Upcoming
                          </span>
                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          </section>
        )}

        {/* =================================================
            BOTTOM CTA
        ================================================= */}

        <section className="reservation-bottom-cta">

          <div>

            <span>
              MAKE IT MEMORABLE
            </span>

            <h2>
              Planning another
              special evening?
            </h2>

            <p>
              Reserve your favourite
              table and let us take
              care of the experience.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/reservation"
              )
            }
          >
            Reserve a Table

            <span>
              →
            </span>
          </button>

        </section>

      </div>

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedReservation &&
        !showCancelModal && (
          <div
            className="reservation-modal-backdrop"
            onClick={() =>
              setSelectedReservation(
                null
              )
            }
          >

            <div
              className="reservation-details-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <button
                type="button"
                className="modal-close-btn"
                onClick={() =>
                  setSelectedReservation(
                    null
                  )
                }
                aria-label="Close details"
              >
                ×
              </button>

              <div className="modal-icon">
                {getTableIcon(
                  selectedReservation.tableType
                )}
              </div>

              <span className="modal-eyebrow">
                RESERVATION DETAILS
              </span>

              <h2>
                {selectedReservation.tableType ||
                  "Table Reservation"}
              </h2>

              {/* =========================================
                  MODAL STATUS
              ========================================= */}

              <div
                className={`modal-status ${
                  getStatusConfig(
                    selectedReservation.status
                  ).className
                }`}
              >
                {
                  getStatusConfig(
                    selectedReservation.status
                  ).icon
                }

                {" "}

                {
                  getStatusConfig(
                    selectedReservation.status
                  ).label
                }
              </div>

              {/* =========================================
                  MODAL CONFIRMATION MESSAGE
              ========================================= */}

              {normalizeStatus(
                selectedReservation.status
              ) === "CONFIRMED" && (
                <div className="modal-confirmed-message">

                  <strong>
                    🎉 Reservation Confirmed
                  </strong>

                  <p>
                    Your table has been
                    confirmed by
                    Swaad & Spice.
                  </p>

                  {selectedReservation.assignedTable && (
                    <p>
                      <strong>
                        Assigned Table:
                      </strong>{" "}
                      Table{" "}
                      {
                        selectedReservation.assignedTable
                      }
                    </p>
                  )}

                </div>
              )}

              {/* =========================================
                  MODAL REJECTED MESSAGE
              ========================================= */}

              {normalizeStatus(
                selectedReservation.status
              ) === "REJECTED" && (
                <div className="modal-rejected-message">

                  <strong>
                    Reservation Not Confirmed
                  </strong>

                  <p>
                    Unfortunately, we
                    couldn't confirm
                    this reservation.
                  </p>

                  {selectedReservation.adminNote && (
                    <p>
                      <strong>
                        Reason:
                      </strong>{" "}
                      {
                        selectedReservation.adminNote
                      }
                    </p>
                  )}

                </div>
              )}

              {/* =========================================
                  DETAILS GRID
              ========================================= */}

              <div className="modal-details-grid">

                <div>
                  <span>
                    Guest
                  </span>

                  <strong>
                    {selectedReservation.customer
                      ?.name ||
                      selectedReservation.name ||
                      user?.name ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Phone
                  </span>

                  <strong>
                    {selectedReservation.customer
                      ?.phone ||
                      selectedReservation.phone ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Email
                  </span>

                  <strong>
                    {selectedReservation.customer
                      ?.email ||
                      selectedReservation.email ||
                      user?.email ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatDate(
                      selectedReservation.date
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Time
                  </span>

                  <strong>
                    {formatTime(
                      selectedReservation.time
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Guests
                  </span>

                  <strong>
                    {selectedReservation.guests ||
                      "—"}
                  </strong>
                </div>

                <div>
                  <span>
                    Occasion
                  </span>

                  <strong>
                    {selectedReservation.occasion ||
                      "Dining"}
                  </strong>
                </div>

                <div>
                  <span>
                    Table Fee
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedReservation.tablePrice
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Assigned Table
                  </span>

                  <strong>
                    {selectedReservation.assignedTable
                      ? `Table ${selectedReservation.assignedTable}`
                      : "Not assigned"}
                  </strong>
                </div>

              </div>

              {/* =========================================
                  SPECIAL REQUEST
              ========================================= */}

              {selectedReservation.message && (
                <div className="modal-message">

                  <span>
                    SPECIAL REQUEST
                  </span>

                  <p>
                    {
                      selectedReservation.message
                    }
                  </p>

                </div>
              )}

              {/* =========================================
                  RESTAURANT NOTE
              ========================================= */}

              {selectedReservation.adminNote && (
                <div className="modal-message admin">

                  <span>
                    NOTE FROM RESTAURANT
                  </span>

                  <p>
                    {
                      selectedReservation.adminNote
                    }
                  </p>

                </div>
              )}

              <button
                type="button"
                className="modal-primary-btn"
                onClick={() =>
                  setSelectedReservation(
                    null
                  )
                }
              >
                Done
              </button>

            </div>
          </div>
        )}

      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {showCancelModal &&
        selectedReservation && (
          <div
            className="reservation-modal-backdrop"
            onClick={closeCancelModal}
          >

            <div
              className="cancel-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="cancel-modal-icon">
                !
              </div>

              <span className="modal-eyebrow">
                CANCEL RESERVATION
              </span>

              <h2>
                Are you sure?
              </h2>

              <p>
                You are about to cancel
                your reservation for{" "}
                <strong>
                  {formatDate(
                    selectedReservation.date
                  )}
                </strong>{" "}
                at{" "}
                <strong>
                  {formatTime(
                    selectedReservation.time
                  )}
                </strong>
                .
              </p>

              <div className="cancel-modal-details">

                <span>
                  {getTableIcon(
                    selectedReservation.tableType
                  )}
                </span>

                <div>

                  <strong>
                    {selectedReservation.tableType ||
                      "Table Reservation"}
                  </strong>

                  <small>
                    {selectedReservation.guests ||
                      0}{" "}
                    guests
                  </small>

                </div>

              </div>

              <div className="cancel-modal-actions">

                <button
                  type="button"
                  className="keep-reservation-btn"
                  onClick={
                    closeCancelModal
                  }
                  disabled={
                    cancelLoading
                  }
                >
                  Keep Reservation
                </button>

                <button
                  type="button"
                  className="confirm-cancel-btn"
                  onClick={
                    handleCancelReservation
                  }
                  disabled={
                    cancelLoading
                  }
                >
                  {cancelLoading ? (
                    <>
                      <span className="mini-spinner" />

                      Cancelling...
                    </>
                  ) : (
                    "Yes, Cancel"
                  )}
                </button>

              </div>

            </div>
          </div>
        )}

    </main>
  );
}

export default MyReservations;