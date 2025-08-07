import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    // Initialize theme on app load
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
};