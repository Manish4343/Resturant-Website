import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import "../styles/adminReservations.css";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "pending",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "confirmed",
  },
  REJECTED: {
    label: "Rejected",
    className: "rejected",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "cancelled",
  },
};

const TABLE_OPTIONS = [
  {
    number: "T1",
    name: "Table 1",
    capacity: "1–4 Guests",
  },
  {
    number: "T2",
    name: "Table 2",
    capacity: "1–4 Guests",
  },
  {
    number: "T3",
    name: "Table 3",
    capacity: "1–4 Guests",
  },
  {
    number: "T4",
    name: "Table 4",
    capacity: "1–4 Guests",
  },
  {
    number: "T5",
    name: "Table 5",
    capacity: "4–8 Guests",
  },
  {
    number: "T6",
    name: "Table 6",
    capacity: "4–8 Guests",
  },
  {
    number: "T7",
    name: "Table 7",
    capacity: "4–10 Guests",
  },
  {
    number: "T8",
    name: "Table 8",
    capacity: "2 Guests",
  },
  {
    number: "T9",
    name: "Table 9",
    capacity: "2–8 Guests",
  },
  {
    number: "T10",
    name: "Table 10",
    capacity: "2–8 Guests",
  },
];

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "—";

  const [hours, minutes] = String(time).split(":");

  if (hours === undefined || minutes === undefined) {
    return time;
  }

  const date = new Date();

  date.setHours(
    Number(hours),
    Number(minutes),
    0,
    0
  );

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

const getCustomerName = (reservation) => {
  return (
    reservation?.customer?.name ||
    reservation?.user?.name ||
    reservation?.name ||
    "Guest"
  );
};

const getCustomerPhone = (reservation) => {
  return (
    reservation?.customer?.phone ||
    reservation?.user?.phone ||
    reservation?.phone ||
    "—"
  );
};

const getCustomerEmail = (reservation) => {
  return (
    reservation?.customer?.email ||
    reservation?.user?.email ||
    reservation?.email ||
    "—"
  );
};

const getTableType = (reservation) => {
  return reservation?.tableType || "Table";
};

const getGuests = (reservation) => {
  return reservation?.guests || 0;
};

const getOccasion = (reservation) => {
  return (
    reservation?.occasion ||
    "General Dining"
  );
};

const getStatus = (reservation) => {
  return String(
    reservation?.status || "PENDING"
  ).toUpperCase();
};

const getApiError = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    fallback
  );
};

export default function AdminReservations() {
  const navigate = useNavigate();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [reservations, setReservations] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const [
    selectedReservation,
    setSelectedReservation,
  ] = useState(null);

  const [modalMode, setModalMode] =
    useState(null);

  const [tableNumber, setTableNumber] =
    useState("");

  const [adminNote, setAdminNote] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  /* =========================================================
     FETCH RESERVATIONS
  ========================================================= */

  const fetchReservations = useCallback(
    async (showRefreshLoader = false) => {
      try {
        setError("");

        if (showRefreshLoader) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "Authentication token not found. Please login again."
          );
          setReservations([]);
          return;
        }

        const response =
          await api.get("/reservations", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        console.log(
          "========================================"
        );

        console.log(
          "ADMIN RESERVATIONS API RESPONSE:",
          response?.data
        );

        console.log(
          "========================================"
        );

        const responseData =
          response?.data;

        /*
          Backend response:

          {
            success: true,
            count: 2,
            data: [...]
          }

          So reservations are inside:

          responseData.data
        */

        let reservationList = [];

        if (
          Array.isArray(responseData)
        ) {
          reservationList =
            responseData;
        } else if (
          Array.isArray(
            responseData?.data
          )
        ) {
          reservationList =
            responseData.data;
        } else if (
          Array.isArray(
            responseData?.reservations
          )
        ) {
          reservationList =
            responseData.reservations;
        }

        console.log(
          "ADMIN RESERVATIONS LIST:",
          reservationList
        );

        console.log(
          "TOTAL RESERVATIONS:",
          reservationList.length
        );

        setReservations(
          reservationList
        );
      } catch (err) {
        console.error(
          "Fetch reservations error:",
          err
        );

        if (
          err?.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        if (
          err?.response?.status === 403
        ) {
          setError(
            "You do not have administrator access."
          );
        } else {
          setError(
            getApiError(
              err,
              "Unable to load reservations. Please try again."
            )
          );
        }

        setReservations([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate]
  );

  /* =========================================================
     AUTH CHECK
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
      navigate("/", {
        replace: true,
      });

      return;
    }

    fetchReservations();
  }, [
    authLoading,
    user,
    navigate,
    fetchReservations,
  ]);

  /* =========================================================
     AUTO CLEAR SUCCESS MESSAGE
  ========================================================= */

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setSuccessMessage("");
    }, 3500);

    return () => {
      clearTimeout(timer);
    };
  }, [successMessage]);

  /* =========================================================
     FILTER + SEARCH
  ========================================================= */

  const filteredReservations = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return reservations.filter(
      (reservation) => {
        const status =
          getStatus(reservation);

        const matchesFilter =
          activeFilter === "ALL" ||
          status === activeFilter;

        if (!matchesFilter) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          getCustomerName(
            reservation
          ),
          getCustomerPhone(
            reservation
          ),
          getCustomerEmail(
            reservation
          ),
          getTableType(
            reservation
          ),
          getOccasion(
            reservation
          ),
          reservation?.assignedTable,
          reservation?.date,
          reservation?.time,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch
        );
      }
    );
  }, [
    reservations,
    activeFilter,
    search,
  ]);

  /* =========================================================
     STATS
  ========================================================= */

  const stats = useMemo(() => {
    return {
      total: reservations.length,

      pending:
        reservations.filter(
          (item) =>
            getStatus(item) ===
            "PENDING"
        ).length,

      confirmed:
        reservations.filter(
          (item) =>
            getStatus(item) ===
            "CONFIRMED"
        ).length,

      rejected:
        reservations.filter(
          (item) =>
            getStatus(item) ===
            "REJECTED"
        ).length,

      cancelled:
        reservations.filter(
          (item) =>
            getStatus(item) ===
            "CANCELLED"
        ).length,
    };
  }, [reservations]);

  /* =========================================================
     OPEN APPROVE MODAL
  ========================================================= */

  const openApproveModal = (
    reservation
  ) => {
    setSelectedReservation(
      reservation
    );

    setModalMode("approve");

    setTableNumber(
      reservation?.assignedTable ||
        ""
    );

    setAdminNote(
      reservation?.adminNote ||
        ""
    );

    setError("");
  };

  /* =========================================================
     OPEN REJECT MODAL
  ========================================================= */

  const openRejectModal = (
    reservation
  ) => {
    setSelectedReservation(
      reservation
    );

    setModalMode("reject");

    setTableNumber("");

    setAdminNote("");

    setError("");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setSelectedReservation(null);

    setModalMode(null);

    setTableNumber("");

    setAdminNote("");

    setError("");
  };

  /* =========================================================
     APPROVE RESERVATION
  ========================================================= */

  const handleApprove =
    async () => {
      if (
        !selectedReservation?._id
      ) {
        setError(
          "Reservation ID is missing."
        );

        return;
      }

      if (!tableNumber.trim()) {
        setError(
          "Please select a table number."
        );

        return;
      }

      try {
        setActionLoading(true);

        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found."
          );
        }

        const response =
          await api.patch(
            `/reservations/${selectedReservation._id}/approve`,
            {
              tableNumber:
                tableNumber.trim(),

              adminNote:
                adminNote.trim(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        console.log(
          "APPROVE RESERVATION RESPONSE:",
          response?.data
        );

        /*
          Backend returns:

          {
            success: true,
            message: "...",
            data: reservation
          }
        */

        const updatedReservation =
          response?.data?.data ||
          response?.data?.reservation ||
          null;

        setReservations(
          (previous) =>
            previous.map(
              (reservation) =>
                reservation._id ===
                selectedReservation._id
                  ? updatedReservation ||
                    {
                      ...reservation,
                      status:
                        "CONFIRMED",
                      assignedTable:
                        tableNumber.trim(),
                      adminNote:
                        adminNote.trim(),
                    }
                  : reservation
            )
        );

        setSuccessMessage(
          `Reservation for ${getCustomerName(
            selectedReservation
          )} has been confirmed.`
        );

        setSelectedReservation(
          null
        );

        setModalMode(null);

        setTableNumber("");

        setAdminNote("");

        /*
          Fetch again so admin panel
          always matches database.
        */

        await fetchReservations();
      } catch (err) {
        console.error(
          "Approve reservation error:",
          err
        );

        if (
          err?.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setError(
          getApiError(
            err,
            "Unable to approve reservation. Please try again."
          )
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =========================================================
     REJECT RESERVATION
  ========================================================= */

  const handleReject =
    async () => {
      if (
        !selectedReservation?._id
      ) {
        setError(
          "Reservation ID is missing."
        );

        return;
      }

      try {
        setActionLoading(true);

        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Authentication token not found."
          );
        }

        const response =
          await api.patch(
            `/reservations/${selectedReservation._id}/reject`,
            {
              adminNote:
                adminNote.trim(),
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        console.log(
          "REJECT RESERVATION RESPONSE:",
          response?.data
        );

        const updatedReservation =
          response?.data?.data ||
          response?.data?.reservation ||
          null;

        setReservations(
          (previous) =>
            previous.map(
              (reservation) =>
                reservation._id ===
                selectedReservation._id
                  ? updatedReservation ||
                    {
                      ...reservation,
                      status:
                        "REJECTED",
                      adminNote:
                        adminNote.trim(),
                    }
                  : reservation
            )
        );

        setSuccessMessage(
          `Reservation for ${getCustomerName(
            selectedReservation
          )} has been rejected.`
        );

        setSelectedReservation(
          null
        );

        setModalMode(null);

        setTableNumber("");

        setAdminNote("");

        await fetchReservations();
      } catch (err) {
        console.error(
          "Reject reservation error:",
          err
        );

        if (
          err?.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setError(
          getApiError(
            err,
            "Unable to reject reservation. Please try again."
          )
        );
      } finally {
        setActionLoading(false);
      }
    };

  /* =========================================================
     TABLE AVAILABILITY
  ========================================================= */

  const isTableAlreadyAssigned =
    (table) => {
      if (!selectedReservation) {
        return false;
      }

      return reservations.some(
        (reservation) => {
          if (
            reservation._id ===
            selectedReservation._id
          ) {
            return false;
          }

          if (
            getStatus(reservation) !==
            "CONFIRMED"
          ) {
            return false;
          }

          const sameDate =
            String(
              reservation.date || ""
            ).slice(0, 10) ===
            String(
              selectedReservation.date ||
                ""
            ).slice(0, 10);

          const sameTime =
            String(
              reservation.time || ""
            ) ===
            String(
              selectedReservation.time ||
                ""
            );

          const sameTable =
            String(
              reservation.assignedTable ||
                ""
            ).toLowerCase() ===
            String(
              table.number || ""
            ).toLowerCase();

          return (
            sameDate &&
            sameTime &&
            sameTable
          );
        }
      );
    };

  /* =========================================================
     RENDER - LOADING
  ========================================================= */

  if (
    authLoading ||
    loading
  ) {
    return (
      <div className="admin-reservations-page">
        <div className="admin-reservations-loading">
          <div className="admin-loading-spinner"></div>

          <p>
            Loading reservations...
          </p>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER - ACCESS
  ========================================================= */

  if (
    !user ||
    user.role !== "admin"
  ) {
    return null;
  }

  /* =========================================================
     MAIN UI
  ========================================================= */

  return (
    <div className="admin-reservations-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-reservations-header">

        <div>

          <button
            type="button"
            className="admin-back-btn"
            onClick={() =>
              navigate("/admin")
            }
          >
            ← Back to Dashboard
          </button>

          <div className="admin-title-row">

            <div>

              <p className="admin-eyebrow">
                SWAAD & SPICE
              </p>

              <h1>
                Reservation Management
              </h1>

              <p className="admin-subtitle">
                Manage table bookings,
                approve requests and
                handle reservation status.
              </p>

            </div>

          </div>

        </div>

        <button
          type="button"
          className="admin-refresh-btn"
          onClick={() =>
            fetchReservations(true)
          }
          disabled={refreshing}
        >
          {refreshing
            ? "Refreshing..."
            : "↻ Refresh"}
        </button>

      </header>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {successMessage && (
        <div className="admin-success-message">
          <span>✓</span>

          {successMessage}
        </div>
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error &&
        !selectedReservation && (
          <div className="admin-error-message">

            <span>!</span>

            {error}

          </div>
        )}

      {/* =====================================================
          STATS
      ===================================================== */}

      <section className="reservation-stats">

        <div className="reservation-stat-card">

          <div className="reservation-stat-icon">
            📋
          </div>

          <div>

            <span>
              Total
            </span>

            <strong>
              {stats.total}
            </strong>

          </div>

        </div>

        <div className="reservation-stat-card pending-card">

          <div className="reservation-stat-icon">
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

        <div className="reservation-stat-card confirmed-card">

          <div className="reservation-stat-icon">
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

        <div className="reservation-stat-card rejected-card">

          <div className="reservation-stat-icon">
            ✕
          </div>

          <div>

            <span>
              Rejected
            </span>

            <strong>
              {stats.rejected}
            </strong>

          </div>

        </div>

        <div className="reservation-stat-card cancelled-card">

          <div className="reservation-stat-icon">
            ↩
          </div>

          <div>

            <span>
              Cancelled
            </span>

            <strong>
              {stats.cancelled}
            </strong>

          </div>

        </div>

      </section>

      {/* =====================================================
          FILTER BAR
      ===================================================== */}

      <section className="reservation-toolbar">

        <div className="reservation-filters">

          {[
            ["ALL", "All"],
            ["PENDING", "Pending"],
            ["CONFIRMED", "Confirmed"],
            ["REJECTED", "Rejected"],
            ["CANCELLED", "Cancelled"],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  activeFilter === value
                    ? "reservation-filter active"
                    : "reservation-filter"
                }
                onClick={() =>
                  setActiveFilter(
                    value
                  )
                }
              >
                {label}
              </button>
            )
          )}

        </div>

        <div className="reservation-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search customer, phone, table..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          {search && (
            <button
              type="button"
              className="clear-search"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              ×
            </button>
          )}

        </div>

      </section>

      {/* =====================================================
          RESERVATION LIST
      ===================================================== */}

      <section className="admin-reservation-list">

        {filteredReservations.length ===
        0 ? (
          <div className="empty-reservations">

            <div className="empty-icon">
              🍽️
            </div>

            <h2>
              No reservations found
            </h2>

            <p>
              {search
                ? "Try a different search term."
                : "There are no reservations in this category."}
            </p>

            <button
              type="button"
              className="admin-refresh-btn"
              onClick={() =>
                fetchReservations(
                  true
                )
              }
              disabled={refreshing}
            >
              {refreshing
                ? "Refreshing..."
                : "↻ Refresh Reservations"}
            </button>

          </div>
        ) : (
          filteredReservations.map(
            (reservation) => {
              const status =
                getStatus(
                  reservation
                );

              const statusConfig =
                STATUS_CONFIG[
                  status
                ] ||
                STATUS_CONFIG.PENDING;

              return (
                <article
                  className="admin-reservation-card"
                  key={
                    reservation._id
                  }
                >

                  {/* CARD TOP */}

                  <div className="reservation-card-top">

                    <div className="reservation-customer">

                      <div className="customer-avatar">

                        {getCustomerName(
                          reservation
                        )
                          .charAt(0)
                          .toUpperCase()}

                      </div>

                      <div>

                        <h2>
                          {getCustomerName(
                            reservation
                          )}
                        </h2>

                        <p>
                          Reservation ID:{" "}
                          <span>
                            {reservation._id
                              ? reservation._id
                                  .slice(
                                    -8
                                  )
                                  .toUpperCase()
                              : "—"}
                          </span>
                        </p>

                      </div>

                    </div>

                    <span
                      className={`reservation-status ${statusConfig.className}`}
                    >
                      {
                        statusConfig.label
                      }
                    </span>

                  </div>

                  {/* DETAILS */}

                  <div className="reservation-details-grid">

                    <div className="reservation-detail">

                      <span className="detail-label">
                        Date
                      </span>

                      <strong>
                        📅{" "}
                        {formatDate(
                          reservation.date
                        )}
                      </strong>

                    </div>

                    <div className="reservation-detail">

                      <span className="detail-label">
                        Time
                      </span>

                      <strong>
                        🕐{" "}
                        {formatTime(
                          reservation.time
                        )}
                      </strong>

                    </div>

                    <div className="reservation-detail">

                      <span className="detail-label">
                        Guests
                      </span>

                      <strong>
                        👥{" "}
                        {getGuests(
                          reservation
                        )}{" "}
                        Guests
                      </strong>

                    </div>

                    <div className="reservation-detail">

                      <span className="detail-label">
                        Table Type
                      </span>

                      <strong>
                        🍽️{" "}
                        {getTableType(
                          reservation
                        )}
                      </strong>

                    </div>

                    <div className="reservation-detail">

                      <span className="detail-label">
                        Occasion
                      </span>

                      <strong>
                        🎉{" "}
                        {getOccasion(
                          reservation
                        )}
                      </strong>

                    </div>

                    <div className="reservation-detail">

                      <span className="detail-label">
                        Price
                      </span>

                      <strong>
                        ₹
                        {Number(
                          reservation.tablePrice ||
                            0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                    </div>

                  </div>

                  {/* CUSTOMER CONTACT */}

                  <div className="reservation-contact">

                    <div>
                      <span>
                        📞
                      </span>

                      <span>
                        {getCustomerPhone(
                          reservation
                        )}
                      </span>
                    </div>

                    <div>
                      <span>
                        ✉️
                      </span>

                      <span>
                        {getCustomerEmail(
                          reservation
                        )}
                      </span>
                    </div>

                  </div>

                  {/* ASSIGNED TABLE */}

                  {reservation.assignedTable && (
                    <div className="assigned-table-box">

                      <span>
                        🪑
                      </span>

                      <div>

                        <small>
                          Assigned Table
                        </small>

                        <strong>
                          {
                            reservation.assignedTable
                          }
                        </strong>

                      </div>

                    </div>
                  )}

                  {/* CUSTOMER MESSAGE */}

                  {reservation.message && (
                    <div className="reservation-message-box">

                      <span>
                        💬
                      </span>

                      <div>

                        <small>
                          Special Request
                        </small>

                        <p>
                          {
                            reservation.message
                          }
                        </p>

                      </div>

                    </div>
                  )}

                  {/* ADMIN NOTE */}

                  {reservation.adminNote && (
                    <div className="reservation-admin-note">

                      <span>
                        📝
                      </span>

                      <div>

                        <small>
                          Admin Note
                        </small>

                        <p>
                          {
                            reservation.adminNote
                          }
                        </p>

                      </div>

                    </div>
                  )}

                  {/* ACTIONS */}

                  {status ===
                    "PENDING" && (
                    <div className="reservation-actions">

                      <button
                        type="button"
                        className="admin-reject-btn"
                        onClick={() =>
                          openRejectModal(
                            reservation
                          )
                        }
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        className="admin-approve-btn"
                        onClick={() =>
                          openApproveModal(
                            reservation
                          )
                        }
                      >
                        ✓ Approve Reservation
                      </button>

                    </div>
                  )}

                  {status ===
                    "CONFIRMED" && (
                    <div className="confirmed-info">

                      <span>
                        ✓
                      </span>

                      <p>
                        This reservation is
                        confirmed
                        {reservation.assignedTable
                          ? ` for ${reservation.assignedTable}`
                          : ""}
                        .
                      </p>

                    </div>
                  )}

                  {status ===
                    "REJECTED" && (
                    <div className="rejected-info">

                      <span>
                        ✕
                      </span>

                      <p>
                        This reservation has
                        been rejected.
                      </p>

                    </div>
                  )}

                  {status ===
                    "CANCELLED" && (
                    <div className="cancelled-info">

                      <span>
                        ↩
                      </span>

                      <p>
                        This reservation was
                        cancelled.
                      </p>

                    </div>
                  )}

                </article>
              );
            }
          )
        )}

      </section>

      {/* =====================================================
          APPROVE / REJECT MODAL
      ===================================================== */}

      {selectedReservation &&
        modalMode && (
          <div
            className="reservation-modal-overlay"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                  event.currentTarget &&
                !actionLoading
              ) {
                closeModal();
              }
            }}
          >

            <div
              className="reservation-modal"
              role="dialog"
              aria-modal="true"
            >

              {/* MODAL HEADER */}

              <div className="reservation-modal-header">

                <div>

                  <p className="admin-eyebrow">

                    {modalMode ===
                    "approve"
                      ? "CONFIRM BOOKING"
                      : "REJECT REQUEST"}

                  </p>

                  <h2>

                    {modalMode ===
                    "approve"
                      ? "Approve Reservation"
                      : "Reject Reservation"}

                  </h2>

                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    actionLoading
                  }
                  aria-label="Close"
                >
                  ×
                </button>

              </div>

              {/* RESERVATION SUMMARY */}

              <div className="modal-reservation-summary">

                <div className="modal-customer-avatar">

                  {getCustomerName(
                    selectedReservation
                  )
                    .charAt(0)
                    .toUpperCase()}

                </div>

                <div>

                  <strong>
                    {getCustomerName(
                      selectedReservation
                    )}
                  </strong>

                  <p>
                    {formatDate(
                      selectedReservation.date
                    )}{" "}
                    •{" "}
                    {formatTime(
                      selectedReservation.time
                    )}
                  </p>

                  <p>
                    {getGuests(
                      selectedReservation
                    )}{" "}
                    Guests •{" "}
                    {getTableType(
                      selectedReservation
                    )}
                  </p>

                </div>

              </div>

              {/* APPROVE FORM */}

              {modalMode ===
                "approve" && (
                <>
                  <div className="modal-field">

                    <label htmlFor="tableNumber">

                      Assign Table{" "}
                      <span>*</span>

                    </label>

                    <select
                      id="tableNumber"
                      value={
                        tableNumber
                      }
                      onChange={(
                        event
                      ) =>
                        setTableNumber(
                          event.target
                            .value
                        )
                      }
                      disabled={
                        actionLoading
                      }
                    >

                      <option value="">
                        Select a table
                      </option>

                      {TABLE_OPTIONS.map(
                        (table) => {
                          const unavailable =
                            isTableAlreadyAssigned(
                              table
                            );

                          return (
                            <option
                              key={
                                table.number
                              }
                              value={
                                table.number
                              }
                              disabled={
                                unavailable
                              }
                            >
                              {
                                table.name
                              }{" "}
                              —{" "}
                              {
                                table.capacity
                              }

                              {unavailable
                                ? " — Already Booked"
                                : ""}
                            </option>
                          );
                        }
                      )}

                    </select>

                  </div>

                  {tableNumber && (
                    <div className="table-selected-message">

                      ✓{" "}
                      {tableNumber}{" "}
                      selected for this
                      reservation

                    </div>
                  )}
                </>
              )}

              {/* ADMIN NOTE */}

              <div className="modal-field">

                <label htmlFor="adminNote">

                  {modalMode ===
                  "approve"
                    ? "Admin Note"
                    : "Reason for Rejection"}

                </label>

                <textarea
                  id="adminNote"
                  rows="4"
                  value={
                    adminNote
                  }
                  onChange={(
                    event
                  ) =>
                    setAdminNote(
                      event.target
                        .value
                    )
                  }
                  placeholder={
                    modalMode ===
                    "approve"
                      ? "Optional note for the customer..."
                      : "Enter reason for rejecting this reservation..."
                  }
                  disabled={
                    actionLoading
                  }
                />

              </div>

              {/* MODAL ERROR */}

              {error && (
                <div className="modal-error">

                  <span>
                    !
                  </span>

                  {error}

                </div>
              )}

              {/* MODAL ACTIONS */}

              <div className="reservation-modal-actions">

                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Go Back
                </button>

                {modalMode ===
                "approve" ? (
                  <button
                    type="button"
                    className="modal-confirm-btn"
                    onClick={
                      handleApprove
                    }
                    disabled={
                      actionLoading ||
                      !tableNumber
                    }
                  >
                    {actionLoading
                      ? "Confirming..."
                      : "✓ Confirm Reservation"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="modal-reject-confirm-btn"
                    onClick={
                      handleReject
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    {actionLoading
                      ? "Rejecting..."
                      : "Reject Reservation"}
                  </button>
                )}

              </div>

            </div>

          </div>
        )}

    </div>
  );
}