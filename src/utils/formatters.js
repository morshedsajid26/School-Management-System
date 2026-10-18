/**
 * Formatting utility functions for display values
 */

export function formatCurrency(amount, currency = "USD") {
  if (amount === undefined || amount === null) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString, options = {}) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  };

  return new Intl.DateTimeFormat("en-US", defaultOptions).format(date);
}

export function formatNumber(number) {
  if (number === undefined || number === null) return "0";
  return new Intl.NumberFormat("en-US").format(number);
}

export function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function truncateText(text, maxLength = 50) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
