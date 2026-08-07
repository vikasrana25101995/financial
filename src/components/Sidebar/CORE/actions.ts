export class SidebarActions {
  toggleMobileMenu(isOpen: boolean, setIsOpen: (val: boolean) => void) {
    setIsOpen(!isOpen);
  }

  toggleTheme() {
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('pf_theme', isDark ? 'dark' : 'light');
    }
  }

  initTheme() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('pf_theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
