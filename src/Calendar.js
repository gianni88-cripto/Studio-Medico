// src/Calendar.js
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { db } from "./firebaseConfig";
import { query, where, getDocs, collection } from "firebase/firestore";
import "./index.css";

const CustomCalendar = ({ onDateSelect, selectedDoctor }) => {
  const [date, setDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({});

  // Funzione per ottenere la data locale in formato YYYY-MM-DD
  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Carica le prenotazioni da Firestore
  const fetchBookedDates = async () => {
    if (!selectedDoctor) return;

    const q = query(
      collection(db, "appointments"),
      where("doctor", "==", selectedDoctor)
    );

    const querySnapshot = await getDocs(q);
    const booked = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const dateString = getLocalDate(new Date(data.date));
      if (!booked[dateString]) {
        booked[dateString] = [];
      }
      booked[dateString].push(data.timeSlot);
    });

    setBookedDates(booked);
  };

  useEffect(() => {
    fetchBookedDates();
  }, [selectedDoctor]);

  // Verifica se una data è valida
  const isValidDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    const dateString = getLocalDate(date);

    if (day === 0 || day === 6 || date < today) return false;

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
    const bookedSlots = bookedDates[dateString] || [];
    const remainingSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
    return remainingSlots.length > 0;
  };

  const handleDateChange = (selectedDate) => {
    if (isValidDate(selectedDate)) {
      setDate(selectedDate);
      onDateSelect(selectedDate);
    } else {
      alert("Data non disponibile. Seleziona un giorno lavorativo futuro con orari liberi.");
    }
  };

  // Applica uno stile personalizzato alle date
  const tileClassName = ({ date, view }) => {
    const dateString = getLocalDate(date);
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
    const bookedSlots = bookedDates[dateString] || [];
    const remainingSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

    if (remainingSlots.length > 0) {
      return "available-date";
    } else if (bookedSlots.length > 0) {
      return "booked-date";
    }

    // Evidenzia la data selezionata in blu acceso
    if (view === "month" && date.toDateString() === date.toDateString()) {
      return "selected-date";
    }

    return null;
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Seleziona una data</h3>
      <Calendar
        onChange={handleDateChange}
        value={date}
        tileDisabled={({ date }) => !isValidDate(date)}
        tileClassName={tileClassName}
      />
    </div>
  );
};

export default CustomCalendar;