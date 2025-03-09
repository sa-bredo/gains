import { useSupabaseClient } from "@/integrations/supabase/useSupabaseClient";
import { useCompany } from "@/contexts/CompanyContext";
import { SlackConfig, SlackEmployeeIntegration } from "../types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
