import React, {
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

import "../styles/reservation.css";


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// TABLE / DINING EXPERIENCES
// IMPORTANT:
// tableType values MUST exactly match backend
// =====================================================

const TABLE_OPTIONS = [
    {
        id: "simple",
        type: "Simple Table",
        price: 499,
        minGuests: 1,
        maxGuests: 4,
        icon: "🍽️",
        description:
            "A comfortable table for a relaxed dining experience.",
        badge: "Popular",
    },

    {
        id: "family",
        type: "Family Table",
        price: 999,
        minGuests: 4,
        maxGuests: 8,
        icon: "👨‍👩‍👧‍👦",
        description:
            "Spacious seating designed for family and group dining.",
        badge: "Family Choice",
    },

    {
        id: "birthday",
        type: "Birthday Celebration",
        price: 1499,
        minGuests: 4,
        maxGuests: 10,
        icon: "🎂",
        description:
            "Celebrate your special day with a festive dining setup.",
        badge: "Celebrate",
    },

    {
        id: "candle",
        type: "Candle Light Dinner",
        price: 1999,
        minGuests: 2,
        maxGuests: 2,
        icon: "🕯️",
        description:
            "An intimate candle-lit experience for two.",
        badge: "Romantic",
    },

    {
        id: "premium",
        type: "Premium / Private",
        price: 2999,
        minGuests: 2,
        maxGuests: 8,
        icon: "✨",
        description:
            "A premium private dining experience with extra privacy.",
        badge: "Premium",
    },
];


// =====================================================
// OCCASIONS
// =====================================================

const OCCASIONS = [
    "Casual Dining",
    "Birthday",
    "Anniversary",
    "Date Night",
    "Family Dinner",
    "Business Dinner",
    "Other",
];


// =====================================================
// HELPERS
// =====================================================

const formatCurrency = (value) => {
    return `₹${Number(value || 0).toLocaleString(
        "en-IN"
    )}`;
};


const getToday = () => {
    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};


const getCurrentTime = () => {
    const now = new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    return `${hours}:${minutes}`;
};


// =====================================================
// COMPONENT
// =====================================================

export default function Reservation() {

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

    const [selectedTable, setSelectedTable] =
        useState(null);

    const [formData, setFormData] =
        useState({
            name: "",
            phone: "",
            email: "",
            date: "",
            time: "",
            guests: "",
            occasion: "Casual Dining",
            message: "",
        });

    const [submitting, setSubmitting] =
        useState(false);

    const [success, setSuccess] =
        useState("");

    const [error, setError] =
        useState("");

    const [showSuccess, setShowSuccess] =
        useState(false);


    // =================================================
    // PRE-FILL USER DETAILS
    // =================================================

    useEffect(() => {

        if (!user) {
            return;
        }

        setFormData((previous) => ({
            ...previous,

            name:
                previous.name ||
                user.name ||
                "",

            email:
                previous.email ||
                user.email ||
                "",
        }));

    }, [user]);


    // =================================================
    // SELECT TABLE
    // =================================================

    const handleTableSelect = (
        table
    ) => {

        setSelectedTable(table);

        setError("");

        setFormData((previous) => {

            let guests =
                Number(
                    previous.guests
                ) || table.minGuests;


            if (
                guests <
                table.minGuests
            ) {
                guests =
                    table.minGuests;
            }


            if (
                guests >
                table.maxGuests
            ) {
                guests =
                    table.maxGuests;
            }


            return {
                ...previous,
                guests,
            };

        });

    };


    // =================================================
    // INPUT CHANGE
    // =================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        // ---------------------------------------------
        // PHONE
        // ---------------------------------------------

        if (
            name === "phone"
        ) {

            const numericValue =
                value.replace(
                    /\D/g,
                    ""
                ).slice(
                    0,
                    10
                );


            setFormData(
                (previous) => ({
                    ...previous,
                    phone:
                        numericValue,
                })
            );


            setError("");

            return;
        }


        // ---------------------------------------------
        // GUESTS
        // ---------------------------------------------

        if (
            name === "guests"
        ) {

            const numericValue =
                value.replace(
                    /\D/g,
                    ""
                ).slice(
                    0,
                    2
                );


            setFormData(
                (previous) => ({
                    ...previous,
                    guests:
                        numericValue,
                })
            );


            setError("");

            return;
        }


        // ---------------------------------------------
        // OTHER FIELDS
        // ---------------------------------------------

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value,
            })
        );


        setError("");

    };


    // =================================================
    // SELECTED TABLE INFO
    // =================================================

    const selectedGuestsText =
        useMemo(() => {

            if (!selectedTable) {
                return "Select an experience first";
            }

            if (
                selectedTable.minGuests ===
                selectedTable.maxGuests
            ) {
                return `${selectedTable.minGuests} guest`;
            }

            return `${selectedTable.minGuests}–${selectedTable.maxGuests} guests`;

        }, [selectedTable]);


    // =================================================
    // VALIDATION
    // =================================================

    const validateForm = () => {

        // ---------------------------------------------
        // LOGIN
        // ---------------------------------------------

        if (!user) {

            setError(
                "Please login before booking a table."
            );

            return false;
        }


        // ---------------------------------------------
        // TABLE
        // ---------------------------------------------

        if (!selectedTable) {

            setError(
                "Please select a dining experience."
            );

            return false;
        }


        // ---------------------------------------------
        // NAME
        // ---------------------------------------------

        if (
            !formData.name.trim()
        ) {

            setError(
                "Please enter your name."
            );

            return false;
        }


        if (
            formData.name.trim().length < 2
        ) {

            setError(
                "Please enter a valid name."
            );

            return false;
        }


        // ---------------------------------------------
        // PHONE
        // ---------------------------------------------

        if (
            !/^[0-9]{10}$/.test(
                formData.phone.trim()
            )
        ) {

            setError(
                "Please enter a valid 10 digit mobile number."
            );

            return false;
        }


        // ---------------------------------------------
        // EMAIL
        // ---------------------------------------------

        if (
            !formData.email.trim()
        ) {

            setError(
                "Please enter your email address."
            );

            return false;
        }


        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !emailRegex.test(
                formData.email.trim()
            )
        ) {

            setError(
                "Please enter a valid email address."
            );

            return false;
        }


        // ---------------------------------------------
        // DATE
        // ---------------------------------------------

        if (
            !formData.date
        ) {

            setError(
                "Please select a reservation date."
            );

            return false;
        }


        const today =
            getToday();


        if (
            formData.date <
            today
        ) {

            setError(
                "Reservation date cannot be in the past."
            );

            return false;
        }


        // ---------------------------------------------
        // TIME
        // ---------------------------------------------

        if (
            !formData.time
        ) {

            setError(
                "Please select a reservation time."
            );

            return false;
        }


        // ---------------------------------------------
        // SAME DAY TIME
        // ---------------------------------------------

        if (
            formData.date ===
            today
        ) {

            const currentTime =
                getCurrentTime();


            if (
                formData.time <=
                currentTime
            ) {

                setError(
                    "Please select a future time for today's reservation."
                );

                return false;
            }

        }


        // ---------------------------------------------
        // GUESTS
        // ---------------------------------------------

        const guests =
            Number(
                formData.guests
            );


        if (
            !Number.isInteger(
                guests
            ) ||
            guests <= 0
        ) {

            setError(
                "Please enter a valid number of guests."
            );

            return false;
        }


        // ---------------------------------------------
        // TABLE CAPACITY
        // ---------------------------------------------

        if (
            guests <
            selectedTable.minGuests ||
            guests >
            selectedTable.maxGuests
        ) {

            setError(
                `${selectedTable.type} is suitable for ${selectedTable.minGuests}–${selectedTable.maxGuests} guests.`
            );

            return false;
        }


        return true;

    };


    // =================================================
    // SUBMIT RESERVATION
    // =================================================

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        setSuccess("");

        setError("");

        setShowSuccess(false);


        // ---------------------------------------------
        // VALIDATE
        // ---------------------------------------------

        const valid =
            validateForm();


        if (!valid) {

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

            return;
        }


        // ---------------------------------------------
        // TOKEN
        // ---------------------------------------------

        const savedToken =
            token ||
            localStorage.getItem(
                "token"
            );


        if (!savedToken) {

            setError(
                "Your login session has expired. Please login again."
            );

            navigate(
                "/login",
                {
                    state: {
                        from:
                            "/reservation",
                    },
                }
            );

            return;
        }


        try {

            setSubmitting(true);


            // =================================================
            // IMPORTANT PAYLOAD
            // =================================================
            //
            // Backend reservationController.js expects:
            //
            // req.body.name
            // req.body.phone
            // req.body.email
            // req.body.tableType
            // req.body.date
            // req.body.time
            // req.body.guests
            //
            // So DO NOT put name/phone/email only inside
            // customer object.
            //
            // =================================================

            const payload = {

                name:
                    formData.name.trim(),

                phone:
                    formData.phone.trim(),

                email:
                    formData.email
                        .trim()
                        .toLowerCase(),

                tableType:
                    selectedTable.type,

                date:
                    formData.date,

                time:
                    formData.time,

                guests:
                    Number(
                        formData.guests
                    ),

                occasion:
                    formData.occasion,

                message:
                    formData.message.trim(),

            };


            console.log(
                "===================================="
            );

            console.log(
                "SWAAAD & SPICE RESERVATION"
            );

            console.log(
                "API:",
                `${API_URL}/reservations`
            );

            console.log(
                "PAYLOAD:",
                payload
            );

            console.log(
                "===================================="
            );


            // =================================================
            // API REQUEST
            // =================================================

            const response =
                await axios.post(

                    `${API_URL}/reservations`,

                    payload,

                    {
                        headers: {

                            Authorization:
                                `Bearer ${savedToken}`,

                            "Content-Type":
                                "application/json",

                        },

                        timeout:
                            15000,

                    }

                );


            console.log(
                "RESERVATION RESPONSE:",
                response.data
            );


            // =================================================
            // CHECK RESPONSE
            // =================================================

            if (
                !response.data?.success
            ) {

                throw new Error(
                    response.data?.message ||
                    "Unable to create reservation."
                );

            }


            // =================================================
            // SUCCESS
            // =================================================

            setSuccess(
                response.data?.message ||
                "Reservation request submitted successfully."
            );


            setShowSuccess(
                true
            );


            // Keep customer details and selected table.
            // Reset booking-specific fields.

            setFormData((previous) => ({

                ...previous,

                date:
                    "",

                time:
                    "",

                guests:
                    selectedTable.minGuests,

                occasion:
                    "Casual Dining",

                message:
                    "",

            }));


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });


        } catch (err) {

            console.error(
                "===================================="
            );

            console.error(
                "RESERVATION ERROR"
            );

            console.error(
                err
            );

            console.error(
                "STATUS:",
                err?.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                err?.response?.data
            );

            console.error(
                "===================================="
            );


            const status =
                err?.response?.status;


            // ---------------------------------------------
            // UNAUTHORIZED
            // ---------------------------------------------

            if (
                status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );


                setError(
                    "Your login session has expired. Please login again."
                );


                setTimeout(() => {

                    navigate(
                        "/login",
                        {
                            state: {
                                from:
                                    "/reservation",
                            },
                        }
                    );

                }, 1000);


                return;
            }


            // ---------------------------------------------
            // SERVER ERROR
            // ---------------------------------------------

            let message =
                "Unable to submit reservation. Please try again.";


            if (
                err?.response?.data?.message
            ) {

                message =
                    err.response.data.message;

            } else if (
                err?.response?.data?.error
            ) {

                message =
                    err.response.data.error;

            } else if (
                err?.message
            ) {

                message =
                    err.message;

            }


            setError(
                message
            );


            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });

        } finally {

            setSubmitting(
                false
            );

        }

    };


    // =================================================
    // NEW RESERVATION
    // =================================================

    const handleNewReservation = () => {

        setShowSuccess(
            false
        );

        setSuccess(
            ""
        );

        setError(
            ""
        );

        setSelectedTable(
            null
        );


        setFormData({

            name:
                user?.name || "",

            phone:
                "",

            email:
                user?.email || "",

            date:
                "",

            time:
                "",

            guests:
                "",

            occasion:
                "Casual Dining",

            message:
                "",

        });


        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    // =================================================
    // AUTH LOADING
    // =================================================

    if (
        authLoading
    ) {

        return (

            <main
                className="reservation-page"
            >

                <div
                    className="reservation-loading"
                >

                    <div
                        className="reservation-spinner"
                    />

                    <p>
                        Checking your account...
                    </p>

                </div>

            </main>

        );

    }


    // =================================================
    // LOGIN REQUIRED
    // =================================================

    if (!user) {

        return (

            <main
                className="reservation-page"
            >

                <div
                    className="reservation-container"
                >

                    <div
                        className="reservation-success-card"
                    >

                        <div
                            className="reservation-success-icon"
                        >
                            🔐
                        </div>


                        <span
                            className="reservation-success-badge"
                        >
                            SWAAD & SPICE
                        </span>


                        <h1>
                            Login to Book
                        </h1>


                        <p
                            className="reservation-success-description"
                        >
                            Please login to choose your
                            dining experience and reserve
                            your table.
                        </p>


                        <div
                            className="reservation-success-actions"
                        >

                            <button
                                type="button"
                                className="reservation-primary-btn"
                                onClick={() =>
                                    navigate(
                                        "/login",
                                        {
                                            state: {
                                                from:
                                                    "/reservation",
                                            },
                                        }
                                    )
                                }
                            >
                                Login to Continue →
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        );

    }


    // =================================================
    // SUCCESS SCREEN
    // =================================================

    if (
        showSuccess
    ) {

        return (

            <main
                className="reservation-page"
            >

                <div
                    className="reservation-container"
                >

                    <header
                        className="reservation-header"
                    >

                        <div
                            className="reservation-header-content"
                        >

                            <span
                                className="reservation-eyebrow"
                            >
                                ✦ SWAAD & SPICE HOUSE ✦
                            </span>

                            <h1>
                                Reservation Confirmed
                            </h1>

                            <p>
                                Your reservation request has
                                been successfully submitted.
                            </p>

                        </div>

                    </header>


                    <section
                        className="reservation-success-card"
                    >

                        <div
                            className="reservation-success-icon"
                        >
                            ✓
                        </div>


                        <span
                            className="reservation-success-badge"
                        >
                            REQUEST SUBMITTED
                        </span>


                        <h1>
                            Reservation Request Sent!
                        </h1>


                        <p
                            className="reservation-success-description"
                        >
                            {success}
                            {" "}
                            Our team will review your request
                            and confirm your table after checking
                            availability.
                        </p>


                        <div
                            className="reservation-summary"
                        >

                            <div
                                className="reservation-summary-row"
                            >

                                <span>
                                    Guest Name
                                </span>

                                <strong>
                                    {formData.name}
                                </strong>

                            </div>


                            <div
                                className="reservation-summary-row"
                            >

                                <span>
                                    Dining Experience
                                </span>

                                <strong>
                                    {selectedTable?.type}
                                </strong>

                            </div>


                            <div
                                className="reservation-summary-row"
                            >

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {formData.date ||
                                        "Submitted"}
                                </strong>

                            </div>


                            <div
                                className="reservation-summary-row"
                            >

                                <span>
                                    Time
                                </span>

                                <strong>
                                    {formData.time ||
                                        "Submitted"}
                                </strong>

                            </div>


                            <div
                                className="reservation-summary-row"
                            >

                                <span>
                                    Guests
                                </span>

                                <strong>
                                    {formData.guests}
                                </strong>

                            </div>


                            <div
                                className="reservation-summary-row total"
                            >

                                <span>
                                    Table Price
                                </span>

                                <strong>
                                    {formatCurrency(
                                        selectedTable?.price
                                    )}
                                </strong>

                            </div>

                        </div>


                        <div
                            className="reservation-success-note"
                        >

                            <span>
                                ℹ️
                            </span>

                            <p>
                                Your request is currently
                                pending. You can track the
                                status from My Reservations.
                                The table becomes confirmed only
                                after our team approves it.
                            </p>

                        </div>


                        <div
                            className="reservation-success-actions"
                        >

                            <button
                                type="button"
                                className="reservation-primary-btn"
                                onClick={() =>
                                    navigate(
                                        "/my-reservations"
                                    )
                                }
                            >
                                View My Reservations
                            </button>


                            <button
                                type="button"
                                className="reservation-secondary-btn"
                                onClick={() =>
                                    navigate(
                                        "/menu"
                                    )
                                }
                            >
                                Explore Menu
                            </button>


                            <button
                                type="button"
                                className="reservation-link-btn"
                                onClick={
                                    handleNewReservation
                                }
                            >
                                + Make Another Reservation
                            </button>

                        </div>

                    </section>

                </div>

            </main>

        );

    }


    // =================================================
    // MAIN RESERVATION UI
    // =================================================

    return (

        <main
            className="reservation-page"
        >

            <div
                className="reservation-container"
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    className="reservation-header"
                >

                    <div
                        className="reservation-header-content"
                    >

                        <span
                            className="reservation-eyebrow"
                        >
                            ✦ SWAAD & SPICE HOUSE ✦
                        </span>


                        <h1>
                            Reserve Your
                            <br />
                            Perfect Table.
                        </h1>


                        <p>
                            Choose your dining experience,
                            select your preferred date and
                            time, and send us a reservation
                            request. Your booking becomes
                            confirmed only after our team
                            approves it.
                        </p>

                    </div>

                </header>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="reservation-error"
                        role="alert"
                    >

                        <div
                            className="reservation-error-icon"
                        >
                            !
                        </div>


                        <div>

                            <strong>
                                Reservation could not be completed
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
                    MAIN LAYOUT
                ================================================= */}

                <div
                    className="reservation-layout"
                >

                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        className="reservation-form-card"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* =============================================
                            STEP 01
                        ============================================= */}

                        <section
                            className="reservation-section"
                        >

                            <div
                                className="reservation-section-heading"
                            >

                                <div
                                    className="reservation-step-number"
                                >
                                    1
                                </div>


                                <div>

                                    <h2>
                                        Choose Your Experience
                                    </h2>

                                    <p>
                                        Select the dining setup
                                        that suits your occasion.
                                    </p>

                                </div>

                            </div>


                            <div
                                className="reservation-table-grid"
                            >

                                {TABLE_OPTIONS.map(
                                    (table) => {

                                        const isSelected =
                                            selectedTable?.id ===
                                            table.id;


                                        return (

                                            <button
                                                key={
                                                    table.id
                                                }
                                                type="button"
                                                className={`reservation-table-option ${
                                                    isSelected
                                                        ? "selected"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    handleTableSelect(
                                                        table
                                                    )
                                                }
                                                aria-pressed={
                                                    isSelected
                                                }
                                            >

                                                {/* TOP */}

                                                <div
                                                    className="reservation-table-option-top"
                                                >

                                                    <div
                                                        className="reservation-table-option-icon"
                                                    >
                                                        {
                                                            table.icon
                                                        }
                                                    </div>


                                                    {isSelected && (

                                                        <span
                                                            className="reservation-selected-check"
                                                        >
                                                            ✓
                                                        </span>

                                                    )}

                                                </div>


                                                {/* CONTENT */}

                                                <div
                                                    className="reservation-table-option-content"
                                                >

                                                    <h3>
                                                        {
                                                            table.type
                                                        }
                                                    </h3>


                                                    <p>
                                                        {
                                                            table.description
                                                        }
                                                    </p>

                                                </div>


                                                {/* META */}

                                                <div
                                                    className="reservation-table-option-meta"
                                                >

                                                    <span>
                                                        👥{" "}
                                                        {
                                                            table.minGuests
                                                        }
                                                        {table.minGuests !==
                                                        table.maxGuests
                                                            ? `–${table.maxGuests}`
                                                            : ""}
                                                        {" "}
                                                        guests
                                                    </span>


                                                    <strong>
                                                        {formatCurrency(
                                                            table.price
                                                        )}
                                                    </strong>

                                                </div>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        </section>


                        {/* =============================================
                            STEP 02
                        ============================================= */}

                        <section
                            className="reservation-section"
                        >

                            <div
                                className="reservation-section-heading"
                            >

                                <div
                                    className="reservation-step-number"
                                >
                                    2
                                </div>


                                <div>

                                    <h2>
                                        Date, Time & Guests
                                    </h2>

                                    <p>
                                        Tell us when you would
                                        like to dine with us.
                                    </p>

                                </div>

                            </div>


                            <div
                                className="reservation-input-grid"
                            >

                                {/* DATE */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="date">
                                        Reservation Date
                                        <span>
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={
                                            formData.date
                                        }
                                        min={
                                            getToday()
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* TIME */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="time">
                                        Reservation Time
                                        <span>
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="time"
                                        type="time"
                                        name="time"
                                        value={
                                            formData.time
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>


                                {/* GUESTS */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="guests">
                                        Number of Guests
                                        <span>
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="guests"
                                        type="number"
                                        name="guests"
                                        value={
                                            formData.guests
                                        }
                                        min={
                                            selectedTable?.minGuests ||
                                            1
                                        }
                                        max={
                                            selectedTable?.maxGuests ||
                                            10
                                        }
                                        placeholder={
                                            selectedTable
                                                ? `${selectedTable.minGuests}–${selectedTable.maxGuests}`
                                                : "Select table first"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />


                                    <small>
                                        {selectedGuestsText}
                                    </small>

                                </div>


                                {/* OCCASION */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="occasion">
                                        Occasion
                                    </label>


                                    <select
                                        id="occasion"
                                        name="occasion"
                                        value={
                                            formData.occasion
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    >

                                        {OCCASIONS.map(
                                            (occasion) => (

                                                <option
                                                    key={
                                                        occasion
                                                    }
                                                    value={
                                                        occasion
                                                    }
                                                >
                                                    {
                                                        occasion
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </section>


                        {/* =============================================
                            STEP 03
                        ============================================= */}

                        <section
                            className="reservation-section"
                        >

                            <div
                                className="reservation-section-heading"
                            >

                                <div
                                    className="reservation-step-number"
                                >
                                    3
                                </div>


                                <div>

                                    <h2>
                                        Your Details
                                    </h2>

                                    <p>
                                        We need these details to
                                        confirm your reservation.
                                    </p>

                                </div>

                            </div>


                            <div
                                className="reservation-input-grid"
                            >

                                {/* NAME */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="name">
                                        Full Name
                                        <span>
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your full name"
                                        autoComplete="name"
                                        required
                                    />

                                </div>


                                {/* PHONE */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="phone">
                                        Phone Number
                                        <span>
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10 digit mobile number"
                                        maxLength="10"
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        required
                                    />

                                </div>


                                {/* EMAIL */}

                                <div
                                    className="reservation-field"
                                >

                                    <label htmlFor="email">
                                        Email Address
                                        <span>
                                            *
                                        </span>
                                    </label>


                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Enter your email"
                                        autoComplete="email"
                                        required
                                    />

                                </div>


                                {/* MESSAGE */}

                                <div
                                    className="reservation-field full-width"
                                >

                                    <label htmlFor="message">
                                        Special Request
                                    </label>


                                    <textarea
                                        id="message"
                                        name="message"
                                        value={
                                            formData.message
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Birthday decoration, seating preference, special request..."
                                        maxLength="500"
                                        rows="5"
                                    />


                                    <span
                                        className="reservation-character-count"
                                    >
                                        {
                                            formData.message.length
                                        }
                                        /500
                                    </span>

                                </div>

                            </div>

                        </section>


                        {/* =============================================
                            SUBMIT
                        ============================================= */}

                        <div
                            className="reservation-submit-area"
                        >

                            <div
                                className="reservation-submit-note"
                            >

                                <span>
                                    🔒
                                </span>


                                <p>
                                    Your information is secure.
                                    We only use it to manage
                                    your reservation and contact
                                    you about your booking.
                                </p>

                            </div>


                            <button
                                type="submit"
                                className="reservation-submit-btn"
                                disabled={
                                    submitting
                                }
                            >

                                {submitting ? (

                                    <>
                                        <span
                                            className="reservation-button-spinner"
                                        />

                                        Submitting...
                                    </>

                                ) : (

                                    <>
                                        Confirm Reservation

                                        <span>
                                            →
                                        </span>
                                    </>

                                )}

                            </button>

                        </div>

                    </form>


                    {/* =================================================
                        SUMMARY SIDEBAR
                    ================================================= */}

                    <aside
                        className="reservation-summary-card"
                    >

                        <div
                            className="reservation-summary-header"
                        >

                            <span>
                                Booking Summary
                            </span>


                            <span
                                className="reservation-summary-live"
                            >
                                ● LIVE
                            </span>

                        </div>


                        {/* SELECTED TABLE */}

                        <div
                            className="reservation-summary-table"
                        >

                            <div
                                className="reservation-summary-table-icon"
                            >
                                {selectedTable?.icon ||
                                    "🍽️"}
                            </div>


                            <div>

                                <h3>
                                    {
                                        selectedTable?.type ||
                                        "Choose a table"
                                    }
                                </h3>


                                <p>
                                    {
                                        selectedTable
                                            ? selectedGuestsText
                                            : "Your experience will appear here"
                                    }
                                </p>

                            </div>

                        </div>


                        <div
                            className="reservation-summary-divider"
                        />


                        {/* DETAILS */}

                        <div
                            className="reservation-summary-details"
                        >

                            <div>

                                <span>
                                    Guest
                                </span>

                                <strong>
                                    {
                                        formData.name ||
                                        "Not selected"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Date
                                </span>

                                <strong>
                                    {
                                        formData.date ||
                                        "Not selected"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Time
                                </span>

                                <strong>
                                    {
                                        formData.time ||
                                        "Not selected"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Guests
                                </span>

                                <strong>
                                    {
                                        formData.guests ||
                                        "Not selected"
                                    }
                                </strong>

                            </div>


                            <div>

                                <span>
                                    Occasion
                                </span>

                                <strong>
                                    {
                                        formData.occasion ||
                                        "Casual Dining"
                                    }
                                </strong>

                            </div>

                        </div>


                        {/* PRICE */}

                        <div
                            className="reservation-price-row"
                        >

                            <span>
                                Table Reservation Fee
                            </span>


                            <strong>
                                {selectedTable
                                    ? formatCurrency(
                                        selectedTable.price
                                    )
                                    : "₹0"}
                            </strong>

                        </div>


                        <p
                            className="reservation-price-note"
                        >
                            This is the table reservation
                            fee. Food and beverages are
                            charged separately.
                        </p>


                        {/* INFO */}

                        <div
                            className="reservation-summary-info"
                        >

                            <div>
                                ✓
                            </div>


                            <p>
                                Your request will first be
                                marked as <strong>PENDING</strong>.
                                Our team will assign a table
                                and confirm your reservation.
                            </p>

                        </div>

                    </aside>

                </div>

            </div>

        </main>

    );

}