/**
 * Service API pour gérer toutes les requêtes HTTP vers le backend
 */

import { API_BASE_URL, getDefaultHeaders, REQUEST_TIMEOUT } from '../config/api';

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
 * Fonction principale pour effectuer des requêtes API
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
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(408, 'La requête a expiré');
      }
      throw new ApiError(500, error.message);
    }

    throw new ApiError(500, 'Une erreur inconnue est survenue');
  }
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