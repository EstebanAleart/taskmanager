
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const departments = ["Desarrollo", "Data", "Marketing", "Branding", "N8N"];

export default function MiPerfil({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;
  const [form, setForm] = useState({
    department: user?.department || "",
    initials: user?.initials || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    // Aquí deberías hacer la petición real a tu API para actualizar el usuario
    try {
      await new Promise((res) => setTimeout(res, 1200));
      setSuccess(true);
    } catch (e) {
      setError("Error al guardar");
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Mi Perfil</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-4 mb-4">
          <Avatar>
            <AvatarImage src={user.avatar} />
            <AvatarFallback>{user.initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">{user.name}</div>
            <div className="text-muted-foreground text-sm">{user.email}</div>
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Departamento</label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full border rounded px-2 py-1"
          >
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Iniciales</label>
          <Input
            name="initials"
            value={form.initials}
            onChange={handleChange}
            maxLength={4}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Rol</label>
          <Input value={user.role} disabled />
        </div>
        {/* Aquí podrías agregar la lista de workplaces si la tienes en la sesión */}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-500 mb-2">Guardado correctamente</div>}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} loading={loading}>Guardar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
