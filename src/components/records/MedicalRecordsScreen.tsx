import React, { useState } from 'react';
import {
  FileText,
  Download,
  Share2,
  Calendar,
  User,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { MEDICAL_RECORDS } from '../../data/mockData';
import { MedicalRecord } from '../../types';

export const MedicalRecordsScreen: React.FC = () => {
  const { navigateTo, addToCart, products, isRtl, t } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);

  const tabs = [
    { id: 'all', labelEn: 'All Documents', labelAr: 'الكل' },
    { id: 'prescription', labelEn: 'Prescriptions', labelAr: 'الوصفات الطبية' },
    { id: 'lab_report', labelEn: 'Lab Reports', labelAr: 'التحاليل المخبرية' },
    { id: 'consultation_summary', labelEn: 'Doctor Reports', labelAr: 'تقارير الاستشارات' },
  ];

  const filteredRecords = MEDICAL_RECORDS.filter(
    (rec) => activeTab === 'all' || rec.type === activeTab
  );

  const handleOrderPrescription = (rec: MedicalRecord) => {
    // Add sample product to cart and open cart
    addToCart(products[0], 1);
    navigateTo('cart');
  };

  return (
    <div id="medical-records-screen" className="flex flex-col min-h-full pb-20 bg-slate-50">
      <Header
        title="Medical Records"
        titleAr="السجلات والتقارير الطبية"
        rightAction="none"
      />

      {/* Tabs Selector */}
      <div className="px-5 pt-3 pb-1 bg-white border-b border-slate-100">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(tab.labelEn, tab.labelAr)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Records Cards List */}
      <div className="px-5 pt-4 space-y-3.5">
        {filteredRecords.map((record) => (
          <div
            key={record.id}
            id={`record-card-${record.id}`}
            className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {record.type === 'prescription' ? t('E-Prescription', 'وصفة طبية معتمدة') : t('Lab Test Result', 'تقرير فحص مخبري')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">
                    {t(record.title, record.titleAr)}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t(record.doctorName, record.doctorNameAr)} • {t(record.facility || record.clinicName || 'Sahatak Clinic', record.facilityAr || record.clinicNameAr || 'عيادات صحتك')}
                  </p>
                </div>
              </div>
            </div>

            {/* Prescribed medicines preview */}
            {record.medicines && record.medicines.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5 text-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {t('Prescribed Medications', 'الأدوية الموصوفة')}
                </span>
                {record.medicines.map((med, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{t(med.name, med.nameAr)}</span>
                    <span className="text-slate-500 text-[11px]">{t(med.dosage, med.dosageAr)} • {t(med.frequency, med.frequencyAr)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Diagnostics Notes */}
            <div className="text-xs text-slate-600 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/50">
              <strong className="text-slate-800 block mb-0.5">{t('Doctor Notes & Diagnosis', 'التشخيص وملاحظات الطبيب')}:</strong>
              {t(record.diagnosisSummary || record.diagnosis || '', record.diagnosisSummaryAr || record.diagnosisAr || '')}
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                {record.date}
              </span>

              <div className="flex items-center gap-2">
                {record.type === 'prescription' && (
                  <button
                    onClick={() => handleOrderPrescription(record)}
                    className="py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{t('Order Meds', 'طلب الأدوية')}</span>
                  </button>
                )}

                <button
                  onClick={() => setViewingRecord(record)}
                  className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>{t('View PDF', 'عرض المستند')}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PDF / Digital Document Viewer Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>{t('Certified Digital Medical Record', 'مستند طبي رقمي معتمد')}</span>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <h3 className="text-sm font-bold text-slate-900">{t(viewingRecord.title, viewingRecord.titleAr)}</h3>
                <p className="text-slate-500 mt-0.5">{viewingRecord.doctorName} • {viewingRecord.date}</p>
                <p className="text-slate-500">{viewingRecord.facility || viewingRecord.clinicName}</p>
              </div>

              <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2">
                <h4 className="font-bold text-slate-900">{t('Clinical Summary & Findings', 'الملخص السريري والنتائج')}</h4>
                <p className="text-slate-600 leading-relaxed">{t(viewingRecord.diagnosisSummary || viewingRecord.diagnosis || '', viewingRecord.diagnosisSummaryAr || viewingRecord.diagnosisAr || '')}</p>
              </div>

              {viewingRecord.medicines && (
                <div className="border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <h4 className="font-bold text-slate-900">{t('Itemized Prescription', 'تفاصيل الوصفة')}</h4>
                  {viewingRecord.medicines.map((m, i) => (
                    <div key={i} className="pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                      <p className="font-bold text-blue-900">{t(m.name, m.nameAr)}</p>
                      <p className="text-slate-500 text-[11px]">{t(m.dosage, m.dosageAr)} • {t(m.frequency, m.frequencyAr)}</p>
                      <p className="text-slate-600 text-[11px]">{t(m.instructions, m.instructionsAr)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  alert(t('Downloaded official PDF to your device!', 'تم تنزيل التقرير بصيغة PDF بنجاح!'));
                  setViewingRecord(null);
                }}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>{t('Download Official PDF', 'تحميل المستند الرسمي')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
