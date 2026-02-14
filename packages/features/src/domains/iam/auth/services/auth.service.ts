import { getHttpClient } from "@sous/client-sdk";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: "user" | "admin" | "superadmin";
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface AuthResponse {
  access_token: string;
}

export class AuthService {
  static async login(email: string, password: string): Promise<AuthResponse> {
    const http = await getHttpClient();
    return http.post("/auth/login", { email, password });
  }

  static async register(data: any): Promise<User> {
    const http = await getHttpClient();
    return http.post("/auth/register", data);
  }

  static async logout(): Promise<void> {
    const http = await getHttpClient();
    await http.post("/auth/logout");
    localStorage.removeItem("token");
    http.setToken(null);
  }

  static async me(): Promise<User> {
    const http = await getHttpClient();
    return http.get("/auth/me");
  }

  static async changePassword(data: {
    currentPass: string;
    newPass: string;
  }): Promise<{ success: boolean }> {
    const http = await getHttpClient();
    return http.patch("/auth/change-password", data);
  }
}
