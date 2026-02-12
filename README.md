# TaskManager

Sistema de gestion de tareas y proyectos para equipos de trabajo. Organiza workspaces, proyectos con tableros Kanban, asigna responsables por departamento y controla el progreso en tiempo real.


## Tech Stack Completo

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Base de datos:** PostgreSQL (Supabase) + Prisma ORM
- **ORM:** Prisma Client
- **Autenticación:** Auth0 via NextAuth v5
- **UI:** shadcn/ui, Tailwind CSS, Lucide Icons
- **Notificaciones:** Sonner (toasts)
- **Gestión de dependencias:** pnpm
- **Validación:** Zod
- **Testing:** Vitest, Testing Library
- **Linting:** ESLint, Prettier
- **Diagrama ER:** Mermaid.js
- **Gestión de archivos:** FileType, File, subida a storage
- **Finanzas:** Módulo de cuentas, transacciones, presupuestos
- **Otros:** React Query, Zustand, React Hook Form, clsx, date-fns, superjson, etc.

---

## Modelo Entidad-Relación (ER)

### Diagrama visual

```mermaid
erDiagram
	Department ||--o{ User : ""
	Department ||--o{ Project : "many-to-many"
	Workspace ||--o{ WorkspaceMember : ""
	WorkspaceMember }o--|| User : ""
	Workspace ||--o{ Project : ""
	Project ||--o{ TaskColumn : ""
	Project ||--o{ PriorityLevel : ""
	Project ||--o{ ProjectLink : ""
	Project ||--o{ ProjectMember : ""
	ProjectMember }o--|| User : ""
	Project ||--o{ Task : ""
	Task }o--|| TaskColumn : ""
	Task }o--|| PriorityLevel : ""
	Task }o--|| User : "assignee"
	Task ||--o{ Tag : "many-to-many"
	Project ||--o{ File : ""
	File }o--|| FileType : ""
	File }o--|| User : "uploadedBy"
	Workspace ||--o{ FinancialAccount : ""
	Workspace ||--o{ TransactionCategory : ""
	Workspace ||--o{ FinancialTransaction : ""
	Workspace ||--o{ TransactionAttachment : ""
	Workspace ||--o{ Budget : ""
	FinancialAccount ||--o{ FinancialTransaction : ""
	TransactionCategory ||--o{ FinancialTransaction : ""
	FinancialTransaction }o--|| Project : "?"
	FinancialTransaction }o--|| User : "createdBy"
	FinancialTransaction ||--o{ TransactionAttachment : ""
```

### Descripción textual/tabular

#### Tablas principales

- **Department**: id, name, label, color, bgColor, createdAt, updatedAt
- **User**: id, name, email, status, auth0Id, avatar, role, departmentId, initials, createdAt, updatedAt
- **Workspace**: id, name, description, createdAt, updatedAt
- **WorkspaceMember**: workspaceId, userId, role, joinedAt
- **Project**: id, name, description, notes, workspaceId, color, createdAt, updatedAt
- **ProjectMember**: userId, projectId, joinedAt
- **TaskColumn**: id, name, label, color, icon, order, projectId
- **PriorityLevel**: id, name, label, color, bgColor, dotColor, order, projectId
- **Task**: id, title, description, priorityId, columnId, dueDate, createdAt, updatedAt, projectId, assigneeId
- **Tag**: id, name
- **FileType**: id, name, label, color, bgColor, extension, createdAt, updatedAt
- **File**: id, name, typeId, size, url, uploadedAt, projectId, uploadedById
- **ProjectLink**: id, title, url, projectId, createdAt
- **FinancialAccount**: id, name, description, currency, balance, workspaceId, createdAt, updatedAt
- **TransactionCategory**: id, name, type, color, workspaceId, createdAt, updatedAt
- **FinancialTransaction**: id, amount, description, date, workspaceId, accountId, categoryId, projectId?, createdById, createdAt, updatedAt
- **TransactionAttachment**: id, url, name, workspaceId, transactionId, uploadedAt
- **Budget**: id, name, amount, description, workspaceId, createdAt, updatedAt

#### Relaciones clave

- Department 1─* User
- Department *─* Project
- Workspace 1─* WorkspaceMember *─1 User
- Workspace 1─* Project
- Project 1─* TaskColumn
- Project 1─* PriorityLevel
- Project 1─* ProjectLink
- Project 1─* ProjectMember *─1 User
- Project 1─* Task
- Task *─* Tag
- Project 1─* File
- FileType 1─* File
- User 1─* File (uploadedBy)
- Workspace 1─* FinancialAccount
- Workspace 1─* TransactionCategory
- Workspace 1─* FinancialTransaction
- Workspace 1─* TransactionAttachment
- Workspace 1─* Budget
- FinancialAccount 1─* FinancialTransaction
- TransactionCategory 1─* FinancialTransaction
- FinancialTransaction *─1 Project (opcional)
- FinancialTransaction *─1 User (createdBy)
- FinancialTransaction 1─* TransactionAttachment

---

## Requisitos

- Node.js 18+
- PostgreSQL (local o Supabase)
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
# Base de datos (local)
DATABASE_URL="postgresql://usuario:password@localhost:5432/taskmanager"

# Base de datos (Supabase - usar connection pooling para la app y direct para migraciones)
# DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-1-eu-west-1.pooler.supabase.com:5432/postgres"

# Auth0 + NextAuth
AUTH_SECRET="<generar con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\">"
AUTH_AUTH0_ID="<Client ID de Auth0>"
AUTH_AUTH0_SECRET="<Client Secret de Auth0>"
AUTH_AUTH0_ISSUER="https://<tu-dominio>.auth0.com"
```

> Si usas Supabase, agregar `directUrl = env("DIRECT_URL")` en el bloque `datasource` de `prisma/schema.prisma`.

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

### Autenticacion y control de acceso

- Login via Auth0 (OAuth) gestionado por NextAuth v5
- Usuarios nuevos se crean automaticamente en la DB con `status: "inactive"` al primer login
- Solo usuarios con `status: "active"` acceden al dashboard y workspaces
- Proteccion de rutas en server components con `auth()` + `redirect()`
- Cada usuario solo ve los workspaces donde es miembro (owner o invitado)
- Todas las API routes verifican sesion (`auth()`) y membresia al workspace antes de ejecutar
- Al crear un workspace, el creador se agrega automaticamente como `owner`

### Estructura de paginas

```
/                           Landing page (muestra login o dashboard segun sesion)
/login                      Login con Auth0
/no-access                  Cuenta pendiente de activacion
/dashboard                  Lista de workspaces del usuario
/workspace/[id]             Workspace (proyectos, miembros, reportes, sectores)
/workspace/[id]/project/[id] Proyecto (kanban, notas, links)
```

## Funcionalidades

### Perfil de usuario
- Modal accesible desde navbar del dashboard y sidebar del workspace
- Tres pestanas: Perfil, Workspaces, Resumen
- Editar nombre, iniciales y departamento (datos reales de la DB)
- Ver todos los workspaces donde participas con conteo de proyectos y miembros
- Estadisticas: total de workspaces, proyectos y tareas asignadas con desglose por estado

### Workspaces
- Crear workspace (el creador es owner automaticamente)
- Eliminar workspace (solo miembros)
- Agregar/remover miembros (solo miembros del workspace pueden invitar)
- Vista de reportes (estadisticas, progreso por departamento)
- Filtro por sectores (departamentos)
- Visibilidad restringida: cada usuario solo ve sus propios workspaces

### Proyectos
- Crear, eliminar proyectos (requiere membresia al workspace)
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

### Control de acceso

Todas las API routes estan protegidas con doble verificacion:

1. **Autenticacion**: `auth()` verifica que el usuario tenga sesion activa (401 si no)
2. **Autorizacion**: Se verifica que el usuario sea miembro del workspace correspondiente (403 si no)

Para proyectos y tareas, la verificacion sube por la cadena: tarea -> proyecto -> workspace -> membresia.

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

### Campos clave del modelo User

| Campo | Tipo | Descripcion |
|---|---|---|
| `status` | String | `"active"` o `"inactive"` - controla acceso a la app |
| `auth0Id` | String? | ID de Auth0, se vincula en el primer login |
| `role` | String | Rol del usuario (ej: "miembro") |
| `departmentId` | String | Departamento al que pertenece |
| `initials` | String | Iniciales para avatar |

### Campos clave de WorkspaceMember

| Campo | Tipo | Descripcion |
|---|---|---|
| `role` | String | `"owner"` (creador) o `"member"` (invitado) |
| `joinedAt` | DateTime | Fecha de ingreso al workspace |


## API Routes (detalladas para IA)

> Todas las rutas (excepto auth y seed) requieren sesión activa y membresía al workspace.

| Método | Ruta | Descripción |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Auth (NextAuth + Auth0) |
| GET | `/api/user/profile` | Obtener perfil del usuario actual |
| PUT | `/api/user/profile` | Actualizar perfil del usuario actual |
| POST | `/api/workspaces` | Crear workspace (el usuario es owner) |
| DELETE | `/api/workspaces/[workspaceId]` | Eliminar workspace (cascade) |
| GET | `/api/workspaces/[workspaceId]/available-users` | Listar usuarios disponibles para invitar |
| POST | `/api/workspaces/[workspaceId]/members` | Agregar miembro al workspace |
| DELETE | `/api/workspaces/[workspaceId]/members/[userId]` | Remover miembro del workspace |
| POST | `/api/projects` | Crear proyecto en workspace |
| DELETE | `/api/projects/[projectId]` | Eliminar proyecto (cascade) |
| POST | `/api/projects/[projectId]/columns` | Crear columna Kanban |
| PATCH | `/api/projects/[projectId]/notes` | Guardar notas del proyecto |
| POST | `/api/projects/[projectId]/links` | Crear link externo en proyecto |
| DELETE | `/api/projects/[projectId]/links/[linkId]` | Eliminar link externo |
| POST | `/api/tasks` | Crear tarea en proyecto |
| PATCH | `/api/tasks/[taskId]` | Editar tarea (todos los campos) |
| DELETE | `/api/tasks/[taskId]` | Eliminar tarea |
| POST | `/api/seed` | Seedear datos iniciales |

### Notas para IA
- Todos los endpoints validan sesión y membresía antes de operar.
- Los endpoints de finanzas (cuentas, transacciones, presupuestos) deben agregarse aquí cuando se implementen.

---

## Scripts

```bash
pnpm dev            # Servidor de desarrollo
pnpm build          # Build de produccion
pnpm start          # Iniciar produccion
pnpm lint           # Linter
npx prisma studio   # GUI para la base de datos
npx prisma db push  # Sincronizar schema
npx prisma generate # Regenerar cliente Prisma
```

## Guia de Commits

| Tipo     | Uso                                 | Ejemplo                                      |
|--------- |-------------------------------------|----------------------------------------------|
| feat     | Nueva funcionalidad                 | feat: agregar filtro por etapa en leads       |
| fix      | Correccion de bug                   | fix: corregir calculo de dias vencidos        |
| perf     | Mejora de rendimiento               | perf: optimizar query de leads con SQL directo|
| refactor | Refactorizacion sin cambio funcional| refactor: extraer logica de filtros a hook    |
| style    | Cambios de estilo/formato           | style: ajustar espaciado en cards moviles     |
| docs     | Documentacion                       | docs: agregar guia de usuario                 |
| chore    | Tareas de mantenimiento             | chore: actualizar dependencias                |
| test     | Tests                               | test: agregar tests para API de leads         |
| build    | Cambios de build/deploy             | build: configurar variables de Vercel         |
