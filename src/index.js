// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Importa gli stili globali
import App from "./App"; // Importa il componente principale

// Crea il contenitore React
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Impossibile trovare l'elemento DOM con ID 'root'");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);