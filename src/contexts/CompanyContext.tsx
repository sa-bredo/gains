
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

      // First, let's check if this user exists in our mapping table or if we need to create a mapping
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
        // If no mapping exists, we need to create one with a proper UUID
        const newUUID = crypto.randomUUID();
        const { error: insertError } = await supabase
          .from('clerk_user_mapping')
          .insert({
            clerk_user_id: userId,
            supabase_user_id: newUUID,
            email: user?.primaryEmailAddress?.emailAddress
          });
          
        if (insertError) {
          console.error("Error creating user mapping:", insertError);
          throw insertError;
        }
        
        supabaseUserId = newUUID;
      } else {
        supabaseUserId = userMappingData.supabase_user_id;
      }
      
      // Now we can use the proper UUID to query user_companies
      const { data: userCompanyData, error: userCompanyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', supabaseUserId);
      
      if (userCompanyError) {
        throw userCompanyError;
      }
      
      // If no company associations, clear everything
      if (!userCompanyData || userCompanyData.length === 0) {
        console.log("No company associations found for user");
        
        // For demo purposes, let's provide a default company if none exists
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
        
        // Create association with the demo company
        const { error: associationError } = await supabase
          .from('user_companies')
          .insert({
            user_id: supabaseUserId,
            company_id: demoCompany.id
          });
          
        if (associationError) {
          console.error("Error creating company association:", associationError);
          setUserCompanies([]);
          setCurrentCompany(null);
          setIsLoadingCompanies(false);
          return;
        }
        
        setUserCompanies([demoCompany]);
        setCurrentCompany(demoCompany);
        localStorage.setItem('currentCompanyId', demoCompany.id);
        localStorage.setItem('currentCompanySlug', demoCompany.slug || '');
        setIsLoadingCompanies(false);
        return;
      }
      
      // Extract the company IDs from the user_companies data
      const companyIds = userCompanyData.map(uc => uc.company_id);
      
      // Fetch companies that the user has access to
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds)
        .order('name');
      
      if (companiesError) {
        throw companiesError;
      }
      
      console.log("Companies data:", companiesData);
      
      setUserCompanies(companiesData || []);
      
      // If we have no companies, clear current company
      if (!companiesData || companiesData.length === 0) {
        setCurrentCompany(null);
        localStorage.removeItem('currentCompanyId');
        localStorage.removeItem('currentCompanySlug');
        setIsLoadingCompanies(false);
        return;
      }
      
      // Try to restore current company from localStorage
      const storedCompanyId = localStorage.getItem('currentCompanyId');
      const storedCompanySlug = localStorage.getItem('currentCompanySlug');
      
      // If we have a stored company ID, try to find it
      if (storedCompanyId) {
        const storedCompany = companiesData.find(c => c.id === storedCompanyId);
        if (storedCompany) {
          setCurrentCompany(storedCompany);
          setIsLoadingCompanies(false);
          return;
        }
      }
      
      // If we have a stored company slug, try to find it
      if (storedCompanySlug) {
        const companyBySlug = companiesData.find(c => c.slug === storedCompanySlug);
        if (companyBySlug) {
          setCurrentCompany(companyBySlug);
          localStorage.setItem('currentCompanyId', companyBySlug.id);
          setIsLoadingCompanies(false);
          return;
        }
      }
      
      // If we couldn't find the stored company, use the first one
      setCurrentCompany(companiesData[0]);
      localStorage.setItem('currentCompanyId', companiesData[0].id);
      localStorage.setItem('currentCompanySlug', companiesData[0].slug || '');
      
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
