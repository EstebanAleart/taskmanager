"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  GripVertical,
  Trash2,
  Plus,
  Settings,
  Shield,
  BarChart3,
  LogIn,
} from "lucide-react";

export default function GuiaUsuario({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("inicio");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Guia de usuario</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Todo lo que necesitas saber para usar TaskManager
          </p>
        </DialogHeader>

        <Separator />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="inicio" className="text-xs">
              Inicio
            </TabsTrigger>
            <TabsTrigger value="workspaces" className="text-xs">
              Workspaces
            </TabsTrigger>
            <TabsTrigger value="proyectos" className="text-xs">
              Proyectos
            </TabsTrigger>
            <TabsTrigger value="kanban" className="text-xs">
              Kanban
            </TabsTrigger>
            <TabsTrigger value="perfil" className="text-xs">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="acceso" className="text-xs">
              Acceso
            </TabsTrigger>
          </TabsList>

          {/* ===== INICIO ===== */}
          <TabsContent value="inicio" className="space-y-4 py-3">
            <Section
              icon={LogIn}
              title="Primeros pasos"
            >
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">Iniciar sesion</strong> — Hace click en
                  &quot;Iniciar sesion con Auth0&quot; en la pagina principal. Si es tu primer
                  ingreso, se crea tu cuenta automaticamente.
                </li>
                <li>
                  <strong className="text-foreground">Activacion</strong> — Tu cuenta empieza como
                  <Badge variant="secondary" className="mx-1 text-xs">
                    inactivo
                  </Badge>
                  . Un administrador debe activarla para que puedas acceder al dashboard.
                </li>
                <li>
                  <strong className="text-foreground">Dashboard</strong> — Una vez activo, ves tu
                  dashboard con todos los workspaces donde sos miembro.
                </li>
                <li>
                  <strong className="text-foreground">Crear workspace</strong> — Hace click en
                  &quot;Crear Workspace&quot; para empezar a organizar tu equipo. Automaticamente
                  sos el owner.
                </li>
              </ol>
            </Section>

            <Section
              icon={LayoutDashboard}
              title="Navegacion general"
            >
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Dashboard</strong> — Tu punto de partida. Muestra
                  todos los workspaces donde participas con conteo de proyectos y miembros.
                </p>
                <p>
                  <strong className="text-foreground">Sidebar</strong> — Dentro de un workspace, el
                  sidebar izquierdo tiene acceso rapido a proyectos, miembros, reportes y sectores.
                </p>
                <p>
                  <strong className="text-foreground">Perfil</strong> — Hace click en tu avatar
                  (arriba del dashboard o en el sidebar) para ver y editar tu perfil.
                </p>
              </div>
            </Section>
          </TabsContent>

          {/* ===== WORKSPACES ===== */}
          <TabsContent value="workspaces" className="space-y-4 py-3">
            <Section
              icon={LayoutDashboard}
              title="Que es un Workspace"
            >
              <p className="text-sm text-muted-foreground">
                Un workspace es un espacio de trabajo compartido. Dentro contiene proyectos,
                miembros y reportes. Solo los miembros del workspace pueden ver su contenido.
              </p>
            </Section>

            <Section icon={Plus} title="Crear un workspace">
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Desde el dashboard, click en la card &quot;Crear Workspace&quot;</li>
                <li>Ingresa nombre y descripcion (opcional)</li>
                <li>Click en &quot;Crear&quot;</li>
                <li>Automaticamente sos agregado como <Badge variant="outline" className="text-xs mx-1">owner</Badge></li>
              </ol>
            </Section>

            <Section icon={Users} title="Gestionar miembros">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Dentro del workspace, anda a la seccion <strong className="text-foreground">Miembros</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-foreground">Agregar</strong> — Selecciona un usuario del dropdown y clickea &quot;Agregar&quot;</li>
                  <li><strong className="text-foreground">Remover</strong> — Click en la X al lado del miembro</li>
                </ul>
                <p>
                  Solo los miembros existentes del workspace pueden invitar a otros.
                </p>
              </div>
            </Section>

            <Section icon={Trash2} title="Eliminar un workspace">
              <p className="text-sm text-muted-foreground">
                En el sidebar, click en <strong className="text-foreground">&quot;Eliminar workspace&quot;</strong> (abajo del todo).
                Aparece un toast de confirmacion. Se eliminan todos los proyectos, tareas y datos
                asociados. Solo los miembros del workspace pueden eliminarlo.
              </p>
            </Section>
          </TabsContent>

          {/* ===== PROYECTOS ===== */}
          <TabsContent value="proyectos" className="space-y-4 py-3">
            <Section icon={FolderKanban} title="Crear un proyecto">
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Dentro del workspace, anda a la seccion <strong className="text-foreground">Proyectos</strong></li>
                <li>Click en &quot;Nuevo Proyecto&quot;</li>
                <li>Completa: nombre, descripcion, color y departamentos asociados</li>
                <li>Click en &quot;Crear&quot;</li>
                <li>Se generan automaticamente 4 columnas (Pendiente, En Progreso, En Revision, Completada) y 4 niveles de prioridad</li>
              </ol>
            </Section>

            <Section icon={LayoutDashboard} title="Contenido del proyecto">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Cada proyecto tiene:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-foreground">Kanban</strong> — Tablero de tareas con drag & drop</li>
                  <li><strong className="text-foreground">Notas</strong> — Bloc de notas libre (guarda automaticamente)</li>
                  <li><strong className="text-foreground">Links</strong> — Links externos asociados al proyecto (titulo + URL)</li>
                </ul>
              </div>
            </Section>

            <Section icon={Trash2} title="Eliminar un proyecto">
              <p className="text-sm text-muted-foreground">
                Click en el icono de basura en la card del proyecto (en el dashboard o dentro del
                workspace). Confirma en el toast. Se eliminan todas las tareas, columnas,
                prioridades y links del proyecto.
              </p>
            </Section>
          </TabsContent>

          {/* ===== KANBAN ===== */}
          <TabsContent value="kanban" className="space-y-4 py-3">
            <Section icon={GripVertical} title="Tablero Kanban">
              <p className="text-sm text-muted-foreground">
                El kanban es el corazon de cada proyecto. Las tareas se organizan en columnas
                que representan estados. Podes arrastrar tareas entre columnas para cambiar su
                estado.
              </p>
            </Section>

            <Section icon={Plus} title="Crear una tarea">
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click en &quot;Nueva Tarea&quot; arriba del tablero</li>
                <li>Completa: titulo, descripcion, prioridad, columna (estado), responsable</li>
                <li>Opcionalmente agrega: fecha de vencimiento y tags</li>
                <li>Click en &quot;Crear&quot;</li>
              </ol>
            </Section>

            <Section icon={Settings} title="Editar una tarea">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Click en cualquier tarea para abrir el <strong className="text-foreground">dialog de detalle</strong>.
                  Desde ahi podes editar:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Titulo y descripcion</li>
                  <li>Prioridad (Urgente, Alta, Media, Baja)</li>
                  <li>Estado (columna)</li>
                  <li>Responsable</li>
                  <li>Fecha de vencimiento</li>
                  <li>Tags</li>
                </ul>
                <p>
                  Tambien podes <strong className="text-foreground">arrastrar</strong> la tarea a otra
                  columna para cambiar el estado rapidamente.
                </p>
              </div>
            </Section>

            <Section icon={FolderKanban} title="Columnas personalizadas">
              <p className="text-sm text-muted-foreground">
                Podes crear columnas adicionales desde el boton &quot;+ Columna&quot; a la
                derecha del tablero. Cada columna tiene nombre, color e icono. Las tareas se
                mueven entre columnas con drag & drop.
              </p>
            </Section>

            <Section icon={Trash2} title="Eliminar tareas">
              <p className="text-sm text-muted-foreground">
                Dentro del dialog de detalle de la tarea, click en el boton rojo &quot;Eliminar&quot;.
                Aparece un toast de confirmacion antes de borrar.
              </p>
            </Section>
          </TabsContent>

          {/* ===== PERFIL ===== */}
          <TabsContent value="perfil" className="space-y-4 py-3">
            <Section icon={Settings} title="Tu perfil">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Accede a tu perfil haciendo click en tu avatar, ya sea en la{" "}
                  <strong className="text-foreground">navbar del dashboard</strong> o en la parte
                  superior del <strong className="text-foreground">sidebar</strong> del workspace.
                </p>
                <p>El modal de perfil tiene 3 pestanas:</p>
              </div>
            </Section>

            <Section icon={Settings} title="Pestana Perfil">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Campos editables:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong className="text-foreground">Nombre</strong> — Tu nombre visible en el sistema</li>
                  <li><strong className="text-foreground">Iniciales</strong> — Se muestran en tu avatar (max 4 caracteres)</li>
                  <li><strong className="text-foreground">Departamento</strong> — Selecciona tu departamento del dropdown</li>
                </ul>
                <p><strong className="text-foreground">Campos de solo lectura:</strong> Email, Rol</p>
                <p>Click en &quot;Guardar&quot; para persistir los cambios.</p>
              </div>
            </Section>

            <Section icon={LayoutDashboard} title="Pestana Workspaces">
              <p className="text-sm text-muted-foreground">
                Lista todos los workspaces donde participas. Cada card muestra nombre,
                descripcion, tu rol (owner/member), cantidad de proyectos y miembros, y la
                fecha en que te uniste. Click en cualquier card para navegar al workspace.
              </p>
            </Section>

            <Section icon={BarChart3} title="Pestana Resumen">
              <p className="text-sm text-muted-foreground">
                Muestra estadisticas de tu actividad: total de workspaces, proyectos y tareas
                asignadas. Incluye un desglose de tareas por estado (Pendiente, En Progreso,
                En Revision, Completada).
              </p>
            </Section>
          </TabsContent>

          {/* ===== ACCESO ===== */}
          <TabsContent value="acceso" className="space-y-4 py-3">
            <Section icon={Shield} title="Control de acceso">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  TaskManager implementa control de acceso basado en membresia:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Solo ves los <strong className="text-foreground">workspaces</strong> donde sos miembro</li>
                  <li>Solo accedes a <strong className="text-foreground">proyectos</strong> dentro de tus workspaces</li>
                  <li>Solo podes operar <strong className="text-foreground">tareas</strong> en proyectos de tus workspaces</li>
                  <li>Todas las operaciones (crear, editar, eliminar) verifican tu membresia</li>
                </ul>
              </div>
            </Section>

            <Section icon={Users} title="Roles">
              <div className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <Badge variant="default" className="text-xs">owner</Badge>
                    Creador del workspace
                  </div>
                  <span className="ml-2 mt-1 block">Se asigna automaticamente al crear un workspace. Puede gestionar miembros y eliminar el workspace.</span>
                </div>
                <div>
                  <div className="font-medium text-foreground flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">member</Badge>
                    Miembro invitado
                  </div>
                  <span className="ml-2 mt-1 block">Puede ver y operar todo dentro del workspace: proyectos, tareas, notas, links.</span>
                </div>
              </div>
            </Section>

            <Section icon={LogIn} title="Estado de cuenta">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">active</Badge>
                  <span>Acceso completo a la aplicacion</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">inactive</Badge>
                  <span>Cuenta pendiente de activacion por un administrador</span>
                </div>
                <p>
                  Los usuarios inactivos son redirigidos a una pagina de espera (/no-access)
                  hasta que un admin los activa.
                </p>
              </div>
            </Section>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </h3>
      <div className="pl-6">{children}</div>
    </div>
  );
}
