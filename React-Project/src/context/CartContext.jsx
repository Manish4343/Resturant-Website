import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

// ================================
// CHARGES
// ================================

const GST_RATE = 0.18;
const PACKAGING_CHARGE = 10;
const HANDLING_CHARGE = 5;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // ================================
  // ADD TO CART
  // ================================

  const addToCart = (item) => {
    console.log("ADD TO CART:", item);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find(
        (cartItem) => cartItem._id === item._id
      );

      if (existingItem) {
        return prevItems.map((cartItem) =>
          cartItem._id === item._id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...prevItems,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  };

  // ================================
  // REMOVE FROM CART
  // ================================

  const removeFromCart = (id) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item._id !== id)
    );
  };

  // ================================
  // INCREASE QUANTITY
  // ================================

  const increaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // ================================
  // DECREASE QUANTITY
  // ================================

  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // ================================
  // CLEAR CART
  // ================================

  const clearCart = () => {
    setCartItems([]);
  };

  // ================================
  // SUBTOTAL
  // ================================

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // ================================
  // TOTAL ITEMS
  // ================================

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // ================================
  // GST
  // ================================

  const gstAmount = subtotal * GST_RATE;

  // ================================
  // PACKAGING
  // ₹10 PER PRODUCT QUANTITY
  // ================================

  const packagingAmount =
    totalItems * PACKAGING_CHARGE;

  // ================================
  // HANDLING
  // ₹5 PER ORDER
  // ================================

  const handlingAmount =
    totalItems > 0 ? HANDLING_CHARGE : 0;

  // ================================
  // GRAND TOTAL
  // ================================

  const grandTotal =
    subtotal +
    gstAmount +
    packagingAmount +
    handlingAmount;

  // ================================
  // BACKWARD COMPATIBILITY
  // ================================
  // Checkout currently uses totalAmount.
  // So totalAmount will now mean FINAL
  // amount instead of only food subtotal.

  const totalAmount = grandTotal;

  return (
    <CartContext.Provider
      value={{
        // Cart
        cartItems,

        // Cart actions
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,

        // Quantities
        totalItems,

        // Price breakdown
        subtotal,
        gstAmount,
        packagingAmount,
        handlingAmount,
        grandTotal,

        // Used by existing Checkout
        totalAmount,

        // Constants
        GST_RATE,
        PACKAGING_CHARGE,
        HANDLING_CHARGE,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ================================
// USE CART
// ================================

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};