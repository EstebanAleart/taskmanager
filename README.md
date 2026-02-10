# TaskManager

Sistema de gestion de tareas y proyectos para equipos de trabajo. Organiza workspaces, proyectos con tableros Kanban, asigna responsables por departamento y controla el progreso en tiempo real.

## Tech Stack

- **Framework:** Next.js 16 (App Router, React 19, TypeScript)
- **Base de datos:** PostgreSQL (Supabase) + Prisma ORM
- **Autenticacion:** Auth0 via NextAuth v5
- **UI:** shadcn/ui, Tailwind CSS, Lucide Icons
- **Notificaciones:** Sonner (toasts)
- **Package manager:** pnpm

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

## API Routes

Todas las rutas (excepto auth y seed) requieren sesion activa y membresia al workspace.

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | Auth (NextAuth + Auth0) |
| GET/PUT | `/api/user/profile` | Obtener/actualizar perfil del usuario |
| POST | `/api/workspaces` | Crear workspace (auto-owner) |
| DELETE | `/api/workspaces/[id]` | Eliminar workspace (cascade) |
| GET | `/api/workspaces/[id]/available-users` | Usuarios disponibles para invitar |
| POST | `/api/workspaces/[id]/members` | Agregar miembro |
| DELETE | `/api/workspaces/[id]/members/[userId]` | Remover miembro |
| POST | `/api/projects` | Crear proyecto |
| DELETE | `/api/projects/[id]` | Eliminar proyecto (cascade) |
| POST | `/api/projects/[id]/columns` | Crear columna |
| PATCH | `/api/projects/[id]/notes` | Guardar notas |
| POST | `/api/projects/[id]/links` | Crear link |
| DELETE | `/api/projects/[id]/links/[linkId]` | Eliminar link |
| POST | `/api/tasks` | Crear tarea |
| PATCH | `/api/tasks/[id]` | Editar tarea (todos los campos) |
| DELETE | `/api/tasks/[id]` | Eliminar tarea |
| GET | `/api/seed` | Seedear datos iniciales |

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
