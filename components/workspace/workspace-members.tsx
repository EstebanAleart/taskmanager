"use client";

import { useState, useEffect } from "react";
import { Users, Plus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAvailableUsers,
  addMember,
  removeMember,
} from "@/lib/actions/workspace-members";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Member {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    initials: string;
    role: string;
    department: { name: string; label: string; color: string; bgColor: string };
  };
}

interface AvailableUser {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: { name: string; label: string; color: string; bgColor: string };
}

interface WorkspaceMembersProps {
  workspaceId: string;
  members: Member[];
}

export function WorkspaceMembers({ workspaceId, members }: WorkspaceMembersProps) {
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getAvailableUsers(workspaceId).then(setAvailableUsers);
  }, [workspaceId, members]);

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      await addMember(workspaceId, selectedUserId);
      setSelectedUserId("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId: string) => {
    await removeMember(workspaceId, userId);
    router.refresh();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-emerald-400" />
        <h2 className="font-display text-lg font-semibold">Miembros</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {members.length} miembro{members.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Member list */}
      <div className="mb-4 flex flex-col gap-2">
        {members.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay miembros todavia.</p>
        )}
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                  {m.user.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{m.user.name}</p>
                <p className="text-xs text-muted-foreground">{m.user.role}</p>
              </div>
              <Badge
                variant="secondary"
                className={cn("text-xs", m.user.department.bgColor, m.user.department.color)}
              >
                {m.user.department.label}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleRemove(m.userId)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {/* Add member */}
      {availableUsers.length > 0 && (
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Seleccionar usuario..." />
            </SelectTrigger>
            <SelectContent>
              {availableUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} - {u.department.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAdd}
            disabled={!selectedUserId || loading}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
