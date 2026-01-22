import { Block, BlockType, CalloutType } from '../types';

/**
 * Convert Block[] to HTML for TipTap editor
 */
export function blocksToHtml(blocks: Block[]): string {
  if (!blocks || blocks.length === 0) {
    return '<p></p>';
  }

  return blocks.map(block => blockToHtml(block)).join('');
}

function blockToHtml(block: Block): string {
  const content = escapeHtml(block.content);
  
  switch (block.type) {
    case 'text':
      return `<p>${content || ''}</p>`;
    
    case 'heading1':
      return `<h1>${content || ''}</h1>`;
    
    case 'heading2':
      return `<h2>${content || ''}</h2>`;
    
    case 'heading3':
      return `<h3>${content || ''}</h3>`;
    
    case 'bulletList':
      return `<ul><li>${content || ''}</li></ul>`;
    
    case 'numberedList':
      return `<ol><li>${content || ''}</li></ol>`;
    
    case 'todo':
      const checked = block.properties?.checked ? 'checked="checked"' : '';
      return `<ul data-type="taskList"><li data-type="taskItem" data-checked="${block.properties?.checked || false}"><label><input type="checkbox" ${checked}><span></span></label><div>${content || ''}</div></li></ul>`;
    
    case 'callout':
      const calloutType = block.properties?.calloutType || 'info';
      return `<blockquote data-callout-type="${calloutType}">${content || ''}</blockquote>`;
    
    case 'divider':
      return '<hr>';
    
    case 'image':
      const imageUrl = block.properties?.imageUrl || '';
      const caption = block.properties?.imageCaption || '';
      if (imageUrl) {
        return `<figure><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
      }
      return '<p></p>';
    
    case 'table':
      if (block.table) {
        return tableToHtml(block.table);
      }
      return '<p></p>';
    
    default:
      return `<p>${content || ''}</p>`;
  }
}

function tableToHtml(table: { columns: any[]; rows: any[] }): string {
  if (!table.columns || !table.rows) return '<p></p>';
  
  let html = '<table><thead><tr>';
  for (const col of table.columns) {
    html += `<th>${escapeHtml(col.name || '')}</th>`;
  }
  html += '</tr></thead><tbody>';
  
  for (const row of table.rows) {
    html += '<tr>';
    for (const col of table.columns) {
      const value = row.data?.[col.id] ?? '';
      html += `<td>${escapeHtml(String(value))}</td>`;
    }
    html += '</tr>';
  }
  
  html += '</tbody></table>';
  return html;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convert HTML from TipTap back to Block[]
 * This is a simplified parser - for complex content, consider using the DOM parser
 */
export function htmlToBlocks(html: string): Block[] {
  if (!html || html === '<p></p>') {
    return [{ id: generateId(), type: 'text', content: '' }];
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: Block[] = [];

  function processNode(node: Node): void {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          blocks.push({
            id: generateId(),
            type: 'text',
            content: element.textContent || '',
          });
          break;

        case 'h1':
          blocks.push({
            id: generateId(),
            type: 'heading1',
            content: element.textContent || '',
          });
          break;

        case 'h2':
          blocks.push({
            id: generateId(),
            type: 'heading2',
            content: element.textContent || '',
          });
          break;

        case 'h3':
          blocks.push({
            id: generateId(),
            type: 'heading3',
            content: element.textContent || '',
          });
          break;

        case 'ul':
          if (element.getAttribute('data-type') === 'taskList') {
            // Task list
            const taskItems = element.querySelectorAll('li[data-type="taskItem"]');
            taskItems.forEach((li) => {
              const checked = li.getAttribute('data-checked') === 'true';
              const textContent = li.querySelector('div')?.textContent || li.textContent || '';
              blocks.push({
                id: generateId(),
                type: 'todo',
                content: textContent,
                properties: { checked },
              });
            });
          } else {
            // Bullet list
            const listItems = element.querySelectorAll(':scope > li');
            listItems.forEach((li) => {
              blocks.push({
                id: generateId(),
                type: 'bulletList',
                content: li.textContent || '',
              });
            });
          }
          break;

        case 'ol':
          const orderedItems = element.querySelectorAll(':scope > li');
          orderedItems.forEach((li) => {
            blocks.push({
              id: generateId(),
              type: 'numberedList',
              content: li.textContent || '',
            });
          });
          break;

        case 'blockquote':
          const calloutType = (element.getAttribute('data-callout-type') as CalloutType) || 'info';
          blocks.push({
            id: generateId(),
            type: 'callout',
            content: element.textContent || '',
            properties: { calloutType },
          });
          break;

        case 'hr':
          blocks.push({
            id: generateId(),
            type: 'divider',
            content: '',
          });
          break;

        case 'figure':
          const img = element.querySelector('img');
          const figcaption = element.querySelector('figcaption');
          if (img) {
            blocks.push({
              id: generateId(),
              type: 'image',
              content: '',
              properties: {
                imageUrl: img.getAttribute('src') || '',
                imageCaption: figcaption?.textContent || '',
              },
            });
          }
          break;

        case 'img':
          // Standalone image
          blocks.push({
            id: generateId(),
            type: 'image',
            content: '',
            properties: {
              imageUrl: element.getAttribute('src') || '',
              imageCaption: element.getAttribute('alt') || '',
            },
          });
          break;

        case 'table':
          // For now, just create a placeholder block
          // Full table parsing would require more complex logic
          blocks.push({
            id: generateId(),
            type: 'table',
            content: '',
            table: parseTableElement(element),
          });
          break;

        default:
          // Recursively process children for containers like div
          if (element.children.length > 0) {
            Array.from(element.children).forEach(processNode);
          } else if (element.textContent?.trim()) {
            blocks.push({
              id: generateId(),
              type: 'text',
              content: element.textContent,
            });
          }
          break;
      }
    }
  }

  // Process body children
  Array.from(doc.body.children).forEach(processNode);

  // Ensure at least one block
  if (blocks.length === 0) {
    blocks.push({ id: generateId(), type: 'text', content: '' });
  }

  return blocks;
}

function parseTableElement(tableEl: HTMLElement): any {
  const columns: any[] = [];
  const rows: any[] = [];

  // Parse headers
  const headers = tableEl.querySelectorAll('th');
  headers.forEach((th, index) => {
    columns.push({
      id: generateId(),
      name: th.textContent || `Column ${index + 1}`,
      type: 'text',
      width: 150,
    });
  });

  // If no headers, create default columns from first row
  if (columns.length === 0) {
    const firstRow = tableEl.querySelector('tr');
    const cells = firstRow?.querySelectorAll('td');
    cells?.forEach((_, index) => {
      columns.push({
        id: generateId(),
        name: `Column ${index + 1}`,
        type: 'text',
        width: 150,
      });
    });
  }

  // Parse rows
  const dataRows = tableEl.querySelectorAll('tbody tr, tr:not(:has(th))');
  dataRows.forEach((tr, rowIndex) => {
    const cells = tr.querySelectorAll('td');
    const rowData: Record<string, unknown> = {};
    
    cells.forEach((td, cellIndex) => {
      if (columns[cellIndex]) {
        rowData[columns[cellIndex].id] = td.textContent || '';
      }
    });

    rows.push({
      id: generateId(),
      data: rowData,
      order: rowIndex,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  const defaultViewId = generateId();

  return {
    id: generateId(),
    name: 'Table',
    columns,
    rows,
    views: [{
      id: defaultViewId,
      name: 'All',
      type: 'table',
      filters: [],
      sorts: [],
      groups: [],
      visibleColumns: columns.map((c: any) => c.id),
      config: {},
      isDefault: true,
    }],
    activeViewId: defaultViewId,
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
