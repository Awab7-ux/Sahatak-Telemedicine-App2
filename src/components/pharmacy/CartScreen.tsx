import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Tag,
  ShieldCheck,
  CreditCard,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';

export const CartScreen: React.FC = () => {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartCount,
    user,
    navigateTo,
    isRtl,
    t,
  } = useApp();

  const [promoCode, setPromoCode] = useState<string>('SAHATAK20');
  const [promoApplied, setPromoApplied] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'apple_pay' | 'card' | 'cod'>('apple_pay');
  const [isPlacingOrder, setIsPlacingOrder] = useState<boolean>(false);
  const [orderPlaced, setOrderPlaced] = useState<boolean>(false);

  const deliveryFee = cartSubtotal > 100 ? 0 : 15;
  const discountAmount = promoApplied ? Number((cartSubtotal * 0.15).toFixed(2)) : 0;
  const finalTotal = (cartSubtotal + deliveryFee - discountAmount).toFixed(2);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'SAHATAK20') {
      setPromoApplied(true);
    }
  };

  const handleCheckout = () => {
    setIsPlacingOrder(true);
    setTimeout(() => {
      setIsPlacingOrder(false);
      setOrderPlaced(true);
      clearCart();
    }, 1200);
  };

  const Arrow = isRtl ? ArrowLeft : ArrowRight;

  if (orderPlaced) {
    return (
      <div id="cart-order-success" className="flex flex-col min-h-full pb-20 bg-slate-50">
        <Header title={t('Order Placed', 'تم إرسال الطلب')} showBack={false} />
        <div className="px-5 py-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-md">
            <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
          </div>

          <h2 className="text-lg font-extrabold text-slate-900">
            {t('Your Medicines Are On The Way!', 'أدويتك في طريقها إليك الآن!')}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-[280px]">
            {t('Our certified pharmacy courier will arrive in approx. 25-35 minutes with temperature-controlled packaging.', 'مندوب الصيدلية المعتمد سيصلك خلال 25-35 دقيقة تقريباً.')}
          </p>

          <div className="w-full bg-white rounded-3xl p-4.5 border border-slate-100 shadow-sm mt-6 text-left space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <span className="text-xs text-slate-400 font-bold">{t('ORDER NUMBER', 'رقم الطلب')}</span>
              <span className="text-xs font-mono font-bold text-blue-600">#SHK-89241</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <Truck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{t('Delivering to', 'التوصيل إلى')}: <strong className="text-slate-900">{t(user.location, user.locationAr)}</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{t('SFDA verified cold-chain storage', 'حفظ دوائي مبرد ومعتمد')}</span>
            </div>
          </div>

          <div className="w-full space-y-2.5 mt-8">
            <button
              onClick={() => navigateTo('home')}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-sm"
            >
              {t('Back to Home', 'العودة للرئيسية')}
            </button>
            <button
              onClick={() => navigateTo('pharmacy')}
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors"
            >
              {t('Continue Shopping', 'متابعة التسوق في الصيدلية')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="cart-screen" className="flex flex-col min-h-full pb-28 bg-slate-50">
      <Header
        title={t(`My Cart (${cartCount})`, `سلة المشتريات (${cartCount})`)}
        showBack={true}
        onBack={() => navigateTo('pharmacy')}
      />

      {cart.length === 0 ? (
        <div className="px-5 py-16 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {t('Your cart is empty', 'سلة المشتريات فارغة')}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
            {t('Browse our certified pharmacy to order medications, vitamins, and healthcare essentials.', 'تصفح الصيدلية لطلب الأدوية والفيتامينات والمستلزمات الطبية.')}
          </p>
          <button
            onClick={() => navigateTo('pharmacy')}
            className="mt-6 px-6 py-3 bg-blue-600 text-white text-xs font-bold rounded-2xl shadow-sm hover:bg-blue-700 transition-all"
          >
            {t('Explore Pharmacy', 'تصفح الصيدلية')}
          </button>
        </div>
      ) : (
        <div className="px-5 py-4 space-y-4">
          {/* Delivery Address Pill */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-100 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold block">{t('DELIVERY ADDRESS', 'عنوان التوصيل')}</span>
                <p className="text-xs font-bold text-slate-900 truncate">{t(user.location, user.locationAr)}</p>
              </div>
            </div>
            <button
              onClick={() => navigateTo('clinics_map')}
              className="text-xs font-semibold text-blue-600 shrink-0 hover:underline"
            >
              {t('Change', 'تغيير')}
            </button>
          </div>

          {/* Cart Items List */}
          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.product.id}
                id={`cart-item-${item.product.id}`}
                className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-2xs flex items-center gap-3.5"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 p-1.5 flex items-center justify-center border border-slate-100 shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="max-h-full max-w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {t(item.product.name, item.product.nameAr)}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.product.packaging}</p>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-extrabold text-blue-600">
                      SAR {(item.product.price * item.quantity).toFixed(2)}
                    </span>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-xl">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-200 active:scale-95"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Code Input */}
          <form onSubmit={handleApplyPromo} className="bg-white rounded-2xl p-2.5 border border-slate-100 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600 ml-1 shrink-0" />
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={t('Enter promo code...', 'أدخل كود الخصم...')}
              className="flex-1 text-xs text-slate-900 uppercase font-bold focus:outline-none placeholder:font-normal placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              {promoApplied ? t('Applied ✓', 'مفعّل ✓') : t('Apply', 'تطبيق')}
            </button>
          </form>

          {/* Payment Method Selector */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              {t('Payment Option', 'طريقة الدفع')}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('apple_pay')}
                className={`py-2 px-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                  paymentMethod === 'apple_pay'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                 Pay
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {t('Card', 'بطاقة')}
              </button>
              <button
                onClick={() => setPaymentMethod('cod')}
                className={`py-2 px-3 rounded-2xl border text-center font-bold text-xs transition-all ${
                  paymentMethod === 'cod'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {t('Cash / COD', 'عند الاستلام')}
              </button>
            </div>
          </div>

          {/* Order Bill Breakdown */}
          <div className="bg-white rounded-3xl p-4 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>{t('Items Subtotal', 'مجموع المنتجات')}</span>
              <span className="font-semibold text-slate-900">SAR {cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>{t('Delivery Fee', 'رسوم التوصيل السريع')}</span>
              <span className={`font-semibold ${deliveryFee === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {deliveryFee === 0 ? t('FREE', 'مجاناً') : `SAR ${deliveryFee}.00`}
              </span>
            </div>
            {promoApplied && (
              <div className="flex items-center justify-between text-emerald-600 font-semibold">
                <span>{t('Promo Discount (15%)', 'خصم الرمز الترويجي')}</span>
                <span>- SAR {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-900">{t('Total Amount', 'المبلغ الإجمالي')}</span>
              <span className="font-extrabold text-blue-600">SAR {finalTotal}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Bar with Place Order CTA */}
      {cart.length > 0 && (
        <div
          id="cart-cta-bar"
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-5 py-3.5 z-30 shadow-[0_-4px_25px_rgba(0,0,0,0.06)]"
        >
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {t('Total with VAT', 'الإجمالي مع الضريبة')}
              </span>
              <span className="text-base font-extrabold text-slate-900">
                SAR {finalTotal}
              </span>
            </div>

            <button
              id="place-order-btn"
              onClick={handleCheckout}
              disabled={isPlacingOrder}
              className="flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-75 text-white text-xs font-bold rounded-2xl shadow-md shadow-blue-500/25 transition-all text-center flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{t('Placing order...', 'جارٍ إرسال الطلب...')}</span>
                </div>
              ) : (
                <>
                  <span>{t('Place Order & Deliver Now', 'تأكيد وإرسال الطلب الآن')}</span>
                  <Arrow className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
