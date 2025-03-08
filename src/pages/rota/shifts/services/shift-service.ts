
import { useCompany } from "@/contexts/CompanyContext";
import { fetchLocations } from './api/locations';
import { fetchTemplateMasters, fetchTemplatesForLocationAndVersion } from './api/templates';
import { fetchStaffMembers } from './api/staff';
import { createShifts, fetchShiftsWithDateRange } from './api/shifts';
import { getDateRangeForPreset } from './date-range';
import { generateShiftsPreview, mapShiftsToPreview, formatShiftsForCreation } from './shifts-preview';
import { DAYS_OF_WEEK } from './constants';

// Re-export constants for backward compatibility
export { DAYS_OF_WEEK };

// Create a hook that combines the shift service with company context
export function useShiftService() {
  const { currentCompany } = useCompany();
  
  const fetchCompanyLocations = async () => {
    return fetchLocations(currentCompany?.id || null);
  };
  
  const fetchCompanyTemplateMasters = async () => {
    return fetchTemplateMasters(currentCompany?.id || null);
  };
  
  const fetchShifts = async (startDate: Date | null, endDate: Date | null, locationId: string | null) => {
    return fetchShiftsWithDateRange(startDate, endDate, locationId, currentCompany?.id || null);
  };
  
  return {
    fetchLocations: fetchCompanyLocations,
    fetchTemplateMasters: fetchCompanyTemplateMasters,
    fetchShifts,
    fetchTemplatesForLocationAndVersion,
    fetchStaffMembers,
    createShifts,
    getDateRangeForPreset,
    generateShiftsPreview,
    mapShiftsToPreview,
    formatShiftsForCreation
  };
}

// Re-export for backward compatibility
export {
  fetchLocations,
  fetchTemplateMasters,
  fetchTemplatesForLocationAndVersion,
  fetchStaffMembers,
  createShifts,
  fetchShiftsWithDateRange,
  getDateRangeForPreset,
  generateShiftsPreview,
  mapShiftsToPreview,
  formatShiftsForCreation
};
