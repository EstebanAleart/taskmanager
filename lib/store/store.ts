import { configureStore } from "@reduxjs/toolkit";
import financeReducer from "./slices/finance.slice";
import workspaceReducer from "./slices/workspace.slice";
import projectReducer from "./slices/project.slice";
import taskReducer from "./slices/task.slice";

export const store = configureStore({
  reducer: {
    finance: financeReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    task: taskReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Tasks from Prisma/Next.js SSR may include Date objects (createdAt, updatedAt, dueDate).
        // These are safe to store — they serialize correctly via JSON. We ignore the warnings.
        ignoredActionPaths: ["payload.tasks", "payload.columns"],
        ignoredPaths: ["task.tasks", "task.columns", "task._rollback"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
