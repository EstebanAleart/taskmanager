"use client";

import { useState, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Check } from "lucide-react";
import { updateProjectNotes } from "@/lib/actions/project";

interface ProjectNotesProps {
  projectId: string;
  initialNotes: string;
}

export function ProjectNotes({ projectId, initialNotes }: ProjectNotesProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(true);

  const saveNotes = useCallback(
    async (value: string) => {
      await updateProjectNotes(projectId, value);
      setSaved(true);
    },
    [projectId]
  );

  useEffect(() => {
    if (saved) return;
    const timeout = setTimeout(() => saveNotes(notes), 1000);
    return () => clearTimeout(timeout);
  }, [notes, saved, saveNotes]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-amber-400" />
            <h2 className="font-display text-lg font-semibold">Notas del proyecto</h2>
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
          placeholder="Escribe notas sobre este proyecto..."
          rows={12}
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved(false);
          }}
          className="resize-y bg-transparent"
        />
      </div>
    </div>
  );
}
