
import { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TransactionsTable } from "./components/TransactionsTable";
import { AccountList } from "./components/AccountList";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { PlaidLink } from "./components/PlaidLink";
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
                    <AccountList 
                      accounts={accounts}
                      selectedAccountId={selectedAccountId}
                      onSelectAccount={handleAccountSelect}
                      isLoading={isLoading}
                    />
                  </div>
                  <div className="col-span-1 md:col-span-3">
                    <TransactionsTable 
                      accountId={selectedAccountId}
                      dateFilter={dateFilter}
                      onDateFilterChange={handleDateFilterChange}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </SidebarInset>
        </div>
        {isPlaidLinkOpen && (
          <PlaidLink 
            onSuccess={handlePlaidSuccess}
            onExit={handlePlaidExit}
          />
        )}
      </SidebarProvider>
    </ProtectedRoute>
  );
}
