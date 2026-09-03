import {
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


// =====================================================
// API
// =====================================================

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";


// =====================================================
// TABLE / DINING EXPERIENCES
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


        if (
            name === "guests"
        ) {

            const numericValue =
                value.replace(
                    /\D/g,
                    ""
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

            return `${selectedTable.minGuests}–${selectedTable.maxGuests} guests`;

        }, [selectedTable]);


    // =================================================
    // VALIDATION
    // =================================================

    const validateForm = () => {

        if (!user) {

            setError(
                "Please login before booking a table."
            );

            return false;
        }


        if (!selectedTable) {

            setError(
                "Please select a dining experience."
            );

            return false;
        }


        if (
            !formData.name.trim()
        ) {

            setError(
                "Please enter your name."
            );

            return false;
        }


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


        if (
            !formData.time
        ) {

            setError(
                "Please select a reservation time."
            );

            return false;
        }


        const guests =
            Number(
                formData.guests
            );


        if (
            !Number.isInteger(
                guests
            )
        ) {

            setError(
                "Please enter a valid number of guests."
            );

            return false;
        }


        if (
            guests <
            selectedTable.minGuests ||
            guests >
            selectedTable.maxGuests
        ) {

            setError(
                `This experience allows ${selectedTable.minGuests}–${selectedTable.maxGuests} guests.`
            );

            return false;
        }


        // Same-day time validation

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


        if (
            !validateForm()
        ) {
            return;
        }


        const savedToken =
            token ||
            localStorage.getItem(
                "token"
            );


        if (!savedToken) {

            setError(
                "Your login session has expired. Please login again."
            );

            navigate("/login");

            return;
        }


        try {

            setSubmitting(true);


            // =================================================
            // RESERVATION PAYLOAD
            // =================================================
            //
            // We send both the customer object and top-level
            // customer fields for compatibility with the
            // existing reservation backend.
            //
            // =================================================

            const payload = {

                name:
                    formData.name.trim(),

                phone:
                    formData.phone.trim(),

                email:
                    formData.email.trim(),

                customer: {

                    name:
                        formData.name.trim(),

                    phone:
                        formData.phone.trim(),

                    email:
                        formData.email.trim(),

                },

                tableType:
                    selectedTable.type,

                tablePrice:
                    selectedTable.price,

                capacity: {

                    min:
                        selectedTable.minGuests,

                    max:
                        selectedTable.maxGuests,

                },

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
                "RESERVATION PAYLOAD =>",
                payload
            );


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

                    }

                );


            console.log(
                "RESERVATION RESPONSE =>",
                response.data
            );


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

            setShowSuccess(true);


            // Keep selected table and basic user details,
            // but reset booking-specific fields.

            setFormData((previous) => ({
                ...previous,

                date: "",

                time: "",

                guests:
                    selectedTable.minGuests,

                occasion:
                    "Casual Dining",

                message: "",
            }));


            // Scroll to top of success card

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });


        } catch (err) {

            console.error(
                "RESERVATION ERROR =>",
                err
            );

            console.error(
                "SERVER RESPONSE =>",
                err?.response?.data
            );


            const status =
                err?.response?.status;


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
                    navigate("/login");
                }, 1200);

                return;
            }


            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to submit reservation. Please try again."
            );

        } finally {

            setSubmitting(false);

        }

    };


    // =================================================
    // RESET SUCCESS
    // =================================================

    const handleNewReservation = () => {

        setShowSuccess(false);

        setSuccess("");

        setSelectedTable(null);

        setFormData({

            name:
                user?.name || "",

            phone: "",

            email:
                user?.email || "",

            date: "",

            time: "",

            guests: "",

            occasion:
                "Casual Dining",

            message: "",

        });

        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });

    };


    // =================================================
    // AUTH LOADING
    // =================================================

    if (authLoading) {

        return (

            <main
                style={{
                    minHeight:
                        "100vh",

                    padding:
                        "140px 20px 80px",

                    background:
                        "linear-gradient(135deg, #120b07 0%, #1a0f09 55%, #241207 100%)",

                    color:
                        "#ffffff",

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",

                    fontFamily:
                        "Poppins, Arial, sans-serif",
                }}
            >

                <div
                    style={{
                        textAlign:
                            "center",
                    }}
                >

                    <div
                        style={{
                            fontSize:
                                "42px",

                            marginBottom:
                                "16px",
                        }}
                    >
                        🍽️
                    </div>

                    <h2>
                        Checking your account...
                    </h2>

                    <p
                        style={{
                            color:
                                "#b9aea7",
                        }}
                    >
                        Please wait.
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
                style={{
                    minHeight:
                        "100vh",

                    padding:
                        "140px 20px 80px",

                    background:
                        "linear-gradient(135deg, #120b07 0%, #1a0f09 55%, #241207 100%)",

                    color:
                        "#ffffff",

                    fontFamily:
                        "Poppins, Arial, sans-serif",

                    display:
                        "flex",

                    alignItems:
                        "center",

                    justifyContent:
                        "center",
                }}
            >

                <div
                    style={{
                        width:
                            "min(560px, 100%)",

                        padding:
                            "50px 35px",

                        borderRadius:
                            "28px",

                        background:
                            "rgba(255,255,255,0.07)",

                        border:
                            "1px solid rgba(255,159,28,0.25)",

                        backdropFilter:
                            "blur(18px)",

                        textAlign:
                            "center",

                        boxShadow:
                            "0 30px 80px rgba(0,0,0,0.35)",
                    }}
                >

                    <div
                        style={{
                            fontSize:
                                "52px",

                            marginBottom:
                                "15px",
                        }}
                    >
                        🔐
                    </div>

                    <span
                        style={{
                            color:
                                "#ff9f1c",

                            fontSize:
                                "12px",

                            fontWeight:
                                "700",

                            letterSpacing:
                                "3px",
                        }}
                    >
                        SWAAD & SPICE
                    </span>

                    <h1
                        style={{
                            margin:
                                "12px 0",

                            fontSize:
                                "clamp(30px, 5vw, 46px)",
                        }}
                    >
                        Login to Book
                    </h1>

                    <p
                        style={{
                            color:
                                "#bdb2aa",

                            lineHeight:
                                "1.7",

                            marginBottom:
                                "28px",
                        }}
                    >
                        Please login to choose your
                        dining experience and reserve
                        your table.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                        style={{
                            width:
                                "100%",

                            minHeight:
                                "52px",

                            border:
                                "none",

                            borderRadius:
                                "14px",

                            background:
                                "linear-gradient(135deg, #ff7b00, #ff9f1c)",

                            color:
                                "#ffffff",

                            fontSize:
                                "15px",

                            fontWeight:
                                "700",

                            cursor:
                                "pointer",

                            boxShadow:
                                "0 15px 35px rgba(255,123,0,0.25)",
                        }}
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

        <main
            style={{
                minHeight:
                    "100vh",

                padding:
                    "120px 20px 90px",

                background:
                    "linear-gradient(135deg, #120b07 0%, #1a0f09 52%, #241207 100%)",

                color:
                    "#ffffff",

                fontFamily:
                    "Poppins, Arial, sans-serif",

                overflow:
                    "hidden",
            }}
        >

            <div
                style={{
                    width:
                        "min(1200px, 100%)",

                    margin:
                        "0 auto",
                }}
            >

                {/* =================================================
                    HERO
                ================================================= */}

                <section
                    style={{
                        textAlign:
                            "center",

                        padding:
                            "35px 10px 60px",
                    }}
                >

                    <span
                        style={{
                            display:
                                "inline-block",

                            color:
                                "#ff9f1c",

                            fontSize:
                                "12px",

                            fontWeight:
                                "700",

                            letterSpacing:
                                "4px",

                            marginBottom:
                                "18px",
                        }}
                    >
                        ✦ SWAAD & SPICE HOUSE ✦
                    </span>


                    <h1
                        style={{
                            margin:
                                "0",

                            fontFamily:
                                "Georgia, serif",

                            fontSize:
                                "clamp(42px, 7vw, 76px)",

                            lineHeight:
                                "1.05",

                            letterSpacing:
                                "-2px",
                        }}
                    >
                        Reserve Your
                        <span
                            style={{
                                display:
                                    "block",

                                color:
                                    "#ff9f1c",

                                fontStyle:
                                    "italic",
                            }}
                        >
                            Perfect Table.
                        </span>
                    </h1>


                    <p
                        style={{
                            maxWidth:
                                "680px",

                            margin:
                                "24px auto 0",

                            color:
                                "#bdb2aa",

                            fontSize:
                                "16px",

                            lineHeight:
                                "1.8",
                        }}
                    >
                        Choose your dining experience,
                        select your preferred date and
                        time, and send us a reservation
                        request. Your booking becomes
                        confirmed only after our team
                        approves it.
                    </p>

                </section>


                {/* =================================================
                    SUCCESS
                ================================================= */}

                {showSuccess && (
                    <section
                        style={{
                            marginBottom:
                                "35px",

                            padding:
                                "28px",

                            borderRadius:
                                "24px",

                            background:
                                "rgba(34,197,94,0.10)",

                            border:
                                "1px solid rgba(34,197,94,0.35)",

                            boxShadow:
                                "0 20px 50px rgba(0,0,0,0.18)",
                        }}
                    >

                        <div
                            style={{
                                display:
                                    "flex",

                                gap:
                                    "18px",

                                alignItems:
                                    "flex-start",

                                flexWrap:
                                    "wrap",
                            }}
                        >

                            <div
                                style={{
                                    width:
                                        "54px",

                                    height:
                                        "54px",

                                    borderRadius:
                                        "50%",

                                    background:
                                        "rgba(34,197,94,0.18)",

                                    display:
                                        "flex",

                                    alignItems:
                                        "center",

                                    justifyContent:
                                        "center",

                                    fontSize:
                                        "27px",

                                    flexShrink:
                                        0,
                                }}
                            >
                                ✓
                            </div>


                            <div
                                style={{
                                    flex:
                                        1,
                                }}
                            >

                                <h2
                                    style={{
                                        margin:
                                            "0 0 8px",

                                        fontSize:
                                            "22px",
                                    }}
                                >
                                    Reservation Request Sent!
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            0,

                                        color:
                                            "#c7d7c9",

                                        lineHeight:
                                            "1.7",
                                    }}
                                >
                                    {success}
                                    {" "}
                                    Our team will review your
                                    request and confirm your
                                    table after checking
                                    availability.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/my-reservations"
                                    )
                                }
                                style={{
                                    minHeight:
                                        "44px",

                                    padding:
                                        "0 20px",

                                    border:
                                        "1px solid rgba(255,255,255,0.15)",

                                    borderRadius:
                                        "12px",

                                    background:
                                        "rgba(255,255,255,0.06)",

                                    color:
                                        "#ffffff",

                                    cursor:
                                        "pointer",

                                    fontWeight:
                                        "600",
                                }}
                            >
                                My Reservations
                            </button>

                        </div>


                        <button
                            type="button"
                            onClick={
                                handleNewReservation
                            }
                            style={{
                                marginTop:
                                    "20px",

                                border:
                                    "none",

                                background:
                                    "transparent",

                                color:
                                    "#ff9f1c",

                                cursor:
                                    "pointer",

                                fontWeight:
                                    "700",
                            }}
                        >
                            + Make Another Reservation
                        </button>

                    </section>
                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (
                    <div
                        role="alert"
                        style={{
                            marginBottom:
                                "25px",

                            padding:
                                "16px 18px",

                            borderRadius:
                                "14px",

                            background:
                                "rgba(239,68,68,0.10)",

                            border:
                                "1px solid rgba(239,68,68,0.30)",

                            color:
                                "#fecaca",

                            lineHeight:
                                "1.5",
                        }}
                    >
                        ⚠️ {error}
                    </div>
                )}


                {!showSuccess && (
                    <form
                        onSubmit={
                            handleSubmit
                        }
                    >

                        {/* =================================================
                            STEP 1 — EXPERIENCE
                        ================================================= */}

                        <section
                            style={{
                                marginBottom:
                                    "45px",
                            }}
                        >

                            <div
                                style={{
                                    marginBottom:
                                        "22px",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "#ff9f1c",

                                        fontSize:
                                            "11px",

                                        fontWeight:
                                            "700",

                                        letterSpacing:
                                            "3px",
                                    }}
                                >
                                    STEP 01
                                </span>

                                <h2
                                    style={{
                                        margin:
                                            "8px 0 6px",

                                        fontFamily:
                                            "Georgia, serif",

                                        fontSize:
                                            "clamp(28px, 4vw, 42px)",
                                    }}
                                >
                                    Choose Your Experience
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            0,

                                        color:
                                            "#9f958e",
                                    }}
                                >
                                    Select the dining setup
                                    that suits your occasion.
                                </p>

                            </div>


                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(auto-fit, minmax(210px, 1fr))",

                                    gap:
                                        "18px",
                                }}
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
                                                onClick={() =>
                                                    handleTableSelect(
                                                        table
                                                    )
                                                }
                                                style={{
                                                    position:
                                                        "relative",

                                                    textAlign:
                                                        "left",

                                                    padding:
                                                        "24px 20px",

                                                    minHeight:
                                                        "250px",

                                                    borderRadius:
                                                        "22px",

                                                    border:
                                                        isSelected
                                                            ? "2px solid #ff9f1c"
                                                            : "1px solid rgba(255,255,255,0.10)",

                                                    background:
                                                        isSelected
                                                            ? "linear-gradient(145deg, rgba(255,123,0,0.18), rgba(255,255,255,0.05))"
                                                            : "rgba(255,255,255,0.045)",

                                                    color:
                                                        "#ffffff",

                                                    cursor:
                                                        "pointer",

                                                    transition:
                                                        "all 0.25s ease",

                                                    boxShadow:
                                                        isSelected
                                                            ? "0 18px 45px rgba(255,123,0,0.16)"
                                                            : "0 10px 30px rgba(0,0,0,0.12)",
                                                }}
                                            >

                                                <span
                                                    style={{
                                                        position:
                                                            "absolute",

                                                        top:
                                                            "15px",

                                                        right:
                                                            "15px",

                                                        padding:
                                                            "5px 9px",

                                                        borderRadius:
                                                            "999px",

                                                        background:
                                                            isSelected
                                                                ? "#ff7b00"
                                                                : "rgba(255,159,28,0.10)",

                                                        color:
                                                            "#ffcf9b",

                                                        fontSize:
                                                            "10px",

                                                        fontWeight:
                                                            "700",
                                                    }}
                                                >
                                                    {table.badge}
                                                </span>


                                                <div
                                                    style={{
                                                        fontSize:
                                                            "38px",

                                                        marginBottom:
                                                            "15px",
                                                    }}
                                                >
                                                    {table.icon}
                                                </div>


                                                <h3
                                                    style={{
                                                        margin:
                                                            "0 0 8px",

                                                        fontSize:
                                                            "18px",
                                                    }}
                                                >
                                                    {table.type}
                                                </h3>


                                                <p
                                                    style={{
                                                        minHeight:
                                                            "58px",

                                                        margin:
                                                            "0 0 18px",

                                                        color:
                                                            "#a89d95",

                                                        fontSize:
                                                            "13px",

                                                        lineHeight:
                                                            "1.6",
                                                    }}
                                                >
                                                    {
                                                        table.description
                                                    }
                                                </p>


                                                <div
                                                    style={{
                                                        display:
                                                            "flex",

                                                        alignItems:
                                                            "flex-end",

                                                        justifyContent:
                                                            "space-between",

                                                        gap:
                                                            "10px",
                                                    }}
                                                >

                                                    <div>

                                                        <span
                                                            style={{
                                                                display:
                                                                    "block",

                                                                color:
                                                                    "#8d827b",

                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        >
                                                            EXPERIENCE
                                                            PRICE
                                                        </span>

                                                        <strong
                                                            style={{
                                                                display:
                                                                    "block",

                                                                marginTop:
                                                                    "3px",

                                                                color:
                                                                    "#ffb15a",

                                                                fontSize:
                                                                    "20px",
                                                            }}
                                                        >
                                                            {formatCurrency(
                                                                table.price
                                                            )}
                                                        </strong>

                                                    </div>


                                                    <span
                                                        style={{
                                                            color:
                                                                isSelected
                                                                    ? "#ff9f1c"
                                                                    : "#8d827b",

                                                            fontSize:
                                                                "12px",

                                                            fontWeight:
                                                                "700",
                                                        }}
                                                    >
                                                        {selectedTable?.id ===
                                                        table.id
                                                            ? "✓ Selected"
                                                            : "Select →"}
                                                    </span>

                                                </div>

                                            </button>

                                        );

                                    }
                                )}

                            </div>

                        </section>


                        {/* =================================================
                            SELECTED EXPERIENCE SUMMARY
                        ================================================= */}

                        {selectedTable && (
                            <div
                                style={{
                                    marginBottom:
                                        "35px",

                                    padding:
                                        "20px 22px",

                                    borderRadius:
                                        "18px",

                                    background:
                                        "rgba(255,159,28,0.08)",

                                    border:
                                        "1px solid rgba(255,159,28,0.20)",

                                    display:
                                        "flex",

                                    justifyContent:
                                        "space-between",

                                    alignItems:
                                        "center",

                                    gap:
                                        "15px",

                                    flexWrap:
                                        "wrap",
                                }}
                            >

                                <div>

                                    <span
                                        style={{
                                            color:
                                                "#9e9189",

                                            fontSize:
                                                "11px",

                                            letterSpacing:
                                                "1px",
                                        }}
                                    >
                                        SELECTED EXPERIENCE
                                    </span>

                                    <strong
                                        style={{
                                            display:
                                                "block",

                                            marginTop:
                                                "4px",

                                            fontSize:
                                                "17px",
                                        }}
                                    >
                                        {selectedTable.icon}
                                        {" "}
                                        {selectedTable.type}
                                    </strong>

                                </div>


                                <div
                                    style={{
                                        textAlign:
                                            "right",
                                    }}
                                >

                                    <span
                                        style={{
                                            display:
                                                "block",

                                            color:
                                                "#9e9189",

                                            fontSize:
                                                "11px",
                                        }}
                                    >
                                        TABLE PRICE
                                    </span>

                                    <strong
                                        style={{
                                            color:
                                                "#ff9f1c",

                                            fontSize:
                                                "20px",
                                        }}
                                    >
                                        {formatCurrency(
                                            selectedTable.price
                                        )}
                                    </strong>

                                </div>

                            </div>
                        )}


                        {/* =================================================
                            STEP 2 — CUSTOMER DETAILS
                        ================================================= */}

                        <section
                            style={{
                                marginBottom:
                                    "45px",
                            }}
                        >

                            <div
                                style={{
                                    marginBottom:
                                        "22px",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "#ff9f1c",

                                        fontSize:
                                            "11px",

                                        fontWeight:
                                            "700",

                                        letterSpacing:
                                            "3px",
                                    }}
                                >
                                    STEP 02
                                </span>

                                <h2
                                    style={{
                                        margin:
                                            "8px 0 6px",

                                        fontFamily:
                                            "Georgia, serif",

                                        fontSize:
                                            "clamp(28px, 4vw, 42px)",
                                    }}
                                >
                                    Your Details
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            0,

                                        color:
                                            "#9f958e",
                                    }}
                                >
                                    Tell us how we can reach
                                    you about your reservation.
                                </p>

                            </div>


                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(2, minmax(0, 1fr))",

                                    gap:
                                        "18px",
                                }}
                            >

                                {/* NAME */}

                                <div
                                    style={{
                                        gridColumn:
                                            "span 1",
                                    }}
                                >

                                    <label
                                        style={labelStyle}
                                    >
                                        Full Name *
                                    </label>

                                    <input
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
                                        style={
                                            inputStyle
                                        }
                                    />

                                </div>


                                {/* PHONE */}

                                <div>

                                    <label
                                        style={labelStyle}
                                    >
                                        Mobile Number *
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={
                                            formData.phone
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="10 digit mobile number"
                                        maxLength={10}
                                        inputMode="numeric"
                                        autoComplete="tel"
                                        style={
                                            inputStyle
                                        }
                                    />

                                </div>


                                {/* EMAIL */}

                                <div>

                                    <label
                                        style={labelStyle}
                                    >
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="your@email.com"
                                        autoComplete="email"
                                        style={
                                            inputStyle
                                        }
                                    />

                                </div>


                                {/* OCCASION */}

                                <div>

                                    <label
                                        style={labelStyle}
                                    >
                                        Occasion
                                    </label>

                                    <select
                                        name="occasion"
                                        value={
                                            formData.occasion
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={
                                            inputStyle
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
                                                    {occasion}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>

                        </section>


                        {/* =================================================
                            STEP 3 — DATE / TIME
                        ================================================= */}

                        <section
                            style={{
                                marginBottom:
                                    "45px",
                            }}
                        >

                            <div
                                style={{
                                    marginBottom:
                                        "22px",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "#ff9f1c",

                                        fontSize:
                                            "11px",

                                        fontWeight:
                                            "700",

                                        letterSpacing:
                                            "3px",
                                    }}
                                >
                                    STEP 03
                                </span>

                                <h2
                                    style={{
                                        margin:
                                            "8px 0 6px",

                                        fontFamily:
                                            "Georgia, serif",

                                        fontSize:
                                            "clamp(28px, 4vw, 42px)",
                                    }}
                                >
                                    Date, Time & Guests
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            0,

                                        color:
                                            "#9f958e",
                                    }}
                                >
                                    Choose when you would
                                    like to dine with us.
                                </p>

                            </div>


                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(3, minmax(0, 1fr))",

                                    gap:
                                        "18px",
                                }}
                            >

                                {/* DATE */}

                                <div>

                                    <label
                                        style={labelStyle}
                                    >
                                        Reservation Date *
                                    </label>

                                    <input
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
                                        style={
                                            inputStyle
                                        }
                                    />

                                </div>


                                {/* TIME */}

                                <div>

                                    <label
                                        style={labelStyle}
                                    >
                                        Preferred Time *
                                    </label>

                                    <input
                                        type="time"
                                        name="time"
                                        value={
                                            formData.time
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        style={
                                            inputStyle
                                        }
                                    />

                                </div>


                                {/* GUESTS */}

                                <div>

                                    <label
                                        style={labelStyle}
                                    >
                                        Number of Guests *
                                    </label>

                                    <input
                                        type="number"
                                        name="guests"
                                        value={
                                            formData.guests
                                        }
                                        onChange={
                                            handleChange
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
                                                ? `${selectedTable.minGuests}-${selectedTable.maxGuests}`
                                                : "Select table first"
                                        }
                                        disabled={
                                            !selectedTable
                                        }
                                        style={{
                                            ...inputStyle,

                                            opacity:
                                                selectedTable
                                                    ? 1
                                                    : 0.55,
                                        }}
                                    />

                                </div>

                            </div>


                            {selectedTable && (
                                <div
                                    style={{
                                        marginTop:
                                            "14px",

                                        color:
                                            "#a99d95",

                                        fontSize:
                                            "12px",
                                    }}
                                >
                                    👥 This experience supports{" "}
                                    <strong
                                        style={{
                                            color:
                                                "#ffb15a",
                                        }}
                                    >
                                        {
                                            selectedGuestsText
                                        }
                                    </strong>
                                    .
                                </div>
                            )}

                        </section>


                        {/* =================================================
                            STEP 4 — MESSAGE
                        ================================================= */}

                        <section
                            style={{
                                marginBottom:
                                    "35px",
                            }}
                        >

                            <div
                                style={{
                                    marginBottom:
                                        "22px",
                                }}
                            >

                                <span
                                    style={{
                                        color:
                                            "#ff9f1c",

                                        fontSize:
                                            "11px",

                                        fontWeight:
                                            "700",

                                        letterSpacing:
                                            "3px",
                                    }}
                                >
                                    STEP 04
                                </span>

                                <h2
                                    style={{
                                        margin:
                                            "8px 0 6px",

                                        fontFamily:
                                            "Georgia, serif",

                                        fontSize:
                                            "clamp(28px, 4vw, 42px)",
                                    }}
                                >
                                    Special Request
                                </h2>

                                <p
                                    style={{
                                        margin:
                                            0,

                                        color:
                                            "#9f958e",
                                    }}
                                >
                                    Let us know if you have
                                    any special requirements.
                                </p>

                            </div>


                            <textarea
                                name="message"
                                value={
                                    formData.message
                                }
                                onChange={
                                    handleChange
                                }
                                placeholder="Birthday decoration, window seat, dietary request, special occasion note..."
                                rows={5}
                                maxLength={500}
                                style={{
                                    ...inputStyle,

                                    width:
                                        "100%",

                                    resize:
                                        "vertical",

                                    minHeight:
                                        "130px",

                                    lineHeight:
                                        "1.6",
                                }}
                            />


                            <div
                                style={{
                                    marginTop:
                                        "7px",

                                    textAlign:
                                        "right",

                                    color:
                                        "#756a63",

                                    fontSize:
                                        "11px",
                                }}
                            >
                                {
                                    formData.message.length
                                }
                                /500
                            </div>

                        </section>


                        {/* =================================================
                            FINAL SUMMARY
                        ================================================= */}

                        <section
                            style={{
                                marginTop:
                                    "20px",

                                padding:
                                    "28px",

                                borderRadius:
                                    "26px",

                                background:
                                    "linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035))",

                                border:
                                    "1px solid rgba(255,255,255,0.10)",

                                boxShadow:
                                    "0 25px 70px rgba(0,0,0,0.20)",
                            }}
                        >

                            <div
                                style={{
                                    display:
                                        "flex",

                                    justifyContent:
                                        "space-between",

                                    alignItems:
                                        "center",

                                    gap:
                                        "20px",

                                    flexWrap:
                                        "wrap",
                                }}
                            >

                                <div>

                                    <span
                                        style={{
                                            color:
                                                "#ff9f1c",

                                            fontSize:
                                                "11px",

                                            letterSpacing:
                                                "2px",

                                            fontWeight:
                                                "700",
                                        }}
                                    >
                                        READY TO REQUEST
                                    </span>

                                    <h3
                                        style={{
                                            margin:
                                                "7px 0 4px",

                                            fontSize:
                                                "22px",
                                        }}
                                    >
                                        {selectedTable
                                            ? selectedTable.type
                                            : "Select an experience"}
                                    </h3>

                                    <p
                                        style={{
                                            margin:
                                                0,

                                            color:
                                                "#948981",

                                            fontSize:
                                                "13px",
                                        }}
                                    >
                                        Reservation price is
                                        separate from your
                                        food bill.
                                    </p>

                                </div>


                                <div
                                    style={{
                                        textAlign:
                                            "right",
                                    }}
                                >

                                    <span
                                        style={{
                                            display:
                                                "block",

                                            color:
                                                "#8f847d",

                                            fontSize:
                                                "10px",

                                            letterSpacing:
                                                "1px",
                                        }}
                                    >
                                        TABLE EXPERIENCE
                                    </span>

                                    <strong
                                        style={{
                                            display:
                                                "block",

                                            color:
                                                "#ffb15a",

                                            fontSize:
                                                "27px",

                                            marginTop:
                                                "4px",
                                        }}
                                    >
                                        {selectedTable
                                            ? formatCurrency(
                                                selectedTable.price
                                            )
                                            : "₹0"}
                                    </strong>

                                </div>

                            </div>


                            <button
                                type="submit"
                                disabled={
                                    submitting ||
                                    !selectedTable
                                }
                                style={{
                                    width:
                                        "100%",

                                    marginTop:
                                        "25px",

                                    minHeight:
                                        "58px",

                                    border:
                                        "none",

                                    borderRadius:
                                        "16px",

                                    background:
                                        submitting ||
                                        !selectedTable
                                            ? "rgba(255,255,255,0.10)"
                                            : "linear-gradient(135deg, #ff7b00, #ff9f1c)",

                                    color:
                                        submitting ||
                                        !selectedTable
                                            ? "#777"
                                            : "#ffffff",

                                    fontSize:
                                        "15px",

                                    fontWeight:
                                        "800",

                                    letterSpacing:
                                        "0.3px",

                                    cursor:
                                        submitting ||
                                        !selectedTable
                                            ? "not-allowed"
                                            : "pointer",

                                    boxShadow:
                                        submitting ||
                                        !selectedTable
                                            ? "none"
                                            : "0 18px 40px rgba(255,123,0,0.24)",

                                    transition:
                                        "all 0.25s ease",
                                }}
                            >
                                {submitting
                                    ? "⏳ Sending Reservation Request..."
                                    : selectedTable
                                        ? "Reserve My Table →"
                                        : "Select a Dining Experience First"}
                            </button>


                            <p
                                style={{
                                    margin:
                                        "14px 0 0",

                                    textAlign:
                                        "center",

                                    color:
                                        "#71665f",

                                    fontSize:
                                        "11px",

                                    lineHeight:
                                        "1.6",
                                }}
                            >
                                Your reservation will remain
                                <strong
                                    style={{
                                        color:
                                            "#a99d95",
                                    }}
                                >
                                    {" "}PENDING{" "}
                                </strong>
                                until our restaurant team
                                confirms availability.
                            </p>

                        </section>

                    </form>
                )}


                {/* =================================================
                    FOOT NOTE
                ================================================= */}

                <section
                    style={{
                        marginTop:
                            "60px",

                        padding:
                            "25px",

                        textAlign:
                            "center",

                        borderTop:
                            "1px solid rgba(255,255,255,0.08)",

                        color:
                            "#746a64",

                        fontSize:
                            "12px",

                        lineHeight:
                            "1.8",
                    }}
                >
                    <p
                        style={{
                            margin:
                                0,
                        }}
                    >
                        🕐 Reservation requests are reviewed
                        by our team based on actual table
                        availability.
                    </p>

                    <p
                        style={{
                            margin:
                                "6px 0 0",
                        }}
                    >
                        📞 For urgent bookings, please contact
                        the restaurant directly.
                    </p>

                </section>

            </div>

        </main>

    );
}


// =====================================================
// REUSABLE INLINE STYLES
// =====================================================

const labelStyle = {
    display:
        "block",

    marginBottom:
        "8px",

    color:
        "#d5cbc4",

    fontSize:
        "12px",

    fontWeight:
        "600",
};


const inputStyle = {
    width:
        "100%",

    minHeight:
        "52px",

    padding:
        "0 15px",

    border:
        "1px solid rgba(255,255,255,0.12)",

    borderRadius:
        "14px",

    outline:
        "none",

    background:
        "rgba(255,255,255,0.055)",

    color:
        "#ffffff",

    fontSize:
        "14px",

    fontFamily:
        "inherit",

    boxSizing:
        "border-box",
};