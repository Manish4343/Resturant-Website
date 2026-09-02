import { Routes, Route } from "react-router-dom";

import React from "react";

import "./App.css";

import Navbar from "./Components/Navbar";

import Footer from "./Components/Footer";

import Home from "./pages/Home";

import About from "./pages/About";

import Contact from "./pages/Contact";

import Menu from "./pages/Menu";

import Reservation from "./pages/Reservation";

import Cart from "./pages/Cart";

import Checkout from "./pages/Checkout";

import OrderSuccess from "./pages/OrderSuccess";

import Login from "./pages/Login";

import Register from "./pages/Register";

import AdminDashboard from "./admin/AdminDashboard";

import MyOrders from "./pages/MyOrders";

import MyReservations from "./pages/MyReservations";

import AdminReservations from "./admin/AdminReservations";

export default function App() {
  return (
    <div className="page">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/menu" element={<Menu />} />

        <Route path="/about" element={<About />} />

        <Route path="/contact" element={<Contact />} />

        <Route path="/reservation" element={<Reservation />} />

        <Route path="/my-reservations" element={<MyReservations />} />

        <Route path="/cart" element={<Cart />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/order-success" element={<OrderSuccess />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={<AdminDashboard />} />

        <Route path="/admin/reservations" element={<AdminReservations />} />

        <Route path="/my-orders" element={<MyOrders />} />
      </Routes>

      <Footer />
    </div>
  );
}
