import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina las clases de Tailwind CSS eficientemente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
