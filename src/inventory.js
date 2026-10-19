// Vehicle records are transcribed from the listing sheets supplied in public/cars.
// Replace this local catalogue with the ERP adapter when its inventory API is ready.
export const BRANCHES = ['شعبه نگین ظفر', 'شعبه اداره تحویل', 'شعبه شریعتی', 'شعبه ظفر'];

export const CATALOG_CARS = {
  'benz-a200l': {
    id: 'benz-a200l', name: 'Mercedes-Benz A 200 L', nameFa: 'بنز کلاس A سدان', brand: 'مرسدس‌بنز', bodyFa: 'سدان',
    specs: [],
  },
  'changan-cs55': {
    id: 'changan-cs55', name: 'Changan CS55 Plus', nameFa: 'چانگان CS 55 پلاس', brand: 'چانگان', bodyFa: 'شاسی‌بلند',
    specs: [['نوع موتور', '۱٫۵ لیتر توربو']],
  },
  'fownix-fxev': {
    id: 'fownix-fxev', name: 'Fownix FX EV', nameFa: 'فونیکس FX EV', brand: 'فونیکس', bodyFa: 'کراس‌اوور برقی',
    specs: [['توان موتور', '۱۵۰ کیلووات']],
  },
  'lucano-l8': {
    id: 'lucano-l8', name: 'Lucano L8', nameFa: 'لوکانو L8', brand: 'لوکانو', bodyFa: 'شاسی‌بلند',
    specs: [['نوع موتور', '۲٫۰ لیتر توربو']],
  },
  'mvm-x33': {
    id: 'mvm-x33', name: 'MVM X33 Cross', nameFa: 'ام‌وی‌ام X33 کراس', brand: 'ام‌وی‌ام', bodyFa: 'کراس‌اوور',
    specs: [],
  },
  'toyota-corolla-cross': {
    id: 'toyota-corolla-cross', name: 'Toyota Corolla Cross Hybrid', nameFa: 'تویوتا کرولا کراس هیبرید', brand: 'تویوتا', bodyFa: 'کراس‌اوور',
    specs: [['نوع موتور', '۲٫۰ لیتر هیبرید']],
  },
  'toyota-hilux': {
    id: 'toyota-hilux', name: 'Toyota Hilux Double Cab', nameFa: 'تویوتا هایلوکس دو کابین', brand: 'تویوتا', bodyFa: 'وانت دو کابین',
    specs: [],
  },
  'vw-idunix': {
    id: 'vw-idunix', name: 'Volkswagen ID. UNYX', nameFa: 'فولکس‌واگن ID. یونیکس', brand: 'فولکس‌واگن', bodyFa: 'کراس‌اوور برقی',
    specs: [],
  },
};

export const inventory = [
  {
    id: 'benz-a200l-01', carId: 'benz-a200l', trim: 'A200L', color: 'سفید', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 16_500_000_000, year: 1405, yearLabel: '۱۴۰۵ شمسی', mileage: 0,
    photos: ['/cars/benz-a200l-01/front.jpg', '/cars/benz-a200l-01/back.jpg', '/cars/benz-a200l-01/front-cap.jpg', '/cars/benz-a200l-01/front-dor.jpg'],
  },
  {
    id: 'changan-cs55-01', carId: 'changan-cs55', trim: '۱٫۵ لیتر توربو', color: 'مشکی', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 8_100_000_000, year: 2025, yearLabel: '۲۰۲۵ میلادی', mileage: 1_300,
    photos: ['/cars/changan-cs55-01/front.jpg', '/cars/changan-cs55-01/back.jpg'],
  },
  {
    id: 'fownix-fxev-01', carId: 'fownix-fxev', trim: '۱۵۰ کیلووات', color: 'سفید صدفی', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 6_900_000_000, year: 2026, yearLabel: '۲۰۲۶ میلادی', mileage: 253,
    photos: ['/cars/fownix-fxev-01/front.jpg', '/cars/fownix-fxev-01/back.jpg'],
  },
  {
    id: 'lucano-l8-01', carId: 'lucano-l8', trim: '۲٫۰ لیتر توربو', color: 'مشکی', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 12_900_000_000, year: 1404, yearLabel: '۱۴۰۴ شمسی', mileage: 55,
    photos: ['/cars/lucano-l8-01/front.jpg'],
  },
  {
    id: 'mvm-x33-01', carId: 'mvm-x33', trim: 'X33 کراس', color: 'سفید', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 4_350_000_000, year: 1405, yearLabel: '۱۴۰۵ شمسی', mileage: 25,
    photos: ['/cars/mvm-x33-01/front.jpg'],
  },
  {
    id: 'toyota-crolla-01', carId: 'toyota-corolla-cross', trim: '۲٫۰ لیتر هیبرید', color: 'سفید', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 9_700_000_000, year: 2026, yearLabel: '۲۰۲۶ میلادی', mileage: 55,
    photos: ['/cars/toyota-crolla-01/front.jpg', '/cars/toyota-crolla-01/back.jpg'],
  },
  {
    id: 'toyota-hailux-01', carId: 'toyota-hilux', trim: 'بلند اتوماتیک', color: 'سفید', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 9_300_000_000, year: 2014, yearLabel: '۲۰۱۴ میلادی', mileage: 96_686,
    photos: ['/cars/toyota-hailux-01/front.jpg', '/cars/toyota-hailux-01/front2.jpg', '/cars/toyota-hailux-01/dakhel1.jpg'],
    inspection: {
      date: '۲۶ مهر ۱۴۰۵',
      summary: { healthy: 0, withIssue: 2, panelsWithHistory: 4 },
      panels: [
        { number: 1, name: 'کاپوت', status: 'تعویض', kind: 'replaced', position: [50, 22] },
        { number: 2, name: 'گلگیر جلو چپ', status: 'تعویض', kind: 'replaced', position: [29, 32] },
        { number: 3, name: 'گلگیر عقب چپ', status: 'رنگ‌شده', kind: 'painted', position: [27, 130] },
        { number: 4, name: 'گلگیر جلو راست', status: 'تعویض', kind: 'replaced', position: [71, 32] },
      ],
      structureNotes: ['شاسی جلو دو طرف جوش و ضربه دارد', 'سینی جلو دو طرف جوش و ضربه دارد'],
    },
  },
  {
    id: 'vw-idunix-01', carId: 'vw-idunix', trim: 'پیور', color: 'سفید', branch: BRANCHES[0], status: 'آماده بازدید',
    price: 11_200_000_000, year: 2025, yearLabel: '۲۰۲۵ میلادی', mileage: 0,
    photos: ['/cars/vw-idunix-01/front.jpg', '/cars/vw-idunix-01/back.jpg'],
  },
];
