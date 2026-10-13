'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { useLocale } from '@/lib/locale-context';
import ProductReviewBox from '@/components/ProductReviewBox';

export default function MyOrdersPage() {
  const router = useRouter();
  const { customer, isLoading, logout } = useCustomerAuth();
  const { locale } = useLocale();

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrders = async () => {
    if (!customer) return;
    setLoadingOrders(true);
    setErrorMsg('');
    try {
      const res = await fetch(`/api/customer/orders?userId=${customer.id}&phone=${encodeURIComponent(customer.phone)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      } else {
        setErrorMsg(data.error || 'فشل تحميل الطلبات');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ في جلب الطلبات');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (customer) {
        fetchOrders();
      } else {
        setLoadingOrders(false);
      }
    }
  }, [customer, isLoading]);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟' : 'Are you sure you want to cancel this order?')) {
      return;
    }

    setCancellingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'cancelled' }),
      });

      if (res.ok) {
        // Update local state
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'cancelled' } : o))
        );
      } else {
        alert(locale === 'ar' ? 'تعذر إلغاء الطلب حالياً، يرجى التواصل مع خدمة العملاء' : 'Could not cancel order');
      }
    } catch (e) {
      console.error(e);
      alert(locale === 'ar' ? 'حدث خطأ أثناء إلغاء الطلب' : 'Error cancelling order');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: locale === 'ar' ? 'قيد المراجعة والانتظار' : 'Pending',
          bg: '#fef3c7',
          color: '#92400e',
          icon: '⏳',
        };
      case 'confirmed':
        return {
          label: locale === 'ar' ? 'تم التأكيد وجاري التجهيز' : 'Confirmed',
          bg: '#e0f2fe',
          color: '#0369a1',
          icon: '⚙️',
        };
      case 'preparing':
        return {
          label: locale === 'ar' ? 'جاري تجهيز الطلب' : 'Preparing',
          bg: '#e0e7ff',
          color: '#4338ca',
          icon: '📦',
        };
      case 'delivering':
      case 'out_for_delivery':
        return {
          label: locale === 'ar' ? 'في الطريق للتوصيل' : 'Out for Delivery',
          bg: '#fae8ff',
          color: '#86198f',
          icon: '🛵',
        };
      case 'delivered':
        return {
          label: locale === 'ar' ? 'تم التوصيل بنجاح' : 'Delivered',
          bg: '#dcfce7',
          color: '#15803d',
          icon: '✅',
        };
      case 'cancelled':
        return {
          label: locale === 'ar' ? 'تم إلغاء الطلب' : 'Cancelled',
          bg: '#fee2e2',
          color: '#b91c1c',
          icon: '❌',
        };
      default:
        return {
          label: status,
          bg: '#f3f4f6',
          color: '#374151',
          icon: '📋',
        };
    }
  };

  const getPaymentBadge = (method: string, status: string) => {
    let methodText = locale === 'ar' ? 'نقداً عند الاستلام' : 'Cash on Delivery';
    if (method.includes('visa') || method.includes('paymob')) {
      methodText = locale === 'ar' ? 'بطاقة بنكية (Paymob)' : 'Card (Paymob)';
    } else if (method === 'wallet' || method.includes('instapay')) {
      methodText = locale === 'ar' ? 'إنستا باي / محفظة (01558580214)' : 'InstaPay / Wallet';
    }

    let statusText = status === 'paid' ? (locale === 'ar' ? 'مدفوع' : 'Paid') : (locale === 'ar' ? 'في انتظار السداد' : 'Pending Payment');
    if (status === 'failed') statusText = locale === 'ar' ? 'فشل الدفع' : 'Payment Failed';

    return { methodText, statusText };
  };

  // 1. Loading screen
  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666', fontSize: '1rem' }}>{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
      </div>
    );
  }

  // 2. Not logged in state
  if (!customer) {
    return (
      <div style={{ maxWidth: '520px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '36px 24px',
            border: '1px solid #ebebeb',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔐</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111', marginBottom: '8px' }}>
            {locale === 'ar' ? 'سجل دخولك لعرض طلباتك' : 'Log in to view your orders'}
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#666', lineHeight: 1.6, marginBottom: '24px' }}>
            {locale === 'ar'
              ? 'قم بتسجيل الدخول أو إنشاء حساب جديد برقم هاتفك لمتابعة حالة كل طلباتك وتاريخ مشترياتك في نايس فود'
              : 'Please log in or create an account with your phone number to track your orders.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/login?redirect=/my-orders"
              style={{
                display: 'block',
                padding: '12px 24px',
                background: '#16a34a',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.95rem',
              }}
            >
              {locale === 'ar' ? 'تسجيل الدخول / إنشاء حساب' : 'Log In / Register'}
            </Link>
            <Link
              href="/"
              style={{
                display: 'block',
                padding: '12px 24px',
                background: '#f4f5f7',
                color: '#333',
                borderRadius: '12px',
                fontWeight: 600,
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              {locale === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Logged in customer view
  return (
    <div style={{ minHeight: '100vh', padding: '24px 14px 130px', background: 'var(--bg-primary, #f8fafc)' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        
        {/* Customer Profile Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            marginBottom: '24px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
              }}
            >
              {customer.name ? customer.name.charAt(0) : '👤'}
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {locale === 'ar' ? `مرحباً، ${customer.name}` : `Welcome, ${customer.name}`}
              </h1>
              <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ fontWeight: 600 }}>📱 {customer.phone}</span>
                {customer.address && (
                  <span style={{ wordBreak: 'break-word', color: '#475569' }}>
                    📍 {customer.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '280px' }}>
            <Link
              href="/"
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#f8fafc',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                textAlign: 'center',
              }}
            >
              {locale === 'ar' ? 'تسوق المزيد' : 'Shop'}
            </Link>
            <button
              type="button"
              onClick={logout}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              {locale === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
            </button>
          </div>
        </div>

        {/* Section title & count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', margin: 0 }}>
            {locale === 'ar' ? 'سجل طلباتي' : 'My Orders'} ({orders.length})
          </h2>
          <button
            type="button"
            onClick={fetchOrders}
            style={{
              background: 'none',
              border: 'none',
              color: '#16a34a',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>🔄</span>
            <span>{locale === 'ar' ? 'تحديث الطلبات' : 'Refresh'}</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#fef2f2',
              color: '#b91c1c',
              fontSize: '0.9rem',
              marginBottom: '16px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Orders list */}
        {loadingOrders ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {locale === 'ar' ? 'جاري جلب الطلبات...' : 'Fetching your orders...'}
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '48px 20px',
              textAlign: 'center',
              border: '1px solid #ebebeb',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🛍️</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#222', marginBottom: '6px' }}>
              {locale === 'ar' ? 'لا توجد لديك طلبات سابقة حتى الآن' : 'No previous orders yet'}
            </h3>
            <p style={{ color: '#666', fontSize: '0.88rem', marginBottom: '20px' }}>
              {locale === 'ar' ? 'اختر ما يناسبك من منتجات طعموش، ابن الأصول، ومزايا واطلب الآن!' : 'Explore our brands and place your first order!'}
            </p>
            <Link
              href="/"
              style={{
                display: 'inline-block',
                padding: '10px 24px',
                background: '#16a34a',
                color: '#fff',
                borderRadius: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                fontSize: '0.9rem',
              }}
            >
              {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => {
              const isAr = locale === 'ar';
              const currencySymbol = isAr ? 'ج.م' : 'EGP';
              const statusInfo = getStatusBadge(order.orderStatus);
              const paymentInfo = getPaymentBadge(order.paymentMethod, order.paymentStatus);
              const isCancellable = order.orderStatus === 'pending' || order.orderStatus === 'confirmed';
              const isWalletPending = (order.paymentMethod === 'wallet' || order.paymentMethod.includes('instapay')) && order.paymentStatus === 'pending';

              const orderDate = new Date(order.createdAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const whatsappInquiryUrl = `https://wa.me/201558580214?text=${encodeURIComponent(
                isAr
                  ? `مرحباً، أود الاستفسار عن طلبي رقم #${order.id.slice(-6)} بقيمة ${order.total} ج.م`
                  : `Hello, I would like to inquire about my order #${order.id.slice(-6)} (${order.total} EGP)`
              )}`;

              const whatsappReceiptUrl = `https://wa.me/201558580214?text=${encodeURIComponent(
                isAr
                  ? `مرحباً، مرفق إيصال تحويل إنستا باي/المحفظة للطلب رقم #${order.id.slice(-6)} بقيمة ${order.total} ج.م - الاسم: ${customer.name}`
                  : `Hello, attached is the InstaPay/wallet transfer receipt for order #${order.id.slice(-6)} (${order.total} EGP) - Name: ${customer.name}`
              )}`;

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #e8e8e8',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top order header */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f0f0f0',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111' }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>
                          ({orderDate})
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#666', marginTop: '4px' }}>
                        {paymentInfo.methodText} •{' '}
                        <span
                          style={{
                            color: order.paymentStatus === 'paid' ? '#15803d' : '#d97706',
                            fontWeight: 600,
                          }}
                        >
                          {paymentInfo.statusText}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{statusInfo.icon}</span>
                      <span>{statusInfo.label}</span>
                    </div>
                  </div>

                  {/* Customer Delivery Code (OTP) Banner - ONLY when driver has taken the order (orderStatus === 'delivering') */}
                  {order.orderStatus === 'delivering' && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '2px solid #86efac',
                        borderRadius: '14px',
                        padding: '12px 16px',
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                        boxShadow: '0 4px 14px rgba(22, 163, 74, 0.08)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.92rem', color: '#166534', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>🔐</span>
                          <span>{isAr ? 'كود استلام الطلب (أعطه للمندوب):' : 'Handover Verification OTP:'}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#15803d', marginTop: '2px' }}>
                          {isAr
                            ? 'كابتن التوصيل في الطريق إليك الآن! أعطه هذا الكود عند الاستلام لتأكيد شحنتك.'
                            : 'The delivery captain is on the way! Provide this code upon receiving your order.'}
                        </div>
                        {order.driverName && (
                          <div style={{ marginTop: '5px', color: '#1e40af', fontWeight: 700, fontSize: '0.82rem' }}>
                            🛵 {isAr ? 'كابتن التوصيل:' : 'Driver:'} {order.driverName} {order.driverPhone && `(📱 ${order.driverPhone})`}
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          background: '#ffffff',
                          border: '2px solid #16a34a',
                          padding: '6px 16px',
                          borderRadius: '10px',
                          fontWeight: 900,
                          fontSize: '1.35rem',
                          letterSpacing: '3px',
                          color: '#15803d',
                          fontFamily: 'monospace',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}
                      >
                        {order.deliveryCode || order.id.slice(-4).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {/* Prior stages message: code will appear when driver picks up */}
                  {(order.orderStatus === 'pending' || order.orderStatus === 'confirmed' || order.orderStatus === 'preparing') && (
                    <div
                      style={{
                        background: '#f8fafc',
                        border: '1px dashed #cbd5e1',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        marginBottom: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>🛵</span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                        <strong style={{ color: '#334155' }}>{isAr ? 'كود الاستلام:' : 'Handover OTP:'}</strong>{' '}
                        {isAr
                          ? 'سيظهر كود الاستلام السري هنا تلقائياً فور انطلاق كابتن التوصيل بالطلب إليك.'
                          : 'Your secret delivery OTP will appear here once the delivery driver picks up your order.'}
                      </div>
                    </div>
                  )}

                  {/* Pending Wallet Alert Banner */}
                  {isWalletPending && order.orderStatus !== 'cancelled' && (
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        marginBottom: '16px',
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div style={{ fontSize: '0.84rem', color: '#92400e', lineHeight: 1.5 }}>
                        <strong>{isAr ? '⚠️ مطلوب إرسال صورة التحويل:' : '⚠️ Transfer Screenshot Required:'}</strong>{' '}
                        {isAr ? 'يرجى إرسال سكرين شوت بالتحويل على الرقم' : 'Please send a transfer screenshot to'}{' '}
                        <strong>01558580214</strong> {isAr ? 'لاعتماد الطلب فوراً.' : 'for instant verification.'}
                      </div>
                      <a
                        href={whatsappReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '6px 14px',
                          background: '#25D366',
                          color: '#fff',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>📸</span>
                        <span>{isAr ? 'إرسال الإيصال واتساب' : 'Send Screenshot on WhatsApp'}</span>
                      </a>
                    </div>
                  )}

                  {/* Delivered Rating Encouragement Banner */}
                  {order.orderStatus === 'delivered' && (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        marginBottom: '14px',
                        fontSize: '0.84rem',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        lineHeight: 1.4,
                      }}
                    >
                      <span>🌟</span>
                      <span>
                        {isAr
                          ? 'تم تسليم طلبك بنجاح! يسعدنا تقييمك للمنتجات بالأسفل لمساعدتنا على تقديم أفضل جودة دائماً.'
                          : 'Order delivered successfully! Please rate the products below to help us maintain top quality.'}
                      </span>
                    </div>
                  )}

                  {/* Order items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                    {order.items?.map((item: any, idx: number) => {
                      const prodName = isAr ? (item.product?.nameAr || item.product?.name) : item.product?.name;
                      const brandName = isAr ? (item.product?.brand?.nameAr || item.product?.brand?.name) : item.product?.brand?.name;

                      return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '10px 14px',
                              background: '#fbfbfb',
                              borderRadius: '12px',
                              border: '1px solid #f0f0f0',
                              fontSize: '0.88rem',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              {item.product?.imageUrl && (
                                <img
                                  src={item.product.imageUrl}
                                  alt={prodName}
                                  style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'contain' }}
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, color: '#222' }}>{prodName}</div>
                                {brandName && <div style={{ fontSize: '0.75rem', color: '#888' }}>{brandName}</div>}
                              </div>
                            </div>

                            <div style={{ textAlign: isAr ? 'left' : 'right' }}>
                              <span style={{ color: '#666' }}>{item.quantity} × {item.price} {currencySymbol}</span>
                              <div style={{ fontWeight: 700, color: '#111' }}>
                                {(item.quantity * item.price).toFixed(0)} {currencySymbol}
                              </div>
                            </div>
                          </div>

                          {/* Post-Delivery Rating Box */}
                          {order.orderStatus === 'delivered' && (
                            <ProductReviewBox
                              orderId={order.id}
                              productId={item.productId}
                              productName={prodName}
                              isDelivered={true}
                              customerName={customer?.name || order.customerName}
                              customerPhone={customer?.phone || order.customerPhone}
                              userId={customer?.id || order.userId}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Delivery details & total */}
                  <div
                    style={{
                      paddingTop: '14px',
                      borderTop: '1px solid #f1f5f9',
                      fontSize: '0.84rem',
                      color: '#475569',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                      <span style={{ flexShrink: 0 }}>📍</span>
                      <div>
                        <strong style={{ color: '#1e293b' }}>{isAr ? 'العنوان:' : 'Address:'}</strong>{' '}
                        <span>{order.customerAddress}</span>
                      </div>
                    </div>

                    {order.deliveryTime && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                        <span style={{ flexShrink: 0 }}>⏰</span>
                        <div>
                          <strong style={{ color: '#1e293b' }}>{isAr ? 'موعد التوصيل:' : 'Delivery Window:'}</strong>{' '}
                          <span>{order.deliveryTime}</span>
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '10px',
                        marginTop: '4px',
                        borderTop: '1px dashed #e2e8f0',
                      }}
                    >
                      <span style={{ fontSize: '0.86rem', color: '#64748b', fontWeight: 600 }}>
                        {isAr ? 'إجمالي الطلب المطلوب:' : 'Total Amount:'}
                      </span>
                      <strong style={{ fontSize: '1.3rem', color: '#16a34a', fontWeight: 800 }}>
                        {order.total} {currencySymbol}
                      </strong>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: isAr ? 'flex-end' : 'flex-start',
                      gap: '10px',
                      marginTop: '16px',
                      paddingTop: '12px',
                      borderTop: '1px dashed #eee',
                    }}
                  >
                    <a
                      href={whatsappInquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: '1px solid #e0e0e0',
                        background: '#ffffff',
                        color: '#333',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>💬</span>
                      <span>{isAr ? 'استفسار واتساب' : 'WhatsApp Inquiry'}</span>
                    </a>

                    {isCancellable && (
                      <button
                        type="button"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          border: '1px solid #fee2e2',
                          background: '#fef2f2',
                          color: '#b91c1c',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: cancellingId === order.id ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>❌</span>
                        <span>{cancellingId === order.id ? (isAr ? 'جاري الإلغاء...' : 'Cancelling...') : (isAr ? 'إلغاء الطلب' : 'Cancel Order')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
