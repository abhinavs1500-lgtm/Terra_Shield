/**
 * TerraShield AI — Indian Localization & Currency Utilities
 * Formats currency into Indian Rupees (₹) using the Indian numbering system (Lakhs / Crores).
 */

export const formatINR = (
  amount: number | null | undefined,
  options: { compact?: boolean; precision?: number } = {}
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const { compact = false, precision = 2 } = options;

  if (compact) {
    const absVal = Math.abs(amount);
    if (absVal >= 10000000) {
      // 1 Crore = 10,000,000
      const crVal = amount / 10000000;
      return `₹${crVal.toFixed(precision)} Cr`;
    }
    if (absVal >= 100000) {
      // 1 Lakh = 100,000
      const lakhVal = amount / 100000;
      return `₹${lakhVal.toFixed(precision)} Lakh`;
    }
    if (absVal >= 1000) {
      const kVal = amount / 1000;
      return `₹${kVal.toFixed(1)}k`;
    }
  }

  // Full Indian numbering system format (e.g. ₹12,34,567)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumberIN = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return new Intl.NumberFormat('en-IN').format(val);
};
