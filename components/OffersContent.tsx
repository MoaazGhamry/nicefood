'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import ProductCard from '@/components/ProductCard';

interface OffersContentProps {
  products: any[];
}

export default function OffersContent({ products }: OffersContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Offers Banner */}
      <section
        style={{
          position: 'relative',
          padding: '50px 20px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          textAlign: 'center',
          transition: 'background-color 0.4s ease',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '20%',
            right: '20%',
            height: '100%',
            background: 'radial-gradient(ellipse at top, var(--brand-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '750px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="liquid-badge" style={{ marginBottom: '14px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>
              {isAr ? 'عروض وتخفيضات المصنع المباشرة' : 'Direct Factory Deals & Discounts'}
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}
          >
            {isAr ? 'عروض التوفير الخاصة' : 'Special Volume Savings'}
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7 }}>
            {isAr ? (
              <>
                أسعار مخفضة وتخفيضات حصرية على منتجات الدواجن من <strong>طعموش</strong>، والسجق والكفتة من{' '}
                <strong>ابن الأصول</strong>، واللانشون والسوسيس من <strong>مزايا</strong>.
              </>
            ) : (
              <>
                Exclusive discounts and factory deals across <strong>Taamoosh</strong> poultry,{' '}
                <strong>Ibn El Asoul</strong> baladi meats, and <strong>Mazaya</strong> cold cuts.
              </>
            )}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div
        style={{
          maxWidth: 'var(--container-max)',
          margin: '18px auto',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
        }}
      >
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>
          {isAr ? 'الرئيسية' : 'Home'}
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
          {isAr ? 'عروض التوفير' : 'Special Offers'}
        </span>
      </div>

      {/* Offers Product Grid */}
      <section
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '10px 20px 50px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAr ? (
              <>
                عدد العروض المتاحة حالياً: <strong>{products.length} عرض</strong>
              </>
            ) : (
              <>
                Currently available: <strong>{products.length} special deals</strong>
              </>
            )}
          </span>

          <Link
            href="/cart"
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full, 9999px)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
            <span>{isAr ? 'عربة التسوق' : 'Cart'}</span>
          </Link>
        </div>

        {products.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md, 12px)',
              border: '1px solid var(--border-color)',
            }}
          >
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '6px' }}>
              {isAr ? 'لا توجد عروض حالية متاحة' : 'No offers currently active'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {isAr
                ? 'تابعنا باستمرار للاستفادة من أحدث تخفيضات المصنع'
                : 'Check back soon for upcoming factory discount campaigns'}
            </p>
            <Link
              href="/"
              style={{
                padding: '10px 22px',
                background: 'var(--nicefood-green)',
                color: '#fff',
                borderRadius: 'var(--radius-full, 9999px)',
                fontWeight: 600,
                fontSize: '0.88rem',
                textDecoration: 'none',
              }}
            >
              {isAr ? 'العودة للرئيسية' : 'Return to Home'}
            </Link>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((prod) => (
              <ProductCard
                key={prod.id}
                product={{
                  id: prod.id,
                  name: prod.name,
                  nameAr: prod.nameAr,
                  description: prod.description,
                  descriptionAr: prod.descriptionAr,
                  price: prod.price,
                  offerPrice: prod.offerPrice,
                  image: prod.image,
                  category: prod.category,
                  categoryAr: prod.categoryAr,
                  unit: prod.unit,
                  isOffer: prod.isOffer,
                  brand: {
                    id: prod.brand.id,
                    name: prod.brand.name,
                    nameAr: prod.brand.nameAr,
                    slug: prod.brand.slug,
                    logo: prod.brand.logo,
                    color: prod.brand.color,
                  },
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
