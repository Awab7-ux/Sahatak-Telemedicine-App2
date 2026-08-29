import React from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2, Bell, Globe } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  title?: string;
  titleAr?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: 'favorite' | 'notification' | 'share' | 'language' | 'none';
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  className?: string;
  transparent?: boolean;
  whiteText?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  titleAr,
  showBack = true,
  onBack,
  rightAction = 'none',
  isFavorite = false,
  onToggleFavorite,
  className = '',
  transparent = false,
  whiteText = false,
}) => {
  const { goBack, isRtl, lang, setLang, t, unreadNotificationsCount, navigateTo } = useApp();

  const handleBack = () => {
    if (onBack) onBack();
    else goBack();
  };

  const BackIcon = isRtl ? ChevronRight : ChevronLeft;

  return (
    <header
      id="app-screen-header"
      className={`px-4 py-3.5 flex items-center justify-between shrink-0 z-30 transition-colors ${
        transparent
          ? 'bg-transparent'
          : 'bg-white/95 backdrop-blur-md border-b border-slate-100'
      } ${className}`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {showBack && (
          <button
            id="header-back-button"
            onClick={handleBack}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors active:scale-95 ${
              whiteText
                ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="Back"
          >
            <BackIcon className="w-5 h-5" />
          </button>
        )}
        {title && (
          <h1
            id="header-title"
            className={`text-lg font-bold truncate ${
              whiteText ? 'text-white' : 'text-slate-900'
            }`}
          >
            {titleAr ? t(title, titleAr) : title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        {rightAction === 'favorite' && (
          <button
            id="header-fav-button"
            onClick={onToggleFavorite}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isFavorite
                ? 'bg-rose-50 text-rose-500'
                : whiteText
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-label="Favorite"
          >
            <Heart className={`w-4.5 h-4.5 ${isFavorite ? 'fill-rose-500 stroke-rose-500' : ''}`} />
          </button>
        )}

        {rightAction === 'share' && (
          <button
            id="header-share-button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'Sahatak Healthcare', url: window.location.href });
              }
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              whiteText
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-label="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        )}

        {rightAction === 'notification' && (
          <button
            id="header-notification-button"
            onClick={() => navigateTo('notifications')}
            className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-colors ${
              whiteText
                ? 'bg-white/20 text-white hover:bg-white/30'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
            )}
          </button>
        )}

        {rightAction === 'language' && (
          <button
            id="header-lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
