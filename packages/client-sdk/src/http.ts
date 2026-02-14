export class HttpClient {
  private baseUrl: string;
  public token: string | null = null;
  private queue: { path: string; options: RequestInit; id: string }[] = [];
  private isProcessingQueue = false;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

    // Attempt to process queue when back online
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.processQueue());
    }
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;
    // eslint-disable-next-line no-console
    console.log(
      `[HttpClient] Online! Processing ${this.queue.length} queued requests...`,
    );

    const currentQueue = [...this.queue];
    this.queue = [];

    for (const req of currentQueue) {
      try {
        await this.request(req.path, req.options);
      } catch (e) {
        console.error(
          `[HttpClient] Failed to process queued request ${req.id}, re-queueing...`,
          e,
        );
        this.queue.push(req);
      }
    }
    this.isProcessingQueue = false;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    // eslint-disable-next-line no-console
    console.log(`[HttpClient] Requesting: ${url}`);
    const headers = new Headers(options.headers);

    if (this.token) {
      headers.set("Authorization", `Bearer ${this.token}`);
    }

    if (options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    // Add Idempotency-Key for mutations if not present
    if (
      ["POST", "PUT", "PATCH", "DELETE"].includes(options.method || "") &&
      !headers.has("X-Idempotency-Key")
    ) {
      headers.set("X-Idempotency-Key", crypto.randomUUID());
    }

    // Trigger global loading start
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("sous:loading", { detail: { active: true } }),
      );
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        console.error(`[HttpClient] Request failed with status ${response.status}: ${url}`);
        const error = await response
          .json()
          .catch(() => ({ message: `HTTP Error ${response.status}` }));
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
    } catch (e: any) {
      // 1. Try Edge Node Fallback if cloud fails (e.g. timeout or connection error)
      if (!url.includes("sous.local") && !url.includes("localhost")) {
        console.warn(
          `[HttpClient] Cloud API unreachable (${e.message}). Attempting Edge Node fallback...`,
        );
        const edgeUrl = url.replace(this.baseUrl, "http://sous.local:4000");
        try {
          // IMPORTANT: strip the leading / if it exists because the recursive call adds it
          const relativePath = path.startsWith("/") ? path : `/${path}`;
          return await this.request(
            relativePath,
            { ...options, headers: Object.fromEntries((headers as any).entries()) }
          );
        } catch (edgeError: any) {
          console.error(`[HttpClient] Edge Node fallback also failed: ${edgeError.message}`);
        }
      }

      // 2. Offline handling (existing logic)
      if (
        typeof window !== "undefined" &&
        !window.navigator.onLine &&
        ["POST", "PUT", "PATCH", "DELETE"].includes(options.method || "")
      ) {
        console.warn(
          `[HttpClient] Offline. Queuing ${options.method} request to ${path}`,
        );
        this.queue.push({
          path,
          options: {
            ...options,
            headers: Object.fromEntries((headers as any).entries()),
          },
          id: crypto.randomUUID(),
        });
        // Return a optimistic response or throw a specific error
        return { queued: true } as any;
      }
      throw e;
    } finally {
      // Trigger global loading end
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("sous:loading", { detail: { active: false } }),
        );
      }
    }
  }

  get<T>(path: string, options?: RequestInit) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  setToken(token: string | null) {
    this.token = token;
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

export const getHttpClient = async (baseUrl?: string): Promise<HttpClient> => {
  if (typeof window !== "undefined") {
    if ((window as any).__SOUS_HTTP_CLIENT__ && !baseUrl) {
      return (window as any).__SOUS_HTTP_CLIENT__;
    }
  }

  if (clientInstance && !baseUrl) return clientInstance;
  
  if (baseUrl) {
    return new HttpClient(baseUrl);
  }

  const { config } = await import("@sous/config");
  clientInstance = new HttpClient(config.api.url || "http://localhost:4000");

  if (typeof window !== "undefined") {
    (window as any).__SOUS_HTTP_CLIENT__ = clientInstance;
  }

  return clientInstance;
};
