'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useLocale } from '@/lib/locale-context';
import { useTheme } from '@/lib/theme-context';
import { useCustomerAuth } from '@/lib/customer-auth-context';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { itemCount } = useCart();
  const { t, locale, toggleLocale } = useLocale();
  const { theme, toggleTheme } = useTheme();
  const { customer } = useCustomerAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname?.startsWith(path)) return true;
    return false;
  };

  const whatsappNumber = '201558580214';
  const whatsappMessage = encodeURIComponent(
    locale === 'ar'
      ? 'مرحباً، أود الاستفسار عن منتجات وتوريدات مجموعة نايس فود'
      : 'Hello, I want to inquire about NiceFood products and orders'
  );

  return (
    <header className="header">
      <div className="header__container">
        {/* NiceFood Brand Logo */}
        <Link href="/" className="header__logo" style={{ textDecoration: 'none' }}>
          <img
            src="/images/brands/nicefood-logo.jpeg"
            alt="NiceFood"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              objectFit: 'contain',
              background: '#ffffff',
              padding: '2px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 14px var(--brand-glow)',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              NiceFood
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {locale === 'ar' ? 'للصناعات الغذائية' : 'Food Industries'}
            </span>
          </div>
        </Link>

        {/* Navigation Links - Dashboard REMOVED as requested */}
        <nav className={`header__nav ${mobileMenuOpen ? 'header__nav--open' : ''}`}>
          <Link
            href="/"
            className={`header__nav-link ${isActive('/') ? 'header__nav-link--active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.home')}
          </Link>
          <Link
            href="/brand/tamoush"
            className={`header__nav-link ${isActive('/brand/tamoush') ? 'header__nav-link--active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('brand.tamoush')}
          </Link>
          <Link
            href="/brand/ibn-el-asoul"
            className={`header__nav-link ${isActive('/brand/ibn-el-asoul') ? 'header__nav-link--active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('brand.ibn')}
          </Link>
          <Link
            href="/brand/mazaya"
            className={`header__nav-link ${isActive('/brand/mazaya') ? 'header__nav-link--active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('brand.mazaya')}
          </Link>
          <Link
            href="/offers"
            className={`header__nav-link ${isActive('/offers') ? 'header__nav-link--active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {t('nav.offers')}
          </Link>
          <Link
            href={customer ? "/my-orders" : "/login"}
            className={`header__nav-link ${isActive('/my-orders') || isActive('/login') ? 'header__nav-link--active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {customer ? (locale === 'ar' ? 'طلباتي' : 'My Orders') : (locale === 'ar' ? 'حسابي / طلباتي' : 'My Orders')}
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="header__actions">
          {/* Light / Dark Mode Toggle with SVG icons */}
          <button
            type="button"
            onClick={toggleTheme}
            className="header__theme-btn"
            title={theme === 'dark' ? (locale === 'ar' ? 'الوضع النهاري' : 'Light Mode') : (locale === 'ar' ? 'الوضع الليلي' : 'Dark Mode')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              /* Sun Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              /* Moon Icon */
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>

          {/* Language Toggle */}
          <button
            type="button"
            onClick={toggleLocale}
            className="header__lang-btn"
            title={locale === 'ar' ? 'English' : 'عربي'}
            aria-label="Toggle Language"
          >
            <span>{locale === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* WhatsApp Direct */}
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noopener noreferrer"
            className="header__whatsapp-btn"
            title={locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>{locale === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
          </a>

          {/* Customer Orders / Account Button */}
          <Link
            href={customer ? "/my-orders" : "/login"}
            className="header__cart-btn"
            style={{ textDecoration: 'none' }}
            title={customer ? (locale === 'ar' ? `حسابي (${customer.name})` : `My Account (${customer.name})`) : (locale === 'ar' ? 'تسجيل الدخول / طلباتي' : 'Log In / My Orders')}
            aria-label="My Orders"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>

          {/* Cart Icon Button */}
          <Link href="/cart" className="header__cart-btn" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            {itemCount > 0 && <span className="header__cart-badge">{itemCount}</span>}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="header__mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
