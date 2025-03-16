// src/LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import "./index.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // Stato per il messaggio di errore
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard"); // Reindirizza alla dashboard
    } catch (error) {
      setErrorMessage("Credenziali non valide. Riprova."); // Imposta il messaggio di errore
    }
  };

  return (
    <div className="container">
      <h1>STUDIO FULCRUM</h1>

      {/* Messaggio di errore */}
      {errorMessage && (
        <p style={{ color: "red", fontSize: "1.2rem", marginBottom: "20px" }}>
          {errorMessage}
        </p>
      )}

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <p
        onClick={() => navigate("/register")}
        style={{ cursor: "pointer", marginTop: "10px" }}
      >
        Non sei registrato? <strong>Registrati ora</strong>
      </p>
    </div>
  );
};

export default LoginPage;