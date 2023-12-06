import './main.scss';
import React from 'react';
import { createRoot } from "react-dom/client"
import App from './App';

const root = createRoot(document.getElementById("root") as Element)
// root.render(<App/>)

let content = `
# Hello world

> lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua

## Hello

lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua

## World

**lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua**
`
import EditorViewMilkdown from './ui/EditorViewMilkdown';
root.render(<EditorViewMilkdown fileName='alamakota.md' content={content}/>)
