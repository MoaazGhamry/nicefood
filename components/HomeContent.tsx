'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import ProductCard, { ProductItem } from '@/components/ProductCard';

interface HomeContentProps {
  products: ProductItem[];
}

export default function HomeContent({ products }: HomeContentProps) {
  const { locale } = useLocale();

  const isAr = locale === 'ar';

  const mainCards = [
    {
      id: 'tamoush',
      title: isAr ? 'طعموش' : 'Taamoosh',
      desc: isAr
        ? 'مصنع الدواجن والمجمدات: بانيه مقرمش، ستربس، ناجتس، وبرجر وشيش طاووق فاخر.'
        : 'Poultry & frozen foods: Crispy pane, chicken strips, nuggets, burger, and marinated shish.',
      logo: '/images/brands/taamoosh.jpg',
      tag: isAr ? 'دواجن ومجمدات' : 'Poultry & Frozen',
      badge: isAr ? 'الأكثر طلباً' : 'Best Seller',
      color: 'var(--tamoush-blue, #1d24bf)',
      href: '/brand/tamoush',
      borderTone: 'rgba(37, 99, 235, 0.35)',
      glowTone: 'rgba(29, 36, 191, 0.28)',
    },
    {
      id: 'ibn-el-asoul',
      title: isAr ? 'ابن الأصول' : 'Ibn El Asoul',
      desc: isAr
        ? 'أصالة المذاق الشرقي البلدي: سجق إسكندراني مخصوص، كفتة حاتي، وحواوشي ومصنعات بلدي.'
        : 'Authentic Egyptian tastes: Alexandrian baladi sausage, kofta, and Egyptian hawawshi.',
      logo: '/images/brands/ibn-elosool.jpeg',
      tag: isAr ? 'سجق وكفتة بلدي' : 'Baladi Meats',
      badge: isAr ? 'طعم بلدي أصيل' : 'Authentic Baladi',
      color: 'var(--ibn-red, #950101)',
      href: '/brand/ibn-el-asoul',
      borderTone: 'rgba(220, 38, 38, 0.35)',
      glowTone: 'rgba(149, 1, 1, 0.28)',
    },
    {
      id: 'mazaya',
      title: isAr ? 'مزايا' : 'Mazaya',
      desc: isAr
        ? 'مزايا الطعم والجودة الفائقة: لانشون بقري سادة وبالزيتون، سوسيس كوكتيل وفرانكفورتر.'
        : 'Premium luncheon, smoked beef cold cuts, cocktail frankfurters, and hotdogs.',
      logo: '/images/brands/mazaya-real.jpeg',
      tag: isAr ? 'لانشون وسوسيس' : 'Luncheon & Hotdogs',
      badge: isAr ? 'جودة استثنائية' : 'Premium Standard',
      color: 'var(--mazaya-green, #2e7e35)',
      href: '/brand/mazaya',
      borderTone: 'rgba(22, 163, 74, 0.35)',
      glowTone: 'rgba(46, 126, 53, 0.28)',
    },
    {
      id: 'offers',
      title: isAr ? 'عروض التوفير الكبرى' : 'Special Factory Deals',
      desc: isAr
        ? 'خصومات حصرية وتخفيضات مباشرة من المصنع على تشكيلات مختارة من المنتجات.'
        : 'Factory direct promotions and bulk savings on selected products across all brands.',
      logo: '/images/brands/nicefood-logo.jpeg',
      tag: isAr ? 'عروض حصرية' : 'Exclusive Deals',
      badge: isAr ? 'خصومات المصنع' : 'Factory Discount',
      color: 'var(--offers-gold, #d97706)',
      href: '/offers',
      borderTone: 'rgba(245, 158, 11, 0.35)',
      glowTone: 'rgba(217, 119, 6, 0.28)',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          padding: '70px 20px 50px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center',
          transition: 'background-color 0.25s ease',
        }}
      >
        <div style={{ maxWidth: '840px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Quality Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 18px',
              borderRadius: '20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>
              {isAr
                ? 'مجموعة مصانع نايس فود - إنتاج وتوريد طازج يومياً حسب الطلب'
                : 'NiceFood Manufacturing Group - Fresh Daily On-Demand Supply'}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              fontWeight: 800,
              lineHeight: 1.25,
              marginBottom: '16px',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
            }}
          >
            {isAr
              ? 'أجود المنتجات الغذائية من المصنع مباشرة'
              : 'Premium Food Products Directly From The Factory'}
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              maxWidth: '720px',
              margin: '0 auto 30px',
            }}
          >
            {isAr ? (
              <>
                نقدم لكم 3 علامات تجارية رائدة: <strong>طعموش</strong> لمصنعات الدواجن،{' '}
                <strong>ابن الأصول</strong> للسجق والكفتة البلدي، و<strong>مزايا</strong> للّانشون والسوسيس.
                متاح إنتاج أي كميات مطلوبة مع إمكانية التوصيل والدفع عند الاستلام أو إلكترونياً.
              </>
            ) : (
              <>
                Featuring 3 leading manufacturing brands: <strong>Taamoosh</strong> for poultry,{' '}
                <strong>Ibn El Asoul</strong> for baladi oriental meats, and <strong>Mazaya</strong> for luncheon & hotdogs.
                Custom production capacity with refrigerated express delivery and flexible online or cash payment.
              </>
            )}
          </p>

          {/* Action CTAs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="#main-brands"
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--nicefood-green)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span>{isAr ? 'تصفح العلامات التجارية' : 'Explore Brands'}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </a>

            <Link
              href="/offers"
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <span>{isAr ? 'عروض التوفير' : 'Special Offers'}</span>
            </Link>

            <a
              href={`https://wa.me/201558580214?text=${encodeURIComponent(
                isAr
                  ? 'مرحباً، أود طلب توريد خاص من مصنع نايس فود'
                  : 'Hello, I want to inquire about a B2B wholesale order from NiceFood factory'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '12px 22px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.92rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{isAr ? 'طلب توريد خاص' : 'B2B Wholesale Inquiry'}</span>
            </a>
          </div>
        </div>
      </section>

      {/* THE 4 MAIN CARDS SECTION */}
      <section
        id="main-brands"
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '50px 20px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            {isAr ? 'شركات وعلامات المجموعة' : 'Our Brands & Catalogs'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            {isAr
              ? 'اختر العلامة التجارية المطلوبة أو تصفح قسم العروض المباشرة'
              : 'Select a brand below to view specialized products or browse factory offers'}
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="brand-hub-grid">
          {mainCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl, 22px)',
                padding: '28px 22px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                textDecoration: 'none',
                overflow: 'hidden',
                ['--brand-glow' as any]: card.glowTone,
                ['--brand-border' as any]: card.borderTone,
                ['--brand-primary' as any]: card.color,
              }}
              className="liquid-card brand-hub-card"
            >
              {/* Badge */}
              <div
                style={{
                  position: 'absolute',
                  top: '14px',
                  [isAr ? 'right' : 'left']: '14px',
                  background: 'var(--bg-glass)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: `1px solid ${card.borderTone}`,
                  color: card.color,
                  padding: '4px 12px',
                  borderRadius: '16px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  boxShadow: `0 2px 8px ${card.glowTone}`,
                }}
              >
                {card.badge}
              </div>

              {/* Logo Area */}
              <div
                style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '18px',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  marginBottom: '16px',
                  marginTop: '12px',
                  boxShadow: `0 8px 24px ${card.glowTone}, 0 2px 6px rgba(0,0,0,0.08)`,
                }}
              >
                <img
                  src={card.logo}
                  alt={card.title}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '10px',
                  }}
                />
              </div>

              {/* Category Tag */}
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: card.color,
                  marginBottom: '6px',
                  letterSpacing: '0.3px',
                }}
              >
                {card.tag}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  marginBottom: '10px',
                }}
              >
                {card.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  marginBottom: '22px',
                  flex: 1,
                }}
              >
                {card.desc}
              </p>

              {/* Action Button */}
              <div
                style={{
                  width: '100%',
                  padding: '11px 18px',
                  borderRadius: 'var(--radius-md, 12px)',
                  background: 'var(--bg-glass)',
                  border: `1px solid ${card.borderTone}`,
                  color: 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.25s ease',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                }}
              >
                <span>{isAr ? 'دخول المتجر' : 'Explore Catalog'}</span>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={card.color}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transform: isAr ? 'none' : 'rotate(180deg)' }}
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED OFFERS SECTION */}
      {products.length > 0 && (
        <section
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            padding: '30px 20px 50px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div
                style={{
                  color: 'var(--nicefood-gold)',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m10 15 5-3-5-3v6Z" />
                </svg>
                <span>{isAr ? 'قائمة المنتجات المميزة' : 'Featured Products'}</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {isAr ? 'منتجات مختارة من خطوط الإنتاج' : 'Selected Products From Production Lines'}
              </h2>
            </div>

            <Link
              href="/offers"
              style={{
                color: 'var(--nicefood-gold)',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              <span>{isAr ? 'مشاهدة جميع العروض' : 'View All Offers'}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ transform: isAr ? 'none' : 'rotate(180deg)' }}
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

          <div className="products-grid">
            {products.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* WHY NICEFOOD - Factory Highlights */}
      <section
        style={{
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '50px 20px',
          transition: 'background-color 0.25s ease',
        }}
      >
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isAr ? 'مميزات التصنيع المباشر' : 'Factory Direct Advantages'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {isAr
                ? 'من المصنع إلى العميل مباشرة بأعلى مواصفات السلامة الغذائية'
                : 'Direct from our plant to your doorstep with certified hygiene & quality'}
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: isAr ? 'right' : 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nicefood-green)',
                  marginBottom: '14px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {isAr ? 'إنتاج طازج حسب الطلب' : 'Fresh On-Demand Production'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'لا يوجد حد أقصى للكميات. المصنع مجهز لإنتاج وتعبئة طلبيتك فور تأكيدها لضمان أقصى درجات الطزاجة.'
                  : 'No quantity caps. Our lines are ready to process, freeze, and pack your order on-demand.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: isAr ? 'right' : 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nicefood-green)',
                  marginBottom: '14px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <line x1="2" x2="22" y1="10" y2="10" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {isAr ? 'خيارات دفع متكاملة (Paymob وفيزا وكاش)' : 'Paymob, Cards & Cash on Delivery'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'ادفع نقداً عند استلام المنتجات، أو إلكترونياً ببطاقتك البنكية بأمان عبر Paymob، أو عبر المحافظ الإلكترونية.'
                  : 'Pay cash upon receipt, securely online via Paymob (Visa / Mastercard), or through e-wallets.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: isAr ? 'right' : 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nicefood-green)',
                  marginBottom: '14px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {isAr ? 'تحديد اللوكيشن تلقائياً' : 'Auto GPS Location Detection'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'خاصية التقاط موقعك الجغرافي بضغطة زر لضمان وصول سيارة التبريد إلى عنوانك المحدد بدقة.'
                  : '1-click GPS auto-detection ensures our refrigerated fleet reaches your exact coordinates.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: isAr ? 'right' : 'left',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--nicefood-green)',
                  marginBottom: '14px',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {isAr ? 'رقابة وجودة مصرية معتمدة' : 'Certified Egyptian Standards'}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {isAr
                  ? 'فحوصات بيطرية وصحية دقيقة تخضع لها كافة منتجات اللحوم والدواجن وفق المعايير القياسية.'
                  : 'Rigorous veterinary and hygienic quality control applied to all processed meats and poultry.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHOLESALE BANNER */}
      <section
        style={{
          maxWidth: 'var(--container-max)',
          margin: '40px auto 0',
          padding: '0 20px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg, 16px)',
            padding: '36px 30px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            boxShadow: 'var(--shadow-sm)',
            textAlign: isAr ? 'right' : 'left',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <span
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '3px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                display: 'inline-block',
                marginBottom: '10px',
              }}
            >
              {isAr ? 'خدمات التوريد والمبيعات' : 'B2B & Wholesale Services'}
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {isAr
                ? 'هل ترغب في طلب كميات توريد خاصة للمطاعم أو الفنادق؟'
                : 'Need volume supply contracts for restaurants, hotels or chains?'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
              {isAr
                ? 'نقدم أسعاراً تنافسية مباشرة من مصنع العاشر من رمضان مع جدول توريد منتظم للمطاعم ومحلات الجملة والهايبر ماركت.'
                : 'Direct factory pricing with scheduled supply routes across Cairo, Giza, and 10th of Ramadan.'}
            </p>
          </div>

          <a
            href={`https://wa.me/201558580214?text=${encodeURIComponent(
              isAr
                ? 'مرحباً، أنا مهتم بتوريدات جملة من مصنع نايس فود'
                : 'Hello, I am interested in wholesale B2B supply from NiceFood factories'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '12px 24px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'var(--nicefood-green)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.92rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <span>{isAr ? 'تواصل مع قسم المبيعات' : 'Contact Sales Department'}</span>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: isAr ? 'none' : 'rotate(180deg)' }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
