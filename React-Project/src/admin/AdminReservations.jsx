import { useEffect, useState } from "react";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import "../styles/adminReservations.css";

function AdminReservations() {

    const { user } = useAuth();

    const [reservations, setReservations] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [processingId, setProcessingId] =
        useState(null);

    const [tableNumbers, setTableNumbers] =
        useState({});

    const [adminNotes, setAdminNotes] =
        useState({});


    const API =
        "http://localhost:5000/api";


    const getToken = () =>
        localStorage.getItem("token");


    // =====================================================
    // FETCH
    // =====================================================

    const fetchReservations = async () => {

        try {

            setLoading(true);
            setError("");

            const token = getToken();

            const response =
                await axios.get(
                    `${API}/reservations`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            setReservations(
                response.data.data || []
            );

        } catch (error) {

            console.error(
                "Admin reservations error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load reservations."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        if (
            user?.role === "admin"
        ) {
            fetchReservations();
        }

    }, [user]);


    // =====================================================
    // APPROVE
    // =====================================================

    const approveReservation =
        async (id) => {

            const tableNumber =
                tableNumbers[id]?.trim();


            if (!tableNumber) {

                alert(
                    "Enter the available table number first."
                );

                return;
            }


            try {

                setProcessingId(id);

                const token =
                    getToken();


                await axios.patch(

                    `${API}/reservations/${id}/approve`,

                    {
                        tableNumber,

                        adminNote:
                            adminNotes[id] ||
                            "",
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }

                );


                alert(
                    "Reservation confirmed successfully."
                );


                await fetchReservations();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Failed to approve reservation."
                );

            } finally {

                setProcessingId(null);

            }

        };


    // =====================================================
    // REJECT
    // =====================================================

    const rejectReservation =
        async (id) => {

            const confirmed =
                window.confirm(
                    "Reject this reservation request?"
                );

            if (!confirmed) {
                return;
            }


            try {

                setProcessingId(id);

                const token =
                    getToken();


                await axios.patch(

                    `${API}/reservations/${id}/reject`,

                    {
                        adminNote:
                            adminNotes[id] ||
                            "No suitable table available.",
                    },

                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }

                );


                await fetchReservations();

            } catch (error) {

                alert(
                    error.response?.data?.message ||
                    "Failed to reject reservation."
                );

            } finally {

                setProcessingId(null);

            }

        };


    // =====================================================
    // ACCESS
    // =====================================================

    if (!user) {

        return (
            <main className="admin-reservations-page">

                <div className="admin-reservation-message">
                    <h2>
                        🔐 Please Login
                    </h2>
                </div>

            </main>
        );

    }


    if (user.role !== "admin") {

        return (
            <main className="admin-reservations-page">

                <div className="admin-reservation-message">
                    <h2>
                        🚫 Access Denied
                    </h2>

                    <p>
                        Only administrators can access reservations.
                    </p>
                </div>

            </main>
        );

    }


    if (loading) {

        return (
            <main className="admin-reservations-page">

                <div className="admin-reservation-message">
                    <h2>
                        ⏳ Loading Reservations...
                    </h2>
                </div>

            </main>
        );

    }


    return (
        <main className="admin-reservations-page">

            <div className="admin-reservation-header">

                <div>

                    <span>
                        ADMIN PANEL
                    </span>

                    <h1>
                        🪑 Reservation Management
                    </h1>

                    <p>
                        Review requests and confirm available tables.
                    </p>

                </div>

                <button
                    className="admin-refresh-btn"
                    onClick={fetchReservations}
                >
                    🔄 Refresh
                </button>

            </div>


            {error && (

                <div className="admin-reservation-error">
                    ❌ {error}
                </div>

            )}


            {/* STATS */}

            <div className="admin-reservation-stats">

                <div>
                    <span>📋</span>
                    <strong>
                        {reservations.length}
                    </strong>
                    <p>
                        Total
                    </p>
                </div>


                <div>
                    <span>🟡</span>
                    <strong>
                        {
                            reservations.filter(
                                (r) =>
                                    r.status === "PENDING"
                            ).length
                        }
                    </strong>
                    <p>
                        Pending
                    </p>
                </div>


                <div>
                    <span>✅</span>
                    <strong>
                        {
                            reservations.filter(
                                (r) =>
                                    r.status === "CONFIRMED"
                            ).length
                        }
                    </strong>
                    <p>
                        Confirmed
                    </p>
                </div>


                <div>
                    <span>❌</span>
                    <strong>
                        {
                            reservations.filter(
                                (r) =>
                                    r.status === "REJECTED"
                            ).length
                        }
                    </strong>
                    <p>
                        Rejected
                    </p>
                </div>

            </div>


            {/* LIST */}

            {reservations.length === 0 ? (

                <div className="admin-reservation-message">

                    <div>
                        🍽️
                    </div>

                    <h2>
                        No Reservations Yet
                    </h2>

                    <p>
                        Customer reservation requests will appear here.
                    </p>

                </div>

            ) : (

                <div className="admin-reservation-list">

                    {reservations.map(
                        (reservation) => (

                            <article
                                className="admin-reservation-card"
                                key={reservation._id}
                            >

                                <div className="admin-reservation-top">

                                    <div>

                                        <span>
                                            CUSTOMER
                                        </span>

                                        <h2>
                                            {reservation.customer?.name}
                                        </h2>

                                        <p>
                                            📞{" "}
                                            {reservation.customer?.phone}
                                        </p>

                                        <p>
                                            ✉️{" "}
                                            {reservation.customer?.email}
                                        </p>

                                    </div>


                                    <div className="admin-reservation-status">

                                        {reservation.status}

                                    </div>

                                </div>


                                <div className="admin-reservation-info-grid">

                                    <div>
                                        <span>
                                            Experience
                                        </span>

                                        <strong>
                                            {reservation.tableType}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Price
                                        </span>

                                        <strong>
                                            ₹{reservation.tablePrice}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Date
                                        </span>

                                        <strong>
                                            {reservation.date}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Time
                                        </span>

                                        <strong>
                                            {reservation.time}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Guests
                                        </span>

                                        <strong>
                                            {reservation.guests}
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            Occasion
                                        </span>

                                        <strong>
                                            {reservation.occasion ||
                                                "General Dining"}
                                        </strong>
                                    </div>

                                </div>


                                {reservation.message && (

                                    <div className="customer-request">

                                        <span>
                                            CUSTOMER REQUEST
                                        </span>

                                        <p>
                                            {reservation.message}
                                        </p>

                                    </div>

                                )}


                                {reservation.status ===
                                    "PENDING" && (

                                    <div className="admin-action-box">

                                        <div className="admin-form-row">

                                            <div>

                                                <label>
                                                    Available Table Number
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="Example: T-12"
                                                    value={
                                                        tableNumbers[
                                                            reservation._id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setTableNumbers(
                                                            (prev) => ({
                                                                ...prev,
                                                                [reservation._id]:
                                                                    e.target.value,
                                                            })
                                                        )
                                                    }
                                                />

                                            </div>


                                            <div>

                                                <label>
                                                    Admin Note
                                                </label>

                                                <input
                                                    type="text"
                                                    placeholder="Optional note"
                                                    value={
                                                        adminNotes[
                                                            reservation._id
                                                        ] || ""
                                                    }
                                                    onChange={(e) =>
                                                        setAdminNotes(
                                                            (prev) => ({
                                                                ...prev,
                                                                [reservation._id]:
                                                                    e.target.value,
                                                            })
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>


                                        <div className="admin-action-buttons">

                                            <button
                                                className="approve-btn"
                                                disabled={
                                                    processingId ===
                                                    reservation._id
                                                }
                                                onClick={() =>
                                                    approveReservation(
                                                        reservation._id
                                                    )
                                                }
                                            >
                                                {processingId ===
                                                reservation._id
                                                    ? "Processing..."
                                                    : "✓ Confirm Booking"}
                                            </button>


                                            <button
                                                className="reject-btn"
                                                disabled={
                                                    processingId ===
                                                    reservation._id
                                                }
                                                onClick={() =>
                                                    rejectReservation(
                                                        reservation._id
                                                    )
                                                }
                                            >
                                                ✕ Reject
                                            </button>

                                        </div>

                                    </div>

                                )}


                                {reservation.status ===
                                    "CONFIRMED" && (

                                    <div className="confirmed-admin-box">

                                        <strong>
                                            ✓ Booking Confirmed
                                        </strong>

                                        <span>
                                            Table:{" "}
                                            {reservation.assignedTable}
                                        </span>

                                    </div>

                                )}


                                {reservation.adminNote &&
                                    reservation.status !==
                                        "PENDING" && (

                                    <div className="admin-final-note">

                                        <strong>
                                            Admin Note
                                        </strong>

                                        <p>
                                            {reservation.adminNote}
                                        </p>

                                    </div>

                                )}

                            </article>

                        )
                    )}

                </div>

            )}

        </main>
    );
}

export default AdminReservations;