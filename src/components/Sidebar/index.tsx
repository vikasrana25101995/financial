'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { useSidebar } from './CORE/hooks';
import { NAV_ITEMS } from './CORE/constants';
import styles from './STYLE/index.module.scss';
import { useAuth } from '@/lib/auth-context';

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, isDark, toggleTheme, toggleMobileMenu, closeMobileMenu } = useSidebar();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed top-4 left-4 z-50 p-2 bg-card rounded-md border border-border lg:hidden shadow-sm"
        aria-label="Toggle Navigation Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Wrapper */}
      <aside
        className={`${styles.sidebar} fixed inset-y-0 left-0 z-45 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:flex lg:h-screen lg:z-auto`}
      >
        {/* Sidebar Header */}
        <div className={styles.sidebar__header}>
          <Link href="/" className={styles.sidebar__logo} onClick={closeMobileMenu}>
            🪙 AntiGravity Finance
          </Link>
        </div>

        {/* Sidebar Navigation */}
        <nav className={styles.sidebar__nav}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`${styles.sidebar__item} ${
                  isActive ? styles['sidebar__item--active'] : ''
                }`}
              >
                <Icon className={styles.sidebar__icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={styles.sidebar__footer}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5" />}
            <span className="text-sm font-medium lg:hidden xl:inline">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>

          {/* User Status / Profile Mock */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground lg:hidden xl:inline">
              {user?.fullName || 'John Doe'}
            </span>
            <button
              onClick={async () => {
                const res = await logout();
                if (res.success) {
                  // toast is triggered inside logout or we can show success
                }
              }}
              className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Log Out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
