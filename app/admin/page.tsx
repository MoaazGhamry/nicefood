'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Brand {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  logo: string | null;
  color: string;
}

interface Product {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  offerPrice?: number | null;
  image?: string | null;
  category: string;
  categoryAr?: string | null;
  unit: string;
  brandId: string;
  brand: Brand;
  isActive: boolean;
  isOffer: boolean;
  createdAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: {
    nameAr: string;
    unit: string;
    brand: { nameAr: string };
  };
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerLat?: number | null;
  customerLng?: number | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryTime?: string | null;
  total: number;
  notes?: string | null;
  items: OrderItem[];
  createdAt: string;
}

export default function AdminDashboardPage() {
  // Secret Access Passcode State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Delivery & Store Settings State
  const [deliveryFee, setDeliveryFee] = useState<number>(35);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(500);
  const [tempFeeInput, setTempFeeInput] = useState<string>('35');
  const [tempThreshInput, setTempThreshInput] = useState<string>('500');
  const [savingSettings, setSavingSettings] = useState(false);

  // Add Product Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBrandId, setNewBrandId] = useState('');
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newCategoryAr, setNewCategoryAr] = useState('فراخ مجمدة');
  const [newPrice, setNewPrice] = useState('');
  const [newOfferPrice, setNewOfferPrice] = useState('');
  const [newIsOffer, setNewIsOffer] = useState(false);
  const [newUnit, setNewUnit] = useState('كجم');
  const [newImage, setNewImage] = useState('');
  const [savingProduct, setSavingProduct] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'wallet_pending' | 'preparing' | 'cancelled'>('all');

  // Check secret session on mount
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('nicefood_admin_session');
    if (sessionAuth === 'unlocked') {
      setIsAuthenticated(true);
    }
    setAuthChecking(false);
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('nicefood_admin_session', data.token || 'unlocked');
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError(data.error || 'رمز الدخول غير صحيح، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      // Local fallback if offline
      if (passcode === '1234' || passcode === 'admin') {
        sessionStorage.setItem('nicefood_admin_session', 'unlocked');
        setIsAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('حدث خطأ في الاتصال بالخادم');
      }
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem('nicefood_admin_session');
    setIsAuthenticated(false);
    setPasscode('');
  };

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, brandsRes, ordersRes, settingsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/brands'),
        fetch('/api/orders'),
        fetch('/api/settings'),
      ]);

      const [prodsData, brandsData, ordersData, settingsData] = await Promise.all([
        prodRes.json(),
        brandsRes.json(),
        ordersRes.json(),
        settingsRes.json(),
      ]);

      setProducts(Array.isArray(prodsData) ? prodsData : []);
      setBrands(Array.isArray(brandsData) ? brandsData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);

      if (settingsData?.settings) {
        const fee = settingsData.settings.deliveryFee ?? 35;
        const thresh = settingsData.settings.freeDeliveryThreshold ?? 500;
        setDeliveryFee(fee);
        setFreeDeliveryThreshold(thresh);
        setTempFeeInput(String(fee));
        setTempThreshInput(String(thresh));
      }

      if (brandsData.length > 0 && !newBrandId) {
        setNewBrandId(brandsData[0].id);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Save Delivery & Store Settings
  const handleSaveDeliverySettings = async (feeToSave: number, thresholdToSave: number) => {
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryFee: feeToSave,
          freeDeliveryThreshold: thresholdToSave,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const updatedFee = data.settings.deliveryFee;
        const updatedThresh = data.settings.freeDeliveryThreshold;
        setDeliveryFee(updatedFee);
        setFreeDeliveryThreshold(updatedThresh);
        setTempFeeInput(String(updatedFee));
        setTempThreshInput(String(updatedThresh));
        showFeedback(`تم تحديث سعر التوصيل إلى ${updatedFee} ج.م بنجاح!`);
      } else {
        alert('حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Quick toggle active (قفل أو فتح المنتج)
  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, isActive: !currentStatus } : p))
        );
        showFeedback(!currentStatus ? 'تم تفعيل وفتح المنتج للعملاء' : 'تم قفل وتعطيل المنتج');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick toggle offer (عمل عرض للمنتج أو إلغاء العرض)
  const handleToggleOffer = async (product: Product) => {
    const nextIsOffer = !product.isOffer;
    const defaultOfferPrice = nextIsOffer && !product.offerPrice ? Math.round(product.price * 0.85) : product.offerPrice;

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOffer: nextIsOffer,
          offerPrice: nextIsOffer ? defaultOfferPrice : null,
        }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, isOffer: nextIsOffer, offerPrice: nextIsOffer ? defaultOfferPrice : null } : p
          )
        );
        showFeedback(nextIsOffer ? 'تم تفعيل العرض للمنتج' : 'تم إلغاء العرض');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Price Update
  const handlePriceUpdate = async (productId: string, currentPrice: number, currentOffer: number | null | undefined) => {
    const enteredPrice = prompt('أدخل السعر الجديد بالجنيه المصري (ج.م):', currentPrice.toString());
    if (!enteredPrice || isNaN(Number(enteredPrice))) return;

    const newP = parseFloat(enteredPrice);
    let newOp = currentOffer;

    if (currentOffer) {
      const enteredOffer = prompt('أدخل سعر العرض المخفض الجديد:', currentOffer.toString());
      newOp = enteredOffer ? parseFloat(enteredOffer) : null;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: newP, offerPrice: newOp }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, price: newP, offerPrice: newOp } : p))
        );
        showFeedback('تم تحديث سعر المنتج بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج: "${name}" نهائياً من المصنع؟`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showFeedback('تم حذف المنتج بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: newStatus,
          ...(newStatus === 'cancelled' && { paymentStatus: 'failed' }),
        }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus, ...(newStatus === 'cancelled' && { paymentStatus: 'failed' }) } : o))
        );
        showFeedback('تم تحديث حالة الطلب بنجاح');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Direct Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('هل تريد بالتأكيد إلغاء هذا الطلب؟ سيتم تعيين حالته كملغي ومرفوض.')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'cancelled', paymentStatus: 'failed' }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'cancelled', paymentStatus: 'failed' } : o))
        );
        showFeedback('تم إلغاء الطلب بنجاح');
      } else {
        alert('حدث خطأ أثناء إلغاء الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال بالخادم لإلغاء الطلب');
    }
  };

  // Permanent Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('تحذير: هل أنت متأكد من حذف هذا الطلب نهائياً من قاعدة البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
        showFeedback('تم حذف الطلب نهائياً بنجاح');
      } else {
        alert('فشل حذف الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال لحذف الطلب');
    }
  };

  // Approve order & automatically send WhatsApp confirmation to customer
  const handleApproveOrder = async (order: any) => {
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: 'confirmed', paymentStatus: 'paid' }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, orderStatus: 'confirmed', paymentStatus: 'paid' } : o))
        );
        showFeedback('تمت الموافقة على الطلب بنجاح');

        // Automatically open WhatsApp message to the customer
        const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
        const formattedPhone = cleanPhone.startsWith('0')
          ? '2' + cleanPhone
          : cleanPhone.startsWith('20')
          ? cleanPhone
          : '20' + cleanPhone;

        const confirmMsg = encodeURIComponent(
          `مرحباً ${order.customerName}،\nتمت مراجعة تحويلك والموافقة على طلبك رقم #${order.id.slice(-6).toUpperCase()} بنجاح من مجموعة مصانع NiceFood! ✅\n\nقيمة الطلب: ${order.total} ج.م\nالعنوان: ${order.customerAddress}\nالحالة الحالية: مؤكد وجاري التجهيز في خطوط الإنتاج للتوصيل فوراً.\n\nشكراً لطلبك من نايس فود!`
        );

        const waUrl = `https://wa.me/${formattedPhone}?text=${confirmMsg}`;
        window.open(waUrl, '_blank');
      } else {
        alert('حدث خطأ أثناء الموافقة على الطلب');
      }
    } catch (err) {
      console.error(err);
      alert('فشل الاتصال لتحديث الطلب');
    }
  };

  // Manual WhatsApp notification
  const handleSendWhatsAppNotification = (order: any) => {
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    const formattedPhone = cleanPhone.startsWith('0')
      ? '2' + cleanPhone
      : cleanPhone.startsWith('20')
      ? cleanPhone
      : '20' + cleanPhone;

    const msg = encodeURIComponent(
      `مرحباً ${order.customerName}،\nبخصوص طلبك رقم #${order.id.slice(-6).toUpperCase()} من مجموعة مصانع NiceFood:\nالحالة الحالية: ${
        order.orderStatus === 'confirmed'
          ? 'تم تأكيد الطلب وجاري تجهيزه بالمصنع'
          : order.orderStatus === 'preparing'
          ? 'جاري التجهيز في خط الإنتاج'
          : order.orderStatus === 'delivering'
          ? 'الطلب مع مندوب التوصيل في الطريق إليك'
          : order.orderStatus === 'delivered'
          ? 'تم تسليم الطلب بنجاح'
          : 'قيد الانتظار'
      }\nالإجمالي: ${order.total} ج.م\nشكراً لتواصلك معنا!`
    );

    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
  };

  // Add Product Submit
  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameAr.trim() || !newPrice) {
      alert('برجاء استكمال اسم المنتج والسعر');
      return;
    }

    setSavingProduct(true);
    try {
      const selectedBrand = brands.find((b) => b.id === newBrandId);
      const fallbackImg = selectedBrand?.logo || '/images/brands/nicefood-logo.jpeg';

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: newBrandId || brands[0]?.id,
          name: newNameEn.trim() || newNameAr.trim(),
          nameAr: newNameAr.trim(),
          category: 'food',
          categoryAr: newCategoryAr,
          price: parseFloat(newPrice),
          offerPrice: newIsOffer && newOfferPrice ? parseFloat(newOfferPrice) : null,
          isOffer: newIsOffer,
          isActive: true,
          unit: newUnit || 'كجم',
          image: newImage.trim() || fallbackImg,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setProducts((prev) => [created, ...prev]);
        setShowAddModal(false);
        setNewNameAr('');
        setNewNameEn('');
        setNewPrice('');
        setNewOfferPrice('');
        setNewIsOffer(false);
        setNewImage('');
        showFeedback('تمت إضافة المنتج الجديد لقائمة المصنع بنجاح');
      } else {
        alert('فشل إضافة المنتج');
      }
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الإضافة');
    } finally {
      setSavingProduct(false);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesBrand = filterBrand === 'all' || p.brandId === filterBrand;
    const matchesSearch =
      p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  // If still checking authentication
  if (authChecking) {
    return null;
  }

  // SECRET PASSCODE ACCESS SCREEN
  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-color)',
            padding: '36px 28px',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Secret Security Icon */}
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: 'var(--bg-secondary)',
              color: 'var(--nicefood-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            بوابة إدارة المصنع
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '22px' }}>
            أدخل رمز المرور السري للدخول إلى لوحة التحكم
          </p>

          {authError && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#DC2626',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '16px',
              }}
            >
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              type="password"
              placeholder="رمز المرور (1234)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                textAlign: 'center',
                letterSpacing: '4px',
              }}
            />

            <button
              type="submit"
              className="liquid-btn"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '0.92rem',
              }}
            >
              الدخول للوحة التحكم
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link
              href="/"
              style={{
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
              }}
            >
              العودة للمتجر الرئيسي
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', padding: '36px 20px 80px', background: 'var(--bg-primary)' }}>
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
        
        {/* Dashboard Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--nicefood-gold)', fontWeight: 700 }}>
                لوحة تحكم إدارة المصنع
              </span>
            </div>
            <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
              إدارة مجموعة مصانع NiceFood
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'var(--nicefood-green)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.88rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
              <span>إضافة منتج جديد</span>
            </button>

            <Link
              href="/"
              style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span>معاينة المتجر</span>
            </Link>

            <button
              type="button"
              onClick={handleLock}
              style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm, 8px)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
              title="قفل لوحة التحكم"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>قفل</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            style={{
              background: 'rgba(31, 78, 56, 0.08)',
              border: '1px solid rgba(31, 78, 56, 0.3)',
              color: 'var(--nicefood-green)',
              padding: '10px 16px',
              borderRadius: 'var(--radius-sm, 8px)',
              marginBottom: '20px',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '14px',
            marginBottom: '24px',
          }}
        >
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>إجمالي المنتجات</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{products.length}</div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>المنتجات النشطة المتاحة</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--nicefood-green)' }}>
              {products.filter((p) => p.isActive).length}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>العروض المفعلة</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--nicefood-gold)' }}>
              {products.filter((p) => p.isOffer).length}
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>إجمالي الطلبات الواردة</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>{orders.length}</div>
          </div>

          {/* Delivery Fee Quick Card */}
          <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md, 12px)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>سعر التوصيل الحالي</span>
                <span style={{ fontSize: '1rem' }}>🛵</span>
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16a34a' }}>
                {deliveryFee} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>ج.م</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                مجاني فوق {freeDeliveryThreshold} ج.م
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              style={{
                marginTop: '8px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--nicefood-green)',
                background: 'rgba(27, 94, 32, 0.08)',
                color: 'var(--nicefood-green)',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              تعديل سعر التوصيل ⚙️
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: activeTab === 'products' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderBottom: `2.5px solid ${activeTab === 'products' ? 'var(--nicefood-green)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>إدارة المنتجات والعروض</span>
            <span style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '8px', fontSize: '0.75rem' }}>
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: activeTab === 'orders' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderBottom: `2.5px solid ${activeTab === 'orders' ? 'var(--nicefood-green)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>متابعة الطلبات والتوصيل</span>
            <span style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '8px', fontSize: '0.75rem' }}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            style={{
              padding: '10px 18px',
              background: 'transparent',
              color: activeTab === 'settings' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.92rem',
              borderBottom: `2.5px solid ${activeTab === 'settings' ? 'var(--nicefood-green)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <span>إعدادات التوصيل والمتجر ⚙️</span>
          </button>
        </div>

        {/* ================= TAB 1: PRODUCTS ================= */}
        {activeTab === 'products' && (
          <div>
            {/* Filter and Search Bar */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setFilterBrand('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full, 9999px)',
                    background: filterBrand === 'all' ? 'var(--nicefood-green)' : 'var(--bg-card)',
                    color: filterBrand === 'all' ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                  }}
                >
                  جميع الشركات
                </button>

                {brands.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setFilterBrand(b.id)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      background: filterBrand === b.id ? 'var(--nicefood-green)' : 'var(--bg-card)',
                      color: filterBrand === b.id ? '#fff' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    {b.logo && (
                      <img
                        src={b.logo}
                        alt={b.nameAr}
                        style={{ width: '14px', height: '14px', borderRadius: '2px', objectFit: 'cover' }}
                      />
                    )}
                    <span>{b.nameAr}</span>
                  </button>
                ))}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="بحث عن منتج..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full, 9999px)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    width: '200px',
                  }}
                />
              </div>
            </div>

            {/* Products Table */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                overflowX: 'auto',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '12px 14px' }}>المنتج</th>
                    <th style={{ padding: '12px 14px' }}>الشركة</th>
                    <th style={{ padding: '12px 14px' }}>التصنيف</th>
                    <th style={{ padding: '12px 14px' }}>السعر الأساسي</th>
                    <th style={{ padding: '12px 14px' }}>حالة العرض</th>
                    <th style={{ padding: '12px 14px' }}>حالة المنتج (قفل / فتح)</th>
                    <th style={{ padding: '12px 14px' }}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        opacity: prod.isActive ? 1 : 0.6,
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={prod.image || prod.brand.logo || '/images/brands/nicefood-logo.jpeg'}
                            alt={prod.nameAr}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '6px',
                              objectFit: 'contain',
                              background: '#fff',
                              padding: '2px',
                              border: '1px solid var(--border-color)',
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prod.nameAr}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{prod.name}</div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {prod.brand.nameAr}
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          {prod.categoryAr || prod.category} ({prod.unit})
                        </span>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--nicefood-gold)' }}>
                          {prod.price} ج.م
                        </div>
                        {prod.offerPrice && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--tamoush-red)', fontWeight: 600 }}>
                            سعر العرض: {prod.offerPrice} ج.م
                          </div>
                        )}
                      </td>

                      {/* Offer Toggle (ما طلبه المستخدم: يعمل عرض للمنتج) */}
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleOffer(prod)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: prod.isOffer ? 'rgba(158, 125, 59, 0.12)' : 'var(--bg-secondary)',
                            border: `1px solid ${prod.isOffer ? 'var(--nicefood-gold)' : 'var(--border-color)'}`,
                            color: prod.isOffer ? 'var(--nicefood-gold)' : 'var(--text-muted)',
                            fontWeight: 600,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                          }}
                        >
                          {prod.isOffer ? 'عرض مفعل' : 'منتج عادي'}
                        </button>
                      </td>

                      {/* Active Status (ما طلبه المستخدم: يقفل منتج أو يفتحه) */}
                      <td style={{ padding: '12px 14px' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(prod.id, prod.isActive)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: prod.isActive ? 'rgba(31, 78, 56, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${prod.isActive ? 'var(--nicefood-green)' : '#DC2626'}`,
                            color: prod.isActive ? 'var(--nicefood-green)' : '#DC2626',
                            fontWeight: 600,
                            fontSize: '0.76rem',
                            cursor: 'pointer',
                          }}
                        >
                          {prod.isActive ? 'متاح للطلب' : 'مغلق (مقفل)'}
                        </button>
                      </td>

                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => handlePriceUpdate(prod.id, prod.price, prod.offerPrice)}
                            title="تعديل السعر"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              color: 'var(--text-primary)',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            تعديل السعر
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id, prod.nameAr)}
                            title="حذف"
                            style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border-color)',
                              color: '#DC2626',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                            }}
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div>
            {/* Orders Filter Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setOrderFilter('all')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: orderFilter === 'all' ? 'var(--nicefood-green)' : 'var(--bg-card)',
                    color: orderFilter === 'all' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  الكل ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('pending')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: orderFilter === 'pending' ? 'var(--nicefood-gold)' : 'var(--bg-card)',
                    color: orderFilter === 'pending' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  قيد الانتظار ({orders.filter((o) => o.orderStatus === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('wallet_pending')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: orderFilter === 'wallet_pending' ? '#d97706' : 'var(--bg-card)',
                    color: orderFilter === 'wallet_pending' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  ⚠️ بانتظار موافقة التحويل ({orders.filter((o) => o.paymentMethod === 'wallet' && o.orderStatus === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('preparing')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: orderFilter === 'preparing' ? '#2563eb' : 'var(--bg-card)',
                    color: orderFilter === 'preparing' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  المؤكدة / جاري التجهيز ({orders.filter((o) => o.orderStatus === 'preparing' || o.orderStatus === 'confirmed' || o.orderStatus === 'delivering').length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderFilter('cancelled')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: orderFilter === 'cancelled' ? '#dc2626' : 'var(--bg-card)',
                    color: orderFilter === 'cancelled' ? '#fff' : 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  الملغية والمرفوضة ({orders.filter((o) => o.orderStatus === 'cancelled').length})
                </button>
              </div>
            </div>

            {orders.length === 0 ? (
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md, 12px)',
                  padding: '50px 20px',
                  textAlign: 'center',
                  border: '1px solid var(--border-color)',
                }}
              >
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1.1rem', marginBottom: '4px' }}>
                  لا توجد طلبات واردة حالياً
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  ستظهر هنا الطلبات فور تأكيدها من صفحة إتمام الطلب
                </p>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md, 12px)',
                  border: '1px solid var(--border-color)',
                  overflowX: 'auto',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                      <th style={{ padding: '12px 14px' }}>رقم الطلب</th>
                      <th style={{ padding: '12px 14px' }}>العميل والهاتف</th>
                      <th style={{ padding: '12px 14px' }}>العنوان واللوكيشن</th>
                      <th style={{ padding: '12px 14px' }}>المنتجات</th>
                      <th style={{ padding: '12px 14px' }}>الإجمالي والدفع</th>
                      <th style={{ padding: '12px 14px' }}>حالة الطلب</th>
                      <th style={{ padding: '12px 14px' }}>إجراءات الإلغاء والحذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter((ord) => {
                        if (orderFilter === 'pending') return ord.orderStatus === 'pending';
                        if (orderFilter === 'wallet_pending')
                          return ord.paymentMethod === 'wallet' && ord.orderStatus === 'pending';
                        if (orderFilter === 'preparing')
                          return (
                            ord.orderStatus === 'preparing' ||
                            ord.orderStatus === 'confirmed' ||
                            ord.orderStatus === 'delivering'
                          );
                        if (orderFilter === 'cancelled') return ord.orderStatus === 'cancelled';
                        return true;
                      })
                      .map((ord) => {
                        const mapsLink =
                          ord.customerLat && ord.customerLng
                            ? `https://www.google.com/maps?q=${ord.customerLat},${ord.customerLng}`
                            : null;

                        const isWalletNeedApproval =
                          ord.paymentMethod === 'wallet' && ord.orderStatus === 'pending';

                        return (
                          <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-color)', background: isWalletNeedApproval ? 'rgba(254, 243, 199, 0.25)' : undefined }}>
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                                #{ord.id.slice(-6).toUpperCase()}
                              </div>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {new Date(ord.createdAt).toLocaleDateString('ar-EG', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>

                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ord.customerName}</div>
                              <a
                                href={`tel:${ord.customerPhone}`}
                                style={{ fontSize: '0.78rem', color: 'var(--nicefood-green)', direction: 'ltr', display: 'inline-block', textDecoration: 'none' }}
                              >
                                {ord.customerPhone}
                              </a>
                            </td>

                            <td style={{ padding: '12px 14px', maxWidth: '220px' }}>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {ord.customerAddress}
                              </div>
                              {mapsLink && (
                                <a
                                  href={mapsLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: 'var(--nicefood-green)',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    marginTop: '2px',
                                    textDecoration: 'none',
                                  }}
                                >
                                  <span>عرض اللوكيشن على الخريطة ↗</span>
                                </a>
                              )}
                            </td>

                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {ord.items.map((it) => (
                                  <div key={it.id} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                    • {it.product.nameAr} ({it.quantity} {it.product.unit})
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ fontWeight: 800, color: 'var(--nicefood-gold)', fontSize: '0.95rem' }}>
                                {ord.total} ج.م
                              </div>
                              <div style={{ fontSize: '0.72rem', color: ord.orderStatus === 'cancelled' ? '#dc2626' : 'var(--text-muted)' }}>
                                {ord.paymentMethod === 'paymob_visa'
                                  ? ord.paymentStatus === 'paid'
                                    ? 'Paymob فيزا (مدفوع)'
                                    : 'Paymob فيزا (ملغي/فشل)'
                                  : ord.paymentMethod === 'wallet'
                                  ? ord.paymentStatus === 'paid'
                                    ? 'إنستاباي / محفظة (معتمد)'
                                    : 'إنستاباي / محفظة (بانتظار التحويل)'
                                  : 'كاش استلام'}
                              </div>
                              {isWalletNeedApproval && (
                                <div
                                  style={{
                                    display: 'inline-block',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fcd34d',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    marginTop: '4px',
                                  }}
                                >
                                  ⚠️ محتاج موافقة
                                </div>
                              )}
                            </td>

                            <td style={{ padding: '12px 14px' }}>
                              <select
                                value={ord.orderStatus}
                                onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                                style={{
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  background: ord.orderStatus === 'cancelled' ? '#fef2f2' : 'var(--bg-secondary)',
                                  border: ord.orderStatus === 'cancelled' ? '1px solid #fecaca' : '1px solid var(--border-color)',
                                  color: ord.orderStatus === 'cancelled' ? '#b91c1c' : 'var(--text-primary)',
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                }}
                              >
                                <option value="pending">قيد الانتظار</option>
                                <option value="confirmed">مؤكد</option>
                                <option value="preparing">جاري التجهيز بالمصنع</option>
                                <option value="delivering">جاري التوصيل</option>
                                <option value="delivered">تم التسليم</option>
                                <option value="cancelled">ملغي</option>
                              </select>
                            </td>

                            {/* Direct Actions: Approve, WhatsApp, Cancel, Delete */}
                            <td style={{ padding: '12px 14px' }}>
                              <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap' }}>
                                {ord.orderStatus === 'pending' && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveOrder(ord)}
                                    title="الموافقة على الطلب وتأكيده مع إرسال رسالة واتساب أوتوماتيكية للعميل"
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      background: 'var(--nicefood-green)',
                                      border: '1px solid var(--nicefood-green)',
                                      color: '#fff',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                      boxShadow: '0 2px 6px rgba(0, 135, 58, 0.25)',
                                    }}
                                  >
                                    ✓ موافقة وتأكيد
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleSendWhatsAppNotification(ord)}
                                  title="فتح محادثة واتساب مع العميل برقم الطلب وحالته"
                                  style={{
                                    padding: '5px 8px',
                                    borderRadius: '6px',
                                    background: '#25D366',
                                    border: '1px solid #25D366',
                                    color: '#fff',
                                    fontSize: '0.74rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  واتساب
                                </button>

                                {ord.orderStatus !== 'cancelled' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleCancelOrder(ord.id)}
                                    title="إلغاء الطلب فوراً"
                                    style={{
                                      padding: '5px 8px',
                                      borderRadius: '6px',
                                      background: '#fee2e2',
                                      border: '1px solid #fca5a5',
                                      color: '#b91c1c',
                                      fontSize: '0.74rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    إلغاء
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600 }}>ملغي</span>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(ord.id)}
                                  title="حذف نهائي من قاعدة البيانات"
                                  style={{
                                    padding: '5px 6px',
                                    borderRadius: '6px',
                                    background: '#fff',
                                    border: '1px solid #e2e8f0',
                                    color: '#dc2626',
                                    fontSize: '0.72rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  حذف
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: STORE & DELIVERY SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header info */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md, 14px)',
                border: '1px solid var(--border-color)',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.6rem' }}>🛵</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  إعدادات تكلفة التوصيل ومصاريف الشحن
                </h2>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                يمكنك من هنا تعديل وتحديد سعر التوصيل الثابت الذي يظهر للعملاء في عربة التسوق وصفحة إتمام الطلب (Checkout)، وتحديد الحد الأدنى لقيمة السلة التي يُمنح عندها العميل توصيل مجاني تلقائياً.
              </p>
            </div>

            {/* Settings Form Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md, 14px)',
                border: '1px solid var(--border-color)',
                padding: '24px',
              }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fee = parseFloat(tempFeeInput) || 0;
                  const thresh = parseFloat(tempThreshInput) || 0;
                  handleSaveDeliverySettings(fee, thresh);
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                  {/* Delivery Fee Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      💵 سعر التوصيل الثابت (بالجنيه المصري):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        required
                        value={tempFeeInput}
                        onChange={(e) => setTempFeeInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        ج.م
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      السعر الحالي المطبق: <strong style={{ color: '#16a34a' }}>{deliveryFee} ج.م</strong>
                    </div>

                    {/* Quick Presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {[0, 25, 30, 35, 40, 50].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setTempFeeInput(String(preset))}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: tempFeeInput === String(preset) ? '1px solid #16a34a' : '1px solid var(--border-color)',
                            background: tempFeeInput === String(preset) ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-secondary)',
                            color: tempFeeInput === String(preset) ? '#16a34a' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {preset === 0 ? 'توصيل مجاني (0 ج.م)' : `${preset} ج.م`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Free Delivery Threshold Input */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      🎁 الحد الأدنى للشحن المجاني (بالجنيه المصري):
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        required
                        value={tempThreshInput}
                        onChange={(e) => setTempThreshInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        ج.م
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      الحد الحالي المطبق: <strong style={{ color: '#d97706' }}>{freeDeliveryThreshold} ج.م</strong> (أي طلب أكبر من هذا المبلغ يُعفى من الشحن تلقائياً)
                    </div>

                    {/* Quick Presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                      {[300, 400, 500, 600, 1000].map((thresh) => (
                        <button
                          key={thresh}
                          type="button"
                          onClick={() => setTempThreshInput(String(thresh))}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: tempThreshInput === String(thresh) ? '1px solid #d97706' : '1px solid var(--border-color)',
                            background: tempThreshInput === String(thresh) ? 'rgba(217, 119, 6, 0.1)' : 'var(--bg-secondary)',
                            color: tempThreshInput === String(thresh) ? '#d97706' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          {thresh} ج.م
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Customer Preview Alert */}
                <div
                  style={{
                    background: 'rgba(22, 163, 74, 0.05)',
                    border: '1px solid rgba(22, 163, 74, 0.25)',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: '#16a34a' }}>معاينة ما يظهر للعميل في السلة وصفحة الدفع:</strong>
                  <div>
                    • إذا كان مجموع منتجات العميل أقل من <strong>{tempThreshInput} ج.م</strong>، ستتم إضافة <strong>{tempFeeInput} ج.م</strong> مصاريف شحن وتوصيل.
                  </div>
                  <div>
                    • إذا كان مجموع منتجات العميل <strong>{tempThreshInput} ج.م</strong> أو أكثر، سيكون التوصيل <strong>مجاناً (0 ج.م)</strong> تلقائياً!
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#16a34a',
                      color: '#fff',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: savingSettings ? 'not-allowed' : 'pointer',
                      opacity: savingSettings ? 0.75 : 1,
                      boxShadow: '0 3px 12px rgba(22, 163, 74, 0.25)',
                    }}
                  >
                    {savingSettings ? 'جاري حفظ التعديل...' : 'حفظ وتطبيق سعر التوصيل فوراً ✓'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTempFeeInput(String(deliveryFee));
                      setTempThreshInput(String(freeDeliveryThreshold));
                    }}
                    style={{
                      padding: '12px 18px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-muted)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    إعادة ضبط
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Product */}
        {showAddModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg, 16px)',
                border: '1px solid var(--border-color)',
                width: '100%',
                maxWidth: '520px',
                padding: '24px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  إضافة منتج جديد للمصنع
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ background: 'transparent', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    الشركة التابعة *
                  </label>
                  <select
                    value={newBrandId}
                    onChange={(e) => setNewBrandId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nameAr} ({b.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    اسم المنتج بالعربي *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: بانيه دجاج مقرمش"
                    value={newNameAr}
                    onChange={(e) => setNewNameAr(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    اسم المنتج بالإنجليزي
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Crispy Chicken Pane"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      direction: 'ltr',
                      textAlign: 'right',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      التصنيف
                    </label>
                    <select
                      value={newCategoryAr}
                      onChange={(e) => setNewCategoryAr(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <option value="فراخ مجمدة">فراخ مجمدة</option>
                      <option value="سجق وكفتة">سجق وكفتة بلدي</option>
                      <option value="لانشون ومصنعات">لانشون ومصنعات</option>
                      <option value="سوسيس وهووت دوج">سوسيس وهووت دوج</option>
                      <option value="لحوم وبرجر">لحوم وبرجر</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      الوحدة
                    </label>
                    <select
                      value={newUnit}
                      onChange={(e) => setNewUnit(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm, 8px)',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.88rem',
                      }}
                    >
                      <option value="كجم">كجم</option>
                      <option value="عبوة (5 قطع)">عبوة</option>
                      <option value="علبة">علبة</option>
                      <option value="قطعة">قطعة</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    سعر المنتج (ج.م) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="195"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: newIsOffer ? '8px' : 0 }}>
                    <input
                      type="checkbox"
                      checked={newIsOffer}
                      onChange={(e) => setNewIsOffer(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                      تفعيل عرض خاص مخفض لهذا المنتج
                    </span>
                  </label>

                  {newIsOffer && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        سعر العرض المخفض (ج.م)
                      </label>
                      <input
                        type="number"
                        placeholder="175"
                        value={newOfferPrice}
                        onChange={(e) => setNewOfferPrice(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    صورة المنتج (اختياري - سيأخذ لوجو الشركة تلقائياً)
                  </label>
                  <input
                    type="text"
                    placeholder="اتركه فارغاً ليأخذ شعار الشركة"
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--nicefood-green)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      border: 'none',
                    }}
                  >
                    {savingProduct ? 'جاري الحفظ...' : 'حفظ المنتج'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    style={{
                      padding: '10px 16px',
                      borderRadius: 'var(--radius-sm, 8px)',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
