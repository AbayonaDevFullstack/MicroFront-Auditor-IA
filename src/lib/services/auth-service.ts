// Configuración de orígenes permitidos
const ALLOWED_ORIGINS = [
  'http://localhost:5173',           // Desarrollo local Vite
  'http://localhost:3000',           // Desarrollo local Next.js
  'http://127.0.0.1:8080',           // Louis Legal desarrollo local
  'http://localhost:8080',           // Louis Legal desarrollo local
  'https://louis-legal.com',         // Producción
  'https://www.louis-legal.com',     // Producción con www
  'http://localhost:5174',           // Desarrollo local alternativo
  'https://louisfrontendtest.vercel.app', // Pruebas en Vercel
];

// Interfaces
export interface AuthCredentials {
  token: string;
  userId: string;
  email?: string;
  timestamp: number;
}

export interface AuthMessage {
  type: 'AUTH_CREDENTIALS';
  token: string;
  userId: string;
  email?: string;
  timestamp: number;
}

// Estado de autenticación en memoria
let authCredentials: AuthCredentials | null = null;

class AuthService {
  private initialized = false;
  private listeners: ((credentials: AuthCredentials | null) => void)[] = [];

  /**
   * Inicializa el servicio de autenticación y escucha mensajes del parent window
   */
  initialize(): void {
    if (this.initialized) {
      console.log('ℹ️ AuthService ya está inicializado');
      return;
    }

    console.log('🔐 Inicializando AuthService...');

    // Intentar cargar credenciales desde sessionStorage
    this.loadFromSessionStorage();

    // Escuchar mensajes del parent window
    window.addEventListener('message', this.handleMessage.bind(this));

    // Notificar al parent que estamos listos
    this.notifyReady();

    this.initialized = true;
    console.log('✅ AuthService inicializado correctamente');
  }

  /**
   * Maneja mensajes recibidos del parent window
   */
  private handleMessage(event: MessageEvent): void {
    // Validar origen por seguridad
    if (!ALLOWED_ORIGINS.includes(event.origin)) {
      console.warn('❌ Mensaje rechazado de origen no permitido:', event.origin);
      return;
    }

    // Validar que sea el tipo de mensaje esperado
    if (event.data?.type === 'AUTH_CREDENTIALS') {
      const { token, userId, email, timestamp } = event.data as AuthMessage;

      console.log('✅ Credenciales recibidas de Louis Legal:', {
        userId,
        email: email || 'N/A',
        timestamp: new Date(timestamp).toISOString(),
        tokenLength: token?.length || 0,
      });

      // Guardar credenciales
      this.setCredentials({
        token,
        userId,
        email,
        timestamp,
      });
    }
  }

  /**
   * Guarda las credenciales en memoria y sessionStorage
   */
  private setCredentials(credentials: AuthCredentials): void {
    authCredentials = credentials;

    // Guardar en sessionStorage para persistencia durante la sesión
    try {
      sessionStorage.setItem('auth_credentials', JSON.stringify(credentials));
      console.log('✅ Credenciales almacenadas en sessionStorage');
    } catch (error) {
      console.error('❌ Error al guardar credenciales en sessionStorage:', error);
    }

    // Notificar a los listeners
    this.notifyListeners(credentials);
  }

  /**
   * Carga credenciales desde sessionStorage
   */
  private loadFromSessionStorage(): void {
    try {
      const stored = sessionStorage.getItem('auth_credentials');
      if (stored) {
        authCredentials = JSON.parse(stored);
        console.log('✅ Credenciales cargadas desde sessionStorage');
        this.notifyListeners(authCredentials);
      }
    } catch (error) {
      console.error('❌ Error al cargar credenciales desde sessionStorage:', error);
      sessionStorage.removeItem('auth_credentials');
    }
  }

  /**
   * Obtiene las credenciales actuales
   */
  getCredentials(): AuthCredentials | null {
    return authCredentials;
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return authCredentials?.token || null;
  }

  /**
   * Obtiene el ID de usuario
   */
  getUserId(): string | null {
    return authCredentials?.userId || null;
  }

  /**
   * Verifica si hay credenciales disponibles
   */
  hasCredentials(): boolean {
    return authCredentials !== null && !!authCredentials.token;
  }

  /**
   * Limpia las credenciales almacenadas
   */
  clearCredentials(): void {
    console.log('🗑️ Limpiando credenciales...');
    authCredentials = null;
    sessionStorage.removeItem('auth_credentials');
    this.notifyListeners(null);
  }

  /**
   * Notifica al parent que estamos listos para recibir credenciales
   */
  private notifyReady(): void {
    if (window.parent !== window) {
      console.log('📢 Notificando al parent que estamos listos');
      window.parent.postMessage({ type: 'AUDITOR_READY' }, '*');
    }
  }

  /**
   * Notifica al parent que necesitamos autenticación
   */
  requestAuth(): void {
    console.log('🔑 Solicitando autenticación al parent...');
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'AUTH_REQUIRED' }, '*');
    }
  }

  /**
   * Agrega un listener para cambios en las credenciales
   */
  addListener(listener: (credentials: AuthCredentials | null) => void): () => void {
    this.listeners.push(listener);

    // Retornar función para remover el listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notifica a todos los listeners sobre cambios en las credenciales
   */
  private notifyListeners(credentials: AuthCredentials | null): void {
    this.listeners.forEach(listener => {
      try {
        listener(credentials);
      } catch (error) {
        console.error('❌ Error en listener de autenticación:', error);
      }
    });
  }

  /**
   * Maneja errores de autenticación (401)
   */
  handleAuthError(): void {
    console.error('❌ Error de autenticación. Token inválido o expirado.');
    this.clearCredentials();
    this.requestAuth();
  }
}

// Exportar instancia singleton
export const authService = new AuthService();

// Auto-inicializar cuando se importa
if (typeof window !== 'undefined') {
  authService.initialize();
}
