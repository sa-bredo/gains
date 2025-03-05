
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { useToast } from "@/hooks/use-toast";

type CompanyContextType = {
  currentCompany: Company | null;
  userCompanies: Company[];
  isLoadingCompanies: boolean;
  switchCompany: (companyId: string) => void;
  switchCompanyBySlug: (slug: string) => boolean;
  refreshCompanies: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const fetchUserCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      
      if (!isLoaded) {
        return; // Wait until Clerk is fully loaded
      }
      
      if (!isSignedIn || !userId) {
        setUserCompanies([]);
        setCurrentCompany(null);
        setIsLoadingCompanies(false);
        localStorage.removeItem('currentCompanyId');
        localStorage.removeItem('currentCompanySlug');
        return;
      }

      console.log("Fetching companies for user:", userId);

      // First, check if this user exists in our mapping table
      const { data: userMappingData, error: userMappingError } = await supabase
        .from('clerk_user_mapping')
        .select('supabase_user_id')
        .eq('clerk_user_id', userId)
        .maybeSingle();
      
      if (userMappingError) {
        console.error("Error checking user mapping:", userMappingError);
        throw userMappingError;
      }
      
      let supabaseUserId;
      
      if (!userMappingData) {
        // If no mapping exists, create one with a proper UUID
        const newUUID = crypto.randomUUID();
        
        // Insert the mapping directly
        const { error: insertError } = await supabase
          .from('clerk_user_mapping')
          .insert({
            clerk_user_id: userId,
            supabase_user_id: newUUID,
            email: user?.primaryEmailAddress?.emailAddress || null
          });
          
        if (insertError) {
          console.error("Error creating user mapping:", insertError);
          throw insertError;
        }
        
        supabaseUserId = newUUID;
      } else {
        supabaseUserId = userMappingData.supabase_user_id;
      }
      
      // First try to get companies via user_companies relationship
      const { data: userCompaniesData, error: userCompaniesError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', supabaseUserId);
        
      if (userCompaniesError) {
        console.error("Error fetching user companies:", userCompaniesError);
      }
      
      let companies: Company[] = [];
      
      // If we found company relationships
      if (userCompaniesData && userCompaniesData.length > 0) {
        console.log("Found user companies:", userCompaniesData);
        
        const companyIds = userCompaniesData.map(uc => uc.company_id);
        
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .in('id', companyIds);
          
        if (companiesError) {
          console.error("Error fetching companies by IDs:", companiesError);
          throw companiesError;
        }
        
        companies = companiesData || [];
      } 
      // Fallback to getting any company in the system if no relationship exists yet
      else {
        console.log("No user companies found, fetching all available companies");
        
        const { data: demoCompany, error: demoCompanyError } = await supabase
          .from('companies')
          .select('*')
          .limit(1)
          .single();
          
        if (demoCompanyError || !demoCompany) {
          console.log("No demo company found");
          setUserCompanies([]);
          setCurrentCompany(null);
          setIsLoadingCompanies(false);
          return;
        }
        
        console.log("Found demo company:", demoCompany.name);
        companies = [demoCompany];
      }
      
      setUserCompanies(companies);
      
      // If we have at least one company
      if (companies.length > 0) {
        // Try to restore the previously selected company from localStorage
        const savedCompanyId = localStorage.getItem('currentCompanyId');
        let selectedCompany = companies.find(c => c.id === savedCompanyId) || companies[0];
        
        console.log("Setting current company to:", selectedCompany.name);
        setCurrentCompany(selectedCompany);
        localStorage.setItem('currentCompanyId', selectedCompany.id);
        localStorage.setItem('currentCompanySlug', selectedCompany.slug || '');
      } else {
        setCurrentCompany(null);
      }
      
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: 'Error fetching companies',
        description: 'Could not load your company information.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        fetchUserCompanies();
      } else {
        setUserCompanies([]);
        setCurrentCompany(null);
        setIsLoadingCompanies(false);
        localStorage.removeItem('currentCompanyId');
        localStorage.removeItem('currentCompanySlug');
      }
    }
  }, [isLoaded, isSignedIn, userId]);

  const switchCompany = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('currentCompanyId', company.id);
      localStorage.setItem('currentCompanySlug', company.slug || '');
    }
  };

  const switchCompanyBySlug = (slug: string): boolean => {
    const company = userCompanies.find(c => c.slug === slug);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('currentCompanyId', company.id);
      localStorage.setItem('currentCompanySlug', company.slug);
      return true;
    }
    return false;
  };

  const refreshCompanies = async () => {
    await fetchUserCompanies();
  };

  return (
    <CompanyContext.Provider 
      value={{ 
        currentCompany, 
        userCompanies, 
        isLoadingCompanies,
        switchCompany,
        switchCompanyBySlug,
        refreshCompanies
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}
