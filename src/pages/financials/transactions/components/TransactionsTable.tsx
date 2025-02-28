
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { 
  ArrowUpDown, 
  Search,
  Calendar,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

type Transaction = {
  id: string;
  account_id: string;
  transaction_id: string;
  amount: number;
  date: string;
  description: string;
  merchant_name: string | null;
  category: string | null;
  pending: boolean;
  account: {
    name: string;
    institution_name: string;
  };
};

type TransactionsTableProps = {
  accountId: string | null;
  dateFilter: {
    startDate: Date | null;
    endDate: Date | null;
  };
  onDateFilterChange: (filter: { startDate: Date | null; endDate: Date | null }) => void;
};

export function TransactionsTable({ accountId, dateFilter, onDateFilterChange }: TransactionsTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const { toast } = useToast();

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.getValue("date"));
        return <span>{format(date, "MMM d, yyyy")}</span>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        const pending = row.original.pending;
        
        return (
          <div className="flex flex-col">
            <span className="font-medium">{description}</span>
            {pending && (
              <Badge variant="outline" className="mt-1 max-w-fit bg-yellow-100 text-yellow-800">
                Pending
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "merchant_name",
      header: "Merchant",
      cell: ({ row }) => {
        const merchant = row.getValue("merchant_name") as string | null;
        return <span>{merchant || "-"}</span>;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.getValue("category") as string | null;
        return <span>{category || "-"}</span>;
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="justify-end"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"));
        // Format the amount as a dollar amount
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);

        return (
          <div className="text-right font-medium">
            <span className={amount < 0 ? "text-green-600" : "text-red-600"}>
              {formatted}
            </span>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    if (accountId) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setIsLoading(false);
    }
  }, [accountId, dateFilter, pagination.pageIndex, pagination.pageSize]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const searchParams = new URLSearchParams();
      
      if (accountId) {
        searchParams.append('accountId', accountId);
      }
      
      if (dateFilter.startDate) {
        searchParams.append('startDate', format(dateFilter.startDate, 'yyyy-MM-dd'));
      }
      
      if (dateFilter.endDate) {
        searchParams.append('endDate', format(dateFilter.endDate, 'yyyy-MM-dd'));
      }
      
      searchParams.append('page', String(pagination.pageIndex + 1));
      searchParams.append('pageSize', String(pagination.pageSize));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-transactions?${searchParams.toString()}`, 
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          }
        }
      );

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
        setTotalTransactions(data.total || 0);
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

  const handleResetDateFilter = () => {
    onDateFilterChange({
      startDate: null,
      endDate: null,
    });
  };

  const table = useReactTable({
    data: transactions,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    pageCount: Math.ceil(totalTransactions / pagination.pageSize),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle>Transactions</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("description")?.setFilterValue(event.target.value)}
                className="w-full sm:w-[200px] pl-8"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  {dateFilter.startDate || dateFilter.endDate ? (
                    <span>
                      {dateFilter.startDate ? format(dateFilter.startDate, "MMM d, yyyy") : "Start"} 
                      {" - "}
                      {dateFilter.endDate ? format(dateFilter.endDate, "MMM d, yyyy") : "End"}
                    </span>
                  ) : (
                    <span>Date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">Start date</h4>
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter.startDate || undefined}
                      onSelect={(date) => onDateFilterChange({
                        ...dateFilter,
                        startDate: date,
                      })}
                      disabled={(date) => dateFilter.endDate ? date > dateFilter.endDate : false}
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">End date</h4>
                    <CalendarComponent
                      mode="single"
                      selected={dateFilter.endDate || undefined}
                      onSelect={(date) => onDateFilterChange({
                        ...dateFilter,
                        endDate: date,
                      })}
                      disabled={(date) => dateFilter.startDate ? date < dateFilter.startDate : false}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={handleResetDateFilter}>
                      <X className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: columns.length }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {accountId ? "No transactions found." : "Select an account to view transactions."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing{" "}
            <strong>
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                totalTransactions
              )}
            </strong>{" "}
            of <strong>{totalTransactions}</strong> transactions
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
