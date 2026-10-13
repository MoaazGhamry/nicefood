'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart-context';
import { useLocale } from '@/lib/locale-context';

export default function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const { locale } = useLocale();

  const isHome = pathname === '/';
  const isBrands = pathname.startsWith('/brand');
  const isOrders = pathname.startsWith('/my-orders') || pathname.startsWith('/login');
  const isCart = pathname.startsWith('/cart') || pathname.startsWith('/checkout');

  const whatsappNumber = '201558580214';
  const whatsappMsg = encodeURIComponent(
    locale === 'ar'
      ? 'مرحباً، أود الاستفسار عن منتجات وتوريدات مجموعة نايس فود'
      : 'Hello, I would like to inquire about NiceFood products'
  );

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav__inner">
        {/* 1. Home */}
        <Link
          href="/"
          className={`mobile-bottom-nav__item ${isHome ? 'mobile-bottom-nav__item--active' : ''}`}
        >
          <div className="mobile-bottom-nav__icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span>{locale === 'ar' ? 'الرئيسية' : 'Home'}</span>
        </Link>

        {/* 2. Brands Hub */}
        <Link
          href="/#main-brands"
          className={`mobile-bottom-nav__item ${isBrands ? 'mobile-bottom-nav__item--active' : ''}`}
        >
          <div className="mobile-bottom-nav__icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>
          <span>{locale === 'ar' ? 'الماركات' : 'Brands'}</span>
        </Link>

        {/* 3. My Orders Hub */}
        <Link
          href="/my-orders"
          className={`mobile-bottom-nav__item ${isOrders ? 'mobile-bottom-nav__item--active' : ''}`}
        >
          <div className="mobile-bottom-nav__icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <span>{locale === 'ar' ? 'طلباتي' : 'Orders'}</span>
        </Link>

        {/* 4. Cart with badge */}
        <Link
          href="/cart"
          className={`mobile-bottom-nav__item ${isCart ? 'mobile-bottom-nav__item--active' : ''}`}
        >
          <div className="mobile-bottom-nav__icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {itemCount > 0 && (
              <span className="mobile-bottom-nav__badge">{itemCount}</span>
            )}
          </div>
          <span>{locale === 'ar' ? 'العربة' : 'Cart'}</span>
        </Link>

        {/* 5. Direct WhatsApp Support */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mobile-bottom-nav__item mobile-bottom-nav__item--whatsapp"
        >
          <div className="mobile-bottom-nav__icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <span>{locale === 'ar' ? 'تواصل' : 'Chat'}</span>
        </a>
      </div>
    </nav>
  );
}
