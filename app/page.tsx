import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';

export default async function HomePage() {
  // Fetch active products with brand info
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      include: { brand: true },
      take: 8,
      orderBy: { isOffer: 'desc' },
    });
  } catch (error) {
    console.error('Failed to load products from DB:', error);
  }

  // The 4 Main Hub Cards as requested by user - Colors extracted directly from actual logos
  const mainCards = [
    {
      id: 'tamoush',
      titleAr: 'طعموش',
      titleEn: 'Taamoosh',
      descAr: 'مصنع الدواجن والمجمدات: بانيه مقرمش، ستربس، ناجتس، وبرجر وشيش طاووق فاخر.',
      descEn: 'Poultry & frozen foods: Chicken pane, strips, nuggets, burger, and marinated shish.',
      logo: '/images/brands/taamoosh.jpg',
      tagAr: 'دواجن ومجمدات',
      tagEn: 'Poultry & Frozen',
      badgeAr: 'الأكثر طلباً',
      badgeEn: 'Best Seller',
      color: 'var(--tamoush-blue, #1d24bf)',
      href: '/brand/tamoush',
      borderTone: 'rgba(37, 99, 235, 0.35)',
      glowTone: 'rgba(29, 36, 191, 0.28)',
    },
    {
      id: 'ibn-el-asoul',
      titleAr: 'ابن الأصول',
      titleEn: 'Ibn El Asoul',
      descAr: 'أصالة المذاق الشرقي البلدي: سجق إسكندراني مخصوص، كفتة حاتي، وحواوشي ومصنعات بلدي.',
      descEn: 'Authentic Egyptian tastes: Alexandrian sausage, kofta, and baladi hawawshi.',
      logo: '/images/brands/ibn-elosool.jpeg',
      tagAr: 'سجق وكفتة بلدي',
      tagEn: 'Baladi Meats',
      badgeAr: 'طعم بلدي أصيل',
      badgeEn: 'Authentic Baladi',
      color: 'var(--ibn-red, #950101)',
      href: '/brand/ibn-el-asoul',
      borderTone: 'rgba(220, 38, 38, 0.35)',
      glowTone: 'rgba(149, 1, 1, 0.28)',
    },
    {
      id: 'mazaya',
      titleAr: 'مزايا',
      titleEn: 'Mazaya',
      descAr: 'مزايا الطعم والجودة الفائقة: لانشون بقري سادة وبالزيتون، سوسيس كوكتيل وفرانكفورتر.',
      descEn: 'Premium luncheon, smoked cuts, cocktail hotdogs, and beef frankfurters.',
      logo: '/images/brands/mazaya-real.jpeg',
      tagAr: 'لانشون وسوسيس',
      tagEn: 'Luncheon & Hotdogs',
      badgeAr: 'جودة استثنائية',
      badgeEn: 'Premium Standard',
      color: 'var(--mazaya-green, #2e7e35)',
      href: '/brand/mazaya',
      borderTone: 'rgba(22, 163, 74, 0.35)',
      glowTone: 'rgba(46, 126, 53, 0.28)',
    },
    {
      id: 'offers',
      titleAr: 'عروض التوفير الكبرى',
      titleEn: 'Special Offers',
      descAr: 'خصومات حصرية وتخفيضات مباشرة من المصنع على تشكيلات مختارة من المنتجات.',
      descEn: 'Factory direct offers and volume savings across selected food catalogs.',
      logo: '/images/brands/nicefood-logo.jpeg',
      tagAr: 'عروض حصرية',
      tagEn: 'Special Deals',
      badgeAr: 'خصومات المصنع',
      badgeEn: 'Factory Discount',
      color: 'var(--offers-gold, #d97706)',
      href: '/offers',
      borderTone: 'rgba(245, 158, 11, 0.35)',
      glowTone: 'rgba(217, 119, 6, 0.28)',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Hero Section - Calm & Grounded */}
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
        <div style={{ maxWidth: '820px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Quality Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
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
            <span>مجموعة مصانع نايس فود - إنتاج وتوريد طازج يومياً حسب الطلب</span>
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
            أجود المنتجات الغذائية من المصنع مباشرة
          </h1>

          <p
            style={{
              fontSize: '1.05rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.75,
              maxWidth: '700px',
              margin: '0 auto 30px',
            }}
          >
            نقدم لكم 3 علامات تجارية رائدة: <strong>طعموش</strong> لمصنعات الدواجن،{' '}
            <strong>ابن الأصول</strong> للسجق والكفتة البلدي، و<strong>مزايا</strong> للّانشون والسوسيس.
            متاح إنتاج أي كميات مطلوبة مع إمكانية التوصيل والدفع عند الاستلام أو إلكترونياً.
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
              <span>تصفح العلامات التجارية</span>
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
              <span>عروض التوفير</span>
            </Link>

            <a
              href="https://wa.me/201019000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%88%D8%AF%20%D8%B7%D9%84%D8%A8%20%D8%AA%D9%88%D8%B1%D9%8A%D8%AF%20%D9%85%D9%86%20%D9%85%D8%B5%D9%86%D8%B9%20%D9%86%D8%A7%D9%8A%D8%B3%20%D9%81%D9%88%D8%AF"
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
              <span>طلب توريد خاص</span>
            </a>
          </div>
        </div>
      </section>

      {/* THE 4 MAIN CARDS SECTION - Calm, Clean, Professional */}
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
            شركات وعلامات المجموعة
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            اختر العلامة التجارية المطلوبة أو تصفح قسم العروض المباشرة
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
                  right: '14px',
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
                {card.badgeAr}
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
                  alt={card.titleAr}
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
                {card.tagAr}
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
                {card.titleAr}
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
                {card.descAr}
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
                <span>دخول المتجر</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                <span>قائمة المنتجات المميزة</span>
              </div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                منتجات مختارة من خطوط الإنتاج
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
              <span>مشاهدة جميع العروض</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>

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
        </section>
      )}

      {/* WHY NICEFOOD - Factory Highlights with Clean SVG Icons */}
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
              مميزات التصنيع المباشر
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              من المصنع إلى العميل مباشرة بأعلى مواصفات السلامة الغذائية
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '20px',
            }}
          >
            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: 'right',
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
                إنتاج طازج حسب الطلب
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                لا يوجد حد أقصى للكميات. المصنع مجهز لإنتاج وتعبئة طلبيتك فور تأكيدها لضمان أقصى درجات الطزاجة.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: 'right',
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
                خيارات دفع متكاملة (Paymob وفيزا وكاش)
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                ادفع نقداً عند استلام المنتجات، أو إلكترونياً ببطاقتك البنكية بأمان، أو عبر المحافظ الإلكترونية.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: 'right',
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
                تحديد اللوكيشن تلقائياً
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                خاصية التقاط موقعك الجغرافي بضغطة زر لضمان وصول سيارة التبريد إلى عنوانك المحدد بدقة.
              </p>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                padding: '24px 20px',
                borderRadius: 'var(--radius-md, 12px)',
                border: '1px solid var(--border-color)',
                textAlign: 'right',
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
                رقابة وجودة مصرية معتمدة
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                فحوصات بيطرية وصحية دقيقة تخضع لها كافة منتجات اللحوم والدواجن وفق المعايير القياسية.
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
              خدمات التوريد والمبيعات
            </span>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              هل ترغب في طلب كميات توريد خاصة للمطاعم أو الفنادق؟
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.65 }}>
              نقدم أسعاراً تنافسية مباشرة من مصنع العاشر من رمضان مع جدول توريد منتظم للمطاعم ومحلات الجملة والهايبر ماركت.
            </p>
          </div>

          <a
            href="https://wa.me/201019000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D9%86%D8%A7%20%D9%85%D9%87%D8%AA%D9%85%20%D8%A8%D8%AA%D9%88%D8%B1%D9%8A%D8%AF%D8%A7%D8%AA%20%D8%AC%D9%85%D9%84%D8%A9%20%D9%85%D9%86%20%D9%85%D8%B5%D9%86%D8%B9%20%D9%86%D8%A7%D9%8A%D8%B3%20%D9%81%D9%88%D8%AF"
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
            <span>تواصل مع قسم المبيعات</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
