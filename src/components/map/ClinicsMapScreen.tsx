import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Building2,
  Phone,
  Navigation,
  Star,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { CLINIC_LOCATIONS } from '../../data/mockData';
import { ClinicLocation } from '../../types';

export const ClinicsMapScreen: React.FC = () => {
  const { navigateTo, isRtl, t } = useApp();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedClinic, setSelectedClinic] = useState<ClinicLocation>(CLINIC_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = [
    { id: 'all', labelEn: 'All Places', labelAr: 'الكل' },
    { id: 'hospital', labelEn: 'Hospitals', labelAr: 'مستشفيات' },
    { id: 'clinic', labelEn: 'Clinics', labelAr: 'مجمعات طبية' },
    { id: 'pharmacy', labelEn: 'Pharmacies', labelAr: 'صيدليات 24/7' },
  ];

  const filteredClinics = CLINIC_LOCATIONS.filter((c) => {
    const matchesType = selectedType === 'all' || c.type === selectedType;
    const matchesQuery =
      searchQuery.trim() === '' ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameAr.includes(searchQuery) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.addressAr.includes(searchQuery);
    return matchesType && matchesQuery;
  });

  return (
    <div id="clinics-map-screen" className="flex flex-col h-full bg-slate-100 relative overflow-hidden">
      <Header
        title="Hospitals & Clinics"
        titleAr="المستشفيات والمراكز القريبة"
        rightAction="none"
        className="relative z-20 shadow-xs"
      />

      {/* Floating Search & Filter Bar */}
      <div className="absolute top-16 left-4 right-4 z-20 space-y-2">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 shadow-md border border-slate-200/80 flex items-center gap-2">
          <Search className={`w-4 h-4 text-slate-400 ${isRtl ? 'mr-2' : 'ml-2'} shrink-0`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('Search nearby hospitals & clinics...', 'ابحث عن مستشفى أو مركز قريب...')}
            className="w-full py-1.5 px-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = selectedType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap shadow-xs transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-white/95 backdrop-blur-md text-slate-700 hover:bg-white border border-slate-200/80'
                }`}
              >
                {t(tab.labelEn, tab.labelAr)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stylized Interactive Map Canvas */}
      <div className="flex-1 relative bg-slate-200 z-10 overflow-hidden">
        {/* Map Grid / Vector Roads Simulation */}
        <svg className="w-full h-full object-cover absolute inset-0 opacity-40">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main roads */}
          <path d="M -50 150 Q 200 120 450 200" fill="none" stroke="#94a3b8" strokeWidth="10" />
          <path d="M 120 -50 Q 180 300 220 700" fill="none" stroke="#94a3b8" strokeWidth="8" />
          <path d="M 280 -50 Q 300 250 380 700" fill="none" stroke="#cbd5e1" strokeWidth="6" />
          <path d="M -50 380 Q 200 420 450 350" fill="none" stroke="#cbd5e1" strokeWidth="6" />
          {/* Parks / Water areas */}
          <circle cx="90" cy="240" r="45" fill="#bae6fd" opacity="0.6" />
          <rect x="260" y="80" width="90" height="60" rx="12" fill="#bbf7d0" opacity="0.5" />
        </svg>

        {/* Current User Location Marker */}
        <div className="absolute top-[48%] left-[45%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 animate-ping absolute inset-0" />
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
          <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-1 shadow-sm">
            {t('You are here', 'موقعك')}
          </span>
        </div>

        {/* Interactive Location Pins */}
        {filteredClinics.map((clinic, index) => {
          const isSelected = selectedClinic.id === clinic.id;
          // Coordinates simulation for visual distribution
          const coords = [
            { top: '28%', left: '30%' },
            { top: '35%', left: '72%' },
            { top: '65%', left: '25%' },
            { top: '68%', left: '68%' },
          ];
          const pos = coords[index % coords.length];

          return (
            <div
              key={clinic.id}
              onClick={() => setSelectedClinic(clinic)}
              style={{ top: pos.top, left: pos.left }}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-200 hover:scale-110"
            >
              <div
                className={`p-2 rounded-2xl flex items-center gap-1.5 shadow-lg border-2 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white border-white scale-110 ring-4 ring-blue-500/20'
                    : 'bg-white text-slate-900 border-blue-500 hover:bg-blue-50'
                }`}
              >
                <Building2 className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                <span className="text-[10px] font-bold whitespace-nowrap max-w-[80px] truncate">
                  {t(clinic.name, clinic.nameAr).split(' ')[0]}
                </span>
              </div>
              {/* Pin triangle tip */}
              <div
                className={`w-2 h-2 rotate-45 mx-auto -mt-1 ${
                  isSelected ? 'bg-blue-600' : 'bg-white'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Bottom Sheet Card for Selected Facility */}
      <div className="relative z-30 bg-white rounded-t-3xl p-4.5 border-t border-slate-100 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />

        <div className="flex items-start gap-3.5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
            <img
              src={selectedClinic.image}
              alt={selectedClinic.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                {t(selectedClinic.type, selectedClinic.typeAr)}
              </span>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                <span>{selectedClinic.rating}</span>
              </span>
            </div>

            <h3 className="text-sm font-bold text-slate-900 mt-1 truncate">
              {t(selectedClinic.name, selectedClinic.nameAr)}
            </h3>

            <p className="text-xs text-slate-500 truncate mt-0.5">
              {t(selectedClinic.address, selectedClinic.addressAr)}
            </p>

            <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 font-medium">
              <span className="flex items-center gap-1 text-blue-600 font-bold">
                <Navigation className="w-3.5 h-3.5" />
                <span>{selectedClinic.distance}</span>
              </span>
              <span>•</span>
              <span className={`font-semibold ${selectedClinic.isOpen ? 'text-emerald-600' : 'text-slate-400'}`}>
                {selectedClinic.isOpen ? t('Open Now', 'مفتوح الآن') : t('Closed', 'مغلق')}
              </span>
              {selectedClinic.isEmergency24 && (
                <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-1.5 py-0.5 rounded">
                  24/7 ER
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
          <a
            href={`tel:${selectedClinic.phone}`}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('Call', 'اتصال')}</span>
          </a>

          <button
            onClick={() => alert(t('Opening Google Maps navigation to: ' + selectedClinic.name, 'جارٍ فتح الملاحة إلى: ' + selectedClinic.nameAr))}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>{t('Directions', 'الاتجاهات')}</span>
          </button>

          <button
            onClick={() => navigateTo('doctors')}
            className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('Book Visit', 'حجز موعد')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
