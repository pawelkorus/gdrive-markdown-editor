import './main.scss';
import 'iconify-icon';
import React from 'react';
import { createRoot } from "react-dom/client"

// import App from './App';

const root = createRoot(document.getElementById("root") as Element)
// root.render(<App/>)

// import { EditorView } from './ui'
import { EditorViewProseMirror } from './ui';
root.render(<EditorViewProseMirror fileName='Alamakota' content='# test'/>)
