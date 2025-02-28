
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface Account {
  id: string;
  name: string;
  mask?: string;
  type?: string;
  subtype?: string;
  balances?: {
    current?: number;
    available?: number;
  };
  institution?: {
    name?: string;
    logo?: string;
  };
}

interface AccountListProps {
  accounts: Account[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
  isLoading: boolean;
}

export function AccountList({ accounts, selectedAccountId, onSelectAccount, isLoading }: AccountListProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Your Accounts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : accounts.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`flex items-center justify-between rounded-md p-2 cursor-pointer transition-colors ${
                    selectedAccountId === account.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => onSelectAccount(account.id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{account.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {account.mask ? `••••${account.mask}` : ""}
                      {account.type && account.subtype
                        ? ` • ${account.type}/${account.subtype}`
                        : ""}
                    </span>
                  </div>
                  {account.balances?.current !== undefined && (
                    <div className="text-right">
                      <div className="font-medium">
                        ${account.balances.current.toFixed(2)}
                      </div>
                      {account.balances.available !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          ${account.balances.available.toFixed(2)} available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-2">No accounts linked</p>
            <p className="text-xs text-muted-foreground">
              Link a bank account to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
