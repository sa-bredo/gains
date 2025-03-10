
import React from 'react';
import { Page } from '../types';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { 
  MoreHorizontal, 
  GripVertical, 
  Edit,
  Trash
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface PagesListProps {
  pages: Page[];
  selectedPageId?: string;
  onSelectPage: (page: Page) => void;
  onReorderPages: (reorderedPages: Page[]) => void;
  onUpdatePage: (pageId: string, updateData: Partial<Page>) => Promise<void>;
  flowId: string;
}

export const PagesList: React.FC<PagesListProps> = ({
  pages,
  selectedPageId,
  onSelectPage,
  onReorderPages,
  onUpdatePage,
  flowId,
}) => {
  // Sort pages by order_index
  const sortedPages = [...pages].sort((a, b) => a.order_index - b.order_index);

  const handleReorder = (draggedIndex: number, targetIndex: number) => {
    if (draggedIndex === targetIndex) return;
    
    const result = [...sortedPages];
    const [removed] = result.splice(draggedIndex, 1);
    result.splice(targetIndex, 0, removed);
    
    // Update order_index values
    const reordered = result.map((page, index) => ({
      ...page,
      order_index: index,
    }));
    
    onReorderPages(reordered);
  };

  return (
    <div className="space-y-2">
      {sortedPages.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          <p className="text-muted-foreground">No pages added yet.</p>
        </div>
      ) : (
        sortedPages.map((page, index) => (
          <Card
            key={page.id}
            className={`cursor-pointer ${
              selectedPageId === page.id ? 'border-primary' : ''
            }`}
            onClick={() => onSelectPage(page)}
          >
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <span className="font-medium">{page.title}</span>
              </div>
              <div className="flex items-center">
                <span className="text-xs px-2 py-1 rounded-full bg-muted">
                  {page.page_type}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
