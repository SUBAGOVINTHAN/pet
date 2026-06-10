// Save this as: generate-hash.mjs
// Run in your backend folder: node generate-hash.mjs
// It will print the correct SQL to run in MySQL Workbench

import bcrypt from 'bcryptjs';

const password = 'Admin@123';
const hash = await bcrypt.hash(password, 10);

console.log('\n✅ Copy and run this SQL in MySQL Workbench:\n');
console.log('USE petstore_db;');
console.log(`UPDATE users SET password = '${hash}', role = 'admin' WHERE email = 'admin@petstore.com';`);
console.log(`\n-- Verify: SELECT id, name, email, role FROM users WHERE email = 'admin@petstore.com';`);
console.log('\n✅ Then login with: admin@petstore.com / Admin@123\n');
