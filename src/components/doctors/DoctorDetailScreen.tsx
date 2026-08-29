import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  Users,
  Award,
  CreditCard,
  MapPin,
  Calendar,
  Clock,
  Video,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DOCTORS } from '../../data/mockData';

export const DoctorDetailScreen: React.FC = () => {
  const {
    selectedDoctor,
    favorites,
    toggleFavoriteDoctor,
    navigateTo,
    setBookingDraft,
    isRtl,
    t,
  } = useApp();

  const doctor = selectedDoctor || DOCTORS[0];
  const isFav = favorites.includes(doctor.id);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(
    doctor.timeSlots.find((s) => s.available)?.time || doctor.timeSlots[0].time
  );

  const currentDay = doctor.availableDays[selectedDayIdx] || doctor.availableDays[0];

  const handleStartBooking = () => {
    setBookingDraft({
      doctorId: doctor.id,
      doctor: doctor,
      date: currentDay.fullDate,
      timeSlot: selectedTimeSlot,
      consultationType: 'video',
      consultationFee: doctor.fee,
      serviceFee: 2,
      totalFee: doctor.fee + 2,
    });
    navigateTo('booking');
  };

  return (
    <div id="doctor-detail-screen" className="flex flex-col min-h-full pb-24 bg-slate-50">
      {/* Top Header */}
      <Header
        title=""
        showBack={true}
        rightAction="favorite"
        isFavorite={isFav}
        onToggleFavorite={() => toggleFavoriteDoctor(doctor.id)}
        className="bg-transparent border-none absolute top-0 left-0 right-0 z-20"
        whiteText={true}
      />

      {/* Large Blue Doctor Profile Card Header (Matching reference) */}
      <div className="bg-gradient-to-b from-blue-700 via-blue-600 to-blue-800 text-white pt-16 pb-8 px-5 rounded-b-[36px] shadow-lg relative overflow-hidden">
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/30 shadow-xl mb-3.5 bg-blue-900/40">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-1.5 justify-center mb-1">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              {t(doctor.name, doctor.nameAr)}
            </h2>
            {doctor.isVerified && (
              <ShieldCheck className="w-5 h-5 text-sky-300 fill-sky-400 stroke-blue-800 shrink-0" />
            )}
          </div>

          <p className="text-sm font-semibold text-blue-100 mb-2">
            {t(doctor.specialty, doctor.specialtyAr)}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-blue-200">
            <div className="flex items-center gap-0.5 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300 stroke-amber-300" />
              <span className="font-bold text-white ml-0.5">{doctor.rating}</span>
            </div>
            <span>•</span>
            <span>({doctor.reviewsCount} {t('reviews', 'تقييم')})</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-blue-200" />
              <span className="truncate max-w-[150px]">{t(doctor.location, doctor.locationAr)}</span>
            </div>
          </div>
        </div>

        {/* Decorative background aura */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-sky-400/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 4 Information Cards (Experience, Patients, Rating, Fee) */}
      <div className="px-5 -mt-5 relative z-10">
        <div className="grid grid-cols-4 gap-2.5">
          {/* Card 1: Experience */}
          <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Award className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Experience', 'الخبرة')}</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">{doctor.experienceYears}+ {t('Years', 'سنوات')}</span>
          </div>

          {/* Card 2: Patients */}
          <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Patients', 'المرضى')}</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">{doctor.patientsCount}+</span>
          </div>

          {/* Card 3: Rating */}
          <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Rating', 'التقييم')}</span>
            <span className="text-xs font-bold text-slate-900 mt-0.5">{doctor.rating}</span>
          </div>

          {/* Card 4: Fee */}
          <div className="bg-white rounded-2xl p-2.5 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">{t('Fee', 'الكشف')}</span>
            <span className="text-[11px] font-extrabold text-blue-600 mt-0.5 truncate">{t(doctor.feeFormatted, doctor.feeFormattedAr)}</span>
          </div>
        </div>
      </div>

      {/* About Doctor Section */}
      <section className="px-5 pt-6">
        <h3 className="text-sm font-bold text-slate-900 mb-2">
          {t('About Doctor', 'نبذة عن الطبيب')}
        </h3>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs">
          <p className="text-xs text-slate-600 leading-relaxed">
            {t(doctor.about, doctor.aboutAr)}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{t('Associated with', 'مستشفى الممارسة')}:</span>
            </span>
            <span className="font-semibold text-slate-800">{t(doctor.clinicName, doctor.clinicNameAr)}</span>
          </div>
        </div>
      </section>

      {/* Available Schedule: Date Selector */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            {t('Available Schedule', 'المواعيد المتاحة')}
          </h3>
          <span className="text-xs font-semibold text-blue-600">October 2025</span>
        </div>

        {/* Horizontal Day/Date pills */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {doctor.availableDays.map((dayObj, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                key={dayObj.date}
                id={`date-pill-${idx}`}
                onClick={() => setSelectedDayIdx(idx)}
                className={`w-15 py-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-105'
                    : dayObj.available
                    ? 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                    : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60 cursor-not-allowed'
                }`}
                disabled={!dayObj.available}
              >
                <span className={`text-xs font-medium ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {t(dayObj.day, dayObj.dayAr)}
                </span>
                <span className={`text-sm font-extrabold mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {dayObj.date.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time Slots Selection */}
        <div className="mt-4 space-y-2.5">
          <p className="text-xs font-bold text-slate-700 mb-2">
            {t('Available Slots for', 'الأوقات المتاحة ليوم')} {t(currentDay.day, currentDay.dayAr)}, {currentDay.date}
          </p>

          {doctor.timeSlots.map((slot) => {
            const isSelected = selectedTimeSlot === slot.time;
            return (
              <button
                key={slot.time}
                id={`slot-btn-${slot.time.replace(/\s+/g, '-')}`}
                onClick={() => slot.available && setSelectedTimeSlot(slot.time)}
                disabled={!slot.available}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  isSelected && slot.available
                    ? 'bg-blue-50 border-blue-600 text-blue-900 ring-2 ring-blue-500/20 shadow-xs'
                    : slot.available
                    ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    : 'bg-slate-100/70 border-slate-200 text-slate-400 cursor-not-allowed opacity-65'
                }`}
              >
                <div className="flex items-center gap-2.5 font-semibold">
                  <Clock className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{slot.time}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      slot.available ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold ${
                      slot.available ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {slot.available ? t('Available', 'متاح') : t('Booked', 'محجوز')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Sticky Bottom Action Bar */}
      <div
        id="doctor-detail-cta-bar"
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-5 py-3.5 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-400 font-medium block">
              {t('Total Consultation', 'إجمالي الكشف')}
            </span>
            <span className="text-base font-extrabold text-blue-600">
              {t(doctor.feeFormatted, doctor.feeFormattedAr)}
            </span>
          </div>

          <button
            id="doctor-detail-book-btn"
            onClick={handleStartBooking}
            className="flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all text-center"
          >
            {t('Book Appointment', 'تأكيد وحجز الموعد')}
          </button>
        </div>
      </div>
    </div>
  );
};
