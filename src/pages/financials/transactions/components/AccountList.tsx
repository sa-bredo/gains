
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bank, AlertCircle, CheckCircle2 } from "lucide-react";

type Account = {
  id: string;
  name: string;
  institution_name: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type AccountListProps = {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
  isLoading: boolean;
};

export function AccountList({ 
  accounts, 
  selectedAccountId, 
  onSelectAccount, 
  isLoading 
}: AccountListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bank className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4 rounded-md border p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[80%]" />
                  <Skeleton className="h-4 w-[60%]" />
                </div>
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Bank className="h-8 w-8 text-gray-400" />
            <h3 className="font-semibold">No accounts connected</h3>
            <p className="text-sm text-muted-foreground">
              Add a bank account to view your transactions.
            </p>
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              className={`flex items-center space-x-4 rounded-md border p-4 cursor-pointer transition-colors ${
                selectedAccountId === account.id ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onSelectAccount(account.id)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bank className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">{account.name}</p>
                <p className="text-sm text-muted-foreground">{account.institution_name}</p>
              </div>
              <Badge variant="outline" className={`${getStatusColor(account.status)}`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(account.status)}
                  {account.status}
                </span>
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
