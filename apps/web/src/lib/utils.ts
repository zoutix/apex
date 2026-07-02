import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge.
 * @param inputs - Class values to merge.
 * @returns Merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date into a localized string.
 * @param date - Date object or ISO string.
 * @param options - Intl.DateTimeFormatOptions.
 * @returns Formatted date string.
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Formats a number with locale settings.
 * @param num - Number to format.
 * @param options - Intl.NumberFormatOptions.
 * @returns Formatted number string.
 */
export function formatNumber(num: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('en-US', options).format(num);
}

/**
 * Formats a number as a calorie string.
 * @param calories - Number of calories.
 * @returns Formatted calorie string (e.g., "1,200 kcal").
 */
export function formatCalories(calories: number): string {
  return `${formatNumber(calories)} kcal`;
}

/**
 * Formats a weight value with a specified unit.
 * @param weight - Weight value.
 * @param unit - Unit of measurement ('kg' or 'lbs').
 * @returns Formatted weight string (e.g., "75.0 kg").
 */
export function formatWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): string {
  return `${formatNumber(weight, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${unit}`;
}

/**
 * Calculates and formats a percentage.
 * @param value - The current value.
 * @param total - The total value.
 * @param decimals - Number of decimal places to keep.
 * @returns Formatted percentage string (e.g., "45.5%").
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${formatNumber(percentage, { minimumFractionDigits: 0, maximumFractionDigits: decimals })}%`;
}

/**
 * Pauses execution for a specified duration.
 * @param ms - Milliseconds to sleep.
 * @returns Promise that resolves after the timeout.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clamps a number between a minimum and maximum value.
 * @param value - The number to clamp.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns The clamped number.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounces a function, ensuring it is only called after a specified delay.
 * @param func - The function to debounce.
 * @param wait - The delay in milliseconds.
 * @returns Debounced function.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttles a function, ensuring it is called at most once per specified limit.
 * @param func - The function to throttle.
 * @param limit - The throttle limit in milliseconds.
 * @returns Throttled function.
 */
export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generates a RFC4122 compliant UUID.
 * @returns A UUID string.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Capitalizes the first letter of a string.
 * @param str - The string to capitalize.
 * @returns The capitalized string.
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncates a string to a specified length and appends a suffix.
 * @param str - The string to truncate.
 * @param length - The maximum length of the string.
 * @param suffix - The suffix to append if truncated.
 * @returns The truncated string.
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + suffix;
}

/**
 * Checks if the code is running on the server.
 * @returns True if running on the server, false otherwise.
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Checks if the code is running in the client browser.
 * @returns True if running in the browser, false otherwise.
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Calculates the Body Mass Index (BMI).
 * @param weightKg - Weight in kilograms.
 * @param heightCm - Height in centimeters.
 * @returns The BMI value rounded to one decimal place.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Calculates the Basal Metabolic Rate (BMR) using the Mifflin-St Jeor Equation.
 * @param gender - Biological gender ('male' or 'female').
 * @param weightKg - Weight in kilograms.
 * @param heightCm - Height in centimeters.
 * @param age - Age in years.
 * @returns The BMR value in calories.
 */
export function calculateBMR(gender: 'male' | 'female', weightKg: number, heightCm: number, age: number): number {
  if (weightKg <= 0 || heightCm <= 0 || age <= 0) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

/**
 * Calculates the Total Daily Energy Expenditure (TDEE) based on BMR and activity level.
 * @param bmr - Basal Metabolic Rate.
 * @param activityLevel - Activity level category.
 * @returns The TDEE value in calories.
 */
export function calculateTDEE(bmr: number, activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'): number {
  const multipliers: Record<typeof activityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  return Math.round(bmr * multipliers[activityLevel]);
}
