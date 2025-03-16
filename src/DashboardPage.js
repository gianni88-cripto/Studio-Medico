// src/DashboardPage.js
import React, { useState, useEffect } from "react";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "./firebaseConfig";
import {
  query,
  where,
  getDocs,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./index.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedDates, setBookedDates] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Lista delle sedute della Dottoressa Eleonora
  const sessionTypesEleonora = [
    { label: "Consulenza online • 80 €", duration: 40 },
    { label: "Prima visita sessuologica • 90 €", duration: 50 },
    { label: "Psicoterapia individuale • 80 €", duration: 50 },
    { label: "Colloquio psicologico • 80 €", duration: 50 },
    { label: "Psicoterapia di coppia • 150 €", duration: 50 },
    { label: "Psicoterapia familiare • 150 €", duration: 50 },
    { label: "Psicoterapia di gruppo (richiede contatto diretto)", duration: null },
    { label: "Sostegno psicologico • 80 €", duration: 50 },
    { label: "Terapia sessuologica di coppia • 150 €", duration: 50 },
  ];

  // Funzione per ottenere la data locale in formato YYYY-MM-DD
  const getLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Carica le prenotazioni da Firestore
  const fetchBookedDates = async () => {
    if (!selectedDoctor) {
      console.log("Nessun medico selezionato. Impossibile caricare le prenotazioni.");
      return;
    }

    try {
      console.log("Caricamento delle prenotazioni per il medico:", selectedDoctor);
      const q = query(
        collection(db, "appointments"),
        where("doctor", "==", selectedDoctor)
      );

      const querySnapshot = await getDocs(q);
      const booked = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const dateString = getLocalDate(new Date(data.date)); // Formatta la data come YYYY-MM-DD
        console.log("Dati caricati da Firebase:", data); // Debugging

        if (!booked[dateString]) {
          booked[dateString] = [];
        }
        booked[dateString].push(data.timeSlot);
      });

      console.log("Prenotazioni caricate:", booked); // Debugging
      setBookedDates(booked);
    } catch (error) {
      console.error("Errore durante il caricamento delle prenotazioni:", error);
      alert("Errore durante il caricamento delle prenotazioni. Controlla la console.");
    }
  };

  useEffect(() => {
    console.log("Effettuo il fetching delle prenotazioni...");
    fetchBookedDates();
  }, [selectedDoctor]);

  // Verifica se una data è valida
  const isValidDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Imposta l'orario di oggi a mezzanotte
    const day = date.getDay(); // Giorno della settimana (0 = domenica, 6 = sabato)
    const dateString = getLocalDate(date);

    console.log(`Verifica validità data: ${dateString}, Oggi: ${getLocalDate(today)}, Giorno: ${day}`); // Debugging

    // Escludi sabati, domeniche e date passate
    if (day === 0 || day === 6 || date < today) {
      console.log(`Data non valida: ${dateString} (Sabato/Domenica o passata)`); // Debugging
      return false;
    }

    // Verifica se ci sono fasce orarie disponibili per la data selezionata
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
    console.log(`Fasce orarie occupate per ${dateString}:`, bookedSlots); // Debugging

    const remainingSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));
    console.log(`Fasce orarie disponibili per ${dateString}:`, remainingSlots); // Debugging

    return remainingSlots.length > 0; // Restituisce true se ci sono slot liberi
  };

  const handleDateChange = (selectedDate) => {
    console.log(`Data selezionata: ${getLocalDate(selectedDate)}`); // Debugging
    if (isValidDate(selectedDate)) {
      setSelectedDate(selectedDate);
    } else {
      alert("Data non disponibile. Seleziona un giorno lavorativo futuro con orari liberi.");
    }
  };

  // Applica uno stile personalizzato alle date
  const tileClassName = ({ date }) => {
    const dateString = getLocalDate(date);
    const day = date.getDay();

    console.log(`Applicazione stile per data: ${dateString}, Giorno: ${day}`); // Debugging

    // Evidenzia sabati, domeniche e festivi in rosso
    if (day === 0 || day === 6) {
      console.log(`Data ${dateString} è un sabato/domenica.`); // Debugging
      return "holiday-date"; // Giorno festivo o weekend
    }

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

    if (remainingSlots.length === 0) {
      console.log(`Data ${dateString} completamente occupata.`); // Debugging
      return "booked-date"; // Data completamente occupata
    }

    console.log(`Data ${dateString} parzialmente o totalmente libera.`); // Debugging
    return "available-date"; // Data parzialmente o totalmente libera
  };

  // Gestisci la prenotazione
  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !sessionType) {
      alert("Completa tutti i campi prima di prenotare.");
      return;
    }

    const selectedSession = sessionTypesEleonora.find(
      (type) => type.label === sessionType
    );
    if (!selectedSession.duration) {
      alert("Questa seduta richiede un contatto diretto. Ti preghiamo di contattare lo studio.");
      return;
    }

    try {
      const selectedDateString = getLocalDate(selectedDate);

      console.log(`Effettuo la prenotazione per:`, {
        doctor: selectedDoctor,
        date: selectedDateString,
        timeSlot: selectedTime,
        sessionType: sessionType,
      }); // Debugging

      await addDoc(collection(db, "appointments"), {
        userId: auth.currentUser.uid,
        doctor: selectedDoctor,
        date: selectedDateString,
        sessionType: sessionType,
        timeSlot: selectedTime,
        createdAt: serverTimestamp(),
      });

      setBookingSuccess(true);
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error) {
      console.error("Errore durante la prenotazione:", error);
      alert("Errore durante la prenotazione: " + error.message);
    }
  };

  // Fasce orarie disponibili
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

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      alert("Errore durante il logout: " + error.message);
    }
  };

  return (
    <div className="container">
      {/* Messaggio di conferma */}
      {bookingSuccess && (
        <p style={{ color: "green", fontSize: "1.2rem", marginBottom: "20px" }}>
          Prenotazione effettuata con successo!
        </p>
      )}

      {/* Titolo */}
      {!bookingSuccess && <h2>Benvenuto/a allo STUDIO FULCRUM</h2>}

      {/* Seleziona il medico */}
      {!bookingSuccess && (
        <label>
          Seleziona il professionista:
          <select
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            required
          >
            <option value="">--Seleziona--</option>
            <option value="Eleonora Sellitto - Psicoterapeuta, Sessuologa">
              Eleonora Sellitto - Psicoterapeuta, Sessuologa
            </option>
            <option value="Anna - Osteopata">Anna - Osteopata</option>
          </select>
        </label>
      )}

      {/* Calendario per selezionare la data */}
      {!bookingSuccess && selectedDoctor && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <h3>Seleziona una data</h3>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileDisabled={({ date }) => !isValidDate(date)} // Disabilita date non valide
            tileClassName={tileClassName}
            minDate={new Date()} // Disabilita automaticamente tutte le date passate
          />
        </div>
      )}

      {/* Seleziona l'orario */}
      {!bookingSuccess && selectedDate && (
        <label style={{ marginTop: "20px" }}>
          Seleziona l'orario:
          <select
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            required
          >
            <option value="">--Seleziona--</option>
            {allSlots.map((slot) => {
              const isBooked = bookedDates[getLocalDate(selectedDate)]?.includes(slot);
              console.log(`Fascia oraria: ${slot}, Occupata: ${isBooked}`); // Debugging
              return (
                <option
                  key={slot}
                  value={slot}
                  disabled={isBooked} // Disabilita le fasce orarie occupate
                  className={isBooked ? "booked-slot" : "available-slot"} // Applica la classe corretta
                >
                  {slot} {isBooked ? "(Occupato)" : "(Libero)"}
                </option>
              );
            })}
          </select>
        </label>
      )}

      {/* Seleziona il tipo di seduta */}
      {!bookingSuccess && selectedTime && (
        <label style={{ marginTop: "20px" }}>
          Tipo di seduta:
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            required
          >
            <option value="">--Seleziona--</option>
            {sessionTypesEleonora.map((type, index) => (
              <option key={index} value={type.label}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Bottone per confermare la prenotazione */}
      {!bookingSuccess && selectedTime && (
        <button className="confirm-button" onClick={handleBooking}>
          Conferma Prenotazione
        </button>
      )}

      {/* Pulsante Logout */}
      {!bookingSuccess && (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
};

export default DashboardPage;