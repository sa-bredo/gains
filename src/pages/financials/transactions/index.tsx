
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

export default function FinancialsTransactions() {
  const { isAuthenticated } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [isPlaidLinkOpen, setIsPlaidLinkOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
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

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        }
      });

      const { accounts, error } = await response.json();
      
      if (error) {
        console.error('Error fetching accounts:', error);
        toast({
          title: "Error fetching accounts",
          description: error,
          variant: "destructive",
        });
      } else {
        setAccounts(accounts || []);
        if (accounts && accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(accounts[0].id);
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

  const handleAccountSelect = (accountId) => {
    setSelectedAccountId(accountId);
  };

  const handleAddBankAccount = () => {
    setIsPlaidLinkOpen(true);
  };

  const handlePlaidSuccess = async (publicToken, metadata) => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/exchange-public-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ publicToken, metadata }),
      });

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
                
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                  <div className="col-span-1">
                    <div className="bg-card p-4 rounded-lg border shadow-sm">
                      <h3 className="font-semibold mb-2">Your Accounts</h3>
                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-pulse h-6 bg-muted rounded mb-2"></div>
                          <div className="animate-pulse h-6 bg-muted rounded mb-2 w-3/4"></div>
                        </div>
                      ) : accounts.length > 0 ? (
                        <ul className="space-y-2">
                          {accounts.map((account) => (
                            <li 
                              key={account.id}
                              className={`p-2 rounded cursor-pointer transition-colors ${
                                selectedAccountId === account.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                              }`}
                              onClick={() => handleAccountSelect(account.id)}
                            >
                              <div className="font-medium">{account.name}</div>
                              <div className="text-sm text-muted-foreground">{account.mask ? `••••${account.mask}` : ''}</div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          <p>No accounts linked yet.</p>
                          <p className="text-sm">Click "Add Bank Account" to get started.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <div className="bg-card p-4 rounded-lg border shadow-sm">
                      <h3 className="font-semibold mb-4">Transactions</h3>
                      {!selectedAccountId ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>Select an account to view transactions</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-muted-foreground">Filter by date</div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">Last 30 days</Button>
                                <Button variant="outline" size="sm">This month</Button>
                                <Button variant="outline" size="sm">This year</Button>
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
                              ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                  <p>No transactions to display.</p>
                                  <p className="text-sm">Transactions will appear here once synced.</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </SidebarInset>
        </div>
        {isPlaidLinkOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Connect Your Bank Account</h2>
              <p className="text-muted-foreground mb-6">
                You'll be redirected to securely connect your bank account. Your credentials are never stored on our servers.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handlePlaidExit}>Cancel</Button>
                <Button onClick={() => {
                  toast({
                    title: "Plaid Link",
                    description: "Plaid Link would open here to connect your bank account.",
                  });
                }}>
                  Continue
                </Button>
              </div>
            </div>
          </div>
        )}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
