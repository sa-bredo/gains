
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TeamMemberFormValues } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchTeamMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('last_name', { ascending: true });
      
      if (error) throw new Error(error.message);
      
      console.log("Fetched team members:", data);
      setTeamMembers(data || []);
      return data;
    } catch (err) {
      console.error('Error fetching team members:', err);
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchActiveStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .is('end_job_date', null)
        .in('role', ['front_of_house', 'manager'])
        .order('last_name', { ascending: true });
      
      if (error) throw new Error(error.message);
      
      console.log("Fetched active staff:", data);
      return data || [];
    } catch (err) {
      console.error('Error fetching active staff:', err);
      const errorObj = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function addTeamMember(newMember: TeamMemberFormValues) {
    try {
      console.log("Adding team member:", newMember);
      
      // Strip any undefined values to avoid Supabase errors
      const cleanMember = Object.fromEntries(
        Object.entries(newMember).filter(([_, value]) => value !== undefined)
      ) as TeamMemberFormValues;
      
      console.log("Cleaned member data:", cleanMember);
      
      const { data, error } = await supabase
        .from('employees')
        .insert([cleanMember])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }
      
      console.log("Added team member successfully:", data);
      
      toast({
        title: "Team member added",
        description: `${newMember.first_name} ${newMember.last_name} has been added to the team.`,
      });
      
      return data;
    } catch (err) {
      console.error('Error adding team member:', err);
      toast({
        variant: "destructive",
        title: "Failed to add team member",
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
      throw err;
    }
  }

  async function updateTeamMember(id: string, updates: Partial<TeamMemberFormValues>) {
    try {
      console.log("Updating team member:", id, updates);
      
      // Strip any undefined values to avoid Supabase errors
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      ) as Partial<TeamMemberFormValues>;
      
      console.log("Cleaned update data:", cleanUpdates);
      
      const { data, error } = await supabase
        .from('employees')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error("Update error:", error);
        throw new Error(error.message);
      }
      
      console.log("Updated team member successfully:", data);
      
      toast({
        title: "Team member updated",
        description: "The team member has been updated successfully.",
      });
      
      return data;
    } catch (err) {
      console.error('Error updating team member:', err);
      toast({
        variant: "destructive",
        title: "Failed to update team member",
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
      throw err;
    }
  }

  async function terminateTeamMember(id: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update({ end_job_date: endDate })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Employee termination scheduled",
        description: `The employee has been scheduled for termination on ${new Date(endDate).toLocaleDateString()}.`,
      });
      
      return data;
    } catch (err) {
      console.error('Error terminating team member:', err);
      toast({
        variant: "destructive",
        title: "Failed to terminate employee",
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
      throw err;
    }
  }

  async function deleteTeamMember(id: string) {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw new Error(error.message);
      
      toast({
        title: "Team member removed",
        description: "The team member has been removed from the team.",
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting team member:', err);
      toast({
        variant: "destructive",
        title: "Failed to remove team member",
        description: err instanceof Error ? err.message : "Unknown error occurred",
      });
      throw err;
    }
  }

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return {
    teamMembers,
    isLoading,
    error,
    refetchTeamMembers: fetchTeamMembers,
    fetchActiveStaff,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    terminateTeamMember
  };
}
