'use client';

import { useTheme } from './ThemeProvider';

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="theme-switcher">
      <select 
        value={theme} 
        onChange={(e) => setTheme(e.target.value)}
        className="theme-select"
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}
