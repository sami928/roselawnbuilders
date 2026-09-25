// Usage: npm run create-admin -- <email> <password> [name]
// Creates a dashboard user, or resets the password if the email already exists.
import { db } from '../server/db.js';
import { createUser, hashPassword, validatePassword } from '../server/auth.js';

const [email, password, ...nameParts] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run create-admin -- <email> <password> [name]');
  process.exit(1);
}
const problem = validatePassword(password);
if (problem) {
  console.error(problem);
  process.exit(1);
}

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim());
if (existing) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(password), existing.id);
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id);
  console.log(`Password reset for ${email}.`);
} else {
  await createUser({ email, password, name: nameParts.join(' ') });
  console.log(`Created dashboard user ${email}.`);
}
