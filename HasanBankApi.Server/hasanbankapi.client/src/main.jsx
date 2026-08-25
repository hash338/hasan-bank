import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./style/theme.css";
import "./style/app.css";

const el = document.getElementById("root");
ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
