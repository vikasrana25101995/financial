import { useState, useEffect } from 'react';
import { SidebarActions } from './actions';

export function useSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const actions = new SidebarActions();

  useEffect(() => {
    actions.initTheme();
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const handleToggleTheme = () => {
    actions.toggleTheme();
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  };

  const handleToggleMobileMenu = () => {
    actions.toggleMobileMenu(isOpen, setIsOpen);
  };

  return {
    isOpen,
    isDark,
    toggleTheme: handleToggleTheme,
    toggleMobileMenu: handleToggleMobileMenu,
    closeMobileMenu: () => setIsOpen(false)
  };
}
