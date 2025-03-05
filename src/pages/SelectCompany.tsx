
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useAuth } from "@clerk/clerk-react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SelectCompany() {
  const { userCompanies, switchCompany, isLoadingCompanies, currentCompany, refreshCompanies } = useCompany();
  const { user } = useUser();
  const { isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
    if (userCompanies.length === 1 && !isLoadingCompanies) {
      console.log("Only one company found, auto-selecting", userCompanies[0].name);
      switchCompany(userCompanies[0].id);
      toast.success(`Logged in to ${userCompanies[0].name}`);
      navigate("/dashboard", { replace: true });
      return;
    }
    
    // If we already have a current company selected, go to dashboard
    if (currentCompany && !isLoadingCompanies) {
      console.log("Company already selected, navigating to dashboard", currentCompany.name);
      navigate("/dashboard", { replace: true });
      return;
    }
  }, [userCompanies, currentCompany, navigate, switchCompany, isLoaded, isSignedIn, from, isLoadingCompanies]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshCompanies();
      toast.success("Company list refreshed");
    } catch (error) {
      console.error("Error refreshing companies:", error);
      toast.error("Failed to refresh companies");
    } finally {
      setIsRefreshing(false);
    }
  };
  
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
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading your companies...</h2>
          <p className="text-muted-foreground">This may take a moment.</p>
        </div>
      </div>
    );
  }
  
  if (userCompanies.length === 0) {
    return (
      <div className="h-screen w-full flex items-center justify-center p-4">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>No Companies Available</CardTitle>
            <CardDescription>
              You don't have access to any companies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <AlertTitle>System Notice</AlertTitle>
              <AlertDescription>
                We're working on setting up your account. This usually happens when you first log in.
                Please try refreshing in a moment.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mb-4">
              If this persists, please contact your administrator to get access to a company, or create a new one.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              variant="default" 
              className="w-full" 
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Companies
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/login", { replace: true })}
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-center">Select a Company</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Welcome, {user?.firstName || 'User'}. Please select a company to continue:
        </p>
        
        <div className="grid gap-4 w-full">
          {userCompanies.map((company) => (
            <Card 
              key={company.id} 
              className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
            >
              <div className="flex flex-col md:flex-row items-center">
                <CardHeader className="pb-2 flex-1">
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
                <CardFooter className="pt-2 md:pr-4">
                  <Button
                    onClick={() => {
                      switchCompany(company.id);
                      toast.success(`Switched to ${company.name}`);
                      navigate("/dashboard", { replace: true });
                    }}
                  >
                    Select
                  </Button>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Companies
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
