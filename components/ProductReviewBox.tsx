'use client';

import React, { useState, useEffect } from 'react';
import { useLocale } from '@/lib/locale-context';

interface ProductReviewBoxProps {
  orderId: string;
  productId: string;
  productName: string;
  isDelivered: boolean;
  customerName?: string;
  customerPhone?: string;
  userId?: string;
}

export default function ProductReviewBox({
  orderId,
  productId,
  productName,
  isDelivered,
  customerName,
  customerPhone,
  userId,
}: ProductReviewBoxProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check if already reviewed
  useEffect(() => {
    if (!isDelivered) {
      setFetching(false);
      return;
    }

    let isMounted = true;
    fetch(`/api/reviews?orderId=${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && data.reviews) {
          const match = data.reviews.find((r: any) => r.productId === productId);
          if (match) {
            setExistingReview(match);
            setRating(match.rating);
            setComment(match.comment || '');
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (isMounted) setFetching(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId, productId, isDelivered]);

  if (!isDelivered) {
    return null; // Rating is only enabled after delivery
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productId,
          rating,
          comment,
          customerName: customerName || (isAr ? 'عميل نايس فود' : 'NiceFood Customer'),
          customerPhone,
          userId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isAr ? 'فشل إرسال التقييم' : 'Failed to submit review'));
      }

      setExistingReview(data.review);
      setIsEditing(false);
      setSuccessMsg(
        isAr
          ? 'تم حفظ تقييمك بنجاح! شكراً لمشاركتك رأيك 🌟'
          : 'Your review was saved successfully! Thank you for your feedback 🌟'
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || (isAr ? 'حدث خطأ أثناء حفظ التقييم' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return isAr ? 'ممتاز ولذيذ جداً 🌟' : 'Excellent & Delicious 🌟';
      case 4:
        return isAr ? 'جيد جداً 👍' : 'Very Good 👍';
      case 3:
        return isAr ? 'جيد وطيب 😊' : 'Good 😊';
      case 2:
        return isAr ? 'مقبول 😐' : 'Fair 😐';
      case 1:
        return isAr ? 'يحتاج تحسين ⚠️' : 'Needs Improvement ⚠️';
      default:
        return '';
    }
  };

  if (fetching) {
    return null;
  }

  // State A: Already reviewed and not editing
  if (existingReview && !isEditing) {
    return (
      <div
        style={{
          marginTop: '8px',
          padding: '10px 14px',
          background: '#fefce8',
          borderRadius: '10px',
          border: '1px solid #fef08a',
          fontSize: '0.82rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#854d0e', fontWeight: 700 }}>
              {isAr ? 'تقييمك للمنتج:' : 'Your Rating:'}
            </span>
            <span style={{ color: '#eab308', fontSize: '1rem', letterSpacing: '2px' }}>
              {'★'.repeat(existingReview.rating)}
              {'☆'.repeat(5 - existingReview.rating)}
            </span>
            <span style={{ color: '#a16207', fontWeight: 600 }}>({getRatingLabel(existingReview.rating)})</span>
          </div>
          {existingReview.comment && (
            <div style={{ color: '#713f12', marginTop: '3px', fontStyle: 'italic' }}>
              &ldquo;{existingReview.comment}&rdquo;
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #ca8a04',
            background: '#ffffff',
            color: '#854d0e',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isAr ? 'تعديل التقييم' : 'Edit Review'}
        </button>
      </div>
    );
  }

  // State B: Needs review or currently editing
  return (
    <div
      style={{
        marginTop: '10px',
        padding: '12px 14px',
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#1e293b' }}>
          {isAr ? '⭐ قيم جودة هذا المنتج بعد التوصيل:' : '⭐ Rate this product after delivery:'}
        </span>
        {isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '0.75rem',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Star rating selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', direction: 'ltr' }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.4rem',
                    color: active ? '#f59e0b' : '#cbd5e1',
                    cursor: 'pointer',
                    padding: '2px',
                    lineHeight: 1,
                    transition: 'transform 0.15s ease',
                    transform: active ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={`${star} stars`}
                >
                  ★
                </button>
              );
            })}
          </div>
          <span style={{ fontSize: '0.8rem', color: '#b45309', fontWeight: 600 }}>
            {getRatingLabel(hoverRating || rating)}
          </span>
        </div>

        {/* Comment field */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={
              isAr
                ? 'اكتب تعليقك حول الطعم والجودة (اختياري)...'
                : 'Write your feedback on taste & quality (optional)...'
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.82rem',
              outline: 'none',
              background: '#f8fafc',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            {loading
              ? (isAr ? 'جاري الحفظ...' : 'Saving...')
              : (isAr ? 'إرسال التقييم' : 'Submit')}
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px' }}>{errorMsg}</div>
        )}
        {successMsg && (
          <div style={{ color: '#16a34a', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600 }}>
            {successMsg}
          </div>
        )}
      </form>
    </div>
  );
}
