import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  Tag,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Truck,
} from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { Header } from '../common/Header';
import { Colors } from '../../theme/colors';
import { Shadows } from '../../theme/styles';

export const CartScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    user,
    navigateTo,
    isRtl,
    t,
  } = useApp();

  const [promoCode, setPromoCode] = useState<string>('HEALTH10');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(10);
  const [isOrdered, setIsOrdered] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const deliveryFee = cart.length > 0 ? 15 : 0;
  const taxes = Number((cartSubtotal * 0.15).toFixed(2));
  const discountAmount = Number(((cartSubtotal * appliedDiscount) / 100).toFixed(2));
  const totalAmount = Number(
    Math.max(0, cartSubtotal + deliveryFee + taxes - discountAmount).toFixed(2)
  );

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'HEALTH10') {
      setAppliedDiscount(10);
    } else if (promoCode.trim().toUpperCase() === 'SAHATAK20') {
      setAppliedDiscount(20);
    } else {
      setAppliedDiscount(0);
    }
  };

  const handleCheckout = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOrdered(true);
      clearCart();
    }, 1200);
  };

  if (isOrdered) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <View style={styles.successCard}>
          <View style={styles.successIconWrap}>
            <CheckCircle2 size={48} color={Colors.accent} />
          </View>
          <Text style={styles.successTitle}>
            {t('Order Placed Successfully!', 'تم تأكيد طلبك بنجاح!')}
          </Text>
          <Text style={styles.successSub}>
            {t(
              'Your medications are being packaged with temperature control. Expected delivery within 30-45 minutes.',
              'يتم تجهيز أدويتك وتغليفها مبردة بعناية. التوصيل المتوقع خلال 30 إلى 45 دقيقة.'
            )}
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setIsOrdered(false);
              navigateTo('home');
            }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>
              {t('Back to Home', 'العودة للرئيسية')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="My Shopping Cart"
        titleAr="سلة المشتريات"
        showBack={true}
      />

      {cart.length === 0 ? (
        <View style={[styles.container, styles.centerContainer]}>
          <View style={styles.emptyIconWrap}>
            <ShoppingBag size={44} color={Colors.slate[400]} />
          </View>
          <Text style={styles.emptyTitle}>
            {t('Your cart is empty', 'سلة المشتريات فارغة')}
          </Text>
          <Text style={styles.emptySub}>
            {t('Browse our certified pharmacy catalog and add medicines to your cart.', 'تصفح الصيدلية وأضف أدويتك ومنتجاتك الصحية بسهولة.')}
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigateTo('pharmacy')}
            style={styles.browseBtn}
          >
            <Text style={styles.browseBtnText}>{t('Browse Pharmacy', 'تصفح الصيدلية')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery Address Banner */}
          <View style={[styles.addressCard, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <View style={styles.addressIconWrap}>
              <MapPin size={18} color={Colors.primary} />
            </View>
            <View style={[styles.addressTextWrap, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
              <Text style={styles.addressLabel}>{t('Delivery Address', 'عنوان التوصيل')}</Text>
              <Text numberOfLines={1} style={styles.addressValue}>
                {user?.location ? t(user.location, user.locationAr || user.location) : t('Khartoum, Sudan', 'الخرطوم، السودان')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigateTo('clinics_map')}>
              <Text style={styles.changeAddressText}>{t('Change', 'تغيير')}</Text>
            </TouchableOpacity>
          </View>

          {/* Cart Item Cards */}
          <View style={styles.itemsList}>
            {cart.map((item) => (
              <View key={item.product.id} style={styles.itemCard}>
                <View style={[styles.itemCardTop, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <View style={styles.itemImgWrap}>
                    <Image
                      source={{ uri: item.product.image }}
                      style={styles.itemImage}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={[styles.itemInfo, { alignItems: isRtl ? 'flex-end' : 'flex-start' }]}>
                    <Text numberOfLines={1} style={styles.itemName}>
                      {t(item.product.name, item.product.nameAr)}
                    </Text>
                    <Text numberOfLines={1} style={styles.itemShortDesc}>
                      {t(item.product.shortDesc, item.product.shortDescAr)}
                    </Text>
                    <Text style={styles.itemPrice}>
                      {t(item.product.priceFormatted, item.product.priceFormattedAr)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => removeFromCart(item.product.id)}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={16} color={Colors.rose} />
                  </TouchableOpacity>
                </View>

                <View style={[styles.itemCardBottom, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                  <Text style={styles.itemSubtotalLabel}>
                    {t('Item Total', 'المجموع')}: SAR {(item.product.price * item.quantity).toFixed(2)}
                  </Text>

                  {/* Quantity selector */}
                  <View style={[styles.itemQtyRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                      style={styles.qtyBtn}
                    >
                      <Minus size={13} color={Colors.slate[700]} />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                      style={[styles.qtyBtn, styles.qtyBtnPlus]}
                    >
                      <Plus size={13} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Promo Code Input */}
          <View style={[styles.promoCard, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
            <Tag size={18} color={Colors.primary} />
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder={t('Enter promo code (e.g. HEALTH10)', 'رمز الخصم (مثال: HEALTH10)')}
              placeholderTextColor={Colors.slate[400]}
              style={[
                styles.promoInput,
                { textAlign: isRtl ? 'right' : 'left' },
              ]}
            />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleApplyPromo}
              style={styles.promoApplyBtn}
            >
              <Text style={styles.promoApplyText}>{t('Apply', 'تطبيق')}</Text>
            </TouchableOpacity>
          </View>

          {/* Bill Breakdown Summary */}
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryTitle, { textAlign: isRtl ? 'right' : 'left' }]}>
              {t('Order Summary', 'ملخص الطلب')}
            </Text>

            <View style={[styles.summaryRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.summaryLabel}>{t('Items Subtotal', 'مجموع المنتجات')}</Text>
              <Text style={styles.summaryVal}>SAR {cartSubtotal.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.summaryLabel}>{t('Express Delivery (30 min)', 'التوصيل السريع (30 دقيقة)')}</Text>
              <Text style={styles.summaryVal}>SAR {deliveryFee.toFixed(2)}</Text>
            </View>

            <View style={[styles.summaryRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.summaryLabel}>{t('VAT (15%)', 'ضريبة القيمة المضافة (15%)')}</Text>
              <Text style={styles.summaryVal}>SAR {taxes.toFixed(2)}</Text>
            </View>

            {appliedDiscount > 0 && (
              <View style={[styles.summaryRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.summaryLabel, { color: Colors.accentDark }]}>
                  {t(`Promo Discount (${appliedDiscount}%)`, `خصم الكوبون (${appliedDiscount}%)`)}
                </Text>
                <Text style={[styles.summaryVal, { color: Colors.accentDark, fontWeight: '700' }]}>
                  -SAR {discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={[styles.totalRow, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
              <Text style={styles.totalLabel}>{t('Total Amount', 'المبلغ الإجمالي')}</Text>
              <Text style={styles.totalVal}>SAR {totalAmount.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>
      )}

      {/* Bottom Sticky Checkout Bar */}
      {cart.length > 0 && (
        <View
          style={[
            styles.bottomCheckoutBar,
            {
              paddingBottom: Math.max(insets.bottom, 12),
              flexDirection: isRtl ? 'row-reverse' : 'row',
            },
          ]}
        >
          <View style={{ alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
            <Text style={styles.totalCheckoutLabel}>{t('Total to Pay', 'المجموع النهائي')}</Text>
            <Text style={styles.totalCheckoutVal}>SAR {totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCheckout}
            disabled={isSubmitting}
            style={styles.checkoutBtn}
          >
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.checkoutBtnText}>
                {t('Place Order & Pay', 'تأكيد ودفع الطلب')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  scrollContent: {
    padding: 16,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.slate[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.slate[900],
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.slate[500],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  browseBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  successCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    ...Shadows.lg,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.slate[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    color: Colors.slate[600],
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  addressCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    marginBottom: 14,
    ...Shadows.sm,
  },
  addressIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressTextWrap: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  addressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[800],
  },
  changeAddressText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  itemsList: {
    gap: 10,
    marginBottom: 14,
  },
  itemCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  itemCardTop: {
    alignItems: 'center',
    gap: 10,
  },
  itemImgWrap: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: Colors.slate[50],
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.slate[900],
  },
  itemShortDesc: {
    fontSize: 11,
    color: Colors.slate[400],
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  itemCardBottom: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingTop: 10,
    marginTop: 10,
  },
  itemSubtotalLabel: {
    fontSize: 11,
    color: Colors.slate[500],
    fontWeight: '600',
  },
  itemQtyRow: {
    backgroundColor: Colors.slate[100],
    borderRadius: 12,
    padding: 3,
    alignItems: 'center',
    gap: 6,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnPlus: {
    backgroundColor: Colors.primary,
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.slate[900],
    minWidth: 14,
    textAlign: 'center',
  },
  promoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.slate[200],
    marginBottom: 14,
  },
  promoInput: {
    flex: 1,
    fontSize: 12,
    color: Colors.slate[900],
    height: 38,
  },
  promoApplyBtn: {
    backgroundColor: Colors.primarySubtle,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  promoApplyText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.slate[100],
    ...Shadows.sm,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.slate[900],
    marginBottom: 12,
  },
  summaryRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.slate[500],
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.slate[800],
  },
  totalRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.slate[200],
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  bottomCheckoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.slate[100],
    paddingHorizontal: 16,
    paddingTop: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Shadows.lg,
  },
  totalCheckoutLabel: {
    fontSize: 10,
    color: Colors.slate[400],
  },
  totalCheckoutVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.slate[900],
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 24,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutBtnText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

