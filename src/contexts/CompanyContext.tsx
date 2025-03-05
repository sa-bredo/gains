
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

      // Fetch companies from the database
      const { data: companiesData, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
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
