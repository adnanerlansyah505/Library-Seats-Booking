import type { $Fetch } from 'ofetch'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ServiceRequestOptions<TBody = any> {
  /** Query string params */
  params?: Record<string, any>
  /** Request body */
  body?: TBody
  /** Extra ofetch options */
  options?: Record<string, any>
  /** Skip auth & refresh handling for this call (e.g. login/refresh endpoints) */
  skipAuth?: boolean
}

export interface ServiceApi {
  get<TResponse = any>(path: string, options?: ServiceRequestOptions): Promise<TResponse>
  post<TResponse = any, TBody = any>(path: string, options?: ServiceRequestOptions<TBody>): Promise<TResponse>
  put<TResponse = any, TBody = any>(path: string, options?: ServiceRequestOptions<TBody>): Promise<TResponse>
  patch<TResponse = any, TBody = any>(path: string, options?: ServiceRequestOptions<TBody>): Promise<TResponse>
  del<TResponse = any, TBody = any>(path: string, options?: ServiceRequestOptions<TBody>): Promise<TResponse>
}

/**
 * Generic service API factory
 *
 * Usage examples:
 * const authApi = useServiceApi('auth')
 * const userApi = useServiceApi('users')
 */
export const useServiceApi = (serviceName: string): ServiceApi => {
  const { $api } = useNuxtApp()

  const client = $api as $Fetch

  const buildUrl = (path: string) => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    // Nitro server routes live under /api, e.g. server/api/auth/login.post.ts => /api/auth/login
    // So all service calls are prefixed with /api here.
    return `/api/${serviceName}${normalizedPath}`
  }

  const request = async <TResponse, TBody = any>(
    method: HttpMethod,
    path: string,
    { params, body, options, skipAuth }: ServiceRequestOptions<TBody> = {},
  ): Promise<TResponse> => {
    return await client<TResponse>(buildUrl(path), {
      method,
      params,
      body,
      // Custom flag used in api plugin to skip auth/refresh logic
      _skipAuth: skipAuth,
      ...options,
    } as any)
  }

  return {
    get: (path, opts) => request('GET', path, opts),
    post: (path, opts) => request('POST', path, opts),
    put: (path, opts) => request('PUT', path, opts),
    patch: (path, opts) => request('PATCH', path, opts),
    del: (path, opts) => request('DELETE', path, opts),
  }
}
