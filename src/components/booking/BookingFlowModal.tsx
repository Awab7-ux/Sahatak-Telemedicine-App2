import React, { useState } from 'react';
import {
  Video,
  PhoneCall,
  MessageSquare,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  CreditCard,
  Wallet,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { ConsultationType, Appointment } from '../../types';
import { DOCTORS } from '../../data/mockData';

export const BookingFlowModal: React.FC = () => {
  const {
    bookingDraft,
    setBookingDraft,
    addAppointment,
    navigateTo,
    user,
    isRtl,
    t,
  } = useApp();

  const doctor = bookingDraft.doctor || DOCTORS[0];

  const [step, setStep] = useState<number>(1);
  const [selectedType, setSelectedType] = useState<ConsultationType>(bookingDraft.consultationType || 'video');
  const [symptoms, setSymptoms] = useState<string>('Mild discomfort & general check consultation');
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card' | 'wallet' | 'cash'>('card');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedApt, setConfirmedApt] = useState<Appointment | null>(null);

  const consultationTypes: {
    type: ConsultationType;
    titleEn: string;
    titleAr: string;
    descEn: string;
    descAr: string;
    icon: React.ComponentType<{ className?: string }>;
    tag: string;
  }[] = [
    {
      type: 'video',
      titleEn: 'Video Consultation',
      titleAr: 'استشارة فيديو مرئية',
      descEn: 'HD live video call with digital prescription',
      descAr: 'مكالمة فيديو عالية الدقة مع وصفة طبية فورية',
      icon: Video,
      tag: 'Recommended',
    },
    {
      type: 'chat',
      titleEn: 'Chat Consultation',
      titleAr: 'محادثة نصية مباشرة',
      descEn: 'Live chat, send photos & test reports',
      descAr: 'محادثة مباشرة مع إمكانية إرفاق التحاليل والصور',
      icon: MessageSquare,
      tag: 'Fastest',
    },
    {
      type: 'audio',
      titleEn: 'Audio Consultation',
      titleAr: 'استشارة صوتية هاتفية',
      descEn: 'Clear voice call with your specialist',
      descAr: 'مكالمة صوتية مباشرة مع طبيبك المختص',
      icon: PhoneCall,
      tag: 'Voice Only',
    },
    {
      type: 'clinic',
      titleEn: 'In-person Clinic Visit',
      titleAr: 'زيارة سريرية للعيادة',
      descEn: 'Physical examination at the medical center',
      descAr: 'فحص سريري مباشر في المركز الطبي',
      icon: Building2,
      tag: 'Clinic',
    },
  ];

  const handleConfirmBooking = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const newApt: Appointment = {
        id: `APT-${Math.floor(10000 + Math.random() * 90000)}`,
        doctorId: doctor.id,
        doctor: doctor,
        date: bookingDraft.date || doctor.availableDays[0].fullDate,
        timeSlot: bookingDraft.timeSlot || doctor.timeSlots[0].time,
        consultationType: selectedType,
        status: 'upcoming',
        patientName: user.name,
        patientAge: user.age,
        patientGender: user.gender,
        symptoms: symptoms,
        consultationFee: doctor.fee,
        serviceFee: 2,
        totalFee: doctor.fee + 2,
        formattedFee: doctor.feeFormatted,
        formattedFeeAr: doctor.feeFormattedAr,
        bookedAt: new Date().toISOString(),
        meetingLink: `https://sahatak.health/room/${Date.now()}`,
      };

      addAppointment(newApt);
      setConfirmedApt(newApt);
      setIsProcessing(false);
      setStep(3); // Success confirmation step
    }, 1200);
  };

  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  return (
    <div id="booking-flow-screen" className="flex flex-col min-h-full pb-20 bg-slate-50">
      <Header
        title={step === 3 ? t('Booking Confirmed', 'تم تأكيد الحجز') : t('Review Appointment', 'تأكيد وحجز الموعد')}
        showBack={step !== 3}
        onBack={() => {
          if (step > 1 && step < 3) setStep(step - 1);
          else navigateTo('doctor_detail', { doctor });
        }}
      />

      {/* Progress step indicators */}
      {step < 3 && (
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              1
            </div>
            <span className="text-xs font-semibold text-slate-800">{t('Details', 'البيانات')}</span>
          </div>
          <div className="w-12 h-0.5 bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              2
            </div>
            <span className="text-xs font-semibold text-slate-800">{t('Payment', 'الدفع')}</span>
          </div>
        </div>
      )}

      {/* Step 1: Consultation Type & Patient Info */}
      {step === 1 && (
        <div className="px-5 py-4 space-y-4">
          {/* Doctor Summary Pill */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-2xs flex items-center gap-3">
            <img
              src={doctor.avatar}
              alt={doctor.name}
              className="w-13 h-13 rounded-xl object-cover bg-slate-100 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {t(doctor.name, doctor.nameAr)}
              </h4>
              <p className="text-xs text-slate-500 truncate">
                {t(doctor.specialty, doctor.specialtyAr)}
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mt-0.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{bookingDraft.date || doctor.availableDays[0].fullDate}</span>
                <span>•</span>
                <span>{bookingDraft.timeSlot || doctor.timeSlots[0].time}</span>
              </div>
            </div>
          </div>

          {/* Consultation Type Selection */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">
              {t('Select Consultation Type', 'نوع الاستشارة الطبية')}
            </h3>
            <div className="space-y-2.5">
              {consultationTypes.map((item) => {
                const isSelected = selectedType === item.type;
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    id={`type-btn-${item.type}`}
                    onClick={() => setSelectedType(item.type)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                          {t(item.titleEn, item.titleAr)}
                        </h4>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t(item.descEn, item.descAr)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patient Details & Reason */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              {t('Patient Notes & Symptoms', 'وصف الحالة والأعراض')}
            </h3>
            <div className="bg-white rounded-2xl p-3.5 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2.5 border-b border-slate-100">
                <span className="text-slate-500">{t('Patient Name', 'اسم المريض')}:</span>
                <span className="font-bold text-slate-900">{t(user.name, user.nameAr)} ({user.age} {t('yrs', 'سنة')})</span>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  {t('Describe your symptoms or primary concern:', 'يرجى كتابة وصف مختصر للأعراض أو سبب الاستشارة:')}
                </label>
                <textarea
                  id="booking-symptoms-input"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs text-slate-900 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none"
                  placeholder={t('e.g. tooth sensitivity, headache, fatigue...', 'مثال: حساسية الأسنان، صداع مستمر، إرهاق...')}
                />
              </div>
            </div>
          </div>

          <button
            id="proceed-payment-btn"
            onClick={() => setStep(2)}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-sm font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            <span>{t('Continue to Payment', 'المتابعة للدفع')}</span>
            <Arrow className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Step 2: Payment & Cost Summary */}
      {step === 2 && (
        <div className="px-5 py-4 space-y-4">
          {/* Payment Method Selector */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2.5">
              {t('Payment Method', 'طريقة الدفع')}
            </h3>
            <div className="space-y-2">
              <button
                id="pay-card"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block">
                      {t('Credit / Mada / Debit Card', 'بطاقة مدى / ائتمانية')}
                    </span>
                    <span className="text-[10px] text-slate-400">•••• •••• •••• 4421</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                  {paymentMethod === 'card' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>

              <button
                id="pay-apple"
                onClick={() => setPaymentMethod('apple_pay')}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-xs">
                    Pay
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block">Apple Pay</span>
                    <span className="text-[10px] text-slate-400">{t('Instant & secure checkout', 'دفع فوري وآمن بضغطة زر')}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'apple_pay' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                  {paymentMethod === 'apple_pay' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>

              <button
                id="pay-wallet"
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                  paymentMethod === 'wallet'
                    ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-bold text-slate-900 block">
                      {t('Sahatak Health Wallet', 'محفظة صحتك الرقمية')}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{t('Balance: SAR 450.00', 'الرصيد: 450.00 ر.س')}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'}`}>
                  {paymentMethod === 'wallet' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              {t('Payment Summary', 'تفاصيل الفاتورة')}
            </h3>
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('Consultation Fee', 'رسوم الكشف')}</span>
                <span className="font-semibold text-slate-900">{t(doctor.feeFormatted, doctor.feeFormattedAr)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('Telemedicine Service Fee', 'رسوم الخدمة الرقمية')}</span>
                <span className="font-semibold text-emerald-600">{t('FREE', 'مجاناً')}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>{t('VAT (15% Included)', 'ضريبة القيمة المضافة (مشمولة)')}</span>
                <span className="font-semibold text-slate-900">{t('Included', 'مشمولة')}</span>
              </div>
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">{t('Total Amount', 'المجموع الكلي')}</span>
                <span className="font-extrabold text-blue-600">{t(doctor.feeFormatted, doctor.feeFormattedAr)}</span>
              </div>
            </div>
          </div>

          {/* Secure badge */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('Your payment is encrypted and 100% secure', 'جميع عمليات الدفع مشفرة ومحمية بنسبة 100%')}</span>
          </div>

          <button
            id="pay-now-btn"
            onClick={handleConfirmBooking}
            disabled={isProcessing}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-75 text-white text-sm font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t('Processing payment...', 'جارٍ معالجة الدفع...')}</span>
              </div>
            ) : (
              <span>{t('Pay & Confirm Appointment', 'ادفع الآن وأكد الموعد')}</span>
            )}
          </button>
        </div>
      )}

      {/* Step 3: Success Confirmation Ticket */}
      {step === 3 && confirmedApt && (
        <div className="px-5 py-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <h2 className="text-lg font-extrabold text-slate-900">
            {t('Appointment Confirmed!', 'تم تأكيد موعدك بنجاح!')}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-[260px]">
            {t('We sent a confirmation SMS & calendar invite to your phone.', 'تم إرسال رسالة تأكيد وتذكرة الموعد إلى هاتفك.')}
          </p>

          {/* Ticket Card */}
          <div className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-md mt-5 text-left space-y-3.5 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-200">
              <div>
                <span className="text-[10px] text-slate-400 font-bold block">{t('APPOINTMENT ID', 'رقم الموعد')}</span>
                <span className="text-xs font-mono font-bold text-blue-600">{confirmedApt.id}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold">
                {t('Confirmed', 'مؤكد')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="w-12 h-12 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t(doctor.name, doctor.nameAr)}</h4>
                <p className="text-xs text-slate-500">{t(doctor.specialty, doctor.specialtyAr)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">{t('Date', 'التاريخ')}</span>
                <span className="font-bold text-slate-800">{confirmedApt.date}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl">
                <span className="text-[10px] text-slate-400 block">{t('Time', 'الوقت')}</span>
                <span className="font-bold text-slate-800">{confirmedApt.timeSlot.split('-')[0]}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="w-full space-y-2.5 mt-6">
            <button
              id="confirm-join-now-btn"
              onClick={() => navigateTo('video_consultation', { appointment: confirmedApt })}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>{t('Join Video Room Now', 'دخول غرفة الاستشارة الآن')}</span>
            </button>

            <button
              onClick={() => navigateTo('my_appointments')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
            >
              {t('View My Appointments', 'عرض قائمة مواعيدي')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
