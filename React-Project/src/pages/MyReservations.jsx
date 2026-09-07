import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/myReservations.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Review",
    icon: "⏳",
    className: "pending",
    description: "Our team is reviewing your reservation.",
  },

  CONFIRMED: {
    label: "Confirmed",
    icon: "✓",
    className: "confirmed",
    description: "Your table has been confirmed.",
  },

  REJECTED: {
    label: "Rejected",
    icon: "×",
    className: "rejected",
    description: "This reservation could not be confirmed.",
  },

  CANCELLED: {
    label: "Cancelled",
    icon: "−",
    className: "cancelled",
    description: "This reservation has been cancelled.",
  },
};

const TABLE_ICONS = {
  "Simple Table": "🍽️",
  "Family Table": "👨‍👩‍👧‍👦",
  "Birthday Celebration": "🎂",
  "Candle Light Dinner": "🕯️",
  "Premium / Private": "✨",
};

const formatDate = (date) => {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const formatTime = (time) => {
  if (!time) return "—";

  const parts = time.split(":");

  if (parts.length < 2) {
    return time;
  }

  let hours = Number(parts[0]);
  const minutes = parts[1];

  if (Number.isNaN(hours)) {
    return time;
  }

  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${suffix}`;
};

const formatCurrency = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const getTableIcon = (tableType) => {
  return TABLE_ICONS[tableType] || "🍽️";
};

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[status] || {
      label: status || "Unknown",
      icon: "•",
      className: "unknown",
      description: "Reservation status unavailable.",
    }
  );
};

const getReservationId = (reservation) => {
  return reservation?._id || reservation?.id;
};

const getReservationDateTime = (reservation) => {
  if (!reservation?.date) return null;

  const dateString = new Date(reservation.date)
    .toISOString()
    .split("T")[0];

  if (!reservation.time) {
    return new Date(`${dateString}T23:59:00`);
  }

  return new Date(`${dateString}T${reservation.time}:00`);
};

const isUpcoming = (reservation) => {
  const status = reservation?.status;

  if (status === "CANCELLED" || status === "REJECTED") {
    return false;
  }

  const reservationDate = getReservationDateTime(reservation);

  if (!reservationDate) return false;

  return reservationDate >= new Date();
};

function MyReservations() {
  const navigate = useNavigate();

  const { user, token, loading: authLoading } = useAuth();

  const [reservations, setReservations] = useState([]);

  const previousReservationsRef = React.useRef(new Map());
  const firstFetchRef = React.useRef(true);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");

  const [selectedReservation, setSelectedReservation] =
    useState(null);

  const [cancelLoading, setCancelLoading] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  // =====================================================
  // FETCH RESERVATIONS
  // =====================================================

  const fetchReservations = useCallback(
    async (showLoader = true) => {
      const savedToken =
        token || localStorage.getItem("token");

      if (!savedToken) {
        setLoading(false);
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
          "My Reservations Response:",
          response.data
        );

        const responseData = response.data;

        let reservationList = [];

        if (Array.isArray(responseData)) {
          reservationList = responseData;
        } else if (
          Array.isArray(responseData?.reservations)
        ) {
          reservationList = responseData.reservations;
        } else if (
          Array.isArray(responseData?.data)
        ) {
          reservationList = responseData.data;
        }

        // =================================================
        // DETECT ADMIN STATUS UPDATE
        // =================================================

        if (!firstFetchRef.current) {
          const changed = reservationList.find(
            (reservation) => {
              const id = getReservationId(reservation);

              const previous = id
                ? previousReservationsRef.current.get(id)
                : null;

              if (!previous) return false;

              return (
                previous.status !== reservation.status ||
                previous.assignedTable !==
                  (reservation.assignedTable || "") ||
                previous.adminNote !==
                  (reservation.adminNote || "")
              );
            }
          );

          if (changed) {
            const config = getStatusConfig(
              changed.status
            );

            let message =
              `Your ${
                changed.tableType || "table"
              } reservation is now ` +
              `${config.label.toLowerCase()}.`;

            if (
              changed.status === "CONFIRMED" &&
              changed.assignedTable
            ) {
              message +=
                ` Your assigned table is ${changed.assignedTable}.`;
            }

            if (
              changed.status === "REJECTED" &&
              changed.adminNote
            ) {
              message +=
                ` Reason: ${changed.adminNote}`;
            }

            setSuccess(message);

            setSelectedReservation((current) => {
              if (!current) return current;

              return getReservationId(current) ===
                getReservationId(changed)
                ? changed
                : current;
            });
          }
        }

        // =================================================
        // SAVE CURRENT RESERVATION SNAPSHOT
        // =================================================

        previousReservationsRef.current =
          new Map(
            reservationList
              .map((reservation) => {
                const id =
                  getReservationId(reservation);

                if (!id) return null;

                return [
                  id,
                  {
                    status: reservation.status,

                    assignedTable:
                      reservation.assignedTable || "",

                    adminNote:
                      reservation.adminNote || "",
                  },
                ];
              })
              .filter(Boolean)
          );

        firstFetchRef.current = false;

        setReservations(reservationList);
      } catch (err) {
        console.error(
          "My Reservations Error:",
          err
        );

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            state: {
              from: "/my-reservations",
            },
          });

          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your reservations. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, navigate]
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (authLoading) return;

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

  // =====================================================
  // LIVE RESERVATION STATUS UPDATES
  // =====================================================

  useEffect(() => {
    if (authLoading || !user || !token) return;

    const intervalId = window.setInterval(() => {
      fetchReservations(false);
    }, 8000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    authLoading,
    user,
    token,
    fetchReservations,
  ]);

  // =====================================================
  // AUTO CLEAR SUCCESS MESSAGE
  // =====================================================

  useEffect(() => {
    if (!success) return;

    const timer = window.setTimeout(() => {
      setSuccess("");
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [success]);

  // =====================================================
  // FILTERED RESERVATIONS
  // =====================================================

  const filteredReservations = useMemo(() => {
    if (activeFilter === "ALL") {
      return reservations;
    }

    if (activeFilter === "UPCOMING") {
      return reservations.filter(isUpcoming);
    }

    return reservations.filter(
      (reservation) =>
        reservation.status === activeFilter
    );
  }, [
    reservations,
    activeFilter,
  ]);

  // =====================================================
  // STATS
  // =====================================================

  const stats = useMemo(() => {
    const upcoming =
      reservations.filter(isUpcoming).length;

    const confirmed =
      reservations.filter(
        (item) => item.status === "CONFIRMED"
      ).length;

    const pending =
      reservations.filter(
        (item) => item.status === "PENDING"
      ).length;

    const completed =
      reservations.filter(
        (item) =>
          item.status === "CONFIRMED" &&
          !isUpcoming(item)
      ).length;

    return {
      total: reservations.length,
      upcoming,
      confirmed,
      pending,
      completed,
    };
  }, [reservations]);

  // =====================================================
  // CANCEL MODAL
  // =====================================================

  const openCancelModal = (reservation) => {
    setSelectedReservation(reservation);
    setShowCancelModal(true);

    setError("");
    setSuccess("");
  };

  const closeCancelModal = () => {
    if (cancelLoading) return;

    setShowCancelModal(false);
    setSelectedReservation(null);
  };

  // =====================================================
  // CANCEL RESERVATION
  // =====================================================

  const handleCancelReservation = async () => {
    if (!selectedReservation) return;

    const reservationId =
      getReservationId(selectedReservation);

    if (!reservationId) {
      setError(
        "Reservation ID is missing."
      );
      return;
    }

    const savedToken =
      token || localStorage.getItem("token");

    if (!savedToken) {
      navigate("/login");
      return;
    }

    try {
      setCancelLoading(true);
      setError("");

      await axios.patch(
        `${API_URL}/reservations/${reservationId}/cancel`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${savedToken}`,
          },
          timeout: 15000,
        }
      );

      setShowCancelModal(false);
      setSelectedReservation(null);

      setSuccess(
        "Your reservation has been cancelled successfully."
      );

      await fetchReservations(false);
    } catch (err) {
      console.error(
        "Cancel Reservation Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to cancel reservation. Please try again."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (authLoading || loading) {
    return (
      <main className="my-reservations-page">
        <div className="reservations-loading">
          <div className="loading-spinner" />

          <h2>
            Loading your reservations...
          </h2>

          <p>
            Please wait while we fetch your table bookings.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="my-reservations-page">

      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="reservations-container">

        <section className="reservations-header">

          <div className="header-content">

            <span className="header-eyebrow">
              YOUR DINING JOURNEY
            </span>

            <h1>
              My Reservations
            </h1>

            <p>
              Manage your table bookings and
              keep track of your upcoming dining experiences.
            </p>

          </div>

          <button
            type="button"
            className="new-reservation-btn"
            onClick={() =>
              navigate("/reservation")
            }
          >
            <span>+</span>
            New Reservation
          </button>

        </section>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {success && (
          <div className="reservation-alert success-alert">

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
            >
              ×
            </button>

          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="reservation-alert error-alert">

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
              📋
            </div>

            <div>
              <span>
                Total Reservations
              </span>

              <strong>
                {stats.total}
              </strong>
            </div>

          </div>

          <div className="reservation-stat-card">

            <div className="stat-icon">
              📅
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

          <div className="reservation-stat-card">

            <div className="stat-icon">
              ⭐
            </div>

            <div>
              <span>
                Completed
              </span>

              <strong>
                {stats.completed}
              </strong>
            </div>

          </div>

        </section>

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="reservations-toolbar">

          <div className="reservation-filters">

            {[
              ["ALL", "All"],
              ["UPCOMING", "Upcoming"],
              ["CONFIRMED", "Confirmed"],
              ["PENDING", "Pending"],
              ["REJECTED", "Rejected"],
              ["CANCELLED", "Cancelled"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  activeFilter === value
                    ? "filter-btn active"
                    : "filter-btn"
                }
                onClick={() =>
                  setActiveFilter(value)
                }
              >
                {label}

                <span>
                  {value === "ALL"
                    ? reservations.length
                    : value === "UPCOMING"
                    ? stats.upcoming
                    : reservations.filter(
                        (item) =>
                          item.status === value
                      ).length}
                </span>
              </button>
            ))}

          </div>

          <div className="toolbar-actions">

            {token && (
              <span className="live-update-indicator">
                <span className="live-dot" />
                Live updates
              </span>
            )}

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

          </div>

        </section>

        {/* =================================================
            RESERVATION LIST
        ================================================= */}

        {filteredReservations.length === 0 ? (

          <section className="empty-reservations">

            <div className="empty-icon">
              🍽️
            </div>

            <span className="header-eyebrow">
              NOTHING HERE YET
            </span>

            <h2>
              No reservations found
            </h2>

            <p>
              {activeFilter === "ALL"
                ? "You don't have any reservations yet. Book a table and make your next visit special."
                : "There are no reservations matching this filter."}
            </p>

            <button
              type="button"
              className="new-reservation-btn"
              onClick={() =>
                navigate("/reservation")
              }
            >
              <span>+</span>
              Reserve a Table
            </button>

          </section>

        ) : (

          <section className="reservations-list">

            {filteredReservations.map(
              (reservation) => {

                const statusConfig =
                  getStatusConfig(
                    reservation.status
                  );

                const upcoming =
                  isUpcoming(reservation);

                const reservationId =
                  getReservationId(
                    reservation
                  );

                return (
                  <article
                    key={reservationId}
                    className="reservation-card"
                  >

                    {/* ==============================
                        CARD TOP
                    ============================== */}

                    <div className="reservation-card-top">

                      <div className="reservation-type">

                        <div className="table-icon">
                          {getTableIcon(
                            reservation.tableType
                          )}
                        </div>

                        <div>

                          <span>
                            TABLE RESERVATION
                          </span>

                          <h2>
                            {reservation.tableType ||
                              "Table Reservation"}
                          </h2>

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

                    {/* ==============================
                        MAIN DETAILS
                    ============================== */}

                    <div className="reservation-card-body">

                      <div className="reservation-main-details">

                        <div className="reservation-detail">

                          <span>
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              reservation.date
                            )}
                          </strong>

                        </div>

                        <div className="reservation-detail">

                          <span>
                            TIME
                          </span>

                          <strong>
                            {formatTime(
                              reservation.time
                            )}
                          </strong>

                        </div>

                        <div className="reservation-detail">

                          <span>
                            GUESTS
                          </span>

                          <strong>
                            {reservation.guests}
                          </strong>

                        </div>

                        <div className="reservation-detail">

                          <span>
                            TABLE FEE
                          </span>

                          <strong>
                            {formatCurrency(
                              reservation.tablePrice
                            )}
                          </strong>

                        </div>

                      </div>

                      {/* ==============================
                          EXTRA DETAILS
                      ============================== */}

                      <div className="reservation-extra-details">

                        <div>

                          <span>
                            Occasion
                          </span>

                          <strong>
                            {reservation.occasion ||
                              "Dining"}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Guest Name
                          </span>

                          <strong>
                            {reservation.customer
                              ?.name ||
                              reservation.name ||
                              user?.name ||
                              "—"}
                          </strong>

                        </div>

                        {reservation.assignedTable && (
                          <div className="assigned-table-detail">

                            <span>
                              Assigned Table
                            </span>

                            <strong>
                              Table{" "}
                              {reservation.assignedTable}
                            </strong>

                          </div>
                        )}

                      </div>

                      {/* ==============================
                          ADMIN NOTE
                      ============================== */}

                      {reservation.adminNote && (
                        <div className="reservation-admin-note">

                          <span>
                            RESTAURANT NOTE
                          </span>

                          <p>
                            {reservation.adminNote}
                          </p>

                        </div>
                      )}

                      {/* ==============================
                          SPECIAL REQUEST
                      ============================== */}

                      {reservation.message && (
                        <div className="reservation-special-request">

                          <span>
                            SPECIAL REQUEST
                          </span>

                          <p>
                            {reservation.message}
                          </p>

                        </div>
                      )}

                    </div>

                    {/* ==============================
                        CARD FOOTER
                    ============================== */}

                    <div className="reservation-card-footer">

                      <div className="reservation-actions">

                        {upcoming &&
                          reservation.status !==
                            "CANCELLED" && (
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
                          <span>→</span>
                        </button>

                      </div>

                    </div>

                    {/* ==============================
                        STATUS MESSAGE
                    ============================== */}

                    <div className="reservation-status-message">

                      <span>
                        {statusConfig.icon}
                      </span>

                      <p>
                        {statusConfig.description}
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
              Reserve your favourite table and
              let us take care of the experience.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/reservation")
            }
          >
            Reserve a Table
            <span>→</span>
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
              setSelectedReservation(null)
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
                  setSelectedReservation(null)
                }
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
                    {selectedReservation.guests}
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
                      : "Pending"}
                  </strong>
                </div>

              </div>

              {selectedReservation.message && (
                <div className="modal-message">

                  <span>
                    SPECIAL REQUEST
                  </span>

                  <p>
                    {selectedReservation.message}
                  </p>

                </div>
              )}

              {selectedReservation.adminNote && (
                <div className="modal-message admin">

                  <span>
                    NOTE FROM RESTAURANT
                  </span>

                  <p>
                    {selectedReservation.adminNote}
                  </p>

                </div>
              )}

              <button
                type="button"
                className="modal-primary-btn"
                onClick={() =>
                  setSelectedReservation(null)
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
                You are about to cancel your reservation
                for{" "}
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
                    {selectedReservation.tableType}
                  </strong>

                  <small>
                    {selectedReservation.guests} guests
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