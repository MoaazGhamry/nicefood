'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { useLocale } from '@/lib/locale-context';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/my-orders';

  const { customer, login, register } = useCustomerAuth();
  const { locale } = useLocale();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Form fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (customer) {
      router.push(redirectPath);
    }
  }, [customer, redirectPath, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        if (!phone.trim() || !password.trim()) {
          setErrorMsg(locale === 'ar' ? 'برجاء إدخال رقم الهاتف وكلمة المرور' : 'Please enter phone and password');
          setLoading(false);
          return;
        }

        const res = await login(phone, password);
        if (res.success) {
          router.push(redirectPath);
        } else {
          setErrorMsg(res.error || (locale === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'));
        }
      } else {
        if (!name.trim()) {
          setErrorMsg(locale === 'ar' ? 'برجاء إدخال الاسم بالكامل' : 'Please enter your full name');
          setLoading(false);
          return;
        }
        if (!phone.trim() || phone.replace(/[^0-9]/g, '').length < 10) {
          setErrorMsg(locale === 'ar' ? 'برجاء إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
          setLoading(false);
          return;
        }
        if (!password.trim() || password.length < 4) {
          setErrorMsg(locale === 'ar' ? 'كلمة المرور يجب ألا تقل عن 4 أحرف' : 'Password must be at least 4 characters');
          setLoading(false);
          return;
        }

        const res = await register({ name, phone, password, address });
        if (res.success) {
          setSuccessMsg(locale === 'ar' ? 'تم إنشاء الحساب بنجاح! جاري التحويل...' : 'Account created successfully! Redirecting...');
          setTimeout(() => {
            router.push(redirectPath);
          }, 800);
        } else {
          setErrorMsg(res.error || (locale === 'ar' ? 'فشل إنشاء الحساب' : 'Failed to create account'));
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', padding: '40px 16px 80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          border: '1px solid #ebebeb',
        }}
      >
        {/* Brand header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/images/brands/nicefood-logo.jpeg"
            alt="NiceFood"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              objectFit: 'contain',
              marginBottom: '12px',
              border: '1px solid #eee',
              boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
            }}
          />
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1a1a1a', margin: '0 0 6px' }}>
            {activeTab === 'login'
              ? (locale === 'ar' ? 'تسجيل الدخول إلى حسابك' : 'Log in to your account')
              : (locale === 'ar' ? 'إنشاء حساب عميل جديد' : 'Create Customer Account')}
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#666', margin: 0, lineHeight: 1.5 }}>
            {locale === 'ar'
              ? 'تابع حالة طلباتك في أي وقت واستمتع بتجربة تسوق سريعة ومميزة'
              : 'Track your orders anytime and enjoy seamless shopping'}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: 'flex',
            background: '#f4f5f7',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'login' ? '#ffffff' : 'transparent',
              color: activeTab === 'login' ? '#111' : '#666',
              fontWeight: activeTab === 'login' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'login' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {locale === 'ar' ? 'تسجيل الدخول' : 'Log In'}
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '10px 0',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'register' ? '#ffffff' : 'transparent',
              color: activeTab === 'register' ? '#111' : '#666',
              fontWeight: activeTab === 'register' ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: activeTab === 'register' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            {locale === 'ar' ? 'حساب جديد' : 'Register'}
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#b91c1c',
              fontSize: '0.86rem',
              marginBottom: '16px',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '12px',
              background: '#ecfdf5',
              border: '1px solid #d1fae5',
              color: '#047857',
              fontSize: '0.86rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                {locale === 'ar' ? 'الاسم بالكامل *' : 'Full Name *'}
              </label>
              <input
                type="text"
                placeholder={locale === 'ar' ? 'مثال: محمد أحمد' : 'e.g. Mohamed Ahmed'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  background: '#fbfbfb',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#111',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
              {locale === 'ar' ? 'رقم الهاتف المحمول *' : 'Mobile Phone *'}
            </label>
            <input
              type="tel"
              placeholder="01012345678"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                background: '#fbfbfb',
                fontSize: '0.95rem',
                outline: 'none',
                color: '#111',
                textAlign: 'left',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
              {locale === 'ar' ? 'كلمة المرور *' : 'Password *'}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                background: '#fbfbfb',
                fontSize: '0.95rem',
                outline: 'none',
                color: '#111',
              }}
            />
          </div>

          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#333', marginBottom: '6px' }}>
                {locale === 'ar' ? 'العنوان / مكان التوصيل (اختياري)' : 'Delivery Address (Optional)'}
              </label>
              <input
                type="text"
                placeholder={locale === 'ar' ? 'مثال: العاشر من رمضان - المجاورة 14' : 'e.g. 10th of Ramadan - District 14'}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0',
                  background: '#fbfbfb',
                  fontSize: '0.95rem',
                  outline: 'none',
                  color: '#111',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              boxShadow: '0 4px 14px rgba(22, 163, 74, 0.25)',
              marginTop: '8px',
              transition: 'transform 0.15s ease',
            }}
          >
            {loading
              ? (locale === 'ar' ? 'جاري المعالجة...' : 'Processing...')
              : activeTab === 'login'
                ? (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')
                : (locale === 'ar' ? 'إنشاء حساب جديد ومتابعة' : 'Register & Continue')}
          </button>
        </form>

        {/* Benefits reminder */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid #f0f0f0',
            fontSize: '0.82rem',
            color: '#666',
            lineHeight: 1.6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span>📦</span>
            <span>{locale === 'ar' ? 'متابعة لحظية لحالة كل طلباتك وتحديثات الشحن' : 'Real-time order tracking and shipment updates'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span>⚡</span>
            <span>{locale === 'ar' ? 'حفظ بيانات التوصيل للطلب السريع في المرات القادمة' : 'Saved address for 1-click checkout next time'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💬</span>
            <span>
              {locale === 'ar' ? 'تحتاج مساعدة؟ تواصل معنا عبر ' : 'Need help? Contact us via '}
              <a
                href="https://wa.me/201558580214"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}
              >
                {locale === 'ar' ? 'واتساب 01558580214' : 'WhatsApp 01558580214'}
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
