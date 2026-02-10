"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Briefcase,
  FolderKanban,
  CheckSquare,
  Users,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  label: string;
  color: string;
  bgColor: string;
}

interface WorkspaceInfo {
  id: string;
  name: string;
  description: string;
  role: string;
  joinedAt: string;
  projectCount: number;
  memberCount: number;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  status: string;
  avatar: string;
  department: Department;
  workspaces: WorkspaceInfo[];
  stats: {
    totalWorkspaces: number;
    totalProjects: number;
    totalTasks: number;
    tasksByStatus: Record<string, number>;
  };
  departments: Department[];
}

export default function MiPerfil({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");
  const [form, setForm] = useState({
    name: "",
    initials: "",
    departmentId: "",
  });

  useEffect(() => {
    if (open) {
      fetchProfile();
    }
  }, [open]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) throw new Error();
      const data: ProfileData = await res.json();
      setProfileData(data);
      setForm({
        name: data.name,
        initials: data.initials,
        departmentId: data.department.id,
      });
    } catch {
      toast.error("Error al cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          initials: form.initials.trim(),
          departmentId: form.departmentId,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar");
      }
      toast.success("Perfil actualizado");
      router.refresh();
      await fetchProfile();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const selectedDept = profileData?.departments.find(
    (d) => d.id === form.departmentId
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        {loading || !profileData ? (
          <ProfileSkeleton />
        ) : (
          <>
            {/* Header */}
            <DialogHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">
                    {profileData.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl">
                    {profileData.name}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {profileData.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={
                        profileData.status === "active"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {profileData.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {profileData.role}
                    </Badge>
                    {selectedDept && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          selectedDept.bgColor,
                          selectedDept.color
                        )}
                      >
                        {selectedDept.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Separator className="my-2" />

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full">
                <TabsTrigger value="perfil" className="flex-1">
                  Perfil
                </TabsTrigger>
                <TabsTrigger value="workspaces" className="flex-1">
                  Workspaces
                </TabsTrigger>
                <TabsTrigger value="resumen" className="flex-1">
                  Resumen
                </TabsTrigger>
              </TabsList>

              {/* Tab Perfil */}
              <TabsContent value="perfil" className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="initials">Iniciales</Label>
                    <Input
                      id="initials"
                      value={form.initials}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          initials: e.target.value.toUpperCase().slice(0, 4),
                        })
                      }
                      maxLength={4}
                      className="uppercase"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Departamento</Label>
                  <Select
                    value={form.departmentId}
                    onValueChange={(value) =>
                      setForm({ ...form, departmentId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {profileData.departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <span className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-block h-2 w-2 rounded-full",
                                dept.bgColor
                              )}
                            />
                            {dept.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profileData.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Input value={profileData.role} disabled />
                  </div>
                </div>
              </TabsContent>

              {/* Tab Workspaces */}
              <TabsContent value="workspaces" className="py-2">
                {profileData.workspaces.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Briefcase className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No formas parte de ningún workspace todavía
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {profileData.workspaces.map((ws) => (
                      <Link
                        key={ws.id}
                        href={`/workspace/${ws.id}`}
                        onClick={onClose}
                        className="block rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-sm">
                              {ws.name}
                            </p>
                            {ws.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {ws.description}
                              </p>
                            )}
                          </div>
                          <Badge variant="secondary" className="text-xs ml-2 shrink-0">
                            {ws.role}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FolderKanban className="h-3.5 w-3.5" />
                            {ws.projectCount} proyectos
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {ws.memberCount} miembros
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(ws.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab Resumen */}
              <TabsContent value="resumen" className="py-2">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    icon={Briefcase}
                    label="Workspaces"
                    value={profileData.stats.totalWorkspaces}
                  />
                  <StatCard
                    icon={FolderKanban}
                    label="Proyectos"
                    value={profileData.stats.totalProjects}
                  />
                  <StatCard
                    icon={CheckSquare}
                    label="Tareas"
                    value={profileData.stats.totalTasks}
                  />
                </div>

                {Object.keys(profileData.stats.tasksByStatus).length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Tareas por estado
                    </p>
                    <div className="space-y-2">
                      {Object.entries(profileData.stats.tasksByStatus).map(
                        ([status, count]) => (
                          <div
                            key={status}
                            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                          >
                            <span className="text-sm capitalize">
                              {status}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {count}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Footer - solo en tab perfil */}
            {activeTab === "perfil" && (
              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border p-4 text-center">
      <Icon className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-10 w-full rounded-md" />
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}
