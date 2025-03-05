
import { supabase } from "@/integrations/supabase/client";

export async function connectUserToCompany(clerkUserId: string, companyId: string) {
  try {
    // First, check if the user exists in our mapping table
    const { data: userMappingData, error: userMappingError } = await supabase
      .from('clerk_user_mapping')
      .select('supabase_user_id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    
    if (userMappingError) {
      console.error("Error checking user mapping:", userMappingError);
      throw userMappingError;
    }
    
    let supabaseUserId;
    
    if (!userMappingData) {
      // If no mapping exists, create one with a UUID
      const newUUID = crypto.randomUUID();
      
      // Insert the mapping
      const { error: insertError } = await supabase
        .from('clerk_user_mapping')
        .insert({
          clerk_user_id: clerkUserId,
          supabase_user_id: newUUID,
        });
        
      if (insertError) {
        console.error("Error creating user mapping:", insertError);
        throw insertError;
      }
      
      supabaseUserId = newUUID;
    } else {
      supabaseUserId = userMappingData.supabase_user_id;
    }
    
    // Now create the user-company relationship
    const { error: userCompanyError } = await supabase
      .from('user_companies')
      .insert([{
        user_id: supabaseUserId,
        company_id: companyId,
        role: 'admin'
      }]);
      
    if (userCompanyError) {
      console.error("Error linking user to company:", userCompanyError);
      throw userCompanyError;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error connecting user to company:", error);
    return { success: false, error };
  }
}
