/**
 * Filename: src/lib/utils.ts
 * Description: Utility function for merging Tailwind CSS classes conditionally.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
