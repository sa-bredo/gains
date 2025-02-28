
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface Bank {
  id: string;
  name: string;
  logo: string;
  countries: string[];
  bic: string | null;
}

interface BankSelectorProps {
  onBankSelect: (bank: Bank) => void;
  selectedBank: Bank | null;
}

export function BankSelector({ onBankSelect, selectedBank }: BankSelectorProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No session found:', sessionError);
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to view available banks."
        });
        return;
      }

      // Hardcoded full URL to the Supabase function
      const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-gocardless-institutions";
      console.log('Fetching banks from hardcoded URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Institutions fetched: ", data);
      setBanks(data.institutions || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch available banks. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBanks = searchQuery.trim() === '' 
    ? banks 
    : banks.filter(bank => 
        bank.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="py-4">
      <div className="relative mb-3">
        <Input
          type="text"
          placeholder="Search for your bank..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
        {searchQuery && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setSearchQuery("")}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="max-h-[300px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-4 space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center p-2 rounded-md animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredBanks.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            {searchQuery.trim() !== '' ? 
              "No banks found matching your search." : 
              "No banks available. Please try again later."}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredBanks.map((bank) => (
              <div
                key={bank.id}
                className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                  selectedBank?.id === bank.id ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => onBankSelect(bank)}
              >
                {bank.logo ? (
                  <img 
                    src={bank.logo} 
                    alt={`${bank.name} logo`} 
                    className="h-10 w-10 object-contain mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/gray/white?text=B';
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                    {bank.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium">{bank.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
