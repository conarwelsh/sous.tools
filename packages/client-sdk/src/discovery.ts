import { HttpClient } from "./http.js";

export class Discovery {
  constructor(private client: HttpClient) {}

  /**
   * Attempts to discover a local Sous Edge Node by probing the standard mDNS hostname.
   * Browsers resolve mDNS automatically (e.g. http://sous-edge.local:4000).
   */
  async scanForEdgeNode(timeout = 2000): Promise<string | null> {
    const candidate = "http://sous-edge.local:4000";
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${candidate}/api/health`, {
        method: "GET",
        signal: controller.signal,
      });
      clearTimeout(id);

      if (response.ok) {
        // eslint-disable-next-line no-console
        console.log(`[Discovery] Found Edge Node at ${candidate}`);
        return candidate;
      }
    } catch (e) {
      // Ignore errors
    }
    return null;
  }

  /**
   * Switches the client to use the discovered local edge node.
   */
  async switchToLocalIfAvailable() {
    const localUrl = await this.scanForEdgeNode();
    if (localUrl) {
      // Re-initialize client with new base URL
      // Note: This requires the client to expose a method to change config
      // For now, we assume the consumer will instantiate a new client
      return localUrl;
    }
    return null;
  }
}
