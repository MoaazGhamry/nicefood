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
  const { locale } = useLocale();
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
    <article className="product-card">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="product-card__discount-badge">
          {locale === 'ar' ? `خصم ${discountPercent}%` : `${discountPercent}% OFF`}
        </div>
      )}

      {/* Product Image Area with Real Photos & Subtle Zoom */}
      <div className="product-card__image-wrap">
        <img
          src={product.image || product.brand.logo || '/images/brands/nicefood-logo.jpeg'}
          alt={displayName}
          className="product-card__image"
          loading="lazy"
          decoding="async"
        />

        {/* Brand Pill */}
        <div className="product-card__brand-tag">
          {product.brand.logo && (
            <img
              src={product.brand.logo}
              alt={displayBrand}
              className="product-card__brand-logo"
            />
          )}
          <span>{displayBrand}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="product-card__body">
        <h3 className="product-card__title" title={displayName}>
          {displayName}
        </h3>

        {displayDesc && (
          <p className="product-card__desc">
            {displayDesc}
          </p>
        )}

        {/* Price & Unit */}
        <div className="product-card__price-row">
          <span className="product-card__price">
            {currentPrice} <span className="product-card__currency">{locale === 'ar' ? 'ج.م' : 'EGP'}</span>
          </span>

          {hasDiscount && (
            <span className="product-card__old-price">
              {product.price} {locale === 'ar' ? 'ج.م' : 'EGP'}
            </span>
          )}

          <span className="product-card__unit">
            / {product.unit || (locale === 'ar' ? 'كجم' : 'kg')}
          </span>
        </div>

        {/* Quantity Stepper & Add to Cart */}
        <div className="product-card__actions">
          <div className="product-card__qty-control">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="product-card__qty-btn"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="product-card__qty-val">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="product-card__qty-btn"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className={`product-card__add-btn ${added ? 'product-card__add-btn--added' : ''}`}
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
                <span>{locale === 'ar' ? 'إضافة للسلة' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
