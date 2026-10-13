'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/lib/locale-context';

interface CancelOrderButtonProps {
  orderId: string;
  currentStatus: string;
}

export default function CancelOrderButton({ orderId, currentStatus }: CancelOrderButtonProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(currentStatus === 'cancelled');

  const isAr = locale === 'ar';

  if (cancelled) {
    return (
      <div
        style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm, 8px)',
          fontWeight: 700,
          fontSize: '0.88rem',
          textAlign: 'center',
          marginTop: '10px',
        }}
      >
        {isAr ? 'تم إلغاء هذا الطلب بنجاح بناءً على رغبتك' : 'This order has been successfully cancelled'}
      </div>
    );
  }

  const handleCancel = async () => {
    const confirmed = window.confirm(
      isAr
        ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب نهائياً؟'
        : 'Are you sure you want to permanently cancel this order?'
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'cancelled',
          paymentStatus: 'failed',
        }),
      });

      if (res.ok) {
        setCancelled(true);
        router.refresh();
      } else {
        alert(
          isAr
            ? 'حدث خطأ أثناء محاولة إلغاء الطلب، يرجى التواصل مع خدمة العملاء'
            : 'Could not cancel order. Please contact customer support.'
        );
      }
    } catch (err) {
      console.error(err);
      alert(isAr ? 'فشل الاتصال بالخادم لإلغاء الطلب' : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      style={{
        width: '100%',
        padding: '12px 20px',
        borderRadius: 'var(--radius-sm, 8px)',
        background: '#fff',
        border: '1px solid #ef4444',
        color: '#dc2626',
        fontWeight: 600,
        fontSize: '0.9rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
      <span>
        {loading
          ? (isAr ? 'جاري إلغاء الطلب...' : 'Cancelling...')
          : (isAr ? 'إلغاء هذا الطلب نهائياً' : 'Cancel This Order')}
      </span>
    </button>
  );
}
