// NexoCore — cn utility
// Merge Tailwind classes conditionally (clsx + tailwind-merge)

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
