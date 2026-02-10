import { defineConfig } from '@prisma/cli';

export default defineConfig({
  migrate: {
    url: process.env.DATABASE_URL,
  },
});
