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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

interface ColumnOption {
  id: string;
  label: string;
}

interface PriorityOption {
  id: string;
  label: string;
}

interface UserOption {
  id: string;
  name: string;
  initials: string;
}

interface ProjectCreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  columns: ColumnOption[];
  priorities: PriorityOption[];
  users: UserOption[];
  defaultColumnId?: string;
}

export function ProjectCreateTaskDialog({
  open,
  onOpenChange,
  projectId,
  columns,
  priorities,
  users,
  defaultColumnId,
}: ProjectCreateTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [columnId, setColumnId] = useState(defaultColumnId || columns[0]?.id || "");
  const [priorityId, setPriorityId] = useState(priorities[2]?.id || priorities[0]?.id || "");
  const [assigneeId, setAssigneeId] = useState(users[0]?.id || "");
  const [tags, setTags] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim() || !assigneeId || !columnId || !priorityId) return;
    setLoading(true);
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: title.trim(),
          description: description.trim(),
          priorityId,
          columnId,
          assigneeId,
          dueDate: dueDate || undefined,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });
      resetForm();
      onOpenChange(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setColumnId(defaultColumnId || columns[0]?.id || "");
    setPriorityId(priorities[2]?.id || priorities[0]?.id || "");
    setAssigneeId(users[0]?.id || "");
    setTags("");
    setDueDate("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Nueva Tarea</DialogTitle>
          <DialogDescription>
            Completa los datos para crear una nueva tarea en el proyecto.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="task-title">Titulo *</Label>
            <Input
              id="task-title"
              placeholder="Nombre de la tarea..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-desc">Descripcion</Label>
            <Textarea
              id="task-desc"
              placeholder="Describe la tarea..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Columna</Label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Prioridad</Label>
              <Select value={priorityId} onValueChange={setPriorityId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Asignado a *</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-due">Fecha limite</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="task-tags">Etiquetas</Label>
            <Input
              id="task-tags"
              placeholder="tag1, tag2, tag3"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !assigneeId || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creando..." : "Crear Tarea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
