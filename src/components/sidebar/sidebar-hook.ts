
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function useSidebar() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Close sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return { 
    isMobile, 
    isSidebarOpen, 
    setIsSidebarOpen, 
    toggleSidebar 
  };
}
