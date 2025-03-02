
import React from 'react';
import { ConfigItem } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConfigTableProps {
  configItems: ConfigItem[];
  isLoading: boolean;
  onEdit: (config: ConfigItem) => void;
  onDelete: (config: ConfigItem) => void;
}

export function ConfigTable({
  configItems,
  isLoading,
  onEdit,
  onDelete,
}: ConfigTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">Key</TableHead>
            <TableHead className="text-left">Display Name</TableHead>
            <TableHead className="text-left">Value</TableHead>
            <TableHead className="text-right w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : configItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No configuration items found. Add a new item to get started.
              </TableCell>
            </TableRow>
          ) : (
            configItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-left">{item.key}</TableCell>
                <TableCell className="text-left">{item.display_name}</TableCell>
                <TableCell className="text-left">
                  <div className="truncate max-w-[250px]">{item.value}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit configuration</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete configuration</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
