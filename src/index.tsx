import './main.scss';
import React from 'react';
import App from './App';
import { createRoot } from "react-dom/client"

const root = createRoot(document.getElementById("root") as Element)
root.render(<App/>)
