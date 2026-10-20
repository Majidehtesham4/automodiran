import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ArrowLeft, BadgeCheck, Banknote, Building2, Calculator as CalculatorIcon, Camera, Clock3, Globe, Lightbulb, LogIn, MapPin, Maximize2, Menu, Moon, Pause, Phone, Play, Plus, RotateCcw, Search, Share2, SlidersHorizontal, Sparkles, Sun, X } from 'lucide-react';
import { cars, SITE, SPECS_NOTE } from './cars.js';
import { BRANCHES, CATALOG_CARS, inventory } from './inventory.js';
import { erp, loadInventory, sendInquiry } from './erp.js';
import { Logo } from './Logo.jsx';

const Viewer = lazy(() => import('./Viewer.jsx'));
const LazyLoader = lazy(() => import('./Viewer.jsx').then((m) => ({ default: m.Loader })));

const VIEWS = [['Front ¾', 'سه‌رخ جلو'], ['Side', 'نیم‌رخ'], ['Rear ¾', 'سه‌رخ عقب'], ['Front', 'جلو'], ['Rear', 'عقب'], ['Top', 'بالا']];
const fa = (n) => n.toLocaleString('fa-IR', { useGrouping: false });
const maxHp = Math.max(...cars.map((c) => c.quick.hp));
const introEnabled = typeof window !== 'undefined' && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches && !new URLSearchParams(window.location.search).has('nointro');
const BRANDS = ['ایران خودرو', 'سایپا', 'پارس خودرو', 'بهمن موتور', 'کرمان موتور', 'مدیران خودرو', 'فردا موتور', 'آرین پارس موتور', 'ایران خودرو دیزل', 'شهر خودرو', 'چری', 'ام‌وی‌ام', 'فونیکس', 'لوکانو', 'جک', 'کی‌ام‌سی', 'بی‌وای‌دی', 'جی‌ای‌سی', 'چانگان', 'دانگ‌فنگ', 'فولکس‌واگن', 'بایک', 'بستیون', 'هاوال', 'گریت‌وال', 'جیلی', 'ام‌جی', 'هونگچی', 'جتور', 'اومودا', 'جیکو', 'فوتون', 'لاماری', 'سوزوکی', 'تویوتا', 'لکسوس', 'نیسان', 'هوندا', 'هیوندای', 'کیا', 'مزدا', 'میتسوبیشی', 'مرسدس‌بنز', 'بی‌ام‌و', 'آئودی', 'پورشه', 'ولوو', 'لندروور', 'جگوار', 'رنو', 'پژو', 'سیتروئن', 'فیات', 'اشکودا', 'تسلا'];

class ViewerBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    return this.state.error
      ? <div className="viewer-error" dir="rtl"><h2>نمایش سه‌بعدی اجرا نشد</h2><p>مرورگر شما باید از WebGL پشتیبانی کند. شتاب‌دهنده سخت‌افزاری را فعال کنید و صفحه را دوباره باز کنید.</p></div>
      : this.props.children;
  }
}

function ToolButton({ label, active, onClick, children }) {
  return <button className={`tool ${active ? 'on' : ''}`} aria-label={label} title={label} aria-pressed={active} onClick={onClick}>{children}</button>;
}

function CarTabs({ carId, onPick, className }) {
  return (
    <div className={`car-tabs ${className}`} role="tablist" aria-label="انتخاب خودرو">
      {cars.map((c) => (
        <button key={c.id} role="tab" aria-selected={c.id === carId} className={c.id === carId ? 'active' : ''} onClick={() => onPick(c.id)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}

function SpecPanel({ car, className = '', tabs = false }) {
  const [tab, setTab] = useState('specs');
  const show = (t) => !tabs || tab === t;
  return (
    <aside className={`spec-panel ${className}`} dir="rtl" key={car.id} aria-label={`مشخصات ${car.nameFa}`}>
      <header>
        <span>{car.bodyFa}</span>
        <h2>{car.nameFa}</h2>
      </header>
      {tabs && (
        <div className="sp-tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'specs'} className={tab === 'specs' ? 'active' : ''} onClick={() => setTab('specs')}>مشخصات فنی</button>
          <button role="tab" aria-selected={tab === 'features'} className={tab === 'features' ? 'active' : ''} onClick={() => setTab('features')}>امکانات</button>
        </div>
      )}
      {show('specs') && (
        <section>
          {!tabs && <h3>مشخصات فنی</h3>}
          <dl>{car.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        </section>
      )}
      {show('features') && (
        <section>
          {!tabs && <h3>امکانات</h3>}
          <ul>{car.features.map((f) => <li key={f}>{f}</li>)}</ul>
        </section>
      )}
    </aside>
  );
}

function Topbar({ navigate, page }) {
  const [open, setOpen] = useState(false);   // mobile menu
  const go = (path) => {
    setOpen(false);
    navigate(path);
  };
  return (
    <header className={`topbar ui ${open ? 'menu-open' : ''}`}>
      <button className="brand" onClick={() => go('/')} aria-label="اتو مدیران — خانه"><Logo variant="bar" /></button>
      <button className="burger" aria-label={open ? 'بستن منو' : 'منو'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
      <nav className="main-nav" dir="rtl" aria-label="منوی اصلی">
        <button className={page === 'home' ? 'selected' : ''} onClick={() => go('/')}>خانه</button>
        <button className={page === 'inventory' ? 'selected' : ''} onClick={() => go('/inventory')}>خودروهای نمایشگاه</button>
        <button className={page === 'sell' ? 'selected' : ''} onClick={() => go('/sell')}>فروش خودرو</button>
        <button className={page === 'compare' ? 'selected' : ''} onClick={() => go('/compare')}>مقایسه</button>
        <button className={page === 'installments' ? 'selected' : ''} onClick={() => go('/installments')}>محاسبه اقساط</button>
        <button className={page === 'branches' ? 'selected' : ''} onClick={() => go('/branches')}>شعبه‌ها</button>
        <button className={page === 'about' ? 'selected' : ''} onClick={() => go('/about')}>درباره ما</button>
        <button className="nav-login" onClick={() => go('/login')}><LogIn size={15} /> ورود</button>
        <button className="nav-cta" onClick={() => go('/login')}><Plus size={15} /> ثبت آگهی</button>
      </nav>
    </header>
  );
}

function IntroOverlay({ phase, info, car, onSkip }) {
  const playing = phase !== 'done';
  const chapter = info ? fa(info.seg + 1).padStart(2, '۰') : '';
  return (
    <div className={`intro ${playing ? 'playing' : ''}`} aria-hidden={!playing}>
      <div className="letterbox top" /><div className="letterbox bottom" />
      {info?.cut && <div className="cut" key={`${info.seg}-${info.shot}`} />}
      <div className={`intro-title ${info?.title ? 'show' : ''}`} key={info ? `t${info.seg}` : 't'}>
        <em>{chapter} — {fa(cars.length).padStart(2, '۰')}</em>
        <span>{car.brand}</span>
        <strong>{car.name}</strong>
      </div>
      {playing && phase !== 'loading' && <button className="skip" onClick={onSkip} dir="rtl">رد کردن ›</button>}
    </div>
  );
}

function Configurator({ car, onPickCar, phase, info, onIntroPhase, onIntroDone, intro = false }) {
  const paints = car.paints;
  const [paint, setPaint] = useState(0);
  const [view, setView] = useState('Front ¾');
  const [viewKey, setViewKey] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [headlights, setHeadlights] = useState(true);
  const [night, setNight] = useState(false);
  const [skip, setSkip] = useState(false);
  const stage = useRef(null);
  const firstCar = useRef(true);

  // new car: back to its first colour and the default angle
  useEffect(() => {
    if (firstCar.current) { firstCar.current = false; return; }
    setPaint(0); setView('Front ¾'); setViewKey((k) => k + 1);
  }, [car.id]);
  const pickView = (v) => { setView(v); setViewKey((k) => k + 1); }; // rotation keeps going; only the pause button stops it
  const fullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else stage.current?.requestFullscreen?.();
  };

  return (
    <section className="configurator" ref={stage} aria-label="نمایش سه‌بعدی خودرو">
      <div className="viewer">
        <ViewerBoundary>
          <Suspense fallback={<div className="viewer-loading"><Logo variant="hero" /><span>در حال آماده‌سازی خودرو</span></div>}>
            <Viewer car={car} paint={paints[paint].hex} headlights={headlights} night={night} view={view} viewKey={viewKey}
              autoRotate={autoRotate} intro={intro} skip={skip}
              onIntroPhase={onIntroPhase} onIntroDone={(p) => { setPaint(p); onIntroDone(); }} />
            {phase !== 'playing' && <LazyLoader />}
          </Suspense>
        </ViewerBoundary>
      </div>

      <IntroOverlay phase={phase} info={info} car={car} onSkip={() => setSkip(true)} />

      <div className="hero-title ui">
        <span className="eyebrow">{car.brand}</span>
        <h1 key={car.id}>{car.name}</h1>
        <p dir="rtl">{car.nameFa} <i>·</i> برای چرخاندن بکشید</p>
      </div>

      <CarTabs carId={car.id} onPick={onPickCar} className="in-stage ui" />
      <SpecPanel car={car} className="in-stage ui" tabs />

      <div className="tools ui" aria-label="کنترل‌ها">
        <ToolButton label={autoRotate ? 'توقف چرخش' : 'چرخش خودکار'} active={autoRotate} onClick={() => setAutoRotate(!autoRotate)}>{autoRotate ? <Pause size={17} /> : <Play size={17} />}</ToolButton>
        <ToolButton label="چراغ‌های جلو" active={headlights} onClick={() => setHeadlights(!headlights)}><Lightbulb size={18} /></ToolButton>
        <ToolButton label={night ? 'نور استودیو' : 'حالت شب'} active={night} onClick={() => setNight(!night)}>{night ? <Moon size={17} /> : <Sun size={18} />}</ToolButton>
        <ToolButton label="بازنشانی زاویه" onClick={() => pickView('Front ¾')}><RotateCcw size={17} /></ToolButton>
        <ToolButton label="تمام‌صفحه" onClick={fullscreen}><Maximize2 size={16} /></ToolButton>
      </div>

      <div className="config-panel ui" dir="rtl">
        <div className="group">
          <span className="label">رنگ بدنه</span>
          <div className="paints">
            {paints.map((p, i) => (
              <button key={p.hex} className={`swatch ${i === paint ? 'active' : ''}`} style={{ '--c': p.hex }} title={p.name}
                aria-label={p.name} aria-pressed={i === paint} onClick={() => setPaint(i)} />
            ))}
          </div>
          <span className="paint-name">{paints[paint].name}</span>
        </div>
        <div className="group">
          <span className="label">زاویه دید</span>
          <div className="views">
            {VIEWS.map(([v, label]) => <button key={v} className={v === view ? 'active' : ''} aria-pressed={v === view} onClick={() => pickView(v)}>{label}</button>)}
          </div>
        </div>
      </div>
    </section>
  );
}

const money = (value) => new Intl.NumberFormat('fa-IR').format(value);
const stockCar = (stock) => CATALOG_CARS[stock.carId] ?? cars.find((item) => item.id === stock.carId) ?? cars[0];
const displayYear = (stock) => stock.yearLabel ?? money(stock.year);
// A car whose price the showroom does not publish has price 0
const priceOf = (stock) => stock.price ? <>{money(stock.price)} <small>تومان</small></> : 'تماس بگیرید';
const priceText = (stock) => stock.price ? `${money(stock.price)} تومان` : 'قیمت: تماس بگیرید';

function InventoryCard({ stock, car, onSelect }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  useEffect(() => {
    if (stock.photos.length < 2) return;
    const timer = window.setInterval(() => setPhotoIndex((index) => (index + 1) % stock.photos.length), 4000);
    return () => window.clearInterval(timer);
  }, [stock.photos]);
  const photo = stock.photos[photoIndex];
  return (
    <article className="inventory-card" dir="rtl">
      <div className="inventory-photo" role="button" tabIndex={0} aria-label={`جزئیات ${car.nameFa}`} onClick={() => onSelect(stock.id)} onKeyDown={(event) => event.key === 'Enter' && onSelect(stock.id)}>
        {photo ? <img src={photo} alt={`${car.nameFa} — تصویر ${photoIndex + 1}`} /> : <div className={`photo-placeholder shade-${car.id}`}><span className="photo-kicker"><Camera size={14} /> گالری خودرو</span><strong>{car.name}</strong><small>تصاویر این خودرو را به گالری اضافه کنید</small><div className="car-illustration" aria-hidden="true"><i /><b /><em /></div></div>}
        <span className="stock-status"><i />{stock.status}</span>
        {stock.photos.length > 1 && <span className="photo-count">{money(photoIndex + 1)} / {money(stock.photos.length)}</span>}
      </div>
      <div className="inventory-info">
        <div className="inventory-title"><div><span>{car.brand} · {car.bodyFa}</span><h3>{car.nameFa}</h3></div><button className="icon-ghost" aria-label={`جزئیات ${car.nameFa}`} onClick={() => onSelect(stock.id)}><ArrowLeft size={18} /></button></div>
        <div className="inventory-meta"><span><Clock3 size={14} /> مدل {displayYear(stock)}</span><span><BadgeCheck size={14} /> {stock.mileage ? `${money(stock.mileage)} کیلومتر` : 'صفر کیلومتر'}</span></div>
        <div className="inventory-price"><div><small>قیمت روز</small><strong>{priceOf(stock)}</strong></div><button onClick={() => onSelect(stock.id)}>مشاهده خودرو <ArrowLeft size={15} /></button></div>
      </div>
    </article>
  );
}

function InventorySection({ onSelect, navigate }) {
  const prices = inventory.map((item) => item.price).filter(Boolean);
  const minimum = prices.length ? Math.min(...prices) : 0;
  const maximum = prices.length ? Math.max(...prices) : 0;
  const brands = [...new Set(inventory.map((stock) => stockCar(stock)?.brand).filter(Boolean))];
  const [query, setQuery] = useState('');
  const [brand, setBrand] = useState('همه برندها');
  const [branch, setBranch] = useState(() => new URLSearchParams(window.location.search).get('branch') ?? 'همه شعبه‌ها');
  const [budget, setBudget] = useState([minimum, maximum]);
  const [sort, setSort] = useState('newest');
  const list = inventory.filter((stock) => {
    const car = stockCar(stock);
    const normalize = (value) => String(value).replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)).toLowerCase();
    const searchable = normalize([car.name, car.nameFa, car.brand, stock.brand, stock.trim, stock.year, stock.color].join(' '));
    return searchable.includes(normalize(query.trim()))
      && (brand === 'همه برندها' || car.brand === brand)
      && (branch === 'همه شعبه‌ها' || stock.branch === branch)
      && (!stock.price || (stock.price >= budget[0] && stock.price <= budget[1]));
  }).sort((a, b) => sort === 'low' ? a.price - b.price : sort === 'high' ? b.price - a.price : b.year - a.year);
  const setBudgetPoint = (point, value) => setBudget((current) => point === 0
    ? [Math.min(Number(value), current[1]), current[1]]
    : [current[0], Math.max(Number(value), current[0])]);
  const start = ((budget[0] - minimum) / Math.max(1, maximum - minimum)) * 100;
  const end = ((budget[1] - minimum) / Math.max(1, maximum - minimum)) * 100;
  return <section id="inventory" className="section inventory-section" dir="rtl">
    <div className="inventory-page-head"><div className="section-head"><span className="eyebrow">اتو مدیران ‹ خودروهای نمایشگاه</span><h1>خودروهای نمایشگاه</h1><p>فقط خودروهایی که در شعبه حاضرند و مراحل پذیرش و استعلام را گذرانده‌اند. قیمت هر خودرو ۲۴ ساعت اعتبار دارد.</p></div><button className="consign-cta" onClick={() => navigate('/sell')}><span className="consign-icon"><Banknote size={21} /></span><span><strong>خودرو دارید؟</strong><small>به نمایشگاه بسپارید تا بفروشیم</small></span><ArrowLeft size={18} /></button></div>
    <div className="catalog-layout">
      <aside className="catalog-sidebar"><div className="filter-heading"><h2>فیلترها</h2><button onClick={() => { setQuery(''); setBrand('همه برندها'); setBranch('همه شعبه‌ها'); setBudget([minimum, maximum]); }}>پاک‌کردن</button></div>
        <label className="filter-field"><span>جستجو</span><div className="filter-input"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="مدل، تیپ، سال یا رنگ" /></div></label>
        <label className="filter-field"><span>برند</span><select value={brand} onChange={(event) => setBrand(event.target.value)}><option>همه برندها</option>{brands.map((item) => <option key={item}>{item}</option>)}</select></label>
        <fieldset className="filter-field branch-filter"><legend>شعبه</legend><button className={branch === 'همه شعبه‌ها' ? 'active' : ''} onClick={() => setBranch('همه شعبه‌ها')}>همه شعبه‌ها</button>{BRANCHES.map((item) => <button key={item} className={branch === item ? 'active' : ''} onClick={() => setBranch(item)}>{item}</button>)}</fieldset>
        <div className="filter-field budget-filter"><span>بودجه</span><div className="budget-values"><b>{money(budget[0])}</b><b>{money(budget[1])}</b></div><div className="dual-range" style={{ '--range-start': `${start}%`, '--range-end': `${end}%` }}><input aria-label="کمترین بودجه" type="range" min={minimum} max={maximum} step="10000000" value={budget[0]} onChange={(event) => setBudgetPoint(0, event.target.value)} /><input aria-label="بیشترین بودجه" type="range" min={minimum} max={maximum} step="10000000" value={budget[1]} onChange={(event) => setBudgetPoint(1, event.target.value)} /></div><div className="budget-units"><small>تومان</small><small>تومان</small></div></div>
      </aside>
      <div className="catalog-results"><div className="results-bar"><strong>{money(list.length)} خودرو</strong><label>مرتب‌سازی<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">جدیدترین</option><option value="low">ارزان‌ترین</option><option value="high">گران‌ترین</option></select></label></div>{list.length ? <div className="inventory-grid">{list.map((stock) => <InventoryCard key={stock.id} stock={stock} car={stockCar(stock)} onSelect={onSelect} />)}</div> : <div className="empty-inventory">خودرویی با این مشخصات پیدا نشد. فیلترها را تغییر دهید.</div>}<p className="demo-note"><span className="demo-dot" /> {erp.connected ? 'موجودی و قیمت‌ها مستقیم از سیستم نمایشگاه خوانده می‌شود.' : 'اطلاعات خودروها از برگه‌های آگهی و پوشه‌های تصاویر وارد شده است.'}</p></div>
    </div>
  </section>;
}

function InquiryForm({ vehicle, title, kinds, extra }) {
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [kind, setKind] = useState(kinds[0][0]);
  const [state, setState] = useState({ status: 'idle', text: '' });
  // Without the ERP there is nowhere to send it: the phone number stays the way to ask
  if (!erp.connected) return null;
  const submit = async (event) => {
    event.preventDefault();
    setState({ status: 'sending', text: '' });
    try {
      await sendInquiry({ fullName, mobile, kind, vehicle, ...(extra ?? {}) });
      setState({ status: 'sent', text: 'درخواست شما ثبت شد؛ کارشناس فروش به‌زودی با شما تماس می‌گیرد.' });
    } catch (error) {
      setState({ status: 'error', text: error.message });
    }
  };
  if (state.status === 'sent') return <p className="inquiry-done" role="status"><BadgeCheck size={16} /> {state.text}</p>;
  return <form className="inquiry-form" onSubmit={submit}>
    <strong>{title}</strong>
    {kinds.length > 1 && <div className="inquiry-kinds">{kinds.map(([value, label]) => <button type="button" key={value} className={kind === value ? 'active' : ''} onClick={() => setKind(value)}>{label}</button>)}</div>}
    <input required minLength={2} autoComplete="name" placeholder="نام و نام خانوادگی" value={fullName} onChange={(event) => setFullName(event.target.value)} />
    <input required inputMode="tel" autoComplete="tel" placeholder="شماره موبایل" value={mobile} onChange={(event) => setMobile(event.target.value)} />
    <button className="button-primary" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'در حال ارسال…' : 'ثبت درخواست'}</button>
    {state.status === 'error' && <small className="inquiry-error" role="alert">{state.text}</small>}
  </form>;
}

function InstallmentModal({ stock, car, onClose }) {
  // With the ERP, the showroom's own terms: a flat monthly profit, its months and least down payment
  const flat = erp.terms ? erp.terms.monthlyRate / 100 : null;
  const terms = erp.terms?.months?.length ? erp.terms.months : [6, 12, 18, 24, 36];
  const [price, setPrice] = useState(stock.price);
  const [down, setDown] = useState(Math.round(stock.price * Math.max(.3, (erp.terms?.minDownPercent ?? 0) / 100)));
  const [term, setTerm] = useState(terms.includes(24) ? 24 : terms[terms.length - 1]);
  const [customMonthly, setCustomMonthly] = useState(0);
  const toNumber = (value) => Number(value.replace(/[۰-۹]/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)).replace(/[٠-٩]/g, (digit) => '٠١٢٣٤٥٦٧٨٩'.indexOf(digit)).replace(/[^0-9]/g, '')) || 0;
  const principal = Math.max(0, price - down);
  const rate = .23 / 12;
  const customPrincipal = flat !== null
    ? Math.round(customMonthly * term / (1 + flat * term))
    : customMonthly > principal * rate && rate ? Math.round(customMonthly * (1 - Math.pow(1 + rate, -term)) / rate) : 0;
  const customDown = Math.max(0, price - customPrincipal);
  const monthlyFor = (months) => {
    if (!principal) return 0;
    if (flat !== null) return Math.round(principal * (1 + flat * months) / months);
    const termFactor = Math.pow(1 + rate, months);
    return Math.round(principal * rate * termFactor / (termFactor - 1));
  };
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><section className="installment-modal" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={onClose} aria-label="بستن"><X size={20} /></button><h2 id="modal-title">محاسبه اقساط</h2><p className="modal-car-name">{car.nameFa} · {displayYear(stock)}</p><div className="modal-layout"><div className="modal-fields"><label>قیمت خودرو (تومان)<input inputMode="numeric" value={money(price)} onChange={(event) => { const next = toNumber(event.target.value); setPrice(next); setDown((value) => Math.min(value, next)); }} /></label><label>پیش‌پرداخت (تومان)<input inputMode="numeric" value={money(down)} onChange={(event) => setDown(Math.min(toNumber(event.target.value), price))} /></label><div className="down-picks">{[30, 40, 50, 60].map((percent) => <button key={percent} className={Math.round(price * percent / 100) === down ? 'active' : ''} onClick={() => setDown(Math.round(price * percent / 100))}>{money(percent)}٪</button>)}</div><label>قسط ماهانه دلخواه (تومان)<input inputMode="numeric" placeholder="اختیاری" value={customMonthly ? money(customMonthly) : ''} onChange={(event) => setCustomMonthly(toNumber(event.target.value))} /></label>{customMonthly > 0 && <small>برای این قسط، پیش‌پرداخت تقریبی {money(customDown)} تومان می‌شود.</small>}{flat !== null ? <small>سود ماهانه طبق شرایط نمایشگاه: {money(erp.terms.monthlyRate)}٪ · کمترین پیش‌پرداخت {money(erp.terms.minDownPercent)}٪</small> : <small>نرخ سالانه برآوردی: ۲۳٪</small>}</div><div className="modal-summary"><div><span>مبلغ تسهیلات</span><strong>{money(principal)} تومان</strong></div><div><span>پرداخت اول</span><strong>{money(down)} تومان</strong></div></div></div><div className="payment-table"><div className="payment-head"><span>مدت</span><span>قسط ماهانه</span><span>جمع اقساط</span><span>هزینه تسهیلات</span></div>{terms.map((months) => { const payment = monthlyFor(months); return <button key={months} className={term === months ? 'active' : ''} onClick={() => setTerm(months)}><span>{money(months)} ماه</span><strong>{money(payment)} تومان</strong><span>{money(payment * months)} تومان</span><span>{money(payment * months - principal)} تومان</span></button>; })}</div><p className="modal-note">این محاسبه فقط برآورد اولیه است. شرایط نهایی پس از بررسی مدارک و تأیید کارشناسان فروش اعلام می‌شود.</p><InquiryForm vehicle={stock.id} title={`درخواست خرید اقساطی: ${money(term)} ماه، پیش‌پرداخت ${money(down)} تومان`} kinds={[['Instalment Plan', 'اقساطی']]} extra={{ downPayment: down, months: term }} /></section></div>;
}

// The parts of the inspection map, by the key each body part has in the ERP (its diagram key):
// the outline filled with the part's colour and where its numbered marker sits
const PANEL_SHAPES = {
  front_bumper: 'M38 6 Q50 2 62 6 L61 10 Q50 7 39 10 Z',
  hood: 'M34 13 Q50 8 66 13 L69 32 Q50 37 31 32 Z',
  front_left_fender: 'M25 20 L33 13 L32 34 L23 41 Q22 31 25 20 Z',
  front_right_fender: 'M67 13 L75 20 Q78 31 77 41 L68 34 Z',
  windshield: 'M31 40 Q50 34 69 40 L73 57 Q50 62 27 57 Z',
  front_left_door: 'M18 50 L25 52 L25 79 L18 79 Z',
  front_right_door: 'M82 50 L75 52 L75 79 L82 79 Z',
  roof: 'M27 63 Q50 59 73 63 L73 96 Q50 100 27 96 Z',
  rear_left_door: 'M18 81 L25 81 L25 107 L18 107 Z',
  rear_right_door: 'M82 81 L75 81 L75 107 L82 107 Z',
  rear_glass: 'M27 101 Q50 105 73 101 L69 115 Q50 119 31 115 Z',
  rear_left_fender: 'M23 118 L32 126 L34 145 L29 138 Q23 130 23 118 Z',
  rear_right_fender: 'M77 118 L68 126 L66 145 L71 138 Q77 130 77 118 Z',
  trunk: 'M33 128 Q50 132 67 128 L63 148 Q50 151 37 148 Z',
  rear_bumper: 'M38 151 Q50 155 62 151 L61 156 Q50 158 39 156 Z',
};
const PANEL_POINTS = {
  front_bumper: [50, 8], hood: [50, 22], front_left_fender: [28, 30], front_right_fender: [72, 30],
  windshield: [50, 49], front_left_door: [22, 66], front_right_door: [78, 66], left_sill: [15, 80],
  right_sill: [85, 80], roof: [50, 80], rear_left_door: [22, 94], rear_right_door: [78, 94],
  rear_glass: [50, 110], rear_left_fender: [27, 130], rear_right_fender: [73, 130], trunk: [50, 139],
  rear_bumper: [50, 152],
};
const PANEL_FILL = { replaced: 'var(--panel-replaced)', painted: 'var(--panel-painted)', structure: 'var(--panel-structure)' };
const panelPoint = (panel) => panel.position ?? PANEL_POINTS[panel.key] ?? [50, 80];

function PaintInspection({ inspection }) {
  const [activePanel, setActivePanel] = useState(inspection.panels[0]?.number ?? 1);
  const active = inspection.panels.find((panel) => panel.number === activePanel) ?? inspection.panels[0];
  const chooseWithKeyboard = (event, number) => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActivePanel(number); }
  };
  return <section className="inspection-card" dir="rtl" aria-labelledby="inspection-title">
    <header className="inspection-heading"><div><span className="eyebrow">گزارش شعبه · {inspection.date}</span><h2 id="inspection-title">کارشناسی رنگ و بدنه</h2></div><span className="inspection-accepted"><BadgeCheck size={15} /> برگه کارشناسی</span></header>
    <div className="inspection-counts"><div><small>قطعات سالم</small><strong>{money(inspection.summary.healthy)}</strong></div><div className="attention"><small>موارد ساختاری</small><strong>{money(inspection.summary.withIssue)}</strong></div><div className="history"><small>قطعات با سابقه</small><strong>{money(inspection.summary.panelsWithHistory)}</strong></div></div>
    <div className="inspection-layout">
      <div className="inspection-map-panel"><div className="inspection-orientation"><span>جلو</span><i /><span>عقب</span></div><svg className="inspection-car-map" viewBox="0 0 100 160" role="img" aria-label="نقشه رنگ و بدنه خودرو از نمای بالا">
        <g className="inspection-wheels"><rect x="10" y="31" width="8" height="21" rx="4"/><rect x="82" y="31" width="8" height="21" rx="4"/><rect x="10" y="108" width="8" height="21" rx="4"/><rect x="82" y="108" width="8" height="21" rx="4"/></g>
        <path className="inspection-body" d="M41 5 Q34 6 31 15 L23 28 Q18 35 18 48 L18 109 Q18 120 24 130 L31 149 Q34 155 42 156 L58 156 Q66 155 69 149 L76 130 Q82 120 82 109 L82 48 Q82 35 77 28 L69 15 Q66 6 59 5 Z"/>
        <path className="inspection-glass" d={PANEL_SHAPES.windshield}/>
        <path className="inspection-roof" d={PANEL_SHAPES.roof}/>
        <path className="inspection-glass" d={PANEL_SHAPES.rear_glass}/>
        <path className="inspection-trunk" d={PANEL_SHAPES.trunk}/>
        {inspection.panels.filter((panel) => PANEL_SHAPES[panel.key]).map((panel) => <path key={`shape-${panel.number}`} className={`inspection-panel ${activePanel === panel.number ? 'focused' : ''}`} fill={PANEL_FILL[panel.kind] ?? PANEL_FILL.painted} d={PANEL_SHAPES[panel.key]} />)}
        {inspection.panels.map((panel) => { const [x, y] = panelPoint(panel); return <g key={panel.number} className={`inspection-marker ${panel.kind} ${activePanel === panel.number ? 'active' : ''}`} role="button" tabIndex="0" aria-label={`${panel.number}، ${panel.name}، ${panel.status}`} onClick={() => setActivePanel(panel.number)} onKeyDown={(event) => chooseWithKeyboard(event, panel.number)} transform={`translate(${x} ${y})`}><circle r="6.5"/><text y="2.5" textAnchor="middle">{fa(panel.number)}</text></g>; })}
      </svg><div className="inspection-legend"><span><i className="legend-replaced"/> تعویض</span><span><i className="legend-painted"/> رنگ‌شده</span><span><i className="legend-structure"/> ایراد شاسی</span></div></div>
      <div className="inspection-details"><p className="inspection-helper">نقاط شماره‌دار روی نقشه را انتخاب کنید تا جزئیات هر قطعه نمایش داده شود.</p><ol className="inspection-list">{inspection.panels.map((panel) => <li key={panel.number}><button className={`${activePanel === panel.number ? 'selected' : ''} ${panel.kind}`} onClick={() => setActivePanel(panel.number)}><span className="inspection-number">{fa(panel.number)}</span><span className="inspection-part"><strong>{panel.name}</strong><small>{panel.status}</small></span><span className={`inspection-status ${panel.kind}`}>{panel.status}</span></button></li>)}</ol>{active && <div className={`inspection-selected ${active.kind}`}><span>قطعه انتخاب‌شده</span><strong>{fa(active.number)} · {active.name}</strong><small>وضعیت ثبت‌شده در برگه: {active.status}{active.description ? ` · ${active.description}` : ''}</small></div>}<div className="structure-notes"><strong>بدنه و شاسی</strong>{inspection.structureNotes.length ? inspection.structureNotes.map((note) => <p key={note}><span>!</span>{note}</p>) : <p>ایرادی در شاسی ثبت نشده است.</p>}{inspection.note && <p><span>i</span>{inspection.note}</p>}</div></div>
    </div>
  </section>;
}

function CarDetailPage({ stockId, navigate }) {
  const stock = inventory.find((item) => item.id === stockId);
  if (!stock) {
    return <main className="section detail-page" dir="rtl"><div className="empty-inventory">{erp.done ? 'این خودرو در موجودی نمایشگاه نیست؛ شاید فروخته شده باشد.' : 'در حال بارگذاری خودرو…'} <button className="button-secondary" onClick={() => navigate('/inventory')}>خودروهای نمایشگاه <ArrowLeft size={15} /></button></div></main>;
  }
  return <CarDetail stock={stock} navigate={navigate} />;
}

function CarDetail({ stock, navigate }) {
  const car = stockCar(stock);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const photos = stock.photos;
  useEffect(() => {
    setActivePhoto(0);
    setShowLightbox(false);
  }, [stock.id]);
  useEffect(() => {
    if (!showLightbox) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowLightbox(false);
      if (event.key === 'ArrowRight' && photos.length > 1) setActivePhoto((index) => (index + 1) % photos.length);
      if (event.key === 'ArrowLeft' && photos.length > 1) setActivePhoto((index) => (index - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [showLightbox, photos.length]);
  const changePhoto = (delta) => setActivePhoto((index) => (index + delta + Math.max(photos.length, 1)) % Math.max(photos.length, 1));
  return <main className="section detail-page" dir="rtl">
    <div className="detail-crumb"><button onClick={() => navigate('/inventory')}>بازگشت به خودروهای نمایشگاه</button><span>›</span><span>{car.nameFa}</span></div>
    <div className="detail-layout">
      <aside className="detail-summary">
        <div className="detail-summary-title"><div><small>{displayYear(stock)} · {stock.status}</small><h1>{car.nameFa}</h1></div><button className="icon-ghost" aria-label="اشتراک‌گذاری" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Share2 size={17} /></button></div>
        <div className="detail-summary-line"><span>قیمت خودرو</span><strong>{priceOf(stock)}</strong></div>
        <div className="detail-facts"><div><span>مدل</span><strong>{car.nameFa}</strong></div><div><span>سال ساخت</span><strong>{displayYear(stock)}</strong></div><div><span>کارکرد</span><strong>{stock.mileage ? `${money(stock.mileage)} کیلومتر` : 'صفر کیلومتر'}</strong></div><div><span>رنگ</span><strong>{stock.color}</strong></div><div><span>نوع فروش</span><strong>امانی / نمایشگاهی</strong></div><div><span>شعبه</span><strong>{stock.branch}</strong></div></div>
        <a className="detail-call" href={SITE.phoneHref}><Phone size={16} /> تماس با شعبه {SITE.phone}</a>
        <div className="detail-branch"><strong><MapPin size={16} /> خودرو در {stock.branch}</strong><span>برای بازدید حضوری و هماهنگی با کارشناس فروش تماس بگیرید.</span><button onClick={() => navigate('/branches')}>اطلاعات شعبه <ArrowLeft size={14} /></button></div>
        {stock.price > 0 && <button className="detail-installment" onClick={() => setShowCalculator(true)}>محاسبه اقساط این خودرو <ArrowLeft size={15} /></button>}
        <InquiryForm vehicle={erp.connected ? stock.id : undefined} title="درخواست تماس یا بازدید" kinds={[['Call Me Back', 'با من تماس بگیرید'], ['Test Drive', 'بازدید و تست خودرو']]} />
      </aside>
      <div className="detail-gallery">
        <div className="detail-main-photo">
          {photos.length ? <button className="detail-photo-trigger" onClick={() => setShowLightbox(true)} aria-label="نمایش بزرگ عکس خودرو"><img src={photos[activePhoto]} alt={`${car.nameFa} تصویر ${activePhoto + 1}`} /><span className="photo-zoom-hint"><Maximize2 size={15} /> بزرگ‌نمایی</span></button> : <div className={`photo-placeholder shade-${car.id}`}><span className="photo-kicker"><Camera size={14} /> گالری خودرو</span><strong>{car.name}</strong><small>عکس‌های خودرو با اتصال موجودی نمایش داده می‌شوند</small><div className="car-illustration" aria-hidden="true"><i /><b /><em /></div></div>}
          {photos.length > 1 && <><button className="gallery-arrow previous" onClick={() => changePhoto(-1)} aria-label="عکس قبلی">‹</button><button className="gallery-arrow next" onClick={() => changePhoto(1)} aria-label="عکس بعدی">›</button><span className="gallery-counter">{money(activePhoto + 1)} / {money(photos.length)}</span></>}
        </div>
        {photos.length > 0 && <div className="gallery-thumbs">{photos.map((photo, index) => <button className={index === activePhoto ? 'active' : ''} key={photo} onClick={() => setActivePhoto(index)} aria-label={`نمای ${index + 1}`}><img src={photo} alt="" /></button>)}</div>}
        <section className="detail-specs"><h2>مشخصات {car.nameFa}</h2><dl>{[['مدل', car.nameFa], ['سازنده', car.brand], ['تیپ', stock.trim], ['رنگ', stock.color], ['سال ساخت', displayYear(stock)], ['شعبه', stock.branch], ...car.specs.slice(0, 7)].filter(([, value]) => value !== undefined && value !== '').map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{car.model && <button className="button-secondary" onClick={() => navigate(`/vehicle/${car.id}`)}>مشاهده سه‌بعدی خودرو <ArrowLeft size={15} /></button>}</section>
        {(stock.features?.length > 0 || stock.documents?.length > 0 || stock.description) && <section className="detail-specs detail-extra">{stock.headline && <h2>{stock.headline}</h2>}{stock.description && <p>{stock.description}</p>}{stock.features?.length > 0 && <><h3>امکانات</h3><ul className="detail-tags">{stock.features.map((item) => <li key={item}>{item}</li>)}</ul></>}{stock.documents?.length > 0 && <><h3>مدارک موجود</h3><ul className="detail-tags">{stock.documents.map((item) => <li key={item}><BadgeCheck size={13} /> {item}</li>)}</ul></>}</section>}
        {stock.inspection && <PaintInspection inspection={stock.inspection} />}
      </div>
    </div>
    {showCalculator && <InstallmentModal stock={stock} car={car} onClose={() => setShowCalculator(false)} />}
    {showLightbox && photos[activePhoto] && <div className="photo-lightbox" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowLightbox(false)}><section className="photo-lightbox-dialog" role="dialog" aria-modal="true" aria-label={`گالری عکس ${car.nameFa}`}><button className="photo-lightbox-close" onClick={() => setShowLightbox(false)} aria-label="بستن عکس بزرگ"><X size={21} /></button><img src={photos[activePhoto]} alt={`${car.nameFa} تصویر ${activePhoto + 1}`} />{photos.length > 1 && <><button className="gallery-arrow previous" onClick={() => changePhoto(-1)} aria-label="عکس قبلی">‹</button><button className="gallery-arrow next" onClick={() => changePhoto(1)} aria-label="عکس بعدی">›</button><span className="gallery-counter">{money(activePhoto + 1)} / {money(photos.length)}</span></>}</section></div>}
  </main>;
}

function LoginPage() {
  const [mode, setMode] = useState('mobile');
  const [submitted, setSubmitted] = useState(false);
  return <main className="section login-page" dir="rtl"><section className="login-card"><div className="login-brand"><Logo variant="login" /></div><span className="eyebrow">حساب کاربری</span><h1>ورود به حساب</h1><p>{mode === 'mobile' ? 'شماره موبایلتان را وارد کنید تا کد ورود برایتان پیامک شود.' : 'نام کاربری و رمز عبور خود را وارد کنید.'}</p><div className="login-tabs"><button className={mode === 'mobile' ? 'active' : ''} onClick={() => { setMode('mobile'); setSubmitted(false); }}>ورود با موبایل</button><button className={mode === 'password' ? 'active' : ''} onClick={() => { setMode('password'); setSubmitted(false); }}>نام کاربری و رمز</button></div><form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}><label>{mode === 'mobile' ? 'شماره موبایل' : 'نام کاربری'}<input autoFocus inputMode={mode === 'mobile' ? 'tel' : 'text'} placeholder={mode === 'mobile' ? '09xxxxxxxxx' : 'نام کاربری'} /></label>{mode === 'password' && <label>رمز عبور<input type="password" placeholder="رمز عبور" /></label>}<button className="login-submit" type="submit">{mode === 'mobile' ? 'دریافت کد' : 'ورود'}</button></form>{submitted && <p className="login-feedback">این فرم نمایشی است و برای ورود واقعی به سرویس احراز هویت نیاز دارد.</p>}<small>ثبت آگهی و ورود کاربران از همین صفحه انجام می‌شود.</small></section></main>;
}

function SellPage({ navigate }) {
  const [state, setState] = useState({ status: 'idle', text: '' });
  // With the ERP, the request reaches a sales expert; without it, the form leads to the login page
  const submit = async (event) => {
    event.preventDefault();
    if (!erp.connected) { navigate('/login'); return; }
    const form = new FormData(event.currentTarget);
    const details = [form.get('brand'), form.get('model'), form.get('year') && `سال ${form.get('year')}`, form.get('color') && `رنگ ${form.get('color')}`].filter(Boolean).join('، ');
    setState({ status: 'sending', text: '' });
    try {
      await sendInquiry({ fullName: form.get('name'), mobile: form.get('mobile'), kind: 'Question', message: `درخواست فروش خودرو: ${details}` });
      setState({ status: 'sent', text: 'درخواست شما ثبت شد؛ کارشناس ما برای بازدید و قیمت‌گذاری با شما تماس می‌گیرد.' });
    } catch (error) {
      setState({ status: 'error', text: error.message });
    }
  };
  return <main className="section sell-page standalone-page" dir="rtl"><div className="section-head"><span className="eyebrow">فروش خودرو با اتومدیران</span><h1>خودرویتان را به ما بسپارید</h1><p>کارشناسان ما خودرو را بررسی می‌کنند، قیمت‌گذاری انجام می‌دهند و مراحل فروش را تا زمان تسویه همراهی می‌کنند.</p></div><div className="sell-layout"><section className="sell-process"><h2>مراحل فروش</h2><ol><li><b>۱</b><span><strong>ثبت درخواست</strong><small>مشخصات خودروی خود را وارد کنید.</small></span></li><li><b>۲</b><span><strong>کارشناسی و قیمت‌گذاری</strong><small>کارشناس برای بررسی خودرو با شما هماهنگ می‌کند.</small></span></li><li><b>۳</b><span><strong>نمایش و فروش</strong><small>پس از توافق، خودرو به خریداران معرفی می‌شود.</small></span></li><li><b>۴</b><span><strong>تسویه و تحویل</strong><small>قرارداد و پرداخت پس از تأیید نهایی انجام می‌شود.</small></span></li></ol></section><form className="sell-form" onSubmit={submit}><h2>درخواست فروش خودرو</h2>{erp.connected && <label>نام و نام خانوادگی<input name="name" required minLength={2} autoComplete="name" /></label>}<label>برند خودرو<select name="brand" defaultValue=""><option value="" disabled>برند را انتخاب کنید</option>{BRANDS.map((brand) => <option key={brand}>{brand}</option>)}</select></label><label>مدل و تیپ<input name="model" placeholder="مثلاً تیگو ۸ پرو" /></label><div className="sell-form-row"><label>سال ساخت<input name="year" inputMode="numeric" placeholder="۱۴۰۴" /></label><label>رنگ<input name="color" placeholder="مثلاً سفید" /></label></div><label>شماره موبایل<input name="mobile" required={erp.connected} inputMode="tel" placeholder="۰۹۱۲xxxxxxx" /></label>{state.status === 'sent' ? <p className="inquiry-done" role="status"><BadgeCheck size={16} /> {state.text}</p> : <button className="button-primary" type="submit" disabled={state.status === 'sending'}>{erp.connected ? (state.status === 'sending' ? 'در حال ارسال…' : 'ثبت درخواست') : 'ادامه و ورود'} <ArrowLeft size={16} /></button>}{state.status === 'error' && <small className="inquiry-error" role="alert">{state.text}</small>}<small>{erp.connected ? 'کارشناس ما برای بازدید و قیمت‌گذاری با شما تماس می‌گیرد.' : 'برای ثبت درخواست، ابتدا وارد حساب کاربری شوید.'}</small></form></div></main>;
}

function InstallmentSection({ navigate }) {
  const [stockId, setStockId] = useState(inventory[0]?.id ?? '');
  const [showCalculator, setShowCalculator] = useState(false);
  const stock = inventory.find((item) => item.id === stockId);
  const car = stock ? stockCar(stock) : undefined;
  return <section id="installments" className="section installment-section" dir="rtl"><div className="section-head"><span className="eyebrow">برآورد مالی</span><h1>محاسبه اقساط خودرو</h1><p>خودرو را از موجودی نمایشگاه انتخاب کنید تا برآورد قیمت، پیش‌پرداخت و اقساط همان خودرو را ببینید.</p></div><div className="installment-page-card"><label className="installment-car-select">انتخاب خودرو<select value={stockId} onChange={(event) => setStockId(event.target.value)}>{inventory.map((item) => { const itemCar = stockCar(item); return <option key={item.id} value={item.id}>{itemCar?.nameFa} · {item.branch} · {priceText(item)}</option>; })}</select></label>{stock && car && <div className="installment-car-summary"><div><span>{stock.branch} · مدل {displayYear(stock)}</span><strong>{car.nameFa}</strong></div><b>{priceOf(stock)}</b></div>}<button className="button-primary installment-open" disabled={!stock || !car || !stock.price} onClick={() => setShowCalculator(true)}><CalculatorIcon size={17} /> محاسبه اقساط این خودرو</button></div>{showCalculator && stock && car && <InstallmentModal stock={stock} car={car} onClose={() => setShowCalculator(false)} />}</section>;
}

function BranchSection({ navigate }) {
  return <section id="branches" className="section branches-section" dir="rtl"><div className="section-head"><span className="eyebrow">در کنار شما</span><h2>شعبه‌های اتومدیران</h2><p>موجودی هر شعبه را جداگانه ببینید و برای بازدید هماهنگ کنید.</p></div><div className="branch-card"><div className="branch-map"><div className="map-grid" /><span className="map-route" /><span className="map-pin pin-one"><MapPin size={18} /></span><span className="map-pin pin-two"><MapPin size={18} /></span><span className="map-caption">تهران · اتو مدیران</span></div><div className="branch-list">{BRANCHES.map((name, index) => <article className="branch-list-card" key={name}><div><span className="branch-icon"><MapPin size={17} /></span><span><small>شعبه {index + 1} · تهران</small><strong>{name}</strong></span></div><p>برای نشانی دقیق، ساعت بازدید و موجودی خودرو با شعبه تماس بگیرید.</p><div className="branch-actions"><a className="button-secondary" href={SITE.phoneHref}><Phone size={14} /> {SITE.phone}</a><button className="button-primary" onClick={() => navigate(`/inventory?branch=${encodeURIComponent(name)}`)}>موجودی این شعبه <ArrowLeft size={15} /></button></div></article>)}</div></div></section>;
}

function routeFromPath(pathname) {
  const [, root, value] = new URL(pathname, window.location.origin).pathname.split('/');
  if (root === 'vehicle' && cars.some((car) => car.id === value)) return { page: 'vehicle', carId: value };
  // A car not in the list yet may come with the ERP's cars: its page waits for them
  if (root === 'car' && value) {
    const stockId = decodeURIComponent(value);
    return { page: 'car', stockId, carId: inventory.find((stock) => stock.id === stockId)?.carId ?? cars[0].id };
  }
  const routes = new Set(['inventory', 'sell', 'installments', 'specs', 'compare', 'about', 'branches', 'contact', 'login']);
  return { page: routes.has(root) ? root : 'home', carId: cars[0].id };
}

function BrandLoading() {
  return <div className="brand-loading" dir="rtl" role="status" aria-label="در حال بارگذاری اتومدیران"><div className="loading-mark"><Logo variant="hero" /></div><div className="brand-loader-line"><i /></div><span>در حال آماده‌سازی نمایشگاه</span></div>;
}

function HomePage({ navigate }) {
  return <section className="home-links section" dir="rtl"><div><span className="eyebrow">اتو مدیران</span><h2>خودروی بعدی‌تان را با اطمینان انتخاب کنید</h2><p>موجودی شعب، مشخصات خودروها و گزینه‌های خرید را در صفحه‌های جداگانه ببینید.</p></div><div className="home-shortcuts"><button onClick={() => navigate('/inventory')}><Building2 size={18} /> خودروهای نمایشگاه <ArrowLeft size={15} /></button><button onClick={() => navigate('/compare')}><SlidersHorizontal size={18} /> مقایسه دو خودرو <ArrowLeft size={15} /></button><button onClick={() => navigate('/sell')}><Banknote size={18} /> فروش خودروی شما <ArrowLeft size={15} /></button></div></section>;
}

function ComparePage() {
  const [selected, setSelected] = useState(inventory.slice(0, 2).map((stock) => stock.id));
  const selectedStock = selected.map((id) => inventory.find((item) => item.id === id)).filter(Boolean);
  const setCarAt = (index, id) => setSelected((current) => current.map((value, position) => position === index ? id : value));
  return <section id="compare" className="section compare-page" dir="rtl"><div className="section-head"><span className="eyebrow">مقایسه خودروها</span><h1>دو خودرو را انتخاب کنید</h1><p>هر خودرو را از فهرست موجودی انتخاب کنید؛ مشخصات فنی دو خودرو کنار هم نمایش داده می‌شود.</p></div><div className="compare-picker">{[0, 1].map((index) => <label className="compare-select" key={index}><span>خودرو {fa(index + 1)}</span><select value={selected[index] ?? ''} onChange={(event) => setCarAt(index, event.target.value)}>{inventory.map((stock) => { const car = stockCar(stock); const disabled = selected[1 - index] === stock.id; return <option key={stock.id} value={stock.id} disabled={disabled}>{car?.nameFa} · {stock.branch} · {priceText(stock)}</option>; })}</select></label>)}</div>{selectedStock.length === 2 ? <div className="compare-columns">{selectedStock.map((stock) => { const car = stockCar(stock); return <article key={stock.id}><h2>{car.nameFa}</h2><small>{stock.branch} · {stock.color}</small><dl>{[['قیمت', priceText(stock)], ['تیپ', stock.trim], ['سال ساخت', displayYear(stock)], ['کارکرد', stock.mileage ? `${money(stock.mileage)} کیلومتر` : 'صفر کیلومتر'], ...car.specs.slice(0, 8)].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></article>; })}</div> : <div className="empty-inventory">برای مقایسه، دو خودرو انتخاب کنید.</div>}<p className="footnote">{SPECS_NOTE}</p></section>;
}

export default function App() {
  const initial = routeFromPath(window.location.pathname);
  const [route, setRoute] = useState(initial);
  const [carId, setCarId] = useState(initial.carId);
  const [phase, setPhase] = useState(initial.page === 'home' && introEnabled ? 'loading' : 'done');
  const [info, setInfo] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageLoadKey, setPageLoadKey] = useState(0);
  // Bumped when the ERP's cars arrive: the pages that list cars start again with them
  const [dataVersion, setDataVersion] = useState(0);
  const car = cars.find((item) => item.id === carId) ?? cars[0];
  const navigate = (path) => {
    if (window.location.pathname !== path) window.history.pushState({}, '', path);
    const next = routeFromPath(path);
    setRoute(next); setCarId(next.carId); setInfo(null);
    setPhase(next.page === 'home' && introEnabled ? 'loading' : 'done');
    setPageLoading(true);
    setPageLoadKey((key) => key + 1);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  useEffect(() => {
    const onPopState = () => { const next = routeFromPath(window.location.pathname); setRoute(next); setCarId(next.carId); setPhase(next.page === 'home' && introEnabled ? 'loading' : 'done'); setPageLoading(true); setPageLoadKey((key) => key + 1); window.scrollTo(0, 0); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  useEffect(() => { const timer = window.setTimeout(() => setPageLoading(false), 480); return () => window.clearTimeout(timer); }, [pageLoadKey]);
  useEffect(() => {
    let active = true;
    loadInventory().then((loaded) => {
      if (!active) return;
      // A car's address (/car/CAR-00012) is only known once the ERP's cars are here
      if (loaded) setRoute(routeFromPath(window.location.pathname));
      setDataVersion((version) => version + 1);
    });
    return () => { active = false; };
  }, []);
  const onIntroPhase = (i) => { setPhase('playing'); setInfo(i); setCarId(cars[i.car].id); };

  return <div className={`app ${(route.page === 'home' || route.page === 'vehicle') && phase !== 'done' ? 'intro-playing' : ''}`} id="top">
    <Topbar navigate={navigate} page={route.page} />
    {route.page === 'home' && <><Configurator car={car} onPickCar={setCarId} phase={phase} info={info} onIntroPhase={onIntroPhase} onIntroDone={() => setPhase('done')} intro={introEnabled} /><HomePage navigate={navigate} /></>}
    {route.page === 'inventory' && <InventorySection key={dataVersion} onSelect={(id) => navigate(`/car/${id}`)} navigate={navigate} />}
    {route.page === 'sell' && <SellPage navigate={navigate} />}
    {route.page === 'installments' && <div className="standalone-page"><InstallmentSection key={dataVersion} navigate={navigate} /></div>}
    {route.page === 'vehicle' && <><Configurator car={car} onPickCar={(id) => navigate(`/vehicle/${id}`)} phase={phase} info={info} onIntroPhase={onIntroPhase} onIntroDone={() => setPhase('done')} /><div className="section vehicle-specs"><SpecPanel car={car} className="below" /><button className="button-secondary" onClick={() => navigate('/compare')}>مقایسه با خودروهای دیگر <ArrowLeft size={15} /></button></div></>}
    {route.page === 'car' && <CarDetailPage key={dataVersion} stockId={route.stockId} navigate={navigate} />}
    {route.page === 'compare' && <ComparePage key={dataVersion} />}
    {route.page === 'about' && <section className="section standalone-page" dir="rtl"><div className="about"><div><span className="eyebrow">درباره ما</span><h2>{SITE.name}</h2><p className="slogan">{SITE.slogan}</p><p>در اتومدیران می‌توانید خودروها را بررسی کنید، مشخصات و امکاناتشان را مقایسه کنید و برای مشاوره و خرید با کارشناسان در ارتباط باشید. برای خودروهای منتخب، امکان مشاهده‌ی سه‌بعدی و بررسی رنگ‌ها هم فراهم است.</p><button className="button-primary" onClick={() => navigate('/inventory')}>دیدن موجودی نمایشگاه <ArrowLeft size={16} /></button></div></div></section>}
    {route.page === 'branches' && <div className="standalone-page"><BranchSection key={dataVersion} navigate={navigate} /></div>}
    {route.page === 'login' && <LoginPage />}
    {route.page === 'contact' && <section className="section standalone-page" dir="rtl"><div className="section-head"><span className="eyebrow">تماس با ما</span><h2>برای مشاوره و خرید با ما در ارتباط باشید</h2></div><div className="contact-grid"><a className="contact-card" href={SITE.phoneHref}><Phone size={22} /><span>تلفن</span><strong dir="ltr">{SITE.phone}</strong></a><a className="contact-card" href={SITE.website} target="_blank" rel="noreferrer"><Globe size={22} /><span>وب‌سایت</span><strong dir="ltr">automodiran.com</strong></a></div></section>}
    <footer className="footer"><Logo variant="footer" /><span>اتو مدیران · انتخابی مطمئن، فردایی بهتر</span>{(route.page === 'vehicle' || route.page === 'home') && <p>3D models: {cars.map((c, i) => <span key={c.id}>“<a href={c.credit.url} target="_blank" rel="noreferrer">{c.credit.title}</a>” by <a href={c.credit.authorUrl} target="_blank" rel="noreferrer">{c.credit.author}</a> ({c.credit.license}){i < cars.length - 1 ? '; ' : '.'} </span>)}</p>}</footer>
    {pageLoading && <BrandLoading />}
  </div>;
}
