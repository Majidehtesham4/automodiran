import { useId } from 'react';
import { SHIELD_PATH, SHIELD_VIEWBOX } from './logoPath.js';

// Gold version of the AUTO MODIRAN shield, with a light glint that sweeps across it every few seconds.
// shine: true (every 6 s), 'fast' (loading screen) or false
export function Shield({ className = '', shine = true, title = 'اتو مدیران' }) {
  const fast = shine === 'fast';
  const id = useId().replace(/:/g, '');
  return (
    <svg className={`shield ${className}`} viewBox={SHIELD_VIEWBOX} role="img" aria-label={title}>
      <defs>
        <linearGradient id={`gold-${id}`} x1="0" y1="0" x2="0.45" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.18" stopColor="#f1cf72" />
          <stop offset="0.42" stopColor="#b98a2f" />
          <stop offset="0.55" stopColor="#fbe4a0" />
          <stop offset="0.72" stopColor="#c99a3d" />
          <stop offset="1" stopColor="#7d5719" />
        </linearGradient>
        <linearGradient id={`shine-${id}`} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0.38" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
          {shine && <animateTransform attributeName="gradientTransform" type="translate" values="-1.2 0; 1.2 0; 1.2 0" keyTimes={fast ? '0; 0.62; 1' : '0; 0.35; 1'} dur={fast ? '2.2s' : '6s'} repeatCount="indefinite" />}
        </linearGradient>
      </defs>
      <path d={SHIELD_PATH} fill={`url(#gold-${id})`} stroke="#5a3d0e" strokeWidth="5" />
      {shine && <path d={SHIELD_PATH} fill={`url(#shine-${id})`} style={{ mixBlendMode: 'screen' }} />}
    </svg>
  );
}

// Shield + wordmark. variant: 'bar' (top bar), 'hero' (intro), 'footer'
export function Logo({ variant = 'bar' }) {
  return (
    <span className={`logo logo-${variant}`}>
      <Shield shine={variant !== 'footer'} />
      <span className="logo-words">
        <strong className="logo-fa" dir="rtl">اتومدیران</strong>
        <span className="logo-subtitle" dir="rtl">نمایشگاه خودرو</span>
      </span>
    </span>
  );
}
