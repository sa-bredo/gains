
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DialogErrorDetails } from '@/components/ui/dialog';

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

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error("No active session found");
        }

        // Use the hardcoded URL to the edge function
        const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-gocardless-banks?country=gb";
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error fetching banks:', errorText);
          setError(errorText);
          throw new Error(`Failed to fetch banks: ${response.status}`);
        }

        const data = await response.json();
        setBanks(data.banks || []);
      } catch (err) {
        console.error('Failed to fetch banks:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanks();
  }, []);

  // Filter banks based on search term
  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Failed to load banks</h3>
        <DialogErrorDetails errorDetails={error} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
