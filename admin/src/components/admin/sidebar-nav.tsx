'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CreditCard,
  ShieldCheck,
  Star,
  Settings,
  Rabbit,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/payments', label: 'Payments', icon: CreditCard },
  { href: '/verifications', label: 'Verifications', icon: ShieldCheck },
  { href: '/reviews', label: 'Reviews', icon: Star },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b">
        <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
          <Rabbit className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-none">DateRabbit</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
