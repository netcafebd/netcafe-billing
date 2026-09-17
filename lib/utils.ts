import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "৳0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return "৳0.00";
  const parts = num.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `৳${parts.join(".")}`;
}

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatMonthYear(month: number, year: number): string {
  if (month < 1 || month > 12) return `${month}/${year}`;
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  // Deterministic Dhaka time calculation (+6 hours from UTC)
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const dhaka = new Date(utcMs + 6 * 3600000);

  const day = String(dhaka.getDate()).padStart(2, "0");
  const month = SHORT_MONTHS[dhaka.getMonth()];
  const year = dhaka.getFullYear();
  return `${day} ${month} ${year}`;
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "N/A";

  // Deterministic Dhaka time calculation (+6 hours from UTC)
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60000;
  const dhaka = new Date(utcMs + 6 * 3600000);

  const day = String(dhaka.getDate()).padStart(2, "0");
  const month = SHORT_MONTHS[dhaka.getMonth()];
  const year = dhaka.getFullYear();

  let hours = dhaka.getHours();
  const minutes = String(dhaka.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedHours = String(hours).padStart(2, "0");

  return `${day} ${month} ${year}, ${formattedHours}:${minutes} ${ampm}`;
}

