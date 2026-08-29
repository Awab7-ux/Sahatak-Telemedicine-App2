import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MessageSquare,
  FileText,
  RotateCcw,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { AppointmentStatus, Appointment } from '../../types';

export const MyAppointmentsScreen: React.FC = () => {
  const {
    appointments,
    cancelAppointment,
    navigateTo,
    setActiveAppointment,
    isRtl,
    t,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<AppointmentStatus>('upcoming');

  const filtered = appointments.filter((apt) => apt.status === activeFilter);

  const handleJoinCall = (apt: Appointment) => {
    setActiveAppointment(apt);
    navigateTo('video_consultation');
  };

  const handleChat = (apt: Appointment) => {
    navigateTo('chat_doctor', { chatDoctor: apt.doctor });
  };

  return (
    <div id="my-appointments-screen" className="flex flex-col min-h-full pb-20 bg-slate-50">
      <Header
        title="My Appointments"
        titleAr="مواعيدي الطبية"
        rightAction="none"
      />

      {/* Tabs Filter */}
      <div className="px-5 pt-3 pb-1 bg-white border-b border-slate-100">
        <div className="grid grid-cols-3 gap-2">
          {(['upcoming', 'completed', 'cancelled'] as AppointmentStatus[]).map((status) => {
            const isActive = activeFilter === status;
            const count = appointments.filter((a) => a.status === status).length;
            const labels = {
              upcoming: { en: 'Upcoming', ar: 'القادمة' },
              completed: { en: 'Completed', ar: 'المكتملة' },
              cancelled: { en: 'Cancelled', ar: 'الملغاة' },
            };

            return (
              <button
                key={status}
                id={`tab-apt-${status}`}
                onClick={() => setActiveFilter(status)}
                className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{t(labels[status].en, labels[status].ar)}</span>
                <span className={`ml-1 text-[10px] ${isActive ? 'text-blue-200' : 'text-slate-400'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="px-5 pt-4 space-y-3.5">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {t(`No ${activeFilter} appointments found.`, `لا توجد مواعيد ${activeFilter === 'upcoming' ? 'قادمة' : 'مسجلة'}.`)}
            </p>
            <button
              onClick={() => navigateTo('doctors')}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              {t('Book a Doctor Now', 'حجز موعد مع طبيب')}
            </button>
          </div>
        ) : (
          filtered.map((apt) => (
            <div
              key={apt.id}
              id={`apt-card-${apt.id}`}
              className="bg-white rounded-3xl p-4.5 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  #{apt.id}
                </span>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    apt.status === 'upcoming'
                      ? 'bg-blue-50 text-blue-700'
                      : apt.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {apt.status === 'upcoming'
                    ? t('Confirmed', 'مؤكد')
                    : apt.status === 'completed'
                    ? t('Completed', 'مكتمل')
                    : t('Cancelled', 'ملغي')}
                </span>
              </div>

              {/* Doctor Details */}
              <div className="flex items-center gap-3.5">
                <img
                  src={apt.doctor.avatar}
                  alt={apt.doctor.name}
                  className="w-14 h-14 rounded-2xl object-cover bg-slate-100 shrink-0 border border-slate-100"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {t(apt.doctor.name, apt.doctor.nameAr)}
                  </h4>
                  <p className="text-xs text-slate-500 truncate">
                    {t(apt.doctor.specialty, apt.doctor.specialtyAr)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold mt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{apt.date}</span>
                    <span>•</span>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{apt.timeSlot.split('-')[0]}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Type Badge */}
              <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-700">
                <span className="text-slate-500">{t('Consultation Mode', 'نوع الاستشارة')}:</span>
                <strong className="text-slate-900 capitalize flex items-center gap-1.5">
                  {apt.consultationType === 'video' && <Video className="w-3.5 h-3.5 text-blue-600" />}
                  {apt.consultationType === 'chat' && <MessageSquare className="w-3.5 h-3.5 text-teal-600" />}
                  <span>{apt.consultationType} Consultation</span>
                </strong>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                {apt.status === 'upcoming' && (
                  <>
                    <button
                      id={`join-apt-${apt.id}`}
                      onClick={() => handleJoinCall(apt)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Video className="w-4 h-4" />
                      <span>{t('Join Video Call', 'دخول الاستشارة')}</span>
                    </button>

                    <button
                      onClick={() => handleChat(apt)}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                      aria-label="Chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => cancelAppointment(apt.id)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold"
                    >
                      {t('Cancel', 'إلغاء')}
                    </button>
                  </>
                )}

                {apt.status === 'completed' && (
                  <>
                    <button
                      onClick={() => navigateTo('medical_records')}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t('View Prescription & Report', 'عرض الروشتة والتقرير')}</span>
                    </button>

                    <button
                      onClick={() => navigateTo('doctor_detail', { doctor: apt.doctor })}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
