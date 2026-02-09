"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import { seedDatabase } from "@/lib/actions/seed";
import { useRouter } from "next/navigation";

export function SeedButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await seedDatabase();
      setMessage(result.message);
      if (result.success) {
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
