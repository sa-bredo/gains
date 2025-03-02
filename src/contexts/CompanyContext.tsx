
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/types/company";
import { useToast } from "@/hooks/use-toast";

type CompanyContextType = {
  currentCompany: Company | null;
  userCompanies: Company[];
  isLoadingCompanies: boolean;
  switchCompany: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
};

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

// Mock companies data for development until we create the companies table
const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Acme Inc",
    logo_url: null,
    address: "123 Main St, New York, NY",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "TechCorp",
    logo_url: null,
    address: "456 Tech Ave, San Francisco, CA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { userId, isSignedIn } = useAuth();
  const { toast } = useToast();
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [userCompanies, setUserCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  const fetchUserCompanies = async () => {
    try {
      setIsLoadingCompanies(true);
      
      if (!isSignedIn || !userId) {
        setUserCompanies([]);
        setCurrentCompany(null);
        return;
      }

      // TODO: Replace with actual API call once companies table is created
      // For now, use mock data
      const companiesData = mockCompanies;
      
      setUserCompanies(companiesData);
      
      // If we have companies but no current company selected, select the first one
      if (companiesData.length > 0 && !currentCompany) {
        setCurrentCompany(companiesData[0]);
        // Store the selected company in localStorage
        localStorage.setItem('currentCompanyId', companiesData[0].id);
      } else if (companiesData.length > 0) {
        // Check if the stored company is still valid
        const storedCompanyId = localStorage.getItem('currentCompanyId');
        if (storedCompanyId) {
          const storedCompany = companiesData.find(c => c.id === storedCompanyId);
          if (storedCompany) {
            setCurrentCompany(storedCompany);
          } else {
            setCurrentCompany(companiesData[0]);
            localStorage.setItem('currentCompanyId', companiesData[0].id);
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
    if (isSignedIn) {
      fetchUserCompanies();
    } else {
      setUserCompanies([]);
      setCurrentCompany(null);
      setIsLoadingCompanies(false);
    }
  }, [isSignedIn, userId]);

  const switchCompany = (companyId: string) => {
    const company = userCompanies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      localStorage.setItem('currentCompanyId', company.id);
    }
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
