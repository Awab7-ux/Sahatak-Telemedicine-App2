import React from 'react';
import {
  Search,
  Bell,
  MapPin,
  ChevronDown,
  Video,
  MessageSquare,
  ShoppingBag,
  Building2,
  Activity,
  Star,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DOCTOR_CATEGORIES } from '../../data/mockData';

export const HomeScreen: React.FC = () => {
  const {
    user,
    doctors,
    products,
    appointments,
    navigateTo,
    addToCart,
    isRtl,
    t,
    unreadNotificationsCount,
    setSearchQuery,
  } = useApp();

  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  // Find upcoming appointment if any
  const upcomingApt = appointments.find((a) => a.status === 'upcoming') || appointments[0];

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigateTo('doctors');
  };

  return (
    <div id="home-screen" className="flex flex-col pb-8">
      {/* Top Header & Greeting Bar */}
      <div className="bg-gradient-to-b from-blue-50/70 to-white px-5 pt-4 pb-3 border-b border-slate-100/60">
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full ring-2 ring-blue-500/20 overflow-hidden shadow-sm shrink-0 cursor-pointer"
              onClick={() => navigateTo('profile')}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">
                {t('Good morning,', 'صباح الخير،')}
              </p>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {t(user.name, user.nameAr)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="home-notifications-btn"
              onClick={() => navigateTo('notifications')}
              className="w-10 h-10 rounded-full bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 stroke-[1.8]" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>

        {/* Location selector dropdown */}
        <button
          id="home-location-btn"
          onClick={() => navigateTo('clinics_map')}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 rounded-xl text-xs font-medium border border-blue-100/60 transition-colors mb-3"
        >
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-blue-600 font-semibold">{t('My location at', 'موقعي الحالي في')}</span>
            <span className="text-slate-700 truncate">{t(user.location, user.locationAr)}</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        </button>

        {/* Top Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className={`w-4.5 h-4.5 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none`} />
            <input
              id="home-search-input"
              type="text"
              placeholder={t('What do you need help with?', 'بمَ يمكننا مساعدتك اليوم؟')}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => navigateTo('doctors')}
              className={`w-full py-3 ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all outline-hidden shadow-2xs`}
            />
          </div>
        </form>
      </div>

      {/* Services Grid Menu (Matching exact reference rounded pastel style) */}
      <section className="px-5 pt-5 pb-2">
        <div className="grid grid-cols-5 gap-2.5">
          {/* Service 1: Talk with Doctor */}
          <button
            id="service-talk-doctor"
            onClick={() => navigateTo('doctors')}
            className="flex flex-col items-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs group-hover:bg-blue-600 group-hover:text-white group-active:scale-95 transition-all">
              <Video className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center mt-2 leading-tight">
              {t('Talk with Doctor', 'استشارة طبيب')}
            </span>
          </button>

          {/* Service 2: Chat with Doctor */}
          <button
            id="service-chat-doctor"
            onClick={() => navigateTo('chat_doctor', { chatDoctor: doctors[0] })}
            className="flex flex-col items-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shadow-2xs group-hover:bg-teal-600 group-hover:text-white group-active:scale-95 transition-all">
              <MessageSquare className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center mt-2 leading-tight">
              {t('Chat with Doctor', 'محادثة طبيب')}
            </span>
          </button>

          {/* Service 3: Buy Medicine */}
          <button
            id="service-buy-medicine"
            onClick={() => navigateTo('pharmacy')}
            className="flex flex-col items-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shadow-2xs group-hover:bg-amber-600 group-hover:text-white group-active:scale-95 transition-all">
              <ShoppingBag className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center mt-2 leading-tight">
              {t('Buy Medicine', 'شراء أدوية')}
            </span>
          </button>

          {/* Service 4: Find Hospital */}
          <button
            id="service-find-hospital"
            onClick={() => navigateTo('clinics_map')}
            className="flex flex-col items-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs group-hover:bg-indigo-600 group-hover:text-white group-active:scale-95 transition-all">
              <Building2 className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center mt-2 leading-tight">
              {t('Find Hospital', 'المستشفيات')}
            </span>
          </button>

          {/* Service 5: Medical Check-up */}
          <button
            id="service-medical-checkup"
            onClick={() => navigateTo('medical_checkup')}
            className="flex flex-col items-center group"
          >
            <div className="w-13 h-13 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-2xs group-hover:bg-rose-600 group-hover:text-white group-active:scale-95 transition-all">
              <Activity className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 text-center mt-2 leading-tight">
              {t('Medical Check-up', 'فحص شامل')}
            </span>
          </button>
        </div>
      </section>

      {/* Prominent "Your Appointment" Section */}
      {upcomingApt && (
        <section className="px-5 pt-5">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-base font-bold text-slate-900">
              {t('Your Appointment', 'موعدك القادم')}
            </h3>
            <button
              onClick={() => navigateTo('my_appointments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t('See more', 'المزيد')}</span>
              <Arrow className="w-3.5 h-3.5" />
            </button>
          </div>

          <div
            id="home-upcoming-appointment-card"
            className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all hover:shadow-[0_8px_25px_rgba(0,0,0,0.06)]"
          >
            {/* Top Badge: "Talk with doctor" */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-rose-500 -ml-3.5" />
                <span>{t('Talk with doctor', 'استشارة مرئية')}</span>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {t('Confirmed', 'مؤكد')}
              </span>
            </div>

            {/* Doctor Info */}
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                <img
                  src={upcomingApt.doctor.avatar}
                  alt={upcomingApt.doctor.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {t(upcomingApt.doctor.name, upcomingApt.doctor.nameAr)}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {t(upcomingApt.doctor.specialty, upcomingApt.doctor.specialtyAr)} • {upcomingApt.doctor.experienceYears} {t('years', 'سنوات')}
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="truncate">{upcomingApt.date} • {upcomingApt.timeSlot.split('-')[0]}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 pt-3.5 border-t border-slate-100/80 flex items-center gap-2.5">
              <button
                id="join-consultation-btn"
                onClick={() => navigateTo('video_consultation', { appointment: upcomingApt })}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>{t('Join Consultation', 'انضم للمكالمة الآن')}</span>
              </button>

              <button
                onClick={() => navigateTo('chat_doctor', { chatDoctor: upcomingApt.doctor })}
                className="py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center transition-colors"
                aria-label="Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Recommended Doctors Carousel */}
      <section className="pt-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900">
            {t('Recommended Doctors', 'أطباء مميزون')}
          </h3>
          <button
            onClick={() => navigateTo('doctors')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>{t('See more', 'عرض الكل')}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-5 pb-2">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              id={`doctor-card-${doctor.id}`}
              onClick={() => navigateTo('doctor_detail', { doctor })}
              className="w-56 shrink-0 bg-white rounded-3xl p-3.5 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full h-32 rounded-2xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={doctor.avatar}
                    alt={doctor.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold text-amber-600 shadow-2xs">
                    <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                    <span>{doctor.rating}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {t(doctor.name, doctor.nameAr)}
                </h4>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {t(doctor.specialty, doctor.specialtyAr)}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 font-medium">
                  <span>{doctor.experienceYears}+ {t('yrs exp', 'سنوات خبرة')}</span>
                  <span>•</span>
                  <span>{doctor.reviewsCount} {t('reviews', 'تقييم')}</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">{t('Consultation', 'سعر الكشف')}</span>
                  <span className="text-xs font-extrabold text-blue-600">
                    {t(doctor.feeFormatted, doctor.feeFormattedAr)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('doctor_detail', { doctor });
                  }}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {t('Book', 'حجز')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Most Popular Products Section (Pharmacy) */}
      <section className="pt-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {t('Most Popular Products', 'المنتجات الدوائية الأكثر طلباً')}
            </h3>
            <p className="text-xs text-slate-500">
              {t('Order certified medicines delivered to your doorstep', 'أدوية ومستلزمات معتمدة تصلك لباب منزلك')}
            </p>
          </div>
          <button
            onClick={() => navigateTo('pharmacy')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 shrink-0"
          >
            <span>{t('See more', 'المزيد')}</span>
            <Arrow className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-5 pb-2">
          {products.map((product) => (
            <div
              key={product.id}
              id={`home-product-${product.id}`}
              onClick={() => navigateTo('medicine_detail', { product })}
              className="w-44 shrink-0 bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-28 rounded-2xl overflow-hidden bg-slate-50 p-2 flex items-center justify-center mb-2.5">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md inline-block mb-1">
                  {t(product.category, product.categoryAr)}
                </span>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {t(product.name, product.nameAr)}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {t(product.shortDesc, product.shortDescAr)}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900">
                  {t(product.priceFormatted, product.priceFormattedAr)}
                </span>
                <button
                  id={`home-add-cart-${product.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product, 1);
                  }}
                  className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xs transition-transform active:scale-90"
                  aria-label="Add to cart"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Emergency & 24/7 Medical Advice Banner */}
      <section className="px-5 pt-6">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-4.5 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-[11px] font-semibold mb-2">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{t('24/7 Medical Helpline', 'الخط الساخن للاستشارات الطبية')}</span>
            </div>
            <h4 className="text-base font-bold mb-1 leading-snug">
              {t('Need urgent medical advice?', 'هل تحتاج استشارة طبية عاجلة؟')}
            </h4>
            <p className="text-xs text-blue-100/90 mb-3.5 max-w-[260px]">
              {t('Speak directly with on-call licensed emergency doctors in under 2 minutes.', 'تحدث فوراً مع أطباء الطوارئ المناوبين خلال أقل من دقيقتين.')}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('video_consultation', { appointment: upcomingApt })}
                className="px-4 py-2 bg-white text-blue-900 text-xs font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                <span>{t('Call Doctor Now', 'اتصال فوري بالطبيب')}</span>
              </button>
              <button
                onClick={() => navigateTo('clinics_map')}
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-medium rounded-xl transition-colors"
              >
                {t('Emergency Map', 'خريطة الطوارئ')}
              </button>
            </div>
          </div>
          {/* Background decorative circles */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-lg pointer-events-none" />
        </div>
      </section>
    </div>
  );
};
