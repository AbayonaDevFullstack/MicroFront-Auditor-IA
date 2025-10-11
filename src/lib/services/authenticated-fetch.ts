import { authService } from './auth-service';

/**
 * Wrapper para fetch que agrega automáticamente headers de autenticación
 */
export async function authenticatedFetch(
  url: string | URL | Request,
  options: RequestInit = {}
): Promise<Response> {
  const credentials = authService.getCredentials();

  // Log de advertencia si no hay credenciales (útil para debugging)
  if (!credentials) {
    console.warn('⚠️ No hay credenciales disponibles para la petición a:', url);
  }

  // Construir headers con autenticación
  const headers: HeadersInit = {
    ...options.headers,
  };

  // Agregar token si está disponible
  if (credentials?.token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${credentials.token}`;
  }

  // Agregar user ID si está disponible
  if (credentials?.userId) {
    (headers as Record<string, string>)['x-user-id'] = credentials.userId;
  }

  console.log('📤 Petición autenticada a:', typeof url === 'string' ? url : url.toString());

  try {
    // Hacer la petición con headers de autenticación
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Manejar errores de autenticación
    if (response.status === 401) {
      console.error('❌ Error 401: No autorizado');
      authService.handleAuthError();
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    }

    return response;
  } catch (error) {
    // Propagar el error
    throw error;
  }
}

/**
 * Helper para obtener headers de autenticación sin hacer petición
 */
export function getAuthHeaders(): HeadersInit {
  const credentials = authService.getCredentials();
  const headers: Record<string, string> = {};

  if (credentials?.token) {
    headers['Authorization'] = `Bearer ${credentials.token}`;
  }

  if (credentials?.userId) {
    headers['x-user-id'] = credentials.userId;
  }

  return headers;
}
