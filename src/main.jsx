import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import CollageEditor from "./CollageEditor.jsx";

window.alert("✅ React app mounted!");
console.log("✅ top of main.jsx loaded");

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CollageEditor />
  </React.StrictMode>
);
