
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <Heart className="h-12 w-12 text-primary animate-pulse-subtle" />
        </div>
        <h1 className="text-4xl font-bold mb-2 slide-in">404</h1>
        <p className="text-xl text-muted-foreground mb-8 slide-in animation-delay-200">
          The page you're looking for doesn't exist
        </p>
        <Button asChild size="lg" className="slide-in animation-delay-400">
          <a href="/" className="rounded-full">
            Return to Home
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
