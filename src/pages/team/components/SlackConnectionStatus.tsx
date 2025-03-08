
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { TeamMember } from "../types";

interface SlackConnectionStatusProps {
  member: TeamMember;
}

export function SlackConnectionStatus({ member }: SlackConnectionStatusProps) {
  const isConnected = member.integrations?.slack?.slack_connected === true;
  
  if (isConnected) {
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="h-3.5 w-3.5" />
        <span>Slack Connected</span>
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
      <XCircle className="h-3.5 w-3.5" />
      <span>Not Connected</span>
    </Badge>
  );
}
