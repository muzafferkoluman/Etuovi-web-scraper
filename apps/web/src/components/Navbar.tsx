import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  BookmarkCheck,
  Heart,
  Scale,
  Bell,
  Sparkles,
  LogOut,
  CheckCheck,
  TrendingDown,
  Building,
  Terminal,
  Activity,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { cn } from "../lib/utils";
import { AppNotification } from "@koti-scout/shared";

export interface NavbarProps {
  notifications?: AppNotification[];
  unreadCount?: number;
  compareCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onOpenNotificationProperty?: (propertyId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications = [],
  unreadCount = 0,
  compareCount = 0,
  onMarkRead = () => {},
  onMarkAllRead = () => {},
  onOpenNotificationProperty
}) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { path: "/", label: "Dashboard", icon: Sparkles },
    { path: "/search", label: "Explore", icon: Search },
    { path: "/saved-searches", label: "Saved Searches", icon: BookmarkCheck },
    { path: "/favorites", label: "Favorites", icon: Heart },
    {
      path: "/compare",
      label: "Compare",
      icon: Scale,
      badge: compareCount > 0 ? compareCount : undefined
    },
    { path: "/dev", label: "Dev Radar", icon: Terminal }
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-white font-mono">
                  KOTI<span className="text-emerald-400">SCOUT</span>
                </span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Etuovi Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                AI Finnish Real Estate Intelligence & Radar
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Bar Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative",
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-emerald-400" : "text-slate-400")} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls: Live Status, Bell, Profile */}
          <div className="flex items-center gap-3">
            
            {/* Live Feed Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-medium text-slate-300">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>EET (Helsinki)</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="relative p-2.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all focus:outline-none"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover Menu */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Live Notifications ({unreadCount})
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onMarkAllRead()}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No active notifications. Perodic searches will display live alerts here.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
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
                            "p-3.5 hover:bg-slate-800/50 cursor-pointer transition-colors flex gap-3 items-start",
                            !n.read && "bg-emerald-950/30"
                          )}
                        >
                          <div className="mt-0.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            {n.type === "PRICE_DROP" ? (
                              <TrendingDown className="w-4 h-4 text-emerald-400" />
                            ) : n.type === "HIGH_SCORE_PROPERTY" ? (
                              <Sparkles className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Building className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-bold text-slate-200 truncate">
                                {n.title}
                              </p>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              )}
                            </div>
                            <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
                    <Link
                      to="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      View all notification logs →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Pill */}
            <div className="hidden sm:block">
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-slate-200 max-w-[100px] truncate">
                      {user.fullName || user.email.split("@")[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 rounded-xl shadow-xl border border-slate-800 overflow-hidden z-50">
                      <div className="p-3 border-b border-slate-800 text-xs">
                        <p className="text-slate-400">Signed in as</p>
                        <p className="font-bold text-white truncate">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left p-3 text-xs font-bold text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav px-2 py-2 flex justify-around items-center border-t border-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-bold transition-all",
                isActive
                  ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full bg-emerald-500 text-slate-950 text-[8px] font-black">
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
