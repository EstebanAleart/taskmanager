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
import type { KanbanColumn } from "@/lib/data";
import { cn } from "@/lib/utils";

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddColumn: (column: KanbanColumn) => void;
}

const COLOR_OPTIONS = [
  { value: "text-muted-foreground", label: "Gris", dot: "bg-muted-foreground" },
  { value: "text-blue-400", label: "Azul", dot: "bg-blue-400" },
  { value: "text-emerald-400", label: "Verde", dot: "bg-emerald-400" },
  { value: "text-amber-400", label: "Amarillo", dot: "bg-amber-400" },
  { value: "text-red-400", label: "Rojo", dot: "bg-red-400" },
  { value: "text-pink-400", label: "Rosa", dot: "bg-pink-400" },
  { value: "text-orange-400", label: "Naranja", dot: "bg-orange-400" },
  { value: "text-cyan-400", label: "Cyan", dot: "bg-cyan-400" },
];

export function AddColumnDialog({ open, onOpenChange, onAddColumn }: AddColumnDialogProps) {
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("text-blue-400");

  const handleSubmit = () => {
    if (!label.trim()) return;

    const id = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    onAddColumn({
      id: id || `col-${Date.now()}`,
      label: label.trim(),
      color,
      icon: "circle",
    });

    setLabel("");
    setColor("text-blue-400");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Nueva Columna</DialogTitle>
          <DialogDescription>
            Agrega una nueva columna al tablero kanban.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="col-name">Nombre de la columna *</Label>
            <Input
              id="col-name"
              placeholder="Ej: QA Testing, Bloqueado..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    color === opt.value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <span className={cn("h-3 w-3 rounded-full", opt.dot)} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!label.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Agregar Columna
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
