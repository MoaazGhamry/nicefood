'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useLocale } from '@/lib/locale-context';

export default function CartPage() {
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { locale, t } = useLocale();

  const [feeConfig, setFeeConfig] = React.useState({ fee: 35, threshold: 500 });

  React.useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.success && data.settings) {
          setFeeConfig({
            fee: data.settings.deliveryFee ?? 35,
            threshold: data.settings.freeDeliveryThreshold ?? 500,
          });
        }
      })
      .catch(console.error);
  }, []);

  const deliveryFee = total >= feeConfig.threshold || total === 0 ? 0 : feeConfig.fee;
  const grandTotal = total + deliveryFee;

  const isAr = locale === 'ar';
  const currencySymbol = isAr ? 'ج.م' : 'EGP';

  // WhatsApp formatted order text
  const whatsappOrderText = encodeURIComponent(
    isAr
      ? `*طلب جديد من موقع NiceFood:*\n\n` +
          items
            .map(
              (item, idx) =>
                `${idx + 1}. ${item.nameAr || item.name} (${item.brandNameAr || item.brandName}) - الكمية: ${item.quantity} ${item.unit} - السعر: ${(item.offerPrice || item.price) * item.quantity} ج.م`
            )
            .join('\n') +
          `\n\n*المجموع الفرعي:* ${total} ج.م\n*التوصيل:* ${deliveryFee === 0 ? 'مجاني' : `${deliveryFee} ج.م`}\n*الإجمالي المطلوب:* ${grandTotal} ج.م\n\nبرجاء تأكيد الطلب وتحديد موعد التوصيل.`
      : `*New Order from NiceFood Website:*\n\n` +
          items
            .map(
              (item, idx) =>
                `${idx + 1}. ${item.name || item.nameAr} (${item.brandName || item.brandNameAr}) - Qty: ${item.quantity} ${item.unit} - Price: ${(item.offerPrice || item.price) * item.quantity} EGP`
            )
            .join('\n') +
          `\n\n*Subtotal:* ${total} EGP\n*Delivery:* ${deliveryFee === 0 ? 'Free' : `${deliveryFee} EGP`}\n*Total:* ${grandTotal} EGP\n\nPlease confirm order and delivery window.`
  );

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            {locale === 'ar' ? 'عربة التسوق' : 'Shopping Cart'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {itemCount > 0
              ? locale === 'ar'
                ? `لديك ${itemCount} عناصر في عربة التسوق`
                : `You have ${itemCount} items in your cart`
              : locale === 'ar'
              ? 'عربة التسوق فارغة حالياً'
              : 'Your cart is currently empty'}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty State */
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg, 16px)',
              border: '1px solid var(--border-color)',
              padding: '60px 20px',
              textAlign: 'center',
              maxWidth: '520px',
              margin: '0 auto',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: 'var(--text-muted)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {locale === 'ar' ? 'العربة فارغة' : 'Your cart is empty'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6, fontSize: '0.9rem' }}>
              {locale === 'ar'
                ? 'تصفح منتجات طعموش، ابن الأصول، مزايا أو قسم العروض وأضف ما يعجبك للعربة'
                : 'Explore products from Taamoosh, Ibn El Asoul, Mazaya or Offers and add items to your cart'}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '12px 28px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--nicefood-green)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
              }}
            >
              {locale === 'ar' ? 'تصفح المنتجات الآن' : 'Start Shopping Now'}
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Items List */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg, 16px)',
                border: '1px solid var(--border-color)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '14px',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '16px',
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {locale === 'ar' ? 'المنتجات المطلوبة' : 'Order Items'}
                </h3>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  {locale === 'ar' ? 'تفريغ السلة' : 'Clear Cart'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {items.map((item) => {
                  const unitPrice = item.offerPrice || item.price;
                  const itemTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '12px',
                        background: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-md, 12px)',
                        border: '1px solid var(--border-color)',
                        flexWrap: 'wrap',
                      }}
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.image || '/images/brands/nicefood-logo.jpeg'}
                        alt={item.nameAr}
                        style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '8px',
                          objectFit: 'contain',
                          background: '#fff',
                          padding: '3px',
                          border: '1px solid var(--border-color)',
                        }}
                      />

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <div style={{ fontSize: '0.74rem', color: 'var(--nicefood-gold)', fontWeight: 600 }}>
                          {item.brandNameAr || item.brandName}
                        </div>
                        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0 2px' }}>
                          {locale === 'ar' ? item.nameAr : item.name}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {unitPrice} {currencySymbol} / {item.unit}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm, 8px)',
                          background: 'var(--bg-card)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '30px',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                          }}
                          aria-label="Decrease"
                        >
                          -
                        </button>
                        <span style={{ width: '28px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '30px',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                          }}
                          aria-label="Increase"
                        >
                          +
                        </button>
                      </div>

                      {/* Total & Delete */}
                      <div style={{ textAlign: locale === 'ar' ? 'left' : 'right', minWidth: '70px' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--nicefood-gold)' }}>
                          {itemTotal} {currencySymbol}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            fontSize: '0.74rem',
                            marginTop: '2px',
                          }}
                        >
                          {locale === 'ar' ? 'حذف' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <Link
                  href="/"
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  <span>{locale === 'ar' ? 'متابعة تسوق منتجات أخرى' : 'Continue Shopping'}</span>
                </Link>
              </div>
            </div>

            {/* Order Summary Box */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg, 16px)',
                border: '1px solid var(--border-color)',
                padding: '22px',
                position: 'sticky',
                top: '90px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '18px' }}>
                {locale === 'ar' ? 'ملخص الحساب' : 'Order Summary'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{total} {currencySymbol}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span>{locale === 'ar' ? 'خدمة التوصيل' : 'Delivery Fee'}</span>
                  <span style={{ fontWeight: 700, color: deliveryFee === 0 ? 'var(--nicefood-green)' : 'var(--text-primary)' }}>
                    {deliveryFee === 0 ? (locale === 'ar' ? 'مجاني (عرض)' : 'Free') : `${deliveryFee} ${currencySymbol}`}
                  </span>
                </div>

                <div
                  style={{
                    height: '1px',
                    background: 'var(--border-color)',
                    margin: '4px 0',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? 'الإجمالي النهائي' : 'Total'}
                  </span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--nicefood-gold)' }}>
                    {grandTotal} <span style={{ fontSize: '0.85rem' }}>{currencySymbol}</span>
                  </span>
                </div>
              </div>

              {/* Checkout Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/checkout"
                  className="liquid-btn"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '0.95rem',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <line x1="2" x2="22" y1="10" y2="10" />
                  </svg>
                  <span>{locale === 'ar' ? 'متابعة الدفع وتحديد اللوكيشن' : 'Proceed to Checkout'}</span>
                </Link>

                <a
                  href={`https://wa.me/201558580214?text=${whatsappOrderText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm, 8px)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textDecoration: 'none',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>{locale === 'ar' ? 'طلب فوري عبر واتساب' : 'Order via WhatsApp'}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
