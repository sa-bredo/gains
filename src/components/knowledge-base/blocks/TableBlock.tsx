import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, MoreHorizontal } from 'lucide-react';
import { InlineTable, TableRow, generateId, SELECT_COLORS } from '../types';
import { CellRenderer } from './CellRenderer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TableBlockProps {
  table: InlineTable;
  onUpdate: (table: InlineTable) => void;
}

export const TableBlock: React.FC<TableBlockProps> = ({ table, onUpdate }) => {
  const [editingCell, setEditingCell] = useState<{ rowId: string; colId: string } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const addRow = () => {
    const newRow: TableRow = {
      id: generateId(),
      data: {},
      order: table.rows.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    onUpdate({
      ...table,
      rows: [...table.rows, newRow],
    });
  };

  const deleteRow = (rowId: string) => {
    onUpdate({
      ...table,
      rows: table.rows.filter((r) => r.id !== rowId),
    });
  };

  const updateCell = (rowId: string, colId: string, value: unknown) => {
    onUpdate({
      ...table,
      rows: table.rows.map((row) =>
        row.id === rowId
          ? { ...row, data: { ...row.data, [colId]: value }, updatedAt: new Date() }
          : row
      ),
    });
  };

  const addColumn = () => {
    const newColumn = {
      id: generateId(),
      name: `Column ${table.columns.length + 1}`,
      type: 'text' as const,
      width: 150,
    };
    onUpdate({
      ...table,
      columns: [...table.columns, newColumn],
      views: table.views.map((v) => ({
        ...v,
        visibleColumns: [...v.visibleColumns, newColumn.id],
      })),
    });
  };

  const deleteColumn = (colId: string) => {
    onUpdate({
      ...table,
      columns: table.columns.filter((c) => c.id !== colId),
      rows: table.rows.map((row) => {
        const { [colId]: _, ...rest } = row.data;
        return { ...row, data: rest };
      }),
      views: table.views.map((v) => ({
        ...v,
        visibleColumns: v.visibleColumns.filter((id) => id !== colId),
      })),
    });
  };

  const renameColumn = (colId: string, name: string) => {
    onUpdate({
      ...table,
      columns: table.columns.map((c) => (c.id === colId ? { ...c, name } : c)),
    });
  };

  return (
    <div className="border border-kb-table-border rounded-lg overflow-hidden animate-fade-in">
      {/* Table Header */}
      <div className="flex bg-kb-table-header border-b border-kb-table-border">
        <div className="w-10 shrink-0" />
        {table.columns.map((column) => (
          <div
            key={column.id}
            className="flex items-center px-2 py-2 border-r border-kb-table-border font-medium text-sm text-foreground"
            style={{ width: column.width || 150, minWidth: 100 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:text-primary kb-transition truncate">
                  <span className="truncate">{column.name}</span>
                  <MoreHorizontal size={14} className="shrink-0 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => {
                  const newName = prompt('Column name:', column.name);
                  if (newName) renameColumn(column.id, newName);
                }}>
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => deleteColumn(column.id)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
        <button
          onClick={addColumn}
          className="flex items-center justify-center w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-kb-block-hover kb-transition"
          title="Add column"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Table Body */}
      <div className="bg-card">
        {table.rows.map((row) => (
          <div
            key={row.id}
            className={`flex border-b border-kb-table-border last:border-b-0 group ${
              hoveredRow === row.id ? 'bg-kb-table-row-hover' : ''
            }`}
            onMouseEnter={() => setHoveredRow(row.id)}
            onMouseLeave={() => setHoveredRow(null)}
          >
            <div className="w-10 shrink-0 flex items-center justify-center gap-1">
              <GripVertical
                size={14}
                className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 cursor-grab"
              />
            </div>
            {table.columns.map((column) => (
              <div
                key={column.id}
                className="border-r border-kb-table-border"
                style={{ width: column.width || 150, minWidth: 100 }}
              >
                <CellRenderer
                  column={column}
                  value={row.data[column.id]}
                  isEditing={editingCell?.rowId === row.id && editingCell?.colId === column.id}
                  onChange={(value) => updateCell(row.id, column.id, value)}
                  onStartEdit={() => setEditingCell({ rowId: row.id, colId: column.id })}
                  onEndEdit={() => setEditingCell(null)}
                />
              </div>
            ))}
            <div className="w-10 shrink-0 flex items-center justify-center">
              <button
                onClick={() => deleteRow(row.id)}
                className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 kb-transition"
                title="Delete row"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Add Row Button */}
        <button
          onClick={addRow}
          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-kb-block-hover kb-transition"
        >
          <Plus size={16} />
          New row
        </button>
      </div>
    </div>
  );
};
