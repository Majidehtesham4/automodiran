// The showroom's cars and customer requests, from the ERP (ERP-VERON).
//
// The site asks the ERP for the cars on start; if the ERP does not answer, it keeps the local
// catalogue of src/inventory.js. Requests from the forms (call me back, test drive, instalments,
// selling a car) become «Car Inquiry» records in the ERP, each assigned to the next sales expert.
//
// Where the ERP is:
// - by default the same address as the site: the site's server passes /api and /files on to the
//   ERP (vite.config.js while developing, deploy/nginx.conf in production), so nothing else is needed;
// - or VITE_ERP_URL=https://erp.example.ir at build time, when the ERP is on another address
//   (that ERP then has to allow this site: bench --site <site> set-config allow_cors '"https://this-site"').
// VITE_ERP=off builds the site with its local catalogue only.

import { replaceInventory } from './inventory.js';

const BASE = (import.meta.env.VITE_ERP_URL ?? '').replace(/\/+$/, '');
const API = `${BASE}/api/method/iran_erp.iran_dealership.showroom`;
const ENABLED = import.meta.env.VITE_ERP !== 'off';

// The showroom's instalment terms once the ERP answered: { monthlyRate, months, minDownPercent }
// done: the ERP was asked (whether it answered or not)
export const erp = { connected: false, done: false, terms: null, showroom: null };

const absolute = (path) => (!path || /^https?:\/\//.test(path) ? path : `${BASE}${path}`);

export async function loadInventory() {
  try {
    if (!ENABLED) return false;
    const response = await fetch(`${API}.get_inventory`, { headers: { Accept: 'application/json' } });
    if (!response.ok) return false;
    const data = (await response.json()).message;
    if (!data || !Array.isArray(data.cars)) return false;
    replaceInventory({
      branches: data.branches ?? [],
      models: data.models ?? {},
      cars: data.cars.map((car) => ({ ...car, photos: (car.photos ?? []).map(absolute) })),
    });
    const { monthlyRate, months, minDownPercent, ...showroom } = data.showroom ?? {};
    erp.connected = true;
    erp.terms = monthlyRate ? { monthlyRate, months, minDownPercent } : null;
    erp.showroom = showroom;
    return true;
  } catch {
    return false;
  } finally {
    erp.done = true;
  }
}

// The ERP's own error message (a Frappe response), or a general one
function errorText(data) {
  try {
    const messages = JSON.parse(data._server_messages);
    return JSON.parse(messages[0]).message;
  } catch {
    return 'درخواست ثبت نشد. لطفاً دوباره تلاش کنید یا تماس بگیرید.';
  }
}

// kind: 'Call Me Back' | 'Test Drive' | 'Instalment Plan' | 'Question'.
// Amounts (downPayment) are in toman here and rials in the ERP.
export async function sendInquiry({ fullName, mobile, kind = 'Call Me Back', vehicle, message, downPayment, months }) {
  if (!erp.connected) throw new Error('ثبت آنلاین در دسترس نیست؛ لطفاً تماس بگیرید.');
  const fields = {
    full_name: fullName,
    mobile,
    kind,
    vehicle,
    message,
    down_payment: downPayment ? Math.round(downPayment * 10) : undefined,
    months,
  };
  const body = new URLSearchParams(Object.entries(fields).filter(([, value]) => value !== undefined && value !== null && value !== ''));
  const response = await fetch(`${API}.send_inquiry`, { method: 'POST', body, headers: { Accept: 'application/json' } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorText(data));
  return data.message;
}
