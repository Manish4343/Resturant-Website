import { useLocation, useNavigate } from "react-router-dom";
import "../styles/orderSuccess.css";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  // ============================================
  // ORDER DATA
  // ============================================

  const subtotal = Number(order?.subtotal || 0);
  const gst = Number(order?.gst || 0);
  const packagingCharge = Number(
    order?.packagingCharge || 0
  );
  const handlingCharge = Number(
    order?.handlingCharge || 0
  );

  const grandTotal = Number(
    order?.totalAmount ||
      subtotal +
        gst +
        packagingCharge +
        handlingCharge
  );


  // ============================================
  // NO ORDER DATA
  // ============================================

  if (!order) {
    return (
      <section className="order-success-page">

        <div className="success-card">

          <div className="success-icon">
            ✓
          </div>

          <h1>
            Order Placed Successfully! 🎉
          </h1>

          <p>
            Your order has been placed successfully.
          </p>

          <div className="success-no-order">
            <p>
              Order details are not available on this page.
            </p>

            <p>
              You can check your previous orders from
              <strong> My Orders</strong>.
            </p>
          </div>

          <div className="success-actions">

            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="primary-success-btn"
            >
              View My Orders
            </button>

            <button
              type="button"
              onClick={() => navigate("/menu")}
              className="secondary-success-btn"
            >
              Continue Shopping
            </button>

          </div>

        </div>

      </section>
    );
  }


  // ============================================
  // MAIN SUCCESS PAGE
  // ============================================

  return (
    <section className="order-success-page">

      <div className="success-card">

        {/* ======================================
            SUCCESS ICON
        ====================================== */}

        <div className="success-icon">
          ✓
        </div>


        {/* ======================================
            TITLE
        ====================================== */}

        <h1>
          Order Placed Successfully! 🎉
        </h1>

        <p className="success-message">
          Thank you for ordering from Swaad & Spice.
          Your delicious food is on its way!
        </p>


        {/* ======================================
            ORDER STATUS
        ====================================== */}

        <div className="order-status-badge">
          <span className="status-dot"></span>

          {order.orderStatus || "Pending"}
        </div>


        {/* ======================================
            ORDER INFORMATION
        ====================================== */}

        <div className="success-details">

          <div className="success-detail-row">

            <span>
              Order ID
            </span>

            <strong>
              {order._id}
            </strong>

          </div>


          <div className="success-detail-row">

            <span>
              Payment
            </span>

            <strong>
              {order.paymentMethod}
            </strong>

          </div>


          {order.customer?.name && (
            <div className="success-detail-row">

              <span>
                Customer
              </span>

              <strong>
                {order.customer.name}
              </strong>

            </div>
          )}


          {order.customer?.phone && (
            <div className="success-detail-row">

              <span>
                Mobile
              </span>

              <strong>
                {order.customer.phone}
              </strong>

            </div>
          )}

        </div>


        {/* ======================================
            ORDERED ITEMS
        ====================================== */}

        {order.items?.length > 0 && (

          <div className="success-items">

            <div className="success-section-title">
              <h2>
                Your Order
              </h2>

              <span>
                {order.items.length} item
                {order.items.length > 1 ? "s" : ""}
              </span>
            </div>


            <div className="success-item-list">

              {order.items.map((item, index) => (

                <div
                  className="success-item"
                  key={
                    item.menuItem ||
                    item._id ||
                    index
                  }
                >

                  <div className="success-item-image">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    ) : (
                      <div className="success-item-placeholder">
                        🍛
                      </div>
                    )}

                  </div>


                  <div className="success-item-info">

                    <h3>
                      {item.name}
                    </h3>

                    <p>
                      ₹{Number(item.price).toFixed(2)}
                      {" × "}
                      {item.quantity}
                    </p>

                  </div>


                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toFixed(2)}
                  </strong>

                </div>

              ))}

            </div>

          </div>

        )}


        {/* ======================================
            PRICE BREAKDOWN
        ====================================== */}

        <div className="success-summary">

          <h2>
            Payment Summary
          </h2>


          <div className="success-summary-row">

            <span>
              Subtotal
            </span>

            <span>
              ₹{subtotal.toFixed(2)}
            </span>

          </div>


          <div className="success-summary-row">

            <span>
              GST (18%)
            </span>

            <span>
              ₹{gst.toFixed(2)}
            </span>

          </div>


          <div className="success-summary-row">

            <span>
              Packaging
            </span>

            <span>
              ₹{packagingCharge.toFixed(2)}
            </span>

          </div>


          <div className="success-summary-row">

            <span>
              Handling Charge
            </span>

            <span>
              ₹{handlingCharge.toFixed(2)}
            </span>

          </div>


          <div className="success-summary-divider"></div>


          <div className="success-grand-total">

            <span>
              Grand Total
            </span>

            <strong>
              ₹{grandTotal.toFixed(2)}
            </strong>

          </div>

        </div>


        {/* ======================================
            DELIVERY ADDRESS
        ====================================== */}

        {order.customer?.address && (

          <div className="delivery-info">

            <h2>
              📍 Delivery Address
            </h2>

            <p>
              {order.customer.address}
            </p>

          </div>

        )}


        {/* ======================================
            ACTION BUTTONS
        ====================================== */}

        <div className="success-actions">

          <button
            type="button"
            className="primary-success-btn"
            onClick={() =>
              navigate("/orders")
            }
          >
            View My Orders
          </button>


          <button
            type="button"
            className="secondary-success-btn"
            onClick={() =>
              navigate("/menu")
            }
          >
            Continue Shopping
          </button>

        </div>

      </div>

    </section>
  );
}

export default OrderSuccess;