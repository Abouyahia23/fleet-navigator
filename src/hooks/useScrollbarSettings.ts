import { createContext, useContext, useEffect, useState } from 'react';

export type ScrollbarMode = 'auto' | 'always' | 'thin';
export type ScrollbarColor = 'default' | 'primary' | 'accent' | 'muted';

interface ScrollbarSettings {
  mode: ScrollbarMode;
  color: ScrollbarColor;
  setMode: (mode: ScrollbarMode) => void;
  setColor: (color: ScrollbarColor) => void;
}

export function useScrollbarSettings() {
  const [mode, setModeState] = useState<ScrollbarMode>(() => {
    return (localStorage.getItem('scrollbarMode') as ScrollbarMode) || 'auto';
  });

  const [color, setColorState] = useState<ScrollbarColor>(() => {
    return (localStorage.getItem('scrollbarColor') as ScrollbarColor) || 'default';
  });

  const setMode = (m: ScrollbarMode) => {
    setModeState(m);
    localStorage.setItem('scrollbarMode', m);
  };

  const setColor = (c: ScrollbarColor) => {
    setColorState(c);
    localStorage.setItem('scrollbarColor', c);
  };

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all scrollbar classes
    root.classList.remove('scrollbar-auto', 'scrollbar-always', 'scrollbar-thin-mode');
    root.classList.remove('scrollbar-color-default', 'scrollbar-color-primary', 'scrollbar-color-accent', 'scrollbar-color-muted');
    
    // Apply mode
    root.classList.add(`scrollbar-${mode === 'thin' ? 'thin-mode' : mode}`);
    root.classList.add(`scrollbar-color-${color}`);
  }, [mode, color]);

  return { mode, color, setMode, setColor };
}
