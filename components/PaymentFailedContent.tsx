'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';

interface PaymentFailedContentProps {
  order: any;
}

export default function PaymentFailedContent({ order }: PaymentFailedContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const currencySymbol = isAr ? 'ج.م' : 'EGP';

  const whatsappMsg = encodeURIComponent(
    isAr
      ? `مرحباً، حدثت مشكلة أثناء الدفع الإلكتروني للطلب ${order ? `#${order.id.slice(-6).toUpperCase()}` : ''}. أود المساعدة أو تأكيد الطلب كاش عند الاستلام.`
      : `Hello, an issue occurred during online payment for order ${order ? `#${order.id.slice(-6).toUpperCase()}` : ''}. I would like assistance or to switch to cash on delivery.`
  );

  return (
    <div style={{ minHeight: '100vh', padding: '50px 20px 90px' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid #fee2e2',
            padding: '38px 26px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(239, 68, 68, 0.08)',
          }}
        >
          {/* Failed Cross Icon */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 24px rgba(239, 68, 68, 0.35)',
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#dc2626',
              marginBottom: '10px',
            }}
          >
            {isAr ? 'فشل عملية الدفع - الطلب ملغي' : 'Payment Failed - Order Cancelled'}
          </h1>

          <p
            style={{
              color: 'var(--text-secondary, #475569)',
              fontSize: '0.98rem',
              lineHeight: 1.65,
              marginBottom: '22px',
            }}
          >
            {isAr ? (
              <>
                لم يتم استكمال عملية الدفع بنجاح أو تم إلغاؤها من قبل المستخدم أو البنك.
                <br />
                <strong>تم رفض هذا الطلب وإلغاؤه نهائياً ولن يتم تنفيذه أو خصم أي مبالغ.</strong>
              </>
            ) : (
              <>
                The payment transaction could not be completed or was cancelled by the cardholder/bank.
                <br />
                <strong>This order has been cancelled and no charges were made.</strong>
              </>
            )}
          </p>

          {/* Cancelled Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              padding: '8px 20px',
              borderRadius: 'var(--radius-full, 9999px)',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginBottom: '26px',
            }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
            {order
              ? (isAr ? `حالة الطلب #${order.id.slice(-6).toUpperCase()}: ملغي ومرفوض` : `Order #${order.id.slice(-6).toUpperCase()}: Cancelled`)
              : (isAr ? 'حالة العملية: ملغية وغير معتمدة' : 'Status: Transaction Cancelled')}
          </div>

          {/* Order Details if available */}
          {order && (
            <div
              style={{
                background: 'var(--bg-secondary, #f8fafc)',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color, #e2e8f0)',
                padding: '18px',
                textAlign: isAr ? 'right' : 'left',
                marginBottom: '26px',
                fontSize: '0.88rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>{isAr ? 'العميل:' : 'Customer:'}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>{order.customerName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>{isAr ? 'رقم الهاتف:' : 'Phone:'}</span>
                <span style={{ fontWeight: 600, direction: 'ltr' }}>{order.customerPhone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted, #64748b)' }}>{isAr ? 'طريقة الدفع المختارة:' : 'Payment Method:'}</span>
                <span style={{ fontWeight: 600, color: '#dc2626' }}>
                  {isAr ? 'Paymob فيزا (فشلت أو أُلغيت)' : 'Paymob Visa (Failed / Cancelled)'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed #cbd5e1' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>{isAr ? 'قيمة المحاولة:' : 'Attempted Total:'}</span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
                  {order.total} {currencySymbol}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link
              href="/checkout"
              style={{
                padding: '14px 22px',
                borderRadius: 'var(--radius-sm, 10px)',
                background: 'var(--nicefood-green, #00873a)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.96rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 135, 58, 0.25)',
              }}
            >
              <span>{isAr ? 'إعادة المحاولة ببطاقة أخرى أو طريقة دفع بديلة' : 'Retry with Another Card or Cash on Delivery'}</span>
              <span>{isAr ? '←' : '→'}</span>
            </Link>

            <a
              href={`https://wa.me/201558580214?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-sm, 10px)',
                background: '#16a34a',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.92rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{isAr ? 'طلب المساعدة عبر واتساب (+20 155 858 0214)' : 'Get Help on WhatsApp (+20 155 858 0214)'}</span>
            </a>

            <Link
              href="/"
              style={{
                padding: '12px 20px',
                borderRadius: 'var(--radius-sm, 10px)',
                background: 'var(--bg-secondary, #f1f5f9)',
                border: '1px solid var(--border-color, #e2e8f0)',
                color: 'var(--text-secondary, #475569)',
                fontWeight: 600,
                fontSize: '0.9rem',
                textDecoration: 'none',
              }}
            >
              {isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
