
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { useAuth } from "@clerk/clerk-react";

export default function LoginPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setIsRedirecting(true);
      navigate("/select-company");
    }
  }, [isSignedIn, isLoaded, navigate]);
  
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
  
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img 
            src="https://images.squarespace-cdn.com/content/v1/66dfede09053481feac2a1aa/1725951490906-BM3OIHGXHDGQNEZRAU74/SA_whitegb.png?format=1500w" 
            alt="Studio Anatomy Logo" 
            className="h-8 w-auto"
          />
        </div>
        <SignIn redirectUrl="/select-company" />
      </div>
    </div>
  );
}
