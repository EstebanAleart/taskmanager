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
import { createProject } from "@/lib/actions/project";
import { useRouter } from "next/navigation";

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
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || "");
  const [color, setColor] = useState(PROJECT_COLORS[0].value);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!name.trim() || !departmentId) return;
    setLoading(true);
    try {
      await createProject(workspaceId, {
        name: name.trim(),
        description: description.trim(),
        departmentId,
        color,
      });
      setName("");
      setDescription("");
      setDepartmentId(departments[0]?.id || "");
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Departamento *</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !departmentId || loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {loading ? "Creando..." : "Crear Proyecto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
