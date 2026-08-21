import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  Bell,
  Sparkles,
  CheckCheck,
  TrendingDown,
  Building,
  LayoutDashboard,
  Globe,
  ChevronDown,
  Check
} from "lucide-react";
import { cn } from "../lib/utils";
import { AppNotification } from "@koti-scout/shared";
import { useTranslation, SUPPORTED_LANGUAGES, SupportedLanguage } from "../contexts/LanguageContext";

export interface NavbarProps {
  notifications?: AppNotification[];
  unreadCount?: number;
  compareCount?: number;
  favoritesCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onOpenNotificationProperty?: (propertyId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  notifications = [],
  unreadCount = 0,
  compareCount = 0,
  favoritesCount = 0,
  onMarkRead = () => {},
  onMarkAllRead = () => {},
  onOpenNotificationProperty
}) => {
  const location = useLocation();
  const { t, language, setLanguage, currentLanguageOption } = useTranslation();
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Simplified Clean Menu Items with i18n
  const navItems = [
    { path: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { path: "/search", label: t("nav.explore"), icon: Search },
    { 
      path: "/favorites", 
      label: t("nav.favorites"), 
      icon: Heart, 
      badge: favoritesCount > 0 ? favoritesCount : undefined 
    }
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
                  {t("nav.liveFeed")}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Lina&apos;s Property Intelligence Radar
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Bar */}
          <nav className="hidden md:flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 backdrop-blur-md">
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
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative",
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

          {/* Right Action Controls: Language Switcher, Notifications Bell, Lina Profile */}
          <div className="flex items-center gap-2.5">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/80 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all text-xs font-bold"
                aria-label="Change language"
              >
                <span className="text-sm">{currentLanguageOption.flag}</span>
                <span className="uppercase font-mono text-[11px]">{currentLanguageOption.code}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showLangMenu && (
                <div className="absolute right-0 mt-2 w-44 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 p-1.5">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Language</span>
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left",
                        language === lang.code
                          ? "bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20"
                          : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                      </div>
                      {language === lang.code && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
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
                        {t("nav.notifications")} ({unreadCount})
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => onMarkAllRead()}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        {t("nav.markAllRead")}
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        {t("nav.noNotifications")}
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
                      {t("nav.viewAll")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dedicated Lina Profile Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-emerald-500/30 text-xs font-bold text-slate-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-mono tracking-wide">Lina</span>
              <span className="text-emerald-400/80 font-semibold text-[11px] hidden sm:inline">• {t("nav.radarActive")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-nav px-3 py-2 flex justify-around items-center border-t border-slate-800">
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
                "flex flex-col items-center py-1 px-4 rounded-xl text-[10px] font-bold transition-all",
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
