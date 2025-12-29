// app/components/ThemeToggle.js
'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-7 h-7 text-yellow-500 cursor-pointer" />
      ) : (
        <Moon className="w-7 h-7 text-shadow-gray-50 cursor-pointer" />
      )}
    </button>
  );
}