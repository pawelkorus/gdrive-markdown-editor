import './main.scss';
import React from 'react';
import { createRoot } from "react-dom/client"

const root = createRoot(document.getElementById("root") as Element)
// import App from './App';
// root.render(<App/>)

import { MilkdownProvider } from '@milkdown/react';
import { ProsemirrorAdapterProvider } from '@prosemirror-adapter/react';
import { EditorView } from './ui';

const generateSampleMarkdown = `# My Markdown Document

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae mauris euismod, aliquet nunc id, lacinia nunc. Nulla facilisi. Sed euismod, nisl in ultricies tincidunt, velit nunc tincidunt nunc, id aliquam nunc nunc id nunc. Sed id nunc id nunc aliquam nunc id nunc.

## Section 1

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae mauris euismod, aliquet nunc id, lacinia nunc. Nulla facilisi. Sed euismod, nisl in ultricies tincidunt, velit nunc tincidunt nunc, id aliquam nunc nunc id nunc. Sed id nunc id nunc aliquam nunc id nunc.

## Section 2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae mauris euismod, aliquet nunc id, lacinia nunc. Nulla facilisi. Sed euismod, nisl in ultricies tincidunt, velit nunc tincidunt nunc, id aliquam nunc nunc id nunc. Sed id nunc id nunc aliquam nunc id nunc.
`;

root.render(
<MilkdownProvider>
                    <ProsemirrorAdapterProvider>
                        <EditorView 
                                fileName="alamakota2.md"
                                content={generateSampleMarkdown} 
                            />
                    </ProsemirrorAdapterProvider>
                </MilkdownProvider>
)
