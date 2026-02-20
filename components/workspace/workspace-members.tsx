"use client";

import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  hydrateWorkspaceData,
  loadWorkspaceData,
  addMember,
  removeMember,
  selectWorkspaceMembers,
  selectAvailableUsers,
  selectWorkspaceStatus,
  type WorkspaceMember,
} from "@/lib/store/slices/workspace.slice";

interface WorkspaceMembersProps {
  workspaceId: string;
  members: WorkspaceMember[];
}

export function WorkspaceMembers({ workspaceId, members: serverMembers }: WorkspaceMembersProps) {
  const dispatch = useAppDispatch();
  const members = useAppSelector(selectWorkspaceMembers);
  const availableUsers = useAppSelector(selectAvailableUsers);
  const status = useAppSelector(selectWorkspaceStatus);
  const [selectedUserId, setSelectedUserId] = useState("");

  // Hydrate Redux from server props on mount, then load available users
  useEffect(() => {
    dispatch(hydrateWorkspaceData({ workspaceId, members: serverMembers }));
    dispatch(loadWorkspaceData(workspaceId)).then(() => {
      // loadWorkspaceData also fetches members — we only need the availableUsers part,
      // but it's fine since it replaces state with fresh data.
    });
  }, [workspaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setSelectedUserId("");
    const result = await dispatch(addMember({ workspaceId, userId: selectedUserId }));
    if (addMember.rejected.match(result)) {
      toast.error("Error al agregar miembro");
    }
  };

  const handleRemove = async (userId: string) => {
    const result = await dispatch(removeMember({ workspaceId, userId }));
    if (removeMember.rejected.match(result)) {
      toast.error("Error al eliminar miembro");
    }
  };

  const displayMembers = status === "succeeded" ? members : serverMembers;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Users className="h-5 w-5 text-emerald-400" />
        <h2 className="font-display text-lg font-semibold">Miembros</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          {displayMembers.length} miembro{displayMembers.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        {displayMembers.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay miembros todavia.</p>
        )}
        {displayMembers.map((m) => (
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
            disabled={!selectedUserId}
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
