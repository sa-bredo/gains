// Knowledge Base Type Definitions

export type ColumnType =
  | 'text'
  | 'number'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'checkbox'
  | 'url'
  | 'email'
  | 'person'
  | 'formula';

export type ViewType = 'table' | 'board' | 'calendar' | 'list';

export type CalloutType = 'info' | 'warning' | 'success' | 'error';

export type BlockType =
  | 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'table'
  | 'callout'
  | 'divider'
  | 'todo'
  | 'bulletList'
  | 'numberedList';

export interface SelectOption {
  id: string;
  label: string;
  color: string;
}

export interface Column {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
  options?: SelectOption[];
  formula?: string;
}

export interface TableRow {
  id: string;
  data: Record<string, unknown>;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TableView {
  id: string;
  name: string;
  type: ViewType;
  filters: Filter[];
  sorts: Sort[];
  groups: Group[];
  visibleColumns: string[];
  config: Record<string, unknown>;
  isDefault: boolean;
}

export interface Filter {
  id: string;
  columnId: string;
  operator: string;
  value: unknown;
}

export interface Sort {
  id: string;
  columnId: string;
  direction: 'asc' | 'desc';
}

export interface Group {
  id: string;
  columnId: string;
}

export interface InlineTable {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  rows: TableRow[];
  views: TableView[];
  activeViewId: string;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: {
    level?: 1 | 2 | 3;
    calloutType?: CalloutType;
    checked?: boolean;
    tableId?: string;
    align?: string;
  };
  table?: InlineTable;
}

export interface Document {
  id: string;
  title: string;
  icon?: string;
  coverImage?: string;
  blocks: Block[];
  workspaceId: string;
  parentId?: string;
  isTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  documents: Document[];
}

// Color presets for select options
export const SELECT_COLORS = [
  { name: 'Gray', value: 'hsl(220, 9%, 46%)' },
  { name: 'Brown', value: 'hsl(25, 50%, 45%)' },
  { name: 'Orange', value: 'hsl(32, 95%, 50%)' },
  { name: 'Yellow', value: 'hsl(45, 93%, 47%)' },
  { name: 'Green', value: 'hsl(142, 71%, 45%)' },
  { name: 'Blue', value: 'hsl(210, 98%, 52%)' },
  { name: 'Purple', value: 'hsl(280, 67%, 60%)' },
  { name: 'Pink', value: 'hsl(340, 82%, 59%)' },
  { name: 'Red', value: 'hsl(0, 72%, 51%)' },
];

// Block type configurations
export const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'Type' },
  { type: 'heading1', label: 'Heading 1', icon: 'Heading1' },
  { type: 'heading2', label: 'Heading 2', icon: 'Heading2' },
  { type: 'heading3', label: 'Heading 3', icon: 'Heading3' },
  { type: 'bulletList', label: 'Bullet List', icon: 'List' },
  { type: 'numberedList', label: 'Numbered List', icon: 'ListOrdered' },
  { type: 'todo', label: 'To-do', icon: 'CheckSquare' },
  { type: 'table', label: 'Table', icon: 'Table' },
  { type: 'callout', label: 'Callout', icon: 'MessageSquare' },
  { type: 'divider', label: 'Divider', icon: 'Minus' },
];

// Column type configurations
export const COLUMN_TYPES: { type: ColumnType; label: string; icon: string }[] = [
  { type: 'text', label: 'Text', icon: 'Type' },
  { type: 'number', label: 'Number', icon: 'Hash' },
  { type: 'select', label: 'Select', icon: 'ChevronDown' },
  { type: 'multiselect', label: 'Multi-select', icon: 'Tags' },
  { type: 'date', label: 'Date', icon: 'Calendar' },
  { type: 'checkbox', label: 'Checkbox', icon: 'CheckSquare' },
  { type: 'url', label: 'URL', icon: 'Link' },
  { type: 'email', label: 'Email', icon: 'Mail' },
  { type: 'person', label: 'Person', icon: 'User' },
  { type: 'formula', label: 'Formula', icon: 'FunctionSquare' },
];

// Utility functions
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

export const createDefaultBlock = (type: BlockType = 'text'): Block => ({
  id: generateId(),
  type,
  content: '',
  properties: type === 'callout' ? { calloutType: 'info' } : undefined,
});

export const createDefaultDocument = (title: string = 'Untitled'): Document => ({
  id: generateId(),
  title,
  icon: '📄',
  blocks: [createDefaultBlock('text')],
  workspaceId: 'default',
  isTemplate: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user',
});

export const createDefaultTable = (name: string = 'Table'): InlineTable => {
  const defaultColumns: Column[] = [
    { id: generateId(), name: 'Name', type: 'text', width: 200 },
    { id: generateId(), name: 'Tags', type: 'multiselect', width: 150, options: [] },
    { id: generateId(), name: 'Status', type: 'select', width: 120, options: [
      { id: generateId(), label: 'Not Started', color: SELECT_COLORS[0].value },
      { id: generateId(), label: 'In Progress', color: SELECT_COLORS[5].value },
      { id: generateId(), label: 'Done', color: SELECT_COLORS[4].value },
    ]},
  ];

  const defaultViewId = generateId();

  return {
    id: generateId(),
    name,
    columns: defaultColumns,
    rows: [],
    views: [{
      id: defaultViewId,
      name: 'All',
      type: 'table',
      filters: [],
      sorts: [],
      groups: [],
      visibleColumns: defaultColumns.map(c => c.id),
      config: {},
      isDefault: true,
    }],
    activeViewId: defaultViewId,
  };
};
