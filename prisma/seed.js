const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding NiceFood database...');

  // Clean existing
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.brand.deleteMany({});

  // 1. Create Brands with real uploaded logos
  const tamoush = await prisma.Brand.create({
    data: {
      name: 'Taamoosh',
      nameAr: 'طعموش',
      slug: 'tamoush',
      description: 'Frozen poultry and ready-to-cook meat products',
      descriptionAr: 'مصنع طعموش للمنتجات الغذائية والمجمدات - إنتاج وتوريد طازج يومياً بأعلى معايير الجودة والسلامة الغذائية بالعاشر من رمضان',
      logo: '/images/brands/taamoosh.jpg',
      color: '#2229c1',
      isActive: true,
    },
  });

  const ibnElAsoul = await prisma.Brand.create({
    data: {
      name: 'Ibn El Asoul',
      nameAr: 'ابن الأصول',
      slug: 'ibn-el-asoul',
      description: 'Authentic Egyptian traditional meats and oriental sausage',
      descriptionAr: 'أصالة الطعم الشرقي المصري، سجق وكفتة ومصنعات بلدي بمذاق لا يُعلى عليه وجودة مضمونة',
      logo: '/images/brands/ibn-elosool.jpeg',
      color: '#950101',
      isActive: true,
    },
  });

  const mazaya = await prisma.Brand.create({
    data: {
      name: 'Mazaya',
      nameAr: 'مزايا',
      slug: 'mazaya',
      description: 'Premium luncheons, cold cuts, hot dogs and sausages',
      descriptionAr: 'مزايا الطعم الفريد والجودة الفائقة - لانشون وسوسيس وبسطرمة ومصنعات باردة لكل العائلة والمطاعم',
      logo: '/images/brands/mazaya-real.jpeg',
      color: '#2e7e35',
      isActive: true,
    },
  });

  console.log('Created brands:', { tamoush: tamoush.id, ibn: ibnElAsoul.id, mazaya: mazaya.id });

  // 2. Create Products
  const products = [
    // Taamoosh (طعموش)
    {
      name: 'Crispy Chicken Pane',
      nameAr: 'بانيه دجاج مقرمش سوبر فاخر',
      description: 'Fresh chicken breast pane, seasoned with crunchy golden crumbs',
      descriptionAr: 'صدور دجاج متبلة ومغلفة بطبقة كرانشي مقرمشة، جاهزة للقلي السريع',
      price: 195,
      offerPrice: 175,
      image: '/images/brands/taamoosh.jpg',
      category: 'chicken',
      categoryAr: 'فراخ مجمدة',
      brandId: tamoush.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Chicken Strips (Spicy / Regular)',
      nameAr: 'ستربس دجاج مقرمش (حار / عادي)',
      description: 'Crispy tender chicken breast strips',
      descriptionAr: 'أصابع صدور دجاج كاملة متبلة ومقرمشة بأعلى جودة وتتبيلة سرية',
      price: 210,
      offerPrice: 189,
      image: '/images/brands/taamoosh.jpg',
      category: 'chicken',
      categoryAr: 'فراخ مجمدة',
      brandId: tamoush.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Golden Chicken Nuggets',
      nameAr: 'ناجتس دجاج ذهبي للأطفال',
      description: 'Kids favorite golden chicken nuggets',
      descriptionAr: 'قطع ناجتس دجاج ناعمة ومقرمشة محبوبة لجميع أفراد الأسرة ولانش بوكس المدارس',
      price: 180,
      offerPrice: null,
      image: '/images/brands/taamoosh.jpg',
      category: 'chicken',
      categoryAr: 'فراخ مجمدة',
      brandId: tamoush.id,
      isOffer: false,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Charcoal Shish Tawook',
      nameAr: 'شيش طاووق متبل جاهز للشوي',
      description: 'Tender marinated chicken thigh cubes ready for grill',
      descriptionAr: 'قطع شيش طاووق فريش متبلة بأعشاب وتوابل طبيعية جاهزة للشواية أو الفرن',
      price: 230,
      offerPrice: 205,
      image: '/images/brands/taamoosh.jpg',
      category: 'chicken',
      categoryAr: 'فراخ مجمدة',
      brandId: tamoush.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Jumbo Beef Burger (8 pcs)',
      nameAr: 'برجر لحم جامبو فاخر (8 قطع)',
      description: '100% Beef patties juicy and tasty',
      descriptionAr: 'برجر لحم بقري صافي سميك وتتبيلة خاصة بدون إضافات ضارة',
      price: 220,
      offerPrice: 199,
      image: '/images/brands/taamoosh.jpg',
      category: 'meat',
      categoryAr: 'لحوم ومصنعات',
      brandId: tamoush.id,
      isOffer: true,
      unit: 'علبة (8 قطع)',
      minOrder: 1,
    },

    // Ibn El Asoul (ابن الأصول)
    {
      name: 'Alexandrian Oriental Sausage',
      nameAr: 'سجق بلدي إسكندراني مخصوص',
      description: 'Traditional Egyptian spiced beef sausage',
      descriptionAr: 'سجق بلدي بهارات شرقية مخصوصة بنكهة إسكندرانية أصيلة من المصنع إليك',
      price: 240,
      offerPrice: 215,
      image: '/images/brands/ibn-elosool.jpeg',
      category: 'sausage',
      categoryAr: 'سجق وكفتة',
      brandId: ibnElAsoul.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Baladi Kofta for Grill',
      nameAr: 'كفتة حاتي بلدي للشواء',
      description: 'Pre-seasoned Egyptian minced beef skewers',
      descriptionAr: 'كفتة مشوية على الفحم بنسبة دهن مثالية وتتبيلة الحاتي الأصلية',
      price: 210,
      offerPrice: null,
      image: '/images/brands/ibn-elosool.jpeg',
      category: 'sausage',
      categoryAr: 'سجق وكفتة',
      brandId: ibnElAsoul.id,
      isOffer: false,
      unit: '900 جم',
      minOrder: 1,
    },
    {
      name: 'Ready Baladi Hawawshi (5 loaves)',
      nameAr: 'حواوشي بلدي فاخر جاهز للتسوية (5 أرغفة)',
      description: '5 stuffed baladi bread loaves with seasoned beef',
      descriptionAr: 'أرغفة حواوشي بلدي محشوة بلحم بقري غني ومتبل بالتوابل الشرقية الأصيلة',
      price: 160,
      offerPrice: 145,
      image: '/images/brands/ibn-elosool.jpeg',
      category: 'meat',
      categoryAr: 'مصنعات لحوم',
      brandId: ibnElAsoul.id,
      isOffer: true,
      unit: 'عبوة (5 أرغفة)',
      minOrder: 1,
    },
    {
      name: 'Smoked Garlic Sausage',
      nameAr: 'سجق مدخن بالثوم والأعشاب',
      description: 'Smoked beef sausage with rich garlic and herb aroma',
      descriptionAr: 'سجق بقري مدخن على خشب الزان الطبيعي بنكهة الثوم الشهية',
      price: 190,
      offerPrice: null,
      image: '/images/brands/ibn-elosool.jpeg',
      category: 'sausage',
      categoryAr: 'سجق وكفتة',
      brandId: ibnElAsoul.id,
      isOffer: false,
      unit: 'كجم',
      minOrder: 1,
    },

    // Mazaya (مزايا)
    {
      name: 'Plain Beef Luncheon Roll',
      nameAr: 'لانشون لحم بقري سادة فاخر',
      description: 'Premium quality beef luncheon roll',
      descriptionAr: 'لانشون لحم بقري ناعم بقوام متماسك وطعم ممتاز للسندوتشات اليومية',
      price: 170,
      offerPrice: null,
      image: '/images/brands/mazaya-real.jpeg',
      category: 'luncheon',
      categoryAr: 'لانشون ومصنعات باردة',
      brandId: mazaya.id,
      isOffer: false,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Beef Luncheon with Olives & Pepper',
      nameAr: 'لانشون لحم بالزيتون والفلفل الأسود',
      description: 'Savory luncheon with whole black olives and crushed peppercorn',
      descriptionAr: 'لانشون لحم غني بحبات الزيتون الطبيعي والفلفل الأسود لمذاق لا يقاوم',
      price: 185,
      offerPrice: 155,
      image: '/images/brands/mazaya-real.jpeg',
      category: 'luncheon',
      categoryAr: 'لانشون ومصنعات باردة',
      brandId: mazaya.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Premium Smoked Chicken Luncheon',
      nameAr: 'لانشون دجاج مدخن نخب أول',
      description: 'Delicious delicately smoked chicken breast luncheon',
      descriptionAr: 'لانشون دجاج أبيض طبيعي مدخن خفيف قليل الدسم وعالي البروتين',
      price: 175,
      offerPrice: null,
      image: '/images/brands/mazaya-real.jpeg',
      category: 'luncheon',
      categoryAr: 'لانشون ومصنعات باردة',
      brandId: mazaya.id,
      isOffer: false,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Cocktail Beef Hotdog / Sosis',
      nameAr: 'سوسيس كوكتيل بقري ممتاز',
      description: 'Tender cocktail size hotdogs perfect for breakfast and snacks',
      descriptionAr: 'سوسيس كوكتيل بقري طازج سريع التحضير ومناسب للفطائر والمعجنات',
      price: 160,
      offerPrice: 139,
      image: '/images/brands/mazaya-real.jpeg',
      category: 'cocktail',
      categoryAr: 'سوسيس وهووت دوج',
      brandId: mazaya.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
    {
      name: 'Jumbo Beef Frankfurter',
      nameAr: 'فرانكفورتر لحم جامبو أمريكي',
      description: 'Large size smoked frankfurters for loaded hot dog sandwiches',
      descriptionAr: 'أصابع فرانكفورتر لحم بقري مدخنة بحجم جامبو للسندوتشات والمطاعم',
      price: 195,
      offerPrice: 175,
      image: '/images/brands/mazaya-real.jpeg',
      category: 'cocktail',
      categoryAr: 'سوسيس وهووت دوج',
      brandId: mazaya.id,
      isOffer: true,
      unit: 'كجم',
      minOrder: 1,
    },
  ];

  for (const prod of products) {
    await prisma.Product.create({ data: prod });
  }

  // 3. Create Admin User
  await prisma.User.create({
    data: {
      name: 'NiceFood Super Admin',
      email: 'admin@nicefood.com',
      password: 'admin', // Demo password
      role: 'superadmin',
    },
  });

  console.log(`Seeding complete! Seeded ${products.length} products and superadmin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
