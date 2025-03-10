
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Function to format a number as currency
export function formatCurrency(
  amount: number | string | null | undefined, 
  currencyCode = 'GBP', 
  options: Intl.NumberFormatOptions = {}
): string {
  if (amount === null || amount === undefined) return '';
  
  // Convert string to number if needed
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Handle NaN case
  if (isNaN(numericAmount)) return '';
  
  try {
    // Currency mapping for symbols
    const currencyMap: Record<string, Intl.NumberFormatOptions> = {
      GBP: { style: 'currency', currency: 'GBP' },
      USD: { style: 'currency', currency: 'USD' },
      EUR: { style: 'currency', currency: 'EUR' },
    };
    
    // Use provided currency code or fallback to GBP
    const currencyOptions = currencyMap[currencyCode] || currencyMap.GBP;
    
    // Merge default options with any custom options
    const mergedOptions = { ...currencyOptions, ...options };
    
    return new Intl.NumberFormat('en-GB', mergedOptions).format(numericAmount);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${numericAmount}`;
  }
}
