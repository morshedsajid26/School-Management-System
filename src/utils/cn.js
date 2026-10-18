import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to conditionally join classNames with Tailwind CSS merge support
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
