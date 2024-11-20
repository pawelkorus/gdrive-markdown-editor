import React, { createContext, useContext, useState, ReactNode, PropsWithChildren, SetStateAction, Dispatch } from 'react';

export interface CommandPaletteContextState {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
}

export const CommandPaletteContext = createContext<CommandPaletteContextState>({ isVisible: false, setIsVisible: (arg) => arg });
