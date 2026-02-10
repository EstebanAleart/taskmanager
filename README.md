## Guía de Commits

### Tipos de Commit

| Tipo     | Uso                                 | Ejemplo                                      |
|--------- |-------------------------------------|----------------------------------------------|
| feat     | Nueva funcionalidad                 | feat: agregar filtro por etapa en leads       |
| fix      | Corrección de bug                   | fix: corregir cálculo de días vencidos        |
| perf     | Mejora de rendimiento               | perf: optimizar query de leads con SQL directo|
| refactor | Refactorización sin cambio funcional| refactor: extraer lógica de filtros a hook    |
| style    | Cambios de estilo/formato           | style: ajustar espaciado en cards móviles     |
| docs     | Documentación                       | docs: agregar guía de usuario                 |
| chore    | Tareas de mantenimiento             | chore: actualizar dependencias                |
| test     | Tests                               | test: agregar tests para API de leads         |
| build    | Cambios de build/deploy             | build: configurar variables de Vercel         |
# TaskManager

Sistema de gestion de tareas y proyectos para equipos de trabajo. Organiza workspaces, proyectos con tableros Kanban, asigna responsables por departamento y controla el progreso en tiempo real.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticacion:** Auth0 via NextAuth v5
- **UI:** shadcn/ui, Tailwind CSS, Lucide Icons
- **Notificaciones:** Sonner (toasts)
- **Package manager:** pnpm

## Requisitos

- Node.js 18+
- PostgreSQL
- Cuenta de Auth0 (Application tipo Regular Web Application)

## Instalacion

```bash
# Clonar el repositorio
git clone <repo-url>
cd taskmanager

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
```

### Variables de entorno

Crear `.env.local` en la raiz del proyecto:

```env
# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/taskmanager"

# Auth0 + NextAuth
AUTH_SECRET="<generar con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">"
AUTH_AUTH0_ID="<Client ID de Auth0>"
AUTH_AUTH0_SECRET="<Client Secret de Auth0>"
AUTH_AUTH0_ISSUER="https://<tu-dominio>.auth0.com"
```

### Configuracion de Auth0

En el dashboard de Auth0, configurar la aplicacion con:

| Campo | Valor |
|---|---|
| Allowed Callback URLs | `http://localhost:3000/api/auth/callback/auth0` |
| Allowed Logout URLs | `http://localhost:3000` |
| Allowed Web Origins | `http://localhost:3000` |

### Setup de la base de datos

```bash
# Sincronizar schema con la DB
npx prisma db push

# Iniciar el proyecto
pnpm dev
```

Una vez iniciado, ir a `http://localhost:3000`, loguearse con Auth0, y activar el usuario desde Prisma Studio:

```bash
npx prisma studio
# Abrir http://localhost:5555, tabla User, cambiar status a "active"
```

Luego desde el dashboard hacer click en "Inicializar datos" para seedear departamentos y usuarios base.

## Arquitectura

### Patron SSR + API REST

- **Server Components** (`lib/queries.ts`): Lectura de datos directa con Prisma
- **API Routes** (`app/api/`): Mutaciones (crear, editar, eliminar) via REST
- **Client Components**: Llaman a las API routes con `fetch()` y refrescan con `router.refresh()`

### Autenticacion

- Login via Auth0 (OAuth) gestionado por NextAuth v5
- Usuarios nuevos se crean en la DB con `status: "inactive"`
- Solo usuarios con `status: "active"` acceden al dashboard y workspaces
- Proteccion de rutas en server components con `auth()` + `redirect()`

### Estructura de paginas

```
/                           Landing page
/login                      Login con Auth0
/no-access                  Cuenta pendiente de activacion
/dashboard                  Lista de workspaces
/workspace/[id]             Workspace (proyectos, miembros, reportes, sectores)
/workspace/[id]/project/[id] Proyecto (kanban, notas, links)
```

## Funcionalidades

### Workspaces
- Crear, eliminar workspaces
- Agregar/remover miembros
- Vista de reportes (estadisticas, progreso por departamento)
- Filtro por sectores (departamentos)

### Proyectos
- Crear, eliminar proyectos
- Asignar multiples departamentos (many-to-many)
- Notas del proyecto (Markdown)
- Links externos asociados

### Tablero Kanban
- Drag & drop nativo (HTML5)
- Columnas personalizables (crear, renombrar, eliminar)
- Prioridades con colores
- Tags por tarea
- Fecha de vencimiento (indicador de vencidas)
- Asignar responsable
- Dialog de detalle completo para editar cualquier campo
- Eliminar tareas con confirmacion via toast

### Eliminacion segura
- Workspace, proyecto y tarea con confirmacion via Sonner toast
- Cascade delete en la API (elimina datos dependientes via `$transaction`)

## Modelos de datos

```
Department ──< User
Department >──< Project (many-to-many)
Workspace ──< WorkspaceMember >── User
Workspace ──< Project
Project ──< TaskColumn
Project ──< PriorityLevel
Project ──< ProjectLink
Project ──< ProjectMember >── User
Project ──< Task
Task ──> TaskColumn, PriorityLevel, User (assignee)
Task >──< Tag (many-to-many)
```

## API Routes

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Auth (NextAuth + Auth0) |
| POST | `/api/workspaces` | Crear workspace |
| DELETE | `/api/workspaces/[id]` | Eliminar workspace (cascade) |
| GET | `/api/workspaces/[id]/available-users` | Usuarios disponibles |
| POST/DELETE | `/api/workspaces/[id]/members` | Gestionar miembros |
| POST | `/api/projects` | Crear proyecto |
| DELETE | `/api/projects/[id]` | Eliminar proyecto (cascade) |
| POST | `/api/projects/[id]/columns` | Crear columna |
| PATCH/DELETE | `/api/columns/[id]` | Editar/eliminar columna |
| PUT | `/api/projects/[id]/notes` | Guardar notas |
| POST | `/api/projects/[id]/links` | Crear link |
| DELETE | `/api/projects/[id]/links/[id]` | Eliminar link |
| POST | `/api/tasks` | Crear tarea |
| PATCH | `/api/tasks/[id]` | Editar tarea (todos los campos) |
| DELETE | `/api/tasks/[id]` | Eliminar tarea |
| GET | `/api/seed` | Seedear datos iniciales |

## Scripts

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de produccion
pnpm start        # Iniciar produccion
pnpm lint         # Linter
npx prisma studio # GUI para la base de datos
npx prisma db push # Sincronizar schema
```
