// ───────────────────────────────────────────────────────────────────────────────
// Everything about the cars on the home page lives here. Edit freely.
// ───────────────────────────────────────────────────────────────────────────────

// Site name shown in the top bar and the intro.
export const SITE = {
  name: 'اتو مدیران', latin: 'AUTO MODIRAN', slogan: 'انتخابی مطمئن، فردایی بهتر',
  phone: '۰۲۱-۷۹۲۱۱', phoneHref: 'tel:02179211', website: 'https://automodiran.com',
};

// Licence plates: 'logo' = AUTO MODIRAN plate (image: public/plate.jpg), 'hide' = remove them,
// 'paint' = same colour as the body, 'show' = the model's original plates. (A car can override this with `plates: '...'`.)
export const PLATES = 'logo';

// Paint colours offered for every car.
const commonPaints = [
  { name: 'سفید صدفی', hex: '#e9e9e6' },
  { name: 'نقره‌ای', hex: '#a9adb2' },
  { name: 'خاکستری گرافیتی', hex: '#4a4f55' },
  { name: 'مشکی', hex: '#0f1012' },
  { name: 'آبی تیره', hex: '#1d3f8a' },
  { name: 'قرمز', hex: '#9e1018' },
  { name: 'سبز مریمی', hex: '#7d8f7a' },
  { name: 'بژ', hex: '#b9a68a' },
];

const ddiaz = (title, slug) => ({
  title, author: 'Ddiaz Design', authorUrl: 'https://sketchfab.com/ddiaz-design',
  url: `https://sketchfab.com/3d-models/${slug}`, license: 'CC BY-NC-SA 4.0',
});

// Technical fields:
//  model          .glb file in public/models
//  paintMaterial  name of the body-paint material inside the .glb
//  length         real length in metres (the model is scaled to it)
//  yaw            extra turn (radians) if the model faces the wrong way
//  lamp           headlight position as fractions of the car: from the front, from the ground, from the centre line
//  quick          numbers for the comparison table
export const cars = [
  {
    id: 'tiggo8pro', brand: 'CHERY', name: 'Tiggo 8 Pro', nameFa: 'چری تیگو ۸ پرو', bodyFa: 'شاسی‌بلند ۷ نفره',
    model: 'models/tiggo8pro.glb', paintMaterial: 'CarPaint', length: 4.72, yaw: Math.PI, paints: commonPaints,
    lamp: { front: 0.09, y: 0.55, side: 0.31 },
    quick: { hp: 254, nm: 390, gearbox: '۷ سرعته DCT', drive: 'چهارچرخ', length: 4722, wheelbase: 2710 },
    specs: [
      ['موتور', '۲٫۰ لیتری توربو بنزینی'],
      ['قدرت', '۲۵۴ اسب بخار'],
      ['گشتاور', '۳۹۰ نیوتن‌متر'],
      ['گیربکس', '۷ سرعته دوکلاچه'],
      ['دیفرانسیل', 'چهارچرخ محرک (AWD)'],
      ['شتاب ۰ تا ۱۰۰', '۸٫۹ ثانیه'],
      ['حداکثر سرعت', '۲۱۰ کیلومتر بر ساعت'],
      ['ابعاد', '۴۷۲۲ × ۱۸۶۰ × ۱۷۰۵ میلی‌متر'],
      ['فاصله محوری', '۲۷۱۰ میلی‌متر'],
      ['ارتفاع از زمین', '۲۰۰ میلی‌متر'],
      ['ظرفیت', '۷ سرنشین'],
    ],
    features: [
      'سیستم صوتی Sony با ۸ بلندگو',
      '۹ کیسه هوا',
      'هشدار نقطه کور و هشدار برخورد',
      'دستیار حفظ خط',
      'نمایشگر لمسی و صفحه‌کیلومتر دیجیتال',
      'سه ردیف صندلی',
    ],
    credit: ddiaz('2023 Chery Tiggo 8 Pro Champion Edition 390T AWD', '2023-chery-tiggo-8-pro-champion-edition-390t-awd-43804e0f962c4021b988e6ebcd45e7a0'),
  },
  {
    id: 'arrizo8', brand: 'CHERY', name: 'Arrizo 8', nameFa: 'چری آریزو ۸', bodyFa: 'سدان',
    model: 'models/arrizo8.glb', paintMaterial: 'CarPaint', length: 4.78, yaw: Math.PI, paints: commonPaints,
    lamp: { front: 0.08, y: 0.49, side: 0.32 },
    quick: { hp: 197, nm: 290, gearbox: '۷ سرعته DCT', drive: 'جلو', length: 4780, wheelbase: 2790 },
    specs: [
      ['موتور', '۱٫۶ لیتری توربو بنزینی'],
      ['قدرت', '۱۹۷ اسب بخار'],
      ['گشتاور', '۲۹۰ نیوتن‌متر'],
      ['گیربکس', '۷ سرعته دوکلاچه'],
      ['دیفرانسیل', 'جلو محرک'],
      ['حداکثر سرعت', '۲۰۵ کیلومتر بر ساعت'],
      ['مصرف ترکیبی', '۶٫۵ لیتر در ۱۰۰ کیلومتر'],
      ['ابعاد', '۴۷۸۰ × ۱۸۴۳ × ۱۴۶۹ میلی‌متر'],
      ['فاصله محوری', '۲۷۹۰ میلی‌متر'],
      ['حجم باک', '۵۵ لیتر'],
    ],
    features: [
      'نمایشگر یکپارچه ۲۴٫۶ اینچی',
      'دوربین ۵۴۰ درجه',
      '۱۸ سیستم کمک راننده (ADAS)',
      'شارژر بی‌سیم ۵۰ وات',
      'چراغ‌های LED دولنزی و راهنمای داینامیک',
      'نورپردازی محیطی کابین',
    ],
    credit: ddiaz('2023 Chery Arrizo 8 290T', '2023-chery-arrizo-8-290t-e6b69aa7329347f4bcd431d13b7dc915'),
  },
  {
    id: 'omoda5', brand: 'CHERY', name: 'Omoda 5', nameFa: 'چری اومودا ۵', bodyFa: 'کراس‌اوور',
    model: 'models/omoda5.glb', paintMaterial: 'CarPaint', length: 4.40, yaw: Math.PI, paints: commonPaints,
    lamp: { front: 0.08, y: 0.45, side: 0.36 },
    quick: { hp: 197, nm: 290, gearbox: '۷ سرعته DCT', drive: 'جلو', length: 4400, wheelbase: 2630 },
    specs: [
      ['موتور', '۱٫۶ لیتری توربو بنزینی'],
      ['قدرت', '۱۹۷ اسب بخار'],
      ['گشتاور', '۲۹۰ نیوتن‌متر'],
      ['گیربکس', '۷ سرعته دوکلاچه'],
      ['دیفرانسیل', 'جلو محرک'],
      ['ابعاد', '۴۴۰۰ × ۱۸۳۰ × ۱۵۸۸ میلی‌متر'],
      ['فاصله محوری', '۲۶۳۰ میلی‌متر'],
    ],
    features: [
      'دو نمایشگر ۱۰٫۲۵ اینچی',
      'پشتیبانی از Apple CarPlay و Android Auto',
      'سیستم صوتی Sony با ۸ بلندگو',
      '۱۶ سیستم کمک راننده',
      'کروز کنترل تطبیقی',
      'ترمز اضطراری خودکار',
    ],
    credit: ddiaz('2023 Chery Omoda 5 290T', '2023-chery-omoda-5-290t-d9ff826c2bf14d81a4fa3c9b6b707376'),
  },
  {
    // Sold in Iran as Lucano L7 (it is the Jaecoo J7). The model's JAECOO lettering is swapped for LUCANO:
    // rear in the texture, front with the badge image below (the original letters are the "Badge" parts, hidden).
    id: 'jaecoo-j7', brand: 'LUCANO', name: 'L7', nameFa: 'لوکانو L7', bodyFa: 'شاسی‌بلند',
    model: 'models/jaecoo-j7.glb', paintMaterial: 'CarPaint', length: 4.50, yaw: Math.PI, paints: commonPaints,
    lamp: { front: 0.07, y: 0.47, side: 0.34 },
    badge: { image: 'badge-lucano.png' },
    quick: { hp: 197, nm: 290, gearbox: '۷ سرعته DCT', drive: 'چهارچرخ', length: 4500, wheelbase: 2672 },
    specs: [
      ['موتور', '۱٫۶ لیتری توربو بنزینی، تزریق مستقیم'],
      ['قدرت', '۱۹۷ اسب بخار در ۵۵۰۰ دور'],
      ['گشتاور', '۲۹۰ نیوتن‌متر (۲۰۰۰ تا ۴۰۰۰ دور)'],
      ['گیربکس', '۷ سرعته دوکلاچه'],
      ['دیفرانسیل', 'چهارچرخ محرک (AWD)'],
      ['ابعاد', '۴۵۰۰ × ۱۸۶۵ × ۱۶۸۰ میلی‌متر'],
      ['فاصله محوری', '۲۶۷۲ میلی‌متر'],
      ['ارتفاع از زمین', '۲۰۰ میلی‌متر'],
      ['لاستیک', '۲۳۵/۵۰R19'],
      ['ظرفیت', '۵ سرنشین'],
    ],
    features: [
      'نمایشگر لمسی ۱۴٫۸ اینچی با فرمان صوتی',
      'صفحه‌کیلومتر دیجیتال ۱۰٫۲۵ اینچی',
      'دوربین ۵۴۰ درجه و سانروف پانوراما',
      '۶ کیسه هوا',
      'کروز کنترل تطبیقی، ترمز اضطراری خودکار و هشدار نقطه کور',
      'صندلی‌های چرمی برقی و گرم‌کن‌دار',
      'کولر اتوماتیک دوزون',
    ],
    credit: ddiaz('2025 Chery Jaecoo J7', '2025-chery-jaecoo-j7-02e3ca1e9a8f4c7aad40617bd0693615'),
  },
];

export const SPECS_NOTE = 'مشخصات بر اساس اطلاعات رسمی سازنده برای بازارهای جهانی است و ممکن است بسته به نسخه و تیپ فروخته‌شده در ایران متفاوت باشد.';
