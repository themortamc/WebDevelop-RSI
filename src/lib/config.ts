// Número de WhatsApp del negocio, en formato internacional SIN "+" ni espacios.
// Para celulares argentinos, wa.me necesita el "9" extra después del 54
// (54 + 9 + característica + número) o el link falla en muchos celulares,
// aunque funcione bien desde una compu. Ver nota en la respuesta del chat.
// Para cambiarlo en el futuro, solo editá esta línea.
export const WHATSAPP_NUMBER = '5492634408578';

// Dominio "interno" usado para armar el email de las cuentas de administrador
// (Supabase Auth necesita un email, pero en el panel el usuario solo escribe
// el nombre de usuario). No hace falta que este dominio exista de verdad.
export const ADMIN_EMAIL_DOMAIN = 'repuestossanisidro.com.ar';
