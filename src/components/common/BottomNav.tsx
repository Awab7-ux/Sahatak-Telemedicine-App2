import React from 'react';
import { Home, MessageSquare, ShoppingCart, Calendar, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BottomNavTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, cartCount, unreadNotificationsCount, isRtl, t } = useApp();

  const tabs: { id: BottomNavTab; labelEn: string; labelAr: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', labelEn: 'Home', labelAr: 'الرئيسية', icon: Home },
    { id: 'messages', labelEn: 'Messages', labelAr: 'الرسائل', icon: MessageSquare },
    { id: 'cart', labelEn: 'Cart', labelAr: 'السلة', icon: ShoppingCart },
    { id: 'history', labelEn: 'History', labelAr: 'مواعيدي', icon: Calendar },
    { id: 'profile', labelEn: 'Profile', labelAr: 'حسابي', icon: User },
  ];

  return (
    <div
      id="bottom-nav-bar"
      className="bg-white border-t border-slate-100 px-3 py-2 flex items-center justify-around z-40 shrink-0 select-none shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        const badgeCount = tab.id === 'cart' ? cartCount : tab.id === 'messages' ? unreadNotificationsCount : 0;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 relative ${
              isActive ? 'text-blue-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              {badgeCount > 0 && (
                <span
                  id={`nav-badge-${tab.id}`}
                  className="absolute -top-1.5 -right-2 min-w-[17px] h-[17px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white"
                >
                  {badgeCount > 9 ? '9+' : badgeCount}
                </span>
              )}
            </div>
            <span className={`text-[11px] mt-1 tracking-tight ${isActive ? 'font-bold text-blue-600' : 'text-slate-500'}`}>
              {t(tab.labelEn, tab.labelAr)}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-0.5" />
            )}
          </button>
        );
      })}
    </div>
  );
};
