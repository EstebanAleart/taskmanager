"use client";

import { useState } from "react";
import { LayoutDashboard } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import MiPerfil from "@/components/MiPerfil";

interface DashboardNavbarProps {
  session: any;
  onSignOut: () => void;
}

export function DashboardNavbar({ session, onSignOut }: DashboardNavbarProps) {
  const [perfilOpen, setPerfilOpen] = useState(false);

  return (
    <>
      <nav className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">TaskManager</span>
          </div>
          
          <div className="flex items-center gap-4">
            {session?.user && (
              <button
                onClick={() => setPerfilOpen(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user.image} />
                  <AvatarFallback>
                    {session.user.initials || session.user.name?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {session.user.name || session.user.email}
              </button>
            )}
            
            <button
              onClick={onSignOut}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>

      <MiPerfil open={perfilOpen} onClose={() => setPerfilOpen(false)} />
    </>
  );
}