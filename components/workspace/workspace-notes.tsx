"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Check } from "lucide-react";
import { updateWorkspaceNotes } from "@/lib/actions/workspace";

interface WorkspaceNotesProps {
  workspaceId: string;
  initialNotes: string;
}

export function WorkspaceNotes({ workspaceId, initialNotes }: WorkspaceNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);

  const saveNotes = useCallback(
    async (value: string) => {
      await updateWorkspaceNotes(workspaceId, value);
      setSaved(true);
    },
    [workspaceId]
  );

  useEffect(() => {
    if (saved) return;
    const timeout = setTimeout(() => saveNotes(notes), 1000);
    return () => clearTimeout(timeout);
  }, [notes, saved, saveNotes]);

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-amber-400" />
          <h2 className="font-display text-lg font-semibold">Notas</h2>
        </div>
        {saved ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Check className="h-3 w-3" />
            Guardado
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Guardando...</span>
        )}
      </div>
      <Textarea
        placeholder="Escribe notas sobre este workspace..."
        rows={8}
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        className="resize-y bg-transparent"
      />
    </div>
  );
}
