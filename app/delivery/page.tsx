'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    name: string;
    nameAr: string;
    imageUrl?: string;
    brand?: {
      nameAr: string;
    };
  };
}

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat: number | null;
  customerLng: number | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryTime: string | null;
  deliveryCode: string | null;
  driverId: string | null;
  driverName: string | null;
  driverPhone: string | null;
  total: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
}

export default function DeliveryPortalPage() {
  // Driver Auth State
  const [driver, setDriver] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login Form State
  const [loginPhone, setLoginPhone] = useState('01558580214');
  const [loginPassword, setLoginPassword] = useState('delivery123');
  const [loginError, setLoginError] = useState('');
  const [submittingLogin, setSubmittingLogin] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'delivering' | 'completed'>('delivering');

  // Delivery Code state per order
  const [deliveryCodes, setDeliveryCodes] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState<Record<string, string>>({});
  const [actionSuccess, setActionSuccess] = useState<Record<string, string>>({});

  // Check stored driver session
  useEffect(() => {
    try {
      const stored = localStorage.getItem('nicefood_driver_session');
      if (stored) {
        setDriver(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Fetch delivery orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/delivery/orders');
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (driver) {
      fetchOrders();
      // Auto refresh every 30 seconds for live updates
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [driver]);

  // Handle Driver Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmittingLogin(true);

    try {
      const res = await fetch('/api/delivery/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل تسجيل الدخول');
      }

      setDriver(data.driver);
      localStorage.setItem('nicefood_driver_session', JSON.stringify(data.driver));
    } catch (err: any) {
      setLoginError(err.message || 'حدث خطأ في تسجيل الدخول');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleLogout = () => {
    setDriver(null);
    localStorage.removeItem('nicefood_driver_session');
  };

  // Driver takes the order
  const handleTakeOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    setActionError((prev) => ({ ...prev, [orderId]: '' }));

    try {
      const res = await fetch('/api/delivery/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'take_order',
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'تعذر استلام الطلب');
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'delivering', driverId: driver.id } : o))
      );
      setActiveTab('delivering');
    } catch (err: any) {
      setActionError((prev) => ({ ...prev, [orderId]: err.message }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Driver confirms handover with Delivery Code (OTP)
  const handleConfirmDelivery = async (orderId: string) => {
    const code = deliveryCodes[orderId];
    if (!code || code.trim().length === 0) {
      setActionError((prev) => ({ ...prev, [orderId]: 'يرجى إدخال كود الاستلام من العميل' }));
      return;
    }

    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    setActionError((prev) => ({ ...prev, [orderId]: '' }));

    try {
      const res = await fetch('/api/delivery/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          action: 'confirm_delivery',
          deliveryCode: code.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'كود التسليم غير صحيح');
      }

      setActionSuccess((prev) => ({
        ...prev,
        [orderId]: 'تم تأكيد تسليم الطلب بنجاح! شكراً لك كابتن 🌟',
      }));

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'delivered', paymentStatus: 'paid' } : o))
      );

      setTimeout(() => {
        setActionSuccess((prev) => ({ ...prev, [orderId]: '' }));
      }, 5000);
    } catch (err: any) {
      setActionError((prev) => ({ ...prev, [orderId]: err.message }));
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#666' }}>جاري التحميل...</p>
      </div>
    );
  }

  // 1. Login View if Driver not logged in
  if (!driver) {
    return (
      <div style={{ minHeight: '85vh', padding: '40px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            background: '#ffffff',
            borderRadius: '24px',
            padding: '32px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🛵</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
              بوابة مناديب التوصيل | نايس فود
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              سجل دخولك لاستلام الأوردرات والتنقل لموقع العميل وتأكيد التسليم
            </p>
          </div>

          {loginError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                background: '#fee2e2',
                color: '#b91c1c',
                fontSize: '0.86rem',
                marginBottom: '16px',
              }}
            >
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                رقم هاتف المندوب
              </label>
              <input
                type="tel"
                required
                dir="ltr"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: submittingLogin ? 'not-allowed' : 'pointer',
                opacity: submittingLogin ? 0.75 : 1,
                boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
              }}
            >
              {submittingLogin ? 'جاري التحقق...' : 'دخول كابتن التوصيل 🛵'}
            </button>
          </form>

          {/* Quick Credential Hint */}
          <div
            style={{
              marginTop: '20px',
              padding: '12px',
              borderRadius: '10px',
              background: '#f1f5f9',
              fontSize: '0.78rem',
              color: '#475569',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            <strong>بيانات الدخول التجريبية للكابتن:</strong>
            <div>الهاتف: <code>01558580214</code> | كلمة المرور: <code>delivery123</code></div>
          </div>
        </div>
      </div>
    );
  }

  // Filter orders by tab
  const availableOrders = orders.filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'preparing');
  const myDeliveringOrders = orders.filter((o) => o.orderStatus === 'delivering');
  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');

  // Total cash collected by this driver today
  const totalCashDelivered = completedOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px 80px', background: '#f8fafc' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Top Driver Header Card */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: '#16a34a',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
              }}
            >
              🛵
            </div>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>
                كابتن {driver.name}
              </h1>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                📱 {driver.phone} • نايس فود إكسبريس
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={fetchOrders}
              disabled={loadingOrders}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#334155',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🔄</span>
              <span>{loadingOrders ? 'تحديث...' : 'تحديث'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1px solid #fee2e2',
                background: '#fef2f2',
                color: '#b91c1c',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              خروج
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>طلبات جاهزة للاستلام</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
              {availableOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>طلبات معك بالطريق 🛵</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
              {myDeliveringOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>تم تسليمها اليوم ✅</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              {completedOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>كاش محصل اليوم 💰</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
              {totalCashDelivered} ج.م
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: '#e2e8f0',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('delivering')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'delivering' ? '#ffffff' : 'transparent',
              color: activeTab === 'delivering' ? '#2563eb' : '#475569',
              fontWeight: activeTab === 'delivering' ? 700 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'delivering' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            🛵 قيد التوصيل معك ({myDeliveringOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('available')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'available' ? '#ffffff' : 'transparent',
              color: activeTab === 'available' ? '#d97706' : '#475569',
              fontWeight: activeTab === 'available' ? 700 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'available' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            📦 طلبات جديدة جاهزة ({availableOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'completed' ? '#ffffff' : 'transparent',
              color: activeTab === 'completed' ? '#16a34a' : '#475569',
              fontWeight: activeTab === 'completed' ? 700 : 600,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'completed' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            }}
          >
            ✅ تم تسليمها ({completedOrders.length})
          </button>
        </div>

        {/* Current Tab Orders Display */}
        {(() => {
          const list =
            activeTab === 'delivering'
              ? myDeliveringOrders
              : activeTab === 'available'
              ? availableOrders
              : completedOrders;

          if (list.length === 0) {
            return (
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                  {activeTab === 'delivering' ? '🛵' : activeTab === 'available' ? '📦' : '🎉'}
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                  {activeTab === 'delivering'
                    ? 'لا توجد طلبات جارية معك للتوصيل حالياً'
                    : activeTab === 'available'
                    ? 'لا توجد طلبات جديدة في انتظار الاستلام حالياً'
                    : 'لم يتم تسليم طلبات بعد اليوم'}
                </div>
                {activeTab === 'delivering' && availableOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('available')}
                    style={{
                      marginTop: '12px',
                      padding: '8px 16px',
                      background: '#d97706',
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    استعراض الطلبات الجاهزة ({availableOrders.length})
                  </button>
                )}
              </div>
            );
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {list.map((order) => {
                const isDelivering = order.orderStatus === 'delivering';
                const isDelivered = order.orderStatus === 'delivered';
                const isCash = order.paymentMethod === 'cash';

                // Navigation Link
                const mapsUrl =
                  order.customerLat && order.customerLng
                    ? `https://www.google.com/maps/dir/?api=1&destination=${order.customerLat},${order.customerLng}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customerAddress)}`;

                const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
                const waPhone = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
                const waMsg = encodeURIComponent(
                  `مرحباً ${order.customerName}، مع حضرتك كابتن التوصيل من نايس فود بخصوص طلبك رقم #${order.id.slice(-6).toUpperCase()}`
                );

                return (
                  <div
                    key={order.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '20px',
                      border: `1px solid ${isDelivering ? '#93c5fd' : '#e2e8f0'}`,
                      boxShadow: isDelivering
                        ? '0 6px 20px rgba(37, 99, 235, 0.08)'
                        : '0 2px 10px rgba(0,0,0,0.03)',
                    }}
                  >
                    {/* Header: ID, Date, Amount */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '10px',
                        paddingBottom: '14px',
                        borderBottom: '1px solid #f1f5f9',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a' }}>
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            style={{
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: isDelivered ? '#dcfce7' : isDelivering ? '#dbeafe' : '#fef3c7',
                              color: isDelivered ? '#15803d' : isDelivering ? '#1d4ed8' : '#b45309',
                            }}
                          >
                            {isDelivered
                              ? 'تم التسليم ✅'
                              : isDelivering
                              ? 'في الطريق للتوصيل 🛵'
                              : 'جاهز للاستلام 📦'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          الموعد: {order.deliveryTime || 'أسرع وقت'}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div
                          style={{
                            padding: '4px 12px',
                            borderRadius: '8px',
                            fontWeight: 800,
                            fontSize: '0.95rem',
                            background: isCash ? '#fef3c7' : '#ecfdf5',
                            color: isCash ? '#92400e' : '#065f46',
                            border: `1px solid ${isCash ? '#fde68a' : '#a7f3d0'}`,
                          }}
                        >
                          {isCash ? `💰 تحصيل كاش: ${order.total} ج.م` : `💳 مدفوع أونلاين: ${order.total} ج.م`}
                        </div>
                      </div>
                    </div>

                    {/* Customer Info & Direct Action Buttons */}
                    <div
                      style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '14px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                          👤 {order.customerName}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', direction: 'ltr' }}>
                          📱 {order.customerPhone}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.86rem', color: '#334155', marginBottom: '12px', lineHeight: 1.4 }}>
                        📍 <strong>العنوان:</strong> {order.customerAddress}
                      </div>

                      {order.notes && (
                        <div style={{ fontSize: '0.8rem', color: '#92400e', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px' }}>
                          📝 <strong>ملاحظات العميل:</strong> {order.notes}
                        </div>
                      )}

                      {/* Direct Call & Navigation Buttons */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        <a
                          href={`tel:${order.customerPhone}`}
                          style={{
                            flex: 1,
                            minWidth: '130px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#16a34a',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>📞</span>
                          <span>اتصال بالعميل</span>
                        </a>

                        <a
                          href={`https://wa.me/${waPhone}?text=${waMsg}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            minWidth: '130px',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#25D366',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>💬</span>
                          <span>واتساب العميل</span>
                        </a>

                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 2,
                            minWidth: '200px',
                            padding: '8px 14px',
                            borderRadius: '8px',
                            background: '#0284c7',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.84rem',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>🗺️</span>
                          <span>فتح اللوكيشن بملاحة جوجل (GPS)</span>
                        </a>
                      </div>
                    </div>

                    {/* Order Items Preview (Expandable or Compact) */}
                    <div style={{ marginBottom: '14px', fontSize: '0.82rem', color: '#475569' }}>
                      <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                        قائمة المنتجات للتسليم ({order.items?.length || 0}):
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {order.items?.map((it, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              padding: '4px 8px',
                              background: '#f8fafc',
                              borderRadius: '6px',
                            }}
                          >
                            <span>
                              • {it.product?.nameAr || it.product?.name} ({it.product?.brand?.nameAr || ''})
                            </span>
                            <span style={{ fontWeight: 700 }}>الكمية: {it.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Area: Take Order OR Confirm Delivery with OTP */}
                    {activeTab === 'available' && (
                      <button
                        type="button"
                        disabled={actionLoading[order.id]}
                        onClick={() => handleTakeOrder(order.id)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          cursor: actionLoading[order.id] ? 'wait' : 'pointer',
                        }}
                      >
                        {actionLoading[order.id] ? 'جاري الاستلام...' : '🛵 استلام هذا الطلب والبدء بالتوصيل'}
                      </button>
                    )}

                    {activeTab === 'delivering' && (
                      <div
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: '12px',
                          padding: '14px',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.88rem', marginBottom: '8px' }}>
                          🔐 تأكيد التسليم للعميل بكود الاستلام (OTP):
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#15803d', marginBottom: '10px' }}>
                          اطلب من العميل إعطائك كود الاستلام الظاهر في شاشة هاتفه لتأكيد استلامه للطلب رسمياً.
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            maxLength={8}
                            placeholder="كود الاستلام (مثال: 4821)"
                            value={deliveryCodes[order.id] || ''}
                            onChange={(e) =>
                              setDeliveryCodes((prev) => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            style={{
                              flex: 1,
                              minWidth: '160px',
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: '1px solid #86efac',
                              fontSize: '1rem',
                              fontWeight: 800,
                              textAlign: 'center',
                              letterSpacing: '2px',
                              background: '#ffffff',
                              outline: 'none',
                            }}
                          />
                          <button
                            type="button"
                            disabled={actionLoading[order.id]}
                            onClick={() => handleConfirmDelivery(order.id)}
                            style={{
                              padding: '10px 20px',
                              borderRadius: '8px',
                              border: 'none',
                              background: '#16a34a',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              cursor: actionLoading[order.id] ? 'wait' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {actionLoading[order.id] ? 'جاري التحقق...' : '✅ تأكيد التسليم'}
                          </button>
                        </div>

                        {actionError[order.id] && (
                          <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '8px', fontWeight: 600 }}>
                            ⚠️ {actionError[order.id]}
                          </div>
                        )}
                        {actionSuccess[order.id] && (
                          <div style={{ color: '#15803d', fontSize: '0.82rem', marginTop: '8px', fontWeight: 700 }}>
                            {actionSuccess[order.id]}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'completed' && (
                      <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#15803d', fontWeight: 700 }}>
                        ✅ تم تسليم الطلب بنجاح للعميل
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}

      </div>
    </div>
  );
}
