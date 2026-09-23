import { apiFetch } from "./client";
import type { PublicUser } from "./users";

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export async function login(input: LoginInput): Promise<PublicUser> {
  return apiFetch<PublicUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  return apiFetch<PublicUser>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logout(): Promise<void> {
  await apiFetch<null>("/auth/logout", { method: "POST" });
}

export async function me(): Promise<PublicUser> {
  return apiFetch<PublicUser>("/auth/me");
}
