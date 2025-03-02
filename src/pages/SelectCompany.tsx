
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

export default function SelectCompany() {
  const { userCompanies, switchCompany, isLoadingCompanies, currentCompany } = useCompany();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || "/dashboard";
  
  useEffect(() => {
    // If there's only one company, automatically select it and redirect
    if (userCompanies.length === 1 && !currentCompany) {
      switchCompany(userCompanies[0].id);
      navigate(from, { replace: true });
    }
    
    // If a company is already selected, redirect to the intended destination
    if (currentCompany) {
      navigate(from, { replace: true });
    }
  }, [userCompanies, currentCompany, navigate, from]);
  
  if (isLoadingCompanies) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              {company.address && (
                <CardDescription>{company.address}</CardDescription>
              )}
            </CardHeader>
            <CardFooter className="pt-2">
              <Button className="w-full" onClick={() => {
                switchCompany(company.id);
                navigate(from, { replace: true });
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
