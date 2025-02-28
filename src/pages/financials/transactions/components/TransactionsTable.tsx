
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  category?: string[];
  pending: boolean;
}

interface TransactionsTableProps {
  accountId: string | null;
  dateFilter: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onDateFilterChange: (filter: { startDate: Date | null; endDate: Date | null }) => void;
}

export function TransactionsTable({
  accountId,
  dateFilter,
  onDateFilterChange,
}: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (accountId) {
      fetchTransactions();
    }
  }, [accountId, dateFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          startDate: dateFilter.startDate ? format(dateFilter.startDate, 'yyyy-MM-dd') : undefined,
          endDate: dateFilter.endDate ? format(dateFilter.endDate, 'yyyy-MM-dd') : undefined,
        }),
      });

      const { transactions, error } = await response.json();
      
      if (error) {
        console.error('Error fetching transactions:', error);
        toast({
          title: "Error fetching transactions",
          description: error,
          variant: "destructive",
        });
      } else {
        setTransactions(transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Error",
        description: "Failed to fetch transactions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const setDateRangeFilter = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    onDateFilterChange({
      startDate,
      endDate,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Transactions</CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRangeFilter(7)}
          >
            7 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRangeFilter(30)}
          >
            30 days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDateRangeFilter(90)}
          >
            90 days
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!accountId ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Select an account to view transactions</p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : transactions.length > 0 ? (
          <ScrollArea className="h-[500px]">
            <div className="space-y-1">
              <div className="grid grid-cols-12 gap-2 py-2 px-3 text-xs font-medium text-muted-foreground bg-muted/50 rounded-t-md">
                <div className="col-span-2">Date</div>
                <div className="col-span-6">Description</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Amount</div>
              </div>
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="grid grid-cols-12 gap-2 py-3 px-3 border-b hover:bg-muted/10"
                >
                  <div className="col-span-2 text-sm">
                    {format(new Date(transaction.date), 'MMM d, yyyy')}
                  </div>
                  <div className="col-span-6">
                    <div className="font-medium">{transaction.name}</div>
                    {transaction.pending && (
                      <div className="text-xs text-muted-foreground">Pending</div>
                    )}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {transaction.category ? transaction.category[0] : "Other"}
                  </div>
                  <div className={`col-span-2 text-right font-medium ${transaction.amount < 0 ? 'text-red-500' : ''}`}>
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-2">No transactions found</p>
            <p className="text-xs text-muted-foreground">
              Try selecting a different date range or account
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
