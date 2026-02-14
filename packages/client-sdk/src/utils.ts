/**
 * Resolves the API URL based on the environment.
 * Handles WSL-to-Host IP translation for Android emulators.
 *
 * @param baseUrl - The base URL to resolve.
 * @returns The resolved URL.
 */
export const resolveApiUrl = (baseUrl: string): string => {
  if (typeof window === "undefined") return baseUrl;

  const hostIp = (window as any).sous_host_ip;
  const isCapacitor = (window as any).Capacitor;

  // If we're in an emulator/native context and have a host IP
  if ((isCapacitor || hostIp) && hostIp) {
    return baseUrl.replace("localhost", hostIp).replace("127.0.0.1", hostIp);
  }

  return baseUrl;
};
