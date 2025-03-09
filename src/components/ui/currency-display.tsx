
import React, { useState, useEffect } from 'react';
import { useCompany } from "@/contexts/CompanyContext";
import { fetchGeneralSettings, getCurrency } from '@/utils/settings';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = "" 
}) => {
  const [currencyCode, setCurrencyCode] = useState('GBP');
  const { currentCompany } = useCompany();

  useEffect(() => {
    const loadSettings = async () => {
      if (currentCompany?.id) {
        const settings = await fetchGeneralSettings(currentCompany.id);
        setCurrencyCode(getCurrency(settings));
      }
    };
    
    loadSettings();
  }, [currentCompany]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <span className={className}>{formatCurrency(amount)}</span>
  );
};
