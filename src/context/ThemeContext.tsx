import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SharedPreferences } from '../utilities/SharedPreferences';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: (transparent?: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  // Load initial theme
  useEffect(() => {
    const loadInitialTheme = async () => {
      try {
        const savedTheme = await SharedPreferences.getTheme();
        console.log("Initial theme loaded:", savedTheme);
        if (savedTheme) {
          setIsDark(savedTheme === 'dark');
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadInitialTheme();
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!isThemeLoaded) return;

    const applyTheme = async () => {
      try {
        document.body.classList.toggle('dark-theme', isDark);
        await SharedPreferences.setTheme(isDark ? 'dark' : 'light');
        console.log("Theme applied:", isDark ? 'dark' : 'light');
      } catch (error) {
        console.error("Error applying theme:", error);
      }
    };
    applyTheme();
  }, [isDark, isThemeLoaded]);

  const toggleTheme = (transparent?: boolean) => {
    if (transparent !== undefined) {
      document.body.classList.toggle('transparent-theme', transparent);
    } else {
      setIsDark(prev => !prev);
    }
  };

  if (!isThemeLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 