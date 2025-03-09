
import { supabase } from "@/integrations/supabase/client";
import { GeneralSettingField } from "@/pages/settings/general/types";

// Cache the settings to avoid frequent database calls
let cachedSettings: GeneralSettingField[] | null = null;
let cachedCompanyId: string | null = null;

/**
 * Fetches general settings for a specific company
 */
export const fetchGeneralSettings = async (companyId: string): Promise<GeneralSettingField[]> => {
  // Use cache if available for the same company
  if (cachedSettings && cachedCompanyId === companyId) {
    return cachedSettings;
  }

  try {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('company_id', companyId)
      .eq('key', 'general_settings')
      .single();

    if (error) {
      console.error('Error fetching general settings:', error);
      return [];
    }

    if (data) {
      try {
        const settings = JSON.parse(data.value) as GeneralSettingField[];
        // Update cache
        cachedSettings = settings;
        cachedCompanyId = companyId;
        return settings;
      } catch (e) {
        console.error('Error parsing general settings JSON:', e);
        return [];
      }
    }

    return [];
  } catch (error) {
    console.error('Error in fetchGeneralSettings:', error);
    return [];
  }
};

/**
 * Gets the value of a specific setting
 */
export const getSettingValue = (settings: GeneralSettingField[], name: string, defaultValue: string = ''): string => {
  const setting = settings.find(s => s.name === name);
  return setting ? setting.value : defaultValue;
};

/**
 * Gets the currency setting
 */
export const getCurrency = (settings: GeneralSettingField[]): string => {
  return getSettingValue(settings, 'currency', 'GBP');
};

/**
 * Gets the timezone setting
 */
export const getTimezone = (settings: GeneralSettingField[]): string => {
  return getSettingValue(settings, 'timezone', 'Europe/London');
};

/**
 * Clear the settings cache
 */
export const clearSettingsCache = (): void => {
  cachedSettings = null;
  cachedCompanyId = null;
};
