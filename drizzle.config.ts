import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './backend/index.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'employees.db',
  },
});