const PLACEHOLDER = '—';

function toFiniteNumber(value: number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export const formatCurrency = (value: number | null | undefined, currency = '₹'): string => {
  const n = toFiniteNumber(value);
  if (n === null) return PLACEHOLDER;
  if (n >= 10000000) {
    return `${currency}${(n / 10000000).toFixed(2)} Cr`;
  }
  if (n >= 100000) {
    return `${currency}${(n / 100000).toFixed(2)} L`;
  }
  if (n >= 1000) {
    return `${currency}${(n / 1000).toFixed(2)} K`;
  }
  return `${currency}${n.toFixed(2)}`;
};

export const formatNumber = (value: number | null | undefined): string => {
  const n = toFiniteNumber(value);
  if (n === null) return PLACEHOLDER;
  return new Intl.NumberFormat('en-IN').format(n);
};

export const formatPercent = (value: number | null | undefined, decimals = 2): string => {
  const n = toFiniteNumber(value);
  if (n === null) return PLACEHOLDER;
  return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
};

export const getChangeColor = (change: number | null | undefined): string => {
  const n = toFiniteNumber(change);
  if (n === null) return 'text-gray-600';
  if (n > 0) return 'text-success';
  if (n < 0) return 'text-danger';
  return 'text-gray-600';
};

export const getChangeBgColor = (change: number | null | undefined): string => {
  const n = toFiniteNumber(change);
  if (n === null) return 'bg-gray-100 text-gray-600';
  if (n > 0) return 'bg-success/10 text-success';
  if (n < 0) return 'bg-danger/10 text-danger';
  return 'bg-gray-100 text-gray-600';
};
