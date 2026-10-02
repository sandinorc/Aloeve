import pb from '@/lib/pocketbaseClient.js';

export const validateUserExists = async (userId) => {
  console.log(`[UserValidation] Iniciando validación para el usuario ID: ${userId}`);
  
  if (!userId) {
    console.warn('[UserValidation] ID de usuario no proporcionado');
    return false;
  }
  
  try {
    // CRÍTICO: Asegurar que SIEMPRE se use 'usuarios' y no 'users'
    console.log(`[UserValidation] Consultando colección 'usuarios' para ID: ${userId}`);
    const user = await pb.collection('usuarios').getOne(userId, { $autoCancel: false });
    
    if (user && user.id) {
      console.log(`[UserValidation] Usuario ${userId} validado exitosamente.`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn(`[UserValidation] Fallo al validar usuario ${userId} en colección 'usuarios'. Posible 404.`, error.message);
    return false;
  }
};