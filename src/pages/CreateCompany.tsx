
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { connectUserToCompany } from "@/utils/connect-specific-user";

export default function CreateCompanyPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setCompanyName(name);
    
    const slug = name.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
      
    setCompanySlug(slug);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!companyName || !companySlug) {
      setError("Please fill out all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      const { data: existingCompany, error: slugCheckError } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', companySlug.toLowerCase())
        .maybeSingle();
        
      if (existingCompany) {
        setError(`Company slug "${companySlug}" is already taken. Please choose another.`);
        setIsSubmitting(false);
        return;
      }
      
      // Create company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert([{ 
          name: companyName, 
          slug: companySlug.toLowerCase(),
        }])
        .select()
        .single();
        
      if (companyError) {
        console.error("Error creating company:", companyError);
        throw companyError;
      }
      
      // Connect user to company
      if (user && user.id) {
        const { success, error } = await connectUserToCompany(user.id, companyData.id);
        
        if (!success) {
          console.error("Error connecting user to company:", error);
          toast({
            title: "Error linking account",
            description: "Your company was created but we couldn't link it to your account.",
            variant: "destructive",
          });
        }
      }
      
      localStorage.setItem('currentCompanySlug', companySlug);
      
      toast({
        title: "Company created successfully",
        description: `Your company "${companyName}" has been set up.`,
      });
      
      navigate("/select-company");
    } catch (err: any) {
      console.error("Company creation error:", err);
      setError(err.message || "Error creating company. Please try again.");
      toast({
        title: "Company creation failed",
        description: err.message || "Error creating company. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="/gains-logo.svg" 
            alt="Gains Logo" 
            className="h-36 w-auto"
          />
        </div>
        
        <div className="bg-card p-8 rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold text-center mb-6">Create your company</h2>
          
          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="text-sm font-medium">
                Company Name
              </Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Your Company Name"
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="companySlug" className="text-sm font-medium">
                Company URL Slug
              </Label>
              <div className="relative">
                <Input
                  id="companySlug"
                  type="text"
                  placeholder="your-company"
                  value={companySlug}
                  onChange={(e) => setCompanySlug(e.target.value.toLowerCase().replace(/[^\w-]/g, ''))}
                  className="pl-3"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                This will be used in your company URL: app.domain.com/{companySlug}
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating company...
                </>
              ) : (
                "Create company"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
