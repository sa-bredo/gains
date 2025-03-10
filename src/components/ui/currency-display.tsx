
import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { useCurrencySettings } from '@/hooks/useCurrencySettings';

export interface CurrencyDisplayProps {
  amount: number | string | null | undefined;
  className?: string;
  showSymbol?: boolean;
  showCode?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function CurrencyDisplay({
  amount,
  className = '',
  showSymbol = true,
  showCode = false,
  minimumFractionDigits = 2,
  maximumFractionDigits = 2,
}: CurrencyDisplayProps) {
  const { currencyCode, isLoading } = useCurrencySettings();
  
  if (isLoading) {
    return <span className={className}>...</span>;
  }
  
  // Configure number format options
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits,
    maximumFractionDigits,
  };
  
  // Add currency style if showing symbol
  if (showSymbol) {
    options.style = 'currency';
    options.currency = currencyCode;
  } else {
    // If not showing symbol, just format as a number
    options.style = 'decimal';
  }
  
  const formattedValue = formatCurrency(amount, currencyCode, options);
  
  return (
    <span className={className}>
      {formattedValue}
      {!showSymbol && showCode && ` ${currencyCode}`}
    </span>
  );
}
