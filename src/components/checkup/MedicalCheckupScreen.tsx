import React, { useState } from 'react';
import {
  Activity,
  Check,
  Home,
  ShieldCheck,
  Clock,
  Sparkles,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { MEDICAL_CHECKUP_PACKAGES } from '../../data/mockData';
import { MedicalCheckupPackage } from '../../types';

export const MedicalCheckupScreen: React.FC = () => {
  const { navigateTo, isRtl, t } = useApp();
  const [selectedPkg, setSelectedPkg] = useState<MedicalCheckupPackage | null>(null);
  const [isHomeSample, setIsHomeSample] = useState<boolean>(true);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const handleBookPackage = (pkg: MedicalCheckupPackage) => {
    setSelectedPkg(pkg);
  };

  const handleConfirmPackage = () => {
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setSelectedPkg(null);
      navigateTo('my_appointments');
    }, 1800);
  };

  return (
    <div id="medical-checkup-screen" className="flex flex-col min-h-full pb-20 bg-slate-50">
      <Header
        title="Medical Check-up"
        titleAr="الفحص الطبي الشامل"
        rightAction="none"
      />

      {/* Hero Banner */}
      <div className="px-5 pt-3">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-3xl p-4.5 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-white/20 text-sky-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-block mb-1.5">
              {t('PREVENTIVE HEALTHCARE', 'الرعاية الوقائية')}
            </span>
            <h2 className="text-base font-extrabold leading-snug">
              {t('Early Detection, Lifetime Wellness', 'كشف مبكر لصحة تدوم')}
            </h2>
            <p className="text-xs text-blue-100/90 mt-1 max-w-[270px]">
              {t('Comprehensive laboratory packages with home nurse sampling & digital doctor consultation.', 'باقات تحاليل شاملة مع خدمة سحب العينات المنزلية واستشارة الطبيب رقمياً.')}
            </p>
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Packages List */}
      <div className="px-5 pt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {t('Available Health Packages', 'باقات الفحوصات المتاحة')}
          </h3>
          <span className="text-xs font-semibold text-blue-600">
            {MEDICAL_CHECKUP_PACKAGES.length} {t('Packages', 'باقات')}
          </span>
        </div>

        {MEDICAL_CHECKUP_PACKAGES.map((pkg) => (
          <div
            key={pkg.id}
            id={`pkg-card-${pkg.id}`}
            className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md inline-block mb-1">
                  {pkg.includedTests.length} {t('Tests Included', 'فحصاً مخبرياً')}
                </span>
                <h4 className="text-sm font-bold text-slate-900">
                  {t(pkg.title, pkg.titleAr)}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t(pkg.description, pkg.descriptionAr)}
                </p>
              </div>
            </div>

            {/* Test Items Preview */}
            <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">
                {t('Package Covers', 'يشمل الفحص')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {(isRtl ? pkg.includedTestsAr : pkg.includedTests).slice(0, 4).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Home sample badge */}
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>{t('Free Home Nurse Sample Collection Available', 'متاح سحب العينات منزلياً مجاناً')}</span>
            </div>

            {/* Price & Book CTA */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">{t('Package Price', 'سعر الباقة')}</span>
                <span className="text-base font-extrabold text-blue-600">
                  {t(pkg.priceFormatted, pkg.priceFormattedAr)}
                </span>
              </div>

              <button
                onClick={() => handleBookPackage(pkg)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <span>{t('Book Package', 'حجز الفحص')}</span>
                <Chevron className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal Sheet */}
      {selectedPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end justify-center p-0">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto" />

            {isBooked ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('Check-up Package Booked!', 'تم تأكيد حجز الباقة!')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('Our medical team will contact you to confirm sample collection appointment.', 'سيتواصل معك الفريق الطبي لتحديد موعد سحب العينة.')}
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase">
                    {t('Confirm Check-up Booking', 'تأكيد حجز الفحص الشامل')}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {t(selectedPkg.title, selectedPkg.titleAr)}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t(selectedPkg.description, selectedPkg.descriptionAr)}
                  </p>
                </div>

                {/* Sampling Mode Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-2">
                    {t('Sample Collection Method', 'طريقة سحب العينات')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsHomeSample(true)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                        isHomeSample
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Home className="w-4 h-4 mb-1 text-blue-600" />
                      <span>{t('Home Nurse Visit', 'زيارة ممرض للمنزل')}</span>
                    </button>
                    <button
                      onClick={() => setIsHomeSample(false)}
                      className={`p-3 rounded-2xl border text-left text-xs font-bold transition-all ${
                        !isHomeSample
                          ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <Activity className="w-4 h-4 mb-1 text-blue-600" />
                      <span>{t('Visit Medical Lab', 'زيارة المختبر')}</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{t('Total Amount', 'المبلغ الإجمالي')}</span>
                  <span className="text-base font-extrabold text-blue-600">{t(selectedPkg.priceFormatted, selectedPkg.priceFormattedAr)}</span>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    onClick={() => setSelectedPkg(null)}
                    className="w-1/3 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {t('Cancel', 'إلغاء')}
                  </button>
                  <button
                    onClick={handleConfirmPackage}
                    className="w-2/3 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-sm"
                  >
                    {t('Confirm & Pay', 'تأكيد وحجز')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
