const urls = import.meta.glob('../*.jpg', { eager: true, query: '?url', import: 'default' });
const src = (file) => urls[`../${file}`];

// w/h are the real pixel sizes; hotspot x/y are percentages of the photo.
export const photos = {
  'carrera-s-2025': { file: 'carrera-s-2025.jpg', w: 1920, h: 1114, angle: 'Front ¾', colour: 'Blue', hotspots: [
    { x: 51.3, y: 55.6, title: 'Matrix LED headlights', text: 'The signature round lamp with four-point daytime running lights.' },
    { x: 64, y: 75, title: 'Carrera S wheels', text: '20-inch front / 21-inch rear, with red brake calipers behind.' },
    { x: 26.6, y: 60.5, title: 'Porsche crest', text: 'The hood crest sits low in the classic front-luggage lid.' },
  ] },
  'carrera-s-2025-rear': { file: 'carrera-s-2025-rear.jpg', w: 1920, h: 929, angle: 'Rear ¾', colour: 'Blue', hotspots: [
    { x: 29, y: 36, title: 'Engine lid louvres', text: 'Vertical slats feed air to the rear-mounted 3.0-litre flat-six.' },
    { x: 28, y: 48, title: 'Full-width light bar', text: 'A single LED strip spans the entire rear.' },
    { x: 19.5, y: 76, title: 'Twin exhaust tips', text: 'Oval tailpipes integrated in the rear diffuser.' },
  ] },
  '9922-4596': { file: '9922-4596.jpg', w: 1920, h: 982, angle: 'Front ¾', colour: 'Pale grey', hotspots: [
    { x: 57.5, y: 55, title: 'Headlight', text: 'Round LED headlight, a 911 trademark since 1963.' },
    { x: 45, y: 74, title: 'RS Spyder-design wheels', text: 'Dark multi-spoke wheels with a centre-lock look.' },
  ] },
  '9922-4603': { file: '9922-4603.jpg', w: 1920, h: 921, angle: 'Rear ¾', colour: 'Pale grey' },
  'carrera-2024': { file: 'carrera-2024.jpg', w: 1920, h: 1369, angle: 'Front', colour: 'Blue' },
  '9922-a': { file: '9922-a.jpg', w: 1920, h: 1240, angle: 'Rear ¾', colour: 'Chalk' },
  '9922-b': { file: '9922-b.jpg', w: 1920, h: 1280, angle: 'Front ¾', colour: 'Chalk' },
  'extra-5': { file: 'extra-5.jpg', w: 1280, h: 960, angle: 'Side', colour: 'Black' },
  'extra-11': { file: 'extra-11.jpg', w: 1280, h: 853, angle: 'Front ¾', colour: 'Silver', hotspots: [
    { x: 63.5, y: 48, title: 'LED headlight', text: 'Four-point daytime running lights inside the lens.' },
    { x: 46.5, y: 63, title: '20/21-inch wheels', text: 'Staggered wheel sizes with red Carrera S brake calipers.' },
    { x: 92, y: 50, title: 'Model badge', text: '"911 Carrera 4S" script on the front plate.' },
  ] },
  'extra-12': { file: 'extra-12.jpg', w: 1280, h: 853, angle: 'Rear ¾', colour: 'Silver' },
  'extra-8': { file: 'extra-8.jpg', w: 1280, h: 853, angle: 'Rear', colour: 'Silver', hotspots: [
    { x: 50.6, y: 20, title: 'Third brake light', text: 'Sits between the engine-lid louvres.' },
    { x: 51, y: 38, title: 'PORSCHE light bar', text: 'Lettering integrated into the full-width LED strip.' },
    { x: 77, y: 77, title: 'Quad sports exhaust', text: 'Twin tips on each side on the S models.' },
  ] },
  'extra-10': { file: 'extra-10.jpg', w: 1280, h: 853, angle: 'Rear ¾', colour: 'Silver', hotspots: [
    { x: 55, y: 20, title: 'Fabric roof', text: 'Opens or closes in about 12 seconds, up to 50 km/h.' },
    { x: 37, y: 34, title: 'Louvres & brake light', text: 'The engine cover stays exposed even with the roof up.' },
  ] },
  '992-53340': { file: '992-53340.jpg', w: 1920, h: 971, angle: 'Front ¾', colour: 'Blue', hotspots: [
    { x: 45, y: 46, title: 'Black-trim headlights', text: 'GTS models get darkened headlight surrounds.' },
    { x: 25.5, y: 68, title: 'GTS side decal', text: 'PORSCHE lettering along the lower door.' },
    { x: 33.5, y: 68, title: 'Centre-lock wheels', text: 'Black 20/21-inch wheels.' },
  ] },
  'extra-9': { file: 'extra-9.jpg', w: 1280, h: 853, angle: 'Side', colour: 'White' },
  'extra-3': { file: 'extra-3.jpg', w: 1280, h: 720, angle: 'Front ¾', colour: 'Slate grey', hotspots: [
    { x: 12.7, y: 36, title: 'Side air intake', text: 'Feeds the intercoolers of the twin-turbo 3.7-litre engine.' },
    { x: 44.5, y: 62, title: 'Turbo S wheels', text: '20-inch front / 21-inch rear with ceramic brakes.' },
    { x: 58.6, y: 43, title: 'LED headlight', text: 'Matrix LED as standard on the Turbo S.' },
  ] },
  'extra-2': { file: 'extra-2.jpg', w: 1280, h: 720, angle: 'Rear ¾', colour: 'Slate grey', hotspots: [
    { x: 72, y: 32, title: 'Active rear wing', text: 'Extends at speed for extra downforce.' },
    { x: 86.5, y: 50, title: 'Turbo S badge', text: 'Script lettering below the light bar.' },
  ] },
  'extra-4': { file: 'extra-4.jpg', w: 1280, h: 720, angle: 'Rear ¾', colour: 'Slate grey' },
  'extra-1': { file: 'extra-1.jpg', w: 1280, h: 960, angle: 'Detail', colour: 'Slate grey', hotspots: [
    { x: 37, y: 58, title: 'Square exhaust tips', text: 'Turbo models use rectangular-framed exhaust outlets.' },
  ] },
  'extra-6': { file: 'extra-6.jpg', w: 1280, h: 829, angle: 'Front ¾', colour: 'Silver', hotspots: [
    { x: 91, y: 28, title: 'Swan-neck wing', text: 'DRS-style adjustable rear wing, a first for a road 911.' },
    { x: 28, y: 50, title: 'Hood vents', text: 'Hot air from the central radiator exits through the bonnet.' },
    { x: 51, y: 72, title: 'Forged magnesium wheels', text: 'Centre-lock with gold finish.' },
  ] },
  'extra-7': { file: 'extra-7.jpg', w: 1280, h: 890, angle: 'Rear', colour: 'Silver' },
};

for (const [id, p] of Object.entries(photos)) Object.assign(p, { id, url: src(p.file) });

export const models = [
  {
    id: 'carrera', name: '911 Carrera', tagline: 'The essence of the 911.', body: 'Coupé · Rear-wheel drive',
    specs: { kw: 290, ps: 394, nm: 450, accel: 4.1, top: 294 },
    engine: '3.0 L twin-turbo flat-six',
    photos: ['9922-4596', '9922-4603', 'carrera-2024', '9922-b', '9922-a', 'extra-5'],
  },
  {
    id: 'carrera-s', name: '911 Carrera S', tagline: 'More power. Same balance.', body: 'Coupé · Rear-wheel drive',
    specs: { kw: 353, ps: 480, nm: 530, accel: 3.5, top: 308 },
    engine: '3.0 L twin-turbo flat-six',
    photos: ['carrera-s-2025', 'carrera-s-2025-rear'],
  },
  {
    id: 'carrera-4s', name: '911 Carrera 4S', tagline: 'All-wheel drive, all-weather grip.', body: 'Coupé · All-wheel drive',
    specs: { kw: 331, ps: 450, nm: 530, accel: 3.4, top: 306 },
    engine: '3.0 L twin-turbo flat-six',
    photos: ['extra-11', 'extra-12', 'extra-8'],
  },
  {
    id: 'cabriolet', name: '911 Carrera S Cabriolet', tagline: 'Open sky, flat-six soundtrack.', body: 'Cabriolet · Rear-wheel drive',
    specs: { kw: 331, ps: 450, nm: 530, accel: 3.7, top: 306 },
    engine: '3.0 L twin-turbo flat-six',
    photos: ['extra-10'],
  },
  {
    id: 'gts', name: '911 GTS', tagline: 'The driver’s sweet spot.', body: 'Coupé · Rear-wheel drive',
    specs: { kw: 353, ps: 480, nm: 570, accel: 3.4, top: 311 },
    engine: '3.0 L twin-turbo flat-six',
    photos: ['992-53340', 'extra-9'],
  },
  {
    id: 'turbo-s', name: '911 Turbo S', tagline: 'Everyday supercar.', body: 'Coupé · All-wheel drive',
    specs: { kw: 478, ps: 650, nm: 800, accel: 2.7, top: 330 },
    engine: '3.7 L twin-turbo flat-six',
    photos: ['extra-3', 'extra-2', 'extra-4', 'extra-1'],
  },
  {
    id: 'gt3-rs', name: '911 GT3 RS', tagline: 'Built for the track. Licensed for the road.', body: 'Coupé · Rear-wheel drive',
    specs: { kw: 386, ps: 525, nm: 465, accel: 3.2, top: 296 },
    engine: '4.0 L naturally aspirated flat-six',
    photos: ['extra-6', 'extra-7'],
  },
];

export const colourSwatches = {
  Blue: '#1f5fd1', 'Pale grey': '#b9c3c1', Chalk: '#cfccc4', Black: '#141414',
  Silver: '#b4b8bd', White: '#f2f2f0', 'Slate grey': '#8792a0',
};

export const maxSpecs = { ps: 650, nm: 800, top: 330, accel: 4.1 };
