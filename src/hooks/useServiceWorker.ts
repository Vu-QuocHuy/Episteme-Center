import { useState, useEffect, useCallback } from 'react';

export interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isInstalled: boolean;
  isUpdated: boolean;
  registration: ServiceWorkerRegistration | null;
  error: string | null;
}

export interface UseServiceWorkerReturn extends ServiceWorkerState {
  register: () => Promise<void>;
  unregister: () => Promise<void>;
  update: () => Promise<void>;
  skipWaiting: () => Promise<void>;
}

const useServiceWorker = (): UseServiceWorkerReturn => {
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isInstalled: false,
    isUpdated: false,
    registration: null,
    error: null,
  });

  // Check if service worker is already registered
  useEffect(() => {
    if (!state.isSupported) return;

    const checkRegistration = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          setState(prev => ({
            ...prev,
            isRegistered: true,
            registration,
            isInstalled: registration.installing === null && registration.waiting === null,
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to check registration',
        }));
      }
    };

    checkRegistration();
  }, [state.isSupported]);

  // Listen for service worker updates
  useEffect(() => {
    if (!state.isSupported || !state.registration) return;

    const handleUpdateFound = () => {
      const registration = state.registration!;
      const newWorker = registration.installing || registration.waiting;

      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setState(prev => ({ ...prev, isUpdated: true }));
          } else if (newWorker.state === 'activated') {
            setState(prev => ({
              ...prev,
              isInstalled: true,
              isUpdated: false
            }));
          }
        });
      }
    };

    state.registration.addEventListener('updatefound', handleUpdateFound);

    return () => {
      state.registration?.removeEventListener('updatefound', handleUpdateFound);
    };
  }, [state.isSupported, state.registration]);

  // Register service worker
  const register = useCallback(async () => {
    if (!state.isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Service Worker is not supported in this browser',
      }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
        error: null,
      }));

      // Listen for installation
      if (registration.installing) {
        registration.installing.addEventListener('statechange', () => {
          if (registration.installing?.state === 'installed') {
            setState(prev => ({ ...prev, isInstalled: true }));
          }
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to register service worker',
      }));
    }
  }, [state.isSupported]);

  // Unregister service worker
  const unregister = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.unregister();
      setState(prev => ({
        ...prev,
        isRegistered: false,
        registration: null,
        isInstalled: false,
        isUpdated: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to unregister service worker',
      }));
    }
  }, [state.registration]);

  // Update service worker
  const update = useCallback(async () => {
    if (!state.registration) return;

    try {
      await state.registration.update();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update service worker',
      }));
    }
  }, [state.registration]);

  // Skip waiting (activate new service worker immediately)
  const skipWaiting = useCallback(async () => {
    if (!state.registration || !state.registration.waiting) return;

    try {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      setState(prev => ({ ...prev, isUpdated: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to skip waiting',
      }));
    }
  }, [state.registration]);

  return {
    ...state,
    register,
    unregister,
    update,
    skipWaiting,
  };
};

export default useServiceWorker;
