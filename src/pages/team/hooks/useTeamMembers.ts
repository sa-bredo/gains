
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMember, TeamMemberFormValues } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useTeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  async function fetchTeamMembers() {
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
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }

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
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
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
  }, []);

  return {
    teamMembers,
    isLoading,
    error,
    refetchTeamMembers: fetchTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    terminateTeamMember
  };
}
