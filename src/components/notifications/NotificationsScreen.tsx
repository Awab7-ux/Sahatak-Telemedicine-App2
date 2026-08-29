import React from 'react';
import {
  Bell,
  Calendar,
  Pill,
  MessageSquare,
  Sparkles,
  CheckCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    navigateTo,
    isRtl,
    t,
  } = useApp();

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const getIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'medicine':
      case 'prescription':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'chat':
        return <MessageSquare className="w-5 h-5 text-teal-600" />;
      default:
        return <Bell className="w-5 h-5 text-amber-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-blue-50';
      case 'medicine':
      case 'prescription':
        return 'bg-emerald-50';
      case 'chat':
        return 'bg-teal-50';
      default:
        return 'bg-amber-50';
    }
  };

  return (
    <div id="notifications-screen" className="flex flex-col min-h-full pb-20 bg-slate-50">
      <Header
        title="Notifications"
        titleAr="الإشعارات والتنبيهات"
        rightAction="none"
      />

      <div className="px-5 pt-3 pb-2 flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          {t('Stay updated on your appointments & health', 'تابع آخر مستجدات مواعيدك وصحتك')}
        </span>
        <button
          id="mark-all-read-btn"
          onClick={markAllNotificationsRead}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{t('Mark all as read', 'تحديد الكل كمقروء')}</span>
        </button>
      </div>

      <div className="px-5 pt-2 space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            id={`notif-${n.id}`}
            onClick={() => {
              markNotificationRead(n.id);
              if (n.actionScreen) navigateTo(n.actionScreen);
            }}
            className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              n.read
                ? 'bg-white border-slate-100 shadow-2xs'
                : 'bg-blue-50/40 border-blue-200/80 shadow-sm'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${getBgColor(n.type)}`}>
              {getIcon(n.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className={`text-xs font-bold ${n.read ? 'text-slate-800' : 'text-blue-950'}`}>
                  {t(n.title, n.titleAr)}
                </h4>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                )}
              </div>

              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                {t(n.message, n.messageAr)}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60">
                <span className="text-[10px] text-slate-400 font-medium">
                  {t(n.timestamp, n.timestampAr)}
                </span>
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5">
                  <span>{t('View', 'عرض')}</span>
                  <Chevron className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
