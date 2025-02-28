
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PlaidLink } from "./components/PlaidLink";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function FinancialsTransactions() {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isPlaidLinkOpen, setIsPlaidLinkOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState("last30days");
  const { toast } = useToast();

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAccounts();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactions(selectedAccountId);
    }
  }, [selectedAccountId, dateFilter]);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Correctly format the API URL with the Supabase URL
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-accounts`;
      console.log('Fetching accounts from:', apiUrl);

      // Real API call to get accounts
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Error fetching accounts:', data.error);
        toast({
          title: "Error fetching accounts",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setAccounts(data.accounts || []);
        if (data.accounts && data.accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(data.accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (accountId) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Calculate date filter
      let startDate;
      const today = new Date();
      const endDate = today.toISOString().split('T')[0];
      
      switch (dateFilter) {
        case 'last30days':
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
          break;
        case 'thisMonth':
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          break;
        case 'thisYear':
          startDate = new Date(today.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(today);
          startDate.setDate(today.getDate() - 30);
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];

      // Correctly format the API URL
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-transactions`;
      console.log('Fetching transactions from:', apiUrl);

      // Real API call to get transactions
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          accountId,
          startDate: startDateStr,
          endDate: endDate,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Error fetching transactions:', data.error);
        toast({
          title: "Error fetching transactions",
          description: data.error,
          variant: "destructive",
        });
      } else {
        setTransactions(data.transactions || []);
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

  const handleAccountSelect = (accountId) => {
    setSelectedAccountId(accountId);
  };

  const handleAddBankAccount = () => {
    setIsPlaidLinkOpen(true);
  };

  const handlePlaidSuccess = async (publicToken, metadata) => {
    try {
      setIsLoading(true);
      console.log('Plaid success, exchanging public token...', metadata);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-public-token`;
      console.log('Exchanging public token at:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ publicToken, metadata }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        console.error('Error linking account:', data.error);
        toast({
          title: "Error linking account",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account linked successfully",
          description: `${data.account.name} is now connected.`,
        });
        await fetchAccounts();
      }
    } catch (error) {
      console.error('Error linking account:', error);
      toast({
        title: "Error",
        description: "Failed to link account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlaidLinkOpen(false);
      setIsLoading(false);
    }
  };

  const handlePlaidExit = () => {
    setIsPlaidLinkOpen(false);
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
  };

  // Format currency
  const formatCurrency = (amount) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    return formatter.format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (!isAuthenticated) {
    return <ProtectedRoute><div>Loading...</div></ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="bg-background">
            <motion.header 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex h-16 shrink-0 items-center border-b border-border/50 px-4 transition-all ease-in-out"
            >
              <div className="flex items-center gap-2">
                <SidebarTrigger className="mr-2" />
                <Separator orientation="vertical" className="h-4" />
                <span className="font-medium">Bank Transactions</span>
              </div>
            </motion.header>
            
            <motion.div 
              className="p-6"
              initial="hidden"
              animate="visible"
              variants={slideUp}
            >
              <div className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">Bank Account Transactions</h2>
                      <p className="text-muted-foreground">
                        View and manage all your financial transactions in one place.
                      </p>
                    </div>
                    <Button onClick={handleAddBankAccount} className="h-9">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Add Bank Account
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="bg-card p-4 rounded-lg border shadow-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div>
                          <label htmlFor="account-select" className="text-sm font-medium text-muted-foreground mb-1 block">
                            Select Account
                          </label>
                          <Select
                            value={selectedAccountId || ""}
                            onValueChange={handleAccountSelect}
                            disabled={isLoading || accounts.length === 0}
                          >
                            <SelectTrigger className="w-[220px]">
                              <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  <div className="flex flex-col">
                                    <span>{account.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {account.institution_name}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                              {accounts.length === 0 && (
                                <SelectItem value="none" disabled>
                                  No accounts available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Filter by date</div>
                          <div className="flex gap-2">
                            <Button 
                              variant={dateFilter === "last30days" ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleDateFilterChange("last30days")}
                            >
                              Last 30 days
                            </Button>
                            <Button 
                              variant={dateFilter === "thisMonth" ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleDateFilterChange("thisMonth")}
                            >
                              This month
                            </Button>
                            <Button 
                              variant={dateFilter === "thisYear" ? "default" : "outline"} 
                              size="sm"
                              onClick={() => handleDateFilterChange("thisYear")}
                            >
                              This year
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Button variant="outline" size="sm">
                          <span className="mr-2">Export</span>
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-muted p-2 text-sm grid grid-cols-12 gap-2">
                        <div className="col-span-3 font-medium">Date</div>
                        <div className="col-span-5 font-medium">Description</div>
                        <div className="col-span-2 font-medium">Category</div>
                        <div className="col-span-2 font-medium text-right">Amount</div>
                      </div>
                      
                      <div className="divide-y">
                        {isLoading ? (
                          Array(5).fill(0).map((_, i) => (
                            <div key={i} className="p-2 grid grid-cols-12 gap-2 animate-pulse">
                              <div className="col-span-3 h-4 bg-muted rounded"></div>
                              <div className="col-span-5 h-4 bg-muted rounded"></div>
                              <div className="col-span-2 h-4 bg-muted rounded"></div>
                              <div className="col-span-2 h-4 bg-muted rounded"></div>
                            </div>
                          ))
                        ) : !selectedAccountId ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <p>Select an account to view transactions.</p>
                          </div>
                        ) : transactions.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <p>No transactions to display.</p>
                            <p className="text-sm">Transactions will appear here once synced.</p>
                          </div>
                        ) : (
                          transactions.map((transaction) => (
                            <div key={transaction.id} className="p-2 grid grid-cols-12 gap-2 hover:bg-muted/50">
                              <div className="col-span-3">{formatDate(transaction.date)}</div>
                              <div className="col-span-5">
                                {transaction.description}
                                {transaction.pending && (
                                  <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 rounded px-1 py-0.5">
                                    Pending
                                  </span>
                                )}
                              </div>
                              <div className="col-span-2">{transaction.category || "Uncategorized"}</div>
                              <div className={`col-span-2 text-right ${transaction.amount < 0 ? "text-red-600" : ""}`}>
                                {formatCurrency(transaction.amount)}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </SidebarInset>
        </div>
        <PlaidLink 
          isOpen={isPlaidLinkOpen}
          onSuccess={handlePlaidSuccess}
          onExit={handlePlaidExit}
        />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
