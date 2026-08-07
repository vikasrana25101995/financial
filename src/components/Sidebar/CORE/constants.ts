import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Tv,
  TrendingUp,
  FileText,
  User,
  Scale
} from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/income', label: 'Income', icon: Wallet },
  { href: '/expenses', label: 'Spends & Expenses', icon: Receipt },
  { href: '/emi', label: 'EMIs', icon: Scale },
  { href: '/subscriptions', label: 'Subscriptions', icon: Tv },
  { href: '/investments', label: 'Investments', icon: TrendingUp },
  { href: '/reports', label: 'Reports & Analytics', icon: FileText },
  { href: '/profile', label: 'Profile', icon: User }
];
