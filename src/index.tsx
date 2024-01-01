import './main.scss';
import React from 'react';
import { createRoot } from "react-dom/client"

const root = createRoot(document.getElementById("root") as Element)
import App from './App';
root.render(<App/>)
