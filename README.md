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
- 6 tabs internas: **Dashboard**, Transacciones, Cuentas, Categorias, Presupuestos, **Reportes**
- **Cuentas**: CRUD completo (nombre, descripcion, moneda ARS/USD/EUR/BRL/UYU, balance inicial). Balance mostrado = balance inicial + suma de todas las transacciones (calculado en GET /accounts)
- **Categorias**: CRUD con tipo income/expense. Vista agrupada por tipo con iconos verde/rojo. Nombres `"Transferencia (entrada)"` y `"Transferencia (salida)"` reservados para el sistema (bloqueados en POST/PATCH/DELETE y ocultos en el frontend)
- **Transacciones**: CRUD vinculado a cuenta + categoria + proyecto (opcional). Monto mostrado con la moneda de la cuenta seleccionada. Lista con iconos de ingreso/gasto, fecha, monto formateado por moneda, badge de categoria
- **Búsqueda y filtros en Transacciones**: barra de búsqueda por descripción/categoría/cuenta; filtro rápido de tipo (Todos/Ingresos/Gastos); select de cuenta (visible si hay 2+); select de categoría (visible si hay 2+); botón "Limpiar filtros" contextual. Todos los filtros son acumulativos (AND) y se aplican en tiempo real
- **Resumen multi-moneda en Transacciones**: con una sola moneda muestra 3 cards (Ingresos/Gastos/Balance); con múltiples monedas (ARS+USD+EUR, etc.) muestra tabla con fila por moneda. El header de cada mes también muestra totales por moneda. Ya no se hardcodea ARS como moneda del resumen
- **Presupuestos**: CRUD basico (nombre, monto, descripcion). Cards con monto formateado y responsive
- **Transferencias entre cuentas**: boton "Transferir" visible cuando hay 2+ cuentas. Dialog con cuenta origen, destino, monto, tasa de cambio y preview del monto en moneda destino. Crea 2 transacciones atomicas (egreso categoría "Transferencia (salida)" + ingreso categoría "Transferencia (entrada)"). Soporta tasa de cambio para cuentas en distintas monedas
- **Modelo de balance (sin tabla intermedia)**: `FinancialAccount.balance` = saldo de partida (inmutable luego de crear la cuenta). Balance real mostrado = balance_inicial + sum(income txns) - sum(expense txns), calculado en GET /accounts incluyendo transferencias, historico completo y transacciones de cualquier fecha
- **Filtro por mes en Cuentas y Transacciones**: navegacion anterior/siguiente/"Todos" compartida. Balance de cuenta es dinámico: "Todos" = balance acumulado total; mes seleccionado = balance al cierre de ese mes (balance_total - impacto de transacciones posteriores al mes). Cada cuenta muestra también resumen del periodo (Ingresos/Gastos/Neto) y desglose mensual completo
- **Desglose mensual por cuenta**: calculado client-side agrupando transactions por `accountId` + mes. No requiere tabla adicional
- Presupuestos con estado (pending/approved/rejected) y accion de convertir a transaccion
- Todas las operaciones usan Dialog de shadcn para crear/editar y Sonner toast para confirmar eliminacion
- Requiere al menos una cuenta y una categoria de usuario para crear transacciones
- **Responsive**: layout flex-col en mobile para filtros, filas de transaccion en 2 líneas (descripción+monto arriba, fecha+cuenta+badge abajo), desglose de cuenta colapsable con ChevronDown
- Componente principal: `components/workspace/workspace-finance.tsx`

#### Dashboard de Finanzas (`tab: "dashboard"`)
- Consume `GET /api/workspaces/[id]/finance/dashboard` → `FinanceAnalyticsService.getDashboard()`
- **KPI Cards** por moneda: balance neto acumulado, ingresos y gastos del mes actual, variación % vs mes anterior
- **Balance por cuenta** (BarChart): balance actual de cada cuenta (`FinancialAccount.balance`), coloreado verde/rojo según signo
- **Evolución mensual** (AreaChart): ingresos, gastos y balance neto por moneda a lo largo del tiempo
- **Ingresos vs Gastos** (BarChart agrupado): comparativa mensual por moneda
- **Gastos por categoría** (Donut PieChart): distribución del mes actual por moneda, excluye transferencias
- **Ingresos por categoría** (Donut PieChart): misma lógica para ingresos del mes actual
- Componente: `components/finance/finance-dashboard.tsx`

#### Reportes de Finanzas (`tab: "reportes"`)
- Consume `GET /api/workspaces/[id]/finance/reports?dateFrom=&dateTo=&accountId=&categoryId=&projectId=` → `FinanceAnalyticsService.getReports()`
- **Filtros**: rango de fechas (desde/hasta), cuenta, categoría, proyecto — todos opcionales y acumulativos
- **Presupuesto vs Real** (BarChart): suma total de presupuestos vs gasto real del período (nota: Budget no tiene FK a transacciones, comparación es a nivel workspace)
- **Gastos por cuenta — mensual** (BarChart apilado): evolución de gastos mensuales por cuenta, cada cuenta con color distinto
- **Top 5 categorías de gasto** (BarChart horizontal): ranking de categorías con mayor gasto en el período
- **Transacciones por mes** (BarChart): cantidad de operaciones por mes
- **Gastos por proyecto** (BarChart horizontal): monto gastado en transacciones vinculadas a proyectos (`FinancialTransaction.projectId`)
- Componente: `components/finance/finance-reports.tsx`

#### Servicio de analytics (`lib/services/finance-analytics.service.ts`)
- Usa el singleton `prisma` de `@/lib/prisma` (no instancia `PrismaClient` directo)
- Excluye siempre las transferencias del sistema (`"Transferencia (entrada)"` / `"Transferencia (salida)"`) de todos los cálculos
- Trabaja con objetos `Date` de Prisma directamente (no `parseISO()` — los campos `DateTime` llegan como `Date`)
- Filtros de fecha convierten strings de query params a `new Date(dateFrom)` antes de pasarlos a Prisma

#### Gráficos disponibles (Recharts)
| Componente | Tipo | Datos |
|---|---|---|
| `BalanceAreaChart` | AreaChart | Evolución mensual income/expense/balance por moneda |
| `IncomeExpenseBar` | BarChart | Income vs expense por mes y moneda |
| `CategoryPie` | PieChart (donut) | Distribución por categoría (gastos o ingresos) del mes actual |
| `AccountBalanceChart` | BarChart | Balance actual por cuenta (verde/rojo según signo) |
| `BudgetVsActualChart` | BarChart | Total presupuestado vs gastado real |
| `AccountStackedChart` | BarChart apilado | Gastos mensuales por cuenta (colores distintos por cuenta) |
| `TopCategoriesChart` | BarChart horizontal | Top 5 categorías de gasto |
| `TransactionsPerMonthChart` | BarChart | Cantidad de transacciones por mes |
| `ProjectExpensesChart` | BarChart horizontal | Gasto total por proyecto vinculado |

#### API routes de analytics
| Ruta | Descripción |
|---|---|
| `GET /api/workspaces/[id]/finance/dashboard` | KPIs, evolución mensual, pie de categorías, balance por cuenta |
| `GET /api/workspaces/[id]/finance/reports` | Budget vs actual, stacked por cuenta, top categorías, txn count, gasto por proyecto |

#### Notas para IA — módulo de analytics
- `FinanceDashboard` y `FinanceReports` son client components que hacen `fetch` a sus respectivas API routes
- El servicio `FinanceAnalyticsService` tiene métodos estáticos `getDashboard()` y `getReports()` con tipos exportados
- Los gráficos viven en `components/finance/charts/` y son componentes puramente presentacionales (reciben `data` como prop)
- `recharts` ya está instalado como dependencia del proyecto

### Eliminacion segura
- Workspace, proyecto, tarea y entidades financieras con confirmacion via Sonner toast
- Cascade delete en la API (elimina datos dependientes via `$transaction` o `onDelete: Cascade` en Prisma)

### Control de acceso

Todas las API routes estan protegidas con doble verificacion:

1. **Autenticacion**: `auth()` verifica que el usuario tenga sesion activa (401 si no)
2. **Autorizacion**: Se verifica que el usuario sea miembro del workspace correspondiente (403 si no)

Para proyectos y tareas, la verificacion sube por la cadena: tarea -> proyecto -> workspace -> membresia.

### Manejo de errores en API routes

Todas las API routes de finanzas y entidades principales tienen `try/catch` global. En Next.js 16 (Turbopack), las excepciones no capturadas en route handlers producen 404 en lugar de 500, ocultando el error real. Con el `try/catch`:
- Errores de Prisma (tabla inexistente, constraint violation) → 500 con mensaje + `console.error` en terminal
- El error real es visible en los logs del servidor de desarrollo

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
| **Finanzas — Transferencias** | | |
| POST | `/api/workspaces/[workspaceId]/transfers` | Transferir entre cuentas (body: fromAccountId, toAccountId, amount, rate?, description?, date?) |

### Notas para IA
- Todos los endpoints validan sesión y membresía antes de operar.
- **API routes de finanzas:** `app/api/workspaces/[workspaceId]/{accounts,categories,transactions,budgets}/`
- **Frontend de finanzas:** `components/workspace/workspace-finance.tsx` (componente client-side con tabs internas)
- **Integración:** sidebar en `workspace-sidebar.tsx` (NAV_ITEMS), sección en `workspace-content.tsx`
- **Modelos de finanzas:** `prisma/schema.prisma` (sección FINANCE MODULE, línea ~229)
- **Patrón de datos:** Finanzas usa fetch client-side (useEffect + fetch a API routes), no server queries
- **Migraciones:** `prisma/migrations/migrationFinanzas/migrationFinanzas.sql` contiene la migración SQL para Supabase
- **Transferencias:** `POST /transfers` crea 2 transacciones atómicas (egreso con categoría "Transferencia (salida)", ingreso con "Transferencia (entrada)"). Los nombres son distintos para respetar el `@@unique([workspaceId, name])` de `TransactionCategory`. Soporta tasa de cambio (`rate`). No modifica `balance` directamente — el balance se recomputa en GET /accounts. Esas categorías de sistema son invisibles en el frontend (filtradas con `SYSTEM_CATEGORY_NAMES`) y no pueden crearse, editarse ni eliminarse manualmente (bloqueadas en la API)
- **Modelo de balance:** `FinancialAccount.balance` = saldo de partida (set al crear la cuenta, no se modifica por transacciones). `GET /accounts` retorna `balance = stored + sum(tx impacts)` incluyendo todas las transacciones históricas. Transacciones CRUD (POST/PATCH/DELETE) NO tocan el campo `balance` de la cuenta. Esto garantiza que transacciones de cualquier fecha (históricas o nuevas) impacten siempre correctamente
- **Desglose mensual:** calculado client-side desde el array `transactions` agrupando por `accountId` + mes. La tabla `FinancialTransaction` (con `accountId`, `date`, `amount`, `category.type`) tiene todo el detalle necesario para reconstruir el historial completo mes a mes por cuenta. No se necesita tabla intermedia

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
│       ├── budgets/{route.ts,[budgetId]/route.ts}
│       └── transfers/route.ts
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
