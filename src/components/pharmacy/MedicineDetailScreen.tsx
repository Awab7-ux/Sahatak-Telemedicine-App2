import React, { useState } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  Plus,
  Minus,
  AlertCircle,
  FileCheck,
  Building,
  Truck,
  Sparkles,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { POPULAR_PRODUCTS } from '../../data/mockData';

export const MedicineDetailScreen: React.FC = () => {
  const { selectedProduct, addToCart, navigateTo, cartCount, isRtl, t } = useApp();
  const product = selectedProduct || POPULAR_PRODUCTS[0];

  const [quantity, setQuantity] = useState<number>(1);
  const [isAddedToast, setIsAddedToast] = useState<boolean>(false);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigateTo('cart');
  };

  const totalPrice = (product.price * quantity).toFixed(2);

  return (
    <div id="medicine-detail-screen" className="flex flex-col min-h-full pb-28 bg-slate-50">
      <Header
        title="Medicine Details"
        titleAr="تفاصيل الدواء"
        rightAction="share"
      />

      {/* Product Image Stage */}
      <div className="bg-white px-6 pt-4 pb-6 flex items-center justify-center border-b border-slate-100 relative">
        <div className="w-56 h-56 rounded-3xl bg-slate-50/80 p-4 flex items-center justify-center border border-slate-100 shadow-xs">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain drop-shadow-sm"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* SFDA badge pill */}
        <div className="absolute top-4 right-6 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('SFDA Approved', 'معتمد من هيئة الغذاء والدواء')}</span>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="px-5 pt-4 space-y-4">
        {/* Title, Category & Price */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg">
              {t(product.category, product.categoryAr)}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {product.packaging}
            </span>
          </div>

          <h2 className="text-base font-extrabold text-slate-900 leading-snug">
            {t(product.name, product.nameAr)}
          </h2>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">{t('Unit Price', 'سعر العبوة')}</span>
              <span className="text-lg font-extrabold text-blue-600">
                {t(product.priceFormatted, product.priceFormattedAr)}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
              <button
                id="med-qty-minus"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-7 h-7 rounded-xl bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                disabled={quantity <= 1}
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-slate-900 w-5 text-center">{quantity}</span>
              <button
                id="med-qty-plus"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Express Delivery Notice */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 flex items-center gap-3 text-xs text-blue-900">
          <Truck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold">{t('Express 30-Min Delivery Available', 'توصيل سريع متاح خلال 30 دقيقة')}</span>
            <p className="text-[11px] text-blue-700/80 mt-0.5">
              {t('Delivered in temperature-controlled medical packaging.', 'توصيل مبرد في عبوات طبية محكمة.')}
            </p>
          </div>
        </div>

        {/* Description & Overview */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-2xs space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
              {t('About Medication', 'نبذة عن الدواء')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(product.description, product.descriptionAr)}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>{t('Composition & Active Ingredients', 'المكونات والمادة الفعالة')}</span>
            </h4>
            <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl font-mono text-[11px]">
              {product.composition}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 mb-1">
              {t('Dosage Instructions', 'إرشادات الاستخدام والجرعات')}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t(product.dosage, product.dosageAr)}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{t('Warnings & Precautions', 'التحذيرات وموانع الاستعمال')}</span>
            </h4>
            <p className="text-xs text-slate-600 bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
              {t(product.warnings, product.warningsAr)}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-slate-400" />
              <span>{t('Manufacturer', 'الشركة المصنعة')}:</span>
            </span>
            <span className="font-semibold text-slate-800">{product.manufacturer}</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar with Add to Cart & Buy Now */}
      <div
        id="medicine-detail-cta-bar"
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-5 py-3.5 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">
              {t('Subtotal', 'المجموع')} ({quantity} {t('items', 'علب')})
            </span>
            <span className="text-base font-extrabold text-slate-900">
              SAR {totalPrice}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <button
              id="med-add-cart-btn"
              onClick={handleAddToCart}
              className={`p-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center transition-all ${
                isAddedToast
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              {isAddedToast ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </button>

            <button
              id="med-buy-now-btn"
              onClick={handleBuyNow}
              className="flex-1 py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all text-center"
            >
              {t('Order & Express Checkout', 'إتمام الطلب الفوري')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
