import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Check,
  UploadCloud,
  Sparkles,
  Filter,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Product } from '../../types';

export const PharmacyScreen: React.FC = () => {
  const { products, addToCart, navigateTo, cartCount, isRtl, t } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [addedItemIds, setAddedItemIds] = useState<string[]>([]);

  const categories = [
    { id: 'all', labelEn: 'All Medicines', labelAr: 'الكل' },
    { id: 'Cold & Cough', labelEn: 'Cold & Cough', labelAr: 'الزكام والسعال' },
    { id: 'Pain Relief', labelEn: 'Pain Relief', labelAr: 'مسكنات الألم' },
    { id: 'Vitamins & Supplements', labelEn: 'Vitamins', labelAr: 'الفيتامينات' },
    { id: 'First Aid & Safety', labelEn: 'First Aid', labelAr: 'الإسعافات' },
    { id: 'Digestive Health', labelEn: 'Digestive', labelAr: 'صحة الجهاز الهضمي' },
  ];

  const filteredProducts = products.filter((item) => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch =
      searchTerm.trim() === '' ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nameAr.includes(searchTerm) ||
      item.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortDescAr.includes(searchTerm);
    return matchesCat && matchesSearch;
  });

  const handleAddToCartWithFeedback = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAddedItemIds((prev) => [...prev, product.id]);
    setTimeout(() => {
      setAddedItemIds((prev) => prev.filter((id) => id !== product.id));
    }, 1500);
  };

  return (
    <div id="pharmacy-screen" className="flex flex-col min-h-full pb-20 bg-slate-50">
      <Header
        title="Pharmacy"
        titleAr="صيدلية صحتك الرقمية"
        rightAction="none"
      />

      {/* Search Bar & Cart Counter Button */}
      <div className="px-5 pt-3 pb-2 bg-white border-b border-slate-100 flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className={`w-4 h-4 text-slate-400 absolute ${isRtl ? 'right-3.5' : 'left-3.5'} top-3.5`} />
          <input
            id="pharmacy-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('Search medicines, vitamins...', 'ابحث عن دواء أو فيتامين...')}
            className={`w-full py-2.5 ${isRtl ? 'pr-9 pl-3' : 'pl-9 pr-3'} bg-slate-50 text-xs text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:outline-none`}
          />
        </div>

        <button
          id="pharmacy-cart-btn"
          onClick={() => navigateTo('cart')}
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center relative shrink-0 shadow-xs"
          aria-label="Cart"
        >
          <ShoppingCart className="w-4.5 h-4.5" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Prescription Upload Banner */}
      <div className="px-5 pt-3">
        <div
          onClick={() => navigateTo('medical_records')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-tight">
                {t('Have a Doctor Prescription?', 'لديك وصفة طبية من طبيبك؟')}
              </h4>
              <p className="text-[11px] text-blue-100 mt-0.5">
                {t('Upload Rx for 30-min express delivery', 'ارفع الروشتة لتوصيل سريع خلال 30 دقيقة')}
              </p>
            </div>
          </div>
          <span className="text-xs bg-white text-blue-700 font-bold px-2.5 py-1 rounded-lg shrink-0">
            {t('Upload', 'رفع')}
          </span>
        </div>
      </div>

      {/* Category Tabs (Horizontal scroll) */}
      <div className="px-5 pt-4 pb-1">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t(cat.labelEn, cat.labelAr)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Grid (2 columns matching reference) */}
      <div className="px-5 pt-3">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-500 font-medium">
            {t(`Showing ${filteredProducts.length} items`, `عرض ${filteredProducts.length} منتج دواء ومكمل`)}
          </span>
          <span className="text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('100% SFDA Certified', 'معتمد 100%')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {filteredProducts.map((product) => {
            const isAdded = addedItemIds.includes(product.id);

            return (
              <div
                key={product.id}
                id={`pharmacy-product-${product.id}`}
                onClick={() => navigateTo('medicine_detail', { product })}
                className="bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_3px_15px_rgba(0,0,0,0.03)] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-50 p-2 flex items-center justify-center mb-2.5">
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
                    id={`add-btn-${product.id}`}
                    onClick={(e) => handleAddToCartWithFeedback(product, e)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 active:scale-90 text-white shadow-xs'
                    }`}
                    aria-label="Add to cart"
                  >
                    {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
