/// <reference path="../pb_data/types.d.ts" />
// Hook to migrate users from 'users' to 'usuarios' collection
// This runs once to consolidate auth data

onRecordAfterCreateSuccess((e) => {
  // This hook is a placeholder for the migration logic
  // In production, you would run this migration via PocketBase CLI or admin panel
  e.next();
}, "usuarios");

// Alternative: Use a custom route or admin command to trigger migration
// For now, document the migration steps:
// 1. Export all records from 'users' collection
// 2. For each user in 'users':
//    - Check if email exists in 'usuarios'
//    - If not, create new record in 'usuarios' with:
//      * email (from users.email)
//      * nombre_completo (from users.name, or default to email prefix)
//      * rol (default to 'Host' or appropriate role)
//      * estado (default to 'Activo')
//      * password (copy from users.password)
// 3. Verify no duplicate emails in 'usuarios'
// 4. Delete 'users' collection