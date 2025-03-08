
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

// Create shifts in Supabase
export const createShifts = async (shiftsToCreate: {
  date: string;
  start_time: string;
  end_time: string;
  location_id: string;
  employee_id: string | null;
  name: string;
  status: string;
}[]) => {
  console.log('Creating shifts with data:', shiftsToCreate);
  const { data, error } = await supabase
    .from('shifts')
    .insert(shiftsToCreate);

  if (error) {
    console.error('Error creating shifts:', error);
    throw error;
  }

  console.log('Shifts created successfully:', data);
  return { success: true };
};

// Modified fetchShiftsWithDateRange to include company filtering
export const fetchShiftsWithDateRange = async (
  startDate: Date | null,
  endDate: Date | null,
  locationId: string | null,
  companyId: string | null
) => {
  try {
    if (!companyId) return [];
    
    let query = supabase
      .from('shifts')
      .select(`
        *,
        locations:location_id (id, name, company_id),
        employees:employee_id (id, first_name, last_name, role, email)
      `)
      .order('date', { ascending: true });
    
    if (startDate && endDate) {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      console.log(`Filtering shifts between ${formattedStartDate} and ${formattedEndDate}`);
      
      query = query
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);
    } else if (startDate) {
      const formattedDate = format(startDate, 'yyyy-MM-dd');
      console.log(`Filtering shifts for date ${formattedDate}`);
      query = query.eq('date', formattedDate);
    }
    
    if (locationId) {
      console.log(`Filtering shifts for location ${locationId}`);
      query = query.eq('location_id', locationId);
    } else {
      // If no specific location is selected, filter by company_id
      console.log(`Finding locations for company ${companyId}`);
      const { data: locationIds, error: locError } = await supabase
        .from('locations')
        .select('id')
        .eq('company_id', companyId);
        
      if (locError) {
        console.error('Error fetching location IDs:', locError);
        throw locError;
      }
      
      if (locationIds && locationIds.length > 0) {
        const ids = locationIds.map(loc => loc.id);
        console.log('Filtering shifts for location IDs:', ids);
        query = query.in('location_id', ids);
      } else {
        console.log('No locations found for this company');
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching shifts:', error);
      throw error;
    }
    
    console.log('Fetched shifts:', data?.length || 0);
    
    // Further filter results to ensure only shifts for the company's locations are included
    return data?.filter(shift => 
      shift.locations?.company_id === companyId
    ) || [];
  } catch (error) {
    console.error('Error fetching shifts with date range:', error);
    throw error;
  }
};
