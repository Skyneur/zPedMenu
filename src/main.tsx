import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import PedMenu from "./PedMenu";

console.log('Main.tsx is loading...'); // Debug log

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PedMenu />
  </React.StrictMode>
);

console.log('React app has been rendered'); // Debug log
