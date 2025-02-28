
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { PlusIcon, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GoCardlessLink } from "./components/GoCardlessLink";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

export default function FinancialsTransactionsGoCardless() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isGoCardlessLinkOpen, setIsGoCardlessLinkOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dateFilter, setDateFilter] = useState("last30days");
  const [apiError, setApiError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
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
    // Check for callback parameters from GoCardless
    const searchParams = new URLSearchParams(location.search);
    const status = searchParams.get('status');
    const ref = searchParams.get('ref');
    
    if (status) {
      console.log(`GoCardless callback detected with status: ${status}`);
      
      if (status === 'success') {
        toast({
          title: "Bank Connection Successful",
          description: "Your bank has been successfully connected. Loading your accounts...",
          variant: "default",
        });
        
        // Remove the query parameters from the URL
        navigate('/financials/transactions-gocardless', { replace: true });
        
        // Refresh accounts after a short delay
        setTimeout(() => {
          fetchAccounts();
        }, 1000);
      } else if (status === 'error' || status === 'failure') {
        const errorMessage = searchParams.get('error') || 'An error occurred during bank connection';
        
        toast({
          title: "Bank Connection Failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Remove the query parameters from the URL
        navigate('/financials/transactions-gocardless', { replace: true });
      }
    }
  }, [location]);

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
      setRefreshing(true);
      setApiError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Use a hardcoded full URL
      const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-gocardless-accounts";
      console.log('Fetching accounts from hardcoded URL:', apiUrl);

      // API call to get accounts
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      let responseText;
      try {
        responseText = await response.text();
        console.log('Raw API response:', responseText);
      } catch (textError) {
        console.error('Failed to get response text:', textError);
        responseText = 'Failed to get response text';
      }

      if (!response.ok) {
        console.error('API response error:', response.status, responseText);
        setApiError(`Accounts API Error (${response.status}): ${responseText}`);
        throw new Error(`API error (${response.status}): ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError, 'Raw:', responseText);
        setApiError(`Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}, Raw: ${responseText}`);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (data.error) {
        console.error('Error fetching accounts:', data.error);
        setApiError(`API returned error: ${data.error}`);
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
      setApiError(`Account fetch error: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Error",
        description: "Failed to fetch accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
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

      // Use a hardcoded full URL
      const apiUrl = "https://exatcpxfenndpkozdnje.supabase.co/functions/v1/get-gocardless-transactions";
      console.log('Fetching transactions from hardcoded URL:', apiUrl);
      console.log('Request payload:', { accountId, startDate: startDateStr, endDate });

      // API call to get transactions
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

      let responseText;
      try {
        responseText = await response.text();
        console.log('Raw API response:', responseText);
      } catch (textError) {
        console.error('Failed to get response text:', textError);
        responseText = 'Failed to get response text';
      }

      if (!response.ok) {
        console.error('API response error:', response.status, responseText);
        setApiError(`Transactions API Error (${response.status}): ${responseText}`);
        throw new Error(`API error (${response.status}): ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError, 'Raw:', responseText);
        setApiError(`Parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}, Raw: ${responseText}`);
        throw new Error('Invalid response from server. Please try again.');
      }
      
      if (data.error) {
        console.error('Error fetching transactions:', data.error);
        setApiError(`API returned error: ${data.error}`);
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

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
  };

  const handleAddBankAccount = () => {
    setIsGoCardlessLinkOpen(true);
  };

  const handleRefreshAccounts = () => {
    fetchAccounts();
  };

  const handleGoCardlessSuccess = async (redirectUrl, metadata) => {
    // Open the redirectUrl in a new window/tab
    window.open(redirectUrl, '_blank');
    
    toast({
      title: "Bank connection initiated",
      description: "Please complete the connection process in the new window.",
      variant: "default",
    });

    // Close the dialog
    setIsGoCardlessLinkOpen(false);
    
    // We could poll for account status or let the user manually refresh
    setTimeout(() => {
      toast({
        title: "Refresh accounts",
        description: "After completing the bank connection, click refresh to see your accounts.",
        variant: "default",
        action: (
          <Button onClick={fetchAccounts} variant="outline" size="sm">
            Refresh
          </Button>
        ),
      });
    }, 5000);
  };

  const handleGoCardlessExit = () => {
    setIsGoCardlessLinkOpen(false);
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
                <span className="font-medium">GoCardless Bank Transactions</span>
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
                      <h2 className="text-2xl font-bold tracking-tight">GoCardless Account Transactions</h2>
                      <p className="text-muted-foreground">
                        View and manage your financial transactions using GoCardless open banking.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleRefreshAccounts} 
                        variant="outline" 
                        className="h-9"
                        disabled={refreshing}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button onClick={handleAddBankAccount} className="h-9">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Connect Bank Account
                      </Button>
                    </div>
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
        <GoCardlessLink 
          isOpen={isGoCardlessLinkOpen}
          onSuccess={handleGoCardlessSuccess}
          onExit={handleGoCardlessExit}
        />
      </SidebarProvider>
    </ProtectedRoute>
  );
}
