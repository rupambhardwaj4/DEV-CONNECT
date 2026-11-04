export function formatDate(date) {
  if (!date) return '';

  const dateObj = new Date(date);
  const now = new Date();
  const diff = now - dateObj;
  const future = diff < 0;
  const elapsed = Math.abs(diff);

  const seconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  const relative = (value, unit) => (future ? `in ${value} ${unit}` : `${value} ${unit} ago`);
  if (seconds < 60) return 'just now';
  if (minutes < 60) return relative(minutes, minutes === 1 ? 'minute' : 'minutes');
  if (hours < 24) return relative(hours, hours === 1 ? 'hour' : 'hours');
  if (days < 7) return relative(days, days === 1 ? 'day' : 'days');

  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/** Calendar date only — for interview slots, deadlines and application timestamps. */
export function formatDay(date, { withTime = false } = {}) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£', INR: '₹', CAD: 'CA$', AUD: 'A$', SGD: 'S$' };

/**
 * Salary range for job cards and detail pages. Compact (k/L) because a range plus a
 * period has to fit one line on a 375px screen.
 */
export function formatSalary(salary) {
  if (!salary) return 'Salary not disclosed';
  const symbol = CURRENCY_SYMBOL[salary.currency] ?? `${salary.currency} `;
  const compact = (value) => {
    if (value >= 100000) return `${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
    if (value >= 1000) return `${Math.round(value / 1000)}k`;
    return String(value);
  };
  const range =
    salary.min != null && salary.max != null && salary.min !== salary.max
      ? `${symbol}${compact(salary.min)}–${symbol}${compact(salary.max)}`
      : `${symbol}${compact(salary.min ?? salary.max)}`;
  if (salary.period === 'hour') return `${range}/hr`;
  if (salary.period === 'month') return `${range}/mo`;
  return `${range}/yr`;
}

/** "3 days ago" / "in 5 days" — seeded dates can sit slightly ahead of the real clock. */
export function timeAgo(date) {
  if (!date) return '';
  const diff = Date.parse(date) - Date.now();
  const magnitude = Math.abs(diff);
  const units = [
    ['minute', 60000],
    ['hour', 3600000],
    ['day', 86400000],
    ['week', 604800000],
    ['month', 2592000000],
  ];
  if (magnitude < 45000) return 'just now';
  let chosen = ['minute', 60000];
  for (const unit of units) {
    if (magnitude >= unit[1]) chosen = unit;
  }
  const value = Math.round(magnitude / chosen[1]);
  const label = value === 1 ? chosen[0] : `${chosen[0]}s`;
  return diff < 0 ? `${value} ${label} ago` : `in ${value} ${label}`;
}

export function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
