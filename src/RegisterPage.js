// src/RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "./index.css";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(""); // Data di nascita
  const [birthPlace, setBirthPlace] = useState(""); // Luogo di nascita
  const [taxCode, setTaxCode] = useState(""); // Codice fiscale
  const [city, setCity] = useState(""); // Città
  const [address, setAddress] = useState(""); // Indirizzo di residenza
  const [phone, setPhone] = useState(""); // Cellulare
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Stato per il messaggio di successo
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Crea l'utente in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Salva i dati dell'utente nel database Firestore
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        birthPlace: birthPlace,
        taxCode: taxCode,
        city: city,
        address: address,
        phone: phone,
        email: email,
        createdAt: new Date(),
      });

      // Imposta il messaggio di successo
      setSuccessMessage("Registrazione effettuata con successo!");

      // Reindirizza alla dashboard dopo 3 secondi
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    } catch (error) {
      alert("Errore durante la registrazione: " + error.message);
    }
  };

  return (
    <div className="container">
      {/* Messaggio di successo */}
      {successMessage && (
        <p style={{ color: "green", fontSize: "1.2rem", marginBottom: "20px" }}>
          {successMessage}
        </p>
      )}

      {/* Titolo */}
      {!successMessage && <h1>Registrati nello STUDIO FULCRUM</h1>}

      {/* Form di registrazione */}
      {!successMessage && (
        <form className="auth-form" onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nome"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Cognome"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Data di Nascita"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Luogo di Nascita"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Codice Fiscale"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Città"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Indirizzo di Residenza"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Cellulare"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
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
          <button type="submit" className="register-button">
            Registrati
          </button>
        </form>
      )}

      {/* Link per tornare al login */}
      {!successMessage && (
        <p
          onClick={() => navigate("/")}
          style={{ cursor: "pointer", marginTop: "10px" }}
        >
          Hai già un account? <strong>Accedi ora</strong>
        </p>
      )}
    </div>
  );
};

export default RegisterPage;