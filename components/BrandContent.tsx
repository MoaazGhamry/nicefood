'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/lib/locale-context';
import ProductCard from '@/components/ProductCard';

interface BrandContentProps {
  brand: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    logo?: string | null;
    color?: string | null;
    description?: string | null;
    descriptionAr?: string | null;
    products: any[];
  };
}

export default function BrandContent({ brand }: BrandContentProps) {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  const brandDisplayName = isAr ? brand.nameAr : brand.name;
  const brandSubName = isAr ? brand.name : brand.nameAr;
  const brandDesc = isAr
    ? brand.descriptionAr || brand.description
    : brand.description || brand.descriptionAr;

  const whatsappInquiryMsg = encodeURIComponent(
    isAr
      ? `مرحباً، أود الاستفسار عن منتجات وتوريد علامة ${brand.nameAr}`
      : `Hello, I would like to inquire about products from ${brand.name}`
  );

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Brand Header Banner */}
      <section
        style={{
          position: 'relative',
          padding: '50px 20px',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          transition: 'background-color 0.4s ease, border-color 0.4s ease',
          overflow: 'hidden',
        }}
      >
        {/* Ambient Top Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '15%',
            right: '15%',
            height: '100%',
            background: 'radial-gradient(ellipse at top, var(--brand-glow) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Brand Logo */}
          <div
            style={{
              width: '104px',
              height: '104px',
              borderRadius: '20px',
              background: '#ffffff',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 10px 30px var(--brand-glow), 0 2px 8px rgba(0,0,0,0.12)',
              flexShrink: 0,
            }}
          >
            <img
              src={brand.logo || '/images/brands/nicefood-logo.jpeg'}
              alt={brandDisplayName}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          </div>

          {/* Brand Info */}
          <div style={{ flex: 1, minWidth: '260px', textAlign: isAr ? 'right' : 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span className="liquid-badge">
                {isAr ? 'مجموعة مصانع NiceFood' : 'NiceFood Manufacturing Group'}
              </span>

              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {brand.products.length} {isAr ? 'منتج متاح' : 'products available'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {brandDisplayName}{' '}
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                ({brandSubName})
              </span>
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.65, maxWidth: '750px' }}>
              {brandDesc}
            </p>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href={`https://wa.me/201558580214?text=${whatsappInquiryMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-full, 9999px)',
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                backdropFilter: 'blur(10px)',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>{isAr ? 'استفسار واتساب' : 'WhatsApp Chat'}</span>
            </a>

            <Link
              href="/cart"
              className="liquid-btn"
              style={{
                padding: '10px 20px',
                fontSize: '0.88rem',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>{isAr ? 'عربة التسوق' : 'Cart'}</span>
            </Link>
          </div>
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
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{brandDisplayName}</span>
      </div>

      {/* Products Grid */}
      <section
        style={{
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '10px 20px 50px',
        }}
      >
        {brand.products.length === 0 ? (
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
              {isAr ? 'لا توجد منتجات مسجلة حالياً' : 'No products currently listed'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
              {isAr ? 'يتم تحديث قائمة المنتجات من المصنع مباشرة' : 'Product catalog is being updated directly from the plant'}
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
            {brand.products.map((prod) => (
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
                    id: brand.id,
                    name: brand.name,
                    nameAr: brand.nameAr,
                    slug: brand.slug,
                    logo: brand.logo,
                    color: brand.color || undefined,
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
