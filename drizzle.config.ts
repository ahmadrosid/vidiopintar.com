import { env } from './src/lib/env/server';

export default {
  schema: './src/lib/db/schema/*.ts',
  out: './src/drizzle',
  dialect: "postgresql",
  dbCredentials: {
    host: env.DB_HOST,
    port: parseInt(env.DB_PORT),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
};
