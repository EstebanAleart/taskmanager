-- =========================================================
-- FOREIGN KEYS + INDEXES
-- TASKMANAGER + FINANCE
-- =========================================================

-- =========================
-- USERS -> DEPARTMENTS
-- =========================
ALTER TABLE "users"
DROP CONSTRAINT IF EXISTS "users_departmentId_fkey";

ALTER TABLE "users"
ADD CONSTRAINT "users_departmentId_fkey"
FOREIGN KEY ("departmentId")
REFERENCES "departments"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;


-- =========================
-- WORKSPACE MEMBERS
-- =========================
ALTER TABLE "workspace_members"
DROP CONSTRAINT IF EXISTS "workspace_members_workspaceId_fkey";

ALTER TABLE "workspace_members"
ADD CONSTRAINT "workspace_members_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "workspace_members"
DROP CONSTRAINT IF EXISTS "workspace_members_userId_fkey";

ALTER TABLE "workspace_members"
ADD CONSTRAINT "workspace_members_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "workspace_members_userId_idx"
ON "workspace_members"("userId");

CREATE INDEX IF NOT EXISTS "workspace_members_workspaceId_idx"
ON "workspace_members"("workspaceId");


-- =========================
-- PROJECTS -> WORKSPACES
-- =========================
ALTER TABLE "projects"
DROP CONSTRAINT IF EXISTS "projects_workspaceId_fkey";

ALTER TABLE "projects"
ADD CONSTRAINT "projects_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "projects_workspaceId_idx"
ON "projects"("workspaceId");


-- =========================
-- PROJECT LINKS -> PROJECTS
-- =========================
ALTER TABLE "project_links"
DROP CONSTRAINT IF EXISTS "project_links_projectId_fkey";

ALTER TABLE "project_links"
ADD CONSTRAINT "project_links_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "project_links_projectId_idx"
ON "project_links"("projectId");


-- =========================
-- TASK COLUMNS -> PROJECTS
-- =========================
ALTER TABLE "task_columns"
DROP CONSTRAINT IF EXISTS "task_columns_projectId_fkey";

ALTER TABLE "task_columns"
ADD CONSTRAINT "task_columns_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "task_columns_projectId_idx"
ON "task_columns"("projectId");


-- =========================
-- PRIORITY LEVELS -> PROJECTS
-- =========================
ALTER TABLE "priority_levels"
DROP CONSTRAINT IF EXISTS "priority_levels_projectId_fkey";

ALTER TABLE "priority_levels"
ADD CONSTRAINT "priority_levels_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "priority_levels_projectId_idx"
ON "priority_levels"("projectId");


-- =========================
-- PROJECT MEMBERS (MANY TO MANY)
-- =========================
ALTER TABLE "project_members"
DROP CONSTRAINT IF EXISTS "project_members_userId_fkey";

ALTER TABLE "project_members"
ADD CONSTRAINT "project_members_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "project_members"
DROP CONSTRAINT IF EXISTS "project_members_projectId_fkey";

ALTER TABLE "project_members"
ADD CONSTRAINT "project_members_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "project_members_userId_idx"
ON "project_members"("userId");

CREATE INDEX IF NOT EXISTS "project_members_projectId_idx"
ON "project_members"("projectId");


-- =========================
-- TASKS
-- =========================
ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_projectId_fkey";

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_assigneeId_fkey";

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_assigneeId_fkey"
FOREIGN KEY ("assigneeId")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_columnId_fkey";

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_columnId_fkey"
FOREIGN KEY ("columnId")
REFERENCES "task_columns"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "tasks"
DROP CONSTRAINT IF EXISTS "tasks_priorityId_fkey";

ALTER TABLE "tasks"
ADD CONSTRAINT "tasks_priorityId_fkey"
FOREIGN KEY ("priorityId")
REFERENCES "priority_levels"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "tasks_projectId_idx"
ON "tasks"("projectId");

CREATE INDEX IF NOT EXISTS "tasks_assigneeId_idx"
ON "tasks"("assigneeId");

CREATE INDEX IF NOT EXISTS "tasks_columnId_idx"
ON "tasks"("columnId");

CREATE INDEX IF NOT EXISTS "tasks_priorityId_idx"
ON "tasks"("priorityId");


-- =========================
-- FILES
-- =========================
ALTER TABLE "files"
DROP CONSTRAINT IF EXISTS "files_projectId_fkey";

ALTER TABLE "files"
ADD CONSTRAINT "files_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "files"
DROP CONSTRAINT IF EXISTS "files_typeId_fkey";

ALTER TABLE "files"
ADD CONSTRAINT "files_typeId_fkey"
FOREIGN KEY ("typeId")
REFERENCES "file_types"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "files"
DROP CONSTRAINT IF EXISTS "files_uploadedById_fkey";

ALTER TABLE "files"
ADD CONSTRAINT "files_uploadedById_fkey"
FOREIGN KEY ("uploadedById")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "files_projectId_idx"
ON "files"("projectId");

CREATE INDEX IF NOT EXISTS "files_typeId_idx"
ON "files"("typeId");

CREATE INDEX IF NOT EXISTS "files_uploadedById_idx"
ON "files"("uploadedById");


-- =========================
-- DEPARTMENT <-> PROJECT (MANY TO MANY)
-- Prisma table: _DepartmentToProject
-- =========================
ALTER TABLE "_DepartmentToProject"
DROP CONSTRAINT IF EXISTS "_DepartmentToProject_A_fkey";

ALTER TABLE "_DepartmentToProject"
ADD CONSTRAINT "_DepartmentToProject_A_fkey"
FOREIGN KEY ("A")
REFERENCES "departments"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "_DepartmentToProject"
DROP CONSTRAINT IF EXISTS "_DepartmentToProject_B_fkey";

ALTER TABLE "_DepartmentToProject"
ADD CONSTRAINT "_DepartmentToProject_B_fkey"
FOREIGN KEY ("B")
REFERENCES "projects"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "_DepartmentToProject_A_idx"
ON "_DepartmentToProject"("A");

CREATE INDEX IF NOT EXISTS "_DepartmentToProject_B_idx"
ON "_DepartmentToProject"("B");


-- =========================
-- TAGS <-> TASKS (MANY TO MANY)
-- Prisma table: _TagToTask
-- =========================
ALTER TABLE "_TagToTask"
DROP CONSTRAINT IF EXISTS "_TagToTask_A_fkey";

ALTER TABLE "_TagToTask"
ADD CONSTRAINT "_TagToTask_A_fkey"
FOREIGN KEY ("A")
REFERENCES "tags"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "_TagToTask"
DROP CONSTRAINT IF EXISTS "_TagToTask_B_fkey";

ALTER TABLE "_TagToTask"
ADD CONSTRAINT "_TagToTask_B_fkey"
FOREIGN KEY ("B")
REFERENCES "tasks"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "_TagToTask_A_idx"
ON "_TagToTask"("A");

CREATE INDEX IF NOT EXISTS "_TagToTask_B_idx"
ON "_TagToTask"("B");


-- =========================================================
-- FINANCE MODULE FOREIGN KEYS
-- =========================================================

-- =========================
-- FINANCIAL ACCOUNTS -> WORKSPACES
-- =========================
ALTER TABLE "financial_accounts"
DROP CONSTRAINT IF EXISTS "financial_accounts_workspaceId_fkey";

ALTER TABLE "financial_accounts"
ADD CONSTRAINT "financial_accounts_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "financial_accounts_workspaceId_idx"
ON "financial_accounts"("workspaceId");


-- =========================
-- TRANSACTION CATEGORIES -> WORKSPACES
-- =========================
ALTER TABLE "transaction_categories"
DROP CONSTRAINT IF EXISTS "transaction_categories_workspaceId_fkey";

ALTER TABLE "transaction_categories"
ADD CONSTRAINT "transaction_categories_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "transaction_categories_workspaceId_idx"
ON "transaction_categories"("workspaceId");


-- =========================
-- FINANCIAL TRANSACTIONS
-- =========================
ALTER TABLE "financial_transactions"
DROP CONSTRAINT IF EXISTS "financial_transactions_workspaceId_fkey";

ALTER TABLE "financial_transactions"
ADD CONSTRAINT "financial_transactions_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
DROP CONSTRAINT IF EXISTS "financial_transactions_accountId_fkey";

ALTER TABLE "financial_transactions"
ADD CONSTRAINT "financial_transactions_accountId_fkey"
FOREIGN KEY ("accountId")
REFERENCES "financial_accounts"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
DROP CONSTRAINT IF EXISTS "financial_transactions_categoryId_fkey";

ALTER TABLE "financial_transactions"
ADD CONSTRAINT "financial_transactions_categoryId_fkey"
FOREIGN KEY ("categoryId")
REFERENCES "transaction_categories"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
DROP CONSTRAINT IF EXISTS "financial_transactions_projectId_fkey";

ALTER TABLE "financial_transactions"
ADD CONSTRAINT "financial_transactions_projectId_fkey"
FOREIGN KEY ("projectId")
REFERENCES "projects"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "financial_transactions"
DROP CONSTRAINT IF EXISTS "financial_transactions_createdById_fkey";

ALTER TABLE "financial_transactions"
ADD CONSTRAINT "financial_transactions_createdById_fkey"
FOREIGN KEY ("createdById")
REFERENCES "users"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "financial_transactions_workspaceId_idx"
ON "financial_transactions"("workspaceId");

CREATE INDEX IF NOT EXISTS "financial_transactions_accountId_idx"
ON "financial_transactions"("accountId");

CREATE INDEX IF NOT EXISTS "financial_transactions_categoryId_idx"
ON "financial_transactions"("categoryId");

CREATE INDEX IF NOT EXISTS "financial_transactions_projectId_idx"
ON "financial_transactions"("projectId");

CREATE INDEX IF NOT EXISTS "financial_transactions_createdById_idx"
ON "financial_transactions"("createdById");


-- =========================
-- TRANSACTION ATTACHMENTS -> FINANCIAL TRANSACTIONS
-- =========================
ALTER TABLE "transaction_attachments"
DROP CONSTRAINT IF EXISTS "transaction_attachments_transactionId_fkey";

ALTER TABLE "transaction_attachments"
ADD CONSTRAINT "transaction_attachments_transactionId_fkey"
FOREIGN KEY ("transactionId")
REFERENCES "financial_transactions"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "transaction_attachments_transactionId_idx"
ON "transaction_attachments"("transactionId");


-- =========================
-- BUDGETS -> WORKSPACES
-- =========================
ALTER TABLE "budgets"
DROP CONSTRAINT IF EXISTS "budgets_workspaceId_fkey";

ALTER TABLE "budgets"
ADD CONSTRAINT "budgets_workspaceId_fkey"
FOREIGN KEY ("workspaceId")
REFERENCES "workspaces"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "budgets_workspaceId_idx"
ON "budgets"("workspaceId");
