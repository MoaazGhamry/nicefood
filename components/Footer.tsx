'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';

export default function Footer() {
  const { t, locale } = useLocale();

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-color)',
        background: 'var(--bg-secondary)',
        padding: '50px 20px 24px',
        transition: 'background-color 0.25s ease, border-color 0.25s ease',
      }}
    >
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '36px',
        }}
      >
        {/* NiceFood Parent Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <img
              src="/images/brands/nicefood-logo.jpeg"
              alt="NiceFood"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: '#fff',
                objectFit: 'contain',
                padding: '2px',
                border: '1px solid var(--border-color)',
              }}
            />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                NiceFood
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {locale === 'ar' ? 'مجموعة المنتجات الغذائية' : 'Food Industries Group'}
              </span>
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75 }}>
            {locale === 'ar'
              ? 'مجموعة مصانع نايس فود لإنتاج الدواجن والمجمدات واللحوم المصنعة بأعلى مواصفات الجودة المصرية. إنتاج وتوريد مستمر حسب الطلب بدون حد أقصى للكميات.'
              : 'NiceFood factories produce frozen poultry and processed meats with high Egyptian quality standards. On-demand production for any quantity.'}
          </p>
          <div
            style={{
              marginTop: '14px',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{locale === 'ar' ? 'العاشر من رمضان - المنطقة الصناعية - مصر' : '10th of Ramadan City - Industrial Zone - Egypt'}</span>
          </div>
        </div>

        {/* Brand Links with real logos */}
        <div>
          <h4
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '14px',
              letterSpacing: '0.3px',
            }}
          >
            {locale === 'ar' ? 'العلامات التجارية' : 'Our Brands'}
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              href="/brand/tamoush"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              <img
                src="/images/brands/taamoosh.jpg"
                alt="طعموش"
                style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
              />
              <span>{locale === 'ar' ? 'طعموش (دواجن ومجمدات)' : 'Taamoosh (Poultry & Frozen)'}</span>
            </Link>
            <Link
              href="/brand/ibn-el-asoul"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              <img
                src="/images/brands/ibn-elosool.jpeg"
                alt="ابن الأصول"
                style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
              />
              <span>{locale === 'ar' ? 'ابن الأصول (سجق وكفتة بلدي)' : 'Ibn El Asoul (Baladi Sausage & Meats)'}</span>
            </Link>
            <Link
              href="/brand/mazaya"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              <img
                src="/images/brands/mazaya-real.jpeg"
                alt="مزايا"
                style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}
              />
              <span>{locale === 'ar' ? 'مزايا (لانشون وسوسيس)' : 'Mazaya (Luncheon & Hotdogs)'}</span>
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '14px',
              letterSpacing: '0.3px',
            }}
          >
            {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
            <li>
              <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {t('nav.home')}
              </Link>
            </li>
            <li>
              <Link href="/offers" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {t('nav.offers')}
              </Link>
            </li>
            <li>
              <Link href="/cart" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {t('nav.cart')}
              </Link>
            </li>
            <li>
              <Link href="/checkout" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {t('checkout.title')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact and WhatsApp line */}
        <div>
          <h4
            style={{
              color: 'var(--text-primary)',
              fontSize: '0.95rem',
              fontWeight: 700,
              marginBottom: '14px',
              letterSpacing: '0.3px',
            }}
          >
            {locale === 'ar' ? 'التوريد والمبيعات' : 'Sales & Inquiries'}
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '12px', lineHeight: 1.6 }}>
            {locale === 'ar'
              ? 'متاح توريدات جملة للمطاعم والفنادق والشركات وسلاسل التجزئة بأسعار المصنع المباشرة.'
              : 'Direct wholesale supply for restaurants, hotels, catering, and retail.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
            <a
              href="https://wa.me/201558580214"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1B8A4D', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>+20 155 858 0214</span>
            </a>
            <a
              href="https://www.facebook.com/people/%D8%B7%D8%B9%D9%85%D9%88%D8%B4/61565156512518/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#1877F2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>{locale === 'ar' ? 'صفحة فيسبوك' : 'Facebook Page'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar with Secret Distinctive Admin Trigger */}
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '36px auto 0',
          paddingTop: '18px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>© {new Date().getFullYear()} NiceFood Group. {locale === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved.'}</span>
          
          {/* Distinctive Secret Entry Mark for Dashboard as requested */}
          <Link
            href="/admin"
            title="Management Portal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              color: 'var(--text-muted)',
              opacity: 0.35,
              transition: 'all 0.2s',
              cursor: 'pointer',
              textDecoration: 'none',
              marginLeft: '4px',
            }}
            className="secret-admin-trigger"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>

        <span>صنع في مصر</span>
      </div>
    </footer>
  );
}
