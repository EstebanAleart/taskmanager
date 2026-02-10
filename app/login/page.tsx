import { signIn } from "@/lib/auth";
import { LayoutDashboard } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600">
          <LayoutDashboard className="h-6 w-6 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-card-foreground">
          TaskManager
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Inicia sesion para acceder a tus proyectos
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("auth0", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Iniciar sesion con Auth0
          </button>
        </form>
      </div>
    </div>
  );
}
