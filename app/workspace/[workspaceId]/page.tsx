import { notFound } from "next/navigation";
import { getWorkspace } from "@/lib/actions/workspace";
import { getDepartments } from "@/lib/actions/project";
import { WorkspaceContent } from "@/components/workspace/workspace-content";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ section?: string }>;
}

export default async function WorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const { workspaceId } = await params;
  const { section } = await searchParams;
  const workspace = await getWorkspace(workspaceId);

  if (!workspace) {
    notFound();
  }

  const departments = await getDepartments();

  return (
    <WorkspaceContent
      workspace={workspace}
      departments={departments}
      activeSection={section || "notas"}
    />
  );
}
