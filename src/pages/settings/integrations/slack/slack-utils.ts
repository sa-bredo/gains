
import { supabase } from '@/integrations/supabase/client';

/**
 * Initiate Slack OAuth process
 */
export const initiateSlackOAuth = async (companyId: string): Promise<{ 
  url?: string; 
  error?: string 
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('initiate-slack-oauth', {
      body: { company_id: companyId },
    });
    
    if (error) {
      console.error('Error initiating Slack OAuth:', error);
      return { error: error.message };
    }
    
    if (!data?.url) {
      return { error: 'No OAuth URL returned from server' };
    }
    
    return { url: data.url };
  } catch (err) {
    console.error('Error in initiateSlackOAuth:', err);
    return { 
      error: err instanceof Error ? err.message : 'Unknown error occurred' 
    };
  }
};
