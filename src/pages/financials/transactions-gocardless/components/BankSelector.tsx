
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DialogErrorDetails } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [country, setCountry] = useState('gb');

  useEffect(() => {
    fetchBanks(country);
  }, [country]);

  const fetchBanks = async (countryCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No active session found");
      }

      // Use the institutions edge function
      try {
        // Use the hardcoded URL to the edge function
        const apiUrl = `https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-gocardless-institutions?country=${countryCode}`;
        
        console.log('Attempting to fetch banks from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        // Get response text for better error reporting
        let responseText;
        try {
          responseText = await response.text();
          console.log('Raw banks API response:', responseText);
          
          // Parse the response if successful
          if (response.ok) {
            const data = JSON.parse(responseText);
            if (data.banks && data.banks.length > 0) {
              console.log('Successfully fetched banks from edge function');
              setBanks(data.banks);
              setIsLoading(false);
              return;
            } else {
              console.warn('No banks returned from edge function, using mock data as fallback');
              // Will fall through to use mock data below
            }
          } else {
            console.warn('Edge function returned non-OK status:', response.status);
            setError(`API Error (${response.status}): ${responseText}`);
            // Will fall through to use mock data below
          }
        } catch (textError) {
          console.error('Failed to get or parse response text:', textError);
          setError(`Failed to parse API response: ${String(textError)}`);
          // Will fall through to use mock data below
        }

        // If we reach here and there was an error, throw to use mock data
        if (response && !response.ok) {
          throw new Error(`API error (${response.status}): ${responseText || 'Unknown error'}`);
        }
      } catch (fetchError) {
        console.warn('Edge function request failed, using mock data:', fetchError);
        setError(`Failed to fetch live data: ${fetchError}`);
        // Will use mock data below
      }
      
      // Fallback to mock data if we get here
      console.log('Using mock bank data as fallback');
      const mockBanks = [
        { 
          id: "SANTANDER_RETAIL_GB", 
          name: "Santander UK", 
          logo: "https://cdn.nordigen.com/ais/SANTANDER_RETAIL_GB.png",
          countries: ["GB"],
          bic: "ABBYGB2LXXX"
        },
        { 
          id: "HSBC_RETAIL_GB", 
          name: "HSBC UK", 
          logo: "https://cdn.nordigen.com/ais/HSBC_RETAIL_GB.png",
          countries: ["GB"],
          bic: "HBUKGB4BXXX"
        },
        { 
          id: "LLOYDS_RETAIL_GB", 
          name: "Lloyds Bank", 
          logo: "https://cdn.nordigen.com/ais/LLOYDS_RETAIL_GB.png",
          countries: ["GB"],
          bic: "LOYDGB21XXX"
        },
        { 
          id: "BARCLAYS_RETAIL_GB", 
          name: "Barclays", 
          logo: "https://cdn.nordigen.com/ais/BARCLAYS_RETAIL_GB.png",
          countries: ["GB"],
          bic: "BARCGB22XXX"
        },
        { 
          id: "NATWEST_RETAIL_GB", 
          name: "NatWest", 
          logo: "https://cdn.nordigen.com/ais/NATWEST_RETAIL_GB.png",
          countries: ["GB"],
          bic: "NWBKGB2LXXX"
        }
      ];
      setBanks(mockBanks);
      
    } catch (err) {
      console.error('Failed to fetch banks:', err);
      setError(err instanceof Error ? err.message : String(err));
      
      // Fallback to mock data even on error
      const mockBanks = [
        { 
          id: "SANTANDER_RETAIL_GB", 
          name: "Santander UK", 
          logo: "https://cdn.nordigen.com/ais/SANTANDER_RETAIL_GB.png",
          countries: ["GB"],
          bic: "ABBYGB2LXXX"
        },
        { 
          id: "HSBC_RETAIL_GB", 
          name: "HSBC UK", 
          logo: "https://cdn.nordigen.com/ais/HSBC_RETAIL_GB.png",
          countries: ["GB"],
          bic: "HBUKGB4BXXX"
        },
        { 
          id: "LLOYDS_RETAIL_GB", 
          name: "Lloyds Bank", 
          logo: "https://cdn.nordigen.com/ais/LLOYDS_RETAIL_GB.png",
          countries: ["GB"],
          bic: "LOYDGB21XXX"
        },
        { 
          id: "BARCLAYS_RETAIL_GB", 
          name: "Barclays", 
          logo: "https://cdn.nordigen.com/ais/BARCLAYS_RETAIL_GB.png",
          countries: ["GB"],
          bic: "BARCGB22XXX"
        },
        { 
          id: "NATWEST_RETAIL_GB", 
          name: "NatWest", 
          logo: "https://cdn.nordigen.com/ais/NATWEST_RETAIL_GB.png",
          countries: ["GB"],
          bic: "NWBKGB2LXXX"
        }
      ];
      setBanks(mockBanks);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter banks based on search term
  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle country change
  const handleCountryChange = (value: string) => {
    setCountry(value);
  };

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Failed to load banks</h3>
        <DialogErrorDetails errorDetails={error} />
        <div className="flex justify-end">
          <button 
            onClick={() => fetchBanks(country)} 
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for your bank..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="w-32">
          <Select value={country} onValueChange={handleCountryChange}>
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gb">UK 🇬🇧</SelectItem>
              <SelectItem value="de">Germany 🇩🇪</SelectItem>
              <SelectItem value="fr">France 🇫🇷</SelectItem>
              <SelectItem value="es">Spain 🇪🇸</SelectItem>
              <SelectItem value="nl">Netherlands 🇳🇱</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2">
        {isLoading ? (
          // Loading skeleton
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center p-3 rounded-md border">
              <Skeleton className="h-8 w-8 rounded-md mr-3" />
              <Skeleton className="h-5 w-40" />
            </div>
          ))
        ) : filteredBanks.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            {searchTerm ? "No banks match your search" : "No banks available"}
          </div>
        ) : (
          filteredBanks.map(bank => (
            <button
              key={bank.id}
              onClick={() => onBankSelect(bank)}
              className={`flex items-center p-3 rounded-md border hover:bg-accent/50 transition-colors text-left ${
                selectedBank?.id === bank.id ? 'bg-accent border-primary' : ''
              }`}
            >
              {bank.logo ? (
                <img 
                  src={bank.logo} 
                  alt={`${bank.name} logo`}
                  className="h-8 w-8 object-contain mr-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/32x32/gray/white?text=B';
                  }}
                />
              ) : (
                <div className="h-8 w-8 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                  {bank.name.charAt(0)}
                </div>
              )}
              <span className="font-medium">{bank.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
