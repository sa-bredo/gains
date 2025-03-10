
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCompany } from '@/contexts/CompanyContext';

export function useCurrencySettings() {
  const [currencyCode, setCurrencyCode] = useState<string>('GBP');
  const [isLoading, setIsLoading] = useState(true);
  const { currentCompany } = useCompany();

  useEffect(() => {
    async function fetchCurrencySettings() {
      if (!currentCompany) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('config')
          .select('value')
          .eq('company_id', currentCompany.id)
          .eq('key', 'general_settings')
          .single();

        if (error) {
          console.error('Error fetching currency settings:', error);
          setIsLoading(false);
          return;
        }

        if (data && data.value) {
          try {
            const settings = JSON.parse(data.value);
            const currencySetting = settings.find((setting: any) => setting.name === 'currency');
            
            if (currencySetting && currencySetting.value) {
              setCurrencyCode(currencySetting.value);
            }
          } catch (parseError) {
            console.error('Error parsing settings:', parseError);
          }
        }
      } catch (err) {
        console.error('Error in currency settings fetch:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrencySettings();
  }, [currentCompany]);

  return { currencyCode, isLoading };
}
