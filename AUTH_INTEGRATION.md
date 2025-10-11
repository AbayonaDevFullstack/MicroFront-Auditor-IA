# Integración de Autenticación - Auditor-IA

## ✅ Implementación Completada

La integración de autenticación entre Louis Legal y Auditor-IA ha sido implementada exitosamente.

## 📁 Archivos Creados

### 1. Servicio de Autenticación
**Archivo**: `src/lib/services/auth-service.ts`

- Escucha mensajes `postMessage` del parent window
- Valida orígenes permitidos por seguridad
- Almacena credenciales en memoria y sessionStorage
- Proporciona API para acceder a credenciales
- Maneja errores de autenticación (401)

### 2. Helper de Fetch Autenticado
**Archivo**: `src/lib/services/authenticated-fetch.ts`

- Wrapper de `fetch` que agrega headers automáticamente
- Función `getAuthHeaders()` para obtener solo los headers

### 3. API Helpers
**Archivo**: `src/lib/utils/api-helpers.ts`

- Función `getAuthHeaders()` con fallback a variables de entorno
- Prioriza credenciales dinámicas sobre variables de entorno
- Función `authenticatedFetch()` para peticiones con manejo de errores

### 4. Inicializador de Auth
**Archivo**: `src/components/providers/auth-initializer.tsx`

- Componente que inicializa el servicio en el layout
- Agrega listeners para debug de cambios en credenciales

### 5. Layout Actualizado
**Archivo**: `src/app/layout.tsx`

- Incluye `<AuthInitializer />` para activar el servicio

### 6. Servicio Actualizado (Ejemplo)
**Archivo**: `src/lib/api/accounting-client-service.ts`

- Usa `getAuthHeaders()` en lugar de headers estáticos
- Los demás servicios pueden actualizarse siguiendo este patrón

## 🔐 Orígenes Permitidos

```typescript
const ALLOWED_ORIGINS = [
  'http://localhost:5173',                    // Desarrollo local Vite
  'http://localhost:3000',                    // Desarrollo local Next.js
  'https://louis-legal.com',                  // Producción
  'https://www.louis-legal.com',              // Producción con www
  'http://localhost:5174',                    // Desarrollo local alternativo
  'https://louisfrontendtest.vercel.app',     // Pruebas en Vercel
];
```

## 🚀 Cómo Funciona

### 1. Inicialización
Cuando Auditor-IA carga:
```javascript
// Se envía automáticamente
window.parent.postMessage({ type: 'AUDITOR_READY' }, '*');
```

### 2. Recepción de Credenciales
Louis Legal envía:
```javascript
iframe.contentWindow.postMessage({
  type: 'AUTH_CREDENTIALS',
  token: 'eyJ...',
  userId: '00aa8f43-...',
  email: 'user@example.com',
  timestamp: Date.now()
}, '*');
```

### 3. Uso Automático
Todos los servicios que usen `getAuthHeaders()` incluirán automáticamente:
```
Authorization: Bearer eyJ...
x-user-id: 00aa8f43-...
```

## 🧪 Cómo Probar

### Método 1: Consola del Navegador

1. Abre Auditor-IA en el navegador
2. Abre DevTools (F12)
3. En la consola, ejecuta:

```javascript
// Verificar estado de autenticación
console.log('Credenciales:', window.authService?.getCredentials());

// Simular recepción de credenciales (solo para pruebas locales)
window.postMessage({
  type: 'AUTH_CREDENTIALS',
  token: 'test-token-123',
  userId: 'test-user-456',
  email: 'test@example.com',
  timestamp: Date.now()
}, '*');

// Verificar que se guardaron
console.log('Credenciales actualizadas:', window.authService?.getCredentials());
```

### Método 2: Desde Louis Legal

En el componente que carga el iframe de Auditor-IA:

```typescript
const iframeRef = useRef<HTMLIFrameElement>(null);

useEffect(() => {
  const handleAuditorReady = (event: MessageEvent) => {
    if (event.data?.type === 'AUDITOR_READY') {
      // Auditor-IA está listo, enviar credenciales
      const credentials = {
        type: 'AUTH_CREDENTIALS',
        token: session?.access_token,
        userId: session?.user?.id,
        email: session?.user?.email,
        timestamp: Date.now()
      };

      iframeRef.current?.contentWindow?.postMessage(
        credentials,
        process.env.NEXT_PUBLIC_AUDITOR_URL
      );
    }
  };

  window.addEventListener('message', handleAuditorReady);
  return () => window.removeEventListener('message', handleAuditorReady);
}, [session]);
```

### Método 3: Verificar Headers en Network Tab

1. Abre DevTools (F12) → Network
2. Realiza una acción que haga una petición HTTP
3. Selecciona la petición
4. Ve a la pestaña "Headers"
5. Verifica que estén presentes:
   - `Authorization: Bearer ...`
   - `x-user-id: ...`

## 📊 Logs de Debug

El servicio genera logs útiles para debugging:

```
🔐 Inicializando AuthService...
✅ AuthService inicializado correctamente
📢 Notificando al parent que estamos listos
✅ Credenciales recibidas de Louis Legal: { userId: '...', email: '...', ... }
✅ Credenciales almacenadas en sessionStorage
🔐 Usando credenciales dinámicas de authService
📤 Petición autenticada a: http://localhost:8005/api/v1/...
```

## 🔄 Fallback a Variables de Entorno

Si no hay credenciales dinámicas disponibles, el sistema usa automáticamente:

```
⚙️ Usando credenciales de variables de entorno
NEXT_PUBLIC_AUTH_TOKEN
NEXT_PUBLIC_USER_ID
```

Esto permite que la aplicación funcione tanto:
- ✅ En producción dentro del iframe (con credenciales dinámicas)
- ✅ En desarrollo standalone (con variables de entorno)

## 🛡️ Seguridad

### Implementado
- ✅ Validación de orígenes permitidos
- ✅ Validación de tipo de mensaje
- ✅ Credenciales en sessionStorage (no localStorage)
- ✅ Logs sin exponer tokens completos
- ✅ Limpieza de credenciales en logout

### Recomendaciones
- 🔒 Siempre usar HTTPS en producción
- 🔒 Rotar tokens regularmente
- 🔒 Implementar refresh tokens
- 🔒 Validar tokens en el backend

## 🐛 Troubleshooting

### No se reciben credenciales

```javascript
// Verificar que el evento se esté escuchando
window.addEventListener('message', (e) => console.log('Mensaje recibido:', e.data));
```

### Peticiones con 401

1. Verificar en consola: `console.log(authService.getCredentials())`
2. Verificar en Network tab que los headers se envíen
3. Verificar que el token no haya expirado

### CORS errors

Asegurar que el API Gateway permita:
- Origin del iframe de Auditor-IA
- Headers: `Authorization`, `x-user-id`

## 📝 Próximos Pasos

Para actualizar otros servicios, seguir el patrón del `accounting-client-service.ts`:

```typescript
import { getAuthHeaders } from '@/lib/utils/api-helpers'

class MiServicio {
  async miMetodo() {
    const response = await fetch(url, {
      headers: getAuthHeaders(), // ← Usar esto
    });
  }
}
```

## 💡 API del AuthService

```typescript
// Obtener credenciales completas
authService.getCredentials(): AuthCredentials | null

// Obtener solo el token
authService.getToken(): string | null

// Obtener solo el userId
authService.getUserId(): string | null

// Verificar si hay credenciales
authService.hasCredentials(): boolean

// Limpiar credenciales
authService.clearCredentials(): void

// Solicitar nuevas credenciales al parent
authService.requestAuth(): void

// Agregar listener para cambios
const removeListener = authService.addListener((creds) => {
  console.log('Credenciales cambiaron:', creds);
});

// Remover listener
removeListener();
```

## ✅ Checklist de Integración

- [x] Servicio de autenticación creado
- [x] Listener de postMessage configurado
- [x] Validación de orígenes implementada
- [x] Storage de credenciales implementado
- [x] Helper de fetch autenticado creado
- [x] Integración en layout principal
- [x] Fallback a variables de entorno
- [x] Manejo de errores 401
- [x] Logs de debugging
- [x] Ejemplo de servicio actualizado
- [ ] Actualizar todos los servicios restantes
- [ ] Pruebas end-to-end
- [ ] Documentación de API Gateway

## 📞 Soporte

Para preguntas o problemas, contactar al equipo de desarrollo.
