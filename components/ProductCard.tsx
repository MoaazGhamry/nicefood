'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useLocale } from '@/lib/locale-context';

export interface ProductItem {
  id: string;
  name: string;
  nameAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  price: number;
  offerPrice?: number | null;
  image?: string | null;
  category?: string;
  categoryAr?: string | null;
  unit?: string;
  brand: {
    id: string;
    name: string;
    nameAr: string;
    slug: string;
    logo?: string | null;
    color?: string;
  };
  isOffer?: boolean;
}

export default function ProductCard({ product }: { product: ProductItem }) {
  const { addItem } = useCart();
  const { locale, t } = useLocale();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const displayName = locale === 'ar' ? product.nameAr : product.name;
  const displayDesc = locale === 'ar' ? product.descriptionAr : product.description;
  const displayBrand = locale === 'ar' ? product.brand.nameAr : product.brand.name;
  const currentPrice = product.offerPrice || product.price;
  const hasDiscount = !!product.offerPrice && product.offerPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0;

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      nameAr: product.nameAr,
      price: product.price,
      offerPrice: product.offerPrice || undefined,
      image: product.image || product.brand.logo || undefined,
      brandName: product.brand.name,
      brandNameAr: product.brand.nameAr,
      unit: product.unit || (locale === 'ar' ? 'كجم' : 'kg'),
      quantity,
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg, 16px)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
        boxShadow: 'var(--shadow-sm)',
      }}
      className="product-card"
    >
      {/* Discount Badge - Calm Minimal Tag (No neon glow) */}
      {hasDiscount && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: locale === 'ar' ? '12px' : 'auto',
            left: locale === 'ar' ? 'auto' : '12px',
            background: 'var(--tamoush-red, #B8381D)',
            color: '#ffffff',
            padding: '3px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            zIndex: 2,
            letterSpacing: '0.3px',
          }}
        >
          {locale === 'ar' ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
        </div>
      )}

      {/* Product Image Area */}
      <div
        style={{
          position: 'relative',
          height: '180px',
          background: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <img
          src={product.image || product.brand.logo || '/images/brands/nicefood-logo.jpeg'}
          alt={displayName}
          style={{
            maxHeight: '140px',
            maxWidth: '100%',
            objectFit: 'contain',
            borderRadius: '8px',
          }}
        />

        {/* Brand Subtle Tag */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: locale === 'ar' ? '10px' : 'auto',
            right: locale === 'ar' ? 'auto' : '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-card)',
            padding: '3px 8px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {product.brand.logo && (
            <img
              src={product.brand.logo}
              alt={displayBrand}
              style={{ width: '13px', height: '13px', borderRadius: '2px', objectFit: 'cover' }}
            />
          )}
          <span>{displayBrand}</span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3
          style={{
            fontSize: '0.98rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.4,
          }}
        >
          {displayName}
        </h3>

        {displayDesc && (
          <p
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '14px',
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flex: 1,
            }}
          >
            {displayDesc}
          </p>
        )}

        {/* Price & Unit - Calm Typography */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '8px',
            marginTop: 'auto',
            marginBottom: '14px',
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--nicefood-gold)' }}>
            {currentPrice} <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{locale === 'ar' ? 'ج.م' : 'EGP'}</span>
          </span>

          {hasDiscount && (
            <span
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'line-through',
              }}
            >
              {product.price} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          )}

          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              marginInlineStart: 'auto',
            }}
          >
            / {product.unit || (locale === 'ar' ? 'كجم' : 'kg')}
          </span>
        </div>

        {/* Quantity and Add to Cart Action */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm, 8px)',
              background: 'var(--bg-secondary)',
            }}
          >
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                width: '32px',
                height: '36px',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span
              style={{
                width: '28px',
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              style={{
                width: '32px',
                height: '36px',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            style={{
              flex: 1,
              height: '38px',
              borderRadius: 'var(--radius-md, 12px)',
              background: added ? '#10b981' : 'var(--brand-gradient)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 4px 14px var(--brand-glow), inset 0 1px 1px rgba(255, 255, 255, 0.25)',
              transition: 'transform 0.2s ease, filter 0.2s ease',
              cursor: 'pointer',
            }}
          >
            {added ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{locale === 'ar' ? 'تمت الإضافة' : 'Added'}</span>
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span>{locale === 'ar' ? 'إضافة للسلة' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
