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
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PROJECT_COLORS = [
  { value: "bg-blue-500", label: "Azul" },
  { value: "bg-emerald-500", label: "Verde" },
  { value: "bg-amber-500", label: "Amarillo" },
  { value: "bg-pink-500", label: "Rosa" },
  { value: "bg-orange-500", label: "Naranja" },
  { value: "bg-purple-500", label: "Violeta" },
  { value: "bg-red-500", label: "Rojo" },
  { value: "bg-cyan-500", label: "Cyan" },
];

interface Department {
  id: string;
  name: string;
  label: string;
  color?: string;
  bgColor?: string;
}

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  departments: Department[];
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  workspaceId,
  departments,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDeptIds, setSelectedDeptIds] = useState<string[]>([]);
  const [color, setColor] = useState(PROJECT_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleDepartment = (deptId: string) => {
    setSelectedDeptIds((prev) =>
      prev.includes(deptId) ? prev.filter((id) => id !== deptId) : [...prev, deptId]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || selectedDeptIds.length === 0) return;
    setLoading(true);
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          name: name.trim(),
          description: description.trim(),
          departmentIds: selectedDeptIds,
          color,
        }),
      });
      setName("");
      setDescription("");
      setSelectedDeptIds([]);
      setColor(PROJECT_COLORS[0].value);
      onOpenChange(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Crea un proyecto dentro de este workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="proj-name">Nombre *</Label>
            <Input
              id="proj-name"
              placeholder="Nombre del proyecto..."
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
            <Label htmlFor="proj-desc">Descripcion</Label>
            <Textarea
              id="proj-desc"
              placeholder="Describe el proyecto..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Departamentos *</Label>
            <div className="flex flex-wrap gap-2">
              {departments.map((d) => {
                const isSelected = selectedDeptIds.includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDepartment(d.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      isSelected
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-transparent text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    )}
                  >
                    {d.label}
                    {isSelected && <X className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
            {selectedDeptIds.length === 0 && (
              <p className="text-xs text-muted-foreground">Selecciona al menos un departamento.</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_COLORS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-sm ${c.value}`} />
                      {c.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || selectedDeptIds.length === 0 || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creando..." : "Crear Proyecto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
