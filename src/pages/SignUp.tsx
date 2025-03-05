
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useSignUp, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  Building, 
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Add this new function to manually connect a user to a company
export async function connectUserToCompany(clerkUserId: string, companyId: string) {
  try {
    // First, check if the user exists in our mapping table
    const { data: userMappingData, error: userMappingError } = await supabase
      .from('clerk_user_mapping')
      .select('supabase_user_id')
      .eq('clerk_user_id', clerkUserId)
      .maybeSingle();
    
    if (userMappingError) {
      console.error("Error checking user mapping:", userMappingError);
      throw userMappingError;
    }
    
    let supabaseUserId;
    
    if (!userMappingData) {
      // If no mapping exists, create one with a UUID
      const newUUID = crypto.randomUUID();
      
      // Insert the mapping
      const { error: insertError } = await supabase
        .from('clerk_user_mapping')
        .insert({
          clerk_user_id: clerkUserId,
          supabase_user_id: newUUID,
        });
        
      if (insertError) {
        console.error("Error creating user mapping:", insertError);
        throw insertError;
      }
      
      supabaseUserId = newUUID;
    } else {
      supabaseUserId = userMappingData.supabase_user_id;
    }
    
    // Now create the user-company relationship
    const { error: userCompanyError } = await supabase
      .from('user_companies')
      .insert([{
        user_id: supabaseUserId,
        company_id: companyId,
        role: 'admin'
      }]);
      
    if (userCompanyError) {
      console.error("Error linking user to company:", userCompanyError);
      throw userCompanyError;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error connecting user to company:", error);
    return { success: false, error };
  }
}

export default function SignUpPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { signUp, setActive, isLoaded: isSignUpLoaded } = useSignUp();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  if (isLoaded && isSignedIn) {
    setIsRedirecting(true);
    navigate("/select-company");
    return null;
  }
  
  if (isRedirecting) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Redirecting to dashboard...</h1>
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    );
  }
  
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
    
    if (!firstName || !lastName || !email || !password || !companyName || !companySlug) {
      setError("Please fill out all fields");
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError("");
      
      if (!signUp) {
        throw new Error("Sign up not available");
      }
      
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
      
      const result = await signUp.create({
        emailAddress: email,
        password: password,
      });
      
      if (result.status === "complete" || result.status === "missing_requirements") {
        try {
          await result.update({
            firstName,
            lastName,
          });
        } catch (nameError) {
          console.error("Error setting user names:", nameError);
        }
      }
      
      await result.prepareEmailAddressVerification({ strategy: "email_code" });
      
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        
        // Generate a UUID for the user in our Supabase system
        const newSupabaseUUID = crypto.randomUUID();
        
        // Create mapping between Clerk user ID and our Supabase UUID
        const { error: mappingError } = await supabase
          .from('clerk_user_mapping')
          .insert({
            clerk_user_id: result.createdUserId,
            supabase_user_id: newSupabaseUUID,
            email: email
          });
          
        if (mappingError) {
          console.error("Error creating user mapping:", mappingError);
          toast({
            title: "Error setting up user",
            description: "Your account was created but we couldn't set up your user profile.",
            variant: "destructive",
          });
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
          toast({
            title: "Error creating company",
            description: "Your account was created but we couldn't create your company.",
            variant: "destructive",
          });
          navigate("/select-company");
          return;
        }
        
        // Connect user to company using the Supabase UUID
        const { error: userCompanyError } = await supabase
          .from('user_companies')
          .insert([{
            user_id: newSupabaseUUID,
            company_id: companyData.id,
            role: 'admin'
          }]);
          
        if (userCompanyError) {
          console.error("Error linking user to company:", userCompanyError);
          toast({
            title: "Error linking account",
            description: "Your company was created but we couldn't link it to your account.",
            variant: "destructive",
          });
        }
        
        localStorage.setItem('currentCompanySlug', companySlug);
        
        toast({
          title: "Account created successfully",
          description: `Your company "${companyName}" has been set up.`,
        });
        
        navigate("/select-company");
      } else {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.errors?.[0]?.message || "Error creating account. Please try again.");
      toast({
        title: "Sign up failed",
        description: err.errors?.[0]?.message || "Error creating account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isLoaded || !isSignUpLoaded) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }
  
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
          <h2 className="text-2xl font-bold text-center mb-6">Create your account</h2>
          
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
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name
                </Label>
                <div className="relative">
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="pl-3"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Password must not have been found in any data breaches.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
