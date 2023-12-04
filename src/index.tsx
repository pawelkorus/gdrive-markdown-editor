import './main.scss';
import React from 'react';
import { createRoot } from "react-dom/client"
import EditorViewMilkdown from './ui/EditorViewMilkdown';

// import App from './App';

const root = createRoot(document.getElementById("root") as Element)
// root.render(<App/>)
root.render(<EditorViewMilkdown fileName='alamakota.md' content='> test'/>)
