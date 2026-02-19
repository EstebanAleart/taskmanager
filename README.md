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
/workspace/[id]             Workspace (proyectos, miembros, reportes, sectores, finanzas)
/workspace/[id]/project/[id] Proyecto (kanban, notas, links)
```

Las secciones del workspace se manejan con `?section=X` en la URL:
- `?section=proyectos` (default)
- `?section=miembros`
- `?section=reportes`
- `?section=sector&dept=[deptId]`
- `?section=finanzas`

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

### Finanzas
- Seccion accesible desde el sidebar del workspace (`?section=finanzas`)
- 4 tabs internas: Transacciones, Cuentas, Categorias, Presupuestos
- **Cuentas**: CRUD completo (nombre, descripcion, moneda ARS/USD/EUR, balance). Cards con balance formateado y responsive
- **Categorias**: CRUD con tipo income/expense. Vista agrupada por tipo con iconos verde/rojo
- **Transacciones**: CRUD vinculado a cuenta + categoria + proyecto (opcional). Lista con iconos de ingreso/gasto, fecha, monto formateado, badge de categoria
- **Presupuestos**: CRUD basico (nombre, monto, descripcion). Cards con monto formateado y responsive
- Filtro por mes con navegacion (anterior/siguiente) y opcion "Todos". Cards resumen de ingresos/gastos/balance del periodo
- Presupuestos con estado (pending/approved/rejected) y accion de convertir a transaccion
- Todas las operaciones usan Dialog de shadcn para crear/editar y Sonner toast para confirmar eliminacion
- Requiere al menos una cuenta y una categoria para crear transacciones
- **Responsive**: cards de resumen y montos adaptan tamaño de fuente en mobile (`text-xs sm:text-base`), valores con `truncate` para evitar overflow, cabecera de mes con `flex-wrap`
- Componente: `components/workspace/workspace-finance.tsx`

### Eliminacion segura
- Workspace, proyecto, tarea y entidades financieras con confirmacion via Sonner toast
- Cascade delete en la API (elimina datos dependientes via `$transaction` o `onDelete: Cascade` en Prisma)

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

Workspace ──< FinancialAccount ──< FinancialTransaction
Workspace ──< TransactionCategory ──< FinancialTransaction
Workspace ──< Budget
FinancialTransaction ──> User (createdBy)
FinancialTransaction ──>? Project (opcional)
FinancialTransaction ──< TransactionAttachment
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
| **Finanzas — Cuentas** | | |
| GET | `/api/workspaces/[workspaceId]/accounts` | Listar cuentas financieras del workspace |
| POST | `/api/workspaces/[workspaceId]/accounts` | Crear cuenta financiera |
| PATCH | `/api/workspaces/[workspaceId]/accounts/[accountId]` | Editar cuenta financiera |
| DELETE | `/api/workspaces/[workspaceId]/accounts/[accountId]` | Eliminar cuenta financiera |
| **Finanzas — Categorías** | | |
| GET | `/api/workspaces/[workspaceId]/categories` | Listar categorías de transacción |
| POST | `/api/workspaces/[workspaceId]/categories` | Crear categoría (type: income/expense) |
| PATCH | `/api/workspaces/[workspaceId]/categories/[categoryId]` | Editar categoría |
| DELETE | `/api/workspaces/[workspaceId]/categories/[categoryId]` | Eliminar categoría |
| **Finanzas — Transacciones** | | |
| GET | `/api/workspaces/[workspaceId]/transactions` | Listar transacciones (incluye account, category, project, createdBy) |
| POST | `/api/workspaces/[workspaceId]/transactions` | Crear transacción |
| PATCH | `/api/workspaces/[workspaceId]/transactions/[transactionId]` | Editar transacción |
| DELETE | `/api/workspaces/[workspaceId]/transactions/[transactionId]` | Eliminar transacción |
| **Finanzas — Adjuntos** | | |
| GET | `/api/workspaces/[workspaceId]/transactions/[transactionId]/attachments` | Listar adjuntos de transacción |
| POST | `/api/workspaces/[workspaceId]/transactions/[transactionId]/attachments` | Crear adjunto (url, name) |
| DELETE | `.../attachments/[attachmentId]` | Eliminar adjunto |
| **Finanzas — Presupuestos** | | |
| GET | `/api/workspaces/[workspaceId]/budgets` | Listar presupuestos del workspace |
| POST | `/api/workspaces/[workspaceId]/budgets` | Crear presupuesto |
| PATCH | `/api/workspaces/[workspaceId]/budgets/[budgetId]` | Editar presupuesto |
| DELETE | `/api/workspaces/[workspaceId]/budgets/[budgetId]` | Eliminar presupuesto |

### Notas para IA
- Todos los endpoints validan sesión y membresía antes de operar.
- **API routes de finanzas:** `app/api/workspaces/[workspaceId]/{accounts,categories,transactions,budgets}/`
- **Frontend de finanzas:** `components/workspace/workspace-finance.tsx` (componente client-side con tabs internas)
- **Integración:** sidebar en `workspace-sidebar.tsx` (NAV_ITEMS), sección en `workspace-content.tsx`
- **Modelos de finanzas:** `prisma/schema.prisma` (sección FINANCE MODULE, línea ~229)
- **Patrón de datos:** Finanzas usa fetch client-side (useEffect + fetch a API routes), no server queries
- **Migraciones:** `prisma/migrations/migrationFinanzas/migrationFinanzas.sql` contiene la migración SQL para Supabase

---

## Estructura de archivos clave

```
app/
├── api/
│   ├── auth/[...nextauth]/route.ts
│   ├── projects/[projectId]/{route,columns,links,notes}/route.ts
│   ├── tasks/{route.ts,[taskId]/route.ts}
│   ├── user/profile/route.ts
│   ├── seed/route.ts
│   ├── workspaces/{route.ts,[workspaceId]/route.ts}
│   └── workspaces/[workspaceId]/
│       ├── available-users/route.ts
│       ├── members/{route.ts,[userId]/route.ts}
│       ├── accounts/{route.ts,[accountId]/route.ts}
│       ├── categories/{route.ts,[categoryId]/route.ts}
│       ├── transactions/{route.ts,[transactionId]/route.ts}
│       ├── transactions/[transactionId]/attachments/{route.ts,[attachmentId]/route.ts}
│       └── budgets/{route.ts,[budgetId]/route.ts}
├── dashboard/page.tsx
├── workspace/[workspaceId]/
│   ├── layout.tsx                      # Server: auth guard + sidebar data
│   ├── page.tsx                        # Server: lee ?section= y fetch condicional
│   └── project/[projectId]/page.tsx
├── layout.tsx
└── page.tsx

components/
├── workspace/
│   ├── workspace-sidebar.tsx           # Sidebar con NAV_ITEMS (proyectos, miembros, reportes, finanzas)
│   ├── workspace-content.tsx           # Switch de secciones por activeSection
│   ├── workspace-layout-client.tsx     # Layout client (sidebar + main)
│   ├── workspace-projects.tsx          # Seccion proyectos
│   ├── workspace-members.tsx           # Seccion miembros
│   ├── workspace-reports.tsx           # Seccion reportes
│   ├── workspace-sector-view.tsx       # Seccion sector/departamento
│   └── workspace-finance.tsx           # Seccion finanzas (tabs: transacciones/cuentas/categorias/presupuestos)
├── project/
│   ├── project-content.tsx             # Tabs: tablero/notas/links
│   ├── project-kanban.tsx
│   ├── project-notes.tsx
│   └── project-links.tsx
├── ui/                                 # shadcn/ui components
├── MiPerfil.tsx
├── GuiaUsuario.tsx
└── create-project-dialog.tsx

lib/
├── auth.ts                             # NextAuth config
├── prisma.ts                           # Prisma client singleton
├── queries.ts                          # Server queries (Prisma)
└── utils.ts                            # cn() helper

prisma/
├── schema.prisma                       # Todos los modelos (incluye FINANCE MODULE)
└── migrations/migrationFinanzas/       # Migración SQL para Supabase
```

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
