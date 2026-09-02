import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

import "../styles/checkout.css";

function Checkout() {

    const navigate = useNavigate();

    const {
        cartItems,
        clearCart,
    } = useCart();

    const {
        user,
        token,
        loading: authLoading,
    } = useAuth();


    // ============================================
    // PRICE CALCULATIONS
    // ============================================

    // Actual menu prices only
    const subtotal = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.price) *
            Number(item.quantity),
        0
    );

    // GST 18%
    const gst = subtotal * 0.18;

    // Total quantity
    const totalQuantity = cartItems.reduce(
        (total, item) =>
            total + Number(item.quantity),
        0
    );

    // ₹10 packaging per product
    const packagingCharge =
        totalQuantity * 10;

    // Fixed handling charge
    const handlingCharge =
        cartItems.length > 0 ? 5 : 0;

    // Final payable amount
    const grandTotal =
        subtotal +
        gst +
        packagingCharge +
        handlingCharge;


    // ============================================
    // FORM DATA
    // ============================================

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        address: "",
        instructions: "",
        paymentMethod: "COD",
    });

    const [loading, setLoading] = useState(false);


    // ============================================
    // LOGIN CHECK
    // ============================================

    useEffect(() => {

        if (!authLoading && !user) {

            alert(
                "Please login before checkout."
            );

            navigate("/login");
        }

    }, [
        user,
        authLoading,
        navigate
    ]);


    // ============================================
    // SET USER NAME
    // ============================================

    useEffect(() => {

        if (user?.name) {

            setFormData((prev) => ({
                ...prev,
                name: user.name,
            }));

        }

    }, [user]);


    // ============================================
    // INPUT CHANGE
    // ============================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

    };


    // ============================================
    // PLACE ORDER
    // ============================================

    const handlePlaceOrder = async (e) => {

        e.preventDefault();


        // LOGIN CHECK

        if (!user || !token) {

            alert(
                "Not authorized. Please login."
            );

            navigate("/login");

            return;
        }


        // CART CHECK

        if (cartItems.length === 0) {

            alert(
                "Your cart is empty."
            );

            navigate("/menu");

            return;
        }


        // PHONE VALIDATION

        if (
            !/^[0-9]{10}$/.test(
                formData.phone
            )
        ) {

            alert(
                "Please enter a valid 10 digit mobile number."
            );

            return;
        }


        // ADDRESS VALIDATION

        if (
            !formData.address.trim()
        ) {

            alert(
                "Please enter your delivery address."
            );

            return;
        }


        try {

            setLoading(true);


            // ========================================
            // ORDER DATA
            // ========================================

            const orderData = {

                customer: {

                    name:
                        formData.name,

                    phone:
                        formData.phone,

                    address:
                        formData.address,

                    instructions:
                        formData.instructions,

                },


                items: cartItems.map(
                    (item) => ({

                        menuItem:
                            item._id,

                        name:
                            item.name,

                        // ORIGINAL MENU PRICE
                        price:
                            Number(item.price),

                        quantity:
                            Number(item.quantity),

                        image:
                            item.image,

                    })
                ),


                // PRICE BREAKDOWN

                subtotal:
                    Number(
                        subtotal.toFixed(2)
                    ),

                gst:
                    Number(
                        gst.toFixed(2)
                    ),

                packagingCharge:
                    Number(
                        packagingCharge.toFixed(2)
                    ),

                handlingCharge:
                    Number(
                        handlingCharge.toFixed(2)
                    ),

                // FINAL PAYABLE AMOUNT

                totalAmount:
                    Number(
                        grandTotal.toFixed(2)
                    ),


                paymentMethod:
                    formData.paymentMethod,

            };


            console.log(
                "Sending order:",
                orderData
            );


            // ========================================
            // API REQUEST
            // ========================================

            const response =
                await axios.post(

                    "http://localhost:5000/api/orders",

                    orderData,

                    {
                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json",

                        },
                    }

                );


            // ========================================
            // SUCCESS
            // ========================================

            if (
                response.data.success
            ) {

                alert(
                    "🎉 Order placed successfully!"
                );

                clearCart();

                navigate(
                    "/order-success",
                    {
                        state: {
                            order:
                                response.data.data,
                        },
                    }
                );

            }

        } catch (error) {

            console.error(
                "Place order error:",
                error
            );


            // TOKEN EXPIRED

            if (
                error.response?.status === 401
            ) {

                alert(
                    "Your login session has expired. Please login again."
                );

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                navigate("/login");

                return;
            }


            alert(
                error.response?.data?.message ||
                "Failed to place order. Please try again."
            );

        } finally {

            setLoading(false);

        }

    };


    // ============================================
    // AUTH LOADING
    // ============================================

    if (authLoading) {

        return (

            <section className="checkout-page">

                <div className="checkout-empty">

                    <h1>
                        Checking Login...
                    </h1>

                    <p>
                        Please wait.
                    </p>

                </div>

            </section>

        );

    }


    // ============================================
    // NOT LOGGED IN
    // ============================================

    if (!user) {

        return (

            <section className="checkout-page">

                <div className="checkout-empty">

                    <h1>
                        Login Required 🔐
                    </h1>

                    <p>
                        Please login before placing an order.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Login
                    </button>

                </div>

            </section>

        );

    }


    // ============================================
    // EMPTY CART
    // ============================================

    if (cartItems.length === 0) {

        return (

            <section className="checkout-page">

                <div className="checkout-empty">

                    <h1>
                        Your Cart is Empty 🛒
                    </h1>

                    <p>
                        Please add some delicious food before checkout.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/menu")
                        }
                    >
                        Go to Menu
                    </button>

                </div>

            </section>

        );

    }


    // ============================================
    // CHECKOUT PAGE
    // ============================================

    return (

        <section className="checkout-page">

            <div className="checkout-container">


                {/* =================================
                    LEFT - FORM
                ================================= */}

                <div className="checkout-form">

                    <h1>
                        Checkout 🛒
                    </h1>

                    <p className="checkout-subtitle">
                        Enter your details to place your order.
                    </p>


                    <form
                        onSubmit={
                            handlePlaceOrder
                        }
                    >


                        {/* NAME */}

                        <div className="form-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="Enter your name"
                                value={
                                    formData.name
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>


                        {/* PHONE */}

                        <div className="form-group">

                            <label htmlFor="phone">
                                Mobile Number
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                name="phone"
                                placeholder="Enter mobile number"
                                value={
                                    formData.phone
                                }
                                onChange={
                                    handleChange
                                }
                                maxLength="10"
                                inputMode="numeric"
                                required
                            />

                        </div>


                        {/* ADDRESS */}

                        <div className="form-group">

                            <label htmlFor="address">
                                Delivery Address
                            </label>

                            <textarea
                                id="address"
                                name="address"
                                placeholder="Enter complete delivery address"
                                value={
                                    formData.address
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                required
                            />

                        </div>


                        {/* INSTRUCTIONS */}

                        <div className="form-group">

                            <label htmlFor="instructions">
                                Special Instructions
                            </label>

                            <textarea
                                id="instructions"
                                name="instructions"
                                placeholder="Example: Less spicy, no onions..."
                                value={
                                    formData.instructions
                                }
                                onChange={
                                    handleChange
                                }
                                rows="3"
                            />

                        </div>


                        {/* PAYMENT */}

                        <div className="form-group">

                            <label>
                                Payment Method
                            </label>

                            <div className="payment-options">

                                <label className="payment-option">

                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="COD"
                                        checked={
                                            formData.paymentMethod ===
                                            "COD"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        💵 Cash on Delivery
                                    </span>

                                </label>


                                <label className="payment-option">

                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="ONLINE"
                                        checked={
                                            formData.paymentMethod ===
                                            "ONLINE"
                                        }
                                        onChange={
                                            handleChange
                                        }
                                    />

                                    <span>
                                        💳 Online Payment
                                    </span>

                                </label>

                            </div>

                        </div>


                        {/* PLACE ORDER */}

                        <button
                            className="place-order-btn"
                            type="submit"
                            disabled={loading}
                        >

                            {loading
                                ? "Placing Order..."
                                : `Place Order • ₹${grandTotal.toFixed(2)}`}

                        </button>

                    </form>

                </div>


                {/* =================================
                    RIGHT - ORDER SUMMARY
                ================================= */}

                <div className="order-summary">

                    <h2>
                        Your Order 🛒
                    </h2>


                    {/* ITEMS */}

                    <div className="summary-items">

                        {cartItems.map(
                            (item) => (

                                <div
                                    className="summary-item"
                                    key={item._id}
                                >

                                    <img
                                        src={
                                            item.image
                                        }
                                        alt={
                                            item.name
                                        }
                                    />


                                    <div className="summary-info">

                                        <h3>
                                            {
                                                item.name
                                            }
                                        </h3>

                                        <p>
                                            ₹
                                            {
                                                Number(
                                                    item.price
                                                ).toFixed(2)
                                            }
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
                                                item.price
                                            ) *
                                            Number(
                                                item.quantity
                                            )
                                        ).toFixed(2)}
                                    </strong>

                                </div>

                            )
                        )}

                    </div>


                    {/* =================================
                        PRICE BREAKDOWN
                    ================================= */}

                    <div className="summary-row">

                        <span>
                            Subtotal
                        </span>

                        <strong>
                            ₹{subtotal.toFixed(2)}
                        </strong>

                    </div>


                    <div className="summary-row">

                        <span>
                            GST (18%)
                        </span>

                        <strong>
                            ₹{gst.toFixed(2)}
                        </strong>

                    </div>


                    <div className="summary-row">

                        <span>
                            Packaging ({totalQuantity} × ₹10)
                        </span>

                        <strong>
                            ₹{packagingCharge.toFixed(2)}
                        </strong>

                    </div>


                    <div className="summary-row">

                        <span>
                            Handling Charge
                        </span>

                        <strong>
                            ₹{handlingCharge.toFixed(2)}
                        </strong>

                    </div>


                    <div className="summary-divider"></div>


                    {/* GRAND TOTAL */}

                    <div className="summary-total">

                        <span>
                            Grand Total
                        </span>

                        <strong>
                            ₹{grandTotal.toFixed(2)}
                        </strong>

                    </div>

                </div>

            </div>

        </section>

    );

}

export default Checkout;