import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPKR(amount: number) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return `PKR ${formatted}`;
}

export function getImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}
