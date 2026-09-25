import path from 'node:path';
import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile();
} catch {
  // No .env file — rely on the real environment.
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  root,
  port: Number(process.env.PORT) || 3001,
  isProduction: process.env.NODE_ENV === 'production',
  dataDir: path.resolve(root, process.env.DATA_DIR || 'data'),
  clientDir: path.join(root, 'dist', 'client'),
  sessionDays: Number(process.env.SESSION_DAYS) || 7,
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  leadWebhookUrl: process.env.LEAD_WEBHOOK_URL || '',
  trustProxy: process.env.TRUST_PROXY === 'true',
};
