import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/cart.css";

function Cart() {
  const {
    cartItems,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart();

  // ============================================
  // PRICE CALCULATIONS
  // ============================================

  // Actual menu item price only
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * Number(item.quantity),
    0
  );

  // 18% GST
  const gst = subtotal * 0.18;

  // ₹10 packaging per product quantity
  const totalQuantity = cartItems.reduce(
    (total, item) => total + Number(item.quantity),
    0
  );

  const packagingCharge = totalQuantity * 10;

  // Fixed handling charge
  const handlingCharge = cartItems.length > 0 ? 5 : 0;

  // Final amount
  const grandTotal =
    subtotal +
    gst +
    packagingCharge +
    handlingCharge;


  // ============================================
  // EMPTY CART
  // ============================================

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="cart-empty">

          <div className="cart-empty-icon">
            🛒
          </div>

          <h1>
            Your Cart is Empty
          </h1>

          <p>
            Looks like you haven't added anything to your
            cart yet.
          </p>

          <Link
            to="/menu"
            className="continue-shopping-btn"
          >
            Browse Menu
          </Link>

        </div>
      </section>
    );
  }


  // ============================================
  // CART
  // ============================================

  return (
    <section className="cart-page">

      <div className="cart-container">

        {/* ======================================
            HEADING
        ====================================== */}

        <div className="cart-heading">

          <h1>
            Your Cart 🛒
          </h1>

          <p>
            Review your delicious items before checkout.
          </p>

        </div>


        {/* ======================================
            CONTENT
        ====================================== */}

        <div className="cart-content">


          {/* ====================================
              CART ITEMS
          ==================================== */}

          <div className="cart-items">

            {cartItems.map((item) => (

              <div
                className="cart-item"
                key={item._id}
              >

                {/* IMAGE */}

                <div className="cart-item-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                </div>


                {/* DETAILS */}

                <div className="cart-item-details">

                  <h2>
                    {item.name}
                  </h2>

                  <p>
                    {item.description}
                  </p>

                  {/* ORIGINAL MENU PRICE */}

                  <span className="cart-item-price">
                    ₹{Number(item.price).toFixed(2)}
                  </span>


                  {/* QUANTITY */}

                  <div className="quantity-control">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(item._id)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(item._id)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>


                {/* RIGHT SIDE */}

                <div className="cart-item-right">

                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() =>
                      removeFromCart(item._id)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>

            ))}


            {/* CLEAR CART */}

            <button
              type="button"
              className="clear-cart-btn"
              onClick={clearCart}
            >
              Clear Cart
            </button>

          </div>


          {/* ====================================
              ORDER SUMMARY
          ==================================== */}

          <div className="cart-summary">

            <h2>
              Order Summary
            </h2>


            {/* SUBTOTAL */}

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <span>
                ₹{subtotal.toFixed(2)}
              </span>

            </div>


            {/* GST */}

            <div className="summary-row">

              <span>
                GST (18%)
              </span>

              <span>
                ₹{gst.toFixed(2)}
              </span>

            </div>


            {/* PACKAGING */}

            <div className="summary-row">

              <span>
                Packaging ({totalQuantity} × ₹10)
              </span>

              <span>
                ₹{packagingCharge.toFixed(2)}
              </span>

            </div>


            {/* HANDLING */}

            <div className="summary-row">

              <span>
                Handling Charge
              </span>

              <span>
                ₹{handlingCharge.toFixed(2)}
              </span>

            </div>


            <div className="summary-divider"></div>


            {/* GRAND TOTAL */}

            <div className="summary-total">

              <span>
                Grand Total
              </span>

              <span>
                ₹{grandTotal.toFixed(2)}
              </span>

            </div>


            {/* CHECKOUT */}

            <Link
              to="/checkout"
              className="checkout-btn"
            >
              Proceed to Checkout
            </Link>


            {/* CONTINUE */}

            <Link
              to="/menu"
              className="continue-shopping-link"
            >
              ← Continue Shopping
            </Link>

          </div>

        </div>

      </div>

    </section>
  );
}

export default Cart;