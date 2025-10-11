import { authService } from '@/lib/services/auth-service';

/**
 * Obtiene credenciales de autenticación desde sessionStorage o localStorage
 */
function getAuthCredentials(): { token: string; userId: string; email?: string } | null {
  if (typeof window === 'undefined') {
    console.log('⚠️ getAuthCredentials: window undefined (SSR)');
    return null;
  }

  try {
    // 1. Primero intentar leer de sessionStorage (credenciales dinámicas de postMessage)
    console.log('🔍 Buscando credenciales en sessionStorage...');
    const sessionCreds = sessionStorage.getItem('auth_credentials');

    if (sessionCreds) {
      const parsed = JSON.parse(sessionCreds);
      console.log('📄 Credenciales encontradas en sessionStorage:', {
        hasToken: !!parsed.token,
        userId: parsed.userId,
        email: parsed.email || 'N/A',
        tokenPreview: parsed.token?.substring(0, 20) + '...'
      });

      if (parsed.token && parsed.userId) {
        console.log('✅ Usando credenciales de sessionStorage (postMessage)');
        return {
          token: parsed.token,
          userId: parsed.userId,
          email: parsed.email
        };
      }
    }

    // 2. Fallback: buscar token de Supabase en localStorage
    console.log('🔍 Buscando token de Supabase en localStorage...');
    console.log('📦 Total items en localStorage:', localStorage.length);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.includes('auth-token')) {
        console.log(`✅ Encontrada clave con auth-token: ${key}`);
        const data = localStorage.getItem(key);

        if (data) {
          const parsed = JSON.parse(data);
          console.log('📄 Datos parseados de localStorage:', {
            hasAccessToken: !!parsed.access_token,
            hasUser: !!parsed.user,
            userId: parsed.user?.id,
            tokenPreview: parsed.access_token?.substring(0, 20) + '...'
          });

          if (parsed.access_token && parsed.user?.id) {
            console.log('✅ Usando token de Supabase (localStorage)');
            return {
              token: parsed.access_token,
              userId: parsed.user.id,
              email: parsed.user.email
            };
          }
        }
      }
    }

    console.log('❌ No se encontraron credenciales en sessionStorage ni localStorage');
  } catch (error) {
    console.error('❌ Error al leer credenciales:', error);
  }

  return null;
}

/**
 * Obtiene headers de autenticación con múltiples fallbacks:
 * 1. Credenciales de sessionStorage (postMessage)
 * 2. Token de Supabase en localStorage
 * 3. Variables de entorno
 */
export function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // 1. Intentar credenciales (sessionStorage primero, luego localStorage)
  const credentials = getAuthCredentials();

  if (credentials?.token) {
    headers['Authorization'] = `Bearer ${credentials.token}`;
    headers['x-user-id'] = credentials.userId;
    return headers;
  }

  // 2. Fallback a variables de entorno
  const envToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;
  const envUserId = process.env.NEXT_PUBLIC_USER_ID;

  if (envToken) {
    headers['Authorization'] = `Bearer ${envToken}`;
  }

  if (envUserId) {
    headers['x-user-id'] = envUserId;
  }

  if (envToken || envUserId) {
    console.log('⚙️ Usando credenciales de variables de entorno');
  } else {
    console.warn('⚠️ No hay credenciales disponibles');
  }

  return headers;
}

/**
 * Wrapper para fetch con headers de autenticación automáticos
 */
export async function authenticatedFetch(
  url: string | URL | Request,
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = getAuthHeaders();

  const mergedHeaders = {
    ...authHeaders,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers: mergedHeaders,
    });

    // Manejar errores 401
    if (response.status === 401) {
      console.error('❌ Error 401: No autorizado');
      authService.handleAuthError();
    }

    return response;
  } catch (error) {
    throw error;
  }
}
