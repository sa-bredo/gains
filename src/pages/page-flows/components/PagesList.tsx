
import React from 'react';
import { Button } from '@/components/ui/button';
import { Page, PageType } from '@/pages/page-flows/types';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrashIcon, 
  FilePlus2Icon,
  ClipboardIcon,
  RocketIcon,
  FileTextIcon
} from 'lucide-react';

interface PagesListProps {
  pages: Page[];
  onSelectPage: (page: Page) => void;
  onAddPage: (type: PageType) => void;
  onReorderPage: (pageId: string, direction: 'up' | 'down') => void;
  onDeletePage: (pageId: string) => void;
  selectedPageId?: string;
}

const getPageTypeIcon = (pageType: PageType) => {
  switch (pageType) {
    case 'content':
      return <FileTextIcon className="h-4 w-4" />;
    case 'action':
      return <ClipboardIcon className="h-4 w-4" />;
    case 'automation':
      return <RocketIcon className="h-4 w-4" />;
    case 'document':
      return <FilePlus2Icon className="h-4 w-4" />;
    default:
      return <FileTextIcon className="h-4 w-4" />;
  }
};

export function PagesList({ 
  pages, 
  onSelectPage, 
  onAddPage, 
  onReorderPage, 
  onDeletePage,
  selectedPageId 
}: PagesListProps) {
  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Pages</h3>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAddPage('content')}
          >
            <FileTextIcon className="h-4 w-4 mr-2" />
            Add Content
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAddPage('action')}
          >
            <ClipboardIcon className="h-4 w-4 mr-2" />
            Add Action
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAddPage('automation')}
          >
            <RocketIcon className="h-4 w-4 mr-2" />
            Add Automation
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onAddPage('document')}
          >
            <FilePlus2Icon className="h-4 w-4 mr-2" />
            Add Document
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        {pages.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No pages yet. Add your first page using the buttons above.
          </div>
        ) : (
          <ul className="divide-y">
            {pages.map((page, index) => (
              <li 
                key={page.id} 
                className={`p-3 flex items-center justify-between hover:bg-muted/40 cursor-pointer ${
                  selectedPageId === page.id ? 'bg-muted' : ''
                }`}
                onClick={() => onSelectPage(page)}
              >
                <div className="flex items-center space-x-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="flex items-center">
                    <span className="mr-2">{getPageTypeIcon(page.page_type)}</span>
                    <span className="font-medium">{page.title}</span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderPage(page.id, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <ArrowUpIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderPage(page.id, 'down');
                    }}
                    disabled={index === pages.length - 1}
                  >
                    <ArrowDownIcon className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(page.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
