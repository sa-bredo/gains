
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
import { TinkLink } from "./components/TinkLink";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function FinancialsTransactionsTink() {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isTinkLinkOpen, setIsTinkLinkOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState("last30days");
  const [apiError, setApiError] = useState<string | null>(null);
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
      setApiError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // In a real implementation, this would fetch from a different endpoint for Tink accounts
      const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-tink-accounts";
      console.log('Fetching Tink accounts from:', apiUrl);

      // For now, we'll simulate no accounts available since this is a new implementation
      // In a real implementation, we would make the API call to fetch accounts
      setAccounts([]);
      
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setApiError(`Account fetch error: ${error instanceof Error ? error.message : String(error)}`);
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
      setApiError(null);
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

      // In a real implementation, this would fetch from a different endpoint for Tink transactions
      const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-tink-transactions";
      console.log('Fetching Tink transactions from:', apiUrl);
      console.log('Request payload:', { accountId, startDate: startDateStr, endDate });

      // For now, we'll simulate no transactions available
      // In a real implementation, we would make the API call to fetch transactions
      setTransactions([]);
      
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setApiError(`Transaction fetch error: ${error instanceof Error ? error.message : String(error)}`);
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
    setIsTinkLinkOpen(true);
  };
  
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
  };

  const handleTinkSuccess = async (authorizationCode, state) => {
    try {
      setIsLoading(true);
      setApiError(null);
      console.log('Tink success, exchanging authorization code...', authorizationCode, state);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // In a real implementation, this would call a different endpoint to handle Tink authorization
      const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/exchange-tink-code";
      console.log('Exchanging Tink authorization code at:', apiUrl);

      // Simulate successful connection for this demo
      toast({
        title: "Account linked successfully",
        description: "Your bank account is now connected via Tink Open Banking.",
        variant: "success",
      });
      
      // In a real implementation, we would make the API call and then refresh accounts
      await fetchAccounts();
      
    } catch (error) {
      console.error('Error linking account:', error);
      setApiError(`Account linking error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Error",
        description: "Failed to link account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTinkLinkOpen(false);
      setIsLoading(false);
    }
  };

  const handleTinkExit = () => {
    setIsTinkLinkOpen(false);
  };

  // Format currency
  const formatCurrency = (amount) => {
    const formatter = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    });
    return formatter.format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
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
                <span className="font-medium">Bank Transactions (Tink Open Banking)</span>
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
                      <h2 className="text-2xl font-bold tracking-tight">Bank Account Transactions via Tink</h2>
                      <p className="text-muted-foreground">
                        View and manage all your financial transactions using Tink Open Banking.
                      </p>
                    </div>
                    <Button onClick={handleAddBankAccount} className="h-9">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      Connect UK Bank
                    </Button>
                  </div>
                </div>
                
                <Separator />

                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-800">
                    <p className="font-bold mb-1">Error Details:</p>
                    <pre className="whitespace-pre-wrap font-mono overflow-x-auto text-xs">{apiError}</pre>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => setApiError(null)}
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
                
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
                            <p className="text-sm">Connect a bank account via Tink to view your transactions.</p>
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
        <TinkLink 
          isOpen={isTinkLinkOpen}
          onSuccess={handleTinkSuccess}
          onExit={handleTinkExit}
        />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
