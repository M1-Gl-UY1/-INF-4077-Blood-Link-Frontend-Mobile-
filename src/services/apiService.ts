/**
 * Service API pour gérer toutes les requêtes HTTP vers le backend
 */

import { API_BASE_URL, getDefaultHeaders, REQUEST_TIMEOUT, RETRY_CONFIG } from '../config/api';

/**
 * Classe pour gérer les erreurs API
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Options pour les requêtes API
 */
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  token?: string;
}

/**
 * Fonction utilitaire pour attendre un délai
 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fonction principale pour effectuer des requêtes API avec retry automatique
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { method = 'GET', body, token } = options;

  const config: RequestInit = {
    method,
    headers: getDefaultHeaders(token),
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  let lastError: any;

  // Retry logic
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          response.status,
          errorData.message || 'Une erreur est survenue',
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      lastError = error;

      // Ne pas retry pour certaines erreurs (erreurs client 4xx sauf 408)
      if (error instanceof ApiError) {
        if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 408) {
          throw error;
        }
      }

      // Si ce n'est pas la dernière tentative, attendre avant de retry
      if (attempt < RETRY_CONFIG.maxRetries) {
        console.log(`Tentative ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1} échouée, retry dans ${RETRY_CONFIG.retryDelay}ms...`);
        await wait(RETRY_CONFIG.retryDelay * (attempt + 1)); // Backoff exponentiel
        continue;
      }

      // Dernière tentative échouée, on lance l'erreur
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(408, 'La requête a expiré après plusieurs tentatives');
        }
        throw new ApiError(500, error.message);
      }

      throw new ApiError(500, 'Une erreur inconnue est survenue');
    }
  }

  // On ne devrait jamais arriver ici, mais au cas où
  throw lastError || new ApiError(500, 'Une erreur inconnue est survenue');
};

/**
 * Méthodes raccourcies pour les différents types de requêtes
 */
export const api = {
  get: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'GET', token }),

  post: <T>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'POST', body, token }),

  put: <T>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PUT', body, token }),

  patch: <T>(endpoint: string, body: any, token?: string) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body, token }),

  delete: <T>(endpoint: string, token?: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),
};