
import { useIsMobile } from "@/hooks/use-mobile";

export function useSidebar() {
  const isMobile = useIsMobile();
  return { isMobile };
}
