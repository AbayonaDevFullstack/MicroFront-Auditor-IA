'use client';

import { useEffect } from 'react';
import { authService } from '@/lib/services/auth-service';

/**
 * Componente que inicializa el servicio de autenticación
 * Debe ser montado en el layout principal
 */
export function AuthInitializer() {
  useEffect(() => {
    // El servicio ya se inicializa automáticamente cuando se importa,
    // pero podemos agregar logs adicionales aquí si es necesario
    console.log('🔐 AuthInitializer montado');

    // Opcional: Agregar un listener para debug
    const removeListener = authService.addListener((credentials) => {
      if (credentials) {
        console.log('🔑 Credenciales actualizadas:', {
          userId: credentials.userId,
          email: credentials.email || 'N/A',
          hasToken: !!credentials.token,
        });
      } else {
        console.log('🔓 Credenciales eliminadas');
      }
    });

    // Cleanup
    return () => {
      removeListener();
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}
