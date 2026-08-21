import React from 'react';
import { AppNotification } from '@koti-scout/shared';
import { Bell, CheckCheck, TrendingDown, Sparkles, Building, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface NotificationsPageProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenProperty?: (propId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenProperty
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time feed of detected price cuts, new listings matching your criteria, and score milestones.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={onMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-1 text-emerald-600" />
            <span>Mark all as read ({unreadCount})</span>
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/90 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto shadow-sm space-y-3">
          <Bell className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No notifications yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When automated searches detect price drops or new properties, alerts will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 overflow-hidden shadow-sm">
          {notifications.map((n) => {
            const timeStr = new Date(n.createdAt).toLocaleString('fi-FI', {
              timeZone: 'Europe/Helsinki'
            });

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.read) onMarkRead(n.id);
                  if (n.propertyId && onOpenProperty) onOpenProperty(n.propertyId);
                }}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors cursor-pointer hover:bg-slate-50 dark:bg-slate-950/80 ${
                  !n.read ? 'bg-emerald-50/30' : ''
                }`}
              >
                {/* Icon type */}
                <div className="mt-1 p-2 rounded-xl bg-emerald-100 text-emerald-700 flex-shrink-0">
                  {n.type === 'PRICE_DROP' ? (
                    <TrendingDown className="w-5 h-5 text-emerald-600" />
                  ) : n.type === 'HIGH_SCORE_PROPERTY' ? (
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Building className="w-5 h-5 text-emerald-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">{timeStr}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                  {n.propertyAddress && (
                    <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span>{n.propertyAddress}</span>
                      {n.propertyPrice && (
                        <span>• €{n.propertyPrice.toLocaleString('fi-FI')}</span>
                      )}
                      {n.propertyScore && <span>• Match {n.propertyScore}/100</span>}
                    </div>
                  )}
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
