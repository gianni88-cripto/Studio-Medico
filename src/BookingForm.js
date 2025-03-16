// src/BookingForm.js
import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { query, where, getDocs } from "firebase/firestore";
import CustomCalendar from "./Calendar";
import "./index.css";

const BookingForm = () => {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  // Funzione per ottenere la data locale in formato YYYY-MM-DD
  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Carica gli orari prenotati per la data selezionata
  const fetchBookedSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    const selectedDateString = getLocalDate(selectedDate);

    const q = query(
      collection(db, "appointments"),
      where("doctor", "==", selectedDoctor),
      where("date", "==", selectedDateString)
    );

    try {
      const querySnapshot = await getDocs(q);
      const booked = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        booked.push(data.timeSlot);
      });
      setBookedSlots(booked);
    } catch (error) {
      console.error("Errore durante il recupero delle prenotazioni:", error);
    }
  };

  useEffect(() => {
    fetchBookedSlots();
  }, [selectedDoctor, selectedDate]);

  // Gestisci la prenotazione
  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !sessionType) {
      alert("Completa tutti i campi prima di prenotare.");
      return;
    }

    try {
      const selectedDateString = getLocalDate(selectedDate);

      // Salva la prenotazione in Firestore
      await addDoc(collection(db, "appointments"), {
        userId: auth.currentUser.uid,
        doctor: selectedDoctor,
        date: selectedDateString,
        sessionType: sessionType,
        timeSlot: selectedTime,
        createdAt: serverTimestamp(),
      });

      alert("Prenotazione effettuata con successo!");
      setSelectedDoctor("");
      setSelectedDate(null);
      setSelectedTime("");
      setSessionType("");
    } catch (error) {
      console.error("Errore durante la prenotazione:", error);
      alert("Errore durante la prenotazione: " + error.message);
    }
  };

  const allSlots = [
    "09:00-10:00",
    "10:00-11:00",
    "11:00-12:00",
    "12:00-13:00",
    "14:00-15:00",
    "15:00-16:00",
    "16:00-17:00",
    "17:00-18:00",
    "18:00-19:00",
  ];

  return (
    <div className="container">
      {/* Seleziona il medico */}
      <label>
        Seleziona il medico:
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          required
        >
          <option value="">--Seleziona--</option>
          <option value="Dottoressa Eleonora">Dottoressa Eleonora</option>
          <option value="Dottoressa Anna">Dottoressa Anna</option>
        </select>
      </label>

      {/* Calendario per selezionare la data */}
      {selectedDoctor && (
        <CustomCalendar
          onDateSelect={setSelectedDate}
          selectedDoctor={selectedDoctor}
        />
      )}

      {/* Seleziona l'orario */}
      <label>
        Seleziona l'orario:
        <select
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          required
        >
          <option value="">--Seleziona--</option>
          {allSlots.map((slot) => (
            <option
              key={slot}
              value={slot}
              disabled={bookedSlots.includes(slot)}
              style={{
                backgroundColor: bookedSlots.includes(slot) ? "red" : "green",
                color: "white",
              }}
            >
              {slot} {bookedSlots.includes(slot) ? "(Occupato)" : "(Libero)"}
            </option>
          ))}
        </select>
      </label>

      {/* Seleziona il tipo di seduta */}
      <label>
        Tipo di seduta:
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          required
        >
          <option value="">--Seleziona--</option>
          <option value="Seduta Individuale">Seduta Individuale (60€, 60 minuti)</option>
          <option value="Seduta di Coppia">Seduta di Coppia (80€, 60 minuti)</option>
        </select>
      </label>

      {/* Bottone per confermare la prenotazione */}
      <button className="confirm-button" onClick={handleBooking}>
        Conferma Prenotazione
      </button>
    </div>
  );
};

export default BookingForm;