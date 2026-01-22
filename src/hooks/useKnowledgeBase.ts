import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Block, Document, BlockType, CalloutType, InlineTable } from '@/components/knowledge-base/types';
import { Tables, TablesInsert, TablesUpdate, Json } from '@/integrations/supabase/types';

type DbDocument = Tables<'kh_documents'>;
type DbBlock = Tables<'kh_blocks'>;

// Convert database document to app Document type
function dbToDocument(dbDoc: DbDocument, blocks: Block[]): Document {
  return {
    id: dbDoc.id,
    title: dbDoc.title,
    icon: dbDoc.icon ?? undefined,
    coverImage: dbDoc.cover_image ?? undefined,
    blocks,
    workspaceId: dbDoc.workspace_id,
    parentId: dbDoc.parent_id ?? undefined,
    isTemplate: dbDoc.is_template,
    createdAt: new Date(dbDoc.created_at),
    updatedAt: new Date(dbDoc.updated_at),
    createdBy: dbDoc.created_by,
  };
}

// Convert database block to app Block type
function dbToBlock(dbBlock: DbBlock & { editor_id?: string | null }): Block {
  const properties = dbBlock.properties as Record<string, unknown> | null;
  return {
    // Use editor_id for stable TipTap mapping, fallback to uuid
    id: dbBlock.editor_id || dbBlock.id,
    type: dbBlock.type as BlockType,
    content: dbBlock.content,
    properties: properties ? {
      level: properties.level as 1 | 2 | 3 | undefined,
      calloutType: properties.calloutType as CalloutType | undefined,
      checked: properties.checked as boolean | undefined,
      tableId: properties.tableId as string | undefined,
      align: properties.align as string | undefined,
      imageUrl: properties.imageUrl as string | undefined,
      imageCaption: properties.imageCaption as string | undefined,
    } : undefined,
    table: dbBlock.table_data as unknown as InlineTable | undefined,
  };
}

// Convert app Block to database format
function blockToDb(block: Block, documentId: string, order: number): TablesInsert<'kh_blocks'> & { editor_id: string } {
  return {
    document_id: documentId,
    type: block.type,
    content: block.content,
    properties: block.properties as Json,
    block_order: order,
    table_data: block.table as unknown as Json,
    // Store stable editor_id for TipTap mapping
    editor_id: block.id,
  };
}

export function useDocuments() {
  return useQuery({
    queryKey: ['kh_documents'],
    queryFn: async (): Promise<Document[]> => {
      // Fetch all documents
      const { data: docs, error: docsError } = await supabase
        .from('kh_documents')
        .select('*')
        .order('created_at', { ascending: true });

      if (docsError) throw docsError;
      if (!docs || docs.length === 0) return [];

      // Fetch all blocks for all documents
      const docIds = docs.map(d => d.id);
      const { data: blocks, error: blocksError } = await supabase
        .from('kh_blocks')
        .select('*')
        .in('document_id', docIds)
        .order('block_order', { ascending: true });

      if (blocksError) throw blocksError;

      // Group blocks by document
      const blocksByDoc = new Map<string, Block[]>();
      for (const block of blocks || []) {
        const docBlocks = blocksByDoc.get(block.document_id) || [];
        docBlocks.push(dbToBlock(block));
        blocksByDoc.set(block.document_id, docBlocks);
      }

      // Convert to Document objects
      return docs.map(doc => dbToDocument(doc, blocksByDoc.get(doc.id) || []));
    },
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, parentId, userId }: { title: string; parentId?: string; userId: string }) => {
      const { data: doc, error: docError } = await supabase
        .from('kh_documents')
        .insert({
          title,
          parent_id: parentId,
          created_by: userId,
          icon: '📄',
        })
        .select()
        .single();

      if (docError) throw docError;

      // Create default empty text block
      const { error: blockError } = await supabase
        .from('kh_blocks')
        .insert({
          document_id: doc.id,
          type: 'text',
          content: '',
          block_order: 0,
        });

      if (blockError) throw blockError;

      return doc;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kh_documents'] });
    },
  });
}

export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Document> }) => {
      const dbUpdates: TablesUpdate<'kh_documents'> = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.icon !== undefined) dbUpdates.icon = updates.icon;
      if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
      if (updates.parentId !== undefined) dbUpdates.parent_id = updates.parentId;
      if (updates.isTemplate !== undefined) dbUpdates.is_template = updates.isTemplate;

      const { error } = await supabase
        .from('kh_documents')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      // If blocks are being updated, handle them
      if (updates.blocks) {
        // Delete existing blocks
        const { error: deleteError } = await supabase
          .from('kh_blocks')
          .delete()
          .eq('document_id', id);

        if (deleteError) throw deleteError;

        // Insert new blocks
        if (updates.blocks.length > 0) {
          const blocksToInsert = updates.blocks.map((block, index) => 
            blockToDb(block, id, index)
          );

          const { error: insertError } = await supabase
            .from('kh_blocks')
            .insert(blocksToInsert);

          if (insertError) throw insertError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kh_documents'] });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Blocks will be deleted by CASCADE
      const { error } = await supabase
        .from('kh_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kh_documents'] });
    },
  });
}
