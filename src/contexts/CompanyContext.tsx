
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

      // Fetch companies the user belongs to through the employees table
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('company_id')
        .eq('auth_id', userId);

      if (employeeError) {
        throw employeeError;
      }

      if (!employeeData || employeeData.length === 0) {
        setUserCompanies([]);
        setCurrentCompany(null);
        return;
      }

      const companyIds = employeeData.map(emp => emp.company_id);

      // Fetch company details
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);

      if (companiesError) {
        throw companiesError;
      }

      setUserCompanies(companiesData || []);
      
      // If we have companies but no current company selected, select the first one
      if (companiesData && companiesData.length > 0 && !currentCompany) {
        setCurrentCompany(companiesData[0]);
        // Store the selected company in localStorage
        localStorage.setItem('currentCompanyId', companiesData[0].id);
      } else if (companiesData && companiesData.length > 0) {
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
