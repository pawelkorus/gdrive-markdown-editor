import './main.scss';
import React from 'react';
import { createRoot } from "react-dom/client"

const root = createRoot(document.getElementById("root") as Element)
// import App from './App';
// root.render(<App/>)

const sampleMarkdown = `
# Heading 1
## Heading 2
### Heading 3

- List item 1
- List item 2
- List item 3

**Bold text**

*Italic text*

[Link](https://www.example.com)

\`\`\`javascript
function helloWorld() {
    console.log("Hello, World!");
}
\`\`\`

> Blockquote

![Image](https://www.example.com/image.jpg)
`;

import { EditorView } from './ui';
root.render(<EditorView fileName="Sample.md" content={sampleMarkdown} />)


