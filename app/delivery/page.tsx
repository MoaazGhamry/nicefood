'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';

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
      name?: string;
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
  updatedAt?: string;
}

export default function DeliveryPortalPage() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const currencySymbol = isAr ? 'ج.م' : 'EGP';

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
  const [activeTab, setActiveTab] = useState<'available' | 'delivering' | 'completed' | 'daily_report'>('delivering');

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
              {isAr ? 'بوابة مناديب التوصيل | نايس فود' : 'Delivery Drivers Portal | NiceFood'}
            </h1>
            <p style={{ fontSize: '0.88rem', color: '#64748b', margin: 0 }}>
              {isAr
                ? 'سجل دخولك لاستلام الأوردرات والتنقل لموقع العميل وتأكيد التسليم'
                : 'Sign in to accept delivery orders, navigate to clients, and confirm handover'}
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
                {isAr ? 'رقم هاتف المندوب' : 'Driver Mobile Number'}
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
                {isAr ? 'كلمة المرور' : 'Password'}
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
              {submittingLogin
                ? (isAr ? 'جاري التحقق...' : 'Verifying...')
                : (isAr ? 'دخول كابتن التوصيل 🛵' : 'Sign In as Driver 🛵')}
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
            <strong>{isAr ? 'بيانات الدخول التجريبية للكابتن:' : 'Demo Driver Credentials:'}</strong>
            <div>{isAr ? 'الهاتف:' : 'Phone:'} <code>01558580214</code> | {isAr ? 'كلمة المرور:' : 'Password:'} <code>delivery123</code></div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to get YYYY-MM-DD in local time
  const getDateKey = (dateStr?: string) => {
    try {
      const d = dateStr ? new Date(dateStr) : new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const todayKey = getDateKey();
  const yesterdayKey = (() => {
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return getDateKey(y.toISOString());
  })();

  const [selectedReportDate, setSelectedReportDate] = useState<string>(todayKey);

  // Filter orders by tab
  const availableOrders = orders.filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'preparing');
  const myDeliveringOrders = orders.filter((o) => o.orderStatus === 'delivering');
  const completedOrders = orders.filter((o) => o.orderStatus === 'delivered');

  // Filter orders delivered today specifically
  const completedOrdersToday = completedOrders.filter((o) => {
    const dKey = getDateKey(o.createdAt);
    return dKey === todayKey;
  });

  // Total cash collected by this driver today
  const totalCashDelivered = completedOrdersToday
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.total, 0);

  // Group completed orders by day for the Daily Dashboard
  const dailyGroups = React.useMemo(() => {
    const groups: Record<
      string,
      {
        dateKey: string;
        orders: DeliveryOrder[];
        cashOrdersCount: number;
        cashTotal: number;
        onlineOrdersCount: number;
        onlineTotal: number;
        grandTotal: number;
        productsMap: Record<
          string,
          {
            name: string;
            brandName: string;
            unit: string;
            quantity: number;
          }
        >;
      }
    > = {};

    completedOrders.forEach((o) => {
      const dKey = getDateKey(o.createdAt);
      if (!groups[dKey]) {
        groups[dKey] = {
          dateKey: dKey,
          orders: [],
          cashOrdersCount: 0,
          cashTotal: 0,
          onlineOrdersCount: 0,
          onlineTotal: 0,
          grandTotal: 0,
          productsMap: {},
        };
      }

      groups[dKey].orders.push(o);
      groups[dKey].grandTotal += o.total;
      if (o.paymentMethod === 'cash') {
        groups[dKey].cashOrdersCount += 1;
        groups[dKey].cashTotal += o.total;
      } else {
        groups[dKey].onlineOrdersCount += 1;
        groups[dKey].onlineTotal += o.total;
      }

      o.items?.forEach((it) => {
        const pName = isAr ? (it.product?.nameAr || it.product?.name) : (it.product?.name || it.product?.nameAr);
        const bName = isAr ? (it.product?.brand?.nameAr || '') : (it.product?.brand?.name || it.product?.brand?.nameAr || '');
        const unit = (it.product as any)?.unit || (isAr ? 'كجم' : 'kg');
        const key = `${pName}_${bName}`;

        if (!groups[dKey].productsMap[key]) {
          groups[dKey].productsMap[key] = {
            name: pName,
            brandName: bName,
            unit,
            quantity: 0,
          };
        }
        groups[dKey].productsMap[key].quantity += it.quantity;
      });
    });

    return Object.values(groups).sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  }, [completedOrders, isAr]);

  // Current day report data
  const currentDayReport = dailyGroups.find((g) => g.dateKey === selectedReportDate) || {
    dateKey: selectedReportDate,
    orders: [],
    cashOrdersCount: 0,
    cashTotal: 0,
    onlineOrdersCount: 0,
    onlineTotal: 0,
    grandTotal: 0,
    productsMap: {},
  };

  const formatDayLabel = (dateKey: string) => {
    if (!dateKey) return '';
    if (dateKey === todayKey) return isAr ? 'اليوم' : 'Today';
    if (dateKey === yesterdayKey) return isAr ? 'أمس' : 'Yesterday';

    try {
      const [y, m, d] = dateKey.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateKey;
    }
  };

  // WhatsApp daily report text for the driver to share with the company
  const whatsappDailyReportText = encodeURIComponent(
    isAr
      ? `*📋 تقرير التقفيل اليومي لكابتن التوصيل: ${driver?.name || 'كابتن نايس فود'}*\n` +
        `*📅 التاريخ:* ${currentDayReport.dateKey} (${formatDayLabel(currentDayReport.dateKey)})\n` +
        `*🛵 عدد الأوردرات المسلّمة:* ${currentDayReport.orders.length} طلب\n` +
        `*💰 إجمالي الكاش المحصّل للتوريد:* ${currentDayReport.cashTotal} ج.م (${currentDayReport.cashOrdersCount} طلب كاش)\n` +
        `*💳 إجمالي المدفوع أونلاين:* ${currentDayReport.onlineTotal} ج.م (${currentDayReport.onlineOrdersCount} طلب)\n` +
        `*📈 إجمالي مبيعات اليوم:* ${currentDayReport.grandTotal} ج.م\n\n` +
        `*📦 الأصناف والكميات المسلّمة:*\n` +
        (Object.values(currentDayReport.productsMap).length > 0
          ? Object.values(currentDayReport.productsMap)
              .map((p, idx) => `${idx + 1}. ${p.name} ${p.brandName ? `(${p.brandName})` : ''}: ${p.quantity} ${p.unit}`)
              .join('\n')
          : 'لا توجد أصناف') +
        `\n\n*📝 قائمة الأوردرات المسلّمة:*\n` +
        (currentDayReport.orders.length > 0
          ? currentDayReport.orders
              .map(
                (o, idx) =>
                  `${idx + 1}. #${o.id.slice(-6).toUpperCase()} - ${o.customerName} - ${o.total} ج.م (${o.paymentMethod === 'cash' ? 'كاش' : 'أونلاين'}) - كود: ${o.deliveryCode || 'N/A'}`
              )
              .join('\n')
          : 'لا توجد أوردرات مسجلة بهذا اليوم')
      : `*Daily Delivery Closing Report: ${driver?.name || 'Driver'}*\n` +
        `*Date:* ${currentDayReport.dateKey} (${formatDayLabel(currentDayReport.dateKey)})\n` +
        `*Delivered Orders:* ${currentDayReport.orders.length}\n` +
        `*Cash to Remit:* ${currentDayReport.cashTotal} EGP (${currentDayReport.cashOrdersCount} cash orders)\n` +
        `*Online Payments:* ${currentDayReport.onlineTotal} EGP (${currentDayReport.onlineOrdersCount} online orders)\n` +
        `*Total Sales:* ${currentDayReport.grandTotal} EGP\n\n` +
        `*Items Delivered:*\n` +
        (Object.values(currentDayReport.productsMap).length > 0
          ? Object.values(currentDayReport.productsMap)
              .map((p, idx) => `${idx + 1}. ${p.name} ${p.brandName ? `(${p.brandName})` : ''}: ${p.quantity} ${p.unit}`)
              .join('\n')
          : 'None') +
        `\n\n*Orders:*\n` +
        (currentDayReport.orders.length > 0
          ? currentDayReport.orders
              .map(
                (o, idx) =>
                  `${idx + 1}. #${o.id.slice(-6).toUpperCase()} - ${o.customerName} - ${o.total} EGP (${o.paymentMethod === 'cash' ? 'Cash' : 'Online'}) - OTP: ${o.deliveryCode || 'N/A'}`
              )
              .join('\n')
          : 'No orders recorded for this day')
  );

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
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {isAr ? 'طلبات جاهزة للاستلام' : 'Ready for Pickup'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
              {availableOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {isAr ? 'طلبات معك بالطريق 🛵' : 'Out for Delivery 🛵'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
              {myDeliveringOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {isAr ? 'تم تسليمها اليوم ✅' : 'Delivered Today ✅'}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
              {completedOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
              {isAr ? 'كاش محصل اليوم 💰' : 'Cash Collected Today 💰'}
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
              {totalCashDelivered} {currencySymbol}
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('delivering')}
            style={{
              padding: '12px 8px',
              borderRadius: '12px',
              border: activeTab === 'delivering' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              background: activeTab === 'delivering' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'delivering' ? '#2563eb' : '#475569',
              fontWeight: activeTab === 'delivering' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'delivering' ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            {isAr
              ? `🛵 قيد التوصيل (${myDeliveringOrders.length})`
              : `🛵 On Delivery (${myDeliveringOrders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('available')}
            style={{
              padding: '12px 8px',
              borderRadius: '12px',
              border: activeTab === 'available' ? '2px solid #d97706' : '1px solid #e2e8f0',
              background: activeTab === 'available' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'available' ? '#d97706' : '#475569',
              fontWeight: activeTab === 'available' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'available' ? '0 4px 12px rgba(217, 119, 6, 0.12)' : 'none',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            {isAr
              ? `📦 طلبات جاهزة (${availableOrders.length})`
              : `📦 Ready (${availableOrders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            style={{
              padding: '12px 8px',
              borderRadius: '12px',
              border: activeTab === 'completed' ? '2px solid #16a34a' : '1px solid #e2e8f0',
              background: activeTab === 'completed' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'completed' ? '#16a34a' : '#475569',
              fontWeight: activeTab === 'completed' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'completed' ? '0 4px 12px rgba(22, 163, 74, 0.12)' : 'none',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            {isAr
              ? `✅ تم تسليمها (${completedOrders.length})`
              : `✅ Delivered (${completedOrders.length})`}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daily_report')}
            style={{
              padding: '12px 8px',
              borderRadius: '12px',
              border: activeTab === 'daily_report' ? '2px solid #7c3aed' : '1px solid #e2e8f0',
              background: activeTab === 'daily_report' ? '#ffffff' : '#f8fafc',
              color: activeTab === 'daily_report' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'daily_report' ? 800 : 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'daily_report' ? '0 4px 12px rgba(124, 58, 237, 0.14)' : 'none',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            {isAr ? '📊 تقفيل اليومية' : '📊 Daily Report'}
          </button>
        </div>

        {/* Current Tab View Display */}
        {(() => {
          // If Daily Closing Dashboard is active
          if (activeTab === 'daily_report') {
            const productsList = Object.values(currentDayReport.productsMap);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Daily Dashboard Header Card */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      marginBottom: '16px',
                    }}
                  >
                    <div>
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                        📊 {isAr ? 'تقفيل اليومية وحصر التسليم' : 'Daily Closing & Delivery Summary'}
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
                        {isAr
                          ? 'كشف تفصيلي بكل ما تم تسليمه، عدد الأوردرات، وتوريد الكاش'
                          : 'Complete report of delivered items, orders count, and cash remittance'}
                      </p>
                    </div>

                    {/* WhatsApp Quick Share to Company */}
                    <a
                      href={`https://wa.me/201558580214?text=${whatsappDailyReportText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: '#16a34a',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        boxShadow: '0 3px 10px rgba(22, 163, 74, 0.25)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <span>📲</span>
                      <span>{isAr ? 'إرسال كشف التقفيل واتساب' : 'Send via WhatsApp'}</span>
                    </a>
                  </div>

                  {/* Date Filter Controls */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px',
                      paddingTop: '14px',
                      borderTop: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
                      📅 {isAr ? 'اختر اليوم:' : 'Select Day:'}
                    </span>

                    {/* Today Pill */}
                    <button
                      type="button"
                      onClick={() => setSelectedReportDate(todayKey)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: selectedReportDate === todayKey ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                        background: selectedReportDate === todayKey ? '#f5f3ff' : '#ffffff',
                        color: selectedReportDate === todayKey ? '#6d28d9' : '#334155',
                        fontWeight: selectedReportDate === todayKey ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isAr ? 'اليوم' : 'Today'}
                    </button>

                    {/* Yesterday Pill */}
                    <button
                      type="button"
                      onClick={() => setSelectedReportDate(yesterdayKey)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: selectedReportDate === yesterdayKey ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                        background: selectedReportDate === yesterdayKey ? '#f5f3ff' : '#ffffff',
                        color: selectedReportDate === yesterdayKey ? '#6d28d9' : '#334155',
                        fontWeight: selectedReportDate === yesterdayKey ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                      }}
                    >
                      {isAr ? 'أمس' : 'Yesterday'}
                    </button>

                    {/* Custom Date Picker */}
                    <input
                      type="date"
                      value={selectedReportDate}
                      onChange={(e) => setSelectedReportDate(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    />

                    {/* Selected Date Label Badge */}
                    <div
                      style={{
                        marginInlineStart: 'auto',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {formatDayLabel(selectedReportDate)} ({selectedReportDate})
                    </div>
                  </div>
                </div>

                {/* KPI Metrics Grid for Selected Day */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {/* Delivered Orders */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                        {isAr ? 'الأوردرات المسلّمة' : 'Delivered Orders'}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>🛵</span>
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                      {currentDayReport.orders.length}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
                      {isAr ? 'طلب مكتمل بنجاح' : 'Completed orders'}
                    </div>
                  </div>

                  {/* Cash to Remit */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid #bbf7d0',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#15803d' }}>
                        {isAr ? 'كاش للتوريد للشركة' : 'Cash to Remit'}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>💵</span>
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#16a34a', marginTop: '6px' }}>
                      {currentDayReport.cashTotal}{' '}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currencySymbol}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {isAr
                        ? `${currentDayReport.cashOrdersCount} طلب كاش عند الاستلام`
                        : `${currentDayReport.cashOrdersCount} cash orders`}
                    </div>
                  </div>

                  {/* Online Paid */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid #bfdbfe',
                      boxShadow: '0 2px 8px rgba(37, 99, 235, 0.05)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>
                        {isAr ? 'مدفوع إلكترونياً' : 'Online Paid'}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>💳</span>
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>
                      {currentDayReport.onlineTotal}{' '}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currencySymbol}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {isAr
                        ? `${currentDayReport.onlineOrdersCount} طلب مدفوع مسبقاً`
                        : `${currentDayReport.onlineOrdersCount} pre-paid orders`}
                    </div>
                  </div>

                  {/* Grand Total Sales */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      padding: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                        {isAr ? 'إجمالي المبيعات' : 'Total Value'}
                      </span>
                      <span style={{ fontSize: '1.2rem' }}>📈</span>
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#0f172a', marginTop: '6px' }}>
                      {currentDayReport.grandTotal}{' '}
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{currencySymbol}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                      {isAr ? 'كاش + إلكتروني' : 'Cash + Online'}
                    </div>
                  </div>
                </div>

                {/* Cash Remittance Notice Banner */}
                {currentDayReport.cashTotal > 0 && (
                  <div
                    style={{
                      background: '#fefce8',
                      border: '1px solid #fef08a',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem' }}>💰</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#854d0e', fontSize: '0.9rem' }}>
                        {isAr ? 'تنبيه عهدة التوريد النقدي:' : 'Cash Remittance Reminder:'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#a16207', marginTop: '2px' }}>
                        {isAr
                          ? `يرجى تسليم مبلغ (${currentDayReport.cashTotal} ${currencySymbol}) لمسؤول الخزينة بنهاية اليوم مع توقيع كشف التقفيل.`
                          : `Please hand over (${currentDayReport.cashTotal} ${currencySymbol}) to the company treasury at the end of shift.`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section: سلم إيه اليوم (Products & Quantities Delivered Breakdown) */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      📦 {isAr ? 'الأصناف والكميات المسلّمة اليوم (حصر المنتجات)' : 'Products & Quantities Handed Over'}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      {productsList.length} {isAr ? 'صنف مختلف' : 'distinct items'}
                    </span>
                  </div>

                  {productsList.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '6px' }}>📦</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {isAr ? 'لا توجد منتجات مسلّمة في هذا اليوم' : 'No items delivered on this day'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                      {productsList.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            borderRadius: '12px',
                            padding: '12px 14px',
                            border: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: '0.88rem',
                                color: '#1e293b',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {item.name}
                            </div>
                            {item.brandName && (
                              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                                🏷️ {item.brandName}
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.9rem',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {item.quantity} {item.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section: كشف الطلبات المسلّمة بالتفصيل */}
                <div
                  style={{
                    background: '#ffffff',
                    borderRadius: '18px',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      📋 {isAr ? 'سجل الطلبات المسلّمة بالتاريخ المحدد' : 'Delivered Orders Log for Date'}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#dcfce7',
                        color: '#15803d',
                        padding: '4px 10px',
                        borderRadius: '20px',
                      }}
                    >
                      {currentDayReport.orders.length} {isAr ? 'أوردر' : 'orders'}
                    </span>
                  </div>

                  {currentDayReport.orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🛵</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {isAr ? 'لم يتم تسليم أي أوردرات في هذا التاريخ' : 'No orders were delivered on this date'}
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {currentDayReport.orders.map((o, idx) => {
                        const isCash = o.paymentMethod === 'cash';
                        const timeStr = new Date(o.updatedAt || o.createdAt).toLocaleTimeString(
                          isAr ? 'ar-EG' : 'en-US',
                          { hour: '2-digit', minute: '2-digit' }
                        );

                        return (
                          <div
                            key={o.id}
                            style={{
                              background: '#f8fafc',
                              borderRadius: '14px',
                              padding: '14px',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '10px',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                  style={{
                                    background: '#0f172a',
                                    color: '#ffffff',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.78rem',
                                    fontWeight: 800,
                                    fontFamily: 'monospace',
                                  }}
                                >
                                  #{o.id.slice(-6).toUpperCase()}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                  🕒 {timeStr}
                                </span>
                                {o.deliveryCode && (
                                  <span
                                    style={{
                                      fontSize: '0.74rem',
                                      background: '#f0fdf4',
                                      color: '#15803d',
                                      border: '1px solid #86efac',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontWeight: 700,
                                    }}
                                  >
                                    🔐 OTP: {o.deliveryCode}
                                  </span>
                                )}
                              </div>

                              <span
                                style={{
                                  fontSize: '0.82rem',
                                  fontWeight: 700,
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  background: isCash ? '#fef3c7' : '#dbeafe',
                                  color: isCash ? '#92400e' : '#1e40af',
                                }}
                              >
                                {isCash ? `💵 كاش: ${o.total} ${currencySymbol}` : `💳 إلكتروني: ${o.total} ${currencySymbol}`}
                              </span>
                            </div>

                            <div style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 600, marginBottom: '4px' }}>
                              👤 {o.customerName} • 📱 {o.customerPhone}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>
                              📍 {o.customerAddress}
                            </div>

                            {/* Order Items summary */}
                            {o.items && o.items.length > 0 && (
                              <div
                                style={{
                                  background: '#ffffff',
                                  borderRadius: '8px',
                                  padding: '8px 10px',
                                  border: '1px solid #e2e8f0',
                                  fontSize: '0.76rem',
                                  color: '#334155',
                                }}
                              >
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                  {isAr ? 'الأصناف:' : 'Items:'}{' '}
                                </span>
                                {o.items
                                  .map((it) => {
                                    const pName = isAr ? (it.product?.nameAr || it.product?.name) : (it.product?.name || it.product?.nameAr);
                                    const unit = (it.product as any)?.unit || (isAr ? 'كجم' : 'kg');
                                    return `${pName} (${it.quantity} ${unit})`;
                                  })
                                  .join(' • ')}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section: أرشيف الأيام السابقة */}
                {dailyGroups.length > 1 && (
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: '18px',
                      padding: '20px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>
                      🗓️ {isAr ? 'أرشيف الأيام المسجلة بالنظام:' : 'Past Daily Logs Archive:'}
                    </h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {dailyGroups.map((g) => (
                        <button
                          key={g.dateKey}
                          type="button"
                          onClick={() => setSelectedReportDate(g.dateKey)}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: selectedReportDate === g.dateKey ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                            background: selectedReportDate === g.dateKey ? '#f5f3ff' : '#f8fafc',
                            cursor: 'pointer',
                            textAlign: 'start',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>
                              {formatDayLabel(g.dateKey)}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {g.dateKey}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 600 }}>
                            {g.orders.length} {isAr ? 'طلب مسلّم' : 'delivered'} • 💵 {g.cashTotal} {currencySymbol}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }

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
                              ? (isAr ? 'تم التسليم ✅' : 'Delivered ✅')
                              : isDelivering
                              ? (isAr ? 'في الطريق للتوصيل 🛵' : 'Out for Delivery 🛵')
                              : (isAr ? 'جاهز للاستلام 📦' : 'Ready for Pickup 📦')}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                          {isAr ? 'الموعد:' : 'Time:'} {order.deliveryTime || (isAr ? 'أسرع وقت' : 'ASAP')}
                        </div>
                      </div>

                      <div style={{ textAlign: isAr ? 'right' : 'left' }}>
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
                          {isCash
                            ? (isAr ? `💰 تحصيل كاش: ${order.total} ج.م` : `💰 Cash to collect: ${order.total} EGP`)
                            : (isAr ? `💳 مدفوع أونلاين: ${order.total} ج.م` : `💳 Paid Online: ${order.total} EGP`)}
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
                        📍 <strong>{isAr ? 'العنوان:' : 'Address:'}</strong> {order.customerAddress}
                      </div>

                      {order.notes && (
                        <div style={{ fontSize: '0.8rem', color: '#92400e', background: '#fffbeb', padding: '6px 10px', borderRadius: '6px', marginBottom: '12px' }}>
                          📝 <strong>{isAr ? 'ملاحظات العميل:' : 'Customer Notes:'}</strong> {order.notes}
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
                          <span>{isAr ? 'اتصال بالعميل' : 'Call Customer'}</span>
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
                          <span>{isAr ? 'واتساب العميل' : 'WhatsApp'}</span>
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
                          <span>{isAr ? 'فتح اللوكيشن بملاحة جوجل (GPS)' : 'Open GPS Navigation (Maps)'}</span>
                        </a>
                      </div>
                    </div>

                    {/* Order Items Preview (Expandable or Compact) */}
                    <div style={{ marginBottom: '14px', fontSize: '0.82rem', color: '#475569' }}>
                      <div style={{ fontWeight: 700, marginBottom: '6px', color: '#1e293b' }}>
                        {isAr ? `قائمة المنتجات للتسليم (${order.items?.length || 0}):` : `Order items for delivery (${order.items?.length || 0}):`}
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
                              • {isAr ? (it.product?.nameAr || it.product?.name) : (it.product?.name || it.product?.nameAr)} ({isAr ? (it.product?.brand?.nameAr || '') : (it.product?.brand?.name || it.product?.brand?.nameAr || '')})
                            </span>
                            <span style={{ fontWeight: 700 }}>{isAr ? 'الكمية:' : 'Qty:'} {it.quantity}</span>
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
                        {actionLoading[order.id]
                          ? (isAr ? 'جاري الاستلام...' : 'Accepting...')
                          : (isAr ? '🛵 استلام هذا الطلب والبدء بالتوصيل' : '🛵 Accept & Start Delivery')}
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
                          🔐 {isAr ? 'تأكيد التسليم للعميل بكود الاستلام (OTP):' : 'Confirm Delivery with Handover OTP:'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#15803d', marginBottom: '10px' }}>
                          {isAr
                            ? 'اطلب من العميل إعطائك كود الاستلام الظاهر في شاشة هاتفه لتأكيد استلامه للطلب رسمياً.'
                            : 'Ask the customer for the delivery code shown on their order screen to confirm handover.'}
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            maxLength={8}
                            placeholder={isAr ? "كود الاستلام (مثال: 4821)" : "Delivery OTP (e.g. 4821)"}
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
                            {actionLoading[order.id]
                              ? (isAr ? 'جاري التحقق...' : 'Verifying...')
                              : (isAr ? '✅ تأكيد التسليم' : '✅ Confirm Handover')}
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
                        {isAr ? '✅ تم تسليم الطلب بنجاح للعميل' : '✅ Order successfully delivered to customer'}
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
