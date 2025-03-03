
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
        return;
      }

      console.log("Fetching companies for user:", userId);

      // Fetch companies from the database
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      console.log("Companies data:", companiesData);
      
      // Ensure all company records have a slug property
      const companiesWithSlug = companiesData?.map(company => {
        if (!company.slug) {
          // Generate a slug if it doesn't exist
          company.slug = company.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }
        return company as Company;
      }) || [];
      
      setUserCompanies(companiesWithSlug);
      
      // If we have companies but no current company selected, select the first one
      if (companiesWithSlug.length > 0 && !currentCompany) {
        setCurrentCompany(companiesWithSlug[0]);
        // Store the selected company in localStorage
        localStorage.setItem('currentCompanyId', companiesWithSlug[0].id);
        localStorage.setItem('currentCompanySlug', companiesWithSlug[0].slug || '');
      } else if (companiesWithSlug.length > 0) {
        // Check if the stored company is still valid
        const storedCompanyId = localStorage.getItem('currentCompanyId');
        const storedCompanySlug = localStorage.getItem('currentCompanySlug');
        
        if (storedCompanyId) {
          const storedCompany = companiesWithSlug.find(c => c.id === storedCompanyId);
          if (storedCompany) {
            setCurrentCompany(storedCompany);
          } else if (storedCompanySlug) {
            // Try to find by slug if ID doesn't match
            const companyBySlug = companiesWithSlug.find(c => c.slug === storedCompanySlug);
            if (companyBySlug) {
              setCurrentCompany(companyBySlug);
              localStorage.setItem('currentCompanyId', companyBySlug.id);
            } else {
              setCurrentCompany(companiesWithSlug[0]);
              localStorage.setItem('currentCompanyId', companiesWithSlug[0].id);
              localStorage.setItem('currentCompanySlug', companiesWithSlug[0].slug || '');
            }
          } else {
            setCurrentCompany(companiesWithSlug[0]);
            localStorage.setItem('currentCompanyId', companiesWithSlug[0].id);
            localStorage.setItem('currentCompanySlug', companiesWithSlug[0].slug || '');
          }
        }
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
    // Only try to fetch companies when Clerk is fully loaded and user is signed in
    if (isLoaded) {
      if (isSignedIn) {
        fetchUserCompanies();
      } else {
        setUserCompanies([]);
        setCurrentCompany(null);
        setIsLoadingCompanies(false);
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
