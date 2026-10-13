'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import CancelOrderButton from '@/components/CancelOrderButton';

interface OrderSuccessContentProps {
  order: any;
}

export default function OrderSuccessContent({ order }: OrderSuccessContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const currencySymbol = isAr ? 'ج.م' : 'EGP';

  const mapsUrl =
    order.customerLat && order.customerLng
      ? `https://www.google.com/maps?q=${order.customerLat},${order.customerLng}`
      : null;

  const isWalletPending =
    (order.paymentMethod === 'wallet' || order.paymentMethod.includes('instapay')) &&
    order.paymentStatus !== 'paid';

  // WhatsApp transfer screenshot message
  const whatsappScreenshotMsg = encodeURIComponent(
    isAr
      ? `*إرسال إيصال تحويل إنستاباي / محفظة - مصنع NiceFood*\n` +
          `*رقم الطلب:* #${order.id.slice(-6).toUpperCase()}\n` +
          `*اسم العميل:* ${order.customerName}\n` +
          `*رقم الهاتف:* ${order.customerPhone}\n` +
          `*المبلغ المحول:* ${order.total} ج.م\n` +
          `*طريقة التحويل:* إنستاباي / محفظة إلكترونية للرقم 01558580214\n\n` +
          `مرفق صورة لقطة الشاشة (سكرين شوت) بالتحويل للمراجعة والموافقة على الطلب.`
      : `*InstaPay / Wallet Transfer Receipt - NiceFood*\n` +
          `*Order ID:* #${order.id.slice(-6).toUpperCase()}\n` +
          `*Customer Name:* ${order.customerName}\n` +
          `*Phone:* ${order.customerPhone}\n` +
          `*Amount:* ${order.total} EGP\n` +
          `*Transfer destination:* 01558580214\n\n` +
          `Attached screenshot of the transfer for verification & confirmation.`
  );

  // WhatsApp general confirmation text
  const whatsappMsg = encodeURIComponent(
    isAr
      ? `*تأكيد طلب من موقع NiceFood*\n` +
          `*رقم الطلب:* #${order.id.slice(-6).toUpperCase()}\n` +
          `*اسم العميل:* ${order.customerName}\n` +
          `*رقم الهاتف:* ${order.customerPhone}\n` +
          `*العنوان:* ${order.customerAddress}\n` +
          (mapsUrl ? `*موقع الخريطة:* ${mapsUrl}\n` : '') +
          `*طريقة الدفع:* ${
            order.paymentMethod === 'paymob_visa' || order.paymentMethod === 'paymob'
              ? 'بوابة Paymob / فيزا (مدفوع)'
              : isWalletPending
              ? 'فودافون كاش / إنستاباي (بانتظار الموافقة)'
              : 'كاش عند الاستلام'
          }\n` +
          `*الموعد المفضل:* ${order.deliveryTime}\n\n` +
          `*المنتجات المطلوبة:*\n` +
          order.items
            .map(
              (item: any, i: number) =>
                `${i + 1}. ${item.product?.nameAr || item.product?.name} (${item.product?.brand?.nameAr || item.product?.brand?.name}) - الكمية: ${item.quantity} ${item.product?.unit || 'كجم'} = ${item.total} ج.م`
            )
            .join('\n') +
          `\n\n*الإجمالي المطلوب:* ${order.total} ج.م`
      : `*Order Confirmation - NiceFood Website*\n` +
          `*Order ID:* #${order.id.slice(-6).toUpperCase()}\n` +
          `*Customer Name:* ${order.customerName}\n` +
          `*Phone:* ${order.customerPhone}\n` +
          `*Address:* ${order.customerAddress}\n` +
          (mapsUrl ? `*GPS Map Location:* ${mapsUrl}\n` : '') +
          `*Payment Method:* ${
            order.paymentMethod === 'paymob_visa' || order.paymentMethod === 'paymob'
              ? 'Paymob Gateway / Visa (Paid)'
              : isWalletPending
              ? 'Wallet / InstaPay (Pending Verification)'
              : 'Cash on Delivery'
          }\n` +
          `*Delivery Time:* ${order.deliveryTime}\n\n` +
          `*Items:*\n` +
          order.items
            .map(
              (item: any, i: number) =>
                `${i + 1}. ${item.product?.name || item.product?.nameAr} (${item.product?.brand?.name || item.product?.brand?.nameAr}) - Qty: ${item.quantity} ${item.product?.unit || 'kg'} = ${item.total} EGP`
            )
            .join('\n') +
          `\n\n*Total Amount:* ${order.total} EGP`
  );

  return (
    <div style={{ minHeight: '100vh', padding: '50px 20px 90px' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>
        {/* Success Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-color)',
            padding: '36px 26px',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Status Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: isWalletPending ? '#d97706' : 'var(--nicefood-green)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
            }}
          >
            {isWalletPending ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>

          <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {isWalletPending
              ? (isAr ? 'طلبك قيد الانتظار - بانتظار سكرين شوت التحويل' : 'Order Pending - Awaiting Transfer Screenshot')
              : (isAr ? 'تم استلام وتأكيد طلبك بنجاح' : 'Order Placed & Confirmed Successfully')}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '20px' }}>
            {isWalletPending ? (
              isAr ? (
                <>
                  يرجى تحويل المبلغ المطلوب (<strong>{order.total} ج.م</strong>) عبر إنستاباي أو المحفظة لرقم المصنع، ثم إرسال لقطة الشاشة (سكرين شوت) عبر واتساب لمراجعتها واعتماد الطلب من الإدارة.
                </>
              ) : (
                <>
                  Please transfer the order total (<strong>{order.total} EGP</strong>) via InstaPay or Mobile Wallet to the factory line, then share the screenshot on WhatsApp for admin verification.
                </>
              )
            ) : (
              isAr ? (
                <>
                  شكراً لطلبك من <strong>مجموعة مصانع NiceFood</strong>. جاري تجهيز الطلبية فوراً في خطوط الإنتاج والتعبئة.
                </>
              ) : (
                <>
                  Thank you for your order with <strong>NiceFood Manufacturing Group</strong>. Your order is being prepared and packed fresh from the factory.
                </>
              )
            )}
          </p>

          {/* Wallet Transfer Alert Box */}
          {isWalletPending && (
            <div
              style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderRadius: 'var(--radius-md, 12px)',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '24px',
              }}
            >
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
                {isAr
                  ? 'رقم التحويل (إنستاباي / فودافون كاش / المحافظ الإلكترونية):'
                  : 'Transfer Destination (InstaPay / Vodafone Cash / Wallets):'}
              </div>
              <div
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#b45309',
                  direction: 'ltr',
                  letterSpacing: '1px',
                  marginBottom: '10px',
                }}
              >
                01558580214
              </div>
              <div style={{ fontSize: '0.85rem', color: '#78350f', marginBottom: '16px' }}>
                {isAr ? 'المبلغ المطلوب تحويله:' : 'Amount to transfer:'} <strong>{order.total} {currencySymbol}</strong>
              </div>
              <a
                href={`https://wa.me/201558580214?text=${whatsappScreenshotMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#16a34a',
                  color: '#fff',
                  borderRadius: 'var(--radius-sm, 8px)',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>{isAr ? 'إرسال سكرين شوت التحويل عبر واتساب الآن' : 'Send Transfer Screenshot on WhatsApp Now'}</span>
              </a>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '28px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                padding: '6px 20px',
                borderRadius: 'var(--radius-full, 9999px)',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              {isAr ? 'رقم الطلب:' : 'Order ID:'} #{order.id.slice(-6).toUpperCase()}
            </div>

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                padding: '6px 20px',
                borderRadius: 'var(--radius-full, 9999px)',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{isAr ? '🔐 كود الاستلام:' : '🔐 Handover Code:'}</span>
              <span style={{ letterSpacing: '1px', fontFamily: 'monospace', fontWeight: 900 }}>
                {order.deliveryCode || order.id.slice(-4).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Order Details Box */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md, 12px)',
              border: '1px solid var(--border-color)',
              padding: '20px',
              textAlign: isAr ? 'right' : 'left',
              marginBottom: '28px',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              {isAr ? 'تفاصيل التوصيل والبيانات:' : 'Delivery & Customer Details:'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAr ? 'الاسم:' : 'Name:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.customerName}</div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', direction: 'ltr', textAlign: isAr ? 'right' : 'left' }}>
                  {order.customerPhone}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAr ? 'طريقة الدفع:' : 'Payment Method:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--nicefood-gold)' }}>
                  {order.paymentMethod === 'paymob_visa' || order.paymentMethod === 'paymob'
                    ? (isAr ? 'بوابة Paymob / فيزا (مدفوع)' : 'Paymob Visa / Card (Paid)')
                    : order.paymentMethod === 'wallet'
                    ? (isAr ? 'محفظة إلكترونية' : 'E-Wallet / InstaPay')
                    : (isAr ? 'كاش عند الاستلام' : 'Cash on Delivery')}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAr ? 'موعد التوصيل:' : 'Delivery Time:'}</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{order.deliveryTime}</div>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isAr ? 'العنوان:' : 'Address:'}</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.5 }}>{order.customerAddress}</div>
            </div>

            {mapsUrl && (
              <div style={{ marginBottom: '16px' }}>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--nicefood-green)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="3 11 22 2 13 21 11 13 3 11" />
                  </svg>
                  <span>{isAr ? 'عرض اللوكيشن المحفوظ على خرائط Google ↗' : 'View Saved GPS Location on Google Maps ↗'}</span>
                </a>
              </div>
            )}

            {/* Items Summary Table */}
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isAr ? 'المنتجات:' : 'Order Items:'}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {order.items.map((item: any) => {
                const prodName = isAr ? (item.product?.nameAr || item.product?.name) : item.product?.name;
                const brandName = isAr ? (item.product?.brand?.nameAr || item.product?.brand?.name) : item.product?.brand?.name;

                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      padding: '4px 0',
                      borderBottom: '1px solid var(--border-color)',
                    }}
                  >
                    <span>
                      {prodName} {brandName && `(${brandName})`} × {item.quantity} {item.product?.unit || (isAr ? 'كجم' : 'kg')}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.total} {currencySymbol}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-color)', alignItems: 'baseline' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isAr ? 'الإجمالي الكلي:' : 'Total Amount:'}
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--nicefood-gold)' }}>
                {order.total} {currencySymbol}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a
              href={`https://wa.me/201558580214?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '14px 20px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: '#1B8A4D',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{isAr ? 'إرسال تفاصيل الطلب لمندوب المصنع عبر واتساب' : 'Share Order Details with Support on WhatsApp'}</span>
            </a>

            <Link
              href="/my-orders"
              style={{
                padding: '13px 20px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                textAlign: 'center',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              }}
            >
              <span>📦</span>
              <span>{isAr ? 'عرض ومتابعة حالة كل طلباتي' : 'Track and View All My Orders'}</span>
            </Link>

            <Link
              href="/"
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              {isAr ? 'العودة للرئيسية وتسوق المزيد' : 'Return to Home & Shop More'}
            </Link>

            {/* Cancel Order Option */}
            <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
              <CancelOrderButton orderId={order.id} currentStatus={order.orderStatus} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
