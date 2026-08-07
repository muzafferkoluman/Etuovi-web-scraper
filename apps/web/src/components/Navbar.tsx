import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  Bell,
  SlidersHorizontal,
  Home,
  Scale,
  Sparkles,
  CheckCheck,
  TrendingDown,
  Building,
  Heart
} from 'lucide-react';
import { cn } from '../lib/utils';
import { AppNotification } from '@koti-scout/shared';

interface NavbarProps {
  notifications: AppNotification[];
  unreadCount: number;
  compareCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenNotificationProperty?: (propId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications,
  unreadCount,
  compareCount,
  onMarkRead,
  onMarkAllRead,
  onOpenNotificationProperty
}) => {
  const location = useLocation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/', icon: Home },
    { label: 'Search & Explore', path: '/search', icon: Compass },
    { label: 'Saved Searches', path: '/saved-searches', icon: Bookmark },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    {
      label: 'Compare',
      path: '/compare',
      icon: Scale,
      badge: compareCount > 0 ? compareCount : null
    },
    { label: 'Settings', path: '/settings', icon: SlidersHorizontal }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  KotiScout
                  <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                    FI
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 font-medium -mt-1">
                  Property Intelligence
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Notifications bell & Profile */}
          <div className="flex items-center gap-3">
            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Center Menu */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-900">
                        Notifications ({unreadCount} unread)
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => onMarkAllRead()}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        No notifications yet. Scheduled searches will notify you of price drops and new matches here.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) onMarkRead(n.id);
                            if (n.propertyId && onOpenNotificationProperty) {
                              onOpenNotificationProperty(n.propertyId);
                              setShowNotifMenu(false);
                            }
                          }}
                          className={cn(
                            'p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3 items-start',
                            !n.read && 'bg-emerald-50/40'
                          )}
                        >
                          <div className="mt-0.5 p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                            {n.type === 'PRICE_DROP' ? (
                              <TrendingDown className="w-4 h-4 text-emerald-600" />
                            ) : n.type === 'HIGH_SCORE_PROPERTY' ? (
                              <Sparkles className="w-4 h-4 text-amber-500" />
                            ) : (
                              <Building className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      View all notifications →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Timezone badge & Profile pill */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-medium text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Helsinki (EET)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors',
                isActive ? 'text-emerald-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-emerald-600 text-white text-[8px] font-bold">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </header>
  );
};
