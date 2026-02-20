"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/store/hooks";
import { updateTask } from "@/lib/store/slices/task.slice";

interface TaskTag {
  id: string;
  name: string;
}

interface PriorityItem {
  id: string;
  name: string;
  label: string;
  color: string;
  dotColor: string;
}

interface TaskAssignee {
  id: string;
  name: string;
  initials: string;
  department: { name: string; label: string; color: string; bgColor: string };
}

interface ColumnItem {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string;
  order: number;
}

interface UserOption {
  id: string;
  name: string;
  initials: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priorityId: string;
  priority: PriorityItem;
  dueDate: string | null;
  createdAt: string;
  assignee: TaskAssignee;
  tags: TaskTag[];
}

interface TaskDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskItem;
  columns: ColumnItem[];
  priorities: PriorityItem[];
  users: UserOption[];
  onDelete: (taskId: string) => void;
}

export function TaskDetailDialog({
  open,
  onOpenChange,
  task,
  columns,
  priorities,
  users,
  onDelete,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [columnId, setColumnId] = useState(task.columnId);
  const [priorityId, setPriorityId] = useState(task.priorityId);
  const [assigneeId, setAssigneeId] = useState(task.assignee.id);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split("T")[0] : "");
  const [tags, setTags] = useState(task.tags.map((t) => t.name).join(", "));
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description);
    setColumnId(task.columnId);
    setPriorityId(task.priorityId);
    setAssigneeId(task.assignee.id);
    setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    setTags(task.tags.map((t) => t.name).join(", "));
  }, [task]);

  const handleSave = async () => {
    if (!title.trim() || !assigneeId) return;
    setLoading(true);
    const result = await dispatch(
      updateTask({
        id: task.id,
        data: {
          title: title.trim(),
          description: description.trim(),
          columnId,
          priorityId,
          assigneeId,
          dueDate: dueDate || null,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      })
    );
    setLoading(false);
    if (updateTask.fulfilled.match(result)) {
      onOpenChange(false);
    } else {
      toast.error("Error al guardar la tarea");
    }
  };

  const handleDelete = () => {
    onDelete(task.id);
    onOpenChange(false);
  };

  const currentColumn = columns.find((c) => c.id === columnId);
  const createdDate = new Date(task.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="font-display text-lg">Detalle de Tarea</DialogTitle>
            {currentColumn && (
              <span className={cn("text-xs font-medium", currentColumn.color)}>
                {currentColumn.label}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Creada el {createdDate}</p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="detail-title">Titulo *</Label>
            <Input
              id="detail-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="detail-desc">Descripcion</Label>
            <Textarea
              id="detail-desc"
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
                      <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", p.dotColor)} />
                        {p.label}
                      </div>
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
                  <SelectValue />
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
              <Label htmlFor="detail-due">Fecha limite</Label>
              <Input
                id="detail-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="detail-tags">Etiquetas</Label>
            <Input
              id="detail-tags"
              placeholder="tag1, tag2, tag3"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim() || !assigneeId || loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
