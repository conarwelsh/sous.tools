import { localConfig } from "@sous/config";

export class HttpClient {
  private baseUrl: string;
  public token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = new Headers(options.headers);

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "An unknown error occurred" }));
      throw new Error(error.message || "API Request failed");
    }

    if (response.status === 204) return {} as T;

    const text = await response.text();
    if (!text) return {} as T;

    try {
      return JSON.parse(text);
    } catch (e) {
      return text as unknown as T;
    }
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  patch<T>(path: string, body?: any, options?: RequestInit) {
    return this.request<T>(path, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  delete<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

let clientInstance: HttpClient | null = null;

export const getHttpClient = async () => {
  if (clientInstance) return clientInstance;
  const { config } = await import("@sous/config");
  clientInstance = new HttpClient(config.api.url || "http://localhost:4000");
  return clientInstance;
};
