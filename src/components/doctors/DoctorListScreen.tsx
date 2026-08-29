import React, { useState } from 'react';
import { Search, Star, Filter, Heart, MessageSquare, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { DOCTOR_CATEGORIES } from '../../data/mockData';
import { MedicalIcon } from '../common/MedicalIcon';
import { Doctor } from '../../types';

export const DoctorListScreen: React.FC = () => {
  const { doctors, navigateTo, favorites, toggleFavoriteDoctor, isRtl, t, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);

  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  const filteredDoctors = doctors.filter((doc) => {
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    const matchesRating = filterRating === 0 || doc.rating >= filterRating;
    const matchesSearch =
      searchQuery.trim() === '' ||
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.nameAr.includes(searchQuery) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialtyAr.includes(searchQuery);

    return matchesCategory && matchesRating && matchesSearch;
  });

  return (
    <div id="doctor-search-screen" className="flex flex-col min-h-full pb-10 bg-slate-50/50">
      <Header
        title="Find a Doctor"
        titleAr="ابحث عن طبيب أو استشاري"
        rightAction="language"
      />

      {/* Top Search Field */}
      <div className="px-5 pt-3 pb-2 bg-white border-b border-slate-100 shadow-2xs">
        <div className="relative flex items-center">
          <Search className={`w-4.5 h-4.5 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} pointer-events-none`} />
          <input
            id="doctor-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search doctor or specialist...', 'ابحث باسم الطبيب أو التخصص...')}
            className={`w-full py-3 ${isRtl ? 'pr-10 pl-10' : 'pl-10 pr-10'} bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 rounded-2xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-3 focus:ring-blue-500/10 transition-all outline-hidden`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute ${isRtl ? 'left-3.5' : 'right-3.5'} text-xs font-bold text-slate-400 hover:text-slate-600`}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Search by Category Section (Matching exact visual reference with pastel rounded squares) */}
      <section className="px-5 pt-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">
            {t('Search by Category', 'البحث حسب التخصص الطبي')}
          </h3>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              {t('View All', 'إظهار الكل')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {DOCTOR_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-btn-${cat.id}`}
                onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-102'
                    : `${cat.bgColor} text-slate-700 hover:shadow-xs hover:border-slate-300`
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${isSelected ? 'bg-white/20 text-white' : cat.color}`}>
                  <MedicalIcon name={cat.iconName} className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold tracking-tight text-center ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {t(cat.name, cat.nameAr)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recommended & Filtered Doctors List */}
      <section className="px-5 pt-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {selectedCategory === 'all'
                ? t('Recommended Doctors', 'الأطباء الموصى بهم')
                : t(`Specialists (${filteredDoctors.length})`, `الأطباء المتاحون (${filteredDoctors.length})`)}
            </h3>
            <p className="text-xs text-slate-500">
              {t('Board-certified medical specialists', 'استشاريون وأطباء معتمدون ومتاحون للاستشارة')}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterRating(filterRating === 4.8 ? 0 : 4.8)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                filterRating > 0
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
              <span>4.8+</span>
            </button>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="space-y-3.5">
          {filteredDoctors.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs">
              <p className="text-slate-500 text-sm font-medium">
                {t('No doctors found matching your criteria.', 'لم يتم العثور على أطباء يطابقون خيارات البحث.')}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setFilterRating(0);
                }}
                className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl"
              >
                {t('Reset Filters', 'إعادة ضبط التصفية')}
              </button>
            </div>
          ) : (
            filteredDoctors.map((doc: Doctor) => {
              const isFav = favorites.includes(doc.id);

              return (
                <div
                  key={doc.id}
                  id={`doctor-list-card-${doc.id}`}
                  onClick={() => navigateTo('doctor_detail', { doctor: doc })}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="relative w-18 h-18 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img
                        src={doc.avatar}
                        alt={doc.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {doc.isVerified && (
                        <div className="absolute bottom-1 right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-2xs">
                          <ShieldCheck className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {t(doc.name, doc.nameAr)}
                          </h4>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {t(doc.specialty, doc.specialtyAr)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavoriteDoctor(doc.id);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                            isFav ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
                        <span className="flex items-center gap-1 text-amber-600 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                          <span>{doc.rating}</span>
                          <span className="text-slate-400 font-normal">({doc.reviewsCount})</span>
                        </span>
                        <span>•</span>
                        <span>{doc.experienceYears}+ {t('yrs exp', 'سنوات خبرة')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block">{t('Consultation Fee', 'سعر الاستشارة')}</span>
                      <span className="text-sm font-extrabold text-blue-600">
                        {t(doc.feeFormatted, doc.feeFormattedAr)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('chat_doctor', { chatDoctor: doc });
                        }}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        aria-label="Chat with doctor"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo('doctor_detail', { doctor: doc });
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                      >
                        <span>{t('Book Now', 'احجز موعد')}</span>
                        <Chevron className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
