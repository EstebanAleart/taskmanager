"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { useRouter } from "next/navigation";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      setMessage(data.message);
      if (data.success) {
        router.refresh();
      }
    } catch {
      setMessage("Error al inicializar la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        onClick={handleSeed}
        disabled={loading}
        variant="outline"
        className="bg-transparent"
      >
        <Database className="mr-2 h-4 w-4" />
        {loading ? "Inicializando..." : "Inicializar Base de Datos"}
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
