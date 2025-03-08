
import { supabase } from '@/integrations/supabase/client';
import { ShiftTemplate, ShiftTemplateMaster } from '../../../shift-templates/types';
import { DAY_ORDER } from '../../utils/date-utils';

// Fetch template masters from Supabase with company_id filter
export const fetchTemplateMasters = async (companyId: string | null): Promise<ShiftTemplateMaster[]> => {
  if (!companyId) return [];
  
  const { data, error } = await supabase
    .from('shift_templates')
    .select(`
      location_id,
      version,
      locations:location_id(id, name, company_id)
    `)
    .eq('locations.company_id', companyId)
    .order('location_id')
    .order('version', { ascending: false });

  if (error) {
    console.error('Error fetching template masters:', error);
    throw error;
  }

  // Process the data to get unique location_id, version combinations
  const mastersMap = new Map();
  data?.forEach(item => {
    if (item.locations?.company_id === companyId) {
      const key = `${item.location_id}-${item.version}`;
      if (!mastersMap.has(key)) {
        mastersMap.set(key, {
          location_id: item.location_id,
          version: item.version,
          location_name: item.locations?.name,
          created_at: '' // This field might not be available
        });
      }
    }
  });
  
  return Array.from(mastersMap.values()) as ShiftTemplateMaster[];
};

// Fetch templates for a specific location and version
export const fetchTemplatesForLocationAndVersion = async (
  locationId: string, 
  version: number
): Promise<ShiftTemplate[]> => {
  console.log(`Fetching templates for location ${locationId} and version ${version}`);
  
  if (!locationId || isNaN(version)) {
    console.error('Invalid parameters:', { locationId, version });
    throw new Error('Invalid location ID or version');
  }

  const { data, error } = await supabase
    .from('shift_templates')
    .select(`
      *,
      employees:employee_id (id, first_name, last_name, role, email)
    `)
    .eq('location_id', locationId)
    .eq('version', version);

  if (error) {
    console.error('Supabase error:', error);
    throw error;
  }

  console.log('Templates fetched:', data);

  // Transform the data to ensure it matches the ShiftTemplate type
  const templates = data?.map(template => ({
    ...template,
    employees: template.employees ? {
      ...template.employees,
      // Ensure all required fields are present, using defaults if needed
      role: template.employees.role || '',
      email: template.employees.email || ''
    } : null
  })) || [];

  // Sort templates by day of week
  return templates.sort((a, b) => DAY_ORDER[a.day_of_week] - DAY_ORDER[b.day_of_week]);
};
