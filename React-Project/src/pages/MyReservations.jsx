import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../context/AuthContext";
import "../styles/myReservations.css";

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

    const [error, setError] =
        useState("");


    const fetchReservations = async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await axios.get(
                    "http://localhost:5000/api/reservations/my",
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
                "Reservations error:",
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
            !authLoading &&
            user &&
            token
        ) {
            fetchReservations();
        }

    }, [
        authLoading,
        user,
        token,
    ]);


    const cancelReservation = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to cancel this reservation?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await axios.patch(
                `http://localhost:5000/api/reservations/${id}/cancel`,
                {},
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
                "Unable to cancel reservation."
            );

        }

    };


    const statusClass = (status) => {

        return (
            `reservation-status status-${status.toLowerCase()}`
        );

    };


    if (authLoading) {

        return (
            <main className="my-reservations-page">

                <div className="reservation-list-message">
                    <h2>
                        Checking Login...
                    </h2>
                </div>

            </main>
        );

    }


    if (!user) {

        return (
            <main className="my-reservations-page">

                <div className="reservation-list-message">

                    <h2>
                        🔐 Login Required
                    </h2>

                    <p>
                        Please login to view your reservations.
                    </p>

                    <button
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Login
                    </button>

                </div>

            </main>
        );

    }


    return (
        <main className="my-reservations-page">

            <div className="my-reservations-header">

                <span>
                    YOUR BOOKINGS
                </span>

                <h1>
                    My Reservations 🪑
                </h1>

                <p>
                    Track your table requests and confirmed bookings.
                </p>

            </div>


            {loading && (

                <div className="reservation-list-message">
                    <h2>
                        Loading reservations...
                    </h2>
                </div>

            )}


            {error && !loading && (

                <div className="reservation-list-message error">

                    <h2>
                        ❌ Something went wrong
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        onClick={fetchReservations}
                    >
                        Try Again
                    </button>

                </div>

            )}


            {!loading &&
                !error &&
                reservations.length === 0 && (

                    <div className="reservation-list-message">

                        <div className="empty-reservation-icon">
                            🪑
                        </div>

                        <h2>
                            No Reservations Yet
                        </h2>

                        <p>
                            You haven't made any table reservations.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/reservation")
                            }
                        >
                            Reserve a Table
                        </button>

                    </div>

                )}


            {!loading &&
                !error &&
                reservations.length > 0 && (

                    <div className="reservation-list">

                        {reservations.map(
                            (reservation) => (

                                <article
                                    className="my-reservation-card"
                                    key={reservation._id}
                                >

                                    <div className="my-reservation-top">

                                        <div>

                                            <span className="booking-label">
                                                RESERVATION
                                            </span>

                                            <h2>
                                                {reservation.tableType}
                                            </h2>

                                            <p>
                                                Booking ID:{" "}
                                                {reservation._id}
                                            </p>

                                        </div>

                                        <span
                                            className={statusClass(
                                                reservation.status
                                            )}
                                        >
                                            {reservation.status}
                                        </span>

                                    </div>


                                    <div className="reservation-details-grid">

                                        <div>
                                            <span>
                                                📅 Date
                                            </span>

                                            <strong>
                                                {reservation.date}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                🕐 Time
                                            </span>

                                            <strong>
                                                {reservation.time}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                👥 Guests
                                            </span>

                                            <strong>
                                                {reservation.guests}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                💰 Price
                                            </span>

                                            <strong>
                                                ₹{reservation.tablePrice}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                🪑 Table
                                            </span>

                                            <strong>
                                                {reservation.assignedTable ||
                                                    "Waiting for admin"}
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                🎉 Occasion
                                            </span>

                                            <strong>
                                                {reservation.occasion ||
                                                    "General Dining"}
                                            </strong>
                                        </div>

                                    </div>


                                    {reservation.adminNote && (

                                        <div className="admin-reservation-note">

                                            <strong>
                                                Admin Note
                                            </strong>

                                            <p>
                                                {reservation.adminNote}
                                            </p>

                                        </div>

                                    )}


                                    <div className="my-reservation-bottom">

                                        {reservation.status ===
                                            "PENDING" && (

                                            <button
                                                className="cancel-reservation-btn"
                                                onClick={() =>
                                                    cancelReservation(
                                                        reservation._id
                                                    )
                                                }
                                            >
                                                Cancel Request
                                            </button>

                                        )}


                                        {reservation.status ===
                                            "CONFIRMED" && (

                                            <div className="confirmed-message">
                                                ✓ Your table is confirmed.
                                            </div>

                                        )}

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}

        </main>
    );
}

export default MyReservations;