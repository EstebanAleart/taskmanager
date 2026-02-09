"use client";

import { useState } from "react";
import { LinkIcon, Plus, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface ProjectLinksProps {
  projectId: string;
  links: LinkItem[];
}

export function ProjectLinks({ projectId, links }: ProjectLinksProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdd = async () => {
    if (!title.trim() || !url.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/projects/${projectId}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), url: url.trim() }),
      });
      setTitle("");
      setUrl("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/projects/${projectId}/links/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-blue-400" />
          <h2 className="font-display text-lg font-semibold">Links del proyecto</h2>
        </div>

        <div className="mb-4 flex flex-col gap-2">
          {links.length === 0 && (
            <p className="text-sm text-muted-foreground">No hay links todavia.</p>
          )}
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-foreground transition-colors hover:text-primary"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                {link.title}
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(link.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Titulo"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
          />
          <Button
            onClick={handleAdd}
            disabled={!title.trim() || !url.trim() || loading}
            size="icon"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
