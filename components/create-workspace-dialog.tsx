"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspace } from "@/lib/actions/workspace";
import { useRouter } from "next/navigation";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const workspace = await createWorkspace({
        name: name.trim(),
        description: description.trim(),
      });
      setName("");
      setDescription("");
      onOpenChange(false);
      router.push(`/workspace/${workspace.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Nuevo Workspace</DialogTitle>
          <DialogDescription>
            Crea un espacio de trabajo para organizar tus proyectos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="ws-name">Nombre *</Label>
            <Input
              id="ws-name"
              placeholder="Nombre del workspace..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ws-desc">Descripcion</Label>
            <Textarea
              id="ws-desc"
              placeholder="Describe el workspace..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creando..." : "Crear Workspace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
