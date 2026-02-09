import Link from "next/link";
import {
  LayoutDashboard,
  CheckCircle2,
  Users,
  FolderKanban,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">TaskManager</span>
          </div>
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Ir al Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h1 className="font-display text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Gestiona tus proyectos
          <br />
          <span className="text-blue-500">en equipo</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Organiza tareas, asigna responsables y haz seguimiento del progreso de
          tus proyectos con tableros Kanban, todo en un solo lugar.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            Comenzar ahora
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
              <FolderKanban className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="font-display text-lg font-semibold">Tablero Kanban</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Visualiza el flujo de trabajo con columnas personalizables.
              Arrastra y suelta tareas entre estados.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-display text-lg font-semibold">Proyectos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Agrupa tareas por proyecto, asigna departamentos y controla el
              avance con metricas en tiempo real.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15">
              <Users className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-display text-lg font-semibold">Equipos</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Invita miembros a tu workspace, asigna roles y colabora en
              proyectos compartidos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
