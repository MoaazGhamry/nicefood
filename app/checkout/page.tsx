'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useLocale } from '@/lib/locale-context';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const { locale, t } = useLocale();

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('العاشر من رمضان');
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('أسرع وقت ممكن (خلال ساعتين)');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'paymob' | 'wallet'>('cash');

  // GPS Location state
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locSuccess, setLocSuccess] = useState(false);
  const [detectedAddress, setDetectedAddress] = useState('');
  const [locError, setLocError] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const deliveryFee = total > 500 || total === 0 ? 0 : 35;
  const grandTotal = total + deliveryFee;

  // If user backed out or returned from Paymob without finishing payment -> cancel order immediately!
  useEffect(() => {
    const pendingOrderId = sessionStorage.getItem('nicefood_pending_paymob_order');
    if (pendingOrderId) {
      sessionStorage.removeItem('nicefood_pending_paymob_order');
      fetch(`/api/orders/${pendingOrderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'cancelled', paymentStatus: 'failed' }),
      }).catch(console.error);

      router.push(`/payment/failed?orderId=${pendingOrderId}&reason=user_returned`);
    }
  }, [router]);

  // Real Auto-detect location using Geolocation + Reverse Geocoding
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocError(locale === 'ar' ? 'المتصفح لا يدعم تحديد الموقع الجغرافي' : 'Browser does not support geolocation');
      return;
    }

    setLocLoading(true);
    setLocError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        setLat(latitude);
        setLng(longitude);

        try {
          // Reverse geocode via OpenStreetMap Nominatim for real Egyptian street & city
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=${locale === 'ar' ? 'ar' : 'en'}`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const road = addr.road || addr.street || '';
            const suburb = addr.suburb || addr.neighbourhood || addr.quarter || '';
            const detectedCity = addr.city || addr.town || addr.state_district || 'العاشر من رمضان';
            const state = addr.state || '';

            const parts = [road, suburb, detectedCity, state].filter(Boolean);
            const formatted = parts.length > 0 ? parts.join('، ') : `إحداثيات: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

            setDetectedAddress(formatted);
            setAddress(formatted);
            if (detectedCity.includes('رمضان') || detectedCity.includes('Ramadan')) {
              setCity('العاشر من رمضان');
            } else if (detectedCity.includes('القاهرة') || state.includes('القاهرة')) {
              setCity('القاهرة الكبرى');
            } else if (detectedCity.includes('الجيزة') || state.includes('الجيزة')) {
              setCity('الجيزة');
            }
          }
        } catch (fetchErr) {
          console.warn('Reverse geocode error, coordinates saved:', fetchErr);
          setAddress(`موقع محدد عبر الخريطة (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        } finally {
          setLocLoading(false);
          setLocSuccess(true);
        }
      },
      (err) => {
        setLocLoading(false);
        setLocError(
          locale === 'ar'
            ? 'تعذر تحديد الموقع تلقائياً. يرجى التأكد من تفعيل خدمة الموقع بالمتصفح أو كتابة العنوان يدوياً.'
            : 'Could not detect location. Please enable location services or enter address manually.'
        );
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(locale === 'ar' ? 'برجاء كتابة الاسم بالكامل' : 'Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setErrorMsg(locale === 'ar' ? 'برجاء كتابة رقم هاتف مصري صحيح (مثال: 01012345678)' : 'Please enter a valid phone number');
      return;
    }
    if (!address.trim()) {
      setErrorMsg(locale === 'ar' ? 'برجاء كتابة تفاصيل العنوان أو استخدام زر تحديد الموقع التلقائي' : 'Please enter your delivery address');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const fullAddress = `${city} - ${address}`;

      // Case 1: Paymob Online Gateway Payment
      if (paymentMethod === 'paymob') {
        const payRes = await fetch('/api/paymob/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: name,
            customerPhone: phone,
            customerAddress: fullAddress,
            customerLat: lat,
            customerLng: lng,
            deliveryTime,
            notes,
            items,
            total: grandTotal,
          }),
        });

        if (!payRes.ok) {
          throw new Error('فشل معالجة بوابة دفع Paymob');
        }

        const payData = await payRes.json();
        // Do not clear cart yet: if customer cancels or card fails, their items remain saved

        // If Paymob returned an iframe URL redirect to it, otherwise to confirmation
        if (payData.paymentUrl) {
          sessionStorage.setItem('nicefood_pending_paymob_order', payData.orderId);
          window.location.href = payData.paymentUrl;
        } else {
          clearCart();
          router.push(`/order-success/${payData.orderId}`);
        }
        return;
      }

      // Case 2: Cash on Delivery or Wallet transfer
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: name,
          customerPhone: phone,
          customerAddress: fullAddress,
          customerLat: lat,
          customerLng: lng,
          paymentMethod,
          deliveryTime,
          notes,
          items,
          total: grandTotal,
        }),
      });

      if (!res.ok) {
        throw new Error('فشل إرسال الطلب، برجاء المحاولة مرة أخرى');
      }

      const orderData = await res.json();
      clearCart();
      router.push(`/order-success/${orderData.id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'حدث خطأ أثناء معالجة الطلب');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '520px', margin: '70px auto', textAlign: 'center', padding: '0 20px' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
          {locale === 'ar' ? 'لا توجد منتجات في العربة' : 'No items in cart'}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          {locale === 'ar' ? 'أضف بعض المنتجات للمتابعة إلى صفحة الدفع' : 'Add products to proceed to checkout'}
        </p>
        <Link
          href="/"
          style={{
            padding: '10px 24px',
            background: 'var(--nicefood-green)',
            color: '#fff',
            borderRadius: 'var(--radius-full, 9999px)',
            fontWeight: 600,
            fontSize: '0.9rem',
            textDecoration: 'none',
          }}
        >
          {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px 80px' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {locale === 'ar' ? 'إتمام الطلب وتحديد اللوكيشن' : 'Checkout & Delivery Location'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {locale === 'ar'
              ? 'أدخل بيانات التوصيل وحدد موقعك بدقة لاختيار طريقة الدفع المناسبة'
              : 'Enter your delivery details and choose your preferred payment method'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#DC2626',
              padding: '12px 18px',
              borderRadius: 'var(--radius-sm, 8px)',
              marginBottom: '20px',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Form Fields Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* 1. Customer Info */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: '1px solid var(--border-color)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {locale === 'ar' ? 'بيانات العميل المستلم' : 'Customer Information'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                      {locale === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={locale === 'ar' ? 'أدخل اسمك الكريم' : 'Enter your name'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                      {locale === 'ar' ? 'رقم الهاتف (للتواصل ومتابعة التوصيل) *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                        direction: 'ltr',
                        textAlign: locale === 'ar' ? 'right' : 'left',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Auto Detect Location & Address */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: '1px solid var(--border-color)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {locale === 'ar' ? 'عنوان التوصيل واللوكيشن' : 'Delivery Address & GPS'}
                  </h3>

                  {/* Auto-detect Location Button */}
                  <button
                    type="button"
                    onClick={handleAutoDetectLocation}
                    disabled={locLoading}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      background: locSuccess ? 'rgba(31, 78, 56, 0.1)' : 'var(--bg-secondary)',
                      border: `1px solid ${locSuccess ? 'var(--nicefood-green)' : 'var(--border-color)'}`,
                      color: locSuccess ? 'var(--nicefood-green)' : 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: locLoading ? 'wait' : 'pointer',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="3 11 22 2 13 21 11 13 3 11" />
                    </svg>
                    <span>
                      {locLoading
                        ? (locale === 'ar' ? 'جاري تحديد اللوكيشن...' : 'Detecting GPS...')
                        : locSuccess
                        ? (locale === 'ar' ? 'تم تحديد موقعك بدقة' : 'Location Detected')
                        : (locale === 'ar' ? 'تحديد موقعي التلقائي (Auto-Detect)' : 'Auto-Detect My Location')}
                    </span>
                  </button>
                </div>

                {locSuccess && detectedAddress && (
                  <div
                    style={{
                      background: 'rgba(31, 78, 56, 0.08)',
                      border: '1px solid rgba(31, 78, 56, 0.25)',
                      color: 'var(--nicefood-green)',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      fontSize: '0.82rem',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>
                      {locale === 'ar'
                        ? `تم حفظ اللوكيشن تلقائياً: ${detectedAddress}`
                        : `Location saved: ${detectedAddress}`}
                    </span>
                  </div>
                )}

                {locError && (
                  <div
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.25)',
                      color: '#DC2626',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      fontSize: '0.82rem',
                      marginBottom: '14px',
                    }}
                  >
                    {locError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                      {locale === 'ar' ? 'المدينة / المنطقة *' : 'City / Region *'}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    >
                      <option value="العاشر من رمضان">العاشر من رمضان (المنطقة الصناعية والأحياء)</option>
                      <option value="القاهرة الكبرى">القاهرة الكبرى (التجمع، مدينة نصر، الشروق، المعادي)</option>
                      <option value="الجيزة">الجيزة (الشيخ زايد، 6 أكتوبر، الدقي)</option>
                      <option value="الشرقية">الشرقية (الزقازيق، بلبيس)</option>
                      <option value="محافظة أخرى">محافظة أخرى</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                      {locale === 'ar' ? 'العنوان التفصيلي (الشارع، رقم العمارة، الشقة) *' : 'Detailed Address *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder={locale === 'ar' ? 'اكتب تفاصيل العنوان أو انقر على تحديد اللوكيشن تلقائياً' : 'Street name, building number, apartment'}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                      {locale === 'ar' ? 'موعد التوصيل المفضل' : 'Preferred Delivery Time'}
                    </label>
                    <select
                      value={deliveryTime}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                      }}
                    >
                      <option value="أسرع وقت ممكن (خلال ساعتين)">
                        {locale === 'ar' ? 'أسرع وقت ممكن (خلال 2-4 ساعات)' : 'As soon as possible'}
                      </option>
                      <option value="الفترة الصباحية (10 صباحاً - 2 ظهراً)">
                        {locale === 'ar' ? 'الفترة الصباحية (10 ص - 2 ظ)' : 'Morning (10 AM - 2 PM)'}
                      </option>
                      <option value="الفترة المسائية (4 عصراً - 9 مساءً)">
                        {locale === 'ar' ? 'الفترة المسائية (4 م - 9 م)' : 'Evening (4 PM - 9 PM)'}
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. Payment Method with Paymob Integration */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: '1px solid var(--border-color)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                  {locale === 'ar' ? 'طريقة الدفع' : 'Payment Method'}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  {/* Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: `1.5px solid ${paymentMethod === 'cash' ? 'var(--nicefood-green)' : 'var(--border-color)'}`,
                      background: paymentMethod === 'cash' ? 'rgba(31, 78, 56, 0.05)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '4px' }}>
                      {locale === 'ar' ? 'كاش عند الاستلام' : 'Cash on Delivery'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {locale === 'ar' ? 'الدفع نقداً بعد استلام ومعاينة الطلب' : 'Pay in cash upon delivery'}
                    </div>
                  </div>

                  {/* Paymob / Visa */}
                  <div
                    onClick={() => setPaymentMethod('paymob')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: `1.5px solid ${paymentMethod === 'paymob' ? 'var(--nicefood-green)' : 'var(--border-color)'}`,
                      background: paymentMethod === 'paymob' ? 'rgba(31, 78, 56, 0.05)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        Paymob / فيزا وماستركارد
                      </div>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {locale === 'ar' ? 'دفع إلكتروني فوري عبر بوابة Paymob' : 'Pay via Paymob online gateway'}
                    </div>
                  </div>

                  {/* Wallet / InstaPay */}
                  <div
                    onClick={() => setPaymentMethod('wallet')}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: `1.5px solid ${paymentMethod === 'wallet' ? 'var(--nicefood-green)' : 'var(--border-color)'}`,
                      background: paymentMethod === 'wallet' ? 'rgba(31, 78, 56, 0.05)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '4px' }}>
                      {locale === 'ar' ? 'فودافون كاش / إنستاباي' : 'Wallet / InstaPay'}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {locale === 'ar' ? 'تحويل فوري إلى محفظة المصنع' : 'Direct transfer to factory line'}
                    </div>
                  </div>
                </div>

                {/* Details on chosen method */}
                {paymentMethod === 'paymob' && (
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.84rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      بوابة Paymob المعتمدة:
                    </div>
                    <div>
                      سيتم فتح نافذة الدفع الآمنة لـ Paymob لإتمام العملية باستخدام بطاقة فيزا أو ماستركارد أو ميزة وتأكيد الطلب تلقائياً فور نجاح الدفع.
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '16px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      border: '1.5px solid var(--nicefood-gold)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      رقم إنستاباي والمحافظ الإلكترونية (فودافون كاش / أورنج / وي / اتصالات):
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-card)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        margin: '8px 0',
                      }}
                    >
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--nicefood-green)', direction: 'ltr', letterSpacing: '1px' }}>
                        01558580214
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('01558580214');
                          alert('تم نسخ رقم المحفظة / إنستاباي بنجاح: 01558580214');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                        }}
                      >
                        نسخ الرقم 📋
                      </button>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                      ⚠️ <strong>ملاحظة هامة:</strong> قم بتحويل المبلغ ({grandTotal} ج.م) للرقم أعلاه. بعد الضغط على &quot;تأكيد الطلب&quot;، سيُطلب منك إرسال لقطة شاشة (سكرين شوت) بالتحويل عبر واتساب لمراجعتها واعتماد الطلب من الإدارة.
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Notes */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  border: '1px solid var(--border-color)',
                  padding: '22px',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {locale === 'ar' ? 'ملاحظات إضافية للمندوب أو المصنع (اختياري)' : 'Order Notes (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={locale === 'ar' ? 'مثال: يرجى الاتصال قبل الوصول بربع ساعة...' : 'Any delivery instructions...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm, 8px)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

            </div>

            {/* Order Review Sidebar */}
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
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                {locale === 'ar' ? `مراجعة المنتجات (${items.length})` : `Order Summary (${items.length})`}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto', marginBottom: '18px' }}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {locale === 'ar' ? item.nameAr : item.name}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                        {item.quantity} × {item.offerPrice || item.price} ج.م
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--nicefood-gold)' }}>
                      {(item.offerPrice || item.price) * item.quantity} ج.م
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{total} ج.م</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                  <span>{locale === 'ar' ? 'مصاريف الشحن' : 'Delivery Fee'}</span>
                  <span style={{ color: deliveryFee === 0 ? 'var(--nicefood-green)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {deliveryFee === 0 ? (locale === 'ar' ? 'مجاني' : 'Free') : `${deliveryFee} ج.م`}
                  </span>
                </div>
                <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {locale === 'ar' ? 'الإجمالي المطلوب' : 'Total'}
                  </span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--nicefood-gold)' }}>
                    {grandTotal} <span style={{ fontSize: '0.85rem' }}>ج.م</span>
                  </span>
                </div>
              </div>

              {/* Submit Order Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-full, 9999px)',
                  background: submitting ? 'var(--text-muted)' : 'var(--brand-gradient)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: submitting ? 'wait' : 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 6px 20px var(--brand-glow), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  transition: 'transform 0.2s ease, filter 0.2s ease',
                }}
              >
                {submitting ? (
                  <span>{locale === 'ar' ? 'جاري معالجة الطلب...' : 'Processing...'}</span>
                ) : (
                  <span>
                    {paymentMethod === 'paymob'
                      ? (locale === 'ar' ? `المتابعة لدفع ${grandTotal} ج.م عبر Paymob` : `Pay ${grandTotal} EGP via Paymob`)
                      : (locale === 'ar' ? `تأكيد الطلب (${grandTotal} ج.م)` : `Confirm Order (${grandTotal} EGP)`)}
                  </span>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
