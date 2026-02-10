import { LayoutDashboard, ShieldX } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NoAccessPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15">
          <ShieldX className="h-6 w-6 text-amber-400" />
        </div>
        <h1 className="font-display text-2xl font-bold text-card-foreground">
          Acceso pendiente
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu cuenta fue creada pero todavia no esta activada. Contacta al administrador para obtener acceso.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Sesion: {session.user?.email}
        </p>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="mt-6 w-full rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            Cerrar sesion
          </button>
        </form>
      </div>
    </div>
  );
}
