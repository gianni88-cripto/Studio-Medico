// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import DashboardPage from "./DashboardPage";
import BookingForm from "./BookingForm";
import "./index.css";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Pagina di login */}
        <Route path="/" element={<LoginPage />} />
        {/* Pagina di registrazione */}
        <Route path="/register" element={<RegisterPage />} />
        {/* Dashboard protetta */}
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* Pagina di prenotazione */}
        <Route path="/booking" element={<BookingForm />} />
      </Routes>
    </Router>
  );
};

export default App;