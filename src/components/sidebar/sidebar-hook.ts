
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export function useSidebar() {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
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
