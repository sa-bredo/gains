
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SelectCompany() {
  const { userCompanies, switchCompany, isLoadingCompanies, currentCompany, refreshCompanies } = useCompany();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";
  
  // Refresh companies when the component mounts
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshCompanies();
    }
  }, [isLoaded, isSignedIn, refreshCompanies]);
  
  useEffect(() => {
    if (!isLoaded) return;
    
    if (isLoaded && !isSignedIn) {
      navigate("/login", { replace: true });
      return;
    }
    
    // If there's only one company, automatically select it and redirect
    if (userCompanies.length === 1) {
      console.log("Only one company found, auto-selecting", userCompanies[0].name);
      switchCompany(userCompanies[0].id);
      toast.success(`Logged in to ${userCompanies[0].name}`);
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // If we already have a current company selected, go to dashboard
    if (currentCompany) {
      console.log("Company already selected, navigating to dashboard", currentCompany.name);
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [userCompanies, currentCompany, navigate, switchCompany, isLoaded, isSignedIn, from]);
  
  if (!isLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading authentication...</h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Loading your companies...</span>
      </div>
    );
  }
  
  if (userCompanies.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>No Companies Available</CardTitle>
            <CardDescription>
              You don't have access to any companies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator to get access to a company, or create a new one.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Select a Company</h1>
      <p className="text-muted-foreground mb-8">
        Welcome, {user?.firstName || 'User'}. Please select a company to continue:
      </p>
      
      <div className="grid gap-4 w-full max-w-2xl">
        {userCompanies.map((company) => (
          <Card key={company.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="pb-2">
              <CardTitle>{company.name}</CardTitle>
              {company.logo_url && (
                <CardDescription>
                  <img 
                    src={company.logo_url} 
                    alt={`${company.name} logo`} 
                    className="h-10 object-contain" 
                  />
                </CardDescription>
              )}
            </CardHeader>
            <CardFooter className="pt-2">
              <Button className="w-full" onClick={() => {
                switchCompany(company.id);
                toast.success(`Switched to ${company.name}`);
                navigate("/dashboard", { replace: true });
              }}>
                Select
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
