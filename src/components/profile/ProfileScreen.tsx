import React, { useState } from 'react';
import {
  User,
  Heart,
  FileText,
  CreditCard,
  Globe,
  Bell,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Activity,
  Droplet,
  Scale,
  Ruler,
  ShieldCheck,
  Edit2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const ProfileScreen: React.FC = () => {
  const { user, updateUser, lang, setLang, navigateTo, isRtl, t } = useApp();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>(user.name);
  const [phoneInput, setPhoneInput] = useState<string>(user.phone);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const handleSaveProfile = () => {
    updateUser({ name: nameInput, phone: phoneInput });
    setIsEditing(false);
  };

  return (
    <div id="profile-screen" className="flex flex-col min-h-full pb-24 bg-slate-50">
      <Header
        title="My Profile"
        titleAr="الملف الطبي والشخصي"
        rightAction="language"
      />

      {/* User Header Profile Card */}
      <div className="px-5 pt-3">
        <div className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-blue-50 bg-slate-100 shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs text-xs"
              aria-label="Edit Profile"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full p-1 text-xs border rounded-lg"
                />
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full p-1 text-xs border rounded-lg"
                />
                <button
                  onClick={handleSaveProfile}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold"
                >
                  {t('Save', 'حفظ')}
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    {t(user.name, user.nameAr)}
                  </h2>
                  <ShieldCheck className="w-4 h-4 text-blue-600 fill-blue-100" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user.phone}</p>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                  {user.insuranceProvider} • VIP
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Health Vitals Summary (4 columns) */}
      <div className="px-5 pt-3">
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white p-2.5 rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-1">
              <Droplet className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Blood', 'الفصيلة')}</span>
            <span className="text-xs font-bold text-slate-900">{user.bloodGroup}</span>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Weight', 'الوزن')}</span>
            <span className="text-xs font-bold text-slate-900">{user.weight}</span>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1">
              <Ruler className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Height', 'الطول')}</span>
            <span className="text-xs font-bold text-slate-900">{user.height}</span>
          </div>

          <div className="bg-white p-2.5 rounded-2xl border border-slate-100 text-center shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-1">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Age', 'العمر')}</span>
            <span className="text-xs font-bold text-slate-900">{user.age} {t('yrs', 'سنة')}</span>
          </div>
        </div>
      </div>

      {/* Insurance Card Banner */}
      <div className="px-5 pt-3">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-4 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold tracking-widest text-sky-300 uppercase">HEALTH INSURANCE</span>
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">100% COVERED</span>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold">{t(user.name, user.nameAr)}</p>
            <p className="text-[11px] font-mono text-blue-200">Policy: {user.insurancePolicyNumber}</p>
          </div>
          <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
            <span>Provider: {user.insuranceProvider}</span>
            <span>Expiry: 12/2026</span>
          </div>
        </div>
      </div>

      {/* Settings & Navigation Options */}
      <div className="px-5 pt-4 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          {t('Medical & Account', 'الخدمات والحساب')}
        </h3>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          <button
            onClick={() => navigateTo('medical_records')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('My Medical Records & Prescriptions', 'السجلات الطبية والروشتات')}
              </span>
            </div>
            <Chevron className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigateTo('my_appointments')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('Appointment History & Consultations', 'سجل المواعيد والاستشارات')}
              </span>
            </div>
            <Chevron className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigateTo('doctors')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('Favorite Doctors & Specialists', 'الأطباء المفضلون')}
              </span>
            </div>
            <Chevron className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigateTo('notifications')}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('Notifications & Dose Reminders', 'الإشعارات وتنبيهات الأدوية')}
              </span>
            </div>
            <Chevron className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* App Preferences */}
      <div className="px-5 pt-3 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          {t('App Settings', 'إعدادات التطبيق')}
        </h3>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs divide-y divide-slate-100 overflow-hidden">
          {/* Language toggle row */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('Language / اللغة', 'اللغة / Language')}
              </span>
            </div>
            <button
              id="profile-lang-switch"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-full transition-colors"
            >
              {lang === 'en' ? 'العربية (Arabic)' : 'English (الإنجليزية)'}
            </button>
          </div>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                {t('24/7 Patient Help & Support', 'الدعم الفني والمساعدة 24/7')}
              </span>
            </div>
            <span className="text-[11px] font-bold text-blue-600">937</span>
          </div>

          <button
            onClick={() => alert(t('Logged out successfully.', 'تم تسجيل الخروج بنجاح.'))}
            className="w-full p-3.5 flex items-center justify-between text-rose-600 hover:bg-rose-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <LogOut className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">
                {t('Log Out', 'تسجيل الخروج')}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
