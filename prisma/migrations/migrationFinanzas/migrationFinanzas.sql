-- =========================================================
-- BASE TASKMANAGER + FINANCE
-- SAFE / IDEMPOTENTE PARA POSTGRES (SUPABASE)
-- =========================================================

-- =========================
-- TABLES
-- =========================

CREATE TABLE IF NOT EXISTS "departments" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "departments_name_key"
ON "departments"("name");


CREATE TABLE IF NOT EXISTS "file_types" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '',
    "extension" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "file_types_name_key"
ON "file_types"("name");


CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "auth0Id" TEXT,
    "avatar" TEXT NOT NULL DEFAULT '',
    "role" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key"
ON "users"("email");

CREATE UNIQUE INDEX IF NOT EXISTS "users_auth0Id_key"
ON "users"("auth0Id");


CREATE TABLE IF NOT EXISTS "workspaces" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);


CREATE TABLE IF NOT EXISTS "workspace_members" (
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("workspaceId","userId")
);


CREATE TABLE IF NOT EXISTS "projects" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "workspaceId" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);


CREATE TABLE IF NOT EXISTS "project_links" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "task_columns" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '',
    "icon" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS "priority_levels" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '',
    "bgColor" TEXT NOT NULL DEFAULT '',
    "dotColor" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS "project_members" (
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId","projectId")
);


CREATE TABLE IF NOT EXISTS "tasks" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priorityId" TEXT NOT NULL,
    "columnId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "assigneeId" TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS "tags" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "tags_name_key"
ON "tags"("name");


CREATE TABLE IF NOT EXISTS "files" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "projectId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS "_DepartmentToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    PRIMARY KEY ("A","B")
);

CREATE TABLE IF NOT EXISTS "_TagToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    PRIMARY KEY ("A","B")
);


-- =========================
-- FINANCE
-- =========================

CREATE TABLE IF NOT EXISTS "financial_accounts" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "balance" FLOAT NOT NULL DEFAULT 0,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);


CREATE TABLE IF NOT EXISTS "transaction_categories" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    UNIQUE("workspaceId","name")
);


CREATE TABLE IF NOT EXISTS "financial_transactions" (
    "id" TEXT PRIMARY KEY,
    "amount" FLOAT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspaceId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);


CREATE TABLE IF NOT EXISTS "transaction_attachments" (
    "id" TEXT PRIMARY KEY,
    "url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS "budgets" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "amount" FLOAT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add status column to existing budgets table (safe for re-runs)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'budgets' AND column_name = 'status'
  ) THEN
    ALTER TABLE "budgets" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';
  END IF;
END $$;


-- =========================================================
-- FOREIGN KEYS (SAFE RECREATE)
-- =========================================================

-- Helper pattern:
-- DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT

ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS "users_departmentId_fkey";
ALTER TABLE "users"
ADD CONSTRAINT "users_departmentId_fkey"
FOREIGN KEY ("departmentId")
REFERENCES "departments"("id")
ON DELETE RESTRICT;


ALTER TABLE "workspace_members"
DROP CONSTRAINT IF EXISTS "workspace_members_workspaceId_fkey";
ALTER TABLE "workspace_members"
ADD CONSTRAINT "workspace_members_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE;

ALTER TABLE "workspace_members"
DROP CONSTRAINT IF EXISTS "workspace_members_userId_fkey";
ALTER TABLE "workspace_members"
ADD CONSTRAINT "workspace_members_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE;


