export type Priority = "urgente" | "alta" | "media" | "baja";
export type Department =
  | "desarrollo"
  | "data"
  | "marketing"
  | "branding"
  | "n8n";

export type ViewMode = "kanban" | "lista" | "calendario";

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
  icon: string;
}

export interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: Department;
  initials: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  type: "pdf" | "image" | "doc" | "spreadsheet" | "video" | "other";
  size: string;
  uploadedAt: string;
  uploadedBy: TeamMember;
  taskId: string;
  taskTitle: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priority: Priority;
  department: Department;
  assignee: TeamMember;
  tags: string[];
  dueDate: string;
  comments: number;
  attachments: number;
  files: FileAttachment[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  department: Department;
  progress: number;
  tasksTotal: number;
  tasksDone: number;
  members: TeamMember[];
  color: string;
}

export interface FilterState {
  search: string;
  priorities: Priority[];
  assignees: string[];
  tags: string[];
}

export const EMPTY_FILTERS: FilterState = {
  search: "",
  priorities: [],
  assignees: [],
  tags: [],
};

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "Esteban A.",
    avatar: "",
    role: "Developer",
    department: "desarrollo",
    initials: "EA",
  },
  {
    id: "2",
    name: "Ezequiel B.",
    avatar: "",
    role: "Data Analyst",
    department: "data",
    initials: "EB",
  },
  {
    id: "3",
    name: "Mariano B.",
    avatar: "",
    role: "Automation Manager",
    department: "n8n",
    initials: "MBog",
  },
  {
    id: "4",
    name: "Mauricio B.",
    avatar: "",
    role: "Marketing Manager",
    department: "marketing",
    initials: "MBou",
  },
  {
    id: "5",
    name: "Sofia R.",
    avatar: "",
    role: "Brand Strategist",
    department: "branding",
    initials: "SR",
  },
];

export const DEPARTMENT_CONFIG: Record<
   
  Department,
  { label: string; color: string; bgColor: string }
> = {
  desarrollo: {
    label: "Desarrollo",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
  },
  data: {
    label: "Data",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/15",
  },
  marketing: {
    label: "Marketing",
    color: "text-amber-400",
    bgColor: "bg-amber-500/15",
  },
  branding: {
    label: "Branding",
    color: "text-pink-400",
    bgColor: "bg-pink-500/15",
  },
  n8n: {
    label: "N8N",
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
  },
};

export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  urgente: {
    label: "Urgente",
    color: "text-red-400",
    bgColor: "bg-red-500/15",
    dotColor: "bg-red-500",
  },
  alta: {
    label: "Alta",
    color: "text-orange-400",
    bgColor: "bg-orange-500/15",
    dotColor: "bg-orange-500",
  },
  media: {
    label: "Media",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/15",
    dotColor: "bg-yellow-500",
  },
  baja: {
    label: "Baja",
    color: "text-blue-400",
    bgColor: "bg-blue-500/15",
    dotColor: "bg-blue-400",
  },
};

export const FILE_TYPE_CONFIG: Record<
  FileAttachment["type"],
  { label: string; color: string; bgColor: string; extension: string }
> = {
  pdf: {
    label: "PDF",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    extension: "PDF",
  },
  image: {
    label: "Imagen",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    extension: "IMG",
  },
  doc: {
    label: "Documento",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    extension: "DOC",
  },
  spreadsheet: {
    label: "Planilla",
    color: "text-green-600",
    bgColor: "bg-green-500/10",
    extension: "XLS",
  },
  video: {
    label: "Video",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    extension: "VID",
  },
  other: {
    label: "Otro",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    extension: "FILE",
  },
};

export const DEFAULT_COLUMNS: KanbanColumn[] = [
  {
    id: "pendiente",
    label: "Pendiente",
    color: "text-muted-foreground",
    icon: "circle",
  },
  {
    id: "en_progreso",
    label: "En Progreso",
    color: "text-blue-400",
    icon: "loader",
  },
  {
    id: "revision",
    label: "En Revision",
    color: "text-amber-400",
    icon: "eye",
  },
  {
    id: "completada",
    label: "Completada",
    color: "text-emerald-400",
    icon: "check",
  },
];

export const PROJECTS: Project[] = [
  {
    id: "p1",
    name: "App Mobile v2",
    description: "Rediseno completo de la aplicacion mobile",
    department: "desarrollo",
    progress: 68,
    tasksTotal: 24,
    tasksDone: 16,
    members: [TEAM_MEMBERS[0], TEAM_MEMBERS[3]],
    color: "bg-blue-500",
  },
  {
    id: "p2",
    name: "Dashboard Analytics",
    description: "Panel de analisis de datos del cliente",
    department: "data",
    progress: 42,
    tasksTotal: 18,
    tasksDone: 7,
    members: [TEAM_MEMBERS[1], TEAM_MEMBERS[0]],
    color: "bg-emerald-500",
  },
  {
    id: "p3",
    name: "Campana Q1 2026",
    description: "Lanzamiento de campana primer trimestre",
    department: "marketing",
    progress: 85,
    tasksTotal: 12,
    tasksDone: 10,
    members: [TEAM_MEMBERS[3], TEAM_MEMBERS[4]],
    color: "bg-amber-500",
  },
  {
    id: "p4",
    name: "Rebranding Logo",
    description: "Nueva identidad visual de la marca",
    department: "branding",
    progress: 30,
    tasksTotal: 8,
    tasksDone: 2,
    members: [TEAM_MEMBERS[4], TEAM_MEMBERS[3]],
    color: "bg-pink-500",
  },
  {
    id: "p5",
    name: "Automatizaciones CRM",
    description: "Flujos automatizados para gestion de leads",
    department: "n8n",
    progress: 55,
    tasksTotal: 15,
    tasksDone: 8,
    members: [TEAM_MEMBERS[2], TEAM_MEMBERS[0]],
    color: "bg-orange-500",
  },
];

// Helper to create files for demo tasks
function makeFiles(
  taskId: string,
  taskTitle: string,
  items: { name: string; type: FileAttachment["type"]; size: string; uploadedBy: TeamMember; date: string }[]
): FileAttachment[] {
  return items.map((item, i) => ({
    id: `${taskId}-f${i + 1}`,
    name: item.name,
    type: item.type,
    size: item.size,
    uploadedAt: item.date,
    uploadedBy: item.uploadedBy,
    taskId,
    taskTitle,
    url: "#",
  }));
}

export const INITIAL_TASKS: Task[] = [
  {
    id: "t1",
    title: "Implementar autenticacion OAuth",
    description:
      "Agregar login con Google y GitHub al sistema de autenticacion",
    columnId: "en_progreso",
    priority: "alta",
    department: "desarrollo",
    assignee: TEAM_MEMBERS[0],
    tags: ["backend", "auth"],
    dueDate: "2026-02-10",
    comments: 5,
    attachments: 2,
    files: makeFiles("t1", "Implementar autenticacion OAuth", [
      { name: "oauth-spec.pdf", type: "pdf", size: "1.2 MB", uploadedBy: TEAM_MEMBERS[0], date: "2026-01-29" },
      { name: "auth-flow-diagram.png", type: "image", size: "340 KB", uploadedBy: TEAM_MEMBERS[0], date: "2026-01-30" },
    ]),
    createdAt: "2026-01-28",
  },
  {
    id: "t2",
    title: "Disenar landing page",
    description: "Crear el diseno de la nueva landing page del producto",
    columnId: "revision",
    priority: "media",
    department: "branding",
    assignee: TEAM_MEMBERS[4],
    tags: ["diseno", "ui"],
    dueDate: "2026-02-08",
    comments: 12,
    attachments: 8,
    files: makeFiles("t2", "Disenar landing page", [
      { name: "landing-mockup-v3.png", type: "image", size: "2.8 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-01" },
      { name: "landing-copy.docx", type: "doc", size: "45 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-01-28" },
      { name: "color-palette.png", type: "image", size: "180 KB", uploadedBy: TEAM_MEMBERS[4], date: "2026-01-27" },
      { name: "brand-guidelines.pdf", type: "pdf", size: "5.4 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-01-26" },
      { name: "competitor-analysis.xlsx", type: "spreadsheet", size: "320 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-01-25" },
      { name: "wireframes-v2.pdf", type: "pdf", size: "1.8 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-01-29" },
      { name: "hero-animation.mp4", type: "video", size: "12.5 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-02" },
      { name: "typography-specs.pdf", type: "pdf", size: "890 KB", uploadedBy: TEAM_MEMBERS[4], date: "2026-01-30" },
    ]),
    createdAt: "2026-01-25",
  },
  {
    id: "t3",
    title: "Pipeline de datos ETL",
    description:
      "Configurar pipeline de extraccion y transformacion de datos",
    columnId: "pendiente",
    priority: "urgente",
    department: "data",
    assignee: TEAM_MEMBERS[1],
    tags: ["etl", "python"],
    dueDate: "2026-02-06",
    comments: 3,
    attachments: 1,
    files: makeFiles("t3", "Pipeline de datos ETL", [
      { name: "etl-requirements.docx", type: "doc", size: "78 KB", uploadedBy: TEAM_MEMBERS[1], date: "2026-01-31" },
    ]),
    createdAt: "2026-01-30",
  },
  {
    id: "t4",
    title: "Newsletter mensual",
    description: "Redactar y enviar newsletter del mes de febrero",
    columnId: "pendiente",
    priority: "media",
    department: "marketing",
    assignee: TEAM_MEMBERS[3],
    tags: ["email", "contenido"],
    dueDate: "2026-02-15",
    comments: 1,
    attachments: 0,
    files: [],
    createdAt: "2026-02-01",
  },
  {
    id: "t5",
    title: "Optimizar queries de dashboard",
    description: "Mejorar rendimiento de las consultas SQL del dashboard",
    columnId: "en_progreso",
    priority: "alta",
    department: "data",
    assignee: TEAM_MEMBERS[1],
    tags: ["sql", "performance"],
    dueDate: "2026-02-12",
    comments: 7,
    attachments: 0,
    files: [],
    createdAt: "2026-01-29",
  },
  {
    id: "t6",
    title: "Flujo de onboarding N8N",
    description:
      "Crear automatizacion para bienvenida de nuevos usuarios via N8N",
    columnId: "en_progreso",
    priority: "media",
    department: "n8n",
    assignee: TEAM_MEMBERS[2],
    tags: ["automatizacion", "workflow"],
    dueDate: "2026-02-14",
    comments: 4,
    attachments: 3,
    files: makeFiles("t6", "Flujo de onboarding N8N", [
      { name: "workflow-diagram.png", type: "image", size: "420 KB", uploadedBy: TEAM_MEMBERS[2], date: "2026-02-03" },
      { name: "n8n-export.json", type: "other", size: "12 KB", uploadedBy: TEAM_MEMBERS[2], date: "2026-02-03" },
      { name: "onboarding-email-template.docx", type: "doc", size: "56 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-04" },
    ]),
    createdAt: "2026-02-02",
  },
  {
    id: "t7",
    title: "Manual de marca",
    description: "Documentar guias de estilo y uso de marca",
    columnId: "pendiente",
    priority: "baja",
    department: "branding",
    assignee: TEAM_MEMBERS[4],
    tags: ["documentacion", "marca"],
    dueDate: "2026-02-20",
    comments: 2,
    attachments: 5,
    files: makeFiles("t7", "Manual de marca", [
      { name: "manual-marca-draft.pdf", type: "pdf", size: "8.2 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-02" },
      { name: "logos-pack.zip", type: "other", size: "15.6 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-01" },
      { name: "paleta-colores.png", type: "image", size: "290 KB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-01" },
      { name: "tipografia-seleccion.pdf", type: "pdf", size: "1.1 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-03" },
      { name: "iconografia-v1.png", type: "image", size: "560 KB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-03" },
    ]),
    createdAt: "2026-02-01",
  },
  {
    id: "t8",
    title: "A/B Testing campana email",
    description: "Configurar y ejecutar tests A/B para campana de email",
    columnId: "completada",
    priority: "alta",
    department: "marketing",
    assignee: TEAM_MEMBERS[3],
    tags: ["testing", "email"],
    dueDate: "2026-02-05",
    comments: 9,
    attachments: 4,
    files: makeFiles("t8", "A/B Testing campana email", [
      { name: "resultados-ab-test.xlsx", type: "spreadsheet", size: "245 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-05" },
      { name: "variante-a-screenshot.png", type: "image", size: "380 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-04" },
      { name: "variante-b-screenshot.png", type: "image", size: "410 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-04" },
      { name: "informe-final.pdf", type: "pdf", size: "2.1 MB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-05" },
    ]),
    createdAt: "2026-01-20",
  },
  {
    id: "t9",
    title: "API de notificaciones push",
    description:
      "Desarrollar microservicio para envio de notificaciones push",
    columnId: "pendiente",
    priority: "alta",
    department: "desarrollo",
    assignee: TEAM_MEMBERS[0],
    tags: ["backend", "api"],
    dueDate: "2026-02-18",
    comments: 0,
    attachments: 1,
    files: makeFiles("t9", "API de notificaciones push", [
      { name: "push-api-spec.pdf", type: "pdf", size: "420 KB", uploadedBy: TEAM_MEMBERS[0], date: "2026-02-03" },
    ]),
    createdAt: "2026-02-03",
  },
  {
    id: "t10",
    title: "Reporte de metricas semanales",
    description: "Generar y presentar reporte de KPIs de la semana",
    columnId: "completada",
    priority: "media",
    department: "data",
    assignee: TEAM_MEMBERS[1],
    tags: ["reportes", "kpi"],
    dueDate: "2026-02-04",
    comments: 6,
    attachments: 2,
    files: makeFiles("t10", "Reporte de metricas semanales", [
      { name: "kpi-semana-5.xlsx", type: "spreadsheet", size: "180 KB", uploadedBy: TEAM_MEMBERS[1], date: "2026-02-04" },
      { name: "presentacion-kpis.pdf", type: "pdf", size: "3.2 MB", uploadedBy: TEAM_MEMBERS[1], date: "2026-02-04" },
    ]),
    createdAt: "2026-01-27",
  },
  {
    id: "t11",
    title: "Sync con Hubspot via N8N",
    description:
      "Automatizar sincronizacion de contactos entre CRM y Hubspot",
    columnId: "revision",
    priority: "urgente",
    department: "n8n",
    assignee: TEAM_MEMBERS[2],
    tags: ["integracion", "crm"],
    dueDate: "2026-02-07",
    comments: 8,
    attachments: 2,
    files: makeFiles("t11", "Sync con Hubspot via N8N", [
      { name: "hubspot-mapping.xlsx", type: "spreadsheet", size: "95 KB", uploadedBy: TEAM_MEMBERS[2], date: "2026-01-28" },
      { name: "sync-flow-diagram.png", type: "image", size: "550 KB", uploadedBy: TEAM_MEMBERS[2], date: "2026-01-29" },
    ]),
    createdAt: "2026-01-26",
  },
  {
    id: "t12",
    title: "Contenido redes sociales",
    description: "Planificar y crear contenido para Instagram y LinkedIn",
    columnId: "en_progreso",
    priority: "media",
    department: "marketing",
    assignee: TEAM_MEMBERS[3],
    tags: ["social", "contenido"],
    dueDate: "2026-02-09",
    comments: 3,
    attachments: 6,
    files: makeFiles("t12", "Contenido redes sociales", [
      { name: "calendario-feb.xlsx", type: "spreadsheet", size: "120 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-01" },
      { name: "post-instagram-01.png", type: "image", size: "1.8 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-02" },
      { name: "post-instagram-02.png", type: "image", size: "2.1 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-02" },
      { name: "copy-linkedin.docx", type: "doc", size: "34 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-03" },
      { name: "reel-promo.mp4", type: "video", size: "28.4 MB", uploadedBy: TEAM_MEMBERS[4], date: "2026-02-04" },
      { name: "hashtag-research.docx", type: "doc", size: "22 KB", uploadedBy: TEAM_MEMBERS[3], date: "2026-02-01" },
    ]),
    createdAt: "2026-02-01",
  },
];

// Utility: get all files from a task array
export function getAllFiles(tasks: Task[]): FileAttachment[] {
  return tasks.flatMap((t) => t.files);
}

// Utility: get all unique tags
export function getAllTags(tasks: Task[]): string[] {
  const set = new Set<string>();
  for (const t of tasks) {
    for (const tag of t.tags) set.add(tag);
  }
  return Array.from(set).sort();
}

// Filter tasks helper
export function filterTasks(
  tasks: Task[],
  department: Department | "todos",
  filters: FilterState
): Task[] {
  let result = tasks;

  if (department !== "todos") {
    result = result.filter((t) => t.department === department);
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  if (filters.priorities.length > 0) {
    result = result.filter((t) => filters.priorities.includes(t.priority));
  }

  if (filters.assignees.length > 0) {
    result = result.filter((t) => filters.assignees.includes(t.assignee.id));
  }

  if (filters.tags.length > 0) {
    result = result.filter((t) =>
      filters.tags.some((tag) => t.tags.includes(tag))
    );
  }

  return result;
}
