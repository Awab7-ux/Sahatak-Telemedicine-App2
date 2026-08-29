import React from 'react';
import {
  Smartphone,
  Maximize,
  Globe,
  Wifi,
  Battery,
  Signal,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BottomNav } from './BottomNav';
import { ScreenType } from '../../types';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  const {
    screen,
    navigateTo,
    lang,
    setLang,
    isRtl,
    t,
    frameMode,
    setFrameMode,
  } = useApp();

  const screenOptions: { id: ScreenType; labelEn: string; labelAr: string }[] = [
    { id: 'home', labelEn: '1. Home Dashboard', labelAr: '1. الرئيسية' },
    { id: 'doctors', labelEn: '2. Find Doctor / Categories', labelAr: '2. البحث عن طبيب' },
    { id: 'doctor_detail', labelEn: '3. Doctor Details & Schedule', labelAr: '3. تفاصيل الطبيب والمواعيد' },
    { id: 'booking', labelEn: '4. Booking & Payment Flow', labelAr: '4. حجز الموعد والدفع' },
    { id: 'video_consultation', labelEn: '5. Video Telemedicine Call', labelAr: '5. مكالمة استشارة مرئية' },
    { id: 'chat_doctor', labelEn: '6. Chat with Doctor & Rx', labelAr: '6. المحادثة والروشتة' },
    { id: 'pharmacy', labelEn: '7. Pharmacy Marketplace', labelAr: '7. صيدلية صحتك' },
    { id: 'medicine_detail', labelEn: '8. Medicine Details', labelAr: '8. تفاصيل الدواء' },
    { id: 'cart', labelEn: '9. Cart & Delivery Checkout', labelAr: '9. السلة والتوصيل' },
    { id: 'clinics_map', labelEn: '10. Hospitals & Clinics Map', labelAr: '10. خريطة المستشفيات' },
    { id: 'medical_checkup', labelEn: '11. Medical Check-up Packages', labelAr: '11. الفحص الشامل' },
    { id: 'medical_records', labelEn: '12. Medical Records & PDF', labelAr: '12. السجلات الطبية' },
    { id: 'my_appointments', labelEn: '13. My Appointments', labelAr: '13. مواعيدي' },
    { id: 'notifications', labelEn: '14. Notifications Center', labelAr: '14. الإشعارات' },
    { id: 'profile', labelEn: '15. Profile & Health Vitals', labelAr: '15. الملف الصحي' },
  ];

  const hideBottomNav = screen === 'video_consultation';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start sm:p-4 md:p-6 select-none">
      {/* Top Demo Utility Bar */}
      <header className="w-full max-w-5xl mb-4 px-4 py-2.5 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-white shadow-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black tracking-tight text-white">Sahatak</h1>
              <span className="text-sm font-bold text-sky-400 font-arabic">صحتك</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {t('Telemedicine & Healthcare Super-App', 'تطبيق الرعاية الطبية والاستشارات')}
            </p>
          </div>
        </div>

        {/* Quick Screen Switcher Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={screen}
              onChange={(e) => navigateTo(e.target.value as ScreenType)}
              className="bg-slate-700/90 text-white text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {screenOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-slate-800 text-white">
                  {lang === 'ar' ? opt.labelAr : opt.labelEn}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="hidden sm:flex bg-slate-700/80 p-0.5 rounded-xl border border-slate-600">
            <button
              onClick={() => setFrameMode('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                frameMode === 'mobile'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile Device Mockup"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFrameMode('fluid')}
              className={`p-1.5 rounded-lg transition-colors ${
                frameMode === 'fluid'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fluid Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>

          {/* Language Switch Button */}
          <button
            id="global-lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-blue-500/40"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </header>

      {/* Main Container: Either iPhone Frame or Fluid Width Container */}
      <main
        className={`transition-all duration-300 w-full ${
          frameMode === 'mobile'
            ? 'max-w-[395px] h-[844px] rounded-[48px] ring-12 ring-slate-800/90 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-slate-700/50'
            : 'max-w-xl min-h-[844px] rounded-3xl shadow-2xl'
        } bg-white flex flex-col relative overflow-hidden`}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* iPhone Status Bar (Top) */}
        {frameMode === 'mobile' && (
          <div
            className={`w-full px-6 pt-3 pb-1 flex items-center justify-between shrink-0 z-40 select-none ${
              screen === 'video_consultation' || screen === 'doctor_detail'
                ? 'text-white'
                : 'text-slate-900'
            }`}
          >
            <span className="text-xs font-semibold tracking-tight">9:41</span>

            {/* Dynamic Island */}
            <div className="w-24 h-5 bg-black rounded-full mx-auto shadow-inner flex items-center justify-end px-2 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800" />
              <span className="w-2 h-2 rounded-full bg-blue-500/40" />
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Dynamic Screen Content with Independent Scrolling */}
        <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
          {children}
        </div>

        {/* Bottom Navigation (Fixed on Tabbed Screens) */}
        {!hideBottomNav && <BottomNav />}

        {/* iPhone Home Indicator Line */}
        {frameMode === 'mobile' && (
          <div className="w-full pb-2 pt-1 flex justify-center bg-white shrink-0 z-40 pointer-events-none">
            <div className="w-32 h-1 bg-slate-300 rounded-full" />
          </div>
        )}
      </main>
    </div>
  );
};
