
import React, { useState, useEffect } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, RefreshCw, ExternalLink } from "lucide-react";
import { PlaidLink } from "../financials/transactions/components/PlaidLink";

interface Account {
  id: string;
  name: string;
  institution_name: string;
  created_at: string;
}

const PlaidPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
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
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch accounts from Supabase
      const { data, error } = await supabase
        .from('plaid_accounts')
        .select('id, name, institution_name, created_at');
      
      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast({
        variant: "destructive",
        title: "Failed to load accounts",
        description: "There was an error loading your connected bank accounts."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAccounts();
    setIsRefreshing(false);
    toast({
      title: "Accounts refreshed",
      description: "Your connected accounts have been refreshed."
    });
  };

  const handlePlaidSuccess = async (publicToken: string, metadata: any) => {
    try {
      setIsLinkOpen(false);
      
      // Call the exchange-public-token function
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "You must be logged in to connect a bank account."
        });
        return;
      }
      
      const response = await fetch("https://exatcpxfenndpkozdnje.supabase.co/functions/v1/exchange-public-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          publicToken,
          metadata
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success!",
          description: `Account ${result.account.name} connected successfully.`
        });
        
        // Refresh the accounts list
        fetchAccounts();
      } else {
        throw new Error(result.message || "Failed to connect account");
      }
    } catch (error) {
      console.error("Error connecting account:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect your bank account. Please try again."
      });
    }
  };

  const handlePlaidExit = () => {
    setIsLinkOpen(false);
  };

  return (
    <ProtectedRoute>
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
              <span className="font-medium">Plaid Integration</span>
            </div>
          </motion.header>
          
          <motion.div 
            className="p-6"
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            <div className="flex flex-col gap-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Bank Connections</h1>
                <p className="text-muted-foreground mt-2">
                  Connect your UK bank accounts securely using Plaid to import transactions and account information.
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <Button 
                  onClick={() => setIsLinkOpen(true)} 
                  size="sm"
                  className="gap-2"
                >
                  <Plus size={16} />
                  Connect Bank Account
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
                  Refresh
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : accounts.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="pt-6 text-center">
                    <div className="flex flex-col items-center gap-4 py-8">
                      <div className="rounded-full bg-muted p-4">
                        <ExternalLink className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">No connected accounts</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Connect your UK bank accounts to start importing transactions and financial data.
                        </p>
                      </div>
                      <Button onClick={() => setIsLinkOpen(true)}>Connect Bank Account</Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {accounts.map((account) => (
                    <Card key={account.id}>
                      <CardHeader>
                        <CardTitle>{account.name}</CardTitle>
                        <CardDescription>{account.institution_name}</CardDescription>
                      </CardHeader>
                      <CardFooter className="border-t pt-4 flex justify-between">
                        <small className="text-muted-foreground">
                          Connected {new Date(account.created_at).toLocaleDateString()}
                        </small>
                        <Button variant="outline" size="sm" asChild>
                          <a href="/financials/transactions">View Transactions</a>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </SidebarInset>
      </div>
      
      <PlaidLink 
        onSuccess={handlePlaidSuccess}
        onExit={handlePlaidExit}
        isOpen={isLinkOpen}
      />
    </ProtectedRoute>
  );
};

export default PlaidPage;
