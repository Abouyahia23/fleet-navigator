import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ColorScheme = 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'teal';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const colorSchemes: Record<ColorScheme, { primary: string; accent: string; sidebar: string }> = {
  blue: {
    primary: '215 80% 45%',
    accent: '25 95% 55%',
    sidebar: '215 25% 12%',
  },
  green: {
    primary: '145 65% 40%',
    accent: '38 92% 50%',
    sidebar: '145 25% 12%',
  },
  orange: {
    primary: '25 95% 50%',
    accent: '215 80% 50%',
    sidebar: '25 30% 12%',
  },
  purple: {
    primary: '270 70% 50%',
    accent: '330 80% 55%',
    sidebar: '270 30% 12%',
  },
  red: {
    primary: '0 75% 50%',
    accent: '38 92% 50%',
    sidebar: '0 25% 12%',
  },
  teal: {
    primary: '175 70% 40%',
    accent: '25 95% 55%',
    sidebar: '175 30% 12%',
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('theme') as Theme;
    return stored || 'system';
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const stored = localStorage.getItem('colorScheme') as ColorScheme;
    return stored || 'blue';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;

    // Determine resolved theme
    let resolved: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      resolved = theme;
    }

    setResolvedTheme(resolved);

    // Apply dark class
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    // Apply color scheme
    const scheme = colorSchemes[colorScheme];
    root.style.setProperty('--primary', scheme.primary);
    root.style.setProperty('--ring', scheme.primary);
    root.style.setProperty('--sidebar-background', scheme.sidebar);
    root.style.setProperty('--sidebar-primary', scheme.primary);
    root.style.setProperty('--sidebar-ring', scheme.primary);

    // Store preferences
    localStorage.setItem('theme', theme);
    localStorage.setItem('colorScheme', colorScheme);
  }, [theme, colorScheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const resolved = mediaQuery.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export { colorSchemes };
export type { ColorScheme, Theme };
